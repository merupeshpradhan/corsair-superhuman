"use client";

import { extractEmailBody } from "@/lib/decodeEmail";

export default function EmailReader({ email }: { email: any }) {
  const headers = email.payload?.headers || [];

  const subject =
    headers.find((h: any) => h.name === "Subject")?.value || "No Subject";

  const from =
    headers.find((h: any) => h.name === "From")?.value || "Unknown";

  const body = extractEmailBody(email.payload);

  return (
    <div>
      <h2 className="text-xl font-bold">{subject}</h2>
      <p className="text-sm text-gray-500 mb-4">{from}</p>

      <div
        className="prose max-w-none"
        dangerouslySetInnerHTML={{ __html: body }}
      />
    </div>
  );
}