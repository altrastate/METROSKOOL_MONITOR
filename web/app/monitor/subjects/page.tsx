import { createSubjectAction } from "@/app/actions/monitor";
import { Field, MonitorForm } from "@/components/MonitorForm";
import { loadSubjects } from "@/lib/data";
import { requireMonitorWorkspace } from "@/lib/workspace";

export const metadata = { title: "Subjects" };

export default async function SubjectsPage() {
  const workspace = await requireMonitorWorkspace();
  if (!workspace.school.is_monitor_admin) {
    return <p className="text-sm opacity-70">Only Monitor Admin can manage subjects.</p>;
  }
  const subjects = await loadSubjects(workspace.school.school_id);

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h1 className="text-3xl font-semibold">Subjects</h1>
        <p className="mt-2 text-sm opacity-75">
          Subjects are Monitor-private. Assign them to teachers as subject-teacher scope.
        </p>
      </section>
      <section className="rounded-xl border border-[var(--ms-color-light-purple)]/40 bg-white p-5">
        <h2 className="mb-4 text-lg font-semibold">Add a subject</h2>
        <MonitorForm action={createSubjectAction} submitLabel="Save subject">
          <Field name="name" label="Name" required />
          <Field name="code" label="Code (optional)" />
        </MonitorForm>
      </section>
      <ul className="flex flex-col gap-2">
        {subjects.length === 0 ? (
          <li className="text-sm opacity-70">No subjects yet.</li>
        ) : (
          subjects.map((row) => (
            <li
              key={row.id}
              className="rounded-xl border border-[var(--ms-color-light-purple)]/40 bg-white px-4 py-3 text-sm"
            >
              <span className="font-medium">{row.name}</span>
              {row.code ? <span className="opacity-70"> · {row.code}</span> : null}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
