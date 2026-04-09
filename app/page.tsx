import Link from "next/link"
import { Typography, Icon } from "@/components/ui"

export default function Home() {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: "var(--fleet-background-primary)" }}
    >
      <div className="flex flex-col gap-6 max-w-md">
        <Typography variant="header-1-semibold">Prototypes</Typography>
        <Link
          href="/project-setup"
          className="flex items-center gap-3 p-4 rounded-[var(--fleet-radius-lg)] transition-colors"
          style={{ background: "var(--fleet-island-background)" }}
        >
          <Icon fleet="ai-new-project" size="md" />
          <div>
            <Typography variant="default-semibold">Project Setup Agent</Typography>
            <Typography variant="default" style={{ color: "var(--fleet-text-secondary)" }}>
              Conversational agent for environment setup
            </Typography>
          </div>
        </Link>
      </div>
    </div>
  )
}
