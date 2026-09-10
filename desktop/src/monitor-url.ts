export function isMonitorUrl(href: string): boolean {
  try {
    const url = new URL(href);
    const path = url.pathname;
    return path === "/monitor" || path.startsWith("/monitor/");
  } catch {
    return false;
  }
}
