import { NextResponse } from 'next/server'
import { nanoid } from 'nanoid'
import crypto from 'crypto'
import { findLinkByUserAndHash, insertLink } from '../../../lib/simpleDb'

type ReqBody = {
  originalUrl?: string
  userId?: string
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as ReqBody
    const { originalUrl, userId } = body

    if (!originalUrl || !userId) {
      return NextResponse.json({ error: 'originalUrl and userId are required' }, { status: 400 })
    }

    // compute SHA-256 hash for deduplication
    const hash = crypto.createHash('sha256').update(originalUrl).digest('hex')

    // look for existing link for this user + url hash
    const existing = await findLinkByUserAndHash(userId, hash)
    if (existing) {
      // Existing link found — return it and do NOT count against quota
      return NextResponse.json(
        { shortCode: existing.shortCode, existing: true, counted: false },
        { status: 200 }
      )
    }

    // Not found — create new shortCode then persist
    const shortCode = nanoid(8)
    const newLink = {
      id: crypto.randomUUID(),
      userId,
      originalUrl,
      originalUrlHash: hash,
      shortCode,
      createdAt: new Date().toISOString(),
      expiresAt: null,
      isActive: true,
    }

    await insertLink(newLink)

    // New link created — caller should count toward quota
    return NextResponse.json({ shortCode, existing: false, counted: true }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message || String(err) }, { status: 500 })
  }
}
