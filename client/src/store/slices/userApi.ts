import { apiSlice } from '../apiSlice';
import type { User } from './authSlice';
import { type ApiUserData, normalizeUser } from './authApi';

// Extended user type that includes metadata like join date and active tickets count
export interface UserWithMeta extends User {
  createdAt: string;
  activeTicketsCount: number;
}

interface ApiUserDirectoryData extends ApiUserData {
  activeTicketsCount?: number;
}

interface ApiGetUsersDirectoryResponse {
  success: boolean;
  count: number;
  data: ApiUserDirectoryData[];
}

interface ApiGetUsersResponse {
  success: boolean;
  count: number;
  data: ApiUserData[];
}

const normalizeUserWithMeta = (data: ApiUserDirectoryData): UserWithMeta => ({
  ...normalizeUser(data),
  createdAt: data.createdAt ?? '',
  activeTicketsCount: data.activeTicketsCount ?? 0,
});

export const userApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    getUsers: build.query<User[], { role?: string } | void>({
      query: (params) => {
        if (params && typeof params === 'object' && params.role) {
          const query = new URLSearchParams({ role: params.role });
          return `/users?${query.toString()}`;
        }
        return '/users';
      },
      transformResponse: (response: ApiGetUsersResponse): User[] =>
        response.data.map(normalizeUser),
      providesTags: ['User'],
    }),
    getUsersDirectory: build.query<UserWithMeta[], void>({
      query: () => '/users/directory',
      transformResponse: (
        response: ApiGetUsersDirectoryResponse
      ): UserWithMeta[] => response.data.map(normalizeUserWithMeta),
      providesTags: ['User'],
    }),
    promoteToAgent: build.mutation<UserWithMeta, string>({
      query: (id) => ({
        url: `/users/${id}/promote`,
        method: 'PUT',
      }),
      transformResponse: (response: {
        success: boolean;
        data: ApiUserData;
      }): UserWithMeta => normalizeUserWithMeta(response.data),
      invalidatesTags: ['User'],
    }),
    demoteToUser: build.mutation<UserWithMeta, string>({
      query: (id) => ({
        url: `/users/${id}/demote`,
        method: 'PUT',
      }),
      transformResponse: (response: {
        success: boolean;
        data: ApiUserData;
      }): UserWithMeta => normalizeUserWithMeta(response.data),
      invalidatesTags: ['User'],
    }),
    deleteUser: build.mutation<UserWithMeta, string>({
      query: (id) => ({
        url: `/users/${id}`,
        method: 'DELETE',
      }),
      transformResponse: (response: {
        success: boolean;
        data: ApiUserData;
      }): UserWithMeta => normalizeUserWithMeta(response.data),
      invalidatesTags: ['User'],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUsersDirectoryQuery,
  usePromoteToAgentMutation,
  useDemoteToUserMutation,
  useDeleteUserMutation,
} = userApi;
