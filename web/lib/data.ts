import type {
  AssignmentRow,
  ClassRow,
  LearnerRow,
  MarkRow,
  PeriodRow,
  ReasonRow,
  RegisterRow,
  StreamRow,
  SubjectRow,
} from "@/lib/types";
import { coreFrom, createMetroskoolServerClient, monitorFrom } from "@/lib/supabase/server";

export async function loadClasses(schoolId: string): Promise<ClassRow[]> {
  const supabase = await createMetroskoolServerClient();
  const { data } = await coreFrom(supabase)
    .from("classes")
    .select("id, name, code, academic_year_id")
    .eq("school_id", schoolId)
    .eq("lifecycle_state", "active")
    .order("name");
  return (data ?? []) as ClassRow[];
}

export async function loadStreams(schoolId: string): Promise<StreamRow[]> {
  const supabase = await createMetroskoolServerClient();
  const { data } = await coreFrom(supabase)
    .from("streams")
    .select("id, name, class_id")
    .eq("school_id", schoolId)
    .order("name");
  return (data ?? []) as StreamRow[];
}

export async function loadLearners(schoolId: string): Promise<LearnerRow[]> {
  const supabase = await createMetroskoolServerClient();
  const { data } = await coreFrom(supabase)
    .from("learners")
    .select("id, first_name, last_name, admission_number")
    .eq("school_id", schoolId)
    .order("last_name");
  return (data ?? []) as LearnerRow[];
}

export async function loadEnrolments(
  schoolId: string,
  classId: string,
  streamId: string | null,
): Promise<string[]> {
  const supabase = await createMetroskoolServerClient();
  let query = coreFrom(supabase)
    .from("learner_enrolments")
    .select("learner_id")
    .eq("school_id", schoolId)
    .eq("class_id", classId)
    .eq("status", "active");
  if (streamId) {
    query = query.eq("stream_id", streamId);
  }
  const { data } = await query;
  return (data ?? []).map((row) => row.learner_id as string);
}

export async function loadSubjects(schoolId: string): Promise<SubjectRow[]> {
  const supabase = await createMetroskoolServerClient();
  const { data } = await monitorFrom(supabase)
    .from("subjects")
    .select("id, name, code")
    .eq("school_id", schoolId)
    .order("name");
  return (data ?? []) as SubjectRow[];
}

export async function loadPeriods(schoolId: string): Promise<PeriodRow[]> {
  const supabase = await createMetroskoolServerClient();
  const { data } = await monitorFrom(supabase)
    .from("periods")
    .select("id, name, weekday, sort_order")
    .eq("school_id", schoolId)
    .order("sort_order");
  return (data ?? []) as PeriodRow[];
}

export async function loadReasons(schoolId: string): Promise<ReasonRow[]> {
  const supabase = await createMetroskoolServerClient();
  const { data } = await monitorFrom(supabase)
    .from("absence_reasons")
    .select("id, code, label, is_excused")
    .eq("school_id", schoolId)
    .order("label");
  return (data ?? []) as ReasonRow[];
}

export async function loadAssignments(schoolId: string): Promise<AssignmentRow[]> {
  const supabase = await createMetroskoolServerClient();
  const { data } = await monitorFrom(supabase)
    .from("teacher_assignments")
    .select("id, profile_id, kind, class_id, stream_id, subject_id")
    .eq("school_id", schoolId)
    .order("kind");
  return (data ?? []) as AssignmentRow[];
}

export async function loadRegisters(schoolId: string): Promise<RegisterRow[]> {
  const supabase = await createMetroskoolServerClient();
  const { data } = await monitorFrom(supabase)
    .from("registers")
    .select("id, class_id, stream_id, subject_id, period_id, taken_on, status")
    .eq("school_id", schoolId)
    .order("taken_on", { ascending: false });
  return (data ?? []) as RegisterRow[];
}

export async function loadRegister(
  schoolId: string,
  registerId: string,
): Promise<RegisterRow | null> {
  const supabase = await createMetroskoolServerClient();
  const { data } = await monitorFrom(supabase)
    .from("registers")
    .select("id, class_id, stream_id, subject_id, period_id, taken_on, status")
    .eq("school_id", schoolId)
    .eq("id", registerId)
    .maybeSingle();
  return (data as RegisterRow | null) ?? null;
}

export async function loadMarks(schoolId: string, registerId: string): Promise<MarkRow[]> {
  const supabase = await createMetroskoolServerClient();
  const { data } = await monitorFrom(supabase)
    .from("attendance_marks")
    .select("id, register_id, learner_id, status, absence_reason_id")
    .eq("school_id", schoolId)
    .eq("register_id", registerId);
  return (data ?? []) as MarkRow[];
}

export async function loadTeacherDirectory(
  schoolId: string,
): Promise<{ id: string; display_name: string }[]> {
  const supabase = await createMetroskoolServerClient();
  const { data: memberships } = await coreFrom(supabase)
    .from("school_memberships")
    .select("profile_id")
    .eq("school_id", schoolId)
    .eq("status", "active");
  const ids = (memberships ?? []).map((row) => row.profile_id as string);
  if (ids.length === 0) return [];
  const { data } = await coreFrom(supabase)
    .from("profiles")
    .select("id, display_name")
    .in("id", ids)
    .order("display_name");
  return (data ?? []) as { id: string; display_name: string }[];
}
