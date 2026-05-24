import type { DailyLog } from "@/types/daily-log";
import type { WeeklyInsight } from "@/types/insight";
import { writeInsightCopy } from "@/lib/ai";

function avg(values: number[]): number {
  if (!values.length) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export async function generateInsights(logs: DailyLog[]): Promise<WeeklyInsight[]> {
  const insights: WeeklyInsight[] = [];

  const withSleep = logs.filter((l) => l.sleep_hours != null && l.focus != null);
  if (withSleep.length >= 3) {
    const shortSleep = withSleep.filter((l) => (l.sleep_hours ?? 0) < 6).map((l) => l.focus!);
    const goodSleep  = withSleep.filter((l) => (l.sleep_hours ?? 0) >= 7).map((l) => l.focus!);
    if (shortSleep.length >= 2 && goodSleep.length >= 2) {
      const drop = ((avg(goodSleep) - avg(shortSleep)) / avg(goodSleep)) * 100;
      if (drop >= 15) {
        const pct = Math.round(drop);
        const copy = await writeInsightCopy(
          "Sleep",
          "sleep under 6 hours correlates with lower focus",
          `−${pct}% focus on <6h nights`
        );
        insights.push({
          tag: "Sleep",
          headline: copy.headline,
          body: copy.body,
          stat: { val: `−${pct}%`, label: "focus on <6h nights", big: true },
          sample_size: withSleep.length,
        });
      }
    }
  }

  const withStress = logs.filter((l) => l.stress != null && l.focus != null);
  if (withStress.length >= 3) {
    const highStress = withStress.filter((l) => (l.stress ?? 0) >= 7).map((l) => l.focus!);
    const baseline   = withStress.map((l) => l.focus!);
    if (highStress.length >= 2) {
      const drop = ((avg(baseline) - avg(highStress)) / avg(baseline)) * 100;
      if (drop >= 20) {
        const pct = Math.round(drop);
        const copy = await writeInsightCopy(
          "Stress",
          "high stress days correlate with lower focus",
          `−${pct}% focus on high-stress days`
        );
        insights.push({
          tag: "Stress",
          headline: copy.headline,
          body: copy.body,
          stat: { val: `−${pct}%`, label: "focus on high-stress days" },
          sample_size: withStress.length,
        });
      }
    }
  }

  return insights;
}
