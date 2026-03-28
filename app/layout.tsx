import type { Metadata } from "next";
import "@liveblocks/react-ui/styles.css";
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
    <html lang="en" className="h-full">
      <body className="h-full">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
