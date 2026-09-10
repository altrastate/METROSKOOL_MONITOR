import { CORE_SCHEMA, MONITOR_SCHEMA, readPublicSupabaseEnv } from "@metroskool/supabase-client";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";

export { CORE_SCHEMA, MONITOR_SCHEMA };

export async function createMetroskoolServerClient(): Promise<SupabaseClient> {
  const cookieStore = await cookies();
  const { url, anonKey } = readPublicSupabaseEnv(process.env);

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components cannot set cookies; proxy.ts refreshes the session.
        }
      },
    },
  });
}

type SchemaClient = Pick<SupabaseClient, "from" | "rpc">;

export function coreFrom(client: SupabaseClient): SchemaClient {
  return client.schema(CORE_SCHEMA) as unknown as SchemaClient;
}

export function monitorFrom(client: SupabaseClient): SchemaClient {
  return client.schema(MONITOR_SCHEMA) as unknown as SchemaClient;
}
