from fastapi import APIRouter, Response
from fastapi.responses import JSONResponse
import io
import matplotlib.pyplot as plt
import pandas as pd
import seaborn as sns

router = APIRouter()

# Dataset definitions
GAI_VC_FLOW = {
    "title": "Global AI Venture Capital Flow (Quarterly Aggregation)",
    "type": "line",
    "data": [
        { "name": "Q1 2025", "value": 88.2 },
        { "name": "Q2 2025", "value": 101.5 },
        { "name": "Q3 2025", "value": 108.9 },
        { "name": "Q4 2025", "value": 114.1 },
        { "name": "Q1 2026", "value": 300.0 }
    ]
}

CAPITAL_ALLOCATION_2026 = {
    "title": "2026 Capital Allocation by Technical Vertical",
    "type": "pie",
    "data": [
        { "name": "Frontier Compute & Datacenters", "value": 38.5 },
        { "name": "Agent Orchestration Platforms", "value": 24.2 },
        { "name": "Vertical AI Applications", "value": 19.8 },
        { "name": "AI Security & Compliance", "value": 10.5 },
        { "name": "Hardware/Edge Deployment", "value": 7.0 }
    ]
}

REGIONAL_PERFORMANCE = {
    "title": "Regional Equity Performance vs Revenue Scaling",
    "type": "bar",
    "data": [
        { "name": "North America (Agent Focus)", "value": 28.4 },
        { "name": "China APAC (Revenue Scaled)", "value": 35.0 },
        { "name": "Europe (Regulation/Compliance)", "value": 12.7 },
        { "name": "Emerging Markets (Compute Import)", "value": 18.9 }
    ]
}

@router.get("/")
async def get_all_analytics():
    """Return all datasets in JSON format."""
    return {
        "vc_flow": GAI_VC_FLOW,
        "allocation": CAPITAL_ALLOCATION_2026,
        "performance": REGIONAL_PERFORMANCE
    }

@router.get("/render/{chart_id}")
async def render_chart(chart_id: str):
    """
    Render a chart using Matplotlib and return as a PNG.
    Supported IDs: 'vc_flow', 'allocation', 'performance'
    """
    plt.style.use('dark_background')
    fig, ax = plt.subplots(figsize=(10, 6))
    
    if chart_id == "vc_flow":
        df = pd.DataFrame(GAI_VC_FLOW["data"])
        ax.plot(df["name"], df["value"], marker='o', linewidth=4, color='#00ffcc')
        ax.set_title(GAI_VC_FLOW["title"], fontname='monospace', fontweight='bold')
        ax.fill_between(df["name"], df["value"], alpha=0.2, color='#00ffcc')
        
    elif chart_id == "allocation":
        df = pd.DataFrame(CAPITAL_ALLOCATION_2026["data"])
        ax.pie(df["value"], labels=df["name"], autopct='%1.1f%%', 
               colors=sns.color_palette("rocket", len(df)), 
               wedgeprops={'edgecolor': 'white', 'linewidth': 1})
        ax.set_title(CAPITAL_ALLOCATION_2026["title"], fontname='monospace', fontweight='bold')
        
    elif chart_id == "performance":
        df = pd.DataFrame(REGIONAL_PERFORMANCE["data"])
        colors = ['#ff66ff', '#66ffff', '#ffff66', '#66ff66']
        ax.bar(df["name"], df["value"], color=colors, edgecolor='white', linewidth=2)
        ax.set_title(REGIONAL_PERFORMANCE["title"], fontname='monospace', fontweight='bold')
        plt.xticks(rotation=15)
    
    else:
        return JSONResponse({"error": "Invalid chart ID"}, status_code=404)

    # Save to buffer
    buf = io.BytesIO()
    plt.savefig(buf, format='png', bbox_inches='tight', dpi=100)
    plt.close(fig)
    buf.seek(0)
    
    return Response(content=buf.getvalue(), media_type="image/png")
