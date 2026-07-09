export const regions = {
  uk: "英国",
  north_america: "北美",
  europe: "欧洲",
  australia: "澳大利亚",
  japan_korea: "日韩"
} as const;

export type RegionKey = keyof typeof regions;

export const supportedRegionKeys = Object.keys(regions) as RegionKey[];

export const completeDemoRegion: RegionKey = "uk";
