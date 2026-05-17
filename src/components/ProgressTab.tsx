"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ExerciseProgress } from "@/types/progress";

interface Props {
  exercises: ExerciseProgress[];
}

export default function ProgressTab({ exercises }: Props) {
  const [selected, setSelected] = useState(exercises[0]?.name ?? "");

  if (exercises.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground text-sm">
          Log a few workouts with weights to see your progress charts.
        </CardContent>
      </Card>
    );
  }

  const current = exercises.find((e) => e.name === selected) ?? exercises[0];

  return (
    <div className="space-y-6">
      {/* Exercise selector */}
      <div className="flex flex-wrap gap-2">
        {exercises.map((e) => (
          <button key={e.name} onClick={() => setSelected(e.name)}>
            <Badge variant={e.name === selected ? "default" : "outline"}>
              {e.name}
            </Badge>
          </button>
        ))}
      </div>

      {/* Weight progression chart */}
      {current && current.data.length >= 2 ? (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base capitalize">{current.name}</CardTitle>
            {current.pr && (
              <p className="text-xs text-muted-foreground">
                PR: {current.pr.weight}{current.pr.unit} on {current.pr.date}
              </p>
            )}
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={current.data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(d) => d.slice(5)}
                  stroke="hsl(var(--muted-foreground))"
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  stroke="hsl(var(--muted-foreground))"
                  unit={current.data[0]?.unit ?? "kg"}
                />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  formatter={(v) => [`${v}${current.data[0]?.unit ?? "kg"}`, "Weight"]}
                  labelFormatter={(l) => `Date: ${l}`}
                />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-6 text-center text-muted-foreground text-sm">
            Log {current.name} at least twice with weights to see a chart.
          </CardContent>
        </Card>
      )}

      {/* Personal records table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Personal Records</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {exercises
            .filter((e) => e.pr)
            .map((e) => (
              <div key={e.name} className="text-sm flex items-baseline justify-between">
                <span className="font-medium capitalize">{e.name}</span>
                <span className="text-muted-foreground text-xs">
                  {e.pr!.weight}{e.pr!.unit} · {e.pr!.date}
                </span>
              </div>
            ))}
        </CardContent>
      </Card>
    </div>
  );
}
