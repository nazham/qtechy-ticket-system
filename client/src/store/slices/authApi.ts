import { apiSlice } from '../apiSlice';
import { setCredentials, setUserProfile, setInitializing } from './authSlice';
import type { User } from './authSlice';
import { VALID_ROLES } from './authSlice';
import type { AppDispatch } from '../store';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface ApiUserData {
  _id: string;
  name: string;
  email: string;
  role: string;
  permissions?: string[];
  createdAt?: string;
  updatedAt?: string;
}

interface ApiAuthResponse {
  success: boolean;
  data: ApiUserData & { token: string };
}

interface ApiMeResponse {
  success: boolean;
  data: ApiUserData;
}

export const normalizeUser = (data: ApiUserData): User => {
  const normalizedRole = data.role.toLowerCase() as User['role'];
  if (!VALID_ROLES.includes(normalizedRole)) {
    throw new Error(`Unknown role received: ${data.role}`);
  }
  return {
    id: data._id,
    name: data.name,
    email: data.email,
    role: normalizedRole,
    permissions: data.permissions || [],
  };
};

const transformAuthResponse = (response: ApiAuthResponse): LoginResponse => ({
  user: normalizeUser(response.data),
  token: response.data.token,
});

const onAuthQueryStarted = async (
  _: unknown,
  {
    dispatch,
    queryFulfilled,
  }: { dispatch: AppDispatch; queryFulfilled: Promise<{ data: LoginResponse }> }
) => {
  try {
    const { data } = await queryFulfilled;
    dispatch(setCredentials(data));
  } catch {
    // Handled by the consuming component hook state
  }
};

export const authApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    login: build.mutation<LoginResponse, LoginCredentials>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      transformResponse: transformAuthResponse,
      onQueryStarted: onAuthQueryStarted,
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
      transformResponse: transformAuthResponse,
      onQueryStarted: onAuthQueryStarted,
    }),

    getMe: build.query<User, void>({
      query: () => '/auth/me',
      transformResponse: (response: ApiMeResponse): User =>
        normalizeUser(response.data),
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
