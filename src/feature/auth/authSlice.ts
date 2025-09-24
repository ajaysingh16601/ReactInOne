// src/feature/auth/authSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authApi } from "./authApi";

// Mock async API for demo
const fakeApiCall = <T>(response: T, shouldFail = false, delay = 1000) =>
  new Promise<T>((resolve, reject) => {
    setTimeout(() => {
      if (shouldFail) reject(new Error('Something went wrong.'));
      else resolve(response);
    }, delay);
  });

type User = {
  _id: string;
  firstname: string;
  lastname: string;
  username: string;
  email: string;
};

type Tokens = {
  accessToken: string;
  refreshToken: string;
};

type AuthStep = "login" | "otp" | "authenticated";
type RegisterStep = "email" | "otp" | "details" | "done";

type AuthState = {
  isAuthenticated: boolean;
  user: User | null;
  tokens: Tokens | null;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
  secret: string | null;
  step: AuthStep;
  registerStep: RegisterStep;
  registrationToken: string | null;
  resetToken: string | null;
  hydrated: boolean;
};

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  tokens: null,
  loading: false,
  error: null,
  successMessage: null,
  secret: null,
  step: "login",
  registerStep: "email",
  registrationToken: null,
  resetToken: null,
  hydrated: false,
};

// --- STEP 1: Request OTP ---
export const requestRegisterOtp = createAsyncThunk(
  "auth/requestRegisterOtp",
  async (data: { email: string }, { rejectWithValue }) => {
    try {
      return await authApi.requestRegisterOtp(data.email);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// --- STEP 2: Verify OTP ---
export const verifyRegisterOtp = createAsyncThunk(
  "auth/verifyRegisterOtp",
  async (data: { email: string; otp: string; secret: string }, { rejectWithValue }) => {
    try {
      return await authApi.verifyRegisterOtp(data);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// --- STEP 3: Register user ---
export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (payload: {
    username: string;
    firstname: string;
    lastname: string;
    password: string;
    registrationToken: string;
  }, { rejectWithValue }) => {
    try {
      return await authApi.registerUser(payload);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Step 1 → request OTP
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (payload: { email: string; password: string }, { rejectWithValue }) => {
    try {
      return await authApi.loginUser(payload);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Step 2 → verify OTP
export const verifyOtp = createAsyncThunk(
  "auth/verifyOtp",
  async (payload: { email: string; secret: string; otp: string }, { rejectWithValue }) => {
    try {
      return await authApi.verifyOtp(payload);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// --- Step 1: Request OTP ---
export const requestForgotOtp = createAsyncThunk(
  "auth/requestForgotOtp",
  async (data: { email: string }, { rejectWithValue }) => {
    try {
      return await authApi.requestForgotOtp(data.email);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// --- Step 2: Verify OTP ---
export const verifyForgotOtp = createAsyncThunk(
  "auth/verifyForgotOtp",
  async (data: { email: string; otp: string; secret: string }, { rejectWithValue }) => {
    try {
      return await authApi.verifyForgotOtp(data);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// --- Step 3: Reset Password ---
export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async (data: { newPassword: string; confirmPassword: string; resetToken: string }, { rejectWithValue }) => {
    try {
      return await authApi.resetPassword(data);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.tokens = null;
      state.secret = null;
      state.step = "login";
      state.registerStep = "email";
      state.registrationToken = null;
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    },
    clearMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
    restoreAuth: (state, action) => {
      state.tokens = action.payload.tokens;
      state.user = action.payload.user || null;
      state.isAuthenticated = true;
      state.hydrated = true;
    },
    hydrate: (state) => {
      state.hydrated = true;
    },
  },
  extraReducers: (builder) => {
    // STEP 1 → Request OTP
    builder.addCase(requestRegisterOtp.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(requestRegisterOtp.fulfilled, (state, action) => {
      state.loading = false;
      state.secret = action.payload.secret;
      state.registerStep = 'otp';
      state.successMessage = 'OTP sent to your email';
    });
    builder.addCase(requestRegisterOtp.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // STEP 2 → Verify OTP
    builder.addCase(verifyRegisterOtp.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(verifyRegisterOtp.fulfilled, (state, action) => {
      state.loading = false;
      state.registrationToken = action.payload.registrationToken;
      state.registerStep = 'details';
      state.successMessage = 'OTP verified. Continue with registration.';
    });
    builder.addCase(verifyRegisterOtp.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // STEP 3 → Register User
    builder.addCase(registerUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(registerUser.fulfilled, (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload;
      state.registerStep = 'done';
      state.successMessage = 'Registration successful. You can now login.';
    });
    builder.addCase(registerUser.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // --- LOGIN (Step 1) ---
    builder.addCase(loginUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(loginUser.fulfilled, (state, action) => {
      state.loading = false;
      state.successMessage = action.payload.message;
      state.secret = action.payload.secret;
      state.step = 'otp';
    });
    builder.addCase(loginUser.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // --- VERIFY OTP (Step 2) ---
    builder.addCase(verifyOtp.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(verifyOtp.fulfilled, (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      // state.user = { _id: "1", firstname: "John", lastname: "Doe", username: "johndoe", email: "johndoe@example.com" };
      state.tokens = action.payload.tokens;
      state.step = 'authenticated';
      localStorage.setItem('accessToken', action.payload.tokens.accessToken);
      localStorage.setItem('refreshToken', action.payload.tokens.refreshToken);
    });
    builder.addCase(verifyOtp.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Forgot Password
    // Request OTP
    builder.addCase(requestForgotOtp.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.successMessage = null;
    });
    builder.addCase(requestForgotOtp.fulfilled, (state, action) => {
      state.loading = false;
      state.successMessage = action.payload.message;
      state.secret = action.payload.secret;
    });
    builder.addCase(requestForgotOtp.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Verify OTP
    builder.addCase(verifyForgotOtp.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.successMessage = null;
    });
    builder.addCase(verifyForgotOtp.fulfilled, (state, action) => {
      state.loading = false;
      state.resetToken = action.payload.resetToken;
      state.successMessage = 'OTP verified. Enter new password.';
    });
    builder.addCase(verifyForgotOtp.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Reset Password
    builder.addCase(resetPassword.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.successMessage = null;
    });
    builder.addCase(resetPassword.fulfilled, (state, action) => {
      state.loading = false;
      state.successMessage = action.payload.message;
      state.resetToken = null;
      state.secret = null;
    });
    builder.addCase(resetPassword.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { logout, clearMessages, restoreAuth, hydrate } = authSlice.actions;
export default authSlice.reducer;
