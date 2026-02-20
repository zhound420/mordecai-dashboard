# OpenClaw Agent Dashboard

A generic, reusable monitoring dashboard template for [OpenClaw](https://openclaw.dev) agents. Drop it alongside any OpenClaw agent to get a live view of sessions, activity, memory, sub-agents, cron jobs, and system health — all in one dark-themed UI.

Built with Next.js 16, React 19, Tailwind v4, and shadcn/ui.

---

## Quick Start

```bash
# 1. Clone the template
git clone https://github.com/your-org/openclaw-agent-dashboard
cd openclaw-agent-dashboard

# 2. Install dependencies
npm install

# 3. Configure your environment
cp .env.example .env.local
# Edit .env.local — set NEXT_PUBLIC_AGENT_NAME, OPENCLAW_GATEWAY_URL, etc.

# 4. Build and run
npm run build && npm start
# Dashboard available at http://localhost:3100
```

For local development with hot-reload:

```bash
npm run dev
```

---

## Environment Variables

Copy `.env.example` to `.env.local` and set the following:

| Variable | Default | Description |
|---|---|---|
| `NEXT_PUBLIC_AGENT_NAME` | `Agent` | Agent name shown in sidebar, page title, and terminal prompt |
| `NEXT_PUBLIC_AGENT_TAGLINE` | `Your AI assistant` | Tagline shown below the agent name in the sidebar |
| `OPENCLAW_GATEWAY_URL` | `http://localhost:18789` | URL of the OpenClaw gateway (used by the `openclaw` CLI) |
| `OPENCLAW_GATEWAY_TOKEN` | *(required)* | Auth token for the OpenClaw gateway |

> **Note:** `OPENCLAW_GATEWAY_URL` and `OPENCLAW_GATEWAY_TOKEN` are consumed by the `openclaw` CLI binary that must be on your `$PATH`. The dashboard shells out to `openclaw` for all live data — it does not call the gateway directly.

---

## What It Monitors

| Page | Data Source |
|---|---|
| **Overview** | `openclaw status --json`, `openclaw sessions list --json`, `openclaw cron list --json` |
| **Activity** | `openclaw sessions list --json` + cron job history |
| **Memory** | `openclaw status --json` (memory section) |
| **Sub-Agents** | `openclaw status --json` (agents section) |
| **System** | `openclaw status --json` + `openclaw cron list --json` |

All API routes cache responses for 30 seconds to avoid hammering the CLI.

---

## Project Structure

```
app/
  layout.tsx          # Root layout — reads NEXT_PUBLIC_AGENT_NAME/TAGLINE
  page.tsx            # Overview dashboard
  activity/           # Paginated activity log
  memory/             # Memory file viewer
  agents/             # Sub-agent cards + task timelines
  system/             # Channels, cron jobs, system config
  api/                # Server-side routes that shell out to openclaw CLI
components/
  sidebar.tsx         # Collapsible nav — shows agent name + tagline
  top-status-bar.tsx  # Live heartbeat + channel status
data/                 # Static fallback JSON (used when CLI is unavailable)
```

---

## Customization

- **Branding:** Set `NEXT_PUBLIC_AGENT_NAME` and `NEXT_PUBLIC_AGENT_TAGLINE` in `.env.local`
- **Port:** Change the port in `package.json` scripts (`-p 3100`)
- **Colors:** Edit `app/globals.css` — the design system uses oklch color variables
- **Nav items:** Edit `components/sidebar.tsx` `navItems` array

---

## Requirements

- Node.js 18+
- `openclaw` CLI on your `$PATH` and authenticated
- An OpenClaw gateway running and reachable

---

## OpenClaw Docs

- [OpenClaw documentation](https://openclaw.dev/docs)
- [CLI reference](https://openclaw.dev/docs/cli)
