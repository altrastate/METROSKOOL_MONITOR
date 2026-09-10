import { createAssignmentAction } from "@/app/actions/monitor";
import { MonitorForm, SelectField } from "@/components/MonitorForm";
import {
  loadAssignments,
  loadClasses,
  loadStreams,
  loadSubjects,
  loadTeacherDirectory,
} from "@/lib/data";
import { requireMonitorWorkspace } from "@/lib/workspace";

export const metadata = { title: "Assignments" };

export default async function AssignmentsPage() {
  const workspace = await requireMonitorWorkspace();
  if (!workspace.school.is_monitor_admin) {
    return <p className="text-sm opacity-70">Only Monitor Admin can assign teachers.</p>;
  }
  const schoolId = workspace.school.school_id;
  const [classes, streams, subjects, teachers, assignments] = await Promise.all([
    loadClasses(schoolId),
    loadStreams(schoolId),
    loadSubjects(schoolId),
    loadTeacherDirectory(schoolId),
    loadAssignments(schoolId),
  ]);
  const className = new Map(classes.map((row) => [row.id, row.name]));
  const streamName = new Map(streams.map((row) => [row.id, row.name]));
  const subjectName = new Map(subjects.map((row) => [row.id, row.name]));
  const teacherName = new Map(teachers.map((row) => [row.id, row.display_name]));

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h1 className="text-3xl font-semibold">Teacher assignments</h1>
        <p className="mt-2 text-sm opacity-75">
          Class-teacher and subject-teacher are assignments under Teacher, not separate roles. Scope
          is enforced when a register is opened.
        </p>
      </section>
      <section className="rounded-xl border border-[var(--ms-color-light-purple)]/40 bg-white p-5">
        <h2 className="mb-4 text-lg font-semibold">Assign a teacher</h2>
        <MonitorForm action={createAssignmentAction} submitLabel="Save assignment">
          <SelectField name="profileId" label="Teacher" required>
            <option value="">Select teacher</option>
            {teachers.map((row) => (
              <option key={row.id} value={row.id}>
                {row.display_name}
              </option>
            ))}
          </SelectField>
          <SelectField name="kind" label="Kind" required>
            <option value="class_teacher">Class teacher</option>
            <option value="subject_teacher">Subject teacher</option>
          </SelectField>
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
          <SelectField name="subjectId" label="Subject (required for subject teachers)">
            <option value="">None</option>
            {subjects.map((row) => (
              <option key={row.id} value={row.id}>
                {row.name}
              </option>
            ))}
          </SelectField>
        </MonitorForm>
      </section>
      <ul className="flex flex-col gap-2">
        {assignments.length === 0 ? (
          <li className="text-sm opacity-70">No assignments yet.</li>
        ) : (
          assignments.map((row) => (
            <li
              key={row.id}
              className="rounded-xl border border-[var(--ms-color-light-purple)]/40 bg-white px-4 py-3 text-sm"
            >
              {teacherName.get(row.profile_id) ?? "Teacher"} · {row.kind.replace("_", " ")} ·{" "}
              {className.get(row.class_id) ?? "Class"}
              {row.stream_id ? ` · ${streamName.get(row.stream_id) ?? "stream"}` : ""}
              {row.subject_id ? ` · ${subjectName.get(row.subject_id) ?? "subject"}` : ""}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
