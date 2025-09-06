import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { SubscriptionPlan } from '@/types/user';

interface SubscriptionPlansState {
  plans: SubscriptionPlan[];
  defaultPlan: SubscriptionPlan | null;
  loading: boolean;
  error: string | null;
}

const initialState: SubscriptionPlansState = {
  plans: [],
  defaultPlan: null,
  loading: false,
  error: null,
};

// Async thunk to fetch subscription plans
export const fetchSubscriptionPlans = createAsyncThunk(
  'subscriptionPlans/fetchPlans',
  async () => {
    const response = await fetch('/api/subscription/plans');
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch subscription plans');
    }
    
    const data = await response.json();
    return {
      plans: data.plans || [],
      defaultPlan: data.defaultPlan || null
    };
  }
);

const subscriptionPlansSlice = createSlice({
  name: 'subscriptionPlans',
  initialState,
  reducers: {
    clearPlans: (state) => {
      state.plans = [];
      state.defaultPlan = null;
      state.error = null;
    },
    clearPlansError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSubscriptionPlans.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubscriptionPlans.fulfilled, (state, action) => {
        state.loading = false;
        state.plans = action.payload.plans;
        state.defaultPlan = action.payload.defaultPlan;
        state.error = null;
      })
      .addCase(fetchSubscriptionPlans.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch subscription plans';
      });
  },
});

export const { clearPlans, clearPlansError } = subscriptionPlansSlice.actions;
export default subscriptionPlansSlice.reducer;
