import { RecipesExplorer } from "@/components/recipes-explorer";
import { getFilterValues, getRecipes } from "@/lib/data";

export const metadata = {
  title: "菜谱 | 就地开饭",
  description: "按难度、耗时、菜系和标签筛选留学生友好的本地化中餐菜谱。"
};

export default function RecipesPage() {
  const recipes = getRecipes();
  const filters = getFilterValues(recipes);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
      <section className="mb-6">
        <p className="text-sm font-medium text-scallion">Recipe Index</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal text-ink-100 sm:text-4xl">菜谱列表</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-300">用难度、耗时、菜系和标签快速缩小范围，详情页会根据已选择地区展示本地替代建议。</p>
      </section>
      <RecipesExplorer recipes={recipes} cuisines={filters.cuisines} tags={filters.tags} recipeTypes={filters.recipeTypes} />
    </div>
  );
}
