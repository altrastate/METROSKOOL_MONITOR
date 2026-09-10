import { createServerClient } from "@supabase/ssr";
import { readPublicSupabaseEnv } from "@metroskool/supabase-client";
import { type NextRequest, NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  const { url, anonKey } = readPublicSupabaseEnv(process.env);

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  await supabase.auth.getClaims();
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|brand/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
