import { brandCopy } from "@metroskool/brand";
import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Metroskool Monitor",
    template: "%s · Metroskool Monitor",
  },
  description: `${brandCopy.positioning}. Class, attendance, and teaching monitoring.`,
};

export const viewport: Viewport = {
  themeColor: "#4B0082",
  colorScheme: "light",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
