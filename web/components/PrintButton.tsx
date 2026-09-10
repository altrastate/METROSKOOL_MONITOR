"use client";

import { Button } from "@metroskool/web-ui";

export function PrintButton({ label = "Print" }: { label?: string }) {
  return (
    <Button type="button" variant="secondary" className="no-print" onClick={() => window.print()}>
      {label}
    </Button>
  );
}
