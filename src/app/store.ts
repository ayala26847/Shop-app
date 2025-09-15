import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit";
import productsReducer from "../features/products/productsSlice";
import cartSliceReducer from "../features/cart/cartSlice";
import { authApi } from "../store/api/authApi";
import { productsApi } from "../store/api/productsApi";
import { cartApi } from "../store/api/cartApi";
import { ordersApi } from "../store/api/ordersApi";

export const store = configureStore({
  reducer: {
    productsSlice: productsReducer,
    cartSlice: cartSliceReducer,
    // RTK Query API slices
    [authApi.reducerPath]: authApi.reducer,
    [productsApi.reducerPath]: productsApi.reducer,
    [cartApi.reducerPath]: cartApi.reducer,
    [ordersApi.reducerPath]: ordersApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore RTK Query action types
        ignoredActions: [
          'persist/PERSIST',
          'persist/REHYDRATE',
          'persist/REGISTER',
        ],
      },
    }).concat(
      authApi.middleware,
      productsApi.middleware,
      cartApi.middleware,
      ordersApi.middleware
    ),
});
// טיפוס עבור שימוש ב־useSelector ו־useDispatch עם TypeScript

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;

export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
