"use client";

import { useEffect, useState } from "react";
import { RegionSelector, getStoredRegion, subscribeToRegionChange } from "@/components/region-selector";
import { regions, type RegionKey } from "@/lib/regions";

export function RegionAwarePanel() {
  const [region, setRegion] = useState<RegionKey | "">("");

  useEffect(() => {
    setRegion(getStoredRegion());
    return subscribeToRegionChange(setRegion);
  }, []);

  return (
    <section className="surface rounded-md p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-ink-100">本地化地区</p>
          <p className="mt-1 text-sm leading-6 text-ink-300">
            {region ? `当前显示 ${regions[region]} 替代食材建议。` : "选择地区后，菜谱详情会显示当地超市替代方案。"}
          </p>
        </div>
        <RegionSelector value={region} onChange={setRegion} />
      </div>
    </section>
  );
}
