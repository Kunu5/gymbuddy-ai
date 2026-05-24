export interface InsightStat {
  val: string;
  label: string;
  big?: boolean;
}

export interface WeeklyInsight {
  tag: string;
  headline: string;
  body: string;
  stat: InsightStat;
  sample_size?: number;
}

export interface WeeklyReport {
  id: string;
  user_id: string;
  week_start: string;
  insights: WeeklyInsight[];
  generated_at: string;
}
