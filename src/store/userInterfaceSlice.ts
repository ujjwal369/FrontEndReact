import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
export interface UserInterfaceState {
  showLoadingBar: boolean;
}

const initialState: UserInterfaceState = {
  showLoadingBar: false
};

export const userInterfaceSlice = createSlice({
  name: 'userInterface',
  initialState,
  reducers: {
    setLoadingBar: (state, action: PayloadAction<boolean>) => {
      state.showLoadingBar = action.payload;
    }
  }
});

export const { setLoadingBar } = userInterfaceSlice.actions;
export default userInterfaceSlice.reducer;
