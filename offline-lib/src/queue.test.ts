import { describe, expect, it } from "vitest";
import { createOfflineQueue, encryptJson, decryptJson, MemoryStore, randomAesKey } from "./index";

describe("Monitor offline attendance queue", () => {
  it("encrypts payloads so plaintext is not stored", async () => {
    const key = randomAesKey();
    const blob = await encryptJson(key, { learnerId: "secret-learner" });
    expect(blob).not.toContain("secret-learner");
    const roundTrip = await decryptJson<{ learnerId: string }>(key, blob);
    expect(roundTrip.learnerId).toBe("secret-learner");
  });

  it("does not create a second logical mark for the same idempotency key", async () => {
    const queue = createOfflineQueue(new MemoryStore());
    const payload = {
      registerId: "reg-1",
      learnerId: "learner-1",
      status: "absent",
      idempotencyKey: "offline-mark-1",
      reasonId: null,
      notes: null,
    };
    const first = await queue.enqueueAttendance(payload);
    const second = await queue.enqueueAttendance({ ...payload, status: "present" });
    expect(first.created).toBe(true);
    expect(second.created).toBe(false);
    expect(second.item.payload.status).toBe("absent");
    const pending = await queue.listPending();
    expect(pending).toHaveLength(1);
  });

  it("keeps distinct keys as separate pending marks", async () => {
    const queue = createOfflineQueue(new MemoryStore());
    await queue.enqueueAttendance({
      registerId: "reg-1",
      learnerId: "learner-1",
      status: "present",
      idempotencyKey: "key-a",
      reasonId: null,
      notes: null,
    });
    await queue.enqueueAttendance({
      registerId: "reg-1",
      learnerId: "learner-2",
      status: "absent",
      idempotencyKey: "key-b",
      reasonId: null,
      notes: null,
    });
    expect(await queue.listPending()).toHaveLength(2);
  });

  it("drops acked items from the pending list after reconnect", async () => {
    const queue = createOfflineQueue(new MemoryStore());
    await queue.enqueueAttendance({
      registerId: "reg-1",
      learnerId: "learner-1",
      status: "late",
      idempotencyKey: "offline-mark-1",
      reasonId: null,
      notes: null,
    });
    await queue.markAcked("offline-mark-1");
    expect(await queue.listPending()).toHaveLength(0);
  });
});
