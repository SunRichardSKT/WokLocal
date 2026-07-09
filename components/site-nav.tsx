"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, ChefHat, ClipboardList, Github, Home, Soup, Sparkles, Wrench, Wheat } from "lucide-react";
import clsx from "clsx";

const navItems = [
  { href: "/", label: "首页", icon: Home },
  { href: "/today/", label: "今天吃什么", icon: Sparkles },
  { href: "/starter/", label: "第一周清单", icon: ClipboardList },
  { href: "/recipes/", label: "菜谱", icon: BookOpen },
  { href: "/ingredients/", label: "食材对照", icon: Wheat },
  { href: "/equipment/", label: "厨具", icon: Wrench },
  { href: "/guides/", label: "宝典", icon: ChefHat },
  { href: "/about/", label: "贡献指南", icon: Github }
];

function isActive(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }
  return pathname.startsWith(href);
}

export function SiteNav() {
  const pathname = usePathname();

  return (
    <nav className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
      <Link href="/" className="flex min-w-0 items-center gap-2">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-scallion text-ink-950">
          <Soup size={20} aria-hidden="true" />
        </span>
        <span className="truncate text-base font-semibold tracking-normal text-ink-100">就地开饭</span>
      </Link>
      <div className="flex items-center gap-1.5 overflow-x-auto text-sm text-ink-300">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(pathname, item.href);
          return (
            <Link
              className={clsx(
                "flex size-9 shrink-0 items-center justify-center rounded-md transition hover:bg-white/[0.08]",
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
      </div>
    </nav>
  );
}
