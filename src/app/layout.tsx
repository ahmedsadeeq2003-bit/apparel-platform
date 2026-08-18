import type { Metadata } from "next";
import { anton, archivo, bebasNeue, caveat, permanentMarker, playfairDisplay } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "STITCH — Design Your Own Tee",
  description:
    "Design a custom T-shirt in your browser, order it, and we print and ship it. No account needed to browse, just to save your design.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${anton.variable} ${archivo.variable} ${playfairDisplay.variable} ${permanentMarker.variable} ${caveat.variable} ${bebasNeue.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
