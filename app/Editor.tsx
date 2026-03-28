"use client";

import { useLiveblocksExtension, FloatingToolbar } from "@liveblocks/react-tiptap";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Threads } from "./Threads";

export function Editor() {
  const liveblocks = useLiveblocksExtension();

  const editor = useEditor({
    extensions: [
      liveblocks,
      StarterKit.configure({
        history: false,
      } as any),
    ],
    immediatelyRender: false,
  });

  return (
    <div className="h-full flex flex-col" style={{ color: "var(--fleet-text-primary)" }}>
      <EditorContent editor={editor} className="editor flex-1 overflow-y-auto p-4" />
      <Threads editor={editor} />
      <FloatingToolbar editor={editor} />
    </div>
  );
}
