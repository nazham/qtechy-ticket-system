import { apiSlice } from '../apiSlice';
import {
  TicketStatus,
  TicketCategory,
  TicketPriority,
} from '../../constants/enums';

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
      invalidatesTags: [
        { type: 'Ticket', id: 'LIST' },
        { type: 'Ticket', id: 'STATISTICS' },
      ],
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
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Ticket', id },
        { type: 'Ticket', id: 'LIST' },
        { type: 'Ticket', id: 'STATISTICS' },
      ],
    }),

    assignTicket: build.mutation<Ticket, AssignTicketPayload>({
      query: ({ id, assignedTo }) => ({
        url: `/tickets/${id}/assign`,
        method: 'PUT',
        body: { assignedTo },
      }),
      transformResponse: (response: GetTicketResponse) => response.data,
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Ticket', id },
        { type: 'Ticket', id: 'LIST' },
        { type: 'Ticket', id: 'STATISTICS' },
      ],
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
          dispatch(
            ticketApi.util.updateQueryData('getTicket', id, (draft) => {
              Object.assign(draft, updatedTicket);
            })
          );
        } catch {
          // In case of error, the query will handle it. We just do pessimistic update here.
        }
      },
      // Note: We use an optimistic-on-success update for getTicket,
      // and we fallback to invalidating both LIST and the specific Ticket ID.
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Ticket', id: 'LIST' },
        { type: 'Ticket', id },
      ],
    }),

    updateTicket: build.mutation<Ticket, UpdateTicketPayload>({
      query: ({ id, updates }) => ({
        url: `/tickets/${id}`,
        method: 'PUT',
        body: updates,
      }),
      transformResponse: (response: GetTicketResponse) => response.data,
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Ticket', id },
        { type: 'Ticket', id: 'LIST' },
        { type: 'Ticket', id: 'STATISTICS' },
      ],
    }),

    deleteTicket: build.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/tickets/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [
        { type: 'Ticket', id: 'LIST' },
        { type: 'Ticket', id: 'STATISTICS' },
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
