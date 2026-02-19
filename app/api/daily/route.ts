import { NextRequest, NextResponse } from 'next/server'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import type { DailySummary } from '@/types'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const date = searchParams.get('date') ?? new Date().toISOString().slice(0, 10)

    const dataPath = join(process.cwd(), 'data', 'daily', `${date}.json`)

    if (!existsSync(dataPath)) {
      return NextResponse.json({ error: `No data for ${date}` }, { status: 404 })
    }

    const raw = readFileSync(dataPath, 'utf-8')
    const data: DailySummary = JSON.parse(raw)
    return NextResponse.json({ data, timestamp: new Date().toISOString() })
  } catch {
    return NextResponse.json({ error: 'Failed to read daily summary' }, { status: 500 })
  }
}
