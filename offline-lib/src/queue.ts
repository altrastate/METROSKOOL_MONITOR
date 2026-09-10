import {
  decodeKey,
  decryptJson,
  encodeKey,
  encryptJson,
  LocalStorageStore,
  MemoryStore,
  randomAesKey,
  type KeyValueStore,
} from "./crypto";

export type AttendancePayload = {
  registerId: string;
  learnerId: string;
  status: string;
  idempotencyKey: string;
  reasonId: string | null;
  notes: string | null;
};

export type QueueItem<T> = {
  id: string;
  idempotencyKey: string;
  status: "pending" | "acked";
  conflictPolicy: "server_wins";
  payload: T;
  createdAt: string;
};

export type EnqueueResult<T> = {
  created: boolean;
  item: QueueItem<T>;
};

const QUEUE_KEY = "metroskool-monitor-offline-queue";
const KEY_REF = "metroskool-monitor-offline-key";

export class MonitorOfflineQueue {
  constructor(
    private readonly store: KeyValueStore,
    private readonly keyBytes: Uint8Array,
  ) {}

  private async readAll(): Promise<QueueItem<AttendancePayload>[]> {
    const blob = this.store.get(QUEUE_KEY);
    if (!blob) return [];
    return decryptJson<QueueItem<AttendancePayload>[]>(this.keyBytes, blob);
  }

  private async writeAll(items: QueueItem<AttendancePayload>[]): Promise<void> {
    this.store.set(QUEUE_KEY, await encryptJson(this.keyBytes, items));
  }

  async enqueueAttendance(payload: AttendancePayload): Promise<EnqueueResult<AttendancePayload>> {
    const items = await this.readAll();
    const existing = items.find((row) => row.idempotencyKey === payload.idempotencyKey);
    if (existing) {
      return { created: false, item: existing };
    }
    const item: QueueItem<AttendancePayload> = {
      id: payload.idempotencyKey,
      idempotencyKey: payload.idempotencyKey,
      status: "pending",
      conflictPolicy: "server_wins",
      payload,
      createdAt: new Date().toISOString(),
    };
    items.push(item);
    await this.writeAll(items);
    return { created: true, item };
  }

  async listPending(): Promise<QueueItem<AttendancePayload>[]> {
    const items = await this.readAll();
    return items.filter((row) => row.status === "pending");
  }

  async markAcked(idempotencyKey: string): Promise<void> {
    const items = await this.readAll();
    const next = items.map((row) =>
      row.idempotencyKey === idempotencyKey ? { ...row, status: "acked" as const } : row,
    );
    await this.writeAll(next);
  }
}

export function createOfflineQueue(
  store: KeyValueStore = new MemoryStore(),
  keyBytes: Uint8Array = randomAesKey(),
): MonitorOfflineQueue {
  return new MonitorOfflineQueue(store, keyBytes);
}

export function createBrowserOfflineQueue(): MonitorOfflineQueue {
  const store = new LocalStorageStore();
  const existing = store.get(KEY_REF);
  const keyBytes = existing ? decodeKey(existing) : randomAesKey();
  if (!existing) {
    store.set(KEY_REF, encodeKey(keyBytes));
  }
  return new MonitorOfflineQueue(store, keyBytes);
}

export { MemoryStore, LocalStorageStore };
