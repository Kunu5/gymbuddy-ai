export interface MealItem {
  name: string;
  qty?: string;
  calories?: number;
  macros?: {
    protein?: number;
    carbs?: number;
    fat?: number;
  };
}

export interface Meal {
  id: string;
  user_id: string;
  logged_at: string;
  raw_input?: string;
  photo_url?: string;
  items: MealItem[];
  ai_tag?: string;
  ai_tag_kind?: "positive" | "warn" | "neutral";
}

export interface ParsedMeal {
  items: MealItem[];
  ai_tag: string;
  ai_tag_kind: "positive" | "warn" | "neutral";
}
