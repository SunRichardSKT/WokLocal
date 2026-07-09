import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteNav } from "@/components/site-nav";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: "就地开饭 WokLocal",
  description: "面向海外新生的本地化厨房知识库：菜谱、替代食材、厨具和落地购买建议。",
  openGraph: {
    title: "就地开饭 WokLocal",
    description: "按地区查本地替代食材、厨具购买建议和留学生厨房菜。",
    type: "website",
    locale: "zh_CN"
  },
  twitter: {
    card: "summary",
    title: "就地开饭 WokLocal",
    description: "面向海外新生的本地化厨房知识库。"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <div className="min-h-screen">
          <header className="sticky top-0 z-40 border-b border-white/10 bg-ink-950/[0.88] backdrop-blur">
            <SiteNav />
          </header>
          <main>{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
