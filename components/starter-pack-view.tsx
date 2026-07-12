"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, MapPin, Plane, ShieldCheck, ShoppingBasket, Sparkles, Store, Tags, WalletCards } from "lucide-react";
import { getStoredRegion, setStoredRegion, subscribeToRegionChange } from "@/components/region-selector";
import { regions, supportedRegionKeys, type RegionKey } from "@/lib/regions";
import type { Guide, StarterPack, Supermarket } from "@/lib/schemas";

type StarterPackViewProps = {
  packs: StarterPack[];
  guides: Guide[];
};

const phaseMeta: Record<StarterPack["sections"][number]["priority"], { index: string; title: string; description: string; icon: typeof Sparkles; accent: string }> = {
  today: { index: "01", title: "落地当天", description: "先确认规则，再解决第一餐。", icon: Sparkles, accent: "text-scallion" },
  three_days: { index: "02", title: "三天内", description: "把厨房从应急状态变成稳定状态。", icon: ShoppingBasket, accent: "text-soy" },
  optional: { index: "03", title: "第一周后", description: "按频率和预算，慢慢减少做饭摩擦。", icon: WalletCards, accent: "text-chili" }
};

const regionThemes: Partial<Record<RegionKey, { label: string; code: string; accent: string; soft: string; border: string; activeButton: string }>> = {
  uk: {
    label: "英国",
    code: "UK",
    accent: "text-scallion",
    soft: "bg-scallion/[0.12]",
    border: "border-scallion/30",
    activeButton: "bg-scallion text-ink-950 shadow-[0_0_0_1px_rgb(var(--scallion)_/_0.3)]"
  },
  north_america: {
    label: "美国",
    code: "US",
    accent: "text-chili",
    soft: "bg-chili/[0.11]",
    border: "border-chili/30",
    activeButton: "bg-chili text-ink-950 shadow-[0_0_0_1px_rgb(var(--chili)_/_0.28)]"
  }
};

const defaultRegionTheme = {
  label: "地区",
  code: "REGION",
  accent: "text-soy",
  soft: "bg-soy/[0.1]",
  border: "border-soy/30",
  activeButton: "bg-soy text-ink-950"
};

const marketKindLabels: Record<Supermarket["kind"], string> = {
  budget: "平价",
  mainstream: "主流",
  specialty: "特色",
  premium: "品质",
  bulk: "仓储",
  asian: "亚超"
};

const priceLabels: Record<Supermarket["price_level"], string> = {
  low: "低价",
  medium: "中等",
  high: "偏高",
  mixed: "看品类"
};

