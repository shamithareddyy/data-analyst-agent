import pandas as pd
import numpy as np
from app.models.schemas import (
    ProfilingOutput,
    ColumnTypeInfo,
    MissingInfo,
    OutlierInfo,
    CorrelationPair,
)


def profile_dataframe(df: pd.DataFrame) -> ProfilingOutput:
    column_types = _detect_column_types(df)
    summary_stats = _compute_summary_stats(df)
    missing_analysis = _analyze_missing(df)
    correlation_matrix, strong_correlations = _analyze_correlations(df)
    outlier_report = _detect_outliers(df)
    skewness = _compute_skewness(df)

    return ProfilingOutput(
        row_count=len(df),
        column_count=len(df.columns),
        column_types=column_types,
        summary_stats=summary_stats,
        missing_analysis=missing_analysis,
        correlation_matrix=correlation_matrix,
        strong_correlations=strong_correlations,
        outlier_report=outlier_report,
        skewness=skewness,
    )


def _detect_column_types(df: pd.DataFrame) -> list[ColumnTypeInfo]:
    results = []
    for col in df.columns:
        dtype_str = str(df[col].dtype)
        if pd.api.types.is_bool_dtype(df[col]):
            category = "boolean"
        elif pd.api.types.is_numeric_dtype(df[col]):
            category = "numeric"
        elif pd.api.types.is_datetime64_any_dtype(df[col]):
            category = "datetime"
        else:
            # Try coercing to datetime
            sample = df[col].dropna().head(100)
            try:
                pd.to_datetime(sample, infer_datetime_format=True)
                category = "datetime"
            except Exception:
                unique_ratio = df[col].nunique() / max(len(df), 1)
                category = "categorical" if unique_ratio < 0.5 else "text"
        results.append(ColumnTypeInfo(name=col, dtype=dtype_str, category=category))
    return results


def _compute_summary_stats(df: pd.DataFrame) -> dict:
    numeric_df = df.select_dtypes(include=[np.number])
    if numeric_df.empty:
        return {}
    desc = numeric_df.describe(percentiles=[0.25, 0.5, 0.75]).to_dict()
    # Convert numpy types to Python native
    return _convert_numpy(desc)


def _analyze_missing(df: pd.DataFrame) -> list[MissingInfo]:
    total = len(df)
    results = []
    for col in df.columns:
        null_count = int(df[col].isnull().sum())
        pct = round(null_count / total * 100, 2) if total > 0 else 0.0
        results.append(
            MissingInfo(
                column=col,
                null_count=null_count,
                null_percentage=pct,
                high_risk=pct > 30,
            )
        )
    return results


def _analyze_correlations(
    df: pd.DataFrame,
) -> tuple[dict | None, list[CorrelationPair]]:
    numeric_df = df.select_dtypes(include=[np.number])
    if numeric_df.shape[1] < 2:
        return None, []

    # Limit columns to avoid huge matrices
    if numeric_df.shape[1] > 20:
        numeric_df = numeric_df.iloc[:, :20]

    corr = numeric_df.corr(numeric_only=True)
    corr_dict = _convert_numpy(corr.to_dict())

    strong = []
    cols = list(corr.columns)
    for i in range(len(cols)):
        for j in range(i + 1, len(cols)):
            val = corr.iloc[i, j]
            if pd.notna(val) and abs(val) >= 0.7:
                strong.append(
                    CorrelationPair(col1=cols[i], col2=cols[j], correlation=round(float(val), 4))
                )
    return corr_dict, strong


def _detect_outliers(df: pd.DataFrame) -> list[OutlierInfo]:
    results = []
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    for col in numeric_cols:
        series = df[col].dropna()
        if len(series) < 10:
            continue
        q1 = series.quantile(0.25)
        q3 = series.quantile(0.75)
        iqr = q3 - q1
        lower = q1 - 1.5 * iqr
        upper = q3 + 1.5 * iqr
        outlier_count = int(((series < lower) | (series > upper)).sum())
        if outlier_count > 0:
            results.append(
                OutlierInfo(
                    column=col,
                    outlier_count=outlier_count,
                    lower_bound=round(float(lower), 4),
                    upper_bound=round(float(upper), 4),
                )
            )
    return results


def _compute_skewness(df: pd.DataFrame) -> dict[str, float]:
    numeric_df = df.select_dtypes(include=[np.number])
    if numeric_df.empty:
        return {}
    return {col: round(float(numeric_df[col].skew()), 4) for col in numeric_df.columns}


def _convert_numpy(obj):
    """Recursively convert numpy types to Python native types."""
    if isinstance(obj, dict):
        return {k: _convert_numpy(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [_convert_numpy(v) for v in obj]
    elif isinstance(obj, (np.integer,)):
        return int(obj)
    elif isinstance(obj, (np.floating,)):
        return None if np.isnan(obj) else float(obj)
    elif isinstance(obj, np.ndarray):
        return obj.tolist()
    return obj
