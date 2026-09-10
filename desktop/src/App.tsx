import { Button, Logo, Stack, TextField } from "@metroskool/web-ui";
import { logoPublicPath } from "@metroskool/brand";
import { useState } from "react";
import { isMonitorUrl } from "./monitor-url";

function isTauri(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

async function openMonitorWindow(url: string): Promise<void> {
  const { invoke } = await import("@tauri-apps/api/core");
  await invoke("open_monitor_window", { url });
}

async function openInSystemBrowser(url: string): Promise<void> {
  const { openUrl } = await import("@tauri-apps/plugin-opener");
  await openUrl(url);
}

export function App({ companyLine }: { companyLine: string }) {
  const [monitorUrl, setMonitorUrl] = useState(
    import.meta.env.VITE_MONITOR_URL ?? "http://localhost:3004/monitor",
  );
  const [adminUrl, setAdminUrl] = useState(
    import.meta.env.VITE_ADMIN_URL ?? "http://localhost:3000",
  );
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function onOpenMonitor(): Promise<void> {
    setError(null);
    setMessage(null);
    const trimmed = monitorUrl.trim();
    if (!isMonitorUrl(trimmed)) {
      setError("Windows Monitor only opens the teaching workspace at /monitor.");
      return;
    }
    try {
      if (isTauri()) {
        await openMonitorWindow(trimmed);
        setMessage(
          "Monitor window opened. Offline attendance uses the encrypted queue in that session.",
        );
      } else {
        window.open(trimmed, "_blank", "noopener,noreferrer");
        setMessage("Opened /monitor in a browser tab. Install Rust/Tauri for the Windows shell.");
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not open Monitor.");
    }
  }

  async function onOpenAdmin(): Promise<void> {
    setError(null);
    try {
      const target = adminUrl.trim() || "http://localhost:3000";
      if (isTauri()) {
        await openInSystemBrowser(target);
      } else {
        window.open(target, "_blank", "noopener,noreferrer");
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not open Admin.");
    }
  }

  return (
    <main
      style={{
        maxWidth: "36rem",
        margin: "0 auto",
        padding: "3rem 1.5rem",
        display: "flex",
        flexDirection: "column",
        gap: "2rem",
      }}
    >
      <Logo product="monitor" src={logoPublicPath("monitor")} className="h-14" />
      <div>
        <p
          style={{
            color: "var(--ms-color-secondary-purple)",
            fontSize: "0.875rem",
            fontWeight: 500,
          }}
        >
          Architecture for Campus Excellence
        </p>
        <h1
          style={{
            color: "var(--ms-color-deep-purple)",
            fontSize: "1.875rem",
            margin: "0.75rem 0 0",
          }}
        >
          Teaching monitor
        </h1>
        <p style={{ marginTop: "0.75rem", fontSize: "0.875rem", lineHeight: 1.5, opacity: 0.8 }}>
          This Windows app is for Monitor Admin and Teachers. It opens Metroskool Monitor{" "}
          <strong>/monitor</strong> only. Encrypted offline marks live in that session; reconnect
          uses the same idempotency key so an attendance row is never duplicated.
        </p>
      </div>
      <Stack gap="md">
        <TextField
          name="monitorUrl"
          label="Monitor /monitor URL"
          value={monitorUrl}
          onChange={(event) => setMonitorUrl(event.target.value)}
          hint="Local default is http://localhost:3004/monitor. Start Monitor web first."
        />
        <TextField
          name="adminUrl"
          label="Metroskool Admin (system browser)"
          value={adminUrl}
          onChange={(event) => setAdminUrl(event.target.value)}
        />
        {error ? (
          <p role="alert" style={{ color: "var(--ms-color-accent-red)", fontSize: "0.875rem" }}>
            {error}
          </p>
        ) : null}
        {message ? <p style={{ fontSize: "0.875rem" }}>{message}</p> : null}
        <Button type="button" onClick={() => void onOpenMonitor()}>
          Open Monitor
        </Button>
        <Button type="button" variant="ghost" onClick={() => void onOpenAdmin()}>
          Open Admin in browser
        </Button>
      </Stack>
      <p style={{ fontSize: "0.75rem", opacity: 0.6, textAlign: "center" }}>{companyLine}</p>
    </main>
  );
}
