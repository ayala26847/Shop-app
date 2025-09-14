import { RootState } from '../../app/store';

// Cart Selectors
export const selectCartItems = (state: RootState): Record<number, number> =>
  state.cartSlice?.items || {};

export const selectCartCount = (state: RootState): number =>
  Object.values(state.cartSlice?.items || {}).reduce((total, quantity) => total + quantity, 0);

export const selectCartTotal = (state: RootState): number => {
  const items = state.cartSlice?.items || {};
  const products = state.productsSlice?.products || [];

  return Object.entries(items).reduce((total, [productId, quantity]) => {
    const product = products.find(p => p.id === parseInt(productId));
    return total + (product?.price || 0) * quantity;
  }, 0);
};