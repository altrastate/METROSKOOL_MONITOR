import { markAllPresentAction, overrideAttendanceAction } from "@/app/actions/monitor";
import { AttendanceMarkForm } from "@/components/AttendanceMarkForm";
import { Field, MonitorForm, SelectField } from "@/components/MonitorForm";
import {
  loadClasses,
  loadEnrolments,
  loadLearners,
  loadMarks,
  loadReasons,
  loadRegister,
} from "@/lib/data";
import { requireMonitorWorkspace } from "@/lib/workspace";
import { notFound } from "next/navigation";

export const metadata = { title: "Register" };

export default async function RegisterDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const workspace = await requireMonitorWorkspace();
  const schoolId = workspace.school.school_id;
  const register = await loadRegister(schoolId, id);
  if (!register) notFound();

  const [classes, learners, reasons, marks] = await Promise.all([
    loadClasses(schoolId),
    loadLearners(schoolId),
    loadReasons(schoolId),
    loadMarks(schoolId, register.id),
  ]);
  const enrolledIds = await loadEnrolments(schoolId, register.class_id, register.stream_id);
  const enrolled = learners.filter((row) => enrolledIds.includes(row.id));
  const className = classes.find((row) => row.id === register.class_id)?.name ?? "Class";
  const markByLearner = new Map(marks.map((row) => [row.learner_id, row]));

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h1 className="text-3xl font-semibold">
          {className} · {register.taken_on}
        </h1>
        <p className="mt-2 text-sm opacity-75">
          Mark the class present, then adjust absences. Offline marks use the same idempotency key,
          so reconnect cannot create a second row.
        </p>
      </section>
      {enrolled.length === 0 ? (
        <p className="text-sm opacity-70">
          No active enrolments for this class. Add learners in Metroskool Admin first.
        </p>
      ) : (
        <>
          <MonitorForm
            action={markAllPresentAction}
            hidden={{
              registerId: register.id,
              learnerIds: enrolled.map((row) => row.id).join(","),
            }}
            submitLabel="Mark all present"
            variant="secondary"
          />
          <AttendanceMarkForm
            registerId={register.id}
            learners={enrolled}
            marks={marks}
            reasons={reasons}
          />
        </>
      )}
      {workspace.school.is_monitor_admin && marks.length > 0 ? (
        <section className="rounded-xl border border-[var(--ms-color-light-purple)]/40 bg-white p-5">
          <h2 className="mb-4 text-lg font-semibold">Admin override</h2>
          <p className="mb-4 text-sm opacity-75">
            Overrides are audited. Use this when a mark must be corrected after the register is
            taken.
          </p>
          {marks.map((mark) => {
            const learner = enrolled.find((row) => row.id === mark.learner_id);
            return (
              <div key={mark.id} className="mb-6 last:mb-0">
                <p className="mb-2 text-sm font-medium">
                  {learner ? `${learner.first_name} ${learner.last_name}` : "Learner"} ·{" "}
                  {markByLearner.get(mark.learner_id)?.status}
                </p>
                <MonitorForm
                  action={overrideAttendanceAction}
                  hidden={{ markId: mark.id }}
                  submitLabel="Override"
                  variant="secondary"
                >
                  <SelectField name="status" label="New status" defaultValue={mark.status} required>
                    <option value="present">present</option>
                    <option value="absent">absent</option>
                    <option value="late">late</option>
                    <option value="excused">excused</option>
                  </SelectField>
                  <Field name="reason" label="Reason" required />
                </MonitorForm>
              </div>
            );
          })}
        </section>
      ) : null}
    </div>
  );
}
