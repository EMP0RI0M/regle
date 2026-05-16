# ANALYTICS_UPLINK: GLOBAL_AI_VENTURE_FLOW

### SYSTEM_STATUS: [ONLINE]
### SOURCE: VENTURE_CAPITAL_QUARTERLY_AGGREGATION

```json-chart
{
  "title": "Global AI Venture Capital Flow (Quarterly Aggregation)",
  "type": "line",
  "data": [
    { "label": "Q1 2025", "value": 88.2 },
    { "label": "Q2 2025", "value": 101.5 },
    { "label": "Q3 2025", "value": 108.9 },
    { "label": "Q4 2025", "value": 114.1 },
    { "label": "Q1 2026", "value": 300.0 }
  ]
}
```

---

## 2026_CAPITAL_ALLOCATION_BY_TECHNICAL_VERTICAL

```json-chart
{
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
```

---

## REGIONAL_EQUITY_PERFORMANCE_VS_REVENUE_SCALING

```json-chart
{
  "title": "Regional Equity Performance vs Revenue Scaling",
  "type": "bar",
  "data": [
    { "label": "North America", "value": 28.4 },
    { "label": "China APAC", "value": 35.0 },
    { "label": "Europe", "value": 12.7 },
    { "label": "Emerging Markets", "value": 18.9 }
  ]
}
```

---

### MATPLOT_RENDERING_HOOKS
To retrieve static Matplotlib renderings from the backend:
- LINE: `GET http://localhost:8000/api/v1/analytics/render/vc_flow`
- PIE: `GET http://localhost:8000/api/v1/analytics/render/allocation`
- BAR: `GET http://localhost:8000/api/v1/analytics/render/performance`
