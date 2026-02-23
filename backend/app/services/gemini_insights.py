import json
import re
import asyncio
import google.generativeai as genai
from app.models.schemas import GeminiInsights, ProfilingOutput
from app.core.config import get_settings


def _build_prompt(profiling: ProfilingOutput, filename: str) -> str:
    col_types_summary = ", ".join(
        f"{c.name} ({c.category})" for c in profiling.column_types[:20]
    )
    missing_high_risk = [m for m in profiling.missing_analysis if m.high_risk]
    outliers_summary = [
        f"{o.column}: {o.outlier_count} outliers" for o in profiling.outlier_report[:10]
    ]
    strong_corr = [
        f"{c.col1} ↔ {c.col2} (r={c.correlation})" for c in profiling.strong_correlations[:5]
    ]

    stats_preview = {}
    for col, stats in list(profiling.summary_stats.items())[:8]:
        stats_preview[col] = {
            k: v for k, v in stats.items() if k in ("mean", "std", "min", "max", "50%")
        }

    prompt = f"""You are a senior data analyst and business intelligence expert. Analyze the dataset below and generate structured, executive-level insights.

DATASET: {filename}
SHAPE: {profiling.row_count} rows × {profiling.column_count} columns

COLUMN TYPES:
{col_types_summary}

STATISTICAL SUMMARY (key columns):
{json.dumps(stats_preview, indent=2)}

MISSING VALUES (high-risk columns >30% missing):
{json.dumps([{"column": m.column, "missing_pct": m.null_percentage} for m in missing_high_risk], indent=2) if missing_high_risk else "None identified."}

TOTAL MISSING BY COLUMN:
{json.dumps([{"column": m.column, "pct": m.null_percentage} for m in profiling.missing_analysis if m.null_percentage > 0][:10], indent=2)}

STRONG CORRELATIONS (|r| ≥ 0.7):
{json.dumps(strong_corr, indent=2) if strong_corr else "No strong correlations found."}

OUTLIERS DETECTED:
{json.dumps(outliers_summary, indent=2) if outliers_summary else "No significant outliers."}

SKEWNESS:
{json.dumps({k: v for k, v in list(profiling.skewness.items())[:10]}, indent=2)}

Respond ONLY with a valid JSON object matching this exact schema:
{{
  "executive_summary": "<2-3 sentence high-level summary of the dataset and its business value>",
  "key_trends": ["<trend 1>", "<trend 2>", "<trend 3>", ...],
  "risk_factors": ["<risk 1>", "<risk 2>", ...],
  "anomalies": ["<anomaly 1>", ...],
  "recommendations": ["<recommendation 1>", "<recommendation 2>", ...],
  "data_quality_score": <integer 0-100>
}}

Be specific, data-driven, and executive-ready. No markdown, no code blocks, pure JSON only."""

    return prompt


async def generate_insights(profiling: ProfilingOutput, filename: str) -> GeminiInsights:
    settings = get_settings()

    if not settings.gemini_api_key:
        return _fallback_insights(profiling)

    try:
        genai.configure(api_key=settings.gemini_api_key)
        model = genai.GenerativeModel("gemini-1.5-flash")
        prompt = _build_prompt(profiling, filename)

        loop = asyncio.get_event_loop()
        response = await loop.run_in_executor(
            None, lambda: model.generate_content(prompt)
        )

        raw = response.text.strip()
        # Strip markdown code fences if present
        raw = re.sub(r"^```(?:json)?\s*", "", raw)
        raw = re.sub(r"\s*```$", "", raw)

        data = json.loads(raw)
        return GeminiInsights(
            executive_summary=data.get("executive_summary", ""),
            key_trends=data.get("key_trends", []),
            risk_factors=data.get("risk_factors", []),
            anomalies=data.get("anomalies", []),
            recommendations=data.get("recommendations", []),
            data_quality_score=data.get("data_quality_score"),
        )
    except json.JSONDecodeError:
        return _parse_partial_insights(response.text if "response" in dir() else "")
    except Exception:
        return _fallback_insights(profiling)


def _parse_partial_insights(raw: str) -> GeminiInsights:
    """Best-effort parse if JSON is malformed."""
    return GeminiInsights(
        executive_summary="AI analysis generated partial results. Structured JSON parsing failed.",
        key_trends=["Review generated insights manually."],
        risk_factors=[],
        anomalies=[],
        recommendations=["Re-run analysis or check Gemini API key configuration."],
    )


def _fallback_insights(profiling: ProfilingOutput) -> GeminiInsights:
    """Rule-based fallback when Gemini API is unavailable."""
    issues = []
    recommendations = []

    high_risk = [m for m in profiling.missing_analysis if m.high_risk]
    if high_risk:
        cols = ", ".join(m.column for m in high_risk)
        issues.append(f"High missing data in: {cols}")
        recommendations.append(f"Impute or drop columns with >30% missing values: {cols}")

    if profiling.outlier_report:
        outlier_cols = ", ".join(o.column for o in profiling.outlier_report[:3])
        issues.append(f"Outliers detected in {len(profiling.outlier_report)} columns: {outlier_cols}")
        recommendations.append("Investigate and treat outliers using IQR or Z-score methods.")

    if profiling.strong_correlations:
        pairs = ", ".join(f"{c.col1}↔{c.col2}" for c in profiling.strong_correlations[:3])
        trends = [f"Strong correlation detected: {pairs}"]
    else:
        trends = ["No strong correlations detected. Variables appear largely independent."]

    highly_skewed = [c for c, s in profiling.skewness.items() if abs(s) > 1]
    if highly_skewed:
        recommendations.append(f"Apply log or Box-Cox transformation on highly skewed columns: {', '.join(highly_skewed[:3])}")

    total_missing_pct = sum(m.null_percentage for m in profiling.missing_analysis) / max(len(profiling.missing_analysis), 1)
    quality_score = max(0, min(100, int(100 - total_missing_pct - len(profiling.outlier_report) * 2)))

    return GeminiInsights(
        executive_summary=(
            f"Dataset contains {profiling.row_count:,} rows and {profiling.column_count} columns. "
            f"Overall data quality score: {quality_score}/100. "
            f"{'No critical data quality issues detected.' if not issues else 'Attention required on data quality.'}"
        ),
        key_trends=trends,
        risk_factors=issues if issues else ["No critical risks detected."],
        anomalies=[f"{o.column}: {o.outlier_count} outliers (IQR method)" for o in profiling.outlier_report[:5]],
        recommendations=recommendations if recommendations else ["Data appears healthy. Proceed with modeling."],
        data_quality_score=quality_score,
    )
