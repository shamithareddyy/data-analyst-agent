import io
import pandas as pd
from fastapi import UploadFile, HTTPException


ALLOWED_TYPES = {
    "text/csv",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
}
ALLOWED_EXTENSIONS = {".csv", ".xlsx", ".xls"}
MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024  # 50 MB


async def ingest_file(file: UploadFile) -> tuple[pd.DataFrame, float]:
    """Validate, parse, and return a DataFrame from uploaded file."""
    # Extension check
    filename = file.filename or ""
    ext = "." + filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{ext}'. Allowed: .csv, .xlsx, .xls",
        )

    content = await file.read()
    file_size_kb = len(content) / 1024

    if len(content) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(status_code=413, detail="File exceeds 50 MB limit.")

    if len(content) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    try:
        if ext == ".csv":
            df = _parse_csv(content)
        else:
            df = _parse_excel(content)
    except Exception as exc:
        raise HTTPException(status_code=422, detail=f"Failed to parse file: {exc}")

    if df.empty:
        raise HTTPException(status_code=400, detail="Dataset is empty after parsing.")

    # Drop fully empty rows/cols
    df.dropna(how="all", inplace=True)
    df.dropna(axis=1, how="all", inplace=True)
    df.reset_index(drop=True, inplace=True)

    return df, file_size_kb


def _parse_csv(content: bytes) -> pd.DataFrame:
    for enc in ("utf-8", "latin-1", "cp1252"):
        try:
            return pd.read_csv(io.BytesIO(content), encoding=enc, low_memory=False)
        except UnicodeDecodeError:
            continue
    raise ValueError("Could not decode CSV with supported encodings.")


def _parse_excel(content: bytes) -> pd.DataFrame:
    return pd.read_excel(io.BytesIO(content))
