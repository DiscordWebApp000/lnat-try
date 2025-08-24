import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { SupportTicket, SupportMessage } from '@/types/user';
import { supportService } from '@/lib/firebase-services';

interface SupportState {
  tickets: SupportTicket[];
  selectedTicket: SupportTicket | null;
  messages: SupportMessage[];
  loading: boolean;
  error: string | null;
}

const initialState: SupportState = {
  tickets: [],
  selectedTicket: null,
  messages: [],
  loading: false,
  error: null,
};

// Async thunks
export const fetchUserTickets = createAsyncThunk(
  'support/fetchUserTickets',
  async (userId: string) => {
    const tickets = await supportService.getUserTickets(userId);
    return tickets;
  }
);

export const fetchAllTickets = createAsyncThunk(
  'support/fetchAllTickets',
  async () => {
    const tickets = await supportService.getAllTickets();
    return tickets;
  }
);

export const fetchTicketMessages = createAsyncThunk(
  'support/fetchTicketMessages',
  async (ticketId: string) => {
    const messages = await supportService.getTicketMessages(ticketId);
    return messages;
  }
);

export const createSupportTicket = createAsyncThunk(
  'support/createTicket',
  async (ticketData: Omit<SupportTicket, 'id' | 'createdAt' | 'updatedAt' | 'lastMessageAt' | 'isReadByAdmin' | 'isReadByUser'>) => {
    const ticketId = await supportService.createTicket(ticketData);
    return { ...ticketData, id: ticketId };
  }
);

export const sendSupportMessage = createAsyncThunk(
  'support/sendMessage',
  async (messageData: Omit<SupportMessage, 'id' | 'createdAt'>) => {
    const messageId = await supportService.sendMessage(messageData);
    return { ...messageData, id: messageId };
  }
);

export const updateTicketStatus = createAsyncThunk(
  'support/updateStatus',
  async ({ ticketId, status }: { ticketId: string; status: SupportTicket['status'] }) => {
    const ticket = await supportService.updateTicketStatus(ticketId, status);
    return ticket;
  }
);

const supportSlice = createSlice({
  name: 'support',
  initialState,
  reducers: {
    setSelectedTicket: (state, action: PayloadAction<SupportTicket | null>) => {
      state.selectedTicket = action.payload;
    },
    clearSupport: (state) => {
      state.tickets = [];
      state.selectedTicket = null;
      state.messages = [];
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch user tickets
    builder
      .addCase(fetchUserTickets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserTickets.fulfilled, (state, action) => {
        state.loading = false;
        state.tickets = action.payload;
        state.error = null;
      })
      .addCase(fetchUserTickets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch support tickets';
      });

    // Fetch all tickets
    builder
      .addCase(fetchAllTickets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllTickets.fulfilled, (state, action) => {
        state.loading = false;
        state.tickets = action.payload;
        state.error = null;
      })
      .addCase(fetchAllTickets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch all tickets';
      });

    // Fetch ticket messages
    builder
      .addCase(fetchTicketMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTicketMessages.fulfilled, (state, action) => {
        state.loading = false;
        state.messages = action.payload;
        state.error = null;
      })
      .addCase(fetchTicketMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch messages';
      });

    // Create support ticket
    builder
      .addCase(createSupportTicket.fulfilled, (state, action) => {
        const now = new Date();
        const ticket: SupportTicket = {
          ...action.payload,
          createdAt: now,
          updatedAt: now,
          lastMessageAt: now,
          isReadByAdmin: false,
          isReadByUser: true
        };
        state.tickets.unshift(ticket);
      });

    // Send support message
    builder
      .addCase(sendSupportMessage.fulfilled, (state, action) => {
        const now = new Date();
        const message: SupportMessage = {
          ...action.payload,
          createdAt: now
        };
        state.messages.push(message);
        if (state.selectedTicket) {
          state.selectedTicket.lastMessageAt = now;
        }
      });

    // Update ticket status
    builder
      .addCase(updateTicketStatus.fulfilled, () => {
        // Ticket status updated, but no payload returned
        // State will be updated when tickets are refreshed
      });
  },
});

export const { setSelectedTicket, clearSupport, clearError } = supportSlice.actions;
export default supportSlice.reducer;
