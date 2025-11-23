import { configureStore } from '@reduxjs/toolkit';
import themeReducer from '../feature/theme/themeSlice';
import authReducer from '../feature/auth/authSlice';
import chatReducer from '../feature/chat/chatSlice';
import usersReducer from '../feature/users/usersSlice';
// Import other reducers here (e.g., counterReducer from features/counter/counterSlice)

export const store = configureStore({
  reducer: {
    theme: themeReducer,
    auth: authReducer,
    chat: chatReducer,
    users: usersReducer,
    // Add other reducers, e.g., counter: counterReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;