import { requireMonitorWorkspace } from "@/lib/workspace";
import { createMetroskoolServerClient, monitorFrom } from "@/lib/supabase/server";
import { xlsxResponse } from "@/lib/xlsx-response";
import type { TrendRow } from "@/lib/types";
import ExcelJS from "exceljs";

export const dynamic = "force-dynamic";

export async function GET() {
  const workspace = await requireMonitorWorkspace();
  const supabase = await createMetroskoolServerClient();
  const { data } = await monitorFrom(supabase).rpc("attendance_trend_report", {
    p_school_id: workspace.school.school_id,
  });
  const rows = (data ?? []) as TrendRow[];

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Metroskool Monitor";
  const sheet = workbook.addWorksheet("Attendance");
  sheet.addRow(["Class", "Marks", "Present", "Absent", "Late", "Excused"]);
  for (const row of rows) {
    sheet.addRow([
      row.class_name,
      Number(row.mark_count),
      Number(row.present_count),
      Number(row.absent_count),
      Number(row.late_count),
      Number(row.excused_count),
    ]);
  }

  const buffer = await workbook.xlsx.writeBuffer();
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer as ArrayBuffer);
  return xlsxResponse(bytes, `monitor-attendance-${workspace.school.school_slug}.xlsx`);
}
