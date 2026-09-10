"use client";

import { signOutMonitorAction } from "@/app/actions/auth";
import { Button } from "@metroskool/web-ui";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function MonitorNav({
  schoolName,
  isMonitorAdmin,
}: {
  schoolName: string;
  isMonitorAdmin: boolean;
}) {
  const pathname = usePathname();
  const links = [
    { href: "/monitor", label: "Today" },
    { href: "/monitor/campus", label: "Classes" },
    { href: "/monitor/registers", label: "Registers" },
    { href: "/monitor/alerts", label: "Alerts" },
    { href: "/monitor/reports", label: "Reports" },
    ...(isMonitorAdmin
      ? [
          { href: "/monitor/subjects", label: "Subjects" },
          { href: "/monitor/periods", label: "Periods" },
          { href: "/monitor/assignments", label: "Assignments" },
          { href: "/monitor/reasons", label: "Reasons" },
        ]
      : []),
  ];

  return (
    <header className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-[var(--ms-color-secondary-purple)]">
            Teaching monitor{isMonitorAdmin ? " · Monitor Admin" : " · Teacher"}
          </p>
          <p className="text-lg font-semibold text-[var(--ms-color-deep-purple)]">{schoolName}</p>
        </div>
        <form action={signOutMonitorAction}>
          <Button type="submit" variant="ghost">
            Sign out
          </Button>
        </form>
      </div>
      <nav className="flex flex-wrap gap-2" aria-label="Monitor">
        {links.map((link) => {
          const current =
            link.href === "/monitor" ? pathname === "/monitor" : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={
                current
                  ? "inline-flex h-9 items-center rounded-md bg-[var(--ms-color-deep-purple)] px-3 text-sm font-medium text-white"
                  : "inline-flex h-9 items-center rounded-md bg-[var(--ms-color-soft-lavender)] px-3 text-sm font-medium text-[var(--ms-color-deep-purple)]"
              }
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
