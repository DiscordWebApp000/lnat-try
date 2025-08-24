import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ExamResult } from '@/types/user';
import { examService } from '@/lib/firebase-services';

interface ExamResultsState {
  results: ExamResult[];
  loading: boolean;
  error: string | null;
  selectedResult: ExamResult | null;
}

const initialState: ExamResultsState = {
  results: [],
  loading: false,
  error: null,
  selectedResult: null,
};

// Async thunks
export const fetchUserExamResults = createAsyncThunk(
  'examResults/fetchUserResults',
  async (userId: string) => {
    const results = await examService.getUserExamResults(userId);
    return results;
  }
);



export const deleteExamResult = createAsyncThunk(
  'examResults/delete',
  async (examId: string) => {
    await examService.deleteExamResult(examId);
    return examId;
  }
);

export const saveExamResult = createAsyncThunk(
  'examResults/save',
  async (examResult: Omit<ExamResult, 'id'>) => {
    const savedResultId = await examService.saveExamResult(examResult);
    return { ...examResult, id: savedResultId };
  }
);

const examResultsSlice = createSlice({
  name: 'examResults',
  initialState,
  reducers: {
    setSelectedResult: (state, action: PayloadAction<ExamResult | null>) => {
      state.selectedResult = action.payload;
    },
    clearResults: (state) => {
      state.results = [];
      state.selectedResult = null;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch user results
    builder
      .addCase(fetchUserExamResults.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserExamResults.fulfilled, (state, action) => {
        state.loading = false;
        state.results = action.payload;
        state.error = null;
      })
      .addCase(fetchUserExamResults.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch exam results';
      });



    // Delete result
    builder
      .addCase(deleteExamResult.fulfilled, (state, action) => {
        state.results = state.results.filter(result => result.id !== action.payload);
        if (state.selectedResult?.id === action.payload) {
          state.selectedResult = null;
        }
      });

    // Save result
    builder
      .addCase(saveExamResult.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveExamResult.fulfilled, (state, action) => {
        state.loading = false;
        const existingIndex = state.results.findIndex(result => result.id === action.payload.id);
        if (existingIndex >= 0) {
          state.results[existingIndex] = action.payload;
        } else {
          state.results.unshift(action.payload);
        }
        state.error = null;
      })
      .addCase(saveExamResult.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to save exam result';
      });
  },
});

export const { setSelectedResult, clearResults, clearError } = examResultsSlice.actions;
export default examResultsSlice.reducer;
