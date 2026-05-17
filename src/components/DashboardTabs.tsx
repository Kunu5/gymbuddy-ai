"use client";

import { useState } from "react";
import { Mic, Zap, TrendingUp, Flame } from "lucide-react";
import WorkoutLogger from "@/components/WorkoutLogger";
import CoachPanel from "@/components/CoachPanel";
import ProgressTab from "@/components/ProgressTab";
import type { WorkoutSession } from "@/types/workout";
import type { CoachAnalysis } from "@/types/coach";
import type { ExerciseProgress, StreakInfo } from "@/types/progress";

interface Props {
  initialSessions: WorkoutSession[];
  initialCoachAnalysis: CoachAnalysis | null;
  exerciseProgress: ExerciseProgress[];
  streak: StreakInfo;
  sessionCount: number;
  userEmail: string;
  userInitials: string;
}

const TABS = [
  { key: "log",      label: "Log workout", short: "Log",      icon: <Mic size={15}/> },
  { key: "coach",    label: "Coach",       short: "Coach",    icon: <Zap size={15}/> },
  { key: "progress", label: "Progress",    short: "Progress", icon: <TrendingUp size={15}/> },
];

const PAGE_TITLE: Record<string, string> = {
  log: "Log a workout.",
  coach: "Your coach.",
  progress: "Progress.",
};

export default function DashboardTabs({
  initialSessions,
  initialCoachAnalysis,
  exerciseProgress,
  streak,
  sessionCount,
  userEmail,
  userInitials,
}: Props) {
  const [activeTab, setActiveTab] = useState("log");
  const [coachAnalysis, setCoachAnalysis] = useState<CoachAnalysis | null>(initialCoachAnalysis);

  function handleCoachUpdate(analysis: CoachAnalysis) {
    setCoachAnalysis(analysis);
    setActiveTab("coach");
  }

  const dateLabel = new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

  return (
    <div className="md:grid min-h-screen" style={{ gridTemplateColumns: '220px 1fr' }}>

      {/* ── Desktop sidebar ─────────────────────────────────── */}
      <aside className="hidden md:flex flex-col gap-7" style={{
        borderRight: '1px solid var(--border)',
        padding: '22px 16px',
        background: 'color-mix(in oklab, var(--background) 60%, var(--surface-1))',
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 6px' }}>
          <div style={{ width: 26, height: 26, borderRadius: 6, background: 'var(--primary)', display: 'grid', placeItems: 'center', color: 'var(--primary-foreground)' }}>
            <Zap size={14} strokeWidth={2.5}/>
          </div>
          <span style={{ fontWeight: 700, fontSize: 14, letterSpacing: '-0.01em' }}>GymBuddy</span>
        </div>

        {/* Nav */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {TABS.map((t) => (
            <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '8px 10px', borderRadius: 8,
              background: activeTab === t.key ? 'var(--muted)' : 'transparent',
              color: activeTab === t.key ? 'var(--foreground)' : 'var(--muted-foreground)',
              border: 'none', cursor: 'pointer',
              fontFamily: 'inherit', fontSize: 13, fontWeight: 500,
              textAlign: 'left', transition: 'background 100ms, color 100ms',
            }}>
              <span style={{ color: activeTab === t.key ? 'var(--primary)' : 'var(--muted-foreground)' }}>
                {t.icon}
              </span>
              {t.label}
            </button>
          ))}
        </nav>

        {/* Streak card */}
        {streak.current > 0 && (
          <div style={{
            background: 'color-mix(in oklab, var(--warning) 12%, transparent)',
            border: '1px solid color-mix(in oklab, var(--warning) 24%, transparent)',
            borderRadius: 10, padding: 12,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--warning)' }}>
              <Flame size={13}/>
              <span className="eyebrow" style={{ color: 'inherit' }}>Streak</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 6 }}>
              <span className="metric" style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--warning)' }}>
                {streak.current}
              </span>
              <span style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>days</span>
            </div>
            {streak.longest > streak.current && (
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted-foreground)', marginTop: 4 }}>
                Best · {streak.longest}
              </div>
            )}
          </div>
        )}

        {/* User pill */}
        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 10, padding: '8px 6px' }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, oklch(0.92 0.22 122), oklch(0.78 0.14 232))', color: '#000', display: 'grid', placeItems: 'center', fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>
            {userInitials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userEmail}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted-foreground)' }}>synced</div>
          </div>
        </div>
      </aside>

      {/* ── Main column ─────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

        {/* Mobile top bar */}
        <div className="md:hidden" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 18px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 22, height: 22, borderRadius: 5, background: 'var(--primary)', display: 'grid', placeItems: 'center', color: 'var(--primary-foreground)' }}>
              <Zap size={13} strokeWidth={2.5}/>
            </div>
            <span style={{ fontWeight: 600, fontSize: 14, letterSpacing: '-0.01em' }}>GymBuddy</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {streak.current > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'color-mix(in oklab, var(--warning) 14%, transparent)', color: 'var(--warning)', border: '1px solid color-mix(in oklab, var(--warning) 24%, transparent)', borderRadius: 999, padding: '3px 8px', fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600 }}>
                <Flame size={11} strokeWidth={2.4}/> {streak.current}
              </div>
            )}
            <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'linear-gradient(135deg, oklch(0.92 0.22 122), oklch(0.78 0.14 232))', color: '#000', display: 'grid', placeItems: 'center', fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700 }}>
              {userInitials}
            </div>
          </div>
        </div>

        {/* Page title */}
        <div style={{ padding: '20px 18px 0' }} className="md:hidden">
          <div className="eyebrow">{dateLabel}</div>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.025em', margin: '6px 0 0', lineHeight: 1.05 }}>
            {PAGE_TITLE[activeTab]}
          </h1>
        </div>
        <div style={{ padding: '28px 32px 0' }} className="hidden md:block">
          <div className="eyebrow">{dateLabel}</div>
          <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.03em', margin: '6px 0 0', lineHeight: 1.05 }}>
            {PAGE_TITLE[activeTab]}
          </h1>
        </div>

        {/* Mobile segmented control */}
        <div className="md:hidden" style={{ padding: '16px 18px 0' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4, background: 'var(--surface-1)', boxShadow: 'inset 0 0 0 1px var(--border)', borderRadius: 10, padding: 4 }}>
            {TABS.map((t) => (
              <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
                height: 32, borderRadius: 7, border: 'none',
                background: activeTab === t.key ? 'var(--primary)' : 'transparent',
                color: activeTab === t.key ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
                fontFamily: 'inherit', fontSize: 12, fontWeight: 600,
                cursor: 'pointer', transition: 'background 120ms, color 120ms',
              }}>
                {t.short}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <div style={{ flex: 1, padding: '20px 18px 32px' }} className="md:hidden">
          {activeTab === "log"      && <WorkoutLogger initialSessions={initialSessions} onCoachUpdate={handleCoachUpdate}/>}
          {activeTab === "coach"    && <CoachPanel analysis={coachAnalysis}/>}
          {activeTab === "progress" && <ProgressTab exercises={exerciseProgress} sessionCount={sessionCount}/>}
        </div>
        <div style={{ flex: 1, padding: '24px 32px 40px' }} className="hidden md:block">
          {activeTab === "log"      && <WorkoutLogger initialSessions={initialSessions} onCoachUpdate={handleCoachUpdate}/>}
          {activeTab === "coach"    && <CoachPanel analysis={coachAnalysis}/>}
          {activeTab === "progress" && <ProgressTab exercises={exerciseProgress} sessionCount={sessionCount}/>}
        </div>
      </div>
    </div>
  );
}
