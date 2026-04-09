"use client"

import { useState, useEffect } from "react"

const STORAGE_KEY = "prototype-auth"
const PASSWORD = "getsomeair"

export default function PasswordGate({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState(false)
  const [value, setValue] = useState("")
  const [error, setError] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    if (sessionStorage.getItem(STORAGE_KEY) === "1") setAuthed(true)
    setChecking(false)
  }, [])

  const submit = () => {
    if (value === PASSWORD) {
      sessionStorage.setItem(STORAGE_KEY, "1")
      setAuthed(true)
    } else {
      setError(true)
    }
  }

  if (checking) return null
  if (authed) return <>{children}</>

  return (
    <div className="h-full flex items-center justify-center" style={{ background: "var(--fleet-app-background, #1e1f22)" }}>
      <div className="w-[340px] space-y-4 text-center">
        <div>
          <h1 className="text-[18px] font-semibold" style={{ color: "var(--fleet-text-primary, #fff)" }}>This prototype is protected</h1>
          <p className="text-[13px] mt-1" style={{ color: "var(--fleet-text-secondary, #888)" }}>Enter the password to continue</p>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); submit() }} className="space-y-3">
          <input
            type="password"
            value={value}
            onChange={(e) => { setValue(e.target.value); setError(false) }}
            placeholder="Password"
            autoFocus
            className="w-full h-7 rounded px-2 text-[13px] border outline-none"
            style={{
              background: "var(--fleet-input-background-default, #2b2d30)",
              borderColor: error ? "var(--fleet-red, #f87c88)" : "var(--fleet-border, #ffffff21)",
              color: "var(--fleet-text-primary, #fff)",
            }}
          />
          {error && <p className="text-[12px]" style={{ color: "var(--fleet-red, #f87c88)" }}>Incorrect password</p>}
          <button
            type="submit"
            className="w-full h-7 rounded text-[13px] font-medium"
            style={{
              background: "var(--fleet-button-primary-background-default, #2a7deb)",
              color: "var(--fleet-button-primary-text-default, #fff)",
            }}
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  )
}
