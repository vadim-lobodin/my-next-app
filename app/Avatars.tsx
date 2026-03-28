"use client";

import { useOthers, useSelf } from "@liveblocks/react/suspense";

const COLORS = [
  "#E57373", "#F06292", "#BA68C8", "#9575CD",
  "#7986CB", "#64B5F6", "#4FC3F7", "#4DD0E1",
  "#4DB6AC", "#81C784", "#AED581", "#FFD54F",
];

function getColorFromId(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLORS[Math.abs(hash) % COLORS.length];
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function Avatars() {
  const others = useOthers();
  const self = useSelf();

  return (
    <div className="flex items-center -space-x-2">
      {others.map(({ connectionId, info }) => {
        const name = (info as any)?.name || `User ${connectionId}`;
        const color = (info as any)?.color || getColorFromId(String(connectionId));
        return (
          <div
            key={connectionId}
            className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold text-white border-2 border-[var(--fleet-background-primary)]"
            style={{ background: color }}
            title={name}
          >
            {getInitials(name)}
          </div>
        );
      })}
      {self && (
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold text-white border-2 border-[var(--fleet-background-primary)]"
          style={{ background: (self.info as any)?.color || "#64B5F6" }}
          title="You"
        >
          {getInitials((self.info as any)?.name || "You")}
        </div>
      )}
    </div>
  );
}
