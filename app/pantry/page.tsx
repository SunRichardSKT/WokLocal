import { PantryRecommender } from "@/components/pantry-recommender";
import { getIngredients, getRecipes } from "@/lib/data";

export const metadata = {
  title: "我有什么食材？| 就地开饭",
  description: "从手头已有的食材出发，快速找到现在能做或只差一点就能做的菜。"
};

export default function PantryPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
      <section className="mb-6">
        <p className="text-sm font-medium text-scallion">Cook From What You Have</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal text-ink-100 sm:text-4xl">我有什么食材？</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-300">选出手头已有的食材，先做匹配度最高的菜。还差一点的菜也会列出来，方便顺手加入购物清单。</p>
      </section>
      <PantryRecommender ingredients={getIngredients()} recipes={getRecipes()} />
    </div>
  );
}
