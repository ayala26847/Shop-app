import { useTranslation } from 'react-i18next';

export const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = () => {
    const newLang = i18n.language === "he" ? "en" : "he";
    i18n.changeLanguage(newLang);
  };

  return (
    <div className="flex gap-2 items-center">
         <button
        onClick={changeLanguage}
        className="px-3 py-1 border border-gray-400 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition"
      >
        {i18n.language === "he" ? "HE" : "EN"}
      </button>
    </div>
  );
};

export default LanguageSwitcher;
