import { createSlice } from '@reduxjs/toolkit';
import type { ProductsState } from '../../types/products';
const initialState: ProductsState = {
  products: [
    {
      id: 1,
      name: 'עוגת שוקולד',
      price: 25,
      imageUrl: '🍫',
      categoryIds: ['bakery', 'snacks'],
      inStock: true,
      rating: 4.5,
      reviewsCount: 12,
      discount: 10
    },
    {
      id: 2,
      name: 'מאפין אוכמניות',
      price: 15,
      imageUrl: '🫐',
      categoryIds: ['bakery'],
      inStock: true,
      rating: 4.2,
      reviewsCount: 8
    },
    {
      id: 3,
      name: 'לחם מחמצת',
      price: 20,
      imageUrl: '🍞',
      categoryIds: ['bakery'],
      inStock: false,
      rating: 4.8,
      reviewsCount: 15
    },
  ],
  loading: false,
  error: null
}

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setProducts: (state, action) => {
      state.products = action.payload;
      state.loading = false;
      state.error = null;
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
      state.loading = false;
    },
    setSelectedCategoryId: (state, action) => {
      state.selectedCategoryId = action.payload;
    },
    clearError: (state) => {
      state.error = null;
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
  setSelectedCategoryId,
  clearError
} = productsSlice.actions;
export default productsSlice.reducer;