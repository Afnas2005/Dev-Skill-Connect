import type { Metadata } from "next";
import { DM_Sans, Sora } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import { PageTransition } from "@/components/motion/page-transition";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DevSkill Connect",
  description: "Developer Platform for Skills and Connections",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${dmSans.variable} ${sora.variable} min-h-screen bg-[var(--app-bg)] text-[var(--app-text)] antialiased selection:bg-[#dbeafe] selection:text-[#0f172a] flex flex-col`}
      >
        <Providers>
          <main className="flex-1 flex flex-col">
            <PageTransition>{children}</PageTransition>
          </main>
        </Providers>
      </body>
    </html>
  );
}
