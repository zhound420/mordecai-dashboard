import { cn } from '@/lib/utils'
import type { ActivityType } from '@/types'
import { MessageSquare, Wrench, Clock, Heart, Brain, AlertCircle, Zap } from 'lucide-react'

const typeConfig: Record<ActivityType, { label: string; icon: React.ComponentType<{ className?: string }>; color: string }> = {
  message: { label: 'message', icon: MessageSquare, color: 'text-blue-400 bg-blue-500/10' },
  task: { label: 'task', icon: Zap, color: 'text-purple-400 bg-purple-500/10' },
  cron: { label: 'cron', icon: Clock, color: 'text-amber-400 bg-amber-500/10' },
  heartbeat: { label: 'heartbeat', icon: Heart, color: 'text-pink-400 bg-pink-500/10' },
  memory: { label: 'memory', icon: Brain, color: 'text-teal-400 bg-teal-500/10' },
  tool: { label: 'tool', icon: Wrench, color: 'text-orange-400 bg-orange-500/10' },
  error: { label: 'error', icon: AlertCircle, color: 'text-red-400 bg-red-500/10' },
}

interface ActivityTypeBadgeProps {
  type: ActivityType
  className?: string
}

export function ActivityTypeBadge({ type, className }: ActivityTypeBadgeProps) {
  const config = typeConfig[type]
  const Icon = config.icon

  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium', config.color, className)}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  )
}
