import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteNav } from "@/components/site-nav";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: "就地开饭 WokLocal",
  description: "给海外留学生和刚搬到国外的人用的厨房指南：查菜谱、找本地替代食材、买基础厨具，先把饭做起来。",
  openGraph: {
    title: "就地开饭 WokLocal",
    description: "从落地清单到快手菜谱，帮你用当地超市买得到的东西做出熟悉的一餐。",
    type: "website",
    locale: "zh_CN"
  },
  twitter: {
    card: "summary",
    title: "就地开饭 WokLocal",
    description: "海外生活厨房指南：菜谱、替代食材、厨具和采购建议。"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const themeScript = `try { const saved = localStorage.getItem("woklocal-theme"); const theme = saved === "light" || saved === "dark" ? saved : "dark"; document.documentElement.classList.toggle("light", theme === "light"); } catch {}`;

  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <div className="min-h-screen">
          <header className="sticky top-0 z-40 border-b border-white/10 bg-ink-950/[0.88] backdrop-blur">
            <SiteNav />
          </header>
          <main className="page-enter">{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
