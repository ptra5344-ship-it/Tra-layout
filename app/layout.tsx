import "./globals.css";
import Link from "next/link";
import type { Metadata } from "next";
import { ToastProvider } from "@/components/Toast";
export const metadata: Metadata = { title: "Tra Layout", description: "Browse Clash of Clans base layouts and open them in-game." };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en"><body>
      <ToastProvider>
        <header className="border-b border-slate-800 bg-panel"><div className="mx-auto flex max-w-6xl items-center justify-between p-4">
          <Link href="/" className="text-xl font-extrabold text-gold">⚔ Tra Layout</Link>
          <Link href="/admin" className="text-sm text-slate-400 hover:text-white">Admin</Link>
        </div></header>
        <main className="mx-auto max-w-6xl p-4">{children}</main>
        <footer className="p-6 text-center text-xs text-slate-500">Fan site. Not affiliated with Supercell. Clash of Clans is a trademark of Supercell.</footer>
      </ToastProvider>
    </body></html>
  );
}
