import { createReasonAction } from "@/app/actions/monitor";
import { Field, MonitorForm, SelectField } from "@/components/MonitorForm";
import { loadReasons } from "@/lib/data";
import { requireMonitorWorkspace } from "@/lib/workspace";

export const metadata = { title: "Absence reasons" };

export default async function ReasonsPage() {
  const workspace = await requireMonitorWorkspace();
  if (!workspace.school.is_monitor_admin) {
    return <p className="text-sm opacity-70">Only Monitor Admin can manage absence reasons.</p>;
  }
  const reasons = await loadReasons(workspace.school.school_id);

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h1 className="text-3xl font-semibold">Absence reasons</h1>
        <p className="mt-2 text-sm opacity-75">
          Attach a reason when a learner is absent or excused. Reasons stay inside Monitor.
        </p>
      </section>
      <section className="rounded-xl border border-[var(--ms-color-light-purple)]/40 bg-white p-5">
        <h2 className="mb-4 text-lg font-semibold">Add a reason</h2>
        <MonitorForm action={createReasonAction} submitLabel="Save reason">
          <Field name="code" label="Code" required />
          <Field name="label" label="Label" required />
          <SelectField name="isExcused" label="Counts as excused" defaultValue="true">
            <option value="true">Yes</option>
            <option value="false">No</option>
          </SelectField>
        </MonitorForm>
      </section>
      <ul className="flex flex-col gap-2">
        {reasons.length === 0 ? (
          <li className="text-sm opacity-70">No reasons yet.</li>
        ) : (
          reasons.map((row) => (
            <li
              key={row.id}
              className="rounded-xl border border-[var(--ms-color-light-purple)]/40 bg-white px-4 py-3 text-sm"
            >
              <span className="font-medium">{row.label}</span>
              <span className="opacity-70">
                {" "}
                · {row.code}
                {row.is_excused ? " · excused" : ""}
              </span>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
