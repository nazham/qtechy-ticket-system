import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';
import { extractApiError } from '../../api/utils';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface Ticket {
  _id: string;
  title: string;
  description: string;
  category: 'Bug' | 'Feature Request' | 'Technical Issue' | 'Payment Issue' | 'Account Issue' | 'Other';
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  assignedTo?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface TicketState {
  tickets: Ticket[];
  currentTicket: Ticket | null;
  fetchStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  createStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

export interface CreateTicketPayload {
  title: string;
  description: string;
  category: Ticket['category'];
  priority: Ticket['priority'];
}

// ─── Initial State ──────────────────────────────────────────────────────────

const initialState: TicketState = {
  tickets: [],
  currentTicket: null,
  fetchStatus: 'idle',
  createStatus: 'idle',
  error: null,
};

// ─── Async Thunks ───────────────────────────────────────────────────────────

interface GetTicketsResponse {
  success: boolean;
  count: number;
  data: Ticket[];
}

interface CreateTicketResponse {
  success: boolean;
  data: Ticket;
}

/**
 * Fetches all tickets from GET /api/tickets.
 * Includes a `condition` guard to prevent duplicate requests when
 * a fetch is already in progress.
 */
export const fetchTickets = createAsyncThunk<Ticket[], void>(
  'tickets/fetchTickets',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<GetTicketsResponse>('/tickets');
      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(extractApiError(error, 'Failed to fetch tickets'));
    }
  },
  {
    condition(_, { getState }) {
      const state = getState() as { tickets: TicketState };
      // Prevent redundant fetches while one is already in-flight
      return state.tickets.fetchStatus !== 'loading';
    },
  }
);

/**
 * Creates a new ticket via POST /api/tickets.
 * On success the new ticket is prepended to the tickets array so the
 * UI updates immediately without a full refetch.
 */
export const createTicket = createAsyncThunk<Ticket, CreateTicketPayload>(
  'tickets/createTicket',
  async (ticketData, { rejectWithValue }) => {
    try {
      const response = await api.post<CreateTicketResponse>('/tickets', ticketData);
      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(extractApiError(error, 'Failed to create ticket'));
    }
  }
);

// ─── Slice ──────────────────────────────────────────────────────────────────

const ticketSlice = createSlice({
  name: 'tickets',
  initialState,
  reducers: {
    /** Sets a single ticket for the detail/edit view. */
    setCurrentTicket(state, action: { payload: Ticket | null }) {
      state.currentTicket = action.payload;
    },

    /** Clears the ticket-level error (e.g. when navigating away). */
    clearTicketError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ── fetchTickets ────────────────────────────────────────────────
      .addCase(fetchTickets.pending, (state) => {
        state.fetchStatus = 'loading';
        state.error = null;
      })
      .addCase(fetchTickets.fulfilled, (state, action) => {
        state.fetchStatus = 'succeeded';
        state.tickets = action.payload;
      })
      .addCase(fetchTickets.rejected, (state, action) => {
        state.fetchStatus = 'failed';
        state.error = (action.payload as string) ?? 'Failed to fetch tickets';
      })

      // ── createTicket ────────────────────────────────────────────────
      .addCase(createTicket.pending, (state) => {
        state.createStatus = 'loading';
        state.error = null;
      })
      .addCase(createTicket.fulfilled, (state, action) => {
        state.createStatus = 'succeeded';
        // Prepend so the newest ticket appears first
        state.tickets.unshift(action.payload);
      })
      .addCase(createTicket.rejected, (state, action) => {
        state.createStatus = 'failed';
        state.error = (action.payload as string) ?? 'Failed to create ticket';
      });
  },
});

export const { setCurrentTicket, clearTicketError } = ticketSlice.actions;
export default ticketSlice.reducer;
