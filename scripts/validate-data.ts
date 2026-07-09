import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";
import { equipmentSchema, guideSchema, recipeSchema, starterPackSchema, substitutionSchema } from "@/lib/schemas";

type ValidationIssue = {
  file: string;
  message: string;
};

const root = process.cwd();
const dataRoot = path.join(root, "data");
const substitutionsDir = path.join(dataRoot, "substitutions");
const recipesDir = path.join(dataRoot, "recipes");
const equipmentDir = path.join(dataRoot, "equipment");
const guidesDir = path.join(dataRoot, "guides");
const starterPacksDir = path.join(dataRoot, "starter-packs");
const issues: ValidationIssue[] = [];

function yamlFiles(dir: string) {
  if (!fs.existsSync(dir)) {
    issues.push({ file: dir, message: "Directory does not exist" });
    return [];
  }

  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".yaml") || file.endsWith(".yml"))
    .map((file) => path.join(dir, file));
}

function readYaml(file: string) {
  try {
    return yaml.load(fs.readFileSync(file, "utf8"));
  } catch (error) {
    issues.push({ file, message: error instanceof Error ? error.message : "Failed to parse YAML" });
    return undefined;
  }
}

const substitutions = new Map<string, ReturnType<typeof substitutionSchema.parse>>();

for (const file of yamlFiles(substitutionsDir)) {
  const parsed = substitutionSchema.safeParse(readYaml(file));
  if (!parsed.success) {
    issues.push({ file, message: parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ") });
    continue;
  }

  if (substitutions.has(parsed.data.ingredient_id)) {
    issues.push({ file, message: `Duplicate ingredient_id "${parsed.data.ingredient_id}"` });
  }
  const searchableText = parsed.data.search_keywords.join(" ").toLowerCase();
  if (!searchableText.includes(parsed.data.name_zh.toLowerCase()) && !searchableText.includes(parsed.data.name_en.toLowerCase())) {
    issues.push({ file, message: "search_keywords must include the Chinese or English name for reliable search" });
  }
  substitutions.set(parsed.data.ingredient_id, parsed.data);
}

const recipeIds = new Set<string>();
const equipment = new Map<string, ReturnType<typeof equipmentSchema.parse>>();

for (const file of yamlFiles(equipmentDir)) {
  const parsed = equipmentSchema.safeParse(readYaml(file));
  if (!parsed.success) {
    issues.push({ file, message: parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ") });
    continue;
  }

  if (equipment.has(parsed.data.equipment_id)) {
    issues.push({ file, message: `Duplicate equipment_id "${parsed.data.equipment_id}"` });
  }
  equipment.set(parsed.data.equipment_id, parsed.data);
}

const guideIds = new Set<string>();

for (const file of yamlFiles(guidesDir)) {
  const parsed = guideSchema.safeParse(readYaml(file));
  if (!parsed.success) {
    issues.push({ file, message: parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ") });
    continue;
  }

  if (guideIds.has(parsed.data.guide_id)) {
    issues.push({ file, message: `Duplicate guide_id "${parsed.data.guide_id}"` });
  }
  guideIds.add(parsed.data.guide_id);
}

const starterPackIds = new Set<string>();

for (const file of yamlFiles(starterPacksDir)) {
  const parsed = starterPackSchema.safeParse(readYaml(file));
  if (!parsed.success) {
    issues.push({ file, message: parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ") });
    continue;
  }

  if (starterPackIds.has(parsed.data.pack_id)) {
    issues.push({ file, message: `Duplicate pack_id "${parsed.data.pack_id}"` });
  }
  starterPackIds.add(parsed.data.pack_id);
}

for (const file of yamlFiles(recipesDir)) {
  const parsed = recipeSchema.safeParse(readYaml(file));
  if (!parsed.success) {
    issues.push({ file, message: parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ") });
    continue;
  }

  if (recipeIds.has(parsed.data.id)) {
    issues.push({ file, message: `Duplicate recipe id "${parsed.data.id}"` });
  }
  recipeIds.add(parsed.data.id);

  const stepOrders = parsed.data.steps.map((step) => step.order);
  if (new Set(stepOrders).size !== stepOrders.length) {
    issues.push({ file, message: "Duplicate step order values" });
  }

  for (const ingredient of parsed.data.base_ingredients) {
    const inSharedLibrary = substitutions.has(ingredient.ingredient_id);
    if (!inSharedLibrary && !ingredient.name_zh) {
      issues.push({
        file,
        message: `Ingredient "${ingredient.ingredient_id}" is not in substitution library and must include name_zh`
      });
    }
  }

  const recipeIngredientIds = new Set(parsed.data.base_ingredients.map((ingredient) => ingredient.ingredient_id));
  const recipeEquipmentIds = new Set(parsed.data.equipment.required_ids);

  for (const step of parsed.data.steps) {
    for (const highlight of step.highlights) {
      if (highlight.type === "ingredient" && !recipeIngredientIds.has(highlight.id) && !substitutions.has(highlight.id)) {
        issues.push({ file, message: `Step ${step.order} highlights missing ingredient_id "${highlight.id}"` });
      }

      if (highlight.type === "equipment" && !recipeEquipmentIds.has(highlight.id) && !equipment.has(highlight.id)) {
        issues.push({ file, message: `Step ${step.order} highlights missing equipment_id "${highlight.id}"` });
      }
    }
  }

  for (const equipmentId of parsed.data.equipment.required_ids) {
    if (!equipment.has(equipmentId)) {
      issues.push({ file, message: `Recipe references missing equipment_id "${equipmentId}"` });
    }
  }
}

if (issues.length > 0) {
  console.error("Data validation failed:\n");
  for (const issue of issues) {
    console.error(`- ${path.relative(root, issue.file)}: ${issue.message}`);
  }
  process.exit(1);
}

console.log(
  `Data validation passed: ${substitutions.size} substitutions, ${equipment.size} equipment items, ${guideIds.size} guides, ${starterPackIds.size} starter packs, ${recipeIds.size} recipes.`
);
