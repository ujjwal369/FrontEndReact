import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { ApiHelper } from 'base/hooks/useServiceApi';

export interface UserState {
  userId: number;
  userName: string;
  name: string;
  avatar?: string;
  localizedName?: string;
}

const initialState: UserState = {
  userId: 0,
  userName: '',
  name: ''
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserDetails: (state, action: PayloadAction<UserState>) => {
      state.userId = action.payload.userId;
      state.userName = action.payload.userName;
      state.name = action.payload.name;
      state.localizedName = action.payload.localizedName;
      state.avatar = action.payload.avatar;
    }
  }
});

export const refreshUserDetailsAsync = (api: ApiHelper) => {
  return (dispatch: any) => {
    api
      .get('GetUserDetails')
      .then((data: any) => {
        if (data.data) {
          dispatch(
            setUserDetails({
              userId: data.data.id,
              userName: data.data.username,
              name: data.data.name,
              localizedName: data.data.localizedName,
              avatar: data.data.avatar
            })
          );
        }
      })
      .catch((error) => {});
  };
};

export const { setUserDetails } = userSlice.actions;

export default userSlice.reducer;
