import { createSlice, PayloadAction } from '@reduxjs/toolkit';
type CartState = {
  // productId -> quantity
  items: Record<number, number>;
};

const initialState: CartState = {
  items: {},
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem(state, action: PayloadAction<{ productId: number; qty?: number }>) {
      const { productId, qty = 1 } = action.payload;
      state.items[productId] = (state.items[productId] || 0) + qty;
      if (state.items[productId] <= 0) delete state.items[productId];
    },
    removeItem(state, action: PayloadAction<{ productId: number }>) {
      delete state.items[action.payload.productId];
    },
    setQty(state, action: PayloadAction<{ productId: number; qty: number }>) {
      const { productId, qty } = action.payload;
      if (qty <= 0) delete state.items[productId];
      else state.items[productId] = qty;
    },
    clearCart(state) {
      state.items = {};
    },
    // לשחזור מ־localStorage
    hydrate(state, action: PayloadAction<CartState>) {
      return action.payload;
    },
  },
});

export const { addItem, removeItem, setQty, clearCart, hydrate } = cartSlice.actions;
export default cartSlice.reducer;
