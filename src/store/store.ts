import { configureStore } from '@reduxjs/toolkit';
import companySlice from 'base/store/companySlice';
import menuSlice from 'base/store/menuSlice';
import userInterfaceSlice from 'base/store/userInterfaceSlice';
import userSlice from 'base/store/userSlice';
export const store = configureStore({
  reducer: {
    user: userSlice,
    company: companySlice,
    userInterface: userInterfaceSlice,
    menu: menuSlice
  }
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
