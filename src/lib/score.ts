import type { CheckInInput, ScoreBreakdown } from "@/types/daily-log";

export function computeScore(log: CheckInInput): { score: number; breakdown: ScoreBreakdown } {
  const sleep     = Math.min((log.sleep_hours ?? 0) / 8, 1) * 30;
  const stress    = (1 - ((log.stress ?? 5) - 1) / 9) * 25;
  const energy    = (((log.energy ?? 5) - 1) / 9) * 25;
  const lifestyle =
    (log.exercised ? 10 : 0) +
    (log.caffeine_mg != null && log.caffeine_mg < 200 ? 6 : 2) +
    (((log.focus ?? 5) - 1) / 9) * 4;

  const score = Math.round(sleep + stress + energy + lifestyle);
  return {
    score,
    breakdown: {
      sleep:     Math.round(sleep),
      stress:    Math.round(stress),
      energy:    Math.round(energy),
      lifestyle: Math.round(lifestyle),
    },
  };
}
