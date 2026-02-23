from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse

from app.services.file_ingestion import ingest_file
from app.services.data_profiling import profile_dataframe
from app.services.visualization import generate_visualizations
from app.services.gemini_insights import generate_insights
from app.services.response_aggregator import aggregate_response
from app.models.schemas import AnalysisResponse

router = APIRouter(prefix="/api", tags=["analysis"])


@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_dataset(file: UploadFile = File(...)):
    """
    Upload a CSV or Excel file and receive full automated insights.
    """
    df, file_size_kb = await ingest_file(file)

    profiling = profile_dataframe(df)
    visualizations = generate_visualizations(df, profiling)
    insights = await generate_insights(profiling, file.filename or "dataset")

    response = aggregate_response(
        df=df,
        filename=file.filename or "dataset",
        file_size_kb=file_size_kb,
        profiling=profiling,
        insights=insights,
        visualizations=visualizations,
    )
    return response


@router.get("/health")
async def health_check():
    return {"status": "ok", "service": "DataInsight AI"}
