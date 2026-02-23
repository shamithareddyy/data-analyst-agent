import json
import pandas as pd
import numpy as np
import plotly.graph_objects as go
import plotly.express as px
from app.models.schemas import ChartData, ProfilingOutput


PLOTLY_TEMPLATE = "plotly_dark"


def generate_visualizations(df: pd.DataFrame, profiling: ProfilingOutput) -> list[ChartData]:
    charts: list[ChartData] = []
    col_map = {c.name: c.category for c in profiling.column_types}

    numeric_cols = [n for n, t in col_map.items() if t == "numeric"]
    categorical_cols = [n for n, t in col_map.items() if t == "categorical"]
    datetime_cols = [n for n, t in col_map.items() if t == "datetime"]

    # --- Histograms for numeric cols (up to 6) ---
    for col in numeric_cols[:6]:
        series = df[col].dropna()
        fig = px.histogram(
            series,
            nbins=40,
            title=f"Distribution of {col}",
            template=PLOTLY_TEMPLATE,
            color_discrete_sequence=["#6366f1"],
        )
        fig.update_layout(**_base_layout(f"Distribution of {col}"))
        charts.append(_fig_to_chart(fig, "histogram", f"Distribution: {col}", col))

    # --- Bar charts for categorical cols (top 10 values, up to 4) ---
    for col in categorical_cols[:4]:
        counts = df[col].value_counts().head(15)
        fig = px.bar(
            x=counts.index.astype(str),
            y=counts.values,
            title=f"Top Values: {col}",
            template=PLOTLY_TEMPLATE,
            color_discrete_sequence=["#8b5cf6"],
        )
        fig.update_layout(**_base_layout(f"Top Values: {col}"), xaxis_tickangle=-35)
        charts.append(_fig_to_chart(fig, "bar", f"Top Values: {col}", col))

    # --- Line charts for datetime cols (up to 2) ---
    for dt_col in datetime_cols[:2]:
        for num_col in numeric_cols[:1]:
            try:
                temp = df[[dt_col, num_col]].dropna().copy()
                temp[dt_col] = pd.to_datetime(temp[dt_col])
                temp = temp.sort_values(dt_col)
                fig = px.line(
                    temp,
                    x=dt_col,
                    y=num_col,
                    title=f"{num_col} over Time",
                    template=PLOTLY_TEMPLATE,
                    color_discrete_sequence=["#06b6d4"],
                )
                fig.update_layout(**_base_layout(f"{num_col} over Time"))
                charts.append(_fig_to_chart(fig, "line", f"{num_col} over Time", num_col))
            except Exception:
                pass

    # --- Correlation Heatmap ---
    if profiling.correlation_matrix and len(numeric_cols) >= 2:
        cols = [c for c in numeric_cols[:15]]
        sub = df[cols].dropna()
        corr = sub.corr(numeric_only=True)
        fig = go.Figure(
            data=go.Heatmap(
                z=corr.values.tolist(),
                x=list(corr.columns),
                y=list(corr.index),
                colorscale="Viridis",
                zmid=0,
                text=[[f"{v:.2f}" for v in row] for row in corr.values],
                texttemplate="%{text}",
                showscale=True,
            )
        )
        fig.update_layout(**_base_layout("Correlation Matrix"), height=500)
        charts.append(_fig_to_chart(fig, "heatmap", "Correlation Matrix", None))

    # --- Scatter plot for strongest correlation ---
    if profiling.strong_correlations:
        pair = profiling.strong_correlations[0]
        try:
            fig = px.scatter(
                df,
                x=pair.col1,
                y=pair.col2,
                title=f"Scatter: {pair.col1} vs {pair.col2} (r={pair.correlation})",
                template=PLOTLY_TEMPLATE,
                color_discrete_sequence=["#f59e0b"],
            )
            fig.update_layout(**_base_layout(f"{pair.col1} vs {pair.col2}"))
            charts.append(_fig_to_chart(fig, "scatter", f"{pair.col1} vs {pair.col2}", None))
        except Exception:
            pass

    # --- Missing Values Bar ---
    missing_data = [(m.column, m.null_percentage) for m in profiling.missing_analysis if m.null_percentage > 0]
    if missing_data:
        m_cols, m_pcts = zip(*sorted(missing_data, key=lambda x: -x[1]))
        colors = ["#ef4444" if p > 30 else "#f59e0b" if p > 10 else "#6366f1" for p in m_pcts]
        fig = go.Figure(
            go.Bar(
                x=list(m_cols),
                y=list(m_pcts),
                marker_color=colors,
                text=[f"{p:.1f}%" for p in m_pcts],
                textposition="auto",
            )
        )
        fig.update_layout(**_base_layout("Missing Values (%)"), yaxis_title="Missing %")
        charts.append(_fig_to_chart(fig, "bar", "Missing Values Analysis", None))

    return charts


def _base_layout(title: str) -> dict:
    return {
        "title": {"text": title, "font": {"size": 16, "color": "#e2e8f0"}},
        "paper_bgcolor": "rgba(15,23,42,0)",
        "plot_bgcolor": "rgba(15,23,42,0)",
        "font": {"color": "#94a3b8"},
        "margin": {"l": 50, "r": 30, "t": 60, "b": 50},
        "height": 380,
        "xaxis": {"gridcolor": "rgba(148,163,184,0.1)", "linecolor": "rgba(148,163,184,0.2)"},
        "yaxis": {"gridcolor": "rgba(148,163,184,0.1)", "linecolor": "rgba(148,163,184,0.2)"},
    }


def _fig_to_chart(fig: go.Figure, chart_type: str, title: str, column: str | None) -> ChartData:
    # Use to_json() + json.loads() to guarantee all numpy types are converted
    fig_dict = json.loads(fig.to_json())
    return ChartData(
        chart_type=chart_type,
        title=title,
        column=column,
        data={"data": fig_dict.get("data", [])},
        layout=fig_dict.get("layout", {}),
    )
