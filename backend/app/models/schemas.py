from pydantic import BaseModel
from typing import Any, Optional


class ColumnTypeInfo(BaseModel):
    name: str
    dtype: str
    category: str  # numeric, categorical, datetime, boolean, text


class MissingInfo(BaseModel):
    column: str
    null_count: int
    null_percentage: float
    high_risk: bool


class OutlierInfo(BaseModel):
    column: str
    outlier_count: int
    lower_bound: float
    upper_bound: float


class CorrelationPair(BaseModel):
    col1: str
    col2: str
    correlation: float


class ProfilingOutput(BaseModel):
    row_count: int
    column_count: int
    column_types: list[ColumnTypeInfo]
    summary_stats: dict[str, Any]
    missing_analysis: list[MissingInfo]
    correlation_matrix: Optional[dict[str, Any]] = None
    strong_correlations: list[CorrelationPair] = []
    outlier_report: list[OutlierInfo] = []
    skewness: dict[str, float] = {}


class ChartData(BaseModel):
    chart_type: str  # histogram, bar, line, heatmap, scatter
    title: str
    column: Optional[str] = None
    data: dict[str, Any]
    layout: dict[str, Any]


class GeminiInsights(BaseModel):
    executive_summary: str
    key_trends: list[str]
    risk_factors: list[str]
    anomalies: list[str]
    recommendations: list[str]
    data_quality_score: Optional[int] = None


class DatasetOverview(BaseModel):
    filename: str
    file_size_kb: float
    row_count: int
    column_count: int
    column_names: list[str]
    sample_rows: list[dict[str, Any]]


class AnalysisResponse(BaseModel):
    dataset_overview: DatasetOverview
    profiling: ProfilingOutput
    insights: GeminiInsights
    visualizations: list[ChartData]


class ErrorResponse(BaseModel):
    error: str
    detail: Optional[str] = None
