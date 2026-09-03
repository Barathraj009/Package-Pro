"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { User } from "@/lib/types";
import { t, tLabel } from "@/lib/i18n";

export default function LoginPicker({ users }: { users: User[] }) {
  const router = useRouter();
  const [pending, setPending] = useState<string | null>(null);

  async function pick(userId: string) {
    setPending(userId);
    const res = await fetch("/api/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    if (res.ok) {
      router.push("/packages");
      router.refresh();
    } else {
      setPending(null);
    }
  }

  return (
    <div className="grid sm:grid-cols-2 gap-3">
      {users.map((u) => (
        <button
          key={u.user_id}
          onClick={() => pick(u.user_id)}
          disabled={pending !== null}
          className="text-left border border-mist rounded-xl bg-card p-4 hover:border-route transition-colors disabled:opacity-50"
        >
          <p className="font-medium text-ink">{u.display_name}</p>
          <p className="text-xs text-ink/50 mt-1">
            {tLabel("seg", u.segment, "en")} · {u.locale} · {u.travel_style}
          </p>
          {pending === u.user_id && <p className="text-xs text-route mt-2">{t("login.loggingIn", "en")}</p>}
        </button>
      ))}
    </div>
  );
}
