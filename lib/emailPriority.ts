export function getEmailPriority(email: any) {
  const headers = email.payload?.headers || [];

  const subject = headers.find((h: any) => h.name === "Subject")?.value || "";

  const from = headers.find((h: any) => h.name === "From")?.value || "";

  const text = (subject + " " + from).toLowerCase();

  if (
    text.includes("urgent") ||
    text.includes("meeting") ||
    text.includes("interview")
  ) {
    return "high";
  }

  if (
    text.includes("newsletter") ||
    text.includes("sale") ||
    text.includes("unsubscribe")
  ) {
    return "low";
  }

  return "normal";
}
