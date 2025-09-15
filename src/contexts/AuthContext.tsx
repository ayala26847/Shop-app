import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import type { User, Session, AuthChangeEvent } from '@supabase/supabase-js'
import type { AuthState, AuthEventType } from '../types/auth'

interface AuthContextType extends AuthState {
  signOut: () => Promise<void>
  refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    error: null,
    initialized: false,
  })

  // Handle auth state changes
  const handleAuthStateChange = (event: AuthChangeEvent, session: Session | null) => {
    console.log('Auth state changed:', event, session?.user?.email)

    setAuthState((prev) => ({
      ...prev,
      user: session?.user ?? null,
      session,
      loading: false,
      error: null,
    }))

    // Map Supabase events to our custom event types
    const eventMap: Record<AuthChangeEvent, AuthEventType | null> = {
      SIGNED_IN: 'SIGN_IN',
      SIGNED_OUT: 'SIGN_OUT',
      USER_UPDATED: 'USER_UPDATED',
      PASSWORD_RECOVERY: 'PASSWORD_RECOVERY',
      TOKEN_REFRESHED: 'TOKEN_REFRESHED',
      MFA_CHALLENGE_VERIFIED: null, // Not used in our app
      USER_DELETED: null, // Not used in our app
    }

    const mappedEventType = eventMap[event]
    if (mappedEventType) {
      // Dispatch custom auth events for analytics or other purposes
      window.dispatchEvent(
        new CustomEvent('auth-event', {
          detail: {
            type: mappedEventType,
            user: session?.user,
            session,
            timestamp: new Date().toISOString(),
          },
        })
      )
    }

    // Handle specific events
    switch (event) {
      case 'SIGNED_IN':
        // Store last sign in timestamp
        localStorage.setItem('last_sign_in', new Date().toISOString())
        break
      case 'SIGNED_OUT':
        // Clear any stored data
        localStorage.removeItem('last_sign_in')
        // Clear cart for logged-out users if needed
        break
      case 'PASSWORD_RECOVERY':
        // Could trigger a notification or redirect
        break
    }
  }

  // Initialize auth state
  useEffect(() => {
    let mounted = true

    const initializeAuth = async () => {
      try {
        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) {
          console.error('Error getting session:', error)
          if (mounted) {
            setAuthState((prev) => ({
              ...prev,
              loading: false,
              error: error.message,
              initialized: true,
            }))
          }
          return
        }

        if (mounted) {
          setAuthState({
            user: session?.user ?? null,
            session,
            loading: false,
            error: null,
            initialized: true,
          })
        }
      } catch (error: any) {
        console.error('Error initializing auth:', error)
        if (mounted) {
          setAuthState((prev) => ({
            ...prev,
            loading: false,
            error: error.message || 'Failed to initialize authentication',
            initialized: true,
          }))
        }
      }
    }

    initializeAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      handleAuthStateChange
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  // Sign out function
  const signOut = async () => {
    try {
      setAuthState((prev) => ({ ...prev, loading: true, error: null }))
      const { error } = await supabase.auth.signOut()

      if (error) {
        setAuthState((prev) => ({
          ...prev,
          loading: false,
          error: error.message,
        }))
        throw error
      }
    } catch (error: any) {
      console.error('Error signing out:', error)
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to sign out',
      }))
      throw error
    }
  }

  // Refresh session function
  const refreshSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.refreshSession()

      if (error) {
        console.error('Error refreshing session:', error)
        setAuthState((prev) => ({
          ...prev,
          error: error.message,
        }))
        throw error
      }

      setAuthState((prev) => ({
        ...prev,
        user: session?.user ?? null,
        session,
        error: null,
      }))
    } catch (error: any) {
      console.error('Error refreshing session:', error)
      throw error
    }
  }

  const value: AuthContextType = {
    ...authState,
    signOut,
    refreshSession,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Hook to check if user is authenticated
export function useIsAuthenticated() {
  const { user, initialized } = useAuth()
  return { isAuthenticated: !!user, initialized }
}

// Hook to require authentication
export function useRequireAuth() {
  const { user, loading, initialized } = useAuth()

  useEffect(() => {
    if (initialized && !loading && !user) {
      // Store current location for redirect after login
      const currentPath = window.location.pathname + window.location.search
      localStorage.setItem('auth_redirect_url', currentPath)

      // Redirect to login page
      window.location.href = '/auth/signin'
    }
  }, [user, loading, initialized])

  return { user, loading: loading || !initialized }
}

// Hook for optional authentication (guest or authenticated)
export function useOptionalAuth() {
  const { user, loading, initialized } = useAuth()
  return { user, loading: loading || !initialized, isGuest: !user }
}

// Higher-order component for protecting routes
export function withAuth<P extends object>(
  Component: React.ComponentType<P>
): React.ComponentType<P> {
  return function AuthenticatedComponent(props: P) {
    const { user, loading } = useRequireAuth()

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
        </div>
      )
    }

    if (!user) {
      return null // Will redirect in useRequireAuth
    }

    return <Component {...props} />
  }
}