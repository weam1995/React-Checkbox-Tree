import { configureStore } from '@reduxjs/toolkit';
import checkboxTreeReducer from './checkboxTreeSlice';

export const store = configureStore({
  reducer: {
    checkboxTree: checkboxTreeReducer
  }
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;