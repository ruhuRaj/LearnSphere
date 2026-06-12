import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

export const fetchTests = createAsyncThunk('tests/fetchAll', async (params = {}, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/tests', { params });
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch tests');
  }
});

export const fetchTestById = createAsyncThunk('tests/fetchById', async (id, { rejectWithValue }) => {
  try {
    const { data } = await api.get(`/tests/${id}`);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch test');
  }
});

export const submitTest = createAsyncThunk('tests/submit', async ({ testId, answers, timeTaken }, { rejectWithValue }) => {
  try {
    const { data } = await api.post(`/tests/${testId}/submit`, { answers, timeTaken });
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to submit test');
  }
});

const testSlice = createSlice({
  name: 'tests',
  initialState: { tests: [], currentTest: null, result: null, isLoading: false, error: null },
  reducers: {
    clearTestResult: (state) => { state.result = null; },
    clearCurrentTest: (state) => { state.currentTest = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTests.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(fetchTests.fulfilled, (state, action) => { state.isLoading = false; state.tests = action.payload.tests; })
      .addCase(fetchTests.rejected, (state, action) => { state.isLoading = false; state.error = action.payload; })
      .addCase(fetchTestById.fulfilled, (state, action) => { state.currentTest = action.payload.test; })
      .addCase(submitTest.fulfilled, (state, action) => { state.result = action.payload.result; });
  },
});

export const { clearTestResult, clearCurrentTest } = testSlice.actions;
export default testSlice.reducer;
