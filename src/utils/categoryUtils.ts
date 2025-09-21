import { TFunction } from 'i18next';

/**
 * Helper function to get category display name with proper fallbacks
 * Handles UUID-based category IDs and maps them to proper Hebrew/English names
 */
export const getCategoryDisplayName = (category: any, t: TFunction): string => {
  // First try to use the name_key if it exists
  if (category?.name_key) {
    const translated = t(category.name_key);
    if (translated !== category.name_key) {
      return translated;
    }
  }

  // Try to map the category name or slug to a translation key
  const categoryIdentifier = (category?.name || category?.slug || '').toLowerCase().trim();
  if (categoryIdentifier) {
    const translationKey = `categories.${categoryIdentifier}`;
    const translated = t(translationKey);
    if (translated !== translationKey) {
      return translated;
    }
  }

  // Try mapping by display_name
  if (category?.display_name) {
    const translationKey = `categories.${category.display_name.toLowerCase()}`;
    const translated = t(translationKey);
    if (translated !== translationKey) {
      return translated;
    }
  }

  // Map UUID-based category IDs to proper names
  const uuidToCategoryMap: Record<string, string> = {
    'f228cf56-d10b-4792-bbdc-40ae399e1cf7': 'bakery',
    '0a8dca80-adb3-423b-ba3d-54758d21f5cc': 'cakes',
    '7dfa4728-3fd1-48a6-a4db-683ed098450f': 'cookies',
    '09be22f3-ffd2-4fc2-b2ff-d7c4613ff13d': 'cheesecakes',
    'bakery': 'bakery',
    'cakes': 'cakes',
    'cookies': 'cookies',
    'cheesecakes': 'cheesecakes',
    'dairy': 'dairy',
    'frozen': 'frozen',
    'fruits': 'fruits',
    'seafood': 'seafood',
    'beverages': 'beverages',
    'snacks': 'snacks',
    'condiments': 'condiments'
  };

  // Check if category ID matches a known UUID or name
  const categoryId = category?.id || category?.name || '';
  const mappedCategory = uuidToCategoryMap[categoryId];
  if (mappedCategory) {
    const translationKey = `categories.${mappedCategory}`;
    const translated = t(translationKey);
    if (translated !== translationKey) {
      return translated;
    }
  }

  // Create fallback mapping for common Hebrew bakery categories
  const hebrewCategoryMap: Record<string, string> = {
    'עוגות': t('categories.cakes'),
    'עוגיות': t('categories.cookies'),
    'עוגות גבינה': t('categories.cheesecakes'),
    'מאפייה': t('categories.bakery'),
    'מוצרי חלב': t('categories.dairy'),
    'קפואים': t('categories.frozen'),
    'פירות': t('categories.fruits'),
    'פירות ים': t('categories.seafood'),
    'משקאות': t('categories.beverages'),
    'חטיפים': t('categories.snacks'),
    'תבלינים': t('categories.condiments')
  };

  if (category?.name && hebrewCategoryMap[category.name]) {
    return hebrewCategoryMap[category.name];
  }

  // English fallback mapping
  const englishCategoryMap: Record<string, string> = {
    'cakes': t('categories.cakes'),
    'cookies': t('categories.cookies'),
    'cheesecakes': t('categories.cheesecakes'),
    'bakery': t('categories.bakery'),
    'dairy': t('categories.dairy'),
    'frozen': t('categories.frozen'),
    'fruits': t('categories.fruits'),
    'seafood': t('categories.seafood'),
    'beverages': t('categories.beverages'),
    'snacks': t('categories.snacks'),
    'condiments': t('categories.condiments')
  };

  if (category?.name && englishCategoryMap[category.name.toLowerCase()]) {
    return englishCategoryMap[category.name.toLowerCase()];
  }

  // Final fallback to display_name, name, slug, or default
  return category?.display_name || category?.name || category?.slug || t('common.categories');
};

/**
 * Error handling for category operations
 */
export const handleCategoryError = (error: any, t: TFunction): string => {
  if (error?.message) {
    return error.message;
  }
  return t('errors.loadingProducts');
};

/**
 * Check if a category name matches a given search term
 */
export const matchesCategorySearch = (category: any, searchTerm: string, t: TFunction): boolean => {
  if (!searchTerm) return true;

  const displayName = getCategoryDisplayName(category, t).toLowerCase();
  const term = searchTerm.toLowerCase();

  return displayName.includes(term) ||
         (category?.name || '').toLowerCase().includes(term) ||
         (category?.slug || '').toLowerCase().includes(term);
};