import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { google } from "googleapis";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.accessToken) {
    return Response.json({ error: "No session" }, { status: 401 });
  }

  const { text } = await req.json();
  const lower = text.toLowerCase();

  const gmail = new google.gmail({ version: "v1" });
  const calendar = google.calendar({ version: "v3" });

  // 📩 EMAIL COMMAND
  if (lower.includes("send email")) {
    const to = extract(text, "to");

    const email = [`To: ${to}`, `Subject: AI Assistant`, "", text].join("\n");

    const encoded = Buffer.from(email)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    await gmail.users.messages.send({
      userId: "me",
      requestBody: { raw: encoded },
      auth: { credentials: { access_token: session.accessToken } } as any,
    });

    return Response.json({ result: "Email sent 🚀" });
  }

  // 📅 CALENDAR COMMAND
  if (lower.includes("schedule") || lower.includes("meeting")) {
    const timeMatch = text.match(/(\d{1,2})(am|pm)/i);

    let hour = 9;
    if (timeMatch) {
      hour = parseInt(timeMatch[1]);
      if (timeMatch[2].toLowerCase() === "pm") hour += 12;
    }

    const date = new Date();
    date.setHours(hour, 0, 0, 0);

    const event = {
      summary: "AI Scheduled Meeting",
      start: { dateTime: date.toISOString() },
      end: {
        dateTime: new Date(date.getTime() + 60 * 60 * 1000).toISOString(),
      },
    };

    await calendar.events.insert({
      calendarId: "primary",
      requestBody: event,
      auth: {
        credentials: {
          access_token: session.accessToken,
        },
      } as any,
    });

    return Response.json({ result: "Meeting scheduled 📅" });
  }

  return Response.json({
    result: "Command not understood 🤖",
  });
}

// helper
function extract(text: string, keyword: string) {
  const regex = new RegExp(`${keyword} (.+)`, "i");
  const match = text.match(regex);
  return match ? match[1] : "";
}
