"use client";

import { recordAttendanceAction } from "@/app/actions/monitor";
import { Field, MonitorForm, SelectField } from "@/components/MonitorForm";
import { learnerName, type LearnerRow, type MarkRow, type ReasonRow } from "@/lib/types";
import { Button } from "@metroskool/web-ui";
import { createBrowserOfflineQueue } from "metroskool-monitor-offline";
import { useState } from "react";

const STATUSES = ["present", "absent", "late", "excused"] as const;

export function AttendanceMarkForm({
  registerId,
  learners,
  marks,
  reasons,
}: {
  registerId: string;
  learners: LearnerRow[];
  marks: MarkRow[];
  reasons: ReasonRow[];
}) {
  const [offlineNote, setOfflineNote] = useState<string | null>(null);
  const markByLearner = new Map(marks.map((row) => [row.learner_id, row]));

  async function queueOffline(formData: FormData): Promise<void> {
    const learnerId = String(formData.get("learnerId") ?? "");
    const status = String(formData.get("status") ?? "");
    if (!learnerId || !status) return;
    const queue = createBrowserOfflineQueue();
    const result = await queue.enqueueAttendance({
      registerId,
      learnerId,
      status,
      idempotencyKey: `${registerId}:${learnerId}`,
      reasonId: String(formData.get("reasonId") ?? "") || null,
      notes: String(formData.get("notes") ?? "") || null,
    });
    setOfflineNote(
      result.created
        ? "Saved an encrypted mark on this device. Sync when you reconnect."
        : "That mark is already queued. Reconnect will not create a second attendance row.",
    );
  }

  return (
    <ul className="flex flex-col gap-4">
      {learners.map((learner) => {
        const existing = markByLearner.get(learner.id);
        return (
          <li
            key={learner.id}
            className="rounded-xl border border-[var(--ms-color-light-purple)]/40 bg-white p-5"
          >
            <p className="text-sm font-medium">{learnerName(learner)}</p>
            <p className="mt-1 text-sm opacity-70">
              {existing
                ? `Current: ${existing.status}`
                : "Not marked yet. Present, absent, late, or excused."}
            </p>
            <div className="mt-4 grid gap-6 md:grid-cols-2">
              <MonitorForm
                action={recordAttendanceAction}
                hidden={{
                  registerId,
                  learnerId: learner.id,
                  idempotencyKey: `${registerId}:${learner.id}`,
                }}
                submitLabel="Save mark"
              >
                <SelectField
                  name="status"
                  label="Status"
                  defaultValue={existing?.status ?? "present"}
                  required
                >
                  {STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </SelectField>
                <SelectField name="reasonId" label="Absence reason">
                  <option value="">None</option>
                  {reasons.map((reason) => (
                    <option key={reason.id} value={reason.id}>
                      {reason.label}
                    </option>
                  ))}
                </SelectField>
                <Field name="notes" label="Notes (optional)" />
              </MonitorForm>
              <form
                action={(formData) => {
                  void queueOffline(formData);
                }}
              >
                <input type="hidden" name="learnerId" value={learner.id} />
                <SelectField
                  name="status"
                  label="Status (offline queue)"
                  defaultValue="present"
                  required
                >
                  {STATUSES.map((status) => (
                    <option key={`off-${learner.id}-${status}`} value={status}>
                      {status}
                    </option>
                  ))}
                </SelectField>
                <div className="mt-3">
                  <SelectField name="reasonId" label="Absence reason (offline)">
                    <option value="">None</option>
                    {reasons.map((reason) => (
                      <option key={`off-r-${reason.id}`} value={reason.id}>
                        {reason.label}
                      </option>
                    ))}
                  </SelectField>
                </div>
                <div className="mt-3">
                  <Field name="notes" label="Notes (optional)" />
                </div>
                <div className="mt-3">
                  <Button type="submit" variant="secondary">
                    Queue offline mark
                  </Button>
                </div>
              </form>
            </div>
          </li>
        );
      })}
      {offlineNote ? <li className="text-sm">{offlineNote}</li> : null}
    </ul>
  );
}
