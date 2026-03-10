"""
Dataset Intelligence Service
─────────────────────────────
Pure Python + pandas logic (no LLM calls).  Returns a structured
DatasetIntelligence object that the Overview tab renders directly.
"""

from __future__ import annotations

import math
import pandas as pd
import numpy as np
from app.models.schemas import (
    DatasetClassification,
    DatasetProfile,
    DataHealth,
    ColumnMissing,
    ColumnIntelligence,
    KeySignals,
    MLReadiness,
    DatasetIntelligence,
)


# ── 1. Dataset Classification ────────────────────────────────────

_DOMAIN_KEYWORDS: dict[str, list[str]] = {
    "HR / People Analytics": [
        "employee", "salary", "department", "hire", "attrition", "turnover",
        "designation", "performance", "tenure", "age", "gender", "position",
        "leave", "absence", "payroll", "bonus", "overtime", "promotion",
    ],
    "Sales & Revenue": [
        "sales", "revenue", "product", "customer", "order", "quantity",
        "discount", "profit", "price", "sku", "store", "channel", "invoice",
        "transaction", "deal", "pipeline", "quota", "commission",
    ],
    "Finance & Accounting": [
        "amount", "balance", "debit", "credit", "account", "ledger",
        "expense", "income", "tax", "invoice", "payment", "budget",
        "forecast", "asset", "liability", "equity", "interest", "loan",
    ],
    "Operations & Supply Chain": [
        "inventory", "warehouse", "shipment", "delivery", "supplier",
        "vendor", "logistics", "lead_time", "stock", "reorder",
        "manufacturing", "production", "defect", "yield", "batch",
    ],
    "Marketing & Campaign": [
        "campaign", "click", "impression", "conversion", "ctr", "cpc",
        "bounce", "session", "pageview", "subscriber", "engagement",
        "channel", "ad", "roi", "reach", "segment", "email", "open_rate",
    ],
    "Healthcare": [
        "patient", "diagnosis", "treatment", "hospital", "doctor",
        "medication", "symptom", "bmi", "blood", "cholesterol", "glucose",
        "heart_rate", "insurance", "claim", "prescription",
    ],
    "Education": [
        "student", "grade", "score", "course", "enrollment", "gpa",
        "attendance", "teacher", "subject", "exam", "semester", "class",
    ],
    "IT / Infrastructure": [
        "server", "cpu", "memory", "disk", "latency", "uptime",
        "incident", "ticket", "response_time", "error", "log",
        "deployment", "request", "api", "endpoint", "status_code",
    ],
    "E-Commerce": [
        "cart", "checkout", "sku", "wishlist", "review", "rating",
        "return", "refund", "shipping", "category", "brand", "user_id",
    ],
    "Real Estate": [
        "property", "sqft", "bedroom", "bathroom", "listing", "price",
        "rent", "location", "zip", "latitude", "longitude", "neighborhood",
    ],
}


def classify_dataset(df: pd.DataFrame, filename: str) -> DatasetClassification:
    """Match column names against domain keyword dictionaries."""
    cols_lower = [c.lower().replace(" ", "_") for c in df.columns]
    fname_lower = filename.lower()

    scores: dict[str, list[str]] = {}
    for domain, keywords in _DOMAIN_KEYWORDS.items():
        matched = []
        for kw in keywords:
            # Check column names
            for col in cols_lower:
                if kw in col:
                    matched.append(kw)
                    break
            # Check filename
            if kw in fname_lower and kw not in matched:
                matched.append(kw)
        if matched:
            scores[domain] = matched

    if not scores:
        return DatasetClassification(
            dataset_type="General / Unclassified",
            confidence=20,
            matched_keywords=[],
        )

    best = max(scores, key=lambda d: len(scores[d]))
    matched_kws = scores[best]
    confidence = min(95, 30 + len(matched_kws) * 12)
    return DatasetClassification(
        dataset_type=best,
        confidence=confidence,
        matched_keywords=matched_kws[:10],
    )


