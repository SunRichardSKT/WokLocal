"use client";

import { Globe2 } from "lucide-react";
import { regions, supportedRegionKeys, type RegionKey } from "@/lib/regions";

const storageKey = "woklocal-region";
const changeEventName = "woklocal-region-change";

export function getStoredRegion(): RegionKey | "" {
  if (typeof window === "undefined") {
    return "";
  }

  const value = window.localStorage.getItem(storageKey);
  return supportedRegionKeys.includes(value as RegionKey) ? (value as RegionKey) : "";
}

export function setStoredRegion(region: RegionKey | "") {
  if (typeof window === "undefined") {
    return;
  }

  if (region) {
    window.localStorage.setItem(storageKey, region);
  } else {
    window.localStorage.removeItem(storageKey);
  }

  window.dispatchEvent(new CustomEvent(changeEventName, { detail: region }));
}

export function subscribeToRegionChange(callback: (region: RegionKey | "") => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const onCustomChange = (event: Event) => {
    callback((event as CustomEvent<RegionKey | "">).detail ?? getStoredRegion());
  };
  const onStorageChange = (event: StorageEvent) => {
    if (event.key === storageKey) {
      callback(getStoredRegion());
    }
  };

  window.addEventListener(changeEventName, onCustomChange);
  window.addEventListener("storage", onStorageChange);

  return () => {
    window.removeEventListener(changeEventName, onCustomChange);
    window.removeEventListener("storage", onStorageChange);
  };
}

type RegionSelectorProps = {
  value: RegionKey | "";
  onChange: (region: RegionKey | "") => void;
  compact?: boolean;
};

export function RegionSelector({ value, onChange, compact = false }: RegionSelectorProps) {
  return (
    <label className="flex w-full items-center gap-2 rounded-md border border-white/10 bg-ink-850 px-3 py-2 sm:w-auto">
      <Globe2 className="shrink-0 text-scallion" size={18} aria-hidden="true" />
      <span className={compact ? "sr-only" : "shrink-0 text-sm text-ink-300"}>地区</span>
      <select
        className="min-w-0 flex-1 bg-transparent text-sm text-ink-100 outline-none"
        value={value}
        onChange={(event) => {
          const nextRegion = event.target.value as RegionKey | "";
          setStoredRegion(nextRegion);
          onChange(nextRegion);
        }}
        aria-label="选择所在地区"
      >
        <option className="bg-ink-900" value="">
          未选择
        </option>
        {supportedRegionKeys.map((region) => (
          <option className="bg-ink-900" value={region} key={region}>
            {regions[region]}
          </option>
        ))}
      </select>
    </label>
  );
}
