import Groq from "groq-sdk";
import type { CoachAnalysis } from "@/types/coach";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });

const SYSTEM_PROMPT = `You are an expert personal fitness coach. Analyze the user's last 30 days of workout history and return coaching feedback.

Return ONLY a JSON object with this exact shape:
{
  "neglectedMuscleGroups": ["string"] — muscle groups not trained or clearly undertrained compared to others,
  "nextSession": {
    "title": "string — short descriptive session title",
    "exercises": [
      {
        "name": "string",
        "sets": number,
        "reps": "string — e.g. '8-10' or '12'",
        "weight": "string | null — e.g. '80kg', 'bodyweight', '+5kg from last time'"
      }
    ]
  },
  "trendObservation": "string — one concise sentence about their training trend (volume, frequency, balance, or progression)"
}

If there is no workout history, recommend a balanced beginner full-body session and note that there is no data yet.`;

type RawSession = {
  title: string;
  date: string;
  muscle_groups: string[];
  exercises: unknown;
  duration_minutes: number | null;
};

export async function analyzeCoach(
  sessions: RawSession[]
): Promise<Omit<CoachAnalysis, "generatedAt">> {
  const summary = sessions.map((s) => ({
    date: s.date,
    title: s.title,
    muscleGroups: s.muscle_groups,
    exercises: s.exercises,
    durationMinutes: s.duration_minutes,
  }));

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `Workout history (last 30 days):\n\n${JSON.stringify(summary, null, 2)}\n\nProvide coaching analysis.`,
      },
    ],
    response_format: { type: "json_object" },
  });

  const text = completion.choices[0].message.content ?? "{}";
  return JSON.parse(text);
}
