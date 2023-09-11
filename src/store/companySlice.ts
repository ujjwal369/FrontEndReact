import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { OperationDateTypeOption } from 'base/base/enums/operationDateTypeOption';
import { CompanyViewModel } from 'base/base/models/companyViewModel';
import { convertToBs } from 'base/components/NepaliDatePicker/utils/AdToBs';
import { formatAdDate } from 'base/components/NepaliDatePicker/utils/DateUtilities';
import { ApiHelper } from 'base/hooks/useServiceApi';
export interface CompanyState extends CompanyViewModel {
  branchId: number;
  branchName: string;
  branchCode: string;
  currentDate: Date;
  currentDateJson: string;
  displayDate: string;
  operationDateType: OperationDateTypeOption;
  primaryLogoBase64: string;
  secondaryLogoBase64: string;
}

const initialState: CompanyState = {
  name: 'Ramro Sahakari',
  localizedName: 'Ramro Sahakari',
  keyValue: '',
  operationDateType: OperationDateTypeOption.BS,
  primaryLogoGuid: '',
  primaryLogoBase64: '',
  secondaryLogoGuid: '',
  secondaryLogoBase64: '',
  shortName: 'MCOOP',
  localizedShortName: '',
  branchId: 0,
  branchName: 'Shankhamul Branch',
  branchCode: '',
  currentDate: new Date(),
  currentDateJson: new Date().toJSON(),
  displayDate: formatAdDate(new Date())
};

export const companySlice = createSlice({
  name: 'company',
  initialState,
  reducers: {
    setCompanyDetails: (state, action: PayloadAction<CompanyState>) => {
      state.name = action.payload.name;
      state.localizedName = action.payload.localizedName;
      state.keyValue = action.payload.keyValue;
      state.operationDateType = action.payload.operationDateType;
      state.primaryLogoGuid = action.payload.primaryLogoGuid;
      // state.primaryLogoBase64 = action.payload.primaryLogoBase64;
      state.secondaryLogoGuid = action.payload.secondaryLogoGuid;
      // state.secondaryLogoBase64 = action.payload.secondaryLogoBase64;
      state.shortName = action.payload.shortName;
      state.localizedShortName = action.payload.localizedShortName;
      state.branchId = action.payload.branchId;
      state.branchName = action.payload.branchName || 'Default Branch';
      state.branchCode = action.payload.branchCode || '000';
      state.currentDate = new Date(action.payload.currentDate);
      state.currentDateJson = new Date(action.payload.currentDate).toJSON();
      state.displayDate =
        action.payload.operationDateType === OperationDateTypeOption.BS
          ? convertToBs(action.payload.currentDate)
          : formatAdDate(new Date(action.payload.currentDate));
    },
    setPrimaryLogoBase64: (state, action: PayloadAction<{ primaryLogoBase64: string }>) => {
      state.primaryLogoBase64 = action.payload.primaryLogoBase64;
    },
    setSecondaryLogoBase64: (state, action: PayloadAction<{ secondaryLogoBase64: string }>) => {
      state.secondaryLogoBase64 = action.payload.secondaryLogoBase64;
    }
  }
});

export const refreshCompanyDetailsAsync = (api: ApiHelper) => {
  async function fetchAs(guid: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
      try {
        // guid = '8ee58a68-16bc-411a-b1b6-d6ab75c13954'; //XX:TODO:UNCOMMENT
        const data = await axios({
          method: 'get',
          url: `https://localhost:7000/document/GeneralDocument/${guid}`,
          responseType: 'arraybuffer'
        });
        const loadImage = (data: any) => {
          const newBlob = new Blob([data], {
            type: 'image/png'
          });
          const reader = new FileReader();
          reader.readAsDataURL(newBlob);
          reader.onloadend = () => resolve(reader.result);
        };
        return loadImage(data.data);
      } catch (error) {
        reject(error);
      }
    });
  }

  return (dispatch: any) => {
    api
      .get<CompanyState>('GetCompanyDetails')
      .then((data) => {
        dispatch(setCompanyDetails(data.data));
        if (data.data.primaryLogoGuid) {
          fetchAs(data.data.primaryLogoGuid).then((imagebase64: string) => {
            data.data.primaryLogoBase64 = imagebase64;
            dispatch(setPrimaryLogoBase64({ primaryLogoBase64: data.data.primaryLogoBase64 }));
          });
        }

        if (data.data.secondaryLogoGuid) {
          fetchAs(data.data.secondaryLogoGuid).then((imagebase64: string) => {
            data.data.secondaryLogoBase64 = imagebase64;
            dispatch(
              setSecondaryLogoBase64({ secondaryLogoBase64: data.data.secondaryLogoBase64 })
            );
          });
        }
      })
      .catch((error) => {});
  };
};

export const { setCompanyDetails, setPrimaryLogoBase64, setSecondaryLogoBase64 } =
  companySlice.actions;

export default companySlice.reducer;
