import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

export const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = () => {
    const newLang = i18n.language === "he" ? "en" : "he";
    i18n.changeLanguage(newLang);
  };

  return (
    <motion.button
      onClick={changeLanguage}
      className="flex items-center justify-center w-8 h-8 border border-bakery-cream-300 hover:border-bakery-brown-400 rounded-full text-xs font-medium text-bakery-brown-600 hover:text-bakery-brown-800 bg-white hover:bg-bakery-cream-50 transition-all duration-200 shadow-sm hover:shadow-md"
      title={i18n.language === "he" ? "Switch to English" : "החלף לעברית"}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      {i18n.language === "he" ? "EN" : "ע"}
    </motion.button>
  );
};

export default LanguageSwitcher;