# ── 2. Dataset Profile ───────────────────────────────────────────

def build_dataset_profile(df: pd.DataFrame, column_categories: dict[str, str]) -> DatasetProfile:
    counts = {"numeric": 0, "categorical": 0, "text": 0, "datetime": 0, "boolean": 0}
    for cat in column_categories.values():
        if cat in counts:
            counts[cat] += 1
    return DatasetProfile(
        total_rows=len(df),
        total_columns=len(df.columns),
        numeric_count=counts["numeric"],
        categorical_count=counts["categorical"],
        text_count=counts["text"],
        date_count=counts["datetime"],
        boolean_count=counts["boolean"],
    )


# ── 3. Data Health ────────────────────────────────────────────────

def compute_data_health(df: pd.DataFrame) -> DataHealth:
    total_cells = df.shape[0] * df.shape[1]
    total_missing = int(df.isnull().sum().sum())
    overall_pct = round(total_missing / total_cells * 100, 2) if total_cells > 0 else 0.0

    col_missing = []
    for col in df.columns:
        pct = round(df[col].isnull().sum() / len(df) * 100, 2) if len(df) > 0 else 0.0
        if pct > 0:
            col_missing.append(ColumnMissing(column=col, missing_pct=pct))
    col_missing.sort(key=lambda x: x.missing_pct, reverse=True)

    dup_count = int(df.duplicated().sum())
    dup_pct = round(dup_count / len(df) * 100, 2) if len(df) > 0 else 0.0

    # Format consistency — check for columns where inferred dtype is object
    # but values look numeric
    format_issues: list[str] = []
    for col in df.select_dtypes(include=["object"]).columns:
        sample = df[col].dropna().head(200)
        if len(sample) == 0:
            continue
        numeric_like = sample.apply(lambda v: _is_numeric_str(str(v))).sum()
        ratio = numeric_like / len(sample)
        if 0.3 < ratio < 0.95:
            format_issues.append(f"{col}: mixed types ({int(ratio*100)}% numeric-like)")

    # Feature diversity — average unique ratio across all columns
    unique_ratios = []
    for col in df.columns:
        n = df[col].nunique()
        r = n / max(len(df), 1)
        unique_ratios.append(min(r, 1.0))
    diversity = round(sum(unique_ratios) / max(len(unique_ratios), 1), 3)

    return DataHealth(
        overall_missing_pct=overall_pct,
        column_missing=col_missing[:20],
        duplicate_rows=dup_count,
        duplicate_pct=dup_pct,
        format_issues=format_issues[:10],
        feature_diversity=diversity,
    )


def _is_numeric_str(s: str) -> bool:
    s = s.strip().replace(",", "")
    if not s:
        return False
    try:
        float(s)
        return True
    except ValueError:
        return False


# ── 4. Executive Summary ─────────────────────────────────────────

def generate_executive_summary(
    profile: DatasetProfile,
    health: DataHealth,
    classification: DatasetClassification,
) -> list[str]:
    lines: list[str] = []

    lines.append(
        f"This is a {classification.dataset_type} dataset with "
        f"{profile.total_rows:,} records across {profile.total_columns} features."
    )

    type_parts = []
    if profile.numeric_count:
        type_parts.append(f"{profile.numeric_count} numeric")
    if profile.categorical_count:
        type_parts.append(f"{profile.categorical_count} categorical")
    if profile.date_count:
        type_parts.append(f"{profile.date_count} date")
    if profile.text_count:
        type_parts.append(f"{profile.text_count} text")
    if type_parts:
        lines.append(f"Column composition: {', '.join(type_parts)}.")

    if health.overall_missing_pct < 1:
        lines.append("Data completeness is excellent — less than 1% missing values overall.")
    elif health.overall_missing_pct < 10:
        lines.append(f"Data completeness is good with {health.overall_missing_pct}% missing values overall.")
    else:
        lines.append(f"⚠ Notable data gaps: {health.overall_missing_pct}% missing values overall — imputation recommended.")

    if health.duplicate_rows > 0:
        lines.append(f"{health.duplicate_rows:,} duplicate rows detected ({health.duplicate_pct}%).")

    return lines


