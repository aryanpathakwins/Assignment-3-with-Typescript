import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./useslice";
import cardReducer from "./cardSlice";
import cartSlice from "./cartSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    cards: cardReducer, // ✅ added cards
    cart : cartSlice, // ✅ added cart
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
