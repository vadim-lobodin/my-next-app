import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

const COOKIE_NAME = "proto-gate"
// SHA-256 of the password — never store plaintext on the server
const PASSWORD_HASH = "a0e81f3ecd8596e79bffc063a53738fef1e31b048c52517a6937a752c62e24e0" // sha256("getsomeair")

async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text))
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("")
}

// POST — verify password
export async function POST(req: NextRequest) {
  const { password } = await req.json()
  const hash = await sha256(password)

  if (hash !== PASSWORD_HASH) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }

  const token = await sha256(`${PASSWORD_HASH}:${Date.now()}:${crypto.randomUUID()}`)
  const jar = await cookies()
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  })

  return NextResponse.json({ ok: true })
}

// GET — check if authenticated
export async function GET() {
  const jar = await cookies()
  const token = jar.get(COOKIE_NAME)?.value
  return NextResponse.json({ ok: !!token })
}
