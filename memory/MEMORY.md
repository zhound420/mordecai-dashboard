# Mordecai Dashboard — Project Memory

## Stack
- Next.js 16 + React 19 + Tailwind v4 + shadcn/ui (new-york)
- Port: **3100** (dev & start both use `-p 3100`)
- No `tailwind.config.js` needed — all CSS vars in `globals.css`
- Font: Geist Mono throughout

## Key Files
- `app/globals.css` — Full design system: oklch colors, glassmorphism, animations
- `components/sidebar.tsx` — Collapsible sidebar with glow effects
- `components/top-status-bar.tsx` — Live uptime ticker + heartbeat + channel dots
- `components/page-transition.tsx` — Fade/slide page transitions
- `data/activity.jsonl` — 50 entries (append-only activity log)
- `data/agents.json` — 6 agents with full task history
- `data/system.json` — channels, cron jobs, 7d token usage

## Design System (oklch dark palette)
- Background: `oklch(0.07 0.012 265)` near-black blue-gray
- Card: `oklch(0.10 0.015 265)`
- Primary (purple): `oklch(0.70 0.20 295)`
- CSS classes: `.glass-card`, `.gradient-bg`, `.grid-overlay`, `.pulse-dot`, `.glow-green`, `.glow-primary`, `.blink-cursor`

## v2 Features Added
- Collapsible sidebar with active glow + left accent bar
- Top status bar: uptime ticker, heartbeat pulse, channel dots, CPU/mem
- Overview: terminal-style feed with ANSI-like color codes, activity mix bar chart, hourly sparkline
- Activity: table + timeline views, expandable rows with details, color-coded by type
- Memory: syntax-highlighted markdown, visual file tree, search highlighting
- Agents: avatar circles with per-agent color, success rate rings, task history timeline
- System: animated health gauge, channel cards with glow, collapsible config tree, token sparkline

## API Routes
- `/api/activity` — paginated, filterable (type, channel, search)
- `/api/agents` — returns full agents.json array
- `/api/system` — returns full system.json (config + channels + cronJobs + tokenUsage)
- `/api/status` — system health snapshot
- `/api/memory` — memory entries with search
- `/api/daily` — daily summary by date
