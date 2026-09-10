import { openRegisterAction } from "@/app/actions/monitor";
import { Field, MonitorForm, SelectField } from "@/components/MonitorForm";
import { loadClasses, loadPeriods, loadRegisters, loadStreams, loadSubjects } from "@/lib/data";
import { todayIsoDate } from "@/lib/types";
import { requireMonitorWorkspace } from "@/lib/workspace";
import Link from "next/link";

export const metadata = { title: "Registers" };

export default async function RegistersPage() {
  const workspace = await requireMonitorWorkspace();
  const schoolId = workspace.school.school_id;
  const [classes, streams, subjects, periods, registers] = await Promise.all([
    loadClasses(schoolId),
    loadStreams(schoolId),
    loadSubjects(schoolId),
    loadPeriods(schoolId),
    loadRegisters(schoolId),
  ]);
  const className = new Map(classes.map((row) => [row.id, row.name]));
  const streamName = new Map(streams.map((row) => [row.id, row.name]));
  const subjectName = new Map(subjects.map((row) => [row.id, row.name]));
  const periodName = new Map(periods.map((row) => [row.id, row.name]));

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h1 className="text-3xl font-semibold">Registers</h1>
        <p className="mt-2 text-sm opacity-75">
          Open a register for a class you are assigned to. Teachers cannot open a class or subject
          outside their assignment.
        </p>
      </section>
      <section className="rounded-xl border border-[var(--ms-color-light-purple)]/40 bg-white p-5">
        <h2 className="mb-4 text-lg font-semibold">Open a register</h2>
        <MonitorForm action={openRegisterAction} submitLabel="Open register">
          <SelectField name="classId" label="Class" required>
            <option value="">Select class</option>
            {classes.map((row) => (
              <option key={row.id} value={row.id}>
                {row.name}
              </option>
            ))}
          </SelectField>
          <SelectField name="streamId" label="Stream (optional)">
            <option value="">Whole class</option>
            {streams.map((row) => (
              <option key={row.id} value={row.id}>
                {className.get(row.class_id) ?? "Class"} · {row.name}
              </option>
            ))}
          </SelectField>
          <SelectField name="subjectId" label="Subject (subject teachers)">
            <option value="">Homeroom / class register</option>
            {subjects.map((row) => (
              <option key={row.id} value={row.id}>
                {row.name}
              </option>
            ))}
          </SelectField>
          <SelectField name="periodId" label="Period (optional)">
            <option value="">Any</option>
            {periods.map((row) => (
              <option key={row.id} value={row.id}>
                {row.name}
              </option>
            ))}
          </SelectField>
          <Field name="takenOn" label="Date" type="date" defaultValue={todayIsoDate()} required />
        </MonitorForm>
      </section>
      <section>
        <h2 className="mb-4 text-lg font-semibold">Recent registers</h2>
        {registers.length === 0 ? (
          <p className="text-sm opacity-70">No registers opened yet.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {registers.map((row) => (
              <li key={row.id}>
                <Link
                  className="block rounded-xl border border-[var(--ms-color-light-purple)]/40 bg-white px-4 py-3 text-sm underline"
                  href={`/monitor/registers/${row.id}`}
                >
                  {className.get(row.class_id) ?? "Class"}
                  {row.stream_id ? ` · ${streamName.get(row.stream_id) ?? "stream"}` : ""}
                  {row.subject_id ? ` · ${subjectName.get(row.subject_id) ?? "subject"}` : ""}
                  {row.period_id ? ` · ${periodName.get(row.period_id) ?? "period"}` : ""} ·{" "}
                  {row.taken_on}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
