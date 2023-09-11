/* eslint-disable */
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { RecordStatusOption } from 'base/base/enums/recordStatusOption';
import {
  BaseCreateModel,
  BaseUpdateModel,
  BaseVerifyViewModel,
  BaseViewModel
} from 'base/base/models';
import { DataResponse } from 'base/base/models/DataResponse';
import { IndexPageData } from 'base/base/models/IndexPageData';

import useAuth from 'base/hooks/useAuth';
import useNotify from 'base/hooks/useNotify';
import { isApiCallInProgress } from 'base/store/slice/apiCallInProgressSlice';
import { isDetailsFetchingProgress } from 'base/store/slice/detailsFetchingProgressSlice';
import { useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useSearchParams } from 'react-router-dom';

const BASE_API_URL = process.env.REACT_APP_GATEWAY_BASE_URL;
const BASE_SERVICE_NAME = process.env.REACT_APP_SERVICE_NAME;
const invalidServerResponseObject = {
  responseType: 2,
  message: 'Invalid server response'
};

type ISearchParams = {
  currentPage: number;
  recordPerPage: number;
  filterObj?: FilterParams[];
};

export type FilterParams = {
  key: string;
  value: string | number | boolean | unknown;
};

export interface ApiHelper {
  get: <T>(url: string) => Promise<DataResponse<T>>;
  post: <T>(url: string, data: any, options?: AxiosRequestConfig) => Promise<DataResponse<T>>;
  put: (url: string, data: any) => Promise<DataResponse<string>>;
  patch: (url: string) => Promise<DataResponse<string>>;
  create: (data: BaseCreateModel) => Promise<DataResponse<any>>;
  search: (params: ISearchParams, actionName?: string) => Promise<DataResponse<IndexPageData>>;
  getList: (params: ISearchParams) => Promise<DataResponse<IndexPageData>>;
  getDetails: <T>(id: number) => Promise<DataResponse<T>>;
  update: (updateId: string, data: BaseUpdateModel) => Promise<DataResponse<string>>;
  updateRequest: (updateId: string, data: BaseVerifyViewModel) => Promise<DataResponse<string>>;
  verifyUpdateRequest: (
    updateId: string,
    requestTimestamp: number
  ) => Promise<DataResponse<unknown>>;
  rejectUpdateRequest: (
    updateId: string,
    requestTimestamp: number,
    cause: string
  ) => Promise<DataResponse<unknown>>;
  verify: (updateId: string, requestTimestamp: number) => Promise<DataResponse<unknown>>;
  reject: (
    updateId: string,
    requestTimestamp: number,
    cause: string
  ) => Promise<DataResponse<unknown>>;
  delete: (
    model: BaseViewModel,
    requestTimestamp: number,
    cause?: string
  ) => Promise<DataResponse<unknown>>;
  deleteRequest: (
    model: BaseViewModel,
    requestTimestamp: number,
    cause?: string
  ) => Promise<DataResponse<unknown>>;
  verifyDeleteRequest: (
    updateId: string,
    requestTimestamp: number
  ) => Promise<DataResponse<unknown>>;
  rejectDeleteRequest: (
    updateId: string,
    requestTimestamp: number,
    cause: string
  ) => Promise<DataResponse<unknown>>;
  http: AxiosInstance;
}

type Props = {
  serviceName?: string;
};

