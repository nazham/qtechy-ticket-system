import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'agent' | 'user';
}

export const VALID_ROLES: User['role'][] = ['admin', 'agent', 'user'];

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
}

const getStoredToken = (): string | null => {
  const token = localStorage.getItem('token');
  return token && token !== 'undefined' ? token : null;
};

const storedToken = getStoredToken();

const initialState: AuthState = {
  user: null,
  token: storedToken,
  isAuthenticated: false, // set to true once fetchCurrentUser/getMe succeeds
  isInitializing: !!storedToken, // true if there is a session to rehydrate
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(
      state,
      action: PayloadAction<{ user: User; token: string }>
    ) {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.isInitializing = false;
      localStorage.setItem('token', action.payload.token);
    },

    setUserProfile(state, action: PayloadAction<User>) {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.isInitializing = false;
    },

    setInitializing(state, action: PayloadAction<boolean>) {
      state.isInitializing = action.payload;
    },

    logout(state) {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isInitializing = false;
      localStorage.removeItem('token');
    },
  },
  selectors: {
    selectUser: (state) => state.user,
    selectToken: (state) => state.token,
    selectIsAuthenticated: (state) => state.isAuthenticated,
    selectIsInitializing: (state) => state.isInitializing,
  },
});

export const { setCredentials, setUserProfile, setInitializing, logout } =
  authSlice.actions;
export const {
  selectUser,
  selectToken,
  selectIsAuthenticated,
  selectIsInitializing,
} = authSlice.selectors;
export default authSlice.reducer;
