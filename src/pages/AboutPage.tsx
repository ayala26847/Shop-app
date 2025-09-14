import React from "react";
import { useTranslation } from "react-i18next";
import { useDirection } from "../hooks/useDirection";

export default function AboutPage() {
  const { t } = useTranslation();
  const { dir } = useDirection();

  return (
    <div className="container mx-auto px-4 py-8" dir={dir}>
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-6">{t("about.title")}</h1>
        <p className="text-lg text-gray-600 leading-relaxed">
          {t("about.description")}
        </p>
        
        <div className="mt-12 grid md:grid-cols-2 gap-8 text-left">
          <div className="card p-8">
            <h3 className="text-xl font-semibold mb-4">{t("about.mission")}</h3>
            <p className="text-gray-600 leading-relaxed">
              {t("about.missionText")}
            </p>
          </div>
          <div className="card p-8">
            <h3 className="text-xl font-semibold mb-4">{t("about.quality")}</h3>
            <p className="text-gray-600 leading-relaxed">
              {t("about.qualityText")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}