import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import LocalStorageHelper from 'base/StorageHelper/LocalStorageHelper';
import StorageOptions from 'base/StorageHelper/StorageOptions';
import { MenuFlowTypeOption } from 'base/base/enums/menuFlowTypeOption';
import { MenuViewModelOne } from 'base/base/models/MenuViewModel';
import { ApiHelper } from 'base/hooks/useServiceApi';
import { serviceModule } from 'base/utils/constants';
import { FixMeLater } from './../types/FixMeLater';
interface INavigation extends FixMeLater {}
export interface MenuListViewModel {
  id: number;
  code: string;
  name: string;
  localizedName: string;
  url: string;
  controllerName: string;
  defaultActionName: string;
  iconClass: string;
  description: string;
  menuFlowType: MenuFlowTypeOption;
  backdatedPermissionDay: number;
}

export interface MenuState {
  menu: MenuListViewModel[];
  menuTree: MenuListViewModel[];
}

const initialState: MenuState = {
  menu: [],
  menuTree: []
};

export const menuSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setMenuList: (state, action: PayloadAction<MenuListViewModel[]>) => {
      state.menu = action.payload;
    },
    setMenuTree: (state, action: PayloadAction<MenuListViewModel[]>) => {
      state.menuTree = action.payload;
    }
  }
});

export const refreshMenuListAsync = (api: ApiHelper) => {
  const branchId = LocalStorageHelper.getItem(StorageOptions.BRANCH_ID); // sessionStorage.getItem('branchId');
  return (dispatch: any) => {
    api
      .get<Array<MenuListViewModel>>(
        `GetMenuList?serviceModule=${serviceModule}&branchId=${branchId}`
      )
      .then((data) => {
        if (data.data) {
          dispatch(setMenuList(data.data));
        }
      })
      .catch((error) => {});
  };
};

export const refreshMenuTreeAsync = (api: ApiHelper) => {
  const branchId = LocalStorageHelper.getItem(StorageOptions.BRANCH_ID); // sessionStorage.getItem('branchId');
  return (dispatch: any) => {
    try {
      api
        .get(`/GetMenu?serviceModule=${serviceModule}&branchId=${branchId}`)
        .then((data: any) => {
          const mapMenu: INavigation = (menu: MenuViewModelOne) => {
            return {
              name: menu.groupName || menu.name,
              icon: menu.iconClass || 'dashboard',
              code: menu.code,
              path: menu.groupName
                ? ''
                : (menu.url || '') + (menu.defaultActionName ? `/${menu.defaultActionName}` : ''),
              iconText: 'A',
              children: menu.childMenu ? menu.childMenu.map(mapMenu) : null
            } as INavigation;
          };

          let navigationList: Array<INavigation> = [];

          let menuList = data.data.map(mapMenu);
          navigationList.unshift({ label: 'Pages', type: 'label' });
          navigationList.unshift({
            name: 'Dashboard',
            path: '/dashboard/default',
            icon: 'dashboard'
          });
          navigationList.unshift({
            name: 'Approval',
            path: '/approval',
            icon: 'dashboard'
          });
          navigationList.unshift({ label: 'Dashboard', type: 'label' });
          navigationList = navigationList.concat(menuList);
          dispatch(setMenuTree(navigationList));
        })
        .catch((data: FixMeLater) => {
          console.error(data);
        });
    } catch (e) {
      console.error(e);
    }
  };
};

export const { setMenuList, setMenuTree } = menuSlice.actions;

export default menuSlice.reducer;
