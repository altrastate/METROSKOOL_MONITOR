import { PrintButton } from "@/components/PrintButton";
import { requireMonitorWorkspace } from "@/lib/workspace";
import { createMetroskoolServerClient, monitorFrom } from "@/lib/supabase/server";
import { brandCopy } from "@metroskool/brand";
import type { TrendRow } from "@/lib/types";

export const metadata = { title: "Reports" };

export default async function ReportsPage() {
  const workspace = await requireMonitorWorkspace();
  const supabase = await createMetroskoolServerClient();
  const { data } = await monitorFrom(supabase).rpc("attendance_trend_report", {
    p_school_id: workspace.school.school_id,
  });
  const rows = (data ?? []) as TrendRow[];

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Attendance reports</h1>
          <p className="mt-2 text-sm opacity-75">
            Trends stay inside Monitor. They are not exported to Pulse, Vote, or Archive.
          </p>
        </div>
        <div className="no-print flex flex-wrap gap-3">
          <PrintButton label="Print reports" />
          <a
            className="inline-flex h-10 items-center rounded-md bg-[var(--ms-color-deep-purple)] px-4 text-sm font-medium text-white"
            href="/monitor/reports/export"
          >
            Download Excel
          </a>
        </div>
      </section>
      <section className="rounded-xl border border-[var(--ms-color-light-purple)]/40 bg-white p-5">
        <h2 className="mb-4 text-lg font-semibold">By class</h2>
        {rows.length === 0 ? (
          <p className="text-sm opacity-70">No attendance yet.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--ms-color-light-purple)]/40">
                <th className="py-2 font-medium">Class</th>
                <th className="py-2 font-medium">Marks</th>
                <th className="py-2 font-medium">Present</th>
                <th className="py-2 font-medium">Absent</th>
                <th className="py-2 font-medium">Late</th>
                <th className="py-2 font-medium">Excused</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.class_id}
                  className="border-b border-[var(--ms-color-light-purple)]/20"
                >
                  <td className="py-2">{row.class_name}</td>
                  <td className="py-2">{row.mark_count}</td>
                  <td className="py-2">{row.present_count}</td>
                  <td className="py-2">{row.absent_count}</td>
                  <td className="py-2">{row.late_count}</td>
                  <td className="py-2">{row.excused_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
      <p className="text-xs opacity-60">{brandCopy.companyLine}</p>
    </div>
  );
}
