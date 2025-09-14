// categories.ts
export const CATEGORY_IDS = [
  'bakery',
  'dairy',
  'frozen',
  'fruits',
  'seafood',
  'beverages',
  'snacks',
  'condiments',
  'cakes',
  'cookies',
  'cheesecakes',
] as const;

export type CategoryId = typeof CATEGORY_IDS[number];

export type CategoryInfo = {
  id: CategoryId;
  nameKey: string;
  imageUrl?: string;
  color?: string;
};

export const categoryInfoMap: Record<CategoryId, CategoryInfo> = {
  bakery:       { id: 'bakery', nameKey: 'categories.bakery', imageUrl: '/images/bakery.png' },
  dairy:        { id: 'dairy', nameKey: 'categories.dairy' },
  frozen:       { id: 'frozen', nameKey: 'categories.frozen' },
  fruits:       { id: 'fruits', nameKey: 'categories.fruits' },
  seafood:      { id: 'seafood', nameKey: 'categories.seafood' },
  beverages:    { id: 'beverages', nameKey: 'categories.beverages' },
  snacks:       { id: 'snacks', nameKey: 'categories.snacks' },
  condiments:   { id: 'condiments', nameKey: 'categories.condiments' },
  cakes:        { id: 'cakes', nameKey: 'categories.cakes' },
  cookies:      { id: 'cookies', nameKey: 'categories.cookies' },
  cheesecakes:  { id: 'cheesecakes', nameKey: 'categories.cheesecakes' },
};


