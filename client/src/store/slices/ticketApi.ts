import { apiSlice } from '../apiSlice';

export interface Ticket {
  _id: string;
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
  assignedTo?: string;
  createdBy: string;
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

interface GetTicketsResponse {
  success: boolean;
  count: number;
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
    getTickets: build.query<Ticket[], void>({
      query: () => '/tickets',
      transformResponse: (response: GetTicketsResponse) => response.data,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ _id }) => ({
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
