export interface ExerciseDataPoint {
  date: string;
  weight: number;
  unit: string;
}

export interface ExerciseProgress {
  name: string;
  data: ExerciseDataPoint[];
  pr: { weight: number; unit: string; date: string } | null;
}

export interface StreakInfo {
  current: number;
  longest: number;
}
