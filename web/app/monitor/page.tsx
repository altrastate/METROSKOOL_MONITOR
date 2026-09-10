import { refreshAlertsAction } from "@/app/actions/monitor";
import { MonitorForm } from "@/components/MonitorForm";
import { OfflineQueuePanel } from "@/components/OfflineQueuePanel";
import { loadClasses, loadRegisters } from "@/lib/data";
import { todayIsoDate } from "@/lib/types";
import { requireMonitorWorkspace } from "@/lib/workspace";
import { createMetroskoolServerClient, monitorFrom } from "@/lib/supabase/server";
import Link from "next/link";

export const metadata = { title: "Today" };

export default async function MonitorHomePage() {
  const workspace = await requireMonitorWorkspace();
  const schoolId = workspace.school.school_id;
  const supabase = await createMetroskoolServerClient();
  const [classes, registers, alerts] = await Promise.all([
    loadClasses(schoolId),
    loadRegisters(schoolId),
    monitorFrom(supabase)
      .from("alerts")
      .select("id, learner_id, summary, status")
      .eq("school_id", schoolId)
      .eq("status", "open")
      .order("created_at", { ascending: false }),
  ]);
  const className = new Map(classes.map((row) => [row.id, row.name]));
  const today = todayIsoDate();
  const todayRegisters = registers.filter((row) => row.taken_on === today);
  const openAlerts = alerts.data ?? [];

  return (
    <div className="flex flex-col gap-10">
      <section>
        <h1 className="text-3xl font-semibold">Today</h1>
        <p className="mt-2 text-sm opacity-75">
          Registers you can take, low-attendance alerts, and the encrypted offline queue.
        </p>
      </section>
      {openAlerts.length > 0 ? (
        <section className="rounded-xl border border-[var(--ms-color-accent-red)]/40 bg-white p-5">
          <h2 className="text-lg font-semibold text-[var(--ms-color-accent-red)]">Alerts</h2>
          <ul className="mt-3 flex flex-col gap-2 text-sm">
            {openAlerts.map((row) => (
              <li key={row.id as string}>{row.summary as string}</li>
            ))}
          </ul>
          <Link className="mt-3 inline-block text-sm underline" href="/monitor/alerts">
            Open alerts
          </Link>
        </section>
      ) : null}
      <section className="rounded-xl border border-[var(--ms-color-light-purple)]/40 bg-white p-5">
        <h2 className="text-lg font-semibold">Registers today</h2>
        {todayRegisters.length === 0 ? (
          <p className="mt-3 text-sm opacity-70">No registers opened for today yet.</p>
        ) : (
          <ul className="mt-3 flex flex-col gap-2 text-sm">
            {todayRegisters.map((row) => (
              <li key={row.id}>
                <Link className="underline" href={`/monitor/registers/${row.id}`}>
                  {className.get(row.class_id) ?? "Class"} · {row.taken_on}
                </Link>
              </li>
            ))}
          </ul>
        )}
        <Link className="mt-3 inline-block text-sm underline" href="/monitor/registers">
          Open a register
        </Link>
      </section>
      <section className="rounded-xl border border-[var(--ms-color-accent-yellow)]/50 bg-white p-5">
        <h2 className="mb-4 text-lg font-semibold">Offline queue</h2>
        <OfflineQueuePanel />
      </section>
      <MonitorForm action={refreshAlertsAction} submitLabel="Refresh alerts" variant="secondary" />
    </div>
  );
}
