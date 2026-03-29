import type { Metadata } from "next";
import "@liveblocks/react-ui/styles.css";
import "@liveblocks/react-ui/styles/dark/attributes.css";
import "@liveblocks/react-tiptap/styles.css";
import "@/styles/globals.css";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "Air App",
  description: "Built with Air Web Components",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full dark" data-theme="dark">
      <body className="h-full" style={{ transform: "scale(1.1)", transformOrigin: "0 0", width: "90.91vw", height: "90.91vh", overflow: "hidden" }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
