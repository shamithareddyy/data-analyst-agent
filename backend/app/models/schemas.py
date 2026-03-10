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


# ── Dataset Intelligence (Overview Tab) ──────────────────────────

class DatasetClassification(BaseModel):
    dataset_type: str
    confidence: int  # 0-100
    matched_keywords: list[str]


class DatasetProfile(BaseModel):
    total_rows: int
    total_columns: int
    numeric_count: int
    categorical_count: int
    text_count: int
    date_count: int
    boolean_count: int


class ColumnMissing(BaseModel):
    column: str
    missing_pct: float


class DataHealth(BaseModel):
    overall_missing_pct: float
    column_missing: list[ColumnMissing]
    duplicate_rows: int
    duplicate_pct: float
    format_issues: list[str]
    feature_diversity: float  # 0-1 average unique ratio


class ColumnIntelligence(BaseModel):
    name: str
    dtype: str
    unique_count: int
    duplicate_count: int
    missing_pct: float
    distribution_insight: str
    suggested_role: str  # identifier, categorical_feature, numeric_metric, date_dimension, text_field, flag


class KeySignals(BaseModel):
    strengths: list[str]
    risks: list[str]
    observations: list[str]


class MLReadiness(BaseModel):
    score: int  # 0-100
    reasoning: list[str]


class DatasetIntelligence(BaseModel):
    classification: DatasetClassification
    profile: DatasetProfile
    health: DataHealth
    executive_summary: list[str]
    column_intelligence: list[ColumnIntelligence]
    key_signals: KeySignals
    ml_readiness: MLReadiness
    suggested_analyses: list[str]


# ── Top-level response ───────────────────────────────────────────

class AnalysisResponse(BaseModel):
    dataset_overview: DatasetOverview
    profiling: ProfilingOutput
    insights: GeminiInsights
    visualizations: list[ChartData]
    dataset_intelligence: DatasetIntelligence


class ErrorResponse(BaseModel):
    error: str
    detail: Optional[str] = None
