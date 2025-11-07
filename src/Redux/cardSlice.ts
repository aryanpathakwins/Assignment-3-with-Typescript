import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import type CardType from "../types/CardTypes";

const API_URL = "http://localhost:3000/cards";

interface CardState {
  cards: CardType[];
  loading: boolean;
  error: string | null;
}

const initialState: CardState = {
  cards: [],
  loading: false,
  error: null,
};


export const fetchCards = createAsyncThunk<CardType[]>("cards/fetchCards", async () => {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error("Failed to fetch cards");
  return await res.json();
});

export const addCard = createAsyncThunk<CardType, Omit<CardType, "id">>(
  "cards/addCard",
  async (card) => {
    const newCard = { ...card, id: Date.now().toString() };
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newCard),
    });
    if (!res.ok) throw new Error("Failed to add card");
    return await res.json();
  }
);

export const updateCard = createAsyncThunk<CardType, CardType>(
  "cards/updateCard",
  async (card) => {
    const res = await fetch(`${API_URL}/${card.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(card),
    });
    if (!res.ok) throw new Error("Failed to update card");
    return await res.json();
  }
);

export const deleteCard = createAsyncThunk<string, string>("cards/deleteCard", async (id) => {
  const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete card");
  return id;
});

// ✅ Updated thunk: use `quantity` instead of `stock`
export const updateStockAfterPurchase = createAsyncThunk<
  void,
  { id: string; quantityPurchased: number }
>("cards/updateStockAfterPurchase", async ({ id, quantityPurchased }, thunkAPI) => {
  const state = (thunkAPI.getState() as { cards: CardState }).cards;
  const card = state.cards.find((c) => c.id === id);
  if (!card) return;

  const newQuantity = Math.max((card.quantity || 0) - quantityPurchased, 0);
  const updatedCard = { ...card, quantity: newQuantity };

  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updatedCard),
  });

  if (!res.ok) throw new Error("Failed to update quantity");
});

// ---- Slice ----
const cardSlice = createSlice({
  name: "cards",
  initialState,
  reducers: {
    updateStockLocally: (
      state,
      action: PayloadAction<{ id: string; quantityPurchased: number }>
    ) => {
      const { id, quantityPurchased } = action.payload;
      const card = state.cards.find((c) => c.id === id);
      if (card) {
        card.quantity = Math.max((card.quantity || 0) - quantityPurchased, 0);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCards.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCards.fulfilled, (state, action) => {
        state.loading = false;
        state.cards = action.payload;
      })
      .addCase(fetchCards.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch cards";
      })
      .addCase(addCard.fulfilled, (state, action) => {
        state.cards.push(action.payload);
      })
      .addCase(updateCard.fulfilled, (state, action) => {
        state.cards = state.cards.map((c) =>
          c.id === action.payload.id ? action.payload : c
        );
      })
      .addCase(deleteCard.fulfilled, (state, action) => {
        state.cards = state.cards.filter((c) => c.id !== action.payload);
      });
  },
});

export const { updateStockLocally } = cardSlice.actions;
export default cardSlice.reducer;
