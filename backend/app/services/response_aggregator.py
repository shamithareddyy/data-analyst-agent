import pandas as pd
from app.models.schemas import (
    AnalysisResponse,
    DatasetOverview,
    ProfilingOutput,
    GeminiInsights,
    ChartData,
    DatasetIntelligence,
)
from app.services.dataset_intelligence import generate_full_overview


def aggregate_response(
    df: pd.DataFrame,
    filename: str,
    file_size_kb: float,
    profiling: ProfilingOutput,
    insights: GeminiInsights,
    visualizations: list[ChartData],
) -> AnalysisResponse:
    sample = df.head(5).fillna("").astype(str)
    sample_rows = sample.to_dict(orient="records")

    overview = DatasetOverview(
        filename=filename,
        file_size_kb=round(file_size_kb, 2),
        row_count=profiling.row_count,
        column_count=profiling.column_count,
        column_names=list(df.columns),
        sample_rows=sample_rows,
    )

    # Build column category lookup from existing profiling
    column_categories = {ct.name: ct.category for ct in profiling.column_types}

    # Generate the full dataset intelligence report
    intelligence = generate_full_overview(df, filename, column_categories)

    return AnalysisResponse(
        dataset_overview=overview,
        profiling=profiling,
        insights=insights,
        visualizations=visualizations,
        dataset_intelligence=intelligence,
    )
