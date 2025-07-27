import { createSlice } from '@reduxjs/toolkit';
import { Category, Product } from '../../types/products';

const initialState: Product[] = [
  { id: 1, name: 'עוגת שוקולד', price: 25, image: '🍫', categories: [Category.BAKERY, Category.SNACKS] },
  { id: 2, name: 'מאפין אוכמניות', price: 15, image: '🫐', categories: []  },
  { id: 3, name: 'לחם מחמצת', price: 20, image: '🍞', categories: []  },
];

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {},
});

export default productsSlice.reducer;