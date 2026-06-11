import { apiSlice } from '../apiSlice';

export interface Ticket {
  _id: string;
  ticketNumber: string;
  title: string;
  description: string;
  category:
    | 'Bug'
    | 'Feature Request'
    | 'Technical Issue'
    | 'Payment Issue'
    | 'Account Issue'
    | 'Other';
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
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
  createdAt: string;
  updatedAt: string;
}

export interface CreateTicketPayload {
  title: string;
  description: string;
  category: Ticket['category'];
  priority: Ticket['priority'];
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
  urgentEscalations?: number;
  priorityFocus?: number;
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
      providesTags: ['Ticket'],
    }),

    createTicket: build.mutation<Ticket, CreateTicketPayload>({
      query: (ticketData) => ({
        url: '/tickets',
        method: 'POST',
        body: ticketData,
      }),
      transformResponse: (response: CreateTicketResponse) => response.data,
      invalidatesTags: [{ type: 'Ticket', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetTicketsQuery,
  useCreateTicketMutation,
  useGetTicketStatisticsQuery,
} = ticketApi;
