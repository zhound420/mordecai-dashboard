'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
  LayoutDashboard,
  Activity,
  Brain,
  Bot,
  Settings,
  ChevronLeft,
  ChevronRight,
  Feather,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ThemeToggle } from '@/components/theme-toggle'

const navItems = [
  { href: '/', label: 'Overview', icon: LayoutDashboard, color: 'text-primary' },
  { href: '/activity', label: 'Activity', icon: Activity, color: 'text-blue-400' },
  { href: '/memory', label: 'Memory', icon: Brain, color: 'text-teal-400' },
  { href: '/agents', label: 'Sub-Agents', icon: Bot, color: 'text-purple-400' },
  { href: '/system', label: 'System', icon: Settings, color: 'text-amber-400' },
]

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        'relative flex flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300 ease-in-out shrink-0',
        collapsed ? 'w-14' : 'w-52'
      )}
      style={{}}
      data-sidebar
    >
      {/* Subtle top gradient accent */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, oklch(0.70 0.20 295 / 0.5), transparent)' }}
      />

      {/* Logo */}
      <div className={cn(
        'flex items-center border-b border-sidebar-border transition-all duration-300',
        collapsed ? 'px-3 py-4 justify-center' : 'px-4 py-4 gap-3'
      )}>
        <div className="relative shrink-0">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{
              background: 'color-mix(in oklch, var(--primary) 20%, transparent)',
              border: '1px solid color-mix(in oklch, var(--primary) 30%, transparent)',
              boxShadow: '0 0 12px color-mix(in oklch, var(--primary) 20%, transparent)',
            }}
          >
            <Feather className="w-4 h-4 text-primary" />
          </div>
          <div
            className="absolute -inset-1 rounded-xl opacity-20 blur-sm bg-primary"
          />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <div className="text-sm font-semibold text-foreground tracking-wide">Mordecai</div>
            <div className="text-[10px] text-muted-foreground truncate">Your raven is watching</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-2 space-y-0.5 mt-1">
        {navItems.map((item) => {
          const isActive = item.href === '/'
            ? pathname === '/'
            : pathname.startsWith(item.href)
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                'group relative flex items-center gap-3 rounded-md px-2.5 py-2 text-sm transition-all duration-150',
                collapsed ? 'justify-center' : '',
                isActive
                  ? 'bg-sidebar-accent text-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/60'
              )}
              style={isActive ? {
                boxShadow: `inset 0 0 0 1px color-mix(in oklch, var(--primary) 20%, transparent), 0 0 12px color-mix(in oklch, var(--primary) 8%, transparent)`,
              } : undefined}
            >
              {/* Active left accent bar */}
              {isActive && (
                <div
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full bg-primary"
                  style={{ boxShadow: '0 0 6px color-mix(in oklch, var(--primary) 80%, transparent)' }}
                />
              )}

              <Icon className={cn(
                'shrink-0 w-4 h-4 transition-all duration-150',
                isActive ? item.color : ''
              )} />

              {!collapsed && (
                <span className={cn(
                  'font-medium text-xs tracking-wide',
                  isActive ? 'text-foreground' : ''
                )}>
                  {item.label}
                </span>
              )}

              {/* Active dot (collapsed mode) */}
              {isActive && collapsed && (
                <div
                  className="absolute right-1 top-1 w-1.5 h-1.5 rounded-full bg-primary"
                  style={{ boxShadow: '0 0 4px var(--primary)' }}
                />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-sidebar-border space-y-2">
        {!collapsed && (
          <div className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-sidebar-accent/40">
            <div
              className="w-2 h-2 rounded-full shrink-0 pulse-dot"
              style={{ background: 'oklch(0.75 0.18 145)', boxShadow: '0 0 6px oklch(0.75 0.18 145 / 0.8)' }}
            />
            <span className="text-[10px] text-muted-foreground font-medium">v2026.2.17 · healthy</span>
          </div>
        )}
        <div className={cn('flex', collapsed ? 'justify-center' : 'px-2')}>
          <ThemeToggle />
        </div>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className={cn(
          'absolute -right-3 top-16 w-6 h-6 rounded-full border border-sidebar-border flex items-center justify-center',
          'bg-sidebar text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all duration-150 z-10',
          'hover:shadow-[0_0_8px_oklch(0.70_0.20_295_/_0.3)]'
        )}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed
          ? <ChevronRight className="w-3 h-3" />
          : <ChevronLeft className="w-3 h-3" />
        }
      </button>
    </aside>
  )
}
