import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Subscription, TrialPeriod } from '@/types/user';
import { subscriptionService } from '@/lib/firebase-services';

interface SubscriptionState {
  subscription: Subscription | null;
  trialPeriod: TrialPeriod | null;
  loading: boolean;
  error: string | null;
}

const initialState: SubscriptionState = {
  subscription: null,
  trialPeriod: null,
  loading: false,
  error: null,
};

// Async thunks
export const fetchUserSubscription = createAsyncThunk(
  'subscription/fetchUserSubscription',
  async (userId: string) => {
    console.log('🔍 fetchUserSubscription called for userId:', userId);
    const subscription = await subscriptionService.getUserSubscription(userId);
    console.log('🔍 Subscription fetched:', subscription);
    return subscription;
  }
);



export const createTrialSubscription = createAsyncThunk(
  'subscription/createTrial',
  async (userId: string) => {
    const subscription = await subscriptionService.createTrialSubscription(userId);
    return subscription;
  }
);





const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState,
  reducers: {
    clearSubscription: (state) => {
      state.subscription = null;
      state.trialPeriod = null;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch user subscription
    builder
      .addCase(fetchUserSubscription.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserSubscription.fulfilled, (state, action) => {
        state.loading = false;
        state.subscription = action.payload;
        state.error = null;
      })
      .addCase(fetchUserSubscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch subscription';
      });



    // Create trial subscription
    builder
      .addCase(createTrialSubscription.fulfilled, () => {
        // Trial subscription created, but no payload returned
        // State will be updated when subscription is fetched
      });




  },
});

export const { clearSubscription, clearError } = subscriptionSlice.actions;
export default subscriptionSlice.reducer;
