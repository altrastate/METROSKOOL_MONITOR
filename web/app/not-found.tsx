import { ErrorScreen } from "@metroskool/web-ui";

export default function NotFound() {
  return (
    <ErrorScreen title="Page not found" message="That screen is not part of this workspace." />
  );
}
