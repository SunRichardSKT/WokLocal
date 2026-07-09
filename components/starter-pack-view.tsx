"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, MapPin, UploadCloud, WalletCards } from "lucide-react";
import { getStoredRegion, setStoredRegion, subscribeToRegionChange } from "@/components/region-selector";
import { regions, supportedRegionKeys, type RegionKey } from "@/lib/regions";
import type { StarterPack } from "@/lib/schemas";

type StarterPackViewProps = {
  packs: StarterPack[];
};

const priorityLabels: Record<StarterPack["sections"][number]["priority"], string> = {
  today: "今天就买",
  three_days: "三天内补齐",
  optional: "有预算再买"
};

export function StarterPackView({ packs }: StarterPackViewProps) {
  const [selectedRegion, setSelectedRegion] = useState<RegionKey>((packs[0]?.region as RegionKey | undefined) ?? "uk");
  const visiblePacks = useMemo(() => packs.filter((pack) => pack.region === selectedRegion), [packs, selectedRegion]);

  useEffect(() => {
    const storedRegion = getStoredRegion();
    if (storedRegion) {
      setSelectedRegion(storedRegion);
    }

    return subscribeToRegionChange((region) => {
      if (region) {
        setSelectedRegion(region);
      }
    });
  }, []);

  if (packs.length === 0) {
    return <UploadStarterPackGuide selectedRegion="uk" />;
  }

  return (
    <div className="space-y-5">
      <section className="surface rounded-md p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-ink-100">选择地区</h2>
            <p className="mt-1 text-sm leading-6 text-ink-300">目前英国内容最完整，其他地区欢迎慢慢补齐。</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {supportedRegionKeys.map((regionKey) => (
              <button
                className={
                  selectedRegion === regionKey
                    ? "rounded-md bg-scallion px-3 py-2 text-sm font-semibold text-ink-950"
                    : "rounded-md border border-white/10 bg-white/[0.035] px-3 py-2 text-sm text-ink-300 hover:border-scallion/40"
                }
                key={regionKey}
                onClick={() => {
                  setStoredRegion(regionKey);
                  setSelectedRegion(regionKey);
                }}
                type="button"
              >
                {regions[regionKey]}
              </button>
            ))}
          </div>
        </div>
      </section>

      {visiblePacks.length > 0 ? (
        visiblePacks.map((pack) => (
          <article className="space-y-5" key={pack.pack_id}>
            <section className="surface rounded-md p-5">
              <p className="text-sm font-medium text-scallion">{regions[pack.region as keyof typeof regions]}</p>
              <h2 className="mt-2 text-2xl font-semibold text-ink-100">{pack.title}</h2>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-ink-300">{pack.summary}</p>
            </section>

            <div className="grid gap-4 lg:grid-cols-3">
              {pack.sections.map((section) => (
                <section className="surface rounded-md p-4" key={section.priority}>
                  <h3 className="text-lg font-semibold text-ink-100">{priorityLabels[section.priority]}</h3>
                  <p className="mt-1 text-sm text-ink-500">{section.title}</p>
                  <div className="mt-4 space-y-3">
                    {section.items.map((item) => (
                      <div className="rounded-md border border-white/10 bg-white/[0.035] p-3" key={`${section.priority}-${item.name}`}>
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-medium text-ink-100">{item.name}</p>
                            <p className="mt-1 text-xs text-ink-500">{item.category}</p>
                          </div>
                          <span className="rounded-md bg-scallion/[0.12] px-2 py-1 text-xs text-scallion">{item.estimated_budget}</span>
                        </div>
                        <p className="mt-3 flex gap-2 text-sm leading-6 text-ink-300">
                          <MapPin className="mt-1 shrink-0 text-soy" size={15} aria-hidden="true" />
                          <span>{item.where_to_buy.join(" / ")}</span>
                        </p>
                        {item.note ? (
                          <p className="mt-2 flex gap-2 text-sm leading-6 text-ink-300">
                            <CheckCircle2 className="mt-1 shrink-0 text-scallion" size={15} aria-hidden="true" />
                            <span>{item.note}</span>
                          </p>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </article>
        ))
      ) : (
        <section className="surface rounded-md p-5">
          <p className="text-sm font-medium text-scallion">{regions[selectedRegion]}</p>
          <h2 className="mt-2 text-2xl font-semibold text-ink-100">暂无这个地区的落地清单</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-ink-300">
            如果你在这个地区生活过，可以先上传一份自由格式的清单：常去哪里买锅、第一天买什么、哪些东西不急、宿舍或租房有什么限制。
          </p>
        </section>
      )}

      <section className="surface rounded-md p-4">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-ink-100">
          <WalletCards size={18} aria-hidden="true" />
          使用建议
        </h2>
        <p className="mt-2 text-sm leading-6 text-ink-300">
          刚落地别追求厨具一步到位。先保证能煮饭、煮面、煎蛋、做盖饭，再根据自己做饭频率补升级件。
        </p>
      </section>

      <UploadStarterPackGuide selectedRegion={selectedRegion} />
    </div>
  );
}

function UploadStarterPackGuide({ selectedRegion }: { selectedRegion: RegionKey }) {
  return (
    <section className="surface rounded-md p-5">
      <h2 className="flex items-center gap-2 text-lg font-semibold text-ink-100">
        <UploadCloud size={18} aria-hidden="true" />
        上传这个地区的落地经验
      </h2>
      <p className="mt-2 text-sm leading-6 text-ink-300">
        不需要一次写成完整攻略。你可以从 {regions[selectedRegion]} 的一条真实经验开始：在哪里买锅、哪家超市便宜、宿舍不能用什么电器、第一天最值得买什么。
      </p>
      <div className="mt-4 grid gap-3 text-sm leading-6 text-ink-300 md:grid-cols-2">
        <p>1. 写明地区和城市，学校附近商圈也有帮助。</p>
        <p>2. 按“今天就买 / 三天内补齐 / 有预算再买”分组。</p>
        <p>3. 标出购买地点、价格范围和替代买法。</p>
        <p>4. 补充注意事项，例如宿舍电器限制、退换货、交通成本。</p>
      </div>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <Link className="inline-flex items-center justify-center rounded-md bg-scallion px-4 py-3 text-sm font-semibold text-ink-950 hover:bg-scallion/90" href="/contribute/">
          打开补充内容页
        </Link>
        <Link className="inline-flex items-center justify-center rounded-md border border-white/10 px-4 py-3 text-sm font-semibold text-ink-100 hover:bg-white/[0.06]" href="/about/">
          查看上传指南
        </Link>
      </div>
    </section>
  );
}
