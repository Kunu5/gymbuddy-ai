export interface NextSessionExercise {
  name: string;
  sets: number;
  reps: string;
  weight?: string | null;
}

export interface CoachAnalysis {
  neglectedMuscleGroups: string[];
  nextSession: {
    title: string;
    exercises: NextSessionExercise[];
  };
  trendObservation: string;
  generatedAt: string;
}
