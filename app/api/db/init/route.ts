import { NextResponse } from 'next/server'
import { ensureTablesExist } from '@/lib/db-init'

export async function POST() {
  await ensureTablesExist()
  return NextResponse.json({ success: true, message: 'Tables created / already exist.' })
}
