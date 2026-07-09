const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function assetPath(src: string) {
  if (!src.startsWith("/") || src.startsWith(basePath)) {
    return src;
  }

  return `${basePath}${src}`;
}
