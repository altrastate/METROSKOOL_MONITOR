import { SignInForm } from "@/components/SignInForm";
import { logoPublicPath } from "@metroskool/brand";
import { AltrastateFooter, Logo } from "@metroskool/web-ui";

export const metadata = { title: "Sign in" };

export default async function MonitorSignInPage({
  searchParams,
}: {
  searchParams: Promise<{ denied?: string }>;
}) {
  const params = await searchParams;
  const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL ?? "http://localhost:3000";

  return (
    <main className="mx-auto flex min-h-[80vh] max-w-lg flex-col justify-center gap-8 px-6 py-16">
      <Logo product="monitor" src={logoPublicPath("monitor")} className="h-14" />
      <div>
        <h1 className="text-3xl font-semibold text-[var(--ms-color-deep-purple)]">
          Metroskool Monitor
        </h1>
        <p className="mt-3 text-sm text-[var(--ms-color-deep-purple)]/75">
          Monitor Admin and Teachers sign in here. Activate Monitor and approve officers in
          Metroskool Admin first. Class and subject scope is assigned under Teacher.
        </p>
        {params.denied === "1" ? (
          <p className="mt-3 text-sm text-[var(--ms-color-accent-red)]">
            Monitor is not active for your school, or you are not an approved Monitor Admin or
            Teacher.
          </p>
        ) : null}
      </div>
      <SignInForm />
      <p className="text-sm text-[var(--ms-color-deep-purple)]/70">
        Need to apply? Use Metroskool Admin at{" "}
        <a className="underline" href={adminUrl}>
          {adminUrl}
        </a>
        .
      </p>
      <AltrastateFooter discreet />
    </main>
  );
}
