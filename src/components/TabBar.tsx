"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  {
    id: "home",
    name: "Home",
    href: "/home",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 10l9-7 9 7v10a1 1 0 0 1-1 1h-5v-7h-6v7H4a1 1 0 0 1-1-1z"/>
      </svg>
    ),
  },
  {
    id: "log",
    name: "Log",
    href: "/log",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="4" width="16" height="16" rx="3"/>
        <path d="M9 12h6M12 9v6"/>
      </svg>
    ),
  },
  {
    id: "move",
    name: "Move",
    href: "/move",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 4l3 3-3 3M18 14l-3 3 3 3M3 7h11a4 4 0 0 1 4 4v0M21 17H10a4 4 0 0 1-4-4v0"/>
      </svg>
    ),
  },
  {
    id: "insights",
    name: "Insights",
    href: "/insights",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 20V10M10 20V4M16 20v-7M22 20V8"/>
      </svg>
    ),
  },
  {
    id: "score",
    name: "Score",
    href: "/score",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9"/>
        <path d="M12 7v5l3 3"/>
      </svg>
    ),
  },
];

export default function TabBar() {
  const pathname = usePathname();

  return (
    <div style={{
      position: "fixed",
      left: 14,
      right: 14,
      bottom: 14,
      background: "rgba(26,25,22,0.92)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      border: "1px solid #2a2826",
      borderRadius: 28,
      padding: "10px 8px",
      display: "grid",
      gridTemplateColumns: "repeat(5, 1fr)",
      gap: 2,
      zIndex: 50,
    }}>
      {TABS.map((t) => {
        const isActive = pathname === t.href || (t.href !== "/home" && pathname.startsWith(t.href));
        return (
          <Link
            key={t.id}
            href={t.href}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 3,
              padding: "4px 0",
              color: isActive ? "#E8622A" : "#6B6862",
              fontSize: 9,
              fontWeight: 600,
              letterSpacing: "0.02em",
              textDecoration: "none",
              transition: "color 120ms",
            }}
          >
            {t.icon}
            <span>{t.name}</span>
          </Link>
        );
      })}
    </div>
  );
}
