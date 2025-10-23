import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";

const API_URL = "http://localhost:3000/users";

export interface User {
  id: string;
  fullName?: string;
  email?: string;
  password?: string;
  phoneNumber?: string;
  gender?: string;
  profileImage?: string | null;
}

interface UserState {
  users: User[];
  currentUser: User | null;
  loading: boolean;
  error: string | null;
}

// ------------------ Thunks ------------------
export const fetchUsers = createAsyncThunk<User[]>(
  "user/fetchUsers",
  async () => {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("Failed to fetch users");
    return await res.json();
  }
);

export const signupUser = createAsyncThunk<User, Omit<User, "id">>(
  "user/signupUser",
  async (user) => {
    const newUser: User = { ...user, id: Date.now().toString() };
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newUser),
    });
    if (!res.ok) throw new Error("Signup failed");
    return newUser;
  }
);

export const loginUser = createAsyncThunk<User, { email: string; password: string }>(
  "user/loginUser",
  async ({ email, password }) => {
    const res = await fetch(`${API_URL}?email=${email}&password=${password}`);
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) throw new Error("Invalid credentials");
    return data[0];
  }
);

export const updateUser = createAsyncThunk<User, User>(
  "user/updateUser",
  async (updatedUser) => {
    const res = await fetch(`${API_URL}/${updatedUser.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedUser),
    });
    if (!res.ok) throw new Error("Update failed");
    return updatedUser;
  }
);

export const deleteUser = createAsyncThunk<string, string>(
  "user/deleteUser",
  async (id) => {
    const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Delete failed");
    return id;
  }
);

// ------------------ Initial State ------------------
const initialState: UserState = {
  users: [],
  currentUser: JSON.parse(localStorage.getItem("currentUser") || "null"),
  loading: false,
  error: null,
};

// ------------------ Slice ------------------
const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    logout: (state) => {
      state.currentUser = null;
      localStorage.removeItem("currentUser");
    },
    setCurrentUser: (state, action: PayloadAction<User>) => {
      state.currentUser = action.payload;
      localStorage.setItem("currentUser", JSON.stringify(action.payload));
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch users
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch users";
      })

      // Signup user (✅ fixed: no auto-login)
      .addCase(signupUser.fulfilled, (state, action) => {
        state.users.push(action.payload);
      })

      // Login user
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
        localStorage.setItem("currentUser", JSON.stringify(action.payload));
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Login failed";
      })

      // Update user
      .addCase(updateUser.fulfilled, (state, action) => {
        state.users = state.users.map((u) =>
          u.id === action.payload.id ? action.payload : u
        );
        state.currentUser = action.payload;
        localStorage.setItem("currentUser", JSON.stringify(action.payload));
      })

      // Delete user
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter((u) => u.id !== action.payload);
      });
  },
});

export const { logout, setCurrentUser } = userSlice.actions;
export default userSlice.reducer;
