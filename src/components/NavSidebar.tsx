"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";

const links = [
  { href: "/", label: "Overview", icon: "⬜" },
  { href: "/ownership", label: "Ownership", icon: "👥" },
  { href: "/pipeline", label: "Pipeline", icon: "📊" },
  { href: "/funnel", label: "Funnel", icon: "📉" },
  { href: "/winback", label: "Win-Back", icon: "🔄", disabled: false },
];

export default function NavSidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-60 lg:fixed lg:inset-y-0 bg-white border-r border-neutral-200 z-10">
        <div className="flex h-16 items-center px-6 border-b border-neutral-200">
          <span className="text-lg font-bold text-neutral-900 tracking-tight">
            LaMicro
          </span>
          <span className="ml-2 text-xs text-neutral-400 font-medium">Revenue Intel</span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={clsx(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  active
                    ? "bg-neutral-100 text-neutral-900"
                    : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                )}
              >
                <span className="text-base">{link.icon}</span>
                {link.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile bottom tab bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 z-10 flex">
        {links.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={clsx(
                "flex-1 flex flex-col items-center justify-center py-2 text-xs font-medium gap-0.5",
                active ? "text-neutral-900" : "text-neutral-500"
              )}
            >
              <span className="text-lg leading-none">{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
