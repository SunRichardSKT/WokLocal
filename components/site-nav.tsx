"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, ClipboardList, Github, Heart, Home, Menu, SearchCheck, ShoppingBasket, Soup, Sparkles, Wrench, Wheat, X } from "lucide-react";
import clsx from "clsx";
import { ThemeToggle } from "@/components/theme-toggle";

const navItems = [
  { href: "/", label: "首页", icon: Home },
  { href: "/today/", label: "今天吃什么", icon: Sparkles },
  { href: "/pantry/", label: "我有什么", icon: SearchCheck },
  { href: "/saved/", label: "我的菜谱", icon: Heart },
  { href: "/shopping-list/", label: "购物清单", icon: ShoppingBasket },
  { href: "/starter/", label: "落地清单与宝典", icon: ClipboardList },
  { href: "/recipes/", label: "菜谱", icon: BookOpen },
  { href: "/ingredients/", label: "食材对照", icon: Wheat },
  { href: "/equipment/", label: "厨具", icon: Wrench },
  { href: "/about/", label: "上传指南", icon: Github }
];

function isActive(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }
  return pathname.startsWith(href);
}

export function SiteNav() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <nav className="relative mx-auto max-w-6xl px-3 py-2.5 sm:px-4 sm:py-3">
      <div className="flex items-center justify-between gap-3">
        <Link href="/" className="flex min-w-0 shrink items-center gap-2">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-scallion text-ink-950">
            <Soup size={20} aria-hidden="true" />
          </span>
          <span className="truncate text-base font-semibold tracking-normal text-ink-100">就地开饭</span>
        </Link>

        <div className="flex shrink-0 items-center gap-2 sm:hidden">
          <ThemeToggle />
          <button
            aria-controls="mobile-site-nav"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "收起导航" : "展开导航"}
            className="flex size-11 items-center justify-center rounded-md border border-white/10 text-ink-100 transition hover:bg-white/[0.08]"
            onClick={() => setMenuOpen((open) => !open)}
            type="button"
          >
            {menuOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
          </button>
        </div>

        <div className="hidden items-center gap-1.5 text-sm text-ink-300 sm:flex">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(pathname, item.href);
            return (
              <Link
                className={clsx(
                  "flex size-10 shrink-0 items-center justify-center rounded-md transition hover:bg-white/[0.08]",
                  active && "bg-scallion text-ink-950 hover:bg-scallion"
                )}
                href={item.href}
                aria-label={item.label}
                aria-current={active ? "page" : undefined}
                title={item.label}
                key={item.href}
              >
                <Icon size={18} aria-hidden="true" />
              </Link>
            );
          })}
          <ThemeToggle />
        </div>
      </div>

      {menuOpen ? (
        <div className="mobile-nav-panel absolute left-0 right-0 top-full z-50 max-h-[calc(100dvh-4rem)] overflow-y-auto border-y border-white/10 bg-ink-950 p-3 shadow-soft sm:hidden" id="mobile-site-nav">
          <div className="grid grid-cols-3 gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(pathname, item.href);
              return (
                <Link
                  className={clsx(
                    "flex min-h-20 flex-col items-center justify-center gap-2 rounded-md border border-white/10 px-2 py-3 text-center text-xs leading-4 text-ink-300 transition hover:bg-white/[0.08]",
                    active && "border-scallion/60 bg-scallion/[0.12] text-scallion"
                  )}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  key={item.href}
                >
                  <Icon size={19} aria-hidden="true" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      ) : null}
    </nav>
  );
}
