import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./useslice";
import cardReducer from "./cardSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    cards: cardReducer, // ✅ added cards
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
