import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";

const API_URL = "http://localhost:3000/users";

// ------------------ Types ------------------
export interface User {
  purchased: any;
  id: string;
  fullName?: string;
  email?: string;
  password?: string;
  phoneNumber?: string;
  gender?: string;
  profileImage?: string | null;
  isActive?: boolean;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  address?: string; // ✅ Combined full address for display
  purchasedProducts?: { productId: string; productName: string; quantity: number; price: number }[]; // ✅ Track purchases
}

interface UserState {
  users: User[];
  currentUser: User | null;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  users: [],
  currentUser: JSON.parse(localStorage.getItem("currentUser") || "null"),
  loading: false,
  error: null,
};

// ------------------ Async Thunks ------------------

// Fetch all users
export const fetchUsers = createAsyncThunk<User[]>(
  "user/fetchUsers",
  async () => {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("Failed to fetch users");
    return await res.json();
  }
);

// ✅ Signup new user (creates combined 'address' field correctly)
export const signupUser = createAsyncThunk<User, Omit<User, "id">>(
  "user/signupUser",
  async (userData) => {
    const combinedAddress = [
      userData.address1,
      userData.address2,
      userData.city,
      userData.state,
      userData.zip,
      userData.country,
    ]
      .filter(Boolean)
      .join(", ");

    const newUser: User = {
      ...userData,
      id: Date.now().toString(),
      isActive: true,
      address: combinedAddress,
      purchasedProducts: [], // ✅ initialize empty purchase list
    };

    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newUser),
    });

    if (!res.ok) throw new Error("Signup failed");

    return newUser;
  }
);

// Login user
export const loginUser = createAsyncThunk<User, { email: string; password: string }>(
  "user/loginUser",
  async ({ email, password }) => {
    const res = await fetch(`${API_URL}?email=${email}`);
    if (!res.ok) throw new Error("Login failed");
    const data = await res.json();

    if (data.length === 0) throw new Error("User not found");
    const user = data[0];

    if (user.password !== password) throw new Error("Invalid credentials");
    if (!user.isActive) throw new Error("User account is inactive");

    localStorage.setItem("currentUser", JSON.stringify(user));
    return user;
  }
);

// ✅ Update user (handles restoring or adjusting quantities)
export const updateUser = createAsyncThunk<User, User>(
  "user/updateUser",
  async (user, { getState }) => {
    const state = getState() as any;
    const oldUser = state.user.users.find((u: any) => u.id === user.id);

    // Restore quantities for removed or reduced purchased products
    if (oldUser?.purchasedProducts && user.purchasedProducts) {
      for (const oldProd of oldUser.purchasedProducts) {
        const newProd = user.purchasedProducts.find(
          (p: any) => p.productId === oldProd.productId
        );

        // If product removed from user's purchase list → restore quantity
        if (!newProd) {
          const res = await fetch(`http://localhost:3000/cards/${oldProd.productId}`);
          if (res.ok) {
            const card = await res.json();
            const updatedCard = {
              ...card,
              quantity: card.quantity + oldProd.quantity,
            };
            await fetch(`http://localhost:3000/cards/${card.id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(updatedCard),
            });
          }
        }
      }
    }

    // Recombine address
    const combinedAddress = [
      user.address1,
      user.address2,
      user.city,
      user.state,
      user.zip,
      user.country,
    ]
      .filter(Boolean)
      .join(", ");

    const updatedPayload = { ...user, address: combinedAddress };

    const res = await fetch(`${API_URL}/${user.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedPayload),
    });

    if (!res.ok) throw new Error("Failed to update user");

    const updatedUser = await res.json();

    // Update localStorage if current user updated
    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");
    if (currentUser && currentUser.id === updatedUser.id) {
      localStorage.setItem("currentUser", JSON.stringify(updatedUser));
    }

    return updatedUser;
  }
);

// ✅ Delete user and restore product quantities
export const deleteUser = createAsyncThunk<string, string>(
  "user/deleteUser",
  async (id, { getState }) => {
    const state = getState() as any;
    const user = state.user.users.find((u: any) => u.id === id);

    // Restore product quantities if user had purchases
    if (user?.purchasedProducts?.length) {
      for (const purchase of user.purchasedProducts) {
        const res = await fetch(`http://localhost:3000/cards/${purchase.productId}`);
        if (res.ok) {
          const product = await res.json();
          const updatedCard = {
            ...product,
            quantity: product.quantity + purchase.quantity,
          };
          await fetch(`http://localhost:3000/cards/${purchase.productId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedCard),
          });
        }
      }
    }

    // Delete user
    const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete user");

    return id;
  }
);

// ------------------ Slice ------------------
const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    logout: (state) => {
      state.currentUser = null;
      localStorage.removeItem("currentUser");
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Users
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUsers.fulfilled, (state, action: PayloadAction<User[]>) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch users";
      })

      // Signup
      .addCase(signupUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.users.push(action.payload);
      })

      // Login
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.currentUser = action.payload;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.error = action.error.message || "Login failed";
      })

      // Update user
      .addCase(updateUser.fulfilled, (state, action: PayloadAction<User>) => {
        const index = state.users.findIndex((u) => u.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
      })

      // Delete user
      .addCase(deleteUser.fulfilled, (state, action: PayloadAction<string>) => {
        state.users = state.users.filter((user) => user.id !== action.payload);
      });
  },
});

export const { logout } = userSlice.actions;
export default userSlice.reducer;
