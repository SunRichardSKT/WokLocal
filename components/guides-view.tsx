"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { RegionSelector, getStoredRegion, subscribeToRegionChange } from "@/components/region-selector";
import { regions, type RegionKey } from "@/lib/regions";
import type { Guide } from "@/lib/schemas";

type GuidesViewProps = {
  guides: Guide[];
};

export function GuidesView({ guides }: GuidesViewProps) {
  const [region, setRegion] = useState<RegionKey | "">("");

  useEffect(() => {
    setRegion(getStoredRegion());
    return subscribeToRegionChange(setRegion);
  }, []);

  const visibleGuides = useMemo(() => {
    if (!region) {
      return guides;
    }
    return guides.filter((guide) => guide.region === region);
  }, [guides, region]);

  return (
    <div className="space-y-5">
      <section className="surface rounded-md p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-ink-100">落地快速入门宝典</p>
            <p className="mt-1 text-sm leading-6 text-ink-300">
              {region ? `当前筛选 ${regions[region]}。` : "未选择地区时展示所有已完成地区。"}
            </p>
          </div>
          <RegionSelector value={region} onChange={setRegion} />
        </div>
      </section>

      {visibleGuides.length === 0 ? (
        <section className="surface rounded-md p-5 text-sm leading-6 text-ink-300">暂无该地区宝典，欢迎在贡献页生成补充建议。</section>
      ) : (
        visibleGuides.map((guide) => {
          const guideRegion = guide.region as RegionKey;
          return (
          <article className="surface rounded-md p-5" key={guide.guide_id}>
            <p className="text-sm font-medium text-scallion">{regions[guideRegion]}</p>
            <h2 className="mt-2 text-2xl font-semibold text-ink-100">{guide.title}</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-ink-300">{guide.summary}</p>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {guide.sections.map((section) => (
                <section className="rounded-md border border-white/10 bg-white/[0.035] p-4" key={section.title}>
                  <h3 className="font-semibold text-ink-100">{section.title}</h3>
                  <ul className="mt-3 space-y-2 text-sm leading-6 text-ink-300">
                    {section.items.map((item) => (
                      <li className="flex gap-2" key={item}>
                        <CheckCircle2 className="mt-1 shrink-0 text-scallion" size={15} aria-hidden="true" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          </article>
        );
        })
      )}
    </div>
  );
}
