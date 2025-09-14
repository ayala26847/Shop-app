import { RootState } from '../../app/store';

// Product Selectors
export const selectProducts = (state: RootState) => state.productsSlice.products;
export const selectProductsLoading = (state: RootState) => state.productsSlice.loading;
export const selectProductsError = (state: RootState) => state.productsSlice.error;
export const selectSelectedCategoryId = (state: RootState) => state.productsSlice.selectedCategoryId;

export const selectProductsByCategory = (state: RootState, categoryId?: string) => {
  const products = selectProducts(state);
  if (!categoryId) return products;
  return products.filter(product => product.categoryIds.includes(categoryId as any));
};

export const selectAvailableProducts = (state: RootState) =>
  selectProducts(state).filter(product => product.inStock);

export const selectProductsWithDiscount = (state: RootState) =>
  selectProducts(state).filter(product => product.discount && product.discount > 0);

export const selectProductById = (state: RootState, productId: number) =>
  selectProducts(state).find(product => product.id === productId);
