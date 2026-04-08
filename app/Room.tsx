"use client";

import { ReactNode } from "react";
import {
  LiveblocksProvider,
  RoomProvider,
  ClientSideSuspense,
} from "@liveblocks/react/suspense";

export function LiveblocksWrapper({ children }: { children: ReactNode }) {
  return (
    <LiveblocksProvider authEndpoint="/api/liveblocks-auth" badgeLocation="bottom-left">
      {children}
    </LiveblocksProvider>
  );
}

export function Room({ id, children }: { id: string; children: ReactNode }) {
  return (
    <RoomProvider id={id}>
      <ClientSideSuspense fallback={null}>
        {children}
      </ClientSideSuspense>
    </RoomProvider>
  );
}
