import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit";
// import counterReducer from '../features/counter/counterSlice';
import productsReducer from "../features/products/productsSlice";
import cartSliceReducer from "../features/cart/cartSlice";

export const store = configureStore({
  reducer: {
    productsSlice: productsReducer,
    cartSlice: cartSliceReducer,
  },
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
