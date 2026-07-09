import { StarterPackView } from "@/components/starter-pack-view";
import { getStarterPacks } from "@/lib/data";

export const metadata = {
  title: "落地清单与注意事项 | 就地开饭",
  description: "按地区整理刚到海外后的厨房搭建、厨具购买、基础食材采购和注意事项。"
};

export default function StarterPage() {
  const packs = getStarterPacks();

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
      <section className="mb-6">
        <p className="text-sm font-medium text-scallion">Landing Checklist</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal text-ink-100 sm:text-4xl">落地清单与注意事项</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-300">
          刚到海外先别买乱。按地区整理厨房搭建、基础食材、厨具采购和容易踩坑的注意事项，也欢迎补充你所在地区的经验。
        </p>
      </section>
      <StarterPackView packs={packs} />
    </div>
  );
}
