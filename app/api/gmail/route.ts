import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getGmailClient } from "@/lib/gmail";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.accessToken) {
    return Response.json({ error: "No session" }, { status: 401 });
  }

  const gmail = getGmailClient(session.accessToken);

  const messages = await gmail.users.messages.list({
    userId: "me",
    maxResults: 10,
  });

  const fullEmails = await Promise.all(
    messages.data.messages?.map(async (msg) => {
      const full = await gmail.users.messages.get({
        userId: "me",
        id: msg.id!,
      });

      return full.data;
    }) || []
  );

  return Response.json(fullEmails);
}