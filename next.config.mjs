const repoName = process.env.GITHUB_REPOSITORY?.split("/")[1];
const ownerName = process.env.GITHUB_REPOSITORY?.split("/")[0];
const isUserOrOrgPage = repoName && ownerName && repoName === `${ownerName}.github.io`;
const detectedGithubBasePath =
  process.env.GITHUB_ACTIONS === "true" && repoName && !isUserOrOrgPage ? `/${repoName}` : "";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? detectedGithubBasePath;

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  trailingSlash: true,
  basePath,
  assetPrefix: basePath ? `${basePath}/` : undefined,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath
  },
  images: {
    unoptimized: true
  }
};

export default nextConfig;
