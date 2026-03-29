"use client";

import { Suspense } from "react";
import {
  useLiveblocksExtension,
  FloatingComposer,
  FloatingThreads,
  FloatingToolbar,
  Toolbar,
} from "@liveblocks/react-tiptap";
import { useEditor, EditorContent, Editor as TEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useThreads } from "@liveblocks/react/suspense";
import { Icon } from "@/components/ui";

function Threads({ editor }: { editor: TEditor | null }) {
  const { threads } = useThreads();
  if (!threads || !editor) return null;
  return <FloatingThreads threads={threads} editor={editor} />;
}

export function Editor() {
  const liveblocks = useLiveblocksExtension();

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      liveblocks,
      StarterKit.configure({
        undoRedo: false,
      }),
    ],
  });

  return (
    <div className="h-full flex flex-col" style={{ color: "var(--fleet-text-primary)", position: "relative" }}>
      <Toolbar editor={editor} />
      <div className="flex-1 min-h-0 overflow-y-auto p-4">
        <EditorContent editor={editor} className="editor" />
      </div>
      <FloatingToolbar editor={editor}>
        <Toolbar.Button
          name="comment"
          onClick={() => editor?.chain().focus().addPendingComment().run()}
        >
          <Icon fleet="add-comment" size="sm" />
          <span style={{ marginLeft: 6 }}>Comment</span>
        </Toolbar.Button>
      </FloatingToolbar>
      <FloatingComposer editor={editor} style={{ width: 350 }} />
      <Suspense fallback={null}>
        <Threads editor={editor} />
      </Suspense>
    </div>
  );
}
