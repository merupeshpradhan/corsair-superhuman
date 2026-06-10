export function decodeBase64(data: string) {
  return Buffer.from(data, "base64").toString("utf-8");
}

export function extractEmailBody(payload: any): string {
  if (!payload) return "";

  // simple email
  if (payload.body?.data) {
    return decodeBase64(payload.body.data);
  }

  // multipart email
  const parts = payload.parts || [];

  for (const part of parts) {
    if (part.mimeType === "text/html" && part.body?.data) {
      return decodeBase64(part.body.data);
    }

    if (part.mimeType === "text/plain" && part.body?.data) {
      return decodeBase64(part.body.data);
    }
  }

  return "";
}
