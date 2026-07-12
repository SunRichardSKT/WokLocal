import { StarterPackView } from "@/components/starter-pack-view";
import { getGuides, getStarterPacks } from "@/lib/data";

export const metadata = {
  title: "落地清单与新手宝典 | 就地开饭",
  description: "按地区整理刚到海外后的厨房搭建、采购清单、基础食材和新手注意事项。"
};

export default function StarterPage() {
  const packs = getStarterPacks();
  const guides = getGuides();

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
      <section className="mb-6">
        <p className="eyebrow">Landing Checklist</p>
        <h1 className="display-title mt-3 text-4xl font-semibold text-ink-100 sm:text-5xl">落地清单与新手宝典</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-ink-300">
          刚到海外先别买乱。英国与美国现已提供分地区的超市采购地图、厨房搭建、基础食材和避坑提示，也欢迎补充你所在城市的真实经验。
        </p>
      </section>
      <StarterPackView packs={packs} guides={guides} />
    </div>
  );
}
