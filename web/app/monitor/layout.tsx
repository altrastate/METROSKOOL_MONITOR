import { MonitorNav } from "@/components/MonitorNav";
import { requireMonitorWorkspace } from "@/lib/workspace";
import { logoPublicPath } from "@metroskool/brand";
import { Logo } from "@metroskool/web-ui";
import type { ReactNode } from "react";

export const dynamic = "force-dynamic";

export default async function MonitorLayout({ children }: { children: ReactNode }) {
  const workspace = await requireMonitorWorkspace();
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-10 px-6 py-12">
      <Logo product="monitor" src={logoPublicPath("monitor")} className="no-print h-12" />
      <div className="no-print">
        <MonitorNav
          schoolName={workspace.school.school_name}
          isMonitorAdmin={workspace.school.is_monitor_admin}
        />
      </div>
      {children}
    </div>
  );
}
