import { NextRequest, NextResponse } from 'next/server'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search')?.toLowerCase()

    const dataPath = join(process.cwd(), 'data', 'memory.json')

    if (!existsSync(dataPath)) {
      return NextResponse.json({ entries: [], totalSizeBytes: 0, lastConsolidated: null, timestamp: new Date().toISOString() })
    }

    const raw = readFileSync(dataPath, 'utf-8')
    const memData = JSON.parse(raw)

    let entries = memData.entries
    if (search) {
      entries = entries.filter((e: { title: string; content: string; tags: string[] }) =>
        e.title.toLowerCase().includes(search) ||
        e.content.toLowerCase().includes(search) ||
        e.tags.some((t: string) => t.includes(search))
      )
    }

    return NextResponse.json({
      entries,
      totalSizeBytes: memData.totalSizeBytes,
      lastConsolidated: memData.lastConsolidated,
      timestamp: new Date().toISOString()
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to read memory' }, { status: 500 })
  }
}
