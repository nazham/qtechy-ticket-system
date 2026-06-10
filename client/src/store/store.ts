import { configureStore, type Middleware } from '@reduxjs/toolkit';
import authReducer, { logout } from './slices/authSlice';
import { apiSlice } from './apiSlice';

const logoutMiddleware: Middleware = (storeApi) => (next) => (action) => {
  if (
    action &&
    typeof action === 'object' &&
    'type' in action &&
    action.type === logout.type
  ) {
    storeApi.dispatch(apiSlice.util.resetApiState());
  }
  return next(action);
};

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware).concat(logoutMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
