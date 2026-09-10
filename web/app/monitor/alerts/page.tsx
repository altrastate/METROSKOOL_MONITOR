import { acknowledgeAlertAction, refreshAlertsAction } from "@/app/actions/monitor";
import { MonitorForm } from "@/components/MonitorForm";
import { loadLearners } from "@/lib/data";
import { learnerName } from "@/lib/types";
import { requireMonitorWorkspace } from "@/lib/workspace";
import { createMetroskoolServerClient, monitorFrom } from "@/lib/supabase/server";

export const metadata = { title: "Alerts" };

export default async function AlertsPage() {
  const workspace = await requireMonitorWorkspace();
  const schoolId = workspace.school.school_id;
  const supabase = await createMetroskoolServerClient();
  const [{ data }, learners] = await Promise.all([
    monitorFrom(supabase)
      .from("alerts")
      .select("id, learner_id, kind, summary, status")
      .eq("school_id", schoolId)
      .order("created_at", { ascending: false }),
    loadLearners(schoolId),
  ]);
  const learnerById = new Map(learners.map((row) => [row.id, row]));
  const alerts = data ?? [];
  const open = alerts.filter((row) => row.status === "open");

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h1 className="text-3xl font-semibold">Attendance alerts</h1>
        <p className="mt-2 text-sm opacity-75">
          Low attendance (under 75% over seven days) stays inside Monitor. Refresh after registers
          are taken.
        </p>
      </section>
      <MonitorForm action={refreshAlertsAction} submitLabel="Refresh alerts" variant="secondary" />
      {open.length === 0 ? (
        <p className="text-sm opacity-70">No open alerts.</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {open.map((row) => {
            const learner = learnerById.get(row.learner_id as string);
            return (
              <li
                key={row.id as string}
                className="rounded-xl border border-[var(--ms-color-accent-red)]/30 bg-white p-5"
              >
                <p className="text-sm font-medium">
                  {learner ? learnerName(learner) : "Learner"} · {row.kind as string}
                </p>
                <p className="mt-1 text-sm opacity-75">{row.summary as string}</p>
                <div className="mt-4">
                  <MonitorForm
                    action={acknowledgeAlertAction}
                    hidden={{ alertId: row.id as string }}
                    submitLabel="Acknowledge"
                    variant="secondary"
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
