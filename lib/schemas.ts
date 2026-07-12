import { z } from "zod";
import { supportedRegionKeys } from "@/lib/regions";

const regionKeySchema = z.enum(supportedRegionKeys as [string, ...string[]]);

export const substitutionRegionSchema = z.object({
  substitute: z.string().min(1),
  where_to_buy: z.string().min(1),
  usage_note: z.string().min(1).optional(),
  similarity: z.number().int().min(1).max(5)
});

export const substitutionSchema = z.object({
  ingredient_id: z.string().min(1).regex(/^[a-z0-9-]+$/),
  name_zh: z.string().min(1),
  name_en: z.string().min(1),
  pinyin: z.string().min(1).optional(),
  category: z.string().min(1),
  aliases_zh: z.array(z.string().min(1)).default([]),
  aliases_en: z.array(z.string().min(1)).default([]),
  aliases_pinyin: z.array(z.string().min(1)).default([]),
  search_keywords: z.array(z.string().min(1)).default([]),
  common_uses: z.array(z.string().min(1)).default([]),
  regions: z.record(regionKeySchema, substitutionRegionSchema).default({})
});

export const videoLinkSchema = z.object({
  platform: z.enum(["bilibili", "youtube", "xiaohongshu", "other"]),
  title: z.string().min(1),
  url: z.string().url()
});

export const imageAssetSchema = z.object({
  src: z.string().min(1),
  alt: z.string().min(1),
  caption: z.string().min(1).optional(),
  credit: z.string().min(1).optional(),
  credit_url: z.string().url().optional(),
  license: z.string().min(1).optional(),
  license_url: z.string().url().optional()
});

export const ingredientRefSchema = z
  .object({
    ingredient_id: z.string().min(1).regex(/^[a-z0-9-]+$/),
    name_zh: z.string().min(1).optional(),
    name_en: z.string().min(1).optional(),
    amount: z.string().min(1),
    optional: z.boolean().default(false),
    note: z.string().min(1).optional()
  })
  .refine((ingredient) => ingredient.ingredient_id || ingredient.name_zh, {
    message: "Ingredient must include ingredient_id or name_zh"
  });

export const recipeStepSchema = z.object({
  order: z.number().int().positive(),
  instruction: z.string().min(1),
  tip: z.string().min(1).optional(),
  image: imageAssetSchema.optional(),
  highlights: z
    .array(
      z.object({
        type: z.enum(["ingredient", "equipment"]),
        id: z.string().min(1).regex(/^[a-z0-9-]+$/),
        label: z.string().min(1).optional()
      })
    )
    .default([])
});

export const recommendationScenarioSchema = z.enum(["quick_15", "low_budget", "pan_only", "tesco_friendly", "meal_prep", "low_smoke"]);

export const recipeSchema = z.object({
  id: z.string().min(1).regex(/^[a-z0-9-]+$/),
  name: z.object({
    zh: z.string().min(1),
    pinyin: z.string().min(1),
    en: z.string().min(1)
  }),
  description: z.string().min(1),
  cover_image: imageAssetSchema.optional(),
  difficulty: z.number().int().min(1).max(5),
  time_minutes: z.number().int().positive(),
  servings: z.number().int().positive(),
  cuisine: z.string().min(1),
  recipe_type: z.enum(["chinese", "fusion", "local_adapted"]),
  budget_level: z.enum(["low", "medium", "high"]).default("medium"),
  scenarios: z.array(recommendationScenarioSchema).min(1),
  tags: z.array(z.string().min(1)).min(1),
  equipment: z.object({
    required_ids: z.array(z.string().min(1).regex(/^[a-z0-9-]+$/)).default([]),
    required: z.array(z.string().min(1)).min(1),
    substitutes_if_missing: z.string().min(1).optional()
  }),
  base_ingredients: z.array(ingredientRefSchema).min(1),
  steps: z.array(recipeStepSchema).min(1),
  video_links: z.array(videoLinkSchema).default([]),
  common_mistakes: z.array(z.string().min(1)).default([])
});

export const equipmentRegionSchema = z.object({
  where_to_buy: z.string().min(1),
  price_range: z.string().min(1),
  notes: z.string().min(1).optional()
});

export const equipmentSchema = z.object({
  equipment_id: z.string().min(1).regex(/^[a-z0-9-]+$/),
  name_zh: z.string().min(1),
  name_en: z.string().min(1),
  category: z.enum(["must_have", "optional_upgrade", "dorm_friendly", "avoid_first"]),
  budget_level: z.enum(["low", "medium", "high"]),
  is_essential: z.boolean(),
  use_cases: z.array(z.string().min(1)).min(1),
  substitutes_if_missing: z.array(z.string().min(1)).default([]),
  regions: z.record(regionKeySchema, equipmentRegionSchema).default({})
});

export const guideSectionSchema = z.object({
  title: z.string().min(1),
  items: z.array(z.string().min(1)).min(1)
});

export const supermarketSchema = z.object({
  name: z.string().min(1),
  kind: z.enum(["budget", "mainstream", "specialty", "premium", "bulk", "asian"]),
  price_level: z.enum(["low", "medium", "high", "mixed"]),
  best_for: z.array(z.string().min(1)).min(1),
  membership: z.string().min(1).optional(),
  note: z.string().min(1)
});

export const guideSchema = z.object({
  guide_id: z.string().min(1).regex(/^[a-z0-9-]+$/),
  region: regionKeySchema,
  title: z.string().min(1),
  summary: z.string().min(1),
  sections: z.array(guideSectionSchema).min(1),
  supermarkets: z.array(supermarketSchema).default([])
});

export const starterPackItemSchema = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  where_to_buy: z.array(z.string().min(1)).min(1),
  estimated_budget: z.string().min(1),
  note: z.string().min(1).optional()
});

export const starterPackSectionSchema = z.object({
  title: z.string().min(1),
  priority: z.enum(["today", "three_days", "optional"]),
  items: z.array(starterPackItemSchema).min(1)
});

export const starterPackSchema = z.object({
  pack_id: z.string().min(1).regex(/^[a-z0-9-]+$/),
  region: regionKeySchema,
  title: z.string().min(1),
  summary: z.string().min(1),
  sections: z.array(starterPackSectionSchema).min(1)
});

export type SubstitutionRegion = z.infer<typeof substitutionRegionSchema>;
export type Substitution = z.infer<typeof substitutionSchema>;
export type VideoLink = z.infer<typeof videoLinkSchema>;
export type ImageAsset = z.infer<typeof imageAssetSchema>;
export type RecommendationScenario = z.infer<typeof recommendationScenarioSchema>;
export type IngredientRef = z.infer<typeof ingredientRefSchema>;
export type RecipeStep = z.infer<typeof recipeStepSchema>;
export type Recipe = z.infer<typeof recipeSchema>;
export type EquipmentRegion = z.infer<typeof equipmentRegionSchema>;
export type Equipment = z.infer<typeof equipmentSchema>;
export type Supermarket = z.infer<typeof supermarketSchema>;
export type Guide = z.infer<typeof guideSchema>;
export type StarterPack = z.infer<typeof starterPackSchema>;
