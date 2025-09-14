import {  Product } from './types/products';

export const products: Product[] = [
  {
    id: 1,
    name: 'אבקת נוגט איכותית',
    price: 19.9,
    imageUrl: 'https://via.placeholder.com/300x200.png?text=Nougat',
    categoryIds: ['bakery'],
    inStock: true,
    rating: 4.8,
    reviewsCount: 25
  },
  {
    id: 2,
    name: 'קלטיות לפאי קפואות',
    price: 29.5,
    imageUrl: 'https://via.placeholder.com/300x200.png?text=Pie+Shells',
    categoryIds: ['bakery'],
    inStock: true,
    rating: 4.5,
    reviewsCount: 18
  },
  {
    id: 3,
    name: 'פירות קפואים – תות',
    price: 14.9,
    imageUrl: 'https://via.placeholder.com/300x200.png?text=Frozen+Strawberries',
    categoryIds: ['bakery'],
    inStock: false,
    rating: 4.2,
    reviewsCount: 12
  }
];