const useServiceApi = (featureName: string, props?: Props) => {
  const dispatch = useDispatch();
  const { logout, user } = useAuth();
  const notify = useNotify();
  const serviceName = props?.serviceName || BASE_SERVICE_NAME;
  const api = {} as ApiHelper;
  if (!featureName) throw 'Invalid feature name passed to service API. (DEV ERROR)';
  const http = axios.create({
    baseURL: `${BASE_API_URL}/${serviceName}/${featureName}`,
    headers: {
      // Authorization: `Bearer ${user?.access_token ?? localStorage.getItem('accessToken')}`,
      Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      BranchId: `${user?.branchId ?? localStorage.getItem('branchId')}`
    }
  });
  const [searchParams] = useSearchParams();
  const approvalAction = Number(searchParams.get('status') || 0);

  const handleError = useCallback((error: AxiosError, reject: any) => {
    const { status } = { ...error.response };
    switch (status) {
      case 401:
        notify.error('Unauthorized Access');
        logout();
        break;
      case 403:
        notify.error('Access Denied');
        logout();
        break;
      default:
        break;
    }
    //TODO: Pass specified data to reject method
    reject({ message: error.message });
  }, []);

  useEffect(() => {
    const access_token = user?.access_token; // ?? localStorage.getItem('accessToken');
    http.defaults.headers.common.Authorization = `Bearer ${access_token}`;
    if (user?.branchId) {
      axios.defaults.headers.common['BranchId'] = user?.branchId; //todo: change header branch id
    }
  }, [user]);

  //export axios instance
  api.http = http;

  api.get = <T>(url: string) => {
    return new Promise((resolve, reject) => {
      http
        .get(url)
        .then(function (response) {
          if (response.data && response.data.responseType === 0) {
            resolve(response.data);
          } else {
            const error = response.data || invalidServerResponseObject;
            reject(error);
          }
        })
        .catch(function (error) {
          handleError(error, reject);
        });
    });
  };

  api.post = <T>(url: string, data: any, options?: AxiosRequestConfig) => {
    return new Promise<DataResponse<T>>((resolve, reject) => {
      http
        .post<DataResponse<T>>(url, data, options)
        .then(function (response) {
          if (response.data && response.data.responseType === 0) {
            resolve(response.data);
          } else {
            const error = response.data || invalidServerResponseObject;
            reject(error);
          }
        })
        .catch(function (error) {
          handleError(error, reject);
        });
    });
  };
  api.put = function (url: string, data: any) {
    return new Promise((resolve, reject) => {
      http
        .put(url, data)
        .then(function (response) {
          if (response.data && response.data.responseType === 0) {
            resolve(response.data);
          } else {
            const error = response.data || invalidServerResponseObject;
            reject(error);
          }
        })
        .catch(function (error) {
          handleError(error, reject);
        });
    });
  };

  api.patch = function (url: string) {
    return new Promise((resolve, reject) => {
      http
        .patch(url)
        .then(function (response) {
          if (response.data && response.data.responseType === 0) {
            resolve(response.data);
          } else {
            const error = response.data || invalidServerResponseObject;
            reject(error);
          }
        })
        .catch(function (error) {
          handleError(error, reject);
        });
    });
  };

  api.create = (data: any) => {
    dispatch(isApiCallInProgress(true));
    return api.post('', data).finally(() => {
      dispatch(isApiCallInProgress(false));
    });
  };

  api.getList = (params: ISearchParams) => {
    return new Promise((resolve, reject) => {
      const queryObject = {
        currentPage: params.currentPage || 1,
        recordPerPage: params.recordPerPage || 10,
        filterObj: {
          mode: '',
          data: (params.filterObj || []).map((filter: any) => {
            return {
              dataIndex: filter.key,
              value: filter.value || '',
              dataType: '',
              cbFn: ''
            };
          })
        }
      };

      http
        .get(
          `/Index?DisplayStatus=0&GridCurrentPage=${queryObject.currentPage}&GridRecordPerPage=${
            queryObject.recordPerPage
          }&GridFilter=${JSON.stringify(queryObject.filterObj)}`
        )
        .then(function (response) {
          if (response.data && response.data.responseType === 0) {
            resolve(response.data);
          } else {
            const error = response.data || invalidServerResponseObject;
            reject(error);
          }
        })
        .catch(function (error) {
          handleError(error, reject);
        });
    });
  };

  api.search = (params: ISearchParams, actionName?: string) => {
    const controllerActionName = actionName || 'search';
    return new Promise((resolve, reject) => {
      const queryObject = {
        currentPage: params.currentPage || 1,
        recordPerPage: params.recordPerPage || 10,
        filterObj: {
          mode: '',
          data: (params.filterObj || []).map((filter: any) => {
            return {
              dataIndex: filter.key,
              value: filter.value || '',
              dataType: '',
              cbFn: ''
            };
          })
        }
      };

      http
        .get(
          `/${controllerActionName}?DisplayStatus=0&GridCurrentPage=${
            queryObject.currentPage
          }&GridRecordPerPage=${queryObject.recordPerPage}&GridFilter=${JSON.stringify(
            queryObject.filterObj
          )}`
        )
        .then(function (response) {
          if (response.data && response.data.responseType === 0) {
            resolve(response.data);
          } else {
            const error = response.data || invalidServerResponseObject;
            reject(error);
          }
        })
        .catch(function (error) {
          handleError(error, reject);
        });
    });
  };

  api.getDetails = <T>(id: number) => {
    const getItemUrl =
      approvalAction === RecordStatusOption.ModifyRequest_VerifiedData ? '/GetStaging' : '';
    return new Promise((resolve, reject) => {
      dispatch(isDetailsFetchingProgress(true));
      http
        .get(`${getItemUrl}/${id}`)
        .then(function (response) {
          if (response.data && response.data.responseType === 0) {
            resolve(response.data);
          } else {
            const error = response.data || invalidServerResponseObject;
            reject(error);
          }
        })
        .catch(function (error) {
          handleError(error, reject);
        })
        .finally(() => {
          dispatch(isDetailsFetchingProgress(false));
        });
    });
  };

  api.update = (updateId: string, data: { id: any }) => {
    data.id = updateId;
    dispatch(isApiCallInProgress(true));
    return api.put(`/${updateId}`, data).finally(() => {
      dispatch(isApiCallInProgress(false));
    });
  };

  api.verify = function (updateId: string, requestTimestamp: number) {
    dispatch(isApiCallInProgress(true));
    return api.patch(`/verify/${updateId}/${requestTimestamp}`).finally(() => {
      dispatch(isApiCallInProgress(false));
    });
  };

  api.reject = function (updateId: string, requestTimestamp: number, cause: string) {
    return new Promise((resolve, reject) => {
      http
        .patch(`/reject/${updateId}/${requestTimestamp}/${cause}`)
        .then(function (response) {
          if (response.data && response.data.responseType === 0) {
            resolve(response.data);
          } else {
            const error = response.data || invalidServerResponseObject;
            reject(error);
          }
        })
        .catch(function (error) {
          handleError(error, reject);
        });
    });
  };

  api.delete = function (model: BaseViewModel, requestTimestamp: number, cause?: string) {
    const url =
      model.status === RecordStatusOption.Verified
        ? `/verified/${model.updateKey}/${requestTimestamp}/${cause}`
        : `/${model.updateKey}/${requestTimestamp}`;
    return new Promise((resolve, reject) => {
      http
        .delete(url)
        .then(function (response) {
          if (response.data && response.data.responseType === 0) {
            resolve(response.data);
          } else {
            const error = response.data || invalidServerResponseObject;
            reject(error);
          }
        })
        .catch(function (error) {
          handleError(error, reject);
        });
    });
  };

  api.updateRequest = function (updateId: string, data: { id: string }) {
    return new Promise((resolve, reject) => {
      data.id = updateId;
      http
        .put(`/verified/${updateId}`, data)
        .then(function (response) {
          if (response.data && response.data.responseType === 0) {
            resolve(response.data);
          } else {
            const error = response.data || invalidServerResponseObject;
            reject(error);
          }
        })
        .catch(function (error) {
          handleError(error, reject);
        });
    });
  };

  api.verifyUpdateRequest = function (updateId: string, requestTimestamp: number) {
    return new Promise((resolve, reject) => {
      http
        .patch(`/verify/modifyRequest/${updateId}/${requestTimestamp}`)
        .then(function (response) {
          if (response.data && response.data.responseType === 0) {
            resolve(response.data);
          } else {
            const error = response.data || invalidServerResponseObject;
            reject(error);
          }
        })
        .catch(function (error) {
          handleError(error, reject);
        });
    });
  };

  api.rejectUpdateRequest = function (updateId: string, requestTimestamp: number, cause: string) {
    return new Promise((resolve, reject) => {
      http
        .patch(`/reject/modifyRequest/${updateId}/${requestTimestamp}/${cause}`)
        .then(function (response) {
          if (response.data && response.data.responseType === 0) {
            resolve(response.data);
          } else {
            const error = response.data || invalidServerResponseObject;
            reject(error);
          }
        })
        .catch(function (error) {
          handleError(error, reject);
        });
    });
  };

  api.verifyDeleteRequest = function (updateId: string, requestTimestamp: number) {
    return new Promise((resolve, reject) => {
      http
        .patch(`/verify/deleteRequest/${updateId}/${requestTimestamp}`)
        .then(function (response) {
          if (response.data && response.data.responseType === 0) {
            resolve(response.data);
          } else {
            const error = response.data || invalidServerResponseObject;
            reject(error);
          }
        })
        .catch(function (error) {
          handleError(error, reject);
        });
    });
  };

  api.rejectDeleteRequest = function (updateId: string, requestTimestamp: number, cause: string) {
    return new Promise((resolve, reject) => {
      http
        .patch(`/reject/deleteRequest/${updateId}/${requestTimestamp}/${cause}`)
        .then(function (response) {
          if (response.data && response.data.responseType === 0) {
            resolve(response.data);
          } else {
            const error = response.data || invalidServerResponseObject;
            reject(error);
          }
        })
        .catch(function (error) {
          handleError(error, reject);
        });
    });
  };

  return api;
};

export default useServiceApi;
