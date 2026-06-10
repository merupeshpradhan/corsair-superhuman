"use client";

import { useEffect, useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import EmailReader from "@/components/EmailReader";
import { getEmailPriority } from "@/lib/emailPriority";

export default function Home() {
  const { data: session } = useSession();

  const [emails, setEmails] = useState<any[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<any>(null);

  const [command, setCommand] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  // 📩 FETCH EMAILS
  useEffect(() => {
    if (session) {
      fetch("/api/gmail")
        .then((res) => res.json())
        .then((data) => setEmails(data));
    }
  }, [session]);

  // ⌨️ KEYBOARD SHORTCUTS (Superhuman feel)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "c") {
        document.getElementById("command-box")?.focus();
      }

      if (e.key === "j") {
        setSelectedEmail((prev: any) => {
          const idx = emails.findIndex((e) => e.id === prev?.id);
          return emails[idx + 1] || prev;
        });
      }

      if (e.key === "k") {
        setSelectedEmail((prev: any) => {
          const idx = emails.findIndex((e) => e.id === prev?.id);
          return emails[idx - 1] || prev;
        });
      }

      if (e.key === "r") {
        alert("Reply feature coming soon 🚀");
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [emails]);

  // 🔐 LOGIN SCREEN
  if (!session) {
    return (
      <div className="h-screen flex items-center justify-center">
        <button
          onClick={() => signIn("google")}
          className="px-5 py-2 bg-black text-white rounded"
        >
          Login with Google
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* 🤖 COMMAND BAR */}
      <div className="p-2 border-b flex gap-2 bg-white">
        <input
          id="command-box"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          placeholder='Try: "send email to test@gmail.com" or "schedule meeting at 9am"'
          className="border p-2 flex-1 rounded"
        />

        <button
          onClick={async () => {
            setLoading(true);

            const res = await fetch("/api/agent", {
              method: "POST",
              body: JSON.stringify({ text: command }),
            });

            const data = await res.json();
            setResponse(data.result);

            setLoading(false);
          }}
          className="bg-black text-white px-4 rounded"
        >
          {loading ? "Running..." : "Run"}
        </button>
      </div>

      {/* RESPONSE */}
      {response && (
        <div className="px-3 py-2 text-green-600 text-sm border-b bg-white">
          {response}
        </div>
      )}

      {/* MAIN APP */}
      <div className="flex flex-1">
        {/* SIDEBAR */}
        <div className="w-64 border-r p-4 bg-white">
          <h2 className="font-bold text-lg">Inbox</h2>
          <p className="text-sm text-gray-500">{session.user?.email}</p>

          <button onClick={() => signOut()} className="mt-4 text-red-500">
            Logout
          </button>

          <div className="mt-6 text-xs text-gray-400">
            <p>Shortcuts:</p>
            <p>c → command</p>
            <p>j/k → navigate</p>
            <p>r → reply</p>
          </div>
        </div>

        {/* SPLIT VIEW */}
        <div className="flex flex-1">
          {/* LEFT - EMAIL LIST */}
          <div className="w-1/2 border-r p-4 overflow-auto bg-white">
            <h1 className="text-xl font-bold mb-4">Emails</h1>

            <div className="space-y-3">
              {emails.map((email: any) => {
                const headers = email.payload?.headers || [];

                const subject =
                  headers.find((h: any) => h.name === "Subject")?.value ||
                  "No Subject";

                const from =
                  headers.find((h: any) => h.name === "From")?.value ||
                  "Unknown";

                const priority = getEmailPriority(email);

                return (
                  <div
                    key={email.id}
                    onClick={() => setSelectedEmail(email)}
                    className="border p-3 rounded hover:bg-gray-100 hover:shadow transition cursor-pointer"
                  >
                    <div className="flex justify-between items-center">
                      <p className="font-semibold">{subject}</p>

                      <span
                        className={`text-xs px-2 py-1 rounded font-semibold ${
                          priority === "high"
                            ? "bg-red-500 text-white"
                            : priority === "low"
                              ? "bg-gray-300"
                              : "bg-yellow-300"
                        }`}
                      >
                        {priority}
                      </span>
                    </div>

                    <p className="text-sm text-gray-500">{from}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT - EMAIL READER */}
          <div className="w-1/2 p-4 overflow-auto bg-white">
            {selectedEmail ? (
              <EmailReader email={selectedEmail} />
            ) : (
              <p className="text-gray-400">Select an email to view</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
