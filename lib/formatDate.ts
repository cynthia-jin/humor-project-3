export function formatDate(utcString: string | null | undefined): string {
  if (!utcString) return "—";
  try {
    const date = new Date(utcString);
    if (isNaN(date.getTime())) return utcString;
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return utcString;
  }
}
