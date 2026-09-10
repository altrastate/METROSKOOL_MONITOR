import { describe, expect, it } from "vitest";
import { isMonitorUrl } from "./monitor-url";

describe("Windows Monitor launcher", () => {
  it("opens /monitor only", () => {
    expect(isMonitorUrl("http://localhost:3004/monitor")).toBe(true);
    expect(isMonitorUrl("http://localhost:3004/monitor/registers")).toBe(true);
    expect(isMonitorUrl("http://localhost:3004/")).toBe(false);
    expect(isMonitorUrl("http://localhost:3001/admin")).toBe(false);
    expect(isMonitorUrl("http://localhost:3003/library")).toBe(false);
  });
});
