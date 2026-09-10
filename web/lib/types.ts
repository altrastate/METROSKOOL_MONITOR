export type ActionState = { error?: string; message?: string };

export type MonitorSchool = {
  school_id: string;
  school_name: string;
  school_slug: string;
  school_type: string;
  is_monitor_admin: boolean;
};

export type ClassRow = {
  id: string;
  name: string;
  code: string;
  academic_year_id: string | null;
};

export type StreamRow = {
  id: string;
  name: string;
  class_id: string;
};

export type LearnerRow = {
  id: string;
  first_name: string;
  last_name: string;
  admission_number: string | null;
};

export type SubjectRow = { id: string; name: string; code: string | null };
export type PeriodRow = {
  id: string;
  name: string;
  weekday: number | null;
  sort_order: number;
};
export type ReasonRow = { id: string; code: string; label: string; is_excused: boolean };
export type AssignmentRow = {
  id: string;
  profile_id: string;
  kind: string;
  class_id: string;
  stream_id: string | null;
  subject_id: string | null;
};
export type RegisterRow = {
  id: string;
  class_id: string;
  stream_id: string | null;
  subject_id: string | null;
  period_id: string | null;
  taken_on: string;
  status: string;
};
export type MarkRow = {
  id: string;
  register_id: string;
  learner_id: string;
  status: string;
  absence_reason_id: string | null;
};
export type AlertRow = {
  id: string;
  learner_id: string;
  kind: string;
  summary: string;
  status: string;
};
export type TrendRow = {
  class_id: string;
  class_name: string;
  mark_count: number;
  present_count: number;
  absent_count: number;
  late_count: number;
  excused_count: number;
};

export function learnerName(row: Pick<LearnerRow, "first_name" | "last_name">): string {
  return `${row.first_name} ${row.last_name}`.trim();
}

export function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}
