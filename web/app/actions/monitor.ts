"use server";

import type { ActionState } from "@/lib/types";
import { requireMonitorWorkspace } from "@/lib/workspace";
import { createMetroskoolServerClient, monitorFrom } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

function text(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

function emptyToNull(value: string): string | null {
  return value || null;
}

async function monitorRpc(
  name: string,
  args: Record<string, unknown>,
  success: string,
): Promise<ActionState> {
  await requireMonitorWorkspace();
  const supabase = await createMetroskoolServerClient();
  const { error } = await monitorFrom(supabase).rpc(name, args);
  if (error) {
    return { error: error.message };
  }
  return { message: success };
}

export async function createSubjectAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const workspace = await requireMonitorWorkspace();
  if (!workspace.school.is_monitor_admin) {
    return { error: "Only Monitor Admin can add subjects." };
  }
  const name = text(formData, "name");
  if (!name) return { error: "Subject name is required." };
  const supabase = await createMetroskoolServerClient();
  const { error } = await monitorFrom(supabase)
    .from("subjects")
    .insert({
      school_id: workspace.school.school_id,
      name,
      code: emptyToNull(text(formData, "code")),
    });
  if (error) return { error: error.message };
  return { message: `Added ${name}.` };
}

export async function createPeriodAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const workspace = await requireMonitorWorkspace();
  if (!workspace.school.is_monitor_admin) {
    return { error: "Only Monitor Admin can add periods." };
  }
  const name = text(formData, "name");
  if (!name) return { error: "Period name is required." };
  const supabase = await createMetroskoolServerClient();
  const weekday = text(formData, "weekday");
  const { error } = await monitorFrom(supabase)
    .from("periods")
    .insert({
      school_id: workspace.school.school_id,
      name,
      weekday: weekday ? Number(weekday) : null,
      sort_order: Number(text(formData, "sortOrder") || "0"),
    });
  if (error) return { error: error.message };
  return { message: `Added period ${name}.` };
}

export async function createReasonAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const workspace = await requireMonitorWorkspace();
  if (!workspace.school.is_monitor_admin) {
    return { error: "Only Monitor Admin can add absence reasons." };
  }
  const code = text(formData, "code");
  const label = text(formData, "label");
  if (!code || !label) return { error: "Code and label are required." };
  const supabase = await createMetroskoolServerClient();
  const { error } = await monitorFrom(supabase)
    .from("absence_reasons")
    .insert({
      school_id: workspace.school.school_id,
      code,
      label,
      is_excused: text(formData, "isExcused") !== "false",
    });
  if (error) return { error: error.message };
  return { message: `Added reason ${label}.` };
}

export async function createAssignmentAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const workspace = await requireMonitorWorkspace();
  if (!workspace.school.is_monitor_admin) {
    return { error: "Only Monitor Admin can assign teachers." };
  }
  const profileId = text(formData, "profileId");
  const classId = text(formData, "classId");
  const kind = text(formData, "kind");
  if (!profileId || !classId || (kind !== "class_teacher" && kind !== "subject_teacher")) {
    return { error: "Teacher, class, and assignment kind are required." };
  }
  if (kind === "subject_teacher" && !text(formData, "subjectId")) {
    return { error: "Subject teachers need a subject." };
  }
  const supabase = await createMetroskoolServerClient();
  const { error } = await monitorFrom(supabase)
    .from("teacher_assignments")
    .insert({
      school_id: workspace.school.school_id,
      profile_id: profileId,
      kind,
      class_id: classId,
      stream_id: emptyToNull(text(formData, "streamId")),
      subject_id: kind === "subject_teacher" ? text(formData, "subjectId") : null,
    });
  if (error) return { error: error.message };
  return { message: "Assignment saved. Class/subject scope is now enforced." };
}

export async function openRegisterAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const classId = text(formData, "classId");
  const takenOn = text(formData, "takenOn");
  if (!classId || !takenOn) return { error: "Class and date are required." };
  await requireMonitorWorkspace();
  const supabase = await createMetroskoolServerClient();
  const { data, error } = await monitorFrom(supabase).rpc("open_register", {
    p_class_id: classId,
    p_taken_on: takenOn,
    p_stream_id: emptyToNull(text(formData, "streamId")),
    p_subject_id: emptyToNull(text(formData, "subjectId")),
    p_period_id: emptyToNull(text(formData, "periodId")),
  });
  if (error) return { error: error.message };
  if (typeof data === "string") {
    redirect(`/monitor/registers/${data}`);
  }
  return { message: "Register opened." };
}

export async function recordAttendanceAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const registerId = text(formData, "registerId");
  const learnerId = text(formData, "learnerId");
  const status = text(formData, "status");
  if (!registerId || !learnerId || !status) {
    return { error: "Learner and status are required." };
  }
  const key = text(formData, "idempotencyKey") || crypto.randomUUID();
  return monitorRpc(
    "record_attendance",
    {
      p_register_id: registerId,
      p_learner_id: learnerId,
      p_status: status,
      p_idempotency_key: key,
      p_absence_reason_id: emptyToNull(text(formData, "reasonId")),
      p_notes: emptyToNull(text(formData, "notes")),
    },
    `Saved ${status}.`,
  );
}

export async function markAllPresentAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const registerId = text(formData, "registerId");
  const rawIds = text(formData, "learnerIds");
  if (!registerId || !rawIds) {
    return { error: "Register and learners are required." };
  }
  await requireMonitorWorkspace();
  const supabase = await createMetroskoolServerClient();
  const learnerIds = rawIds.split(",").filter(Boolean);
  const results = await Promise.all(
    learnerIds.map((learnerId) =>
      monitorFrom(supabase).rpc("record_attendance", {
        p_register_id: registerId,
        p_learner_id: learnerId,
        p_status: "present",
        p_idempotency_key: `${registerId}:${learnerId}`,
        p_absence_reason_id: null,
        p_notes: null,
      }),
    ),
  );
  const failed = results.find((row) => row.error);
  if (failed?.error) {
    return { error: failed.error.message };
  }
  return { message: `Marked ${learnerIds.length} present.` };
}

export async function overrideAttendanceAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const workspace = await requireMonitorWorkspace();
  if (!workspace.school.is_monitor_admin) {
    return { error: "Only Monitor Admin can override a mark." };
  }
  const markId = text(formData, "markId");
  const status = text(formData, "status");
  if (!markId || !status) return { error: "Mark and status are required." };
  return monitorRpc(
    "override_attendance",
    {
      p_mark_id: markId,
      p_status: status,
      p_reason: text(formData, "reason") || "Admin override",
    },
    "Override recorded.",
  );
}

export async function refreshAlertsAction(
  _prev: ActionState,
  _formData: FormData,
): Promise<ActionState> {
  const workspace = await requireMonitorWorkspace();
  return monitorRpc(
    "refresh_attendance_alerts",
    { p_school_id: workspace.school.school_id },
    "Attendance alerts refreshed.",
  );
}

export async function acknowledgeAlertAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const workspace = await requireMonitorWorkspace();
  const alertId = text(formData, "alertId");
  if (!alertId) return { error: "Alert is required." };
  const supabase = await createMetroskoolServerClient();
  const { error } = await monitorFrom(supabase)
    .from("alerts")
    .update({ status: "acked" })
    .eq("id", alertId)
    .eq("school_id", workspace.school.school_id);
  if (error) return { error: error.message };
  return { message: "Alert acknowledged." };
}
