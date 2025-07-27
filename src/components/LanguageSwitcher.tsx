import { useTranslation } from 'react-i18next';

export const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: 'he' | 'en') => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="flex gap-2 items-center">
      <button
        onClick={() => changeLanguage('he')}
        className={`px-2 py-1 rounded ${i18n.language === 'he' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
      >
        עברית
      </button>
      <button
        onClick={() => changeLanguage('en')}
        className={`px-2 py-1 rounded ${i18n.language === 'en' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
      >
        English
      </button>
    </div>
  );
};

export default LanguageSwitcher;
