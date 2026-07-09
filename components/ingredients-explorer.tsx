"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Clipboard, CopyPlus, Search, ShoppingBasket } from "lucide-react";
import { RegionSelector, getStoredRegion, subscribeToRegionChange } from "@/components/region-selector";
import { regions, supportedRegionKeys, type RegionKey } from "@/lib/regions";
import type { Substitution } from "@/lib/schemas";

type IngredientsExplorerProps = {
  ingredients: Substitution[];
};

function similarityLabel(score: number) {
  if (score >= 5) return "几乎一致";
  if (score === 4) return "很接近";
  if (score === 3) return "可接受";
  return "差异明显";
}

export function IngredientsExplorer({ ingredients }: IngredientsExplorerProps) {
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState<RegionKey | "">("");
  const [showAllRegions, setShowAllRegions] = useState(false);
  const [copiedId, setCopiedId] = useState("");

  useEffect(() => {
    setRegion(getStoredRegion());
    return subscribeToRegionChange(setRegion);
  }, []);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return ingredients;
    }

    return ingredients.filter((item) =>
      [
        item.name_zh,
        item.name_en,
        item.pinyin ?? "",
        item.category,
        ...item.aliases_zh,
        ...item.aliases_en,
        ...item.aliases_pinyin,
        ...item.search_keywords,
        ...item.common_uses
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalized)
    );
  }, [ingredients, query]);

  return (
    <div className="space-y-5">
      <section className="surface rounded-md p-4">
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_16rem_auto] md:items-center">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-500" size={18} aria-hidden="true" />
            <input
              className="control w-full pl-10"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="输入生抽、酱油、soy sauce、cornflour"
              aria-label="搜索食材或调料"
            />
          </label>
          <RegionSelector value={region} onChange={setRegion} />
          <label className="flex items-center gap-2 text-sm text-ink-300">
            <input
              type="checkbox"
              className="size-4 accent-scallion"
              checked={showAllRegions}
              onChange={(event) => setShowAllRegions(event.target.checked)}
            />
            展开所有地区
          </label>
        </div>
      </section>

      {filtered.length === 0 ? (
        <section className="surface rounded-md p-5">
          <div className="flex gap-3">
            <AlertTriangle className="mt-1 shrink-0 text-chili" size={19} aria-hidden="true" />
            <div>
              <h2 className="font-semibold text-ink-100">没有找到这个食材</h2>
              <p className="mt-2 text-sm leading-6 text-ink-300">可以去贡献页面生成一条替代建议，让后续同学也能查到。</p>
              <Link className="mt-4 inline-flex items-center gap-2 rounded-md bg-scallion px-3 py-2 text-sm font-semibold text-ink-950" href={`/contribute/?q=${encodeURIComponent(query.trim())}`}>
                <CopyPlus size={16} aria-hidden="true" />
                提交新食材
              </Link>
            </div>
          </div>
        </section>
      ) : (
        <section className="grid gap-4 lg:grid-cols-2">
          {filtered.map((item) => {
            const regionKeys = showAllRegions ? supportedRegionKeys : region ? [region] : [];
            return (
              <article className="surface rounded-md p-4" key={item.ingredient_id}>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-ink-100">{item.name_zh}</h2>
                    <p className="mt-1 text-sm text-ink-300">{item.name_en}</p>
                    {item.pinyin ? <p className="mt-1 text-xs text-ink-500">{item.pinyin}</p> : null}
                  </div>
                  <div className="flex flex-wrap justify-end gap-2">
                    <button
                      className="inline-flex items-center gap-1 rounded-md border border-white/10 px-2 py-1 text-xs text-ink-300 hover:bg-white/[0.06]"
                      onClick={async () => {
                        await navigator.clipboard.writeText(item.ingredient_id);
                        setCopiedId(item.ingredient_id);
                        window.setTimeout(() => setCopiedId(""), 1400);
                      }}
                      type="button"
                    >
                      <Clipboard size={13} aria-hidden="true" />
                      {copiedId === item.ingredient_id ? "已复制" : item.ingredient_id}
                    </button>
                    <span className="w-fit rounded-md bg-white/[0.06] px-2 py-1 text-xs text-ink-300">{item.category}</span>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {[...item.aliases_zh, ...item.aliases_en].slice(0, 6).map((alias) => (
                    <span className="pill" key={alias}>
                      {alias}
                    </span>
                  ))}
                </div>
                {item.common_uses.length > 0 ? (
                  <p className="mt-3 text-sm leading-6 text-ink-300">常见用途：{item.common_uses.join("、")}</p>
                ) : null}

                {!region && !showAllRegions ? (
                  <p className="mt-4 rounded-md border border-white/10 bg-white/[0.035] p-3 text-sm leading-6 text-ink-300">
                    选择地区后查看本地替代；也可以勾选“展开所有地区”。
                  </p>
                ) : (
                  <div className="mt-4 space-y-3">
                    {regionKeys.map((regionKey) => {
                      const localized = item.regions[regionKey];
                      return localized ? (
                        <div className="rounded-md border border-scallion/20 bg-scallion/[0.08] p-3" key={regionKey}>
                          <p className="flex items-center gap-2 text-sm font-medium text-scallion">
                            <ShoppingBasket size={15} aria-hidden="true" />
                            {regions[regionKey]}：{localized.substitute}
                          </p>
                          <p className="mt-2 text-sm leading-6 text-ink-300">{localized.where_to_buy}</p>
                          {localized.usage_note ? <p className="mt-2 text-sm leading-6 text-ink-300">{localized.usage_note}</p> : null}
                          <p className="mt-2 text-xs text-ink-500">相似度 {localized.similarity}/5，{similarityLabel(localized.similarity)}</p>
                        </div>
                      ) : (
                        <div className="rounded-md border border-chili/20 bg-chili/[0.08] p-3 text-sm text-ink-300" key={regionKey}>
                          暂无{regions[regionKey]}本地化建议，欢迎在 GitHub 提交。
                        </div>
                      );
                    })}
                  </div>
                )}
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
}
