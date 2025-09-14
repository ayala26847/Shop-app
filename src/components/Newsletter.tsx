import { useTranslation } from "react-i18next";
import { useDirection } from "../hooks/useDirection";

export default function Newsletter() {
  const { t } = useTranslation();
  const { dir } = useDirection();

  return (
    <div
      className="w-full py-12 px-4 bg-gradient-to-r from-pink-50 to-yellow-50 flex flex-col items-center text-center"
      dir={dir}
    >
      <h2 className="text-2xl font-bold mb-2">{t("newsletter.title")}</h2>
      <p className="text-gray-600 mb-6 max-w-lg">{t("newsletter.subtitle")}</p>

      <form className="flex flex-col sm:flex-row gap-2 w-full max-w-md">
        <input
          type="email"
          placeholder={t("newsletter.placeholder")!}
          className="input-field flex-1"
        />
        <button
          type="submit"
          className="btn-primary px-6 py-2 font-bold"
        >
          {t("newsletter.button")}
        </button>
      </form>
    </div>
  );
}
