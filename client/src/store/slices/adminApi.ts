import { apiSlice } from '../apiSlice';

interface SeedResult {
  usersCreated: number;
  ticketsCreated: number;
}

interface SweepResult {
  ticketsDeleted: number;
  usersDeleted: number;
}

interface AdminResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const adminApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    seedDatabase: build.mutation<AdminResponse<SeedResult>, void>({
      query: () => ({
        url: '/admin/seed',
        method: 'POST',
      }),
      // Invalidate everything so the dashboard, ticket list, and user list refresh
      invalidatesTags: [
        { type: 'Ticket', id: 'LIST' },
        { type: 'Ticket', id: 'STATISTICS' },
        { type: 'User' },
      ],
    }),

    sweepDatabase: build.mutation<AdminResponse<SweepResult>, void>({
      query: () => ({
        url: '/admin/sweep',
        method: 'DELETE',
      }),
      // Invalidate everything after a sweep
      invalidatesTags: [
        { type: 'Ticket', id: 'LIST' },
        { type: 'Ticket', id: 'STATISTICS' },
        { type: 'User' },
      ],
    }),
  }),
});

export const { useSeedDatabaseMutation, useSweepDatabaseMutation } = adminApi;
