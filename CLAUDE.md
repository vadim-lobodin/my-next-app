# Claude Code — my-next-app (Prototypes)

This project contains interactive prototypes built with Air Web Components.

## Architecture

- **Prototypes** live in `app/` directory (Next.js App Router)
  - `app/page.tsx` — current multiplayer spec collaboration prototype
  - Future prototypes go in `app/<prototype-name>/page.tsx`
- **Components** come from `air-web-components` library via symlink

## Critical: Component Workflow

`src/components`, `src/lib`, `src/styles` are **symlinks** to the `air-web-components` repo at `/Users/Vadim.Lobodin/IdeaProjects/air-web-components/src/`.

### When creating new components:

1. **ALWAYS** create new component files in `air-web-components`, NOT in this repo
   - Path: `/Users/Vadim.Lobodin/IdeaProjects/air-web-components/src/components/ui/<component>.tsx`
2. **ALWAYS** export new components from `air-web-components/src/components/ui/index.ts`
3. Import in prototypes as: `import { NewComponent } from "@/components/ui"`
4. Commit to **both repos** — air-web-components (component) and my-next-app (prototype code)

### When modifying existing components:

Same rule — edit the file in air-web-components (the symlink points there anyway), commit in air-web-components repo.

### DO NOT:

- Create component files inside `my-next-app/src/` — they will end up in air-web-components via symlink
- Commit `src/components`, `src/lib`, `src/styles` to this repo — they are gitignored
- Run `npx github:JetBrains/air-web-components` locally — it will overwrite the symlinks

## Deployment (Vercel)

`prebuild` script in package.json runs `npx github:JetBrains/air-web-components` to install components before build. Push changes to air-web-components first, then push my-next-app.

## Stack

- Next.js 16 (App Router, Turbopack)
- Air Web Components (JetBrains design system)
- Liveblocks + Tiptap (collaborative editing)
- motion/react (animations)
- react-resizable-panels

## Design Rules

Follow `@AGENTS.md` from air-web-components for all component and styling guidelines.

**IMPORTANT:** Always use default component sizes. Do not pass `size="sm"` or other size overrides unless there is a specific design reason. Components are designed to look correct at their default size.
