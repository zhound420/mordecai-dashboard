import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import type { SystemStatus, DailySummary, ActivityEntry } from '@/types'
import { PageHeader } from '@/components/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ActivityTypeBadge } from '@/components/activity-type-badge'
import { StatusBadge } from '@/components/status-badge'
import {
  Activity,
  Zap,
  FileText,
  CheckCircle,
  Bot,
  Timer,
  Cpu,
  MemoryStick,
  AlertTriangle,
  Brain,
  Terminal,
  ArrowRight,
  TrendingUp,
} from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'
import Link from 'next/link'

function readData<T>(path: string): T | null {
  try {
    if (!existsSync(path)) return null
    return JSON.parse(readFileSync(path, 'utf-8')) as T
  } catch {
    return null
  }
}

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400)
  const h = Math.floor((seconds % 86400) / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (d > 0) return `${d}d ${h}h ${m}m`
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

function formatTokens(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return String(n)
}

const typeColors: Record<string, string> = {
  message: 'text-blue-400',
  task: 'text-purple-400',
  cron: 'text-amber-400',
  heartbeat: 'text-pink-400',
  memory: 'text-teal-400',
  tool: 'text-orange-400',
  error: 'text-red-400',
}

const typePrefix: Record<string, string> = {
  message: '[MSG]',
  task: '[TSK]',
  cron: '[CRN]',
  heartbeat: '[HBT]',
  memory: '[MEM]',
  tool: '[TUL]',
  error: '[ERR]',
}

export default function HomePage() {
  const today = new Date().toISOString().slice(0, 10)
  const status = readData<SystemStatus>(join(process.cwd(), 'data', 'status.json'))
  const daily = readData<DailySummary>(join(process.cwd(), 'data', 'daily', `${today}.json`))

  const activityPath = join(process.cwd(), 'data', 'activity.jsonl')
  let recentActivity: ActivityEntry[] = []
  if (existsSync(activityPath)) {
    const raw = readFileSync(activityPath, 'utf-8')
    recentActivity = raw.split('\n').filter(Boolean).map(l => JSON.parse(l)).slice(0, 14)
  }

  // Channel type distribution from recent activity
  const typeCounts = recentActivity.reduce<Record<string, number>>((acc, e) => {
    acc[e.type] = (acc[e.type] ?? 0) + 1
    return acc
  }, {})

  const totalEntries = recentActivity.length || 1
  const typeDistribution = Object.entries(typeCounts).map(([type, count]) => ({
    type,
    count,
    pct: Math.round((count / totalEntries) * 100),
  })).sort((a, b) => b.count - a.count)

  const cpuPct = status?.cpuPercent ?? 0
  const memPct = Math.min(Math.round(((status?.memoryUsageMb ?? 0) / 32768) * 100), 100)

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Overview"
        description={`System dashboard · ${format(new Date(), 'EEE, MMM d yyyy')}`}
      />

      <div className="flex-1 p-5 space-y-5 overflow-auto">

        {/* Top stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            {
              label: 'Messages',
              value: daily?.messagesHandled ?? 0,
              icon: Activity,
              color: 'text-blue-400',
              glow: 'oklch(0.60 0.16 220)',
              bg: 'oklch(0.60 0.16 220 / 0.08)',
              trend: '+8% vs yesterday',
            },
            {
              label: 'Tasks Done',
              value: daily?.tasksCompleted ?? 0,
              icon: CheckCircle,
              color: 'text-green-400',
              glow: 'oklch(0.75 0.18 145)',
              bg: 'oklch(0.75 0.18 145 / 0.08)',
              trend: 'today',
            },
            {
              label: 'Files Modified',
              value: daily?.filesModified ?? 0,
              icon: FileText,
              color: 'text-amber-400',
              glow: 'oklch(0.72 0.16 60)',
              bg: 'oklch(0.72 0.16 60 / 0.08)',
              trend: 'today',
            },
            {
              label: 'Errors',
              value: daily?.errorsEncountered ?? 0,
              icon: AlertTriangle,
              color: daily?.errorsEncountered ? 'text-red-400' : 'text-muted-foreground',
              glow: 'oklch(0.65 0.22 25)',
              bg: daily?.errorsEncountered ? 'oklch(0.65 0.22 25 / 0.08)' : 'transparent',
              trend: daily?.errorsEncountered ? 'needs attention' : 'all clear',
            },
          ].map(({ label, value, icon: Icon, color, glow, bg, trend }) => (
            <div
              key={label}
              className="rounded-lg p-4 border border-border/60 relative overflow-hidden transition-all duration-200 hover:border-border bg-card"
            >
              <div
                className="absolute inset-0 opacity-100 rounded-lg"
                style={{ background: bg }}
              />
              <div className="relative">
                <div className="flex items-start justify-between mb-3">
                  <div
                    className="w-8 h-8 rounded-md flex items-center justify-center"
                    style={{ background: bg, border: `1px solid ${glow}33` }}
                  >
                    <Icon className={`w-4 h-4 ${color}`} />
                  </div>
                  <TrendingUp className="w-3 h-3 text-muted-foreground/40" />
                </div>
                <div className={`text-2xl font-bold font-mono ${color}`}>{value}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
                <div className="text-[10px] text-muted-foreground/60 mt-1">{trend}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Middle row: System + Resources + Token stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* System status */}
          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                <div
                  className="w-1.5 h-1.5 rounded-full pulse-dot"
                  style={{ background: 'oklch(0.75 0.18 145)', boxShadow: '0 0 6px oklch(0.75 0.18 145 / 0.8)' }}
                />
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Health</span>
                <StatusBadge status={status?.health ?? 'unknown'} pulse={status?.health === 'healthy'} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Uptime</span>
                <span className="text-xs text-foreground font-mono">{status ? formatUptime(status.uptime) : '—'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Version</span>
                <span className="text-xs font-mono text-primary">v{status?.version ?? '—'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Last ping</span>
                <span className="text-xs text-foreground font-mono">
                  {status?.lastHeartbeat
                    ? formatDistanceToNow(new Date(status.lastHeartbeat), { addSuffix: true })
                    : '—'}
                </span>
              </div>
              <div className="pt-1.5 border-t border-border/50">
                <div className="flex flex-wrap gap-1">
                  {(status?.activeChannels ?? []).map(ch => (
                    <span
                      key={ch}
                      className="px-1.5 py-0.5 rounded text-[10px] border font-mono text-primary"
                      style={{
                        background: 'color-mix(in oklch, var(--primary) 8%, transparent)',
                        borderColor: 'color-mix(in oklch, var(--primary) 25%, transparent)',
                      }}
                    >
                      {ch}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Resources */}
          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                <Cpu className="w-3 h-3" />
                Resources
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between mb-1.5">
                  <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Cpu className="w-3 h-3" /> CPU
                  </span>
                  <span className="text-xs font-mono" style={{ color: cpuPct > 80 ? 'oklch(0.65 0.22 25)' : cpuPct > 50 ? 'oklch(0.72 0.16 60)' : 'oklch(0.75 0.18 145)' }}>
                    {cpuPct}%
                  </span>
                </div>
                <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${cpuPct}%`,
                      background: cpuPct > 80 ? 'oklch(0.65 0.22 25)' : cpuPct > 50 ? 'oklch(0.72 0.16 60)' : 'oklch(0.70 0.20 295)',
                      boxShadow: `0 0 6px ${cpuPct > 80 ? 'oklch(0.65 0.22 25 / 0.5)' : 'oklch(0.70 0.20 295 / 0.4)'}`,
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1.5">
                  <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <MemoryStick className="w-3 h-3" /> Memory
                  </span>
                  <span className="text-xs font-mono text-foreground">
                    {((status?.memoryUsageMb ?? 0) / 1024).toFixed(1)}GB <span className="text-muted-foreground">/ 32GB</span>
                  </span>
                </div>
                <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${memPct}%`,
                      background: 'linear-gradient(90deg, oklch(0.60 0.16 220), oklch(0.70 0.20 295))',
                      boxShadow: '0 0 6px oklch(0.60 0.16 220 / 0.4)',
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1 border-t border-border/50">
                <div className="text-center">
                  <div className="text-base font-bold font-mono text-foreground">{daily?.subAgentsSpawned ?? 0}</div>
                  <div className="text-[10px] text-muted-foreground flex items-center gap-1 justify-center">
                    <Bot className="w-2.5 h-2.5" /> agents
                  </div>
                </div>
                <div className="text-center border-x border-border/50">
                  <div className="text-base font-bold font-mono text-foreground">{daily?.cronJobsRun ?? 0}</div>
                  <div className="text-[10px] text-muted-foreground flex items-center gap-1 justify-center">
                    <Timer className="w-2.5 h-2.5" /> crons
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-base font-bold font-mono text-primary">
                    {formatTokens(daily?.tokensUsed ?? 0)}
                  </div>
                  <div className="text-[10px] text-muted-foreground flex items-center gap-1 justify-center">
                    <Zap className="w-2.5 h-2.5" /> tokens
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Type distribution */}
          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                <Activity className="w-3 h-3" />
                Activity Mix
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {typeDistribution.slice(0, 5).map(({ type, count, pct }) => (
                  <div key={type} className="flex items-center gap-2">
                    <div className={`text-[10px] font-mono w-16 shrink-0 ${typeColors[type] ?? 'text-muted-foreground'}`}>
                      {typePrefix[type] ?? type}
                    </div>
                    <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${pct}%`,
                          background: type === 'message' ? 'oklch(0.60 0.16 220)'
                            : type === 'task' ? 'oklch(0.70 0.20 295)'
                            : type === 'cron' ? 'oklch(0.72 0.16 60)'
                            : type === 'heartbeat' ? 'oklch(0.72 0.18 340)'
                            : type === 'memory' ? 'oklch(0.68 0.18 180)'
                            : type === 'tool' ? 'oklch(0.70 0.18 50)'
                            : 'oklch(0.65 0.22 25)',
                        }}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground font-mono w-8 text-right shrink-0">{count}</span>
                  </div>
                ))}
              </div>

              {/* Hourly sparkline */}
              {daily && (
                <div className="mt-4 pt-3 border-t border-border/50">
                  <div className="text-[10px] text-muted-foreground mb-2">Hourly activity today</div>
                  <div className="flex items-end gap-px h-10">
                    {daily.hourlyActivity.map((h) => {
                      const maxMsgs = Math.max(...daily.hourlyActivity.map(x => x.messages), 1)
                      const heightPct = Math.max((h.messages / maxMsgs) * 100, h.messages > 0 ? 8 : 2)
                      const isNow = new Date().getHours() === h.hour
                      return (
                        <div
                          key={h.hour}
                          className="flex-1 rounded-sm transition-all"
                          style={{
                            height: `${heightPct}%`,
                            background: isNow
                              ? 'var(--primary)'
                              : h.messages > 0
                                ? `color-mix(in oklch, var(--primary) ${Math.round((0.25 + (h.messages / maxMsgs) * 0.55) * 100)}%, transparent)`
                                : 'var(--secondary)',
                            boxShadow: isNow ? '0 0 4px color-mix(in oklch, var(--primary) 60%, transparent)' : undefined,
                          }}
                          title={`${h.hour}:00 — ${h.messages} msgs`}
                        />
                      )
                    })}
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-[9px] text-muted-foreground/50">00:00</span>
                    <span className="text-[9px] text-muted-foreground/50">23:00</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Bottom: Terminal feed + Quick actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {/* Terminal activity feed — 2/3 width */}
          <Card className="lg:col-span-2 border-border/60 overflow-hidden">
            <CardHeader className="pb-2 border-b border-border/50">
              <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                <Terminal className="w-3 h-3" />
                <span>Live Feed</span>
                <div
                  className="w-1.5 h-1.5 rounded-full ml-1 pulse-dot"
                  style={{ background: 'oklch(0.75 0.18 145)', boxShadow: '0 0 6px oklch(0.75 0.18 145 / 0.7)' }}
                />
                <span className="ml-auto text-muted-foreground/50">stdout</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div
                className="p-3 space-y-0.5"
                style={{ background: 'var(--surface-terminal)' }}
              >
                {recentActivity.slice(0, 12).map((entry, i) => (
                  <div key={entry.id} className="terminal-line flex items-start gap-2 group">
                    <span className="text-muted-foreground/40 font-mono text-[10px] w-5 text-right shrink-0 mt-px select-none">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="text-muted-foreground/50 font-mono text-[10px] shrink-0 mt-px">
                      {format(new Date(entry.timestamp), 'HH:mm:ss')}
                    </span>
                    <span className={`font-mono text-[10px] font-semibold shrink-0 mt-px ${typeColors[entry.type] ?? 'text-muted-foreground'}`}>
                      {typePrefix[entry.type] ?? `[${entry.type.toUpperCase()}]`}
                    </span>
                    <span className={`font-mono text-[10px] flex-1 truncate leading-relaxed ${
                      entry.status === 'error' ? 'text-red-300' : 'text-foreground/80'
                    }`}>
                      {entry.summary}
                    </span>
                    {entry.agentId && (
                      <span className="font-mono text-[10px] shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-primary/70">
                        @{entry.agentId}
                      </span>
                    )}
                    <span className={`font-mono text-[10px] shrink-0 ${entry.status === 'error' ? 'text-red-400' : entry.status === 'success' ? 'text-green-400/60' : 'text-amber-400/60'}`}>
                      {entry.status === 'error' ? '✗' : entry.status === 'success' ? '✓' : '◎'}
                    </span>
                  </div>
                ))}
                <div className="terminal-line flex items-center gap-2 blink-cursor text-[10px] text-muted-foreground/50 pl-7 font-mono">
                  mordecai@system:~$
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick actions + top activities — 1/3 */}
          <div className="space-y-3">
            {/* Quick actions */}
            <Card className="border-border/60">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1.5 p-3 pt-0">
                {[
                  { href: '/memory', label: 'View Memory Files', icon: Brain, color: 'text-teal-400' },
                  { href: '/activity', label: 'Browse Activity Log', icon: Activity, color: 'text-blue-400' },
                  { href: '/agents', label: 'Check Sub-Agents', icon: Bot, color: 'text-purple-400' },
                  { href: '/system', label: 'System Config', icon: Cpu, color: 'text-amber-400' },
                ].map(({ href, label, icon: Icon, color }) => (
                  <Link
                    key={href}
                    href={href}
                    className="flex items-center gap-2.5 px-2.5 py-2 rounded-md group transition-all duration-150 hover:bg-secondary/60"
                    style={{ border: '1px solid transparent' }}
                  >
                    <Icon className={`w-3.5 h-3.5 ${color} shrink-0`} />
                    <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors flex-1">{label}</span>
                    <ArrowRight className="w-3 h-3 text-muted-foreground/30 group-hover:text-muted-foreground/70 transition-all group-hover:translate-x-0.5" />
                  </Link>
                ))}
              </CardContent>
            </Card>

            {/* Top activities */}
            <Card className="border-border/60">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                  <CheckCircle className="w-3 h-3" />
                  Top Activities
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                {daily?.topActivities?.length ? (
                  <ol className="space-y-2">
                    {daily.topActivities.map((activity, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-[10px] font-mono shrink-0 mt-0.5 w-4 text-primary/70">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <span className="text-[11px] text-foreground/80 leading-relaxed">{activity}</span>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="text-xs text-muted-foreground">No activities yet.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
