import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react'
import { supabase } from '../../lib/supabase'
import type {
  SignInFormData,
  SignUpFormData,
  ForgotPasswordFormData,
  ResetPasswordFormData,
  UpdateProfileFormData,
  ChangePasswordFormData,
  AuthResponse,
  ProfileResponse,
  UserProfile,
} from '../../types/auth'
import type { User, Session } from '@supabase/supabase-js'

// Helper function to handle Supabase auth errors
const handleAuthError = (error: any): string => {
  if (error?.message) {
    // Map common Supabase error messages to user-friendly messages
    switch (error.message) {
      case 'Invalid login credentials':
        return 'Invalid email or password. Please check your credentials and try again.'
      case 'Email not confirmed':
        return 'Please check your email and click the confirmation link before signing in.'
      case 'User already registered':
        return 'An account with this email already exists. Please sign in instead.'
      case 'Signup requires a valid password':
        return 'Password does not meet requirements. Please choose a stronger password.'
      case 'User not found':
        return 'No account found with this email address.'
      case 'Password should be at least 6 characters':
        return 'Password must be at least 6 characters long.'
      default:
        return error.message
    }
  }
  return 'An unexpected error occurred. Please try again.'
}

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fakeBaseQuery(),
  tagTypes: ['User', 'Profile'],
  endpoints: (builder) => ({
    // Sign up with email and password
    signUp: builder.mutation<AuthResponse, SignUpFormData>({
      queryFn: async (credentials) => {
        try {
          const { data, error } = await supabase.auth.signUp({
            email: credentials.email,
            password: credentials.password,
            options: {
              data: {
                full_name: credentials.fullName,
                phone: credentials.phone || null,
                marketing_consent: credentials.marketingConsent,
              },
            },
          })

          if (error) {
            return {
              error: {
                status: 'CUSTOM_ERROR',
                error: handleAuthError(error),
              },
            }
          }

          // Create user profile if signup was successful
          if (data.user) {
            const { error: profileError } = await supabase
              .from('user_profiles')
              .insert({
                id: data.user.id,
                email: credentials.email,
                full_name: credentials.fullName,
                phone: credentials.phone || null,
                marketing_consent: credentials.marketingConsent,
              })

            if (profileError) {
              console.error('Error creating user profile:', profileError)
            }
          }

          return {
            data: {
              success: true,
              message: data.user?.email_confirmed_at
                ? 'Account created successfully!'
                : 'Please check your email to confirm your account.',
              user: data.user,
              session: data.session,
            },
          }
        } catch (error: any) {
          return {
            error: {
              status: 'CUSTOM_ERROR',
              error: handleAuthError(error),
            },
          }
        }
      },
      invalidatesTags: ['User', 'Profile'],
    }),

    // Sign in with email and password
    signIn: builder.mutation<AuthResponse, SignInFormData>({
      queryFn: async (credentials) => {
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password,
          })

          if (error) {
            return {
              error: {
                status: 'CUSTOM_ERROR',
                error: handleAuthError(error),
              },
            }
          }

          return {
            data: {
              success: true,
              message: 'Signed in successfully!',
              user: data.user,
              session: data.session,
            },
          }
        } catch (error: any) {
          return {
            error: {
              status: 'CUSTOM_ERROR',
              error: handleAuthError(error),
            },
          }
        }
      },
      invalidatesTags: ['User', 'Profile'],
    }),

    // Sign out
    signOut: builder.mutation<AuthResponse, void>({
      queryFn: async () => {
        try {
          const { error } = await supabase.auth.signOut()

          if (error) {
            return {
              error: {
                status: 'CUSTOM_ERROR',
                error: handleAuthError(error),
              },
            }
          }

          return {
            data: {
              success: true,
              message: 'Signed out successfully!',
            },
          }
        } catch (error: any) {
          return {
            error: {
              status: 'CUSTOM_ERROR',
              error: handleAuthError(error),
            },
          }
        }
      },
      invalidatesTags: ['User', 'Profile'],
    }),

    // Request password reset
    forgotPassword: builder.mutation<AuthResponse, ForgotPasswordFormData>({
      queryFn: async (data) => {
        try {
          const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
            redirectTo: `${window.location.origin}/reset-password`,
          })

          if (error) {
            return {
              error: {
                status: 'CUSTOM_ERROR',
                error: handleAuthError(error),
              },
            }
          }

          return {
            data: {
              success: true,
              message: 'Password reset email sent! Please check your inbox.',
            },
          }
        } catch (error: any) {
          return {
            error: {
              status: 'CUSTOM_ERROR',
              error: handleAuthError(error),
            },
          }
        }
      },
    }),

    // Reset password with new password
    resetPassword: builder.mutation<AuthResponse, ResetPasswordFormData>({
      queryFn: async (data) => {
        try {
          const { error } = await supabase.auth.updateUser({
            password: data.password,
          })

          if (error) {
            return {
              error: {
                status: 'CUSTOM_ERROR',
                error: handleAuthError(error),
              },
            }
          }

          return {
            data: {
              success: true,
              message: 'Password updated successfully!',
            },
          }
        } catch (error: any) {
          return {
            error: {
              status: 'CUSTOM_ERROR',
              error: handleAuthError(error),
            },
          }
        }
      },
    }),

    // Get current user
    getCurrentUser: builder.query<User | null, void>({
      queryFn: async () => {
        try {
          const { data: { user }, error } = await supabase.auth.getUser()

          if (error) {
            return {
              error: {
                status: 'CUSTOM_ERROR',
                error: handleAuthError(error),
              },
            }
          }

          return { data: user }
        } catch (error: any) {
          return {
            error: {
              status: 'CUSTOM_ERROR',
              error: handleAuthError(error),
            },
          }
        }
      },
      providesTags: ['User'],
    }),

    // Get user profile
    getUserProfile: builder.query<UserProfile | null, string>({
      queryFn: async (userId) => {
        try {
          const { data, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', userId)
            .single()

          if (error) {
            return {
              error: {
                status: 'CUSTOM_ERROR',
                error: handleAuthError(error),
              },
            }
          }

          return {
            data: data ? {
              id: data.id,
              email: data.email,
              fullName: data.full_name,
              phone: data.phone,
              dateOfBirth: data.date_of_birth,
              avatarUrl: data.avatar_url,
              marketingConsent: data.marketing_consent,
              createdAt: data.created_at,
              updatedAt: data.updated_at,
            } : null,
          }
        } catch (error: any) {
          return {
            error: {
              status: 'CUSTOM_ERROR',
              error: handleAuthError(error),
            },
          }
        }
      },
      providesTags: ['Profile'],
    }),

    // Update user profile
    updateProfile: builder.mutation<ProfileResponse, { userId: string; data: UpdateProfileFormData }>({
      queryFn: async ({ userId, data }) => {
        try {
          const { data: profile, error } = await supabase
            .from('user_profiles')
            .update({
              full_name: data.fullName,
              phone: data.phone || null,
              date_of_birth: data.dateOfBirth || null,
              marketing_consent: data.marketingConsent,
            })
            .eq('id', userId)
            .select()
            .single()

          if (error) {
            return {
              error: {
                status: 'CUSTOM_ERROR',
                error: handleAuthError(error),
              },
            }
          }

          return {
            data: {
              success: true,
              message: 'Profile updated successfully!',
              profile: {
                id: profile.id,
                email: profile.email,
                fullName: profile.full_name,
                phone: profile.phone,
                dateOfBirth: profile.date_of_birth,
                avatarUrl: profile.avatar_url,
                marketingConsent: profile.marketing_consent,
                createdAt: profile.created_at,
                updatedAt: profile.updated_at,
              },
            },
          }
        } catch (error: any) {
          return {
            error: {
              status: 'CUSTOM_ERROR',
              error: handleAuthError(error),
            },
          }
        }
      },
      invalidatesTags: ['Profile'],
    }),

    // Change password
    changePassword: builder.mutation<AuthResponse, ChangePasswordFormData>({
      queryFn: async (data) => {
        try {
          // First verify current password by attempting to sign in
          const { data: { user } } = await supabase.auth.getUser()
          if (!user?.email) {
            return {
              error: {
                status: 'CUSTOM_ERROR',
                error: 'User not authenticated',
              },
            }
          }

          // Verify current password
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email: user.email,
            password: data.currentPassword,
          })

          if (signInError) {
            return {
              error: {
                status: 'CUSTOM_ERROR',
                error: 'Current password is incorrect',
              },
            }
          }

          // Update to new password
          const { error } = await supabase.auth.updateUser({
            password: data.newPassword,
          })

          if (error) {
            return {
              error: {
                status: 'CUSTOM_ERROR',
                error: handleAuthError(error),
              },
            }
          }

          return {
            data: {
              success: true,
              message: 'Password changed successfully!',
            },
          }
        } catch (error: any) {
          return {
            error: {
              status: 'CUSTOM_ERROR',
              error: handleAuthError(error),
            },
          }
        }
      },
    }),

    // Resend email confirmation
    resendConfirmation: builder.mutation<AuthResponse, { email: string }>({
      queryFn: async ({ email }) => {
        try {
          const { error } = await supabase.auth.resend({
            type: 'signup',
            email,
          })

          if (error) {
            return {
              error: {
                status: 'CUSTOM_ERROR',
                error: handleAuthError(error),
              },
            }
          }

          return {
            data: {
              success: true,
              message: 'Confirmation email sent! Please check your inbox.',
            },
          }
        } catch (error: any) {
          return {
            error: {
              status: 'CUSTOM_ERROR',
              error: handleAuthError(error),
            },
          }
        }
      },
    }),

    // Google OAuth Sign Up
    googleSignUp: builder.mutation<AuthResponse, void>({
      queryFn: async () => {
        try {
          const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
              redirectTo: `${window.location.origin}/auth/callback`,
              queryParams: {
                access_type: 'offline',
                prompt: 'consent',
              },
            }
          })

          if (error) {
            return {
              error: {
                status: 'CUSTOM_ERROR',
                error: handleAuthError(error),
              },
            }
          }

          // OAuth redirects, so we won't reach this point in normal flow
          // This is mainly for handling the redirect callback
          return {
            data: {
              success: true,
              message: 'Redirecting to Google...',
              user: null,
              session: null,
            },
          }
        } catch (error: any) {
          return {
            error: {
              status: 'CUSTOM_ERROR',
              error: handleAuthError(error),
            },
          }
        }
      },
    }),
  }),
})

export const {
  useSignUpMutation,
  useSignInMutation,
  useSignOutMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useGetCurrentUserQuery,
  useGetUserProfileQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useResendConfirmationMutation,
  useGoogleSignUpMutation,
} = authApi