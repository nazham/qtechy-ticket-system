import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api/axios";
import { extractApiError } from "../../api/utils";
export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "agent" | "user";
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResponse {
  user: User;
  token: string;
}

interface ApiLoginResponse {
  success: boolean;
  data: {
    _id: string;
    name: string;
    email: string;
    role: string;
    token: string;
    createdAt?: string;
    updatedAt?: string;
  };
}

interface ApiMeResponse {
  success: boolean;
  data: {
    _id: string;
    name: string;
    email: string;
    role: string;
    createdAt?: string;
    updatedAt?: string;
  };
}

// ─── Initial State ──────────────────────────────────────────────────────────
// Rehydrate token from localStorage. The user profile is loaded asynchronously.

const getStoredToken = (): string | null => {
  const token = localStorage.getItem("token");
  return token && token !== "undefined" ? token : null;
};

const storedToken = getStoredToken();

const initialState: AuthState = {
  user: null,
  token: storedToken,
  isAuthenticated: false, // set to true once fetchCurrentUser succeeds
  isInitializing: !!storedToken, // true if there is a session to rehydrate
  status: "idle",
  error: null,
};

// ─── Async Thunks ───────────────────────────────────────────────────────────

/**
 * Authenticates a user via POST /api/auth/login.
 * On success, persists only the JWT to localStorage.
 */
export const loginUser = createAsyncThunk<LoginResponse, LoginCredentials>(
  "auth/loginUser",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await api.post<ApiLoginResponse>(
        "/auth/login",
        credentials,
      );
      const apiData = response.data;

      if (
        !apiData ||
        !apiData.success ||
        !apiData.data ||
        !apiData.data.token
      ) {
        return rejectWithValue("Invalid login response from server");
      }

      const { _id, name, email, role, token } = apiData.data;

      // Normalize user role (lowercase) and map _id to id
      const VALID_ROLES: User["role"][] = ["admin", "agent", "user"];
      const normalizedRole = role.toLowerCase() as User["role"];

      if (!VALID_ROLES.includes(normalizedRole)) {
        return rejectWithValue(`Unknown role received from server: ${role}`);
      }

      const user: User = {
        id: _id,
        name,
        email,
        role: normalizedRole,
      };

      // Persist ONLY the token to localStorage
      localStorage.setItem("token", token);

      return { user, token };
    } catch (error: unknown) {
      return rejectWithValue(extractApiError(error, "Login failed"));
    }
  },
);

/**
 * Rehydrates the user profile using the stored token on application startup.
 */
export const fetchCurrentUser = createAsyncThunk<User, void>(
  "auth/fetchCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<ApiMeResponse>("/auth/me");
      const apiData = response.data;

      if (!apiData || !apiData.success || !apiData.data) {
        return rejectWithValue("Failed to fetch user profile");
      }

      const { _id, name, email, role } = apiData.data;

      const VALID_ROLES: User["role"][] = ["admin", "agent", "user"];
      const normalizedRole = role.toLowerCase() as User["role"];

      if (!VALID_ROLES.includes(normalizedRole)) {
        return rejectWithValue(`Unknown role received from server: ${role}`);
      }

      return {
        id: _id,
        name,
        email,
        role: normalizedRole,
      };
    } catch (error: unknown) {
      return rejectWithValue(
        extractApiError(error, "Failed to fetch user profile"),
      );
    }
  },
  {
    condition(_, { getState }) {
      const state = getState() as { auth: AuthState };
      // Prevent redundant profile fetches while one is in flight
      return state.auth.status !== "loading" && !state.auth.user;
    },
  },
);

// ─── Slice ──────────────────────────────────────────────────────────────────

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isInitializing = false;
      state.status = "idle";
      state.error = null;

      localStorage.removeItem("token");
    },

    /** Resets the error field (useful when navigating away from login). */
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // loginUser
      .addCase(loginUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.isInitializing = false;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) ?? "Login failed";
        state.isAuthenticated = false;
      })

      // fetchCurrentUser
      .addCase(fetchCurrentUser.pending, (state) => {
        state.status = "loading";
        state.isInitializing = true;
        state.error = null;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.isInitializing = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.status = "failed";
        state.isInitializing = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        localStorage.removeItem("token");
      });
  },
});

export const { logout, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
