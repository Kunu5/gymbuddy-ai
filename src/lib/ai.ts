import Groq from "groq-sdk";
import type { ParsedWorkout } from "@/types/workout";
import type { ParsedMeal } from "@/types/meal";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });
const MODEL = "llama-3.3-70b-versatile";

// ── Workout parser ───────────────────────────────────────────

const WORKOUT_SYSTEM = `You are a fitness AI that parses natural language workout descriptions into structured JSON.

Extract exercises, sets, reps, weights, duration, distances, and muscle groups.
Infer reasonable values when ambiguous. Always return valid JSON matching the schema.

Return ONLY a JSON object with this exact shape:
{
  "title": "string — short descriptive title (e.g. 'Upper Body Strength')",
  "date": "string — ISO date YYYY-MM-DD (use today if not mentioned)",
  "durationMinutes": number | null,
  "exercises": [
    {
      "name": "string",
      "sets": number | null,
      "reps": number | null,
      "weight": number | null,
      "weightUnit": "kg" | "lbs" | null,
      "duration": number | null,
      "distance": number | null,
      "distanceUnit": "km" | "miles" | "m" | null,
      "notes": "string | null"
    }
  ],
  "muscleGroups": ["string"],
  "notes": "string | null"
}`;

export async function parseWorkout(input: string, today: string): Promise<ParsedWorkout> {
  const completion = await groq.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: WORKOUT_SYSTEM },
      { role: "user", content: `Today's date is ${today}.\n\nParse this workout:\n${input}` },
    ],
    response_format: { type: "json_object" },
  });
  return JSON.parse(completion.choices[0].message.content ?? "{}") as ParsedWorkout;
}

// ── Meal parser ──────────────────────────────────────────────

const MEAL_SYSTEM = `You are a nutrition AI. Parse a natural-language meal description into structured JSON.
Tag the meal based on cognitive impact.

Return ONLY a JSON object:
{
  "items": [{ "name": "string", "qty": "string | null" }],
  "ai_tag": "Boosts focus" | "May cause brain fog" | "Neutral",
  "ai_tag_kind": "positive" | "warn" | "neutral"
}

Rules for tagging:
- "Boosts focus" / positive: protein-rich, omega-3s, leafy greens, berries, nuts, eggs
- "May cause brain fog" / warn: high sugar, alcohol, heavy refined carbs, fried food
- "Neutral" / neutral: mixed or unclear`;

export async function parseMeal(input: string): Promise<ParsedMeal> {
  const completion = await groq.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: MEAL_SYSTEM },
      { role: "user", content: `Parse this meal: ${input}` },
    ],
    response_format: { type: "json_object" },
  });
  return JSON.parse(completion.choices[0].message.content ?? "{}") as ParsedMeal;
}

// ── Workout recommendation ───────────────────────────────────

export async function recommendWorkout(recentSessions: string): Promise<{
  title: string;
  description: string;
  duration_minutes: number;
  type: string;
}> {
  const completion = await groq.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: "system",
        content: `You are a fitness coach AI. Given a user's recent workout history, recommend a single workout for today that will likely improve tomorrow's cognitive score.

Return ONLY a JSON object:
{
  "title": "short workout name (e.g. '30-min zone 2 walk')",
  "description": "2-3 sentences explaining why this workout, referencing their recent data. Be specific but hedged ('likely to lift your score' not 'will lift your score by X pts').",
  "duration_minutes": number,
  "type": "walk" | "strength" | "run" | "yoga" | "cycle" | "stretch"
}`,
      },
      { role: "user", content: `Recent workouts (last 7 days):\n${recentSessions}` },
    ],
    response_format: { type: "json_object" },
  });
  return JSON.parse(completion.choices[0].message.content ?? "{}");
}

// ── Weekly insights copy writer ──────────────────────────────

export async function writeInsightCopy(
  tag: string,
  pattern: string,
  stat: string
): Promise<{ headline: string; body: string }> {
  const completion = await groq.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: "system",
        content: `You write short, data-backed insight copy for a cognitive performance app.
Pattern: "${pattern}"
Stat: "${stat}"
Tag: "${tag}"

Return ONLY a JSON object:
{
  "headline": "one punchy sentence (max 12 words) naming the pattern",
  "body": "2 sentences explaining what the data shows. Be specific, cite the stat, stay hedged."
}`,
      },
      { role: "user", content: "Write the insight." },
    ],
    response_format: { type: "json_object" },
  });
  return JSON.parse(completion.choices[0].message.content ?? "{}");
}
