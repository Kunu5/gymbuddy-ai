export interface ScoreBreakdown {
  sleep: number;
  stress: number;
  energy: number;
  lifestyle: number;
}

export interface DailyLog {
  id: string;
  user_id: string;
  date: string;
  sleep_hours?: number;
  energy?: number;      // 1–10
  focus?: number;       // 1–10
  stress?: number;      // 1–10
  caffeine_mg?: number;
  exercised?: boolean;
  score?: number;
  score_breakdown?: ScoreBreakdown;
  created_at: string;
}

export interface CheckInInput {
  sleep_hours: number;
  energy: number;
  focus: number;
  stress: number;
  caffeine_mg: number;
  exercised: boolean;
}
