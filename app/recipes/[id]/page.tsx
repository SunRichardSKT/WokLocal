import { notFound } from "next/navigation";
import { RecipeDetail } from "@/components/recipe-detail";
import { getRecipeById, getRecipes, getSubstitutions } from "@/lib/data";

type RecipePageProps = {
  params: {
    id: string;
  };
};

export function generateStaticParams() {
  return getRecipes().map((recipe) => ({ id: recipe.id }));
}

export function generateMetadata({ params }: RecipePageProps) {
  const recipe = getRecipeById(params.id);

  if (!recipe) {
    return {
      title: "菜谱不存在 | 就地开饭"
    };
  }

  return {
    title: `${recipe.name.zh} | 就地开饭`,
    description: recipe.description
  };
}

export default function RecipePage({ params }: RecipePageProps) {
  const recipe = getRecipeById(params.id);

  if (!recipe) {
    notFound();
  }

  const substitutions = Object.fromEntries(getSubstitutions().map((item) => [item.ingredient_id, item]));

  return <RecipeDetail recipe={recipe} substitutions={substitutions} />;
}
