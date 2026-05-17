import Groq from "groq-sdk";
import type { ParsedWorkout } from "@/types/workout";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });

const SYSTEM_PROMPT = `You are a fitness AI that parses natural language workout descriptions into structured JSON.

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

export async function parseWorkout(
  input: string,
  today: string
): Promise<ParsedWorkout> {
  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: `Today's date is ${today}.\n\nParse this workout:\n${input}` },
    ],
    response_format: { type: "json_object" },
  });

  const text = completion.choices[0].message.content ?? "";
  return JSON.parse(text) as ParsedWorkout;
}
