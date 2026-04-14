import type { Metadata } from "next";
import { JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "xterm/css/xterm.css";
import "./globals.scss";
import { TerminalDrawer } from "@/components/dev/TerminalDrawer";
import { isDevToolsEnabled } from "@/lib/dev-tools";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ship Shit Show",
  description: "YouTube channel analytics and review dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const devToolsEnabled = isDevToolsEnabled();

  return (
    <html lang="en">
      <body className={`${spaceGrotesk.variable} ${jetBrainsMono.variable}`}>
        {children}
        {devToolsEnabled ? <TerminalDrawer /> : null}
      </body>
    </html>
  );
}
