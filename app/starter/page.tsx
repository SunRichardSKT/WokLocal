import { StarterPackView } from "@/components/starter-pack-view";
import { getStarterPacks } from "@/lib/data";

export const metadata = {
  title: "第一周采购清单 | 就地开饭",
  description: "英国新生第一周厨房搭建、厨具购买和基础食材采购清单。"
};

export default function StarterPage() {
  const packs = getStarterPacks();

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
      <section className="mb-6">
        <p className="text-sm font-medium text-scallion">First Week Starter Pack</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal text-ink-100 sm:text-4xl">第一周采购清单</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-300">刚到英国先别买乱。按优先级把厨房搭起来：今天就买、三天内补齐、有预算再买。</p>
      </section>
      <StarterPackView packs={packs} />
    </div>
  );
}
