import { createPeriodAction } from "@/app/actions/monitor";
import { Field, MonitorForm, SelectField } from "@/components/MonitorForm";
import { loadPeriods } from "@/lib/data";
import { requireMonitorWorkspace } from "@/lib/workspace";

export const metadata = { title: "Periods" };

const WEEKDAYS = [
  { value: "", label: "Any day" },
  { value: "1", label: "Monday" },
  { value: "2", label: "Tuesday" },
  { value: "3", label: "Wednesday" },
  { value: "4", label: "Thursday" },
  { value: "5", label: "Friday" },
  { value: "6", label: "Saturday" },
  { value: "7", label: "Sunday" },
];

export default async function PeriodsPage() {
  const workspace = await requireMonitorWorkspace();
  if (!workspace.school.is_monitor_admin) {
    return <p className="text-sm opacity-70">Only Monitor Admin can manage timetable periods.</p>;
  }
  const periods = await loadPeriods(workspace.school.school_id);

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h1 className="text-3xl font-semibold">Periods</h1>
        <p className="mt-2 text-sm opacity-75">
          Timetable slots for registers. Academic years and terms stay in Admin campus structure.
        </p>
      </section>
      <section className="rounded-xl border border-[var(--ms-color-light-purple)]/40 bg-white p-5">
        <h2 className="mb-4 text-lg font-semibold">Add a period</h2>
        <MonitorForm action={createPeriodAction} submitLabel="Save period">
          <Field name="name" label="Name" required />
          <SelectField name="weekday" label="Weekday">
            {WEEKDAYS.map((day) => (
              <option key={day.value || "any"} value={day.value}>
                {day.label}
              </option>
            ))}
          </SelectField>
          <Field name="sortOrder" label="Sort order" type="number" defaultValue="0" />
        </MonitorForm>
      </section>
      <ul className="flex flex-col gap-2">
        {periods.length === 0 ? (
          <li className="text-sm opacity-70">No periods yet.</li>
        ) : (
          periods.map((row) => (
            <li
              key={row.id}
              className="rounded-xl border border-[var(--ms-color-light-purple)]/40 bg-white px-4 py-3 text-sm"
            >
              <span className="font-medium">{row.name}</span>
              <span className="opacity-70"> · order {row.sort_order}</span>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
