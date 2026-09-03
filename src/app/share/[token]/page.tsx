import { notFound } from "next/navigation";
import { getAppDb } from "@/lib/db/app";
import { getPackage, getCity } from "@/lib/db/queries";
import { repricePackage } from "@/lib/pricing";
import { t } from "@/lib/i18n";
import { localizeContent } from "@/lib/content-i18n";
import Link from "next/link";

interface ShareRow {
  share_token: string;
  customization_id: string;
  status: string;
}

interface CustomizationRow {
  customization_id: string;
  package_id: string;
  selections_json: string;
  status: string;
}

function fmt(amount: string, currency: string) {
  return `${currency} ${Number(amount).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function SharePage({
  params,
  searchParams,
}: {
  params: { token: string };
  searchParams: { lang?: string };
}) {
  const uiLang = (searchParams.lang ?? "en").split("-")[0]!.toLowerCase();
  const db = getAppDb();
  const share = db.prepare<[string]>(`SELECT * FROM app_share_links WHERE share_token = ?`).get(params.token) as
    | ShareRow
    | undefined;
  if (!share || share.status !== "active") notFound();

  const customization = db
    .prepare<[string]>(`SELECT * FROM app_package_customizations WHERE customization_id = ?`)
    .get(share.customization_id) as CustomizationRow | undefined;
  if (!customization) notFound();

  const pkg = getPackage(customization.package_id);
  if (!pkg) notFound();

  const city = getCity(pkg.city_id);
  const selections = JSON.parse(customization.selections_json);
  const pricing = repricePackage(customization.package_id, selections, uiLang);
  const pkgName = localizeContent(uiLang, `pkg:${pkg.package_id}:name`, pkg.name);
  const cityLabel = city
    ? [
        localizeContent(uiLang, `cty:${city.city_id}`, city.name),
        city.state ? localizeContent(uiLang, `ctySt:${city.state.trim()}`, city.state) : "",
      ]
        .filter(Boolean)
        .join(", ")
    : undefined;

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-12">
      <p className="font-mono text-xs uppercase tracking-wider text-brass mb-2">{t("share.badge", uiLang)}</p>
      <h1 className="font-display text-3xl text-ink mb-1">{pkgName}</h1>
      {cityLabel && <p className="text-ink/50 mb-6">{cityLabel}</p>}

      <div className="border border-mist rounded-2xl bg-card p-5">
        <div className="space-y-2 text-sm">
          {pricing.lines
            .filter((l) => !l.removed)
            .map((l) => (
              <div key={l.key} className="flex justify-between">
                <span>{l.label}</span>
                <span className="font-mono">{fmt(l.amount.amount, l.amount.currency)}</span>
              </div>
            ))}
        </div>
        <div className="route-divider my-4" />
        <div className="flex justify-between items-baseline">
          <span className="font-medium">{t("detail.total", uiLang)}</span>
          <span className="font-mono text-2xl">{fmt(pricing.total.amount, pricing.total.currency)}</span>
        </div>
      </div>

      <Link
        href={`/packages/${pkg.package_id}`}
        className="inline-block mt-6 text-route underline underline-offset-4 text-sm"
      >
        {t("share.customise", uiLang)}
      </Link>
    </div>
  );
}
