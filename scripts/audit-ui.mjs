import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { chromium } from "playwright-core";

const baseUrl = (process.env.AUDIT_BASE_URL ?? "http://127.0.0.1:3000").replace(/\/$/, "");
const viewports = [
  { name: "mobile-small", width: 320, height: 844 },
  { name: "mobile", width: 375, height: 844 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1440, height: 1000 }
];
const fixedRoutes = [
  "/",
  "/about/",
  "/contribute/",
  "/equipment/",
  "/guides/",
  "/ingredients/",
  "/pantry/",
  "/recipes/",
  "/saved/",
  "/shopping-list/",
  "/starter/",
  "/today/"
];
const recipeRoutes = fs
  .readdirSync(path.join(process.cwd(), "data", "recipes"))
  .filter((fileName) => fileName.endsWith(".yaml"))
  .map((fileName) => `/recipes/${fileName.replace(/\.yaml$/, "")}/`);

function findBrowser() {
  const configured = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE;
  const candidates = [
    configured,
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
  ].filter(Boolean);
  return candidates.find((candidate) => fs.existsSync(candidate));
}

const executablePath = findBrowser();
if (!executablePath) {
  console.error("没有找到 Chrome/Edge。请用 PLAYWRIGHT_CHROMIUM_EXECUTABLE 指定浏览器路径。");
  process.exit(1);
}

const browser = await chromium.launch({ headless: true, executablePath });
const findings = [];
let checks = 0;

async function openPage(page, url) {
  let lastError;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      return await page.goto(url, {
        waitUntil: "domcontentloaded",
        timeout: 60_000
      });
    } catch (error) {
      lastError = error;
      await page.waitForTimeout(1_000);
    }
  }

  throw lastError;
}

for (const viewport of viewports) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: 1,
    hasTouch: viewport.width < 768,
    isMobile: viewport.width < 768
  });

  for (const route of [...fixedRoutes, ...recipeRoutes]) {
    const page = await context.newPage();
    const runtimeErrors = [];
    page.on("console", (message) => {
      if (message.type() === "error") runtimeErrors.push(message.text());
    });
    page.on("pageerror", (error) => runtimeErrors.push(error.message));

    let response;
    try {
      response = await openPage(page, `${baseUrl}${route}`);
    } catch (error) {
      const message = error instanceof Error ? error.message.split("\n")[0] : String(error);
      findings.push({ viewport: viewport.name, route, issues: [`页面加载失败（已重试）：${message}`] });
      checks += 1;
      await page.close();
      continue;
    }
    await page.waitForTimeout(800);

    const result = await page.evaluate(() => {
      const hasName = (element) => Boolean(
        element.getAttribute("aria-label") ||
        element.getAttribute("aria-labelledby") ||
        element.getAttribute("title") ||
        element.textContent?.trim() ||
        element.querySelector("img[alt]")
      );
      const unlabeledFields = [...document.querySelectorAll("input:not([type='hidden']), select, textarea")].filter((element) => {
        if (element.type === "file" && getComputedStyle(element).display === "none") return false;
        if (element.getAttribute("aria-label") || element.getAttribute("aria-labelledby")) return false;
        if (element.id && document.querySelector(`label[for="${CSS.escape(element.id)}"]`)) return false;
        return !element.closest("label");
      });
      const smallButtons = [...document.querySelectorAll("button")].filter((element) => {
        const box = element.getBoundingClientRect();
        return box.width > 0 && box.height > 0 && (box.width < 40 || box.height < 40);
      });
      const obscuredControls = [...document.querySelectorAll("button, a[href], input, select, textarea")].filter((element) => {
        const box = element.getBoundingClientRect();
        if (box.width < 2 || box.height < 2 || box.bottom < 0 || box.top > innerHeight || box.right < 0 || box.left > innerWidth) return false;
        const x = Math.max(0, Math.min(innerWidth - 1, box.left + box.width / 2));
        const y = Math.max(0, Math.min(innerHeight - 1, box.top + box.height / 2));
        const hit = document.elementFromPoint(x, y);
        return Boolean(hit && hit !== element && !element.contains(hit) && !hit.contains(element));
      });

      return {
        contentWidth: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
        headingCount: document.querySelectorAll("h1").length,
        missingAltCount: document.querySelectorAll("img:not([alt])").length,
        namelessControlCount: [...document.querySelectorAll("button, a[href]")].filter((element) => !hasName(element)).length,
        unlabeledFieldCount: unlabeledFields.length,
        smallButtons: smallButtons.slice(0, 5).map((element) => element.getAttribute("aria-label") || element.textContent?.trim() || "button"),
        obscuredControls: obscuredControls.slice(0, 5).map((element) => element.getAttribute("aria-label") || element.textContent?.trim() || element.tagName)
      };
    });

    const issues = [];
    if (!response?.ok()) issues.push(`HTTP ${response?.status() ?? "无响应"}`);
    if (result.contentWidth > viewport.width + 1) issues.push(`横向溢出 ${result.contentWidth}px > ${viewport.width}px`);
    if (result.headingCount !== 1) issues.push(`主标题数量 ${result.headingCount}`);
    if (result.missingAltCount) issues.push(`${result.missingAltCount} 张图片缺少 alt`);
    if (result.namelessControlCount) issues.push(`${result.namelessControlCount} 个控件没有可访问名称`);
    if (result.unlabeledFieldCount) issues.push(`${result.unlabeledFieldCount} 个表单字段没有标签`);
    if (viewport.width < 768 && result.smallButtons.length) issues.push(`触屏按钮过小：${result.smallButtons.join("、")}`);
    if (result.obscuredControls.length) issues.push(`控件可能被遮挡：${result.obscuredControls.join("、")}`);
    if (runtimeErrors.length) issues.push(`运行时错误：${runtimeErrors.slice(0, 2).join(" | ")}`);
    if (issues.length) findings.push({ viewport: viewport.name, route, issues });

    checks += 1;
    await page.close();
  }
  await context.close();
}

await browser.close();

if (findings.length) {
  console.error(JSON.stringify({ checks, findings }, null, 2));
  process.exitCode = 1;
} else {
  console.log(`UI audit passed: ${checks} checks across ${fixedRoutes.length + recipeRoutes.length} routes.`);
}
