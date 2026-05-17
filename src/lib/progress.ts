import type { ExerciseProgress, StreakInfo } from "@/types/progress";

type RawSession = {
  date: string;
  exercises: Array<{
    name: string;
    weight?: number;
    weightUnit?: string;
    sets?: number;
    reps?: number;
  }>;
  muscle_groups: string[];
};

export function buildExerciseProgress(sessions: RawSession[]): ExerciseProgress[] {
  const map = new Map<string, ExerciseProgress>();

  const sorted = [...sessions].sort((a, b) => a.date.localeCompare(b.date));

  for (const session of sorted) {
    for (const ex of session.exercises ?? []) {
      if (!ex.name || !ex.weight) continue;

      const key = ex.name.toLowerCase();
      if (!map.has(key)) {
        map.set(key, { name: ex.name, data: [], pr: null });
      }
      const entry = map.get(key)!;
      const unit = ex.weightUnit ?? "kg";

      entry.data.push({ date: session.date, weight: ex.weight, unit });

      if (!entry.pr || ex.weight > entry.pr.weight) {
        entry.pr = { weight: ex.weight, unit, date: session.date };
      }
    }
  }

  // Return exercises with at least 2 data points first, sorted by frequency
  return Array.from(map.values())
    .filter((e) => e.data.length >= 1)
    .sort((a, b) => b.data.length - a.data.length)
    .slice(0, 8);
}

export function calculateStreak(sessions: Array<{ date: string }>): StreakInfo {
  if (sessions.length === 0) return { current: 0, longest: 0 };

  const dates = Array.from(new Set(sessions.map((s) => s.date))).sort().reverse();

  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  if (dates[0] !== today && dates[0] !== yesterday) {
    return { current: 0, longest: calcLongest(dates) };
  }

  let current = 1;
  for (let i = 1; i < dates.length; i++) {
    const a = new Date(dates[i - 1]);
    const b = new Date(dates[i]);
    const diff = Math.round((a.getTime() - b.getTime()) / 86400000);
    if (diff === 1) current++;
    else break;
  }

  return { current, longest: Math.max(current, calcLongest(dates)) };
}

function calcLongest(sortedDesc: string[]): number {
  let longest = 1;
  let run = 1;
  for (let i = 1; i < sortedDesc.length; i++) {
    const a = new Date(sortedDesc[i - 1]);
    const b = new Date(sortedDesc[i]);
    const diff = Math.round((a.getTime() - b.getTime()) / 86400000);
    if (diff === 1) { run++; longest = Math.max(longest, run); }
    else run = 1;
  }
  return longest;
}
