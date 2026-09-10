import { monitorFrom, createMetroskoolServerClient } from "@/lib/supabase/server";
import type { MonitorSchool } from "@/lib/types";
import { redirect } from "next/navigation";

export type MonitorWorkspace = {
  userId: string;
  schools: MonitorSchool[];
  school: MonitorSchool;
};

export async function requireMonitorWorkspace(schoolId?: string): Promise<MonitorWorkspace> {
  const supabase = await createMetroskoolServerClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;
  if (!userId || typeof userId !== "string") {
    redirect("/");
  }

  const { data, error } = await monitorFrom(supabase).rpc("my_monitor_schools");
  if (error) {
    redirect("/?denied=1");
  }

  const schools = (data ?? []) as MonitorSchool[];
  if (schools.length === 0) {
    redirect("/?denied=1");
  }

  const school =
    (schoolId ? schools.find((row) => row.school_id === schoolId) : undefined) ?? schools[0];
  if (!school) {
    redirect("/?denied=1");
  }

  return { userId, schools, school };
}
