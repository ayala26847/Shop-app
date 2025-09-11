import { createSlice } from '@reduxjs/toolkit';
import type { ProductsState, Product } from '../../types/products';
import {  CategoryId } from '../../types/categories';
const initialState: ProductsState = {
  products:[
  { id: 1, name: 'עוגת שוקולד', price: 25, image: '🍫', categoryIds: ['bakery', 'snacks'] },
  { id: 2, name: 'מאפין אוכמניות', price: 15, image: '🫐', categoryIds: []  },
  { id: 3, name: 'לחם מחמצת', price: 20, image: '🍞', categoryIds: []  },
]
}

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setProducts: (state, action) => {
      state.products = action.payload;
    },
    addProduct: (state, action) => {
      state.products.push(action.payload);
    },
    removeProduct: (state, action) => {
      state.products = state.products.filter(product => product.id !== action.payload);
    },
    updateProduct: (state, action) => {
      const index = state.products.findIndex(product => product.id === action.payload.id);
      if (index !== -1) {
        state.products[index] = { ...state.products[index], ...action.payload };
      }
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setSelectedCategoryId: (state, action) => {
      state.selectedCategoryId = action.payload;
    }
  },
});

export const {
  setProducts,
  addProduct,
  removeProduct,
  updateProduct,
  setLoading,
  setError,
  setSelectedCategoryId
} = productsSlice.actions;
export default productsSlice.reducer;