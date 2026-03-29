"use client";

import { ReactNode } from "react";
import {
  LiveblocksProvider,
  RoomProvider,
  ClientSideSuspense,
} from "@liveblocks/react/suspense";

const PUBLIC_KEY = "pk_dev_KstT8AO1aN2quhmYhaB5bPl8aUFDrn1rQCWtp4qv6T5AuEo0TXYQT0TZvrVB4DGH";

export function LiveblocksWrapper({ children }: { children: ReactNode }) {
  return (
    <LiveblocksProvider publicApiKey={PUBLIC_KEY}>
      {children}
    </LiveblocksProvider>
  );
}

export function Room({ id, children }: { id: string; children: ReactNode }) {
  return (
    <RoomProvider id={id}>
      <ClientSideSuspense fallback={<div style={{ padding: 16, color: "var(--fleet-text-tertiary)" }}>Loading…</div>}>
        {children}
      </ClientSideSuspense>
    </RoomProvider>
  );
}
