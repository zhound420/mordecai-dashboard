import { NextResponse } from 'next/server'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

export async function GET() {
  try {
    const dataPath = join(process.cwd(), 'data', 'system.json')

    if (!existsSync(dataPath)) {
      return NextResponse.json({ error: 'No system data' }, { status: 404 })
    }

    const raw = readFileSync(dataPath, 'utf-8')
    const data = JSON.parse(raw)
    return NextResponse.json({ data, timestamp: new Date().toISOString() })
  } catch {
    return NextResponse.json({ error: 'Failed to read system data' }, { status: 500 })
  }
}
