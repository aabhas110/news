"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { useState } from "react";

export function ProfileAuthControls() {
  const { data: session } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  if (session) {
    return (
      <button onClick={() => signOut()} className="rounded-md border border-line px-4 py-2 text-sm font-semibold dark:border-white/10">
        Sign out
      </button>
    );
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        signIn("credentials", { email, password, callbackUrl: "/profile" });
      }}
      className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto]"
    >
      <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" placeholder="Email" className="rounded-md border border-line bg-white px-3 py-2 dark:border-white/10 dark:bg-white/5" />
      <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" placeholder="Password" className="rounded-md border border-line bg-white px-3 py-2 dark:border-white/10 dark:bg-white/5" />
      <button className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-paper dark:bg-paper dark:text-ink">Sign in</button>
    </form>
  );
}
