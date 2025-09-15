import { useTranslation } from 'react-i18next';

/**
 * Extract the appropriate language name from a bilingual string
 * Format expected: "Hebrew Text / English Text" or "English Text"
 *
 * @param bilingualText - The text containing both Hebrew and English separated by " / "
 * @param currentLanguage - The current language code ('he' or 'en')
 * @returns The text in the appropriate language
 */
export function extractLocalizedText(bilingualText: string, currentLanguage: string): string {
  if (!bilingualText) return '';

  // Check if the text contains the separator " / "
  if (bilingualText.includes(' / ')) {
    const parts = bilingualText.split(' / ');

    if (parts.length >= 2) {
      const [hebrewText, englishText] = parts;

      // Return appropriate text based on language
      if (currentLanguage === 'he') {
        return hebrewText.trim();
      } else {
        return englishText.trim();
      }
    }
  }

  // If no separator found, return the original text
  return bilingualText.trim();
}

/**
 * Hook to extract localized text based on current language
 * @param bilingualText - The text containing both Hebrew and English
 * @returns The text in the current language
 */
export function useLocalizedText(bilingualText: string): string {
  const { i18n } = useTranslation();
  return extractLocalizedText(bilingualText, i18n.language);
}

/**
 * Extract localized description from a bilingual description
 * Handles both product descriptions and short descriptions
 */
export function useLocalizedDescription(description: string | null): string {
  const { i18n } = useTranslation();

  if (!description) return '';

  return extractLocalizedText(description, i18n.language);
}