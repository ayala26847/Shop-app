
export interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  categories: Category[];
  subCategories?: SubCategories[];
  description?: string;
}
export enum SubCategories {
}
export enum Category {
  BAKERY = 'Bakery',
  DAIRY = 'Dairy',
  FROZEN = 'Frozen',
  FRUITS = 'Fruits',
  SEAFOOD = 'Seafood',
  BEVERAGES = 'Beverages',
  SNACKS = 'Snacks',
  CONDIMENTS = 'Condiments',
}