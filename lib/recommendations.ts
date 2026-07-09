import { Clock3, Flame, Leaf, LucideIcon, ShoppingBasket, Utensils, WalletCards } from "lucide-react";
import type { RecommendationScenario } from "@/lib/schemas";

export type ScenarioDefinition = {
  id: RecommendationScenario;
  label: string;
  description: string;
  icon: LucideIcon;
};

export const scenarioDefinitions: ScenarioDefinition[] = [
  {
    id: "quick_15",
    label: "15 分钟内",
    description: "课后很饿，先解决吃饭。",
    icon: Clock3
  },
  {
    id: "low_budget",
    label: "低预算",
    description: "少花钱，食材也好买。",
    icon: WalletCards
  },
  {
    id: "pan_only",
    label: "只有平底锅",
    description: "宿舍厨房配置很朴素也能做。",
    icon: Utensils
  },
  {
    id: "tesco_friendly",
    label: "Tesco 能买齐",
    description: "优先普通英国超市可买的材料。",
    icon: ShoppingBasket
  },
  {
    id: "meal_prep",
    label: "适合带饭",
    description: "一次做两份，明天还能吃。",
    icon: Flame
  },
  {
    id: "low_smoke",
    label: "低油烟",
    description: "共用厨房友好，少爆炒。",
    icon: Leaf
  }
];

export const scenarioLabelMap = Object.fromEntries(scenarioDefinitions.map((scenario) => [scenario.id, scenario.label])) as Record<
  RecommendationScenario,
  string
>;
