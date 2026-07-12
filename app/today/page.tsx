import { TodayRecommender } from "@/components/today-recommender";
import { getRecipes } from "@/lib/data";

export const metadata = {
  title: "今天吃什么 | 就地开饭",
  description: "按时间、预算、厨具和购买场景快速推荐适合今天做的留学生厨房菜。"
};

export default function TodayPage() {
  const recipes = getRecipes();

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
      <section className="mb-6">
        <p className="eyebrow">Dinner Decision</p>
        <h1 className="display-title mt-3 text-4xl font-semibold text-ink-100 sm:text-5xl">今天吃什么</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-ink-300">不用先翻完整菜谱。选一下现在的真实情况：时间、预算、厨具、超市，然后直接给你可做的菜。</p>
      </section>
      <TodayRecommender recipes={recipes} />
    </div>
  );
}
