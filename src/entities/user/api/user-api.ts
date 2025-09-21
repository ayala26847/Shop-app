// User API service using RTK Query

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { 
  User, 
  UserCreateData, 
  UserUpdateData, 
  UserLoginCredentials, 
  UserRegistrationData,
  UserSearchParams,
  UserProfile,
  UserPasswordReset,
  UserEmailVerification,
  UserPhoneVerification
} from '../model/types';
import { ApiResponse, PaginatedResponse } from '../../../shared/types/api';

export const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/users',
    prepareHeaders: (headers, { getState }) => {
      // Add authentication token if available
      const token = (getState() as any).auth?.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['User', 'UserProfile', 'UserAddress', 'PaymentMethod'],
  endpoints: (builder) => ({
    // Get current user profile
    getCurrentUser: builder.query<UserProfile, void>({
      query: () => '/me',
      providesTags: ['UserProfile'],
    }),

    // Get user by ID
    getUserById: builder.query<User, string>({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: 'User', id }],
    }),

    // Search users
    searchUsers: builder.query<PaginatedResponse<User>, UserSearchParams>({
      query: (params) => ({
        url: '/search',
        params,
      }),
      providesTags: ['User'],
    }),

    // Create user
    createUser: builder.mutation<User, UserCreateData>({
      query: (userData) => ({
        url: '/',
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['User'],
    }),

    // Update user
    updateUser: builder.mutation<User, { id: string; data: UserUpdateData }>({
      query: ({ id, data }) => ({
        url: `/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'User', id },
        'UserProfile',
      ],
    }),

    // Delete user
    deleteUser: builder.mutation<void, string>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'User', id }],
    }),

    // User authentication
    login: builder.mutation<{ user: User; token: string; refreshToken: string }, UserLoginCredentials>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['UserProfile'],
    }),

    logout: builder.mutation<void, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      invalidatesTags: ['User', 'UserProfile'],
    }),

    register: builder.mutation<User, UserRegistrationData>({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['User'],
    }),

    // Password management
    requestPasswordReset: builder.mutation<void, { email: string }>({
      query: ({ email }) => ({
        url: '/auth/password-reset/request',
        method: 'POST',
        body: { email },
      }),
    }),

    resetPassword: builder.mutation<void, UserPasswordReset>({
      query: (data) => ({
        url: '/auth/password-reset/confirm',
        method: 'POST',
        body: data,
      }),
    }),

    changePassword: builder.mutation<void, { currentPassword: string; newPassword: string }>({
      query: (data) => ({
        url: '/auth/change-password',
        method: 'POST',
        body: data,
      }),
    }),

    // Email verification
    requestEmailVerification: builder.mutation<void, void>({
      query: () => ({
        url: '/auth/email-verification/request',
        method: 'POST',
      }),
    }),

    verifyEmail: builder.mutation<void, UserEmailVerification>({
      query: (data) => ({
        url: '/auth/email-verification/confirm',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['UserProfile'],
    }),

    // Phone verification
    requestPhoneVerification: builder.mutation<void, { phoneNumber: string }>({
      query: ({ phoneNumber }) => ({
        url: '/auth/phone-verification/request',
        method: 'POST',
        body: { phoneNumber },
      }),
    }),

    verifyPhone: builder.mutation<void, UserPhoneVerification>({
      query: (data) => ({
        url: '/auth/phone-verification/confirm',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['UserProfile'],
    }),

    // User addresses
    getAddresses: builder.query<any[], void>({
      query: () => '/addresses',
      providesTags: ['UserAddress'],
    }),

    createAddress: builder.mutation<any, any>({
      query: (addressData) => ({
        url: '/addresses',
        method: 'POST',
        body: addressData,
      }),
      invalidatesTags: ['UserAddress'],
    }),

    updateAddress: builder.mutation<any, { id: string; data: any }>({
      query: ({ id, data }) => ({
        url: `/addresses/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'UserAddress', id }],
    }),

    deleteAddress: builder.mutation<void, string>({
      query: (id) => ({
        url: `/addresses/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'UserAddress', id }],
    }),

    // Payment methods
    getPaymentMethods: builder.query<any[], void>({
      query: () => '/payment-methods',
      providesTags: ['PaymentMethod'],
    }),

    createPaymentMethod: builder.mutation<any, any>({
      query: (paymentData) => ({
        url: '/payment-methods',
        method: 'POST',
        body: paymentData,
      }),
      invalidatesTags: ['PaymentMethod'],
    }),

    updatePaymentMethod: builder.mutation<any, { id: string; data: any }>({
      query: ({ id, data }) => ({
        url: `/payment-methods/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'PaymentMethod', id }],
    }),

    deletePaymentMethod: builder.mutation<void, string>({
      query: (id) => ({
        url: `/payment-methods/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'PaymentMethod', id }],
    }),

    // User preferences
    updatePreferences: builder.mutation<User, any>({
      query: (preferences) => ({
        url: '/preferences',
        method: 'PATCH',
        body: preferences,
      }),
      invalidatesTags: ['UserProfile'],
    }),

    // User stats
    getUserStats: builder.query<any, void>({
      query: () => '/stats',
      providesTags: ['UserProfile'],
    }),

    // User activity
    getUserActivity: builder.query<any[], { page?: number; limit?: number }>({
      query: ({ page = 1, limit = 20 } = {}) => ({
        url: '/activity',
        params: { page, limit },
      }),
      providesTags: ['UserProfile'],
    }),
  }),
});

export const {
  useGetCurrentUserQuery,
  useGetUserByIdQuery,
  useSearchUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useLoginMutation,
  useLogoutMutation,
  useRegisterMutation,
  useRequestPasswordResetMutation,
  useResetPasswordMutation,
  useChangePasswordMutation,
  useRequestEmailVerificationMutation,
  useVerifyEmailMutation,
  useRequestPhoneVerificationMutation,
  useVerifyPhoneMutation,
  useGetAddressesQuery,
  useCreateAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
  useGetPaymentMethodsQuery,
  useCreatePaymentMethodMutation,
  useUpdatePaymentMethodMutation,
  useDeletePaymentMethodMutation,
  useUpdatePreferencesMutation,
  useGetUserStatsQuery,
  useGetUserActivityQuery,
} = userApi;
