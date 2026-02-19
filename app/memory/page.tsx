'use client'

import { useState, useEffect, useCallback } from 'react'
import { PageHeader } from '@/components/page-header'
import { Input } from '@/components/ui/input'
import type { MemoryEntry } from '@/types'
import {
  Search, Brain, FileText, Clock, Database, X,
  ChevronRight, Tag, Calendar
} from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'
import { cn } from '@/lib/utils'

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  return `${(bytes / 1024).toFixed(1)} KB`
}

// Simple syntax-highlighted markdown renderer
function HighlightedContent({ content, searchTerm }: { content: string; searchTerm: string }) {
  const lines = content.split('\n')

  return (
    <div className="font-mono text-xs leading-relaxed">
      {lines.map((line, i) => {
        // Heading
        const h1 = line.match(/^# (.+)/)
        const h2 = line.match(/^## (.+)/)
        const h3 = line.match(/^### (.+)/)
        const bullet = line.match(/^- (.+)/)
        const boldBullet = line.match(/^- \*\*(.+?)\*\*(.*)/)
        const codeBlock = line.startsWith('```')
        const bold = line.match(/\*\*(.+?)\*\*/)

        let el: React.ReactNode

        if (h1) {
          el = (
            <div key={i} className="text-sm font-bold mt-2 mb-1 text-primary">
              {highlightSearch(h1[1], searchTerm)}
            </div>
          )
        } else if (h2) {
          el = (
            <div key={i} className="text-xs font-semibold mt-3 mb-1 flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <span className="opacity-50">#</span>
              {highlightSearch(h2[1], searchTerm)}
            </div>
          )
        } else if (h3) {
          el = (
            <div key={i} className="text-xs font-medium mt-2 mb-0.5 text-teal-600 dark:text-teal-400">
              {highlightSearch(h3[1], searchTerm)}
            </div>
          )
        } else if (boldBullet) {
          el = (
            <div key={i} className="flex gap-2 pl-2 my-0.5">
              <span className="text-muted-foreground/50 shrink-0 mt-px">•</span>
              <span>
                <span className="font-semibold text-primary">
                  {highlightSearch(boldBullet[1], searchTerm)}
                </span>
                <span className="text-foreground/70">{highlightSearch(boldBullet[2], searchTerm)}</span>
              </span>
            </div>
          )
        } else if (bullet) {
          el = (
            <div key={i} className="flex gap-2 pl-2 my-0.5">
              <span className="text-muted-foreground/50 shrink-0 mt-px">•</span>
              <span className="text-foreground/80">{highlightSearch(bullet[1], searchTerm)}</span>
            </div>
          )
        } else if (codeBlock) {
          el = (
            <div key={i} className="text-muted-foreground/40">
              {line}
            </div>
          )
        } else if (line.startsWith('    ') || line.startsWith('\t')) {
          el = (
            <div key={i} className="pl-4 font-mono text-green-700 dark:text-green-400">
              {highlightSearch(line, searchTerm)}
            </div>
          )
        } else if (line === '') {
          el = <div key={i} className="h-2" />
        } else {
          el = (
            <div key={i} className="text-foreground/75 my-0.5">
              {highlightSearch(line, searchTerm)}
            </div>
          )
        }

        return el
      })}
    </div>
  )
}

function highlightSearch(text: string, term: string): React.ReactNode {
  if (!term || !text) return text
  const parts = text.split(new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'))
  return (
    <>
      {parts.map((p, i) =>
        p.toLowerCase() === term.toLowerCase()
          ? <mark key={i} className="bg-amber-300/50 dark:bg-amber-500/30 text-amber-800 dark:text-amber-300 rounded-sm">{p}</mark>
          : p
      )}
    </>
  )
}

const fileIcons: Record<string, string> = {
  'MEMORY.md': '🧠',
  'patterns.md': '🔷',
  'debugging.md': '🐛',
  'agents.md': '🤖',
  'context-buffer.md': '📦',
}

const fileColors: Record<string, string> = {
  'MEMORY.md': 'oklch(0.70 0.20 295)',
  'patterns.md': 'oklch(0.60 0.16 220)',
  'debugging.md': 'oklch(0.65 0.22 25)',
  'agents.md': 'oklch(0.72 0.18 280)',
  'context-buffer.md': 'oklch(0.72 0.16 60)',
}

export default function MemoryPage() {
  const [entries, setEntries] = useState<MemoryEntry[]>([])
  const [totalSize, setTotalSize] = useState(0)
  const [lastConsolidated, setLastConsolidated] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<MemoryEntry | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchMemory = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      const res = await fetch(`/api/memory?${params}`)
      const data = await res.json()
      setEntries(data.entries ?? [])
      setTotalSize(data.totalSizeBytes ?? 0)
      setLastConsolidated(data.lastConsolidated ?? null)
      if (data.entries?.length > 0 && !selected) {
        setSelected(data.entries[0])
      }
    } finally {
      setLoading(false)
    }
  }, [search, selected])

  useEffect(() => {
    fetchMemory()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  return (
    <div className="flex flex-col h-full">
      <PageHeader title="Memory" description="Agent memory files and context buffer">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5" />
            <span className="font-mono">{formatBytes(totalSize)}</span>
          </div>
          {lastConsolidated && (
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>consolidated {formatDistanceToNow(new Date(lastConsolidated), { addSuffix: true })}</span>
            </div>
          )}
        </div>
      </PageHeader>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div
          className="w-64 shrink-0 border-r border-border/60 flex flex-col bg-sidebar"
        >
          {/* Search */}
          <div className="p-2.5 border-b border-border/60">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
              <Input
                placeholder="Search memory..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-7 h-7 text-xs bg-secondary/40 border-border/60 font-mono"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Tree label */}
          <div className="px-3 py-2 flex items-center gap-1.5">
            <Brain className="w-3 h-3 text-muted-foreground/50" />
            <span className="text-[10px] text-muted-foreground/60 font-mono uppercase tracking-wider">memory/</span>
          </div>

          {/* File tree */}
          <div className="flex-1 overflow-auto px-2 pb-2 space-y-0.5">
            {loading ? (
              <div className="space-y-2 p-2">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-12 rounded animate-pulse bg-secondary/40" />
                ))}
              </div>
            ) : entries.length === 0 ? (
              <div className="p-4 text-xs text-muted-foreground text-center">
                No files found
              </div>
            ) : (
              entries.map(entry => {
                const isSelected = selected?.filename === entry.filename
                const icon = fileIcons[entry.filename] ?? '📄'
                const color = fileColors[entry.filename] ?? 'oklch(0.58 0.03 265)'

                return (
                  <button
                    key={entry.filename}
                    onClick={() => setSelected(entry)}
                    className={cn(
                      'w-full text-left rounded-md px-2.5 py-2 transition-all duration-150 group',
                      isSelected
                        ? 'bg-secondary/80'
                        : 'hover:bg-secondary/40'
                    )}
                    style={isSelected ? {
                      borderLeft: `2px solid ${color}`,
                      boxShadow: `inset 0 0 0 1px ${color}20`,
                    } : { borderLeft: '2px solid transparent' }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm leading-none">{icon}</span>
                      <span
                        className="text-xs font-medium truncate"
                        style={{ color: isSelected ? color : undefined }}
                      >
                        {entry.filename}
                      </span>
                      <span className="text-[10px] text-muted-foreground/50 ml-auto shrink-0 font-mono">
                        {formatBytes(entry.sizeBytes)}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1 pl-6">
                      {entry.tags.slice(0, 2).map(tag => (
                        <span
                          key={tag}
                          className="text-[9px] px-1 rounded"
                          style={{ background: `${color}18`, color: `${color}99` }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </button>
                )
              })
            )}
          </div>

          {/* Stats footer */}
          <div className="p-2.5 border-t border-border/60 grid grid-cols-2 gap-2">
            <div className="text-center">
              <div className="text-xs font-bold font-mono text-foreground">{entries.length}</div>
              <div className="text-[9px] text-muted-foreground">files</div>
            </div>
            <div className="text-center">
              <div className="text-xs font-bold font-mono text-foreground">{formatBytes(totalSize)}</div>
              <div className="text-[9px] text-muted-foreground">total</div>
            </div>
          </div>
        </div>

        {/* Content pane */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {selected ? (
            <>
              {/* File header */}
              <div
                className="px-5 py-3 border-b border-border/60 flex items-start justify-between"
                style={{ background: 'var(--header-bg)' }}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <span className="text-lg leading-none mt-0.5">
                    {fileIcons[selected.filename] ?? '📄'}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-semibold text-foreground">
                        {selected.filename}
                      </h2>
                      <ChevronRight className="w-3 h-3 text-muted-foreground/40" />
                      <span className="text-xs text-muted-foreground">{selected.title}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        {formatBytes(selected.sizeBytes)}
                      </span>
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(selected.lastModified), 'MMM d, yyyy HH:mm')}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 justify-end max-w-36 shrink-0">
                  {selected.tags.map(tag => (
                    <span
                      key={tag}
                      className="text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1"
                      style={{
                        backgroundColor: `color-mix(in oklch, ${fileColors[selected.filename] ?? 'var(--primary)'} 15%, transparent)`,
                        color: fileColors[selected.filename] ?? 'var(--primary)',
                      }}
                    >
                      <Tag className="w-2 h-2" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Content with syntax highlighting */}
              <div className="flex-1 overflow-auto">
                <div
                  className="min-h-full p-5"
                  style={{ background: 'var(--surface-terminal)' }}
                >
                  <div
                    className="max-w-3xl rounded-lg p-5"
                    style={{
                      background: 'var(--surface-raised)',
                      border: '1px solid var(--expanded-panel-border)',
                    }}
                  >
                    <HighlightedContent content={selected.content} searchTerm={search} />
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-3">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{
                  background: 'color-mix(in oklch, var(--primary) 8%, transparent)',
                  border: '1px solid color-mix(in oklch, var(--primary) 15%, transparent)',
                }}
              >
                <Brain className="w-8 h-8 opacity-40" />
              </div>
              <p className="text-sm">Select a memory file to view</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