# ── 5. Column Intelligence ───────────────────────────────────────

def build_column_intelligence(df: pd.DataFrame) -> list[ColumnIntelligence]:
    result: list[ColumnIntelligence] = []
    for col in df.columns:
        series = df[col]
        dtype_str = str(series.dtype)
        n_unique = int(series.nunique())
        n_total = len(series)
        n_dup = n_total - n_unique
        missing_pct = round(series.isnull().sum() / max(n_total, 1) * 100, 1)

        # Distribution insight
        dist = _distribution_insight(series, n_unique, n_total)

        # Suggested role
        role = _suggest_role(series, col, n_unique, n_total)

        result.append(ColumnIntelligence(
            name=col,
            dtype=dtype_str,
            unique_count=n_unique,
            duplicate_count=n_dup,
            missing_pct=missing_pct,
            distribution_insight=dist,
            suggested_role=role,
        ))
    return result


def _distribution_insight(series: pd.Series, n_unique: int, n_total: int) -> str:
    if n_total == 0:
        return "Empty column"

    if pd.api.types.is_numeric_dtype(series):
        clean = series.dropna()
        if len(clean) == 0:
            return "All values missing"
        skew = clean.skew()
        if abs(skew) > 1.5:
            direction = "right" if skew > 0 else "left"
            return f"Highly skewed {direction} (skew={skew:.2f})"
        elif abs(skew) > 0.5:
            direction = "right" if skew > 0 else "left"
            return f"Moderately skewed {direction} (skew={skew:.2f})"
        else:
            return f"Approximately normal (skew={skew:.2f})"

    # Categorical / text
    ratio = n_unique / n_total
    if ratio > 0.95:
        return f"Nearly all unique ({n_unique:,} distinct values)"
    elif ratio < 0.01:
        top = series.value_counts().head(3)
        top_str = ", ".join(f"{v}" for v in top.index)
        return f"Low cardinality — top values: {top_str}"
    else:
        top = series.value_counts().head(1)
        if not top.empty:
            top_val = top.index[0]
            top_pct = round(top.values[0] / n_total * 100, 1)
            return f"Most common: '{top_val}' ({top_pct}%)"
        return f"{n_unique:,} distinct values"


def _suggest_role(series: pd.Series, col_name: str, n_unique: int, n_total: int) -> str:
    name = col_name.lower().replace(" ", "_")

    # Date detection
    if pd.api.types.is_datetime64_any_dtype(series):
        return "date_dimension"
    for kw in ["date", "time", "timestamp", "created", "updated", "year", "month"]:
        if kw in name:
            return "date_dimension"

    # Boolean / flag
    if pd.api.types.is_bool_dtype(series) or n_unique <= 2:
        return "flag"

    # Identifier — very high cardinality + likely ID-like name
    ratio = n_unique / max(n_total, 1)
    for kw in ["id", "key", "code", "uuid", "index", "number", "no"]:
        if kw in name.split("_"):
            if ratio > 0.8:
                return "identifier"

    # Numeric metric
    if pd.api.types.is_numeric_dtype(series):
        if ratio > 0.5:
            return "numeric_metric"
        else:
            return "numeric_metric"

    # Categorical feature
    if ratio < 0.5:
        return "categorical_feature"

    return "text_field"


# ── 6. Key Signals ───────────────────────────────────────────────

