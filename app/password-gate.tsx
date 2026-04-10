"use client"

import { useState, useEffect } from "react"

export default function PasswordGate({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState(false)
  const [value, setValue] = useState("")
  const [error, setError] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    fetch("/api/gate")
      .then((r) => r.json())
      .then((d) => { if (d.ok) setAuthed(true) })
      .finally(() => setChecking(false))
  }, [])

  const submit = async () => {
    const res = await fetch("/api/gate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: value }),
    })
    if (res.ok) {
      setAuthed(true)
    } else {
      setError(true)
    }
  }

  if (checking) return null
  if (authed) return <>{children}</>

  return (
    <div
      className="h-full flex items-center justify-center"
      style={{ background: "linear-gradient(0deg, #4EC5B9 -21.91%, #2F7596 -0.37%, #244E67 21.17%, #1B2A35 42.71%, #182026 51.33%, #16181B 64.25%)" }}
    >
      <div
        className="w-[380px] rounded-2xl border p-8 space-y-5 text-center"
        style={{
          background: "rgba(255, 255, 255, 0.06)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderColor: "rgba(255, 255, 255, 0.1)",
        }}
      >
        <div>
          <h1 className="text-[28px] leading-[1.1]" style={{ color: "#fff", fontFamily: "var(--font-komuna, 'KomunaVar', sans-serif)", fontWeight: 129, fontStyle: "normal", fontVariationSettings: "'slnt' 0, 'ital' 0" }}>This prototype is protected</h1>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); submit() }} className="space-y-3">
          <input
            type="password"
            value={value}
            onChange={(e) => { setValue(e.target.value); setError(false) }}
            placeholder="Password"
            autoFocus
            className="w-full h-8 rounded-lg px-3 text-[13px] border outline-none"
            style={{
              background: "rgba(255, 255, 255, 0.06)",
              borderColor: error ? "#f87c88" : "rgba(255, 255, 255, 0.1)",
              color: "#fff",
            }}
          />
          {error && <p className="text-[12px]" style={{ color: "#f87c88" }}>Incorrect password</p>}
          <button
            type="submit"
            className="w-full h-8 rounded-lg text-[13px] font-medium transition-opacity hover:opacity-90"
            style={{
              background: "#2a7deb",
              color: "#fff",
            }}
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  )
}
