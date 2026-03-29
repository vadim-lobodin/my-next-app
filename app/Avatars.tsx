"use client";

import { useOthers, useSelf } from "@liveblocks/react/suspense";
import { AnimatePresence, motion } from "motion/react";

const COLORS = [
  ["#E57373", "#C62828"],
  ["#F06292", "#AD1457"],
  ["#BA68C8", "#6A1B9A"],
  ["#9575CD", "#4527A0"],
  ["#7986CB", "#283593"],
  ["#64B5F6", "#1565C0"],
  ["#4FC3F7", "#0277BD"],
  ["#4DD0E1", "#00838F"],
  ["#4DB6AC", "#00695C"],
  ["#81C784", "#2E7D32"],
  ["#AED581", "#558B2F"],
  ["#FFD54F", "#F9A825"],
];

function getColor(id: number): [string, string] {
  return COLORS[Math.abs(id) % COLORS.length];
}

function getContrastingColor(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return r * 0.299 + g * 0.587 + b * 0.114 > 150 ? "#000000" : "#ffffff";
}

const MAX_OTHERS = 3;

const SIZE = 28;
const OUTLINE = 2;
const REAL_SIZE = SIZE - OUTLINE * 2;

const animationProps = {
  initial: { width: 0, transformOrigin: "left" },
  animate: { width: "auto", height: "auto" },
  exit: { width: 0 },
  transition: {
    type: "spring" as const,
    damping: 15,
    mass: 1,
    stiffness: 200,
    restSpeed: 0.01,
  },
};

function LetterAvatar({
  name,
  color,
  style,
}: {
  name: string;
  color: [string, string];
  style?: React.CSSProperties;
}) {
  const textColor = getContrastingColor(color[1]);
  return (
    <div
      style={{
        height: REAL_SIZE,
        width: REAL_SIZE,
        boxShadow: `var(--fleet-background-primary, #0d0d0f) 0 0 0 ${OUTLINE}px`,
        margin: OUTLINE,
        borderRadius: 9999,
        display: "flex",
        position: "relative",
        placeContent: "center",
        ...style,
      }}
    >
      <div
        style={{
          backgroundImage: `linear-gradient(to bottom right, ${color[0]}, ${color[1]})`,
          borderRadius: 9999,
          position: "absolute",
          inset: 0,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <span style={{ color: textColor, fontWeight: 500, fontSize: 11 }}>
          {name.charAt(0).toUpperCase()}
        </span>
      </div>
    </div>
  );
}

function MoreAvatar({ count, style }: { count: number; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        height: REAL_SIZE,
        width: REAL_SIZE,
        boxShadow: `var(--fleet-background-primary, #0d0d0f) 0 0 0 ${OUTLINE}px`,
        margin: OUTLINE,
        borderRadius: 9999,
        display: "flex",
        position: "relative",
        placeContent: "center",
        ...style,
      }}
    >
      <div
        style={{
          backgroundColor: "#6b7280",
          borderRadius: 9999,
          position: "absolute",
          inset: 0,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          color: "#fff",
          fontSize: 10,
          fontWeight: 600,
        }}
      >
        +{count}
      </div>
    </div>
  );
}

export function Avatars() {
  const others = useOthers();
  const self = useSelf();
  const hasMoreUsers = others.length > MAX_OTHERS;

  return (
    <div
      style={{
        minHeight: SIZE,
        display: "flex",
        paddingLeft: 8,
        overflow: "hidden",
        alignItems: "center",
      }}
    >
      <AnimatePresence>
        {hasMoreUsers ? (
          <motion.div key="count" {...animationProps}>
            <MoreAvatar count={others.length - MAX_OTHERS} style={{ marginLeft: "-0.35rem" }} />
          </motion.div>
        ) : null}

        {others
          .slice(0, MAX_OTHERS)
          .reverse()
          .map(({ connectionId, info }) => {
            const name = (info as any)?.name || `U${connectionId}`;
            const color = getColor(connectionId);
            return (
              <motion.div key={connectionId} {...animationProps}>
                <LetterAvatar
                  name={name}
                  color={color}
                  style={{ marginLeft: "-0.35rem" }}
                />
              </motion.div>
            );
          })}

        {self ? (
          <motion.div key="you" {...animationProps}>
            <LetterAvatar
              name={(self.info as any)?.name || "You"}
              color={getColor(self.connectionId)}
              style={{ marginLeft: "-0.35rem" }}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
