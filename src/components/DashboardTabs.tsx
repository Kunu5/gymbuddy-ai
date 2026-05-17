"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WorkoutLogger from "@/components/WorkoutLogger";
import CoachPanel from "@/components/CoachPanel";
import type { WorkoutSession } from "@/types/workout";
import type { CoachAnalysis } from "@/types/coach";

interface Props {
  initialSessions: WorkoutSession[];
  initialCoachAnalysis: CoachAnalysis | null;
}

export default function DashboardTabs({ initialSessions, initialCoachAnalysis }: Props) {
  const [coachAnalysis, setCoachAnalysis] = useState<CoachAnalysis | null>(initialCoachAnalysis);
  const [activeTab, setActiveTab] = useState("log");

  function handleCoachUpdate(analysis: CoachAnalysis) {
    setCoachAnalysis(analysis);
    setActiveTab("coach");
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList>
        <TabsTrigger value="log">Log Workout</TabsTrigger>
        <TabsTrigger value="coach">Coach</TabsTrigger>
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
    </Tabs>
  );
}