def extract_key_signals(
    profile: DatasetProfile,
    health: DataHealth,
    columns: list[ColumnIntelligence],
) -> KeySignals:
    strengths: list[str] = []
    risks: list[str] = []
    observations: list[str] = []

    # Strengths
    if health.overall_missing_pct < 2:
        strengths.append("Very low missing data — dataset is highly complete")
    if health.duplicate_rows == 0:
        strengths.append("No duplicate rows detected")
    if profile.numeric_count >= 3:
        strengths.append(f"{profile.numeric_count} numeric columns available for quantitative analysis")
    if profile.total_rows >= 1000:
        strengths.append(f"Healthy sample size ({profile.total_rows:,} rows) for reliable statistics")
    if not health.format_issues:
        strengths.append("Consistent data formatting across columns")
    if profile.date_count > 0:
        strengths.append("Date columns present — time-series analysis possible")

    # Risks
    if health.overall_missing_pct > 20:
        risks.append(f"High missing data ({health.overall_missing_pct}%) — imputation or removal needed")
    elif health.overall_missing_pct > 5:
        risks.append(f"Moderate missing data ({health.overall_missing_pct}%) — review before modeling")
    if health.duplicate_pct > 5:
        risks.append(f"{health.duplicate_rows:,} duplicate rows ({health.duplicate_pct}%) — deduplication recommended")
    if health.format_issues:
        risks.append(f"{len(health.format_issues)} column(s) with mixed data types detected")
    high_cardinality = [c for c in columns if c.suggested_role == "text_field"]
    if len(high_cardinality) > 3:
        risks.append(f"{len(high_cardinality)} high-cardinality text columns — may need encoding")
    if profile.total_rows < 100:
        risks.append("Small dataset — statistical significance may be limited")

    # Observations
    identifiers = [c.name for c in columns if c.suggested_role == "identifier"]
    if identifiers:
        observations.append(f"Likely identifiers: {', '.join(identifiers[:3])}")
    flags = [c.name for c in columns if c.suggested_role == "flag"]
    if flags:
        observations.append(f"Binary/flag columns: {', '.join(flags[:5])}")
    skewed = [c.name for c in columns if "Highly skewed" in c.distribution_insight]
    if skewed:
        observations.append(f"Highly skewed distributions in: {', '.join(skewed[:3])}")
    if health.feature_diversity < 0.1:
        observations.append("Low feature diversity — many columns have repeated values")
    elif health.feature_diversity > 0.8:
        observations.append("High feature diversity — most columns have unique-like values")

    return KeySignals(
        strengths=strengths or ["No standout strengths identified"],
        risks=risks or ["No critical risks detected"],
        observations=observations or ["Dataset appears standard"],
    )


# ── 7. ML Readiness ──────────────────────────────────────────────

def compute_ml_readiness(df: pd.DataFrame, profile: DatasetProfile, health: DataHealth) -> MLReadiness:
    score = 0
    reasoning: list[str] = []

    # Row count (max 25 pts)
    if profile.total_rows >= 5000:
        score += 25
        reasoning.append("✓ Large sample size (5,000+ rows)")
    elif profile.total_rows >= 1000:
        score += 18
        reasoning.append("✓ Adequate sample size (1,000+ rows)")
    elif profile.total_rows >= 100:
        score += 10
        reasoning.append("△ Small sample size — may limit model generalization")
    else:
        score += 3
        reasoning.append("✗ Very small dataset — insufficient for most ML tasks")

    # Numeric columns (max 25 pts)
    if profile.numeric_count >= 5:
        score += 25
        reasoning.append(f"✓ {profile.numeric_count} numeric features available")
    elif profile.numeric_count >= 2:
        score += 15
        reasoning.append(f"△ Only {profile.numeric_count} numeric columns")
    elif profile.numeric_count >= 1:
        score += 8
        reasoning.append(f"✗ Just {profile.numeric_count} numeric column — limited feature space")
    else:
        reasoning.append("✗ No numeric columns — feature engineering needed")

    # Missing data (max 20 pts)
    if health.overall_missing_pct < 1:
        score += 20
        reasoning.append("✓ Minimal missing data (<1%)")
    elif health.overall_missing_pct < 10:
        score += 14
        reasoning.append(f"△ Moderate missing data ({health.overall_missing_pct}%)")
    elif health.overall_missing_pct < 30:
        score += 7
        reasoning.append(f"✗ Significant missing data ({health.overall_missing_pct}%)")
    else:
        reasoning.append(f"✗ Heavy missing data ({health.overall_missing_pct}%)")

    # Target-like column (max 15 pts) — heuristic: look for binary or low-cardinality cols
    target_candidates = [
        col for col in df.columns
        if df[col].nunique() <= 10 and df[col].nunique() >= 2
        and not pd.api.types.is_datetime64_any_dtype(df[col])
    ]
    if target_candidates:
        score += 15
        reasoning.append(f"✓ Potential target columns: {', '.join(target_candidates[:3])}")
    else:
        reasoning.append("△ No obvious target column detected — may need definition")

    # Date columns (max 10 pts)
    if profile.date_count > 0:
        score += 10
        reasoning.append(f"✓ {profile.date_count} date column(s) — temporal features possible")
    else:
        score += 3
        reasoning.append("△ No date columns — temporal analysis not possible")

    # Duplicates penalty (max -5 pts)
    if health.duplicate_pct > 10:
        score = max(0, score - 5)
        reasoning.append(f"✗ High duplication ({health.duplicate_pct}%) — data leakage risk")

    score = min(score, 100)
    return MLReadiness(score=score, reasoning=reasoning)


