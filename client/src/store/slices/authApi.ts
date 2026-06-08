import { apiSlice } from '../apiSlice';
import { setCredentials, setUserProfile, setInitializing } from './authSlice';
import type { User } from './authSlice';
import { VALID_ROLES } from './authSlice';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
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

export const authApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    login: build.mutation<LoginResponse, LoginCredentials>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      transformResponse: (response: ApiLoginResponse): LoginResponse => {
        const { _id, name, email, role, token } = response.data;
        const normalizedRole = role.toLowerCase() as User['role'];

        if (!VALID_ROLES.includes(normalizedRole)) {
          throw new Error(`Unknown role received: ${role}`);
        }

        return {
          user: {
            id: _id,
            name,
            email,
            role: normalizedRole,
          },
          token,
        };
      },
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setCredentials(data));
        } catch {
          // Handled by the consuming component hook state
        }
      },
    }),

    registerUser: build.mutation<
      LoginResponse,
      LoginCredentials & { name: string }
    >({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        body: userData,
      }),
      transformResponse: (response: ApiLoginResponse): LoginResponse => {
        const { _id, name, email, role, token } = response.data;
        const normalizedRole = role.toLowerCase() as User['role'];

        if (!VALID_ROLES.includes(normalizedRole)) {
          throw new Error(`Unknown role received: ${role}`);
        }

        return {
          user: {
            id: _id,
            name,
            email,
            role: normalizedRole,
          },
          token,
        };
      },
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setCredentials(data));
        } catch {
          // Handled by the consuming component hook state
        }
      },
    }),

    getMe: build.query<User, void>({
      query: () => '/auth/me',
      transformResponse: (response: ApiMeResponse): User => {
        const { _id, name, email, role } = response.data;
        const normalizedRole = role.toLowerCase() as User['role'];

        if (!VALID_ROLES.includes(normalizedRole)) {
          throw new Error(`Unknown role received: ${role}`);
        }

        return {
          id: _id,
          name,
          email,
          role: normalizedRole,
        };
      },
      providesTags: ['User'],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setUserProfile(data));
        } catch {
          dispatch(setInitializing(false));
        }
      },
    }),
  }),
});

export const { useLoginMutation, useRegisterUserMutation, useGetMeQuery } =
  authApi;
