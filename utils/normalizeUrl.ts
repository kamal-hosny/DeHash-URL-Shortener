export function normalizeUrl(raw: string): string {
  if (!raw) return "";
  let formatted = raw.trim();
  if (!/^https?:\/\//i.test(formatted)) {
    formatted = `https://${formatted}`;
  }
  try {
    const parsed = new URL(formatted);
    let path = parsed.pathname;
    if (path.length > 1 && path.endsWith("/")) {
      path = path.slice(0, -1);
    }
    return `${parsed.protocol}//${parsed.host.toLowerCase()}${path}${parsed.search}`;
  } catch {
    return formatted.toLowerCase().replace(/\/+$/, "");
  }
}

