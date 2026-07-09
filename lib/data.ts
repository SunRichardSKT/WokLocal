import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";
import {
  equipmentSchema,
  guideSchema,
  recipeSchema,
  starterPackSchema,
  substitutionSchema,
  type Equipment,
  type Guide,
  type Recipe,
  type StarterPack,
  type Substitution
} from "@/lib/schemas";

const dataRoot = path.join(process.cwd(), "data");
const recipesDir = path.join(dataRoot, "recipes");
const substitutionsDir = path.join(dataRoot, "substitutions");
const equipmentDir = path.join(dataRoot, "equipment");
const guidesDir = path.join(dataRoot, "guides");
const starterPacksDir = path.join(dataRoot, "starter-packs");

function readYamlFiles<T>(dir: string, parse: (data: unknown) => T): T[] {
  if (!fs.existsSync(dir)) {
    return [];
  }

  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".yaml") || file.endsWith(".yml"))
    .sort()
    .map((file) => {
      const filePath = path.join(dir, file);
      const raw = fs.readFileSync(filePath, "utf8");
      return parse(yaml.load(raw));
    });
}

export function getSubstitutions(): Substitution[] {
  return readYamlFiles(substitutionsDir, (data) => substitutionSchema.parse(data));
}

export function getIngredients(): Substitution[] {
  return getSubstitutions().sort((a, b) => a.name_zh.localeCompare(b.name_zh, "zh-Hans-CN"));
}

export function getSubstitutionMap(): Map<string, Substitution> {
  return new Map(getSubstitutions().map((item) => [item.ingredient_id, item]));
}

export function getRecipes(): Recipe[] {
  return readYamlFiles(recipesDir, (data) => recipeSchema.parse(data)).sort((a, b) => a.time_minutes - b.time_minutes);
}

export function getRecipeById(id: string): Recipe | undefined {
  return getRecipes().find((recipe) => recipe.id === id);
}

export function getFilterValues(recipes = getRecipes()) {
  return {
    cuisines: Array.from(new Set(recipes.map((recipe) => recipe.cuisine))).sort(),
    tags: Array.from(new Set(recipes.flatMap((recipe) => recipe.tags))).sort(),
    recipeTypes: Array.from(new Set(recipes.map((recipe) => recipe.recipe_type))).sort()
  };
}

export function getRecipeTypes() {
  return getFilterValues().recipeTypes;
}

export function getEquipment(): Equipment[] {
  return readYamlFiles(equipmentDir, (data) => equipmentSchema.parse(data)).sort((a, b) => {
    if (a.is_essential !== b.is_essential) {
      return a.is_essential ? -1 : 1;
    }
    return a.name_zh.localeCompare(b.name_zh, "zh-Hans-CN");
  });
}

export function getEquipmentMap(): Map<string, Equipment> {
  return new Map(getEquipment().map((item) => [item.equipment_id, item]));
}

export function getGuides(): Guide[] {
  return readYamlFiles(guidesDir, (data) => guideSchema.parse(data));
}

export function getStarterPacks(): StarterPack[] {
  return readYamlFiles(starterPacksDir, (data) => starterPackSchema.parse(data));
}

export function getIngredientName(ingredientId: string, substitutions = getSubstitutionMap()) {
  return substitutions.get(ingredientId)?.name_zh ?? ingredientId;
}
