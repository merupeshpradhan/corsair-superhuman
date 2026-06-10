import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getGmailClient } from "@/lib/gmail";

export async function GET(
  req: Request,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);

  if (!session?.accessToken) {
    return Response.json({ error: "No session" }, { status: 401 });
  }

  const gmail = getGmailClient(session.accessToken);

  const email = await gmail.users.messages.get({
    userId: "me",
    id: params.id,
    format: "full",
  });

  return Response.json(email.data);
}
