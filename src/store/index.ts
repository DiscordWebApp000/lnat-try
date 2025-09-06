import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import examResultsReducer from './slices/examResultsSlice';
import permissionsReducer from './slices/permissionsSlice';
import subscriptionReducer from './slices/subscriptionSlice';
import subscriptionPlansReducer from './slices/subscriptionPlansSlice';
import supportReducer from './slices/supportSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    examResults: examResultsReducer,
    permissions: permissionsReducer,
    subscription: subscriptionReducer,
    subscriptionPlans: subscriptionPlansReducer,
    support: supportReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'persist/PERSIST',
          'auth/setUser',
          'auth/fetchAllUsers/fulfilled',
          'examResults/fetchUserResults/fulfilled',
          'examResults/save/fulfilled',
          'examResults/save/pending',
          'subscription/fetchUserSubscription/fulfilled',
          'support/fetchAllTickets/fulfilled',
          'support/fetchUserTickets/fulfilled',
          'support/fetchTicketMessages/fulfilled',
          'support/createTicket/fulfilled',
          'support/sendMessage/fulfilled'
        ],
        ignoredActionPaths: [
          'payload.createdAt',
          'payload.lastLoginAt',
          'payload.trialEndsAt',
          'payload.examDate',
          'payload.startDate',
          'payload.endDate',
          'payload.lastPaymentDate',
          'payload.nextPaymentDate',
          'payload.grantedAt',
          'payload.updatedAt',
          'payload.lastMessageAt',
          'meta.arg.examDate',
          'meta.arg.createdAt',
          'meta.arg.updatedAt'
        ],
        ignoredPaths: [
          'auth.user.createdAt',
          'auth.user.lastLoginAt',
          'auth.user.trialEndsAt',
          'auth.users',
          'examResults.results',
          'subscription.subscription.trialEndsAt',
          'subscription.subscription.startDate',
          'subscription.subscription.endDate',
          'subscription.subscription.lastPaymentDate',
          'subscription.subscription.nextPaymentDate',
          'support.tickets',
          'support.messages'
        ],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