# ── 8. Suggested Next Analyses ────────────────────────────────────

def suggest_next_analyses(
    classification: DatasetClassification,
    profile: DatasetProfile,
    health: DataHealth,
) -> list[str]:
    suggestions: list[str] = []

    if profile.numeric_count >= 2:
        suggestions.append("Run correlation analysis to find related numeric features")
    if profile.numeric_count >= 1:
        suggestions.append("Examine distribution and outlier patterns in numeric columns")
    if profile.categorical_count >= 1:
        suggestions.append("Analyze categorical feature frequencies and imbalances")
    if profile.date_count >= 1:
        suggestions.append("Explore time-series trends and seasonal patterns")
    if health.overall_missing_pct > 2:
        suggestions.append("Investigate missing data patterns and evaluate imputation strategies")
    if health.duplicate_rows > 0:
        suggestions.append("Review and deduplicate the dataset before further analysis")
    if profile.total_rows >= 500 and profile.numeric_count >= 3:
        suggestions.append("Consider building a predictive model with the available features")

    # Domain-specific
    domain = classification.dataset_type.lower()
    if "hr" in domain or "people" in domain:
        suggestions.append("Analyze attrition drivers and employee tenure patterns")
    elif "sales" in domain or "revenue" in domain:
        suggestions.append("Break down revenue by product/region and identify top performers")
    elif "finance" in domain:
        suggestions.append("Examine expense trends and budget variance analysis")
    elif "marketing" in domain or "campaign" in domain:
        suggestions.append("Evaluate campaign ROI and conversion funnel drop-offs")
    elif "healthcare" in domain:
        suggestions.append("Analyze patient outcomes by diagnosis and treatment groups")

    return suggestions[:8]


# ── Orchestrator ──────────────────────────────────────────────────

def generate_full_overview(
    df: pd.DataFrame,
    filename: str,
    column_categories: dict[str, str],
) -> DatasetIntelligence:
    """Run all 8 profiler modules and return a single DatasetIntelligence object."""

    classification = classify_dataset(df, filename)
    profile = build_dataset_profile(df, column_categories)
    health = compute_data_health(df)
    exec_summary = generate_executive_summary(profile, health, classification)
    col_intel = build_column_intelligence(df)
    signals = extract_key_signals(profile, health, col_intel)
    ml_ready = compute_ml_readiness(df, profile, health)
    next_analyses = suggest_next_analyses(classification, profile, health)

    return DatasetIntelligence(
        classification=classification,
        profile=profile,
        health=health,
        executive_summary=exec_summary,
        column_intelligence=col_intel,
        key_signals=signals,
        ml_readiness=ml_ready,
        suggested_analyses=next_analyses,
    )
