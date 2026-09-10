"use client";

import { Button, Stack, TextField } from "@metroskool/web-ui";
import { useActionState, type ComponentProps, type ReactNode } from "react";
import type { ActionState } from "@/lib/types";

type Action = (state: ActionState, formData: FormData) => Promise<ActionState>;

export function MonitorForm({
  action,
  hidden,
  children,
  submitLabel,
  variant = "primary",
}: {
  action: Action;
  hidden?: Record<string, string>;
  children?: ReactNode;
  submitLabel: string;
  variant?: "primary" | "secondary" | "danger";
}) {
  const [state, formAction, pending] = useActionState(action, {} as ActionState);
  return (
    <form action={formAction}>
      <Stack gap="md">
        {hidden
          ? Object.entries(hidden).map(([name, value]) => (
              <input key={name} type="hidden" name={name} value={value} />
            ))
          : null}
        {children}
        {state.error ? (
          <p className="text-sm text-[var(--ms-color-accent-red)]" role="alert">
            {state.error}
          </p>
        ) : null}
        {state.message ? (
          <p className="text-sm text-[var(--ms-color-deep-purple)]">{state.message}</p>
        ) : null}
        <Button type="submit" disabled={pending} variant={variant}>
          {pending ? "Working…" : submitLabel}
        </Button>
      </Stack>
    </form>
  );
}

export function Field(props: ComponentProps<typeof TextField>) {
  return <TextField {...props} />;
}

export function SelectField({
  name,
  label,
  children,
  defaultValue,
  required,
}: {
  name: string;
  label: string;
  children: ReactNode;
  defaultValue?: string;
  required?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium text-[var(--ms-color-deep-purple)]">{label}</span>
      <select
        name={name}
        required={required}
        defaultValue={defaultValue}
        className="h-10 rounded-md border border-[var(--ms-color-light-purple)]/50 bg-white px-3 text-[var(--ms-color-deep-purple)]"
      >
        {children}
      </select>
    </label>
  );
}
