import type { Metadata } from "next";
import "./globals.css";
import { getSession } from "@/lib/auth";
import Link from "next/link";
import { logoutAction } from "./actions/auth";

export const metadata: Metadata = {
  title: "Bug Tracker Pro",
  description: "A centralized place to capture, triage, and follow defects.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();

  return (
    <html lang="en">
      <body className="animate-fade-in">
        {session && (
          <nav style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "1rem 2rem",
            background: "var(--bg-card)",
            borderBottom: "1px solid var(--border-light)",
            position: "sticky",
            top: 0,
            zIndex: 50
          }}>
            <Link href="/bugs" style={{
              fontSize: "1.25rem",
              fontWeight: 700,
              background: "linear-gradient(to right, #4facfe 0%, #00f2fe 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}>
              Bug Tracker
            </Link>
            
            <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
              <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
                {session.email}
              </span>
              <form action={logoutAction}>
                <button type="submit" style={{
                  color: "var(--danger)",
                  fontSize: "0.9rem",
                  fontWeight: 500
                }}>
                  Sign Out
                </button>
              </form>
            </div>
          </nav>
        )}
        <main>{children}</main>
      </body>
    </html>
  );
}
