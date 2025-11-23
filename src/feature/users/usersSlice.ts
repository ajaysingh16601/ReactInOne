// src/feature/users/usersSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { User } from '../../types';
import { usersApi } from '../../api/usersApi';

interface UsersState {
  users: User[];
  currentUser: User | null;
  loading: boolean;
  error: string | null;
}

const initialState: UsersState = {
  users: [],
  currentUser: null,
  loading: false,
  error: null,
};

// Async thunks
export const fetchAllUsers = createAsyncThunk(
  'users/fetchAllUsers',
  async (params?: { search?: string; exclude?: string[] }) => {
    return await usersApi.getAllUsers(params);
  }
);

export const fetchCurrentUser = createAsyncThunk(
  'users/fetchCurrentUser',
  async () => {
    return await usersApi.getCurrentUser();
  }
);

export const searchUsers = createAsyncThunk(
  'users/searchUsers',
  async ({ query, exclude = [] }: { query: string; exclude?: string[] }) => {
    return await usersApi.searchUsers(query, 20, exclude);
  }
);

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setCurrentUser: (state, action: PayloadAction<User | null>) => {
      state.currentUser = action.payload;
    },
    clearUsers: (state) => {
      state.users = [];
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all users
      .addCase(fetchAllUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch users';
      })

      // Fetch current user
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch current user';
      })

      // Search users
      .addCase(searchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(searchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to search users';
      });
  },
});

export const {
  setCurrentUser,
  clearUsers,
  setError,
  clearError,
} = usersSlice.actions;

export default usersSlice.reducer;