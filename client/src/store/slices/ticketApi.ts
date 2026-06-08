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

interface GetTicketsResponse {
  success: boolean;
  count: number;
  data: Ticket[];
}

interface CreateTicketResponse {
  success: boolean;
  data: Ticket;
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

export const { useGetTicketsQuery, useCreateTicketMutation } = ticketApi;
