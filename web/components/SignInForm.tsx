"use client";

import { signInMonitorAction } from "@/app/actions/auth";
import { Button, Stack, TextField } from "@metroskool/web-ui";
import { useActionState } from "react";

const initial: { error?: string; message?: string } = {};

export function SignInForm() {
  const [state, action, pending] = useActionState(signInMonitorAction, initial);
  return (
    <form action={action}>
      <Stack gap="md">
        <TextField name="email" label="Email" type="email" autoComplete="email" required />
        <TextField
          name="password"
          label="Password"
          type="password"
          autoComplete="current-password"
          required
        />
        {state.error ? (
          <p className="text-sm text-[var(--ms-color-accent-red)]" role="alert">
            {state.error}
          </p>
        ) : null}
        <Button type="submit" disabled={pending}>
          {pending ? "Signing in…" : "Sign in"}
        </Button>
      </Stack>
    </form>
  );
}
