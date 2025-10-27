import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type CardType from "../types/CardTypes";

const API_URL = "http://localhost:3000/cards"; // ✅ Corrected Port

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

// ---- Thunks ----
export const fetchCards = createAsyncThunk<CardType[]>(
  "cards/fetchCards",
  async () => {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("Failed to fetch cards");
    return await res.json();
  }
);

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
    return await res.json(); // ✅ Return saved card from backend
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
    return await res.json(); // ✅ Return updated card
  }
);

export const deleteCard = createAsyncThunk<string, string>(
  "cards/deleteCard",
  async (id) => {
    const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete card");
    return id;
  }
);

// ---- Slice ----
const cardSlice = createSlice({
  name: "cards",
  initialState,
  reducers: {},
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

export default cardSlice.reducer;
