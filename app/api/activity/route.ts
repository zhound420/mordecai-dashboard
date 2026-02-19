import { NextRequest, NextResponse } from 'next/server'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import type { ActivityEntry, ActivityType, ChannelType } from '@/types'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type') as ActivityType | null
    const channel = searchParams.get('channel') as ChannelType | null
    const search = searchParams.get('search')?.toLowerCase()
    const page = parseInt(searchParams.get('page') ?? '1')
    const pageSize = parseInt(searchParams.get('pageSize') ?? '25')

    const dataPath = join(process.cwd(), 'data', 'activity.jsonl')

    if (!existsSync(dataPath)) {
      return NextResponse.json({ items: [], total: 0, page, pageSize, hasMore: false, timestamp: new Date().toISOString() })
    }

    const raw = readFileSync(dataPath, 'utf-8')
    let entries: ActivityEntry[] = raw
      .split('\n')
      .filter(Boolean)
      .map(line => JSON.parse(line))
      .reverse() // Most recent first

    // Apply filters
    if (type) entries = entries.filter(e => e.type === type)
    if (channel) entries = entries.filter(e => e.channel === channel)
    if (search) entries = entries.filter(e =>
      e.summary.toLowerCase().includes(search) ||
      e.type.includes(search) ||
      (e.agentId?.toLowerCase().includes(search) ?? false)
    )

    const total = entries.length
    const start = (page - 1) * pageSize
    const items = entries.slice(start, start + pageSize)

    return NextResponse.json({
      items,
      total,
      page,
      pageSize,
      hasMore: start + pageSize < total,
      timestamp: new Date().toISOString()
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to read activity log' }, { status: 500 })
  }
}
