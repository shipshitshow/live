# Ship Shit Show — Analytics Dashboard

Next.js dashboard for YouTube channel analytics. Displays views, CTR, watch time, and subscriber growth.

## Prerequisites

- Python analytics API running at `http://localhost:8000` (start with `python -m pipeline.analytics.api`)
- Node.js 18+

## Setup

```bash
bun install
bun run dev   # http://localhost:3001
```

## Environment

```
ANALYTICS_API_URL=http://localhost:8000  # default
```

## Architecture

```
dashboard/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Main dashboard page (server component shell)
│   │   ├── layout.tsx
│   │   └── api/report/route.ts   # Proxies to Python analytics API
│   ├── components/
│   │   ├── DashboardClient.tsx   # Client component — state + data fetching
│   │   ├── StatCard.tsx          # KPI card
│   │   ├── TimeSeriesChart.tsx   # Recharts line chart
│   │   ├── VideoTable.tsx        # Sortable per-video table
│   │   └── DateRangeSelector.tsx # 7D / 30D / 90D toggle
│   └── lib/
│       ├── types.ts              # Shared TypeScript interfaces
│       ├── format.ts             # Number/duration formatters
│       └── api.ts                # API client (server-side)
```

## Starting the full stack

```bash
# Terminal 1: Python analytics API
cd ..
python -m pipeline.analytics.api

# Terminal 2: Next.js dashboard
bun run dev
```
