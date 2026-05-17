export interface Exercise {
  name: string;
  sets?: number;
  reps?: number;
  weight?: number;
  weightUnit?: "kg" | "lbs";
  duration?: number; // seconds
  distance?: number;
  distanceUnit?: "km" | "miles" | "m";
  notes?: string;
}

export interface WorkoutSession {
  id: string;
  userId: string;
  rawInput: string;
  title: string;
  date: string;
  durationMinutes?: number;
  exercises: Exercise[];
  muscleGroups: string[];
  notes?: string;
  createdAt: string;
}

export interface ParsedWorkout {
  title: string;
  date: string;
  durationMinutes?: number;
  exercises: Exercise[];
  muscleGroups: string[];
  notes?: string;
}
