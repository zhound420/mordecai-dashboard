import { NextResponse } from 'next/server'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import type { SubAgent } from '@/types'

export async function GET() {
  try {
    const dataPath = join(process.cwd(), 'data', 'agents.json')

    if (!existsSync(dataPath)) {
      return NextResponse.json({ data: [], timestamp: new Date().toISOString() })
    }

    const raw = readFileSync(dataPath, 'utf-8')
    const agents: SubAgent[] = JSON.parse(raw)
    return NextResponse.json({ data: agents, timestamp: new Date().toISOString() })
  } catch {
    return NextResponse.json({ error: 'Failed to read agents' }, { status: 500 })
  }
}
