import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TalentLens AI | Beyond Resume Hiring Intelligence",
  description: "An intelligent hiring platform evaluating candidates beyond traditional resumes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} antialiased dark`}>
      <body className="min-h-screen flex flex-col bg-[#030014] text-slate-200">
        <div className="absolute top-0 z-[-2] h-screen w-screen bg-[#030014] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.25),rgba(255,255,255,0))]"></div>
        <nav className="w-full glass z-50 fixed top-0 left-0 right-0 h-16 flex items-center">
          <div className="max-w-7xl mx-auto px-6 w-full flex justify-between items-center">
            <Link href="/" className="text-xl font-bold tracking-tighter flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                <span className="text-white text-xs font-black">TL</span>
              </div>
              <span className="text-white">TalentLens</span> <span className="text-purple-400">AI</span>
            </Link>
            <div className="flex gap-6 items-center">
              <Link href="/apply" className="px-5 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-sm font-medium transition-all hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]">Get Started</Link>
            </div>
          </div>
        </nav>
        <main className="flex-1 pt-24 pb-12 w-full max-w-7xl mx-auto">
          {children}
        </main>
      </body>
    </html>
  );
}
