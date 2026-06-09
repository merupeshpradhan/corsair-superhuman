"use client";

import { signIn, signOut, useSession } from "next-auth/react";

export default function Home() {
  const { data: session } = useSession();

  if (session) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4">
        <h1>Welcome</h1>

        <p>{session.user?.name}</p>
        <p>{session.user?.email}</p>

        <button
          onClick={() => signOut()}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen flex items-center justify-center">
      <button
        onClick={() => signIn("google")}
        className="bg-black text-white px-4 py-2 rounded"
      >
        Login with Google
      </button>
    </div>
  );
}
