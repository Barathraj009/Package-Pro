import { listDemoUsers } from "@/lib/db/queries";
import { t } from "@/lib/i18n";
import LoginPicker from "./LoginPicker";

export default function LoginPage() {
  const users = listDemoUsers(24);
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12">
      <h1 className="font-display text-3xl text-ink mb-2">{t("login.title", "en")}</h1>
      <p className="text-ink/60 mb-8">{t("login.subtitle", "en")}</p>
      <LoginPicker users={users} />
    </div>
  );
}
