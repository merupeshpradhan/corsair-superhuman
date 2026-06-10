import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { google } from "googleapis";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.accessToken) {
    return Response.json({ error: "No session" }, { status: 401 });
  }

  const { title, time } = await req.json();

  const calendar = google.calendar({ version: "v3" });

  const event = {
    summary: title,
    start: {
      dateTime: new Date(time).toISOString(),
    },
    end: {
      dateTime: new Date(
        new Date(time).getTime() + 60 * 60 * 1000,
      ).toISOString(),
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

  return Response.json({ result: "Event created 📅" });
}
