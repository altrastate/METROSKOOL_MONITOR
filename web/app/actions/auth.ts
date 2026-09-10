"use server";

import type { ActionState } from "@/lib/types";
import { createMetroskoolServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function signInMonitorAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) {
    return { error: "Enter your email and password." };
  }

  const supabase = await createMetroskoolServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return {
      error: "Could not sign in. Apply as Monitor Admin or Teacher in Metroskool Admin first.",
    };
  }

  redirect("/monitor");
}

export async function signOutMonitorAction(): Promise<void> {
  const supabase = await createMetroskoolServerClient();
  await supabase.auth.signOut();
  redirect("/");
}
