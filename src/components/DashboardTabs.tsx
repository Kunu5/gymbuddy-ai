"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WorkoutLogger from "@/components/WorkoutLogger";
import CoachPanel from "@/components/CoachPanel";
import ProgressTab from "@/components/ProgressTab";
import type { WorkoutSession } from "@/types/workout";
import type { CoachAnalysis } from "@/types/coach";
import type { ExerciseProgress } from "@/types/progress";

interface Props {
  initialSessions: WorkoutSession[];
  initialCoachAnalysis: CoachAnalysis | null;
  exerciseProgress: ExerciseProgress[];
}

export default function DashboardTabs({
  initialSessions,
  initialCoachAnalysis,
  exerciseProgress,
}: Props) {
  const [coachAnalysis, setCoachAnalysis] = useState<CoachAnalysis | null>(initialCoachAnalysis);
  const [activeTab, setActiveTab] = useState("log");

  function handleCoachUpdate(analysis: CoachAnalysis) {
    setCoachAnalysis(analysis);
    setActiveTab("coach");
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col gap-4">
      <TabsList>
        <TabsTrigger value="log">Log Workout</TabsTrigger>
        <TabsTrigger value="coach">Coach</TabsTrigger>
        <TabsTrigger value="progress">Progress</TabsTrigger>
      </TabsList>
      <TabsContent value="log">
        <WorkoutLogger
          initialSessions={initialSessions}
          onCoachUpdate={handleCoachUpdate}
        />
      </TabsContent>
      <TabsContent value="coach">
        <CoachPanel analysis={coachAnalysis} />
      </TabsContent>
      <TabsContent value="progress">
        <ProgressTab exercises={exerciseProgress} />
      </TabsContent>
    </Tabs>
  );
}
