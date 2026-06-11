import {
  TicketCategory,
  TicketPriority,
  TicketStatus,
} from '../../constants/enums';
import { apiSlice } from '../apiSlice';
import type { RootState } from '../store';

export interface Ticket {
  _id: string;
  ticketNumber: string;
  title: string;
  description: string;
  category: TicketCategory;
  status: TicketStatus;
  priority: TicketPriority;
  assignedTo?:
    | {
        _id: string;
        name: string;
        email: string;
      }
    | string;
  createdBy:
    | {
        _id: string;
        name: string;
        email: string;
      }
    | string;
  comments?: Array<{
    _id: string;
    user: { _id: string; name: string; email: string; role: string } | string;
    message: string;
    createdAt: string;
  }>;
  statusHistory?: Array<{
    _id: string;
    status: Ticket['status'];
    changedBy: { _id: string; name: string } | string;
    changedAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTicketPayload {
  title: string;
  description: string;
  category: Ticket['category'];
  priority: Ticket['priority'];
  assignedTo?: string | null;
}

export interface TicketStatistics {
  ticketsByStatus: {
    open: number;
    inProgress: number;
    resolved: number;
    closed: number;
  };
  totalUsers?: number;
  triageBacklog?: number;
  categoryDistribution?: Record<string, number>;
  urgentFocus?: number;
  recentTickets?: Array<{
    _id: string;
    ticketNumber: string;
    title: string;
    status: Ticket['status'];
    updatedAt: string;
    lastActivity: string;
  }>;
}

export interface GetTicketsParams {
  page?: number;
  limit?: number;
  searchTerm?: string;
  status?: string;
  priority?: string;
  category?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc' | '1' | '-1';
}

export interface GetTicketsResponse {
  success: boolean;
  count: number;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
  data: Ticket[];
}

interface CreateTicketResponse {
  success: boolean;
  data: Ticket;
}

interface GetTicketStatisticsResponse {
  success: boolean;
  data: TicketStatistics;
}

interface GetTicketResponse {
  success: boolean;
  data: Ticket;
}

export interface UpdateTicketStatusPayload {
  id: string;
  status: Ticket['status'];
}

export interface AssignTicketPayload {
  id: string;
  assignedTo: string | null;
}

export interface AddCommentPayload {
  id: string;
  message: string;
}

export interface UpdateTicketPayload {
  id: string;
  updates: Partial<CreateTicketPayload>;
}

/**
 * Returns all serialized arg-keys currently cached for the `getTickets` query.
 * We inspect the RTK Query `queries` sub-state to find them.
 */
function getCachedGetTicketsArgs(getState: () => unknown) {
  const state = getState() as RootState;
  const queries = state[apiSlice.reducerPath]?.queries ?? {};
  const argsSet: Array<GetTicketsParams | void> = [];

  for (const key of Object.keys(queries)) {
    if (key.startsWith('getTickets(')) {
      const entry = queries[key];
      // Only patch fulfilled / non-errored entries
      if (entry && entry.status === 'fulfilled') {
        argsSet.push(entry.originalArgs as GetTicketsParams | void);
      }
    }
  }
  return argsSet;
}

export const ticketApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    getTickets: build.query<GetTicketsResponse, GetTicketsParams | void>({
      query: (params) => {
        if (!params) return '/tickets';

        const query = new URLSearchParams();
        if (params.page !== undefined)
          query.append('page', params.page.toString());
        if (params.limit !== undefined)
          query.append('limit', params.limit.toString());
        if (params.searchTerm) query.append('searchTerm', params.searchTerm);
        if (params.status) query.append('status', params.status);
        if (params.priority) query.append('priority', params.priority);
        if (params.category) query.append('category', params.category);
        if (params.sortBy) query.append('sortBy', params.sortBy);
        if (params.sortOrder) query.append('sortOrder', params.sortOrder);

        const queryString = query.toString();
        return queryString ? `/tickets?${queryString}` : '/tickets';
      },
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ _id }) => ({
                type: 'Ticket' as const,
                id: _id,
              })),
              { type: 'Ticket', id: 'LIST' },
            ]
          : [{ type: 'Ticket', id: 'LIST' }],
    }),

    getTicketStatistics: build.query<TicketStatistics, void>({
      query: () => '/tickets/statistics',
      transformResponse: (response: GetTicketStatisticsResponse) =>
        response.data,
      providesTags: [{ type: 'Ticket', id: 'STATISTICS' }],
    }),

    createTicket: build.mutation<Ticket, CreateTicketPayload>({
      query: (ticketData) => ({
        url: '/tickets',
        method: 'POST',
        body: ticketData,
      }),
      transformResponse: (response: CreateTicketResponse) => response.data,
      // Pessimistic update: we can't predict _id / ticketNumber, so we wait for the server, then insert the new ticket into all cached lists.
      // Statistics invalidation is done manually inside onQueryStarted to avoid a race with the cache patch (invalidatesTags fires before onQueryStarted finishes its async work).
      async onQueryStarted(_arg, { dispatch, queryFulfilled, getState }) {
        try {
          const { data: newTicket } = await queryFulfilled;
          const cachedArgs = getCachedGetTicketsArgs(getState);

          for (const args of cachedArgs) {
            dispatch(
              ticketApi.util.updateQueryData('getTickets', args, (draft) => {
                draft.data.unshift(newTicket);
                draft.count += 1;
                if (draft.pagination) {
                  draft.pagination.total += 1;
                }
              })
            );
          }

          // Revalidate statistics after the list cache is patched
          dispatch(
            ticketApi.util.invalidateTags([
              { type: 'Ticket', id: 'STATISTICS' },
            ])
          );
        } catch {}
      },
    }),

    getTicket: build.query<Ticket, string>({
      query: (id) => `/tickets/${id}`,
      transformResponse: (response: GetTicketResponse) => response.data,
      providesTags: (_result, _error, id) => [{ type: 'Ticket', id }],
    }),

    updateTicketStatus: build.mutation<Ticket, UpdateTicketStatusPayload>({
      query: ({ id, status }) => ({
        url: `/tickets/${id}/status`,
        method: 'PUT',
        body: { status },
      }),
      transformResponse: (response: GetTicketResponse) => response.data,
      async onQueryStarted(
        { id, status },
        { dispatch, queryFulfilled, getState }
      ) {
        const patchTicket = dispatch(
          ticketApi.util.updateQueryData('getTicket', id, (draft) => {
            draft.status = status;
          })
        );

        const cachedArgs = getCachedGetTicketsArgs(getState);
        const listPatches = cachedArgs.map((args) =>
          dispatch(
            ticketApi.util.updateQueryData('getTickets', args, (draft) => {
              const ticket = draft.data.find((t) => t._id === id);
              if (ticket) ticket.status = status;
            })
          )
        );

        try {
          await queryFulfilled;
        } catch {
          patchTicket.undo();
          listPatches.forEach((p) => p.undo());
        }
      },
      invalidatesTags: [{ type: 'Ticket', id: 'STATISTICS' }],
    }),

    assignTicket: build.mutation<Ticket, AssignTicketPayload>({
      query: ({ id, assignedTo }) => ({
        url: `/tickets/${id}/assign`,
        method: 'PUT',
        body: { assignedTo },
      }),
      transformResponse: (response: GetTicketResponse) => response.data,
      async onQueryStarted(
        { id, assignedTo },
        { dispatch, queryFulfilled, getState }
      ) {
        const patchTicket = dispatch(
          ticketApi.util.updateQueryData('getTicket', id, (draft) => {
            draft.assignedTo = assignedTo ?? undefined;
          })
        );

        const cachedArgs = getCachedGetTicketsArgs(getState);
        const listPatches = cachedArgs.map((args) =>
          dispatch(
            ticketApi.util.updateQueryData('getTickets', args, (draft) => {
              const ticket = draft.data.find((t) => t._id === id);
              if (ticket) ticket.assignedTo = assignedTo ?? undefined;
            })
          )
        );

        try {
          await queryFulfilled;
        } catch {
          patchTicket.undo();
          listPatches.forEach((p) => p.undo());
        }
      },
      invalidatesTags: [{ type: 'Ticket', id: 'STATISTICS' }],
    }),

    addComment: build.mutation<Ticket, AddCommentPayload>({
      query: ({ id, message }) => ({
        url: `/tickets/${id}/comments`,
        method: 'POST',
        body: { message },
      }),
      transformResponse: (response: GetTicketResponse) => response.data,
      async onQueryStarted({ id }, { dispatch, queryFulfilled }) {
        try {
          const { data: updatedTicket } = await queryFulfilled;
          // Pessimistic update: merge the full server response into the
          // individual ticket cache so comments appear instantly.
          dispatch(
            ticketApi.util.updateQueryData('getTicket', id, (draft) => {
              Object.assign(draft, updatedTicket);
            })
          );
        } catch {}
      },
      // Comments don't change statistics; only invalidate the specific ticket
      // so that if the user navigates away and back, they see the latest.
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Ticket', id }],
    }),

    updateTicket: build.mutation<Ticket, UpdateTicketPayload>({
      query: ({ id, updates }) => ({
        url: `/tickets/${id}`,
        method: 'PUT',
        body: updates,
      }),
      transformResponse: (response: GetTicketResponse) => response.data,
      async onQueryStarted(
        { id, updates },
        { dispatch, queryFulfilled, getState }
      ) {
        const patchTicket = dispatch(
          ticketApi.util.updateQueryData('getTicket', id, (draft) => {
            Object.assign(draft, updates);
          })
        );

        const cachedArgs = getCachedGetTicketsArgs(getState);
        const listPatches = cachedArgs.map((args) =>
          dispatch(
            ticketApi.util.updateQueryData('getTickets', args, (draft) => {
              const ticket = draft.data.find((t) => t._id === id);
              if (ticket) Object.assign(ticket, updates);
            })
          )
        );

        try {
          const { data: serverTicket } = await queryFulfilled;
          // Reconcile with server truth for the individual ticket cache
          dispatch(
            ticketApi.util.updateQueryData('getTicket', id, (draft) => {
              Object.assign(draft, serverTicket);
            })
          );
        } catch {
          patchTicket.undo();
          listPatches.forEach((p) => p.undo());
        }
      },
      // Always revalidate statistics; list & detail are handled optimistically.
      invalidatesTags: [{ type: 'Ticket', id: 'STATISTICS' }],
    }),

    deleteTicket: build.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/tickets/${id}`,
        method: 'DELETE',
      }),
      async onQueryStarted(id, { dispatch, queryFulfilled, getState }) {
        const cachedArgs = getCachedGetTicketsArgs(getState);
        const listPatches = cachedArgs.map((args) =>
          dispatch(
            ticketApi.util.updateQueryData('getTickets', args, (draft) => {
              const idx = draft.data.findIndex((t) => t._id === id);
              if (idx !== -1) {
                draft.data.splice(idx, 1);
                draft.count -= 1;
                if (draft.pagination) {
                  draft.pagination.total -= 1;
                }
              }
            })
          )
        );

        try {
          await queryFulfilled;
        } catch {
          listPatches.forEach((p) => p.undo());
        }
      },
      // Revalidate statistics and list so the page fills any empty slots.
      invalidatesTags: [
        { type: 'Ticket', id: 'STATISTICS' },
        { type: 'Ticket', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetTicketsQuery,
  useCreateTicketMutation,
  useGetTicketStatisticsQuery,
  useGetTicketQuery,
  useUpdateTicketStatusMutation,
  useAssignTicketMutation,
  useAddCommentMutation,
  useUpdateTicketMutation,
  useDeleteTicketMutation,
} = ticketApi;
