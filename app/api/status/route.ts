import { NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import { join } from 'path'
import type { SystemStatus } from '@/types'

export async function GET() {
  try {
    const dataPath = join(process.cwd(), 'data', 'status.json')
    const raw = readFileSync(dataPath, 'utf-8')
    const data: SystemStatus = JSON.parse(raw)
    return NextResponse.json({ data, timestamp: new Date().toISOString() })
  } catch {
    return NextResponse.json({ error: 'Failed to read status' }, { status: 500 })
  }
}
