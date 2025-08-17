// src/components/BenefitsStrip.tsx
import { useTranslation } from "react-i18next";

const items = [
  { titleKey: "benefits.fast_shipping", subKey: "benefits.fast_shipping_sub" },
  { titleKey: "benefits.fresh_quality", subKey: "benefits.fresh_quality_sub" },
  { titleKey: "benefits.support", subKey: "benefits.support_sub" },
];

export default function BenefitsStrip() {
  const { t } = useTranslation();
  return (
    <section className="mt-8 grid sm:grid-cols-3 gap-4">
      {items.map((it) => (
        <div key={it.titleKey} className="rounded-2xl border p-5 bg-white">
          <div className="text-base font-semibold">{t(it.titleKey)}</div>
          <div className="text-sm text-gray-600 mt-1">{t(it.subKey)}</div>
        </div>
      ))}
    </section>
  );
}
