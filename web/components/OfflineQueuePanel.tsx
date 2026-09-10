"use client";

import { recordAttendanceAction } from "@/app/actions/monitor";
import { Button } from "@metroskool/web-ui";
import {
  createBrowserOfflineQueue,
  type AttendancePayload,
  type QueueItem,
} from "metroskool-monitor-offline";
import { useCallback, useEffect, useState } from "react";

const queue = createBrowserOfflineQueue();

export function OfflineQueuePanel() {
  const [items, setItems] = useState<QueueItem<AttendancePayload>[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    setItems(await queue.listPending());
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function syncNow(): Promise<void> {
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const pending = await queue.listPending();
      let synced = 0;
      for (const item of pending) {
        const formData = new FormData();
        formData.set("registerId", item.payload.registerId);
        formData.set("learnerId", item.payload.learnerId);
        formData.set("status", item.payload.status);
        formData.set("idempotencyKey", item.payload.idempotencyKey);
        if (item.payload.reasonId) formData.set("reasonId", item.payload.reasonId);
        if (item.payload.notes) formData.set("notes", item.payload.notes);
        const result = await recordAttendanceAction({}, formData);
        if (result.error) {
          setError(result.error);
          await refresh();
          setBusy(false);
          return;
        }
        await queue.markAcked(item.payload.idempotencyKey);
        synced += 1;
      }
      setMessage(
        synced === 0
          ? "No queued marks."
          : `Synced ${synced} mark${synced === 1 ? "" : "s"} without duplicating rows.`,
      );
      await refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not sync the offline queue.");
    }
    setBusy(false);
  }

  return (
    <div className="flex flex-col gap-3">
      {items.length > 0 ? (
        <ul className="text-sm">
          {items.map((item) => (
            <li key={item.payload.idempotencyKey}>
              Pending {item.payload.status} · learner {item.payload.learnerId.slice(0, 8)}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm opacity-70">
          Offline marks stay encrypted on this device. Reconnect and sync — the same key cannot
          create a second attendance row.
        </p>
      )}
      {error ? (
        <p className="text-sm text-[var(--ms-color-accent-red)]" role="alert">
          {error}
        </p>
      ) : null}
      {message ? <p className="text-sm">{message}</p> : null}
      <Button type="button" variant="secondary" disabled={busy} onClick={() => void syncNow()}>
        {busy ? "Syncing…" : "Sync queue"}
      </Button>
    </div>
  );
}