export function StarterPackView({ packs, guides }: StarterPackViewProps) {
  const [selectedRegion, setSelectedRegion] = useState<RegionKey>((packs[0]?.region as RegionKey | undefined) ?? "uk");
  const visiblePacks = useMemo(() => packs.filter((pack) => pack.region === selectedRegion), [packs, selectedRegion]);
  const visibleGuides = useMemo(() => guides.filter((guide) => guide.region === selectedRegion), [guides, selectedRegion]);
  const selectedTheme = regionThemes[selectedRegion] ?? defaultRegionTheme;

  useEffect(() => {
    const storedRegion = getStoredRegion();
    if (storedRegion) setSelectedRegion(storedRegion);
    return subscribeToRegionChange((region) => {
      if (region) setSelectedRegion(region);
    });
  }, []);

  return (
    <div className="space-y-8">
      <section className="surface overflow-hidden rounded-md p-5 sm:p-6">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div>
            <p className="eyebrow">Choose Your Landing Zone</p>
            <h2 className="display-title mt-3 text-3xl font-semibold text-ink-100">先按地区，搭自己的第一间厨房</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-ink-300">英国与美国已经提供完整样板。其他地区也可先切换查看缺口，并把自己的真实经验补进来。</p>
          </div>
          <div className="flex flex-wrap gap-2 lg:justify-end">
            {supportedRegionKeys.map((regionKey) => {
              const active = selectedRegion === regionKey;
              const theme = regionThemes[regionKey] ?? defaultRegionTheme;
              return (
                <button
                  className={active ? `min-h-11 rounded-md px-3 py-2 text-sm font-semibold ${theme.activeButton}` : "min-h-11 rounded-md border border-white/10 bg-white/[0.035] px-3 py-2 text-sm text-ink-300 transition hover:-translate-y-0.5 hover:border-scallion/40"}
                  key={regionKey}
                  onClick={() => {
                    setStoredRegion(regionKey);
                    setSelectedRegion(regionKey);
                  }}
                  type="button"
                >
                  {regionKey === "north_america" ? "美国 / 北美" : regions[regionKey]}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {visiblePacks.map((pack) => (
        <article className="space-y-5" key={pack.pack_id}>
          <section className={`starter-hero starter-hero-${pack.region} surface rounded-md p-5 sm:p-7`}>
            <div className="grid gap-5 lg:grid-cols-[auto_minmax(0,1fr)] lg:items-start">
              <div className={`flex size-14 items-center justify-center rounded-md border ${selectedTheme.border} ${selectedTheme.soft} ${selectedTheme.accent}`}>
                <Plane size={25} aria-hidden="true" />
              </div>
              <div>
                <p className={`eyebrow ${selectedTheme.accent}`}>{selectedTheme.code} / First Week</p>
                <h2 className="display-title mt-3 text-3xl font-semibold text-ink-100 sm:text-4xl">{pack.title}</h2>
                <p className="mt-4 max-w-3xl text-sm leading-7 text-ink-300">{pack.summary}</p>
              </div>
            </div>
          </section>

          <div className="grid gap-4 xl:grid-cols-3">
            {pack.sections.map((section) => {
              const phase = phaseMeta[section.priority];
              const Icon = phase.icon;
              return (
                <section className="surface rounded-md p-4 sm:p-5" key={section.priority}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className={`font-mono text-xs tracking-[0.2em] ${phase.accent}`}>{phase.index}</p>
                      <h3 className="display-title mt-2 text-2xl font-semibold text-ink-100">{phase.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-ink-500">{phase.description}</p>
                    </div>
                    <Icon className={phase.accent} size={21} aria-hidden="true" />
                  </div>
                  <div className="mt-5 space-y-3">
                    {section.items.map((item) => (
                      <article className="surface-interactive rounded-md border border-white/10 bg-white/[0.025] p-3" key={`${section.priority}-${item.name}`}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-medium text-ink-100">{item.name}</p>
                            <p className="mt-1 text-xs text-ink-500">{item.category}</p>
                          </div>
                          <span className="shrink-0 rounded-md border border-white/10 bg-ink-850 px-2 py-1 text-xs text-ink-300">{item.estimated_budget}</span>
                        </div>
                        <p className="mt-3 flex gap-2 text-sm leading-6 text-ink-300">
                          <MapPin className="mt-1 shrink-0 text-soy" size={15} aria-hidden="true" />
                          <span>{item.where_to_buy.join(" / ")}</span>
                        </p>
                        {item.note ? <p className="mt-3 border-t border-white/10 pt-3 text-sm leading-6 text-ink-300">{item.note}</p> : null}
                      </article>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        </article>
      ))}

      <section className="surface rounded-md p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">Kitchen Field Notes</p>
            <h2 className="display-title mt-3 text-3xl font-semibold text-ink-100">{selectedTheme.label}的厨房路线图</h2>
          </div>
          <ShieldCheck className={selectedTheme.accent} size={24} aria-hidden="true" />
        </div>
        {visibleGuides.length > 0 ? (
          <div className="mt-6 space-y-6">
            {visibleGuides.map((guide) => (
              <article key={guide.guide_id}>
                <p className="max-w-3xl text-sm leading-7 text-ink-300">{guide.summary}</p>
                {guide.supermarkets.length > 0 ? (
                  <section className="mt-6">
                    <div className="flex items-end justify-between gap-3">
                      <div>
                        <p className={`font-mono text-xs tracking-[0.2em] ${selectedTheme.accent}`}>MARKET MAP / {selectedTheme.code}</p>
                        <h3 className="display-title mt-2 text-2xl font-semibold text-ink-100">超市采购地图</h3>
                      </div>
                      <Store className={selectedTheme.accent} size={22} aria-hidden="true" />
                    </div>
                    <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                      {guide.supermarkets.map((market) => (
                        <article className={`surface-interactive rounded-md border ${selectedTheme.border} bg-white/[0.025] p-4`} key={market.name}>
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className={`text-xs font-semibold tracking-[0.12em] ${selectedTheme.accent}`}>{marketKindLabels[market.kind]}</p>
                              <h4 className="mt-2 text-lg font-semibold text-ink-100">{market.name}</h4>
                            </div>
                            <span className="shrink-0 rounded-md border border-white/10 bg-ink-850 px-2 py-1 text-xs text-ink-300">{priceLabels[market.price_level]}</span>
                          </div>
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {market.best_for.map((item) => <span className="pill" key={item}>{item}</span>)}
                          </div>
                          {market.membership ? (
                            <p className="mt-3 flex gap-2 rounded-md bg-white/[0.035] px-3 py-2 text-xs leading-5 text-ink-300">
                              <Tags className={`mt-0.5 shrink-0 ${selectedTheme.accent}`} size={14} aria-hidden="true" />
                              <span>{market.membership}</span>
                            </p>
                          ) : null}
                          <p className="mt-3 text-sm leading-6 text-ink-300">{market.note}</p>
                        </article>
                      ))}
                    </div>
                  </section>
                ) : null}
                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  {guide.sections.map((section, index) => (
                    <section className="surface-interactive rounded-md border border-white/10 bg-white/[0.025] p-4" key={section.title}>
                      <p className="font-mono text-xs tracking-[0.18em] text-soy">NOTE {String(index + 1).padStart(2, "0")}</p>
                      <h3 className="display-title mt-2 text-xl font-semibold text-ink-100">{section.title}</h3>
                      <ul className="mt-4 space-y-3 text-sm leading-6 text-ink-300">
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
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm leading-7 text-ink-300">这个地区还没有完整的厨房路线图。你可以先补充附近超市、宿舍电器限制或第一周的真实经验。</p>
        )}
      </section>

      <section className="surface rounded-md p-5 sm:p-6">
        <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
          <div>
            <p className="eyebrow">Share What Worked</p>
            <h2 className="display-title mt-3 text-2xl font-semibold text-ink-100">你的城市也可以有一份路线图</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-ink-300">不用一次写成完整攻略。附近哪个超市便宜、哪种电器不允许、第一天该怎么买，都值得成为下一位留子的捷径。</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row md:flex-col">
            <Link className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-scallion px-4 py-3 text-sm font-semibold text-ink-950" href="/contribute/">
              补充本地经验
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <Link className="inline-flex min-h-11 items-center justify-center rounded-md border border-white/10 px-4 py-3 text-sm font-semibold text-ink-100 transition hover:bg-white/[0.06]" href="/about/">
              查看上传指南
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
