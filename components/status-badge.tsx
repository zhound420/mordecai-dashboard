import { cn } from '@/lib/utils'
import type { ActivityStatus, AgentStatus } from '@/types'

type Status = ActivityStatus | AgentStatus | 'connected' | 'disconnected' | 'healthy' | 'degraded' | 'offline' | 'unknown'

const statusConfig: Record<string, { label: string; dot: string; text: string }> = {
  success: { label: 'success', dot: 'bg-green-500', text: 'text-green-400' },
  error: { label: 'error', dot: 'bg-red-500', text: 'text-red-400' },
  pending: { label: 'pending', dot: 'bg-yellow-500', text: 'text-yellow-400' },
  running: { label: 'running', dot: 'bg-blue-500', text: 'text-blue-400' },
  active: { label: 'active', dot: 'bg-green-500', text: 'text-green-400' },
  idle: { label: 'idle', dot: 'bg-muted-foreground', text: 'text-muted-foreground' },
  offline: { label: 'offline', dot: 'bg-zinc-600', text: 'text-zinc-500' },
  connected: { label: 'connected', dot: 'bg-green-500', text: 'text-green-400' },
  disconnected: { label: 'disconnected', dot: 'bg-zinc-600', text: 'text-zinc-500' },
  healthy: { label: 'healthy', dot: 'bg-green-500', text: 'text-green-400' },
  degraded: { label: 'degraded', dot: 'bg-yellow-500', text: 'text-yellow-400' },
  unknown: { label: 'unknown', dot: 'bg-zinc-600', text: 'text-zinc-500' },
}

interface StatusBadgeProps {
  status: Status
  pulse?: boolean
  showLabel?: boolean
  className?: string
}

export function StatusBadge({ status, pulse = false, showLabel = true, className }: StatusBadgeProps) {
  const config = statusConfig[status] ?? statusConfig.unknown

  return (
    <span className={cn('flex items-center gap-1.5', className)}>
      <span className={cn('w-2 h-2 rounded-full flex-shrink-0', config.dot, pulse && 'pulse-dot')} />
      {showLabel && (
        <span className={cn('text-xs', config.text)}>{config.label}</span>
      )}
    </span>
  )
}
