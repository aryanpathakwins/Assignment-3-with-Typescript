import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { ReactNode } from "react";

export interface CartItem {
  description: ReactNode;
  title: string | undefined;
  id: string;
  name: string;
  price: number;
  image?: string;
  quantity: number;
  stock: number; // mirrors card.quantity at the time of adding
}

interface CartState {
  cartItems: CartItem[];
  hasNewCartItem: boolean; 
}

const initialState: CartState = {
  cartItems: [],
  hasNewCartItem: false, // ✅ default off
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const item = action.payload;
      const existingItem = state.cartItems.find((i) => i.id === item.id);

      if (existingItem) {
        const newQuantity = existingItem.quantity + item.quantity;
        existingItem.quantity =
          newQuantity > existingItem.stock ? existingItem.stock : newQuantity;
      } else {
        state.cartItems.push({ ...item });
      }

      state.hasNewCartItem = true; // ✅ show notification when new item is added
    },

    removeFromCart: (state, action: PayloadAction<string>) => {
      state.cartItems = state.cartItems.filter((i) => i.id !== action.payload);
    },

    updateQuantity: (
      state,
      action: PayloadAction<{ id: string; quantity: number }>
    ) => {
      const { id, quantity } = action.payload;
      const item = state.cartItems.find((i) => i.id === id);
      if (item) {
        item.quantity = quantity > item.stock ? item.stock : quantity;
      }
    },

    clearCart: (state) => {
      state.cartItems = [];
    },

    clearCartNotification: (state) => {
      state.hasNewCartItem = false; // ✅ hide notification when user views cart
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  clearCartNotification, // ✅ export new reducer
} = cartSlice.actions;

export default cartSlice.reducer;
