"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, MapPin, ShieldCheck } from "lucide-react";
import { RegionSelector, getStoredRegion, subscribeToRegionChange } from "@/components/region-selector";
import { regions, type RegionKey } from "@/lib/regions";
import type { Equipment } from "@/lib/schemas";

type EquipmentBoardProps = {
  equipment: Equipment[];
};

const categoryLabels: Record<Equipment["category"], string> = {
  must_have: "必买",
  optional_upgrade: "可选升级",
  dorm_friendly: "宿舍友好",
  avoid_first: "先别急着买"
};

const budgetLabels: Record<Equipment["budget_level"], string> = {
  low: "低预算",
  medium: "中预算",
  high: "高预算"
};

export function EquipmentBoard({ equipment }: EquipmentBoardProps) {
  const [region, setRegion] = useState<RegionKey | "">("");

  useEffect(() => {
    setRegion(getStoredRegion());
    return subscribeToRegionChange(setRegion);
  }, []);

  return (
    <div className="space-y-5">
      <section className="surface rounded-md p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-ink-100">厨具购买建议</p>
            <p className="mt-1 text-sm leading-6 text-ink-300">
              {region ? `当前展示 ${regions[region]} 的购买地点和价格区间。` : "未选择地区时展示通用清单，选择地区后显示本地购买建议。"}
            </p>
          </div>
          <RegionSelector value={region} onChange={setRegion} />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {equipment.map((item) => {
          const localized = region ? item.regions[region] : undefined;
          return (
            <article className="surface surface-interactive rounded-md p-4" key={item.equipment_id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-ink-100">{item.name_zh}</h2>
                  <p className="mt-1 text-sm text-ink-300">{item.name_en}</p>
                </div>
                <span className={item.is_essential ? "rounded-md bg-scallion px-2 py-1 text-xs font-semibold text-ink-950" : "rounded-md bg-white/[0.06] px-2 py-1 text-xs text-ink-300"}>
                  {categoryLabels[item.category]}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="pill">{budgetLabels[item.budget_level]}</span>
                {item.use_cases.slice(0, 4).map((useCase) => (
                  <span className="pill" key={useCase}>
                    {useCase}
                  </span>
                ))}
              </div>
              {item.substitutes_if_missing.length > 0 ? (
                <p className="mt-3 text-sm leading-6 text-ink-300">没有时可用：{item.substitutes_if_missing.join("、")}</p>
              ) : null}
              {region && localized ? (
                <div className="mt-4 rounded-md border border-scallion/20 bg-scallion/[0.08] p-3">
                  <p className="flex items-center gap-2 text-sm font-medium text-scallion">
                    <MapPin size={15} aria-hidden="true" />
                    {localized.where_to_buy}
                  </p>
                  <p className="mt-2 text-sm text-ink-300">{localized.price_range}</p>
                  {localized.notes ? <p className="mt-2 text-sm leading-6 text-ink-300">{localized.notes}</p> : null}
                </div>
              ) : region ? (
                <div className="mt-4 flex gap-2 rounded-md border border-chili/20 bg-chili/[0.08] p-3 text-sm text-ink-300">
                  <AlertTriangle className="mt-0.5 shrink-0 text-chili" size={15} aria-hidden="true" />
                  暂无{regions[region]}购买建议，欢迎补充。
                </div>
              ) : (
                <div className="mt-4 flex gap-2 rounded-md border border-white/10 bg-white/[0.035] p-3 text-sm text-ink-300">
                  <ShieldCheck className="mt-0.5 shrink-0 text-scallion" size={15} aria-hidden="true" />
                  选择地区后查看本地购买建议。
                </div>
              )}
            </article>
          );
        })}
      </section>
    </div>
  );
}
