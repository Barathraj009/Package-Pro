"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { t } from "@/lib/i18n";

export default function LogoutButton({ uiLang }: { uiLang: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function logout() {
    setLoading(true);
    await fetch("/api/session/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <button
      onClick={logout}
      disabled={loading}
      className="w-full border border-stamp text-stamp py-2.5 rounded-full font-medium hover:bg-stamp/5 transition-colors disabled:opacity-50"
    >
      {loading ? t("account.loggingOut", uiLang) : t("account.logout", uiLang)}
    </button>
  );
}