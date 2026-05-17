import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { CoachAnalysis } from "@/types/coach";

interface Props {
  analysis: CoachAnalysis | null;
}

export default function CoachPanel({ analysis }: Props) {
  if (!analysis) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground text-sm">
          Log a workout to get your first coaching report.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {analysis.neglectedMuscleGroups.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Neglected Muscle Groups</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {analysis.neglectedMuscleGroups.map((mg) => (
              <Badge key={mg} variant="destructive">
                {mg}
              </Badge>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Recommended Next Session</CardTitle>
          <p className="text-sm text-muted-foreground">{analysis.nextSession.title}</p>
        </CardHeader>
        <CardContent className="space-y-2">
          <Separator />
          {analysis.nextSession.exercises.map((ex, i) => (
            <div key={i} className="text-sm flex items-baseline justify-between">
              <span className="font-medium">{ex.name}</span>
              <span className="text-muted-foreground text-xs">
                {[
                  `${ex.sets}×${ex.reps}`,
                  ex.weight,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{analysis.trendObservation}</p>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground text-right">
        Updated {new Date(analysis.generatedAt).toLocaleString()}
      </p>
    </div>
  );
}
