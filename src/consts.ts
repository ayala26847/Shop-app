import { Category, Product } from './types/products';

export const products: Product[] = [
  {
    id: 1,
    name: 'אבקת נוגט איכותית',
    price: 19.9,
    image: 'https://via.placeholder.com/300x200.png?text=Nougat',
    categories: [Category.BAKERY],
  },
  {
    id: 2,
    name: 'קלטיות לפאי קפואות',
    price: 29.5,
    image: 'https://via.placeholder.com/300x200.png?text=Pie+Shells',
    categories: [Category.BAKERY],

  },
  {
    id: 3,
    name: 'פירות קפואים – תות',
    price: 14.9,
    image: 'https://via.placeholder.com/300x200.png?text=Frozen+Strawberries',
    categories: [Category.BAKERY],

  },

];
