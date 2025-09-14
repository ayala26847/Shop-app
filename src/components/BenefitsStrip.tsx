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
    <section className="mt-8 grid sm:grid-cols-3 gap-6">
      {items.map((it) => (
        <div key={it.titleKey} className="card p-6 text-center">
          <div className="text-lg font-semibold mb-2">{t(it.titleKey)}</div>
          <div className="text-sm text-gray-600">{t(it.subKey)}</div>
        </div>
      ))}
    </section>
  );
}
