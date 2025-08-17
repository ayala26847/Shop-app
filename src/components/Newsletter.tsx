import { useTranslation } from "react-i18next";

export default function Newsletter() {
  const { t, i18n } = useTranslation();
  const dir = i18n.dir(); // RTL או LTR

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
          className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none"
        />
        <button
          type="submit"
          className="px-6 py-2 rounded-lg bg-gradient-to-r from-orange-400 to-yellow-400 text-white font-bold hover:opacity-90 transition"
        >
          {t("newsletter.button")}
        </button>
      </form>
    </div>
  );
}
