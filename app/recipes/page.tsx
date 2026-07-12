import { RecipesExplorer } from "@/components/recipes-explorer";
import { getFilterValues, getRecipes } from "@/lib/data";

export const metadata = {
  title: "菜谱 | 就地开饭",
  description: "按难度、耗时、菜系和标签筛选留学生友好的家常菜、融合菜和本地食材改造菜。"
};

export default function RecipesPage() {
  const recipes = getRecipes();
  const filters = getFilterValues(recipes);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
      <section className="mb-6">
        <p className="eyebrow">Recipe Index</p>
        <h1 className="display-title mt-3 text-4xl font-semibold text-ink-100 sm:text-5xl">菜谱列表</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-ink-300">用难度、耗时、类型和标签快速缩小范围，详情页会根据已选择地区展示本地替代建议。</p>
      </section>
      <RecipesExplorer recipes={recipes} cuisines={filters.cuisines} tags={filters.tags} recipeTypes={filters.recipeTypes} />
    </div>
  );
}
