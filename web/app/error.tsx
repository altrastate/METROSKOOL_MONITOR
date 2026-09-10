"use client";

import { ErrorScreen } from "@metroskool/web-ui";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <ErrorScreen
      message="This page could not be loaded. Nothing was lost — try again."
      onRetry={reset}
    />
  );
}
