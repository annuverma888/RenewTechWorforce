import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { authAPI } from '../services/api';
import {
  signInWithGoogle,
  checkRedirectResult,
  logOutFirebase,
  onAuthChange,
} from '../services/firebase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('renewtech_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [profile, setProfile] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('renewtech_token') || null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const hasProcessedRedirectRef = useRef(false);

  // Sync token to localStorage and state
  const persistSession = (newToken, newUser, newProfile) => {
    if (newToken) {
      localStorage.setItem('renewtech_token', newToken);
      setToken(newToken);
    }
    if (newUser) {
      localStorage.setItem('renewtech_user', JSON.stringify(newUser));
      setUser(newUser);
    }
    if (newProfile !== undefined) {
      setProfile(newProfile);
    }
  };

  // Clear all session states
  const clearSession = () => {
    localStorage.removeItem('renewtech_token');
    localStorage.removeItem('renewtech_user');
    setToken(null);
    setUser(null);
    setProfile(null);
  };

  // Helper to determine dashboard path based on role
  const getDashboardPath = useCallback((role) => {
    switch (role) {
      case 'technician':
        return '/technician/dashboard';
      case 'epc_company':
        return '/epc/dashboard';
      case 'admin':
        return '/admin/dashboard';
      case 'pending_role':
        return '/choose-role';
      default:
        return '/login';
    }
  }, []);

  // Synchronize Firebase user with backend profile and role
  const syncBackendUser = useCallback(async (firebaseUser) => {
    if (!firebaseUser) return null;

    console.log('[AUTH] Firebase UID:', firebaseUser.uid);
    console.log('[AUTH] Loading profile...');

    const syncRes = await authAPI.googleAuth({
      firebaseUid: firebaseUser.uid,
      email: firebaseUser.email,
      name: firebaseUser.displayName || (firebaseUser.email ? firebaseUser.email.split('@')[0] : 'User'),
      profilePhoto: firebaseUser.photoURL,
    });

    if (syncRes.data.success) {
      const { token: appToken, user: appUser, profile: appProfile } = syncRes.data;
      persistSession(appToken, appUser, appProfile);
      console.log('[AUTH] User role:', appUser.role);
      const destination = appUser.role === 'pending_role' ? '/choose-role' : getDashboardPath(appUser.role);
      console.log('[AUTH] Redirecting to dashboard:', destination);
      return { user: appUser, profile: appProfile, token: appToken, destination };
    }
    throw new Error(syncRes.data.message || 'Server error synchronizing Google account.');
  }, [getDashboardPath]);

  // Initialize session and monitor Firebase auth state across app lifecycle
  useEffect(() => {
    let isMounted = true;
    let unsubscribe = null;

    const initializeAuth = async () => {
      // 1. Process Google redirect result if returning from Google OAuth screen
      try {
        const redirectRes = await checkRedirectResult();
        if (redirectRes && redirectRes.user) {
          await syncBackendUser(redirectRes.user);
          if (isMounted) {
            setLoading(false);
          }
          return;
        }
      } catch (err) {
        console.error('[AUTH] Redirect handling error:', err);
        if (isMounted) {
          setAuthError(err.message || 'Google Sign-In could not be completed. Please try again.');
        }
      }

      // 2. Subscribe to Firebase Auth state changes (the authoritative auth state)
      unsubscribe = onAuthChange(async (firebaseUser) => {
        console.log('[AUTH] Auth state changed');
        if (firebaseUser) {
          try {
            console.log('[AUTH] Firebase UID:', firebaseUser.uid);
            console.log('[AUTH] Loading profile...');

            const storedToken = localStorage.getItem('renewtech_token');
            const storedUser = localStorage.getItem('renewtech_user');
            let parsedUser = null;
            try {
              parsedUser = storedUser ? JSON.parse(storedUser) : null;
            } catch {
              parsedUser = null;
            }

            // If session already matches Firebase user, verify backend profile
            if (storedToken && parsedUser && parsedUser.firebaseUid === firebaseUser.uid) {
              try {
                const res = await authAPI.getMe();
                if (res.data.success && isMounted) {
                  persistSession(storedToken, res.data.user, res.data.profile);
                  console.log('[AUTH] User role:', res.data.user.role);
                  const dest = res.data.user.role === 'pending_role' ? '/choose-role' : getDashboardPath(res.data.user.role);
                  console.log('[AUTH] Redirecting to dashboard:', dest);
                  setLoading(false);
                  return;
                }
              } catch {
                // If getMe fails, fall back to syncBackendUser
              }
            }

            // Sync with backend using Google credentials
            if (isMounted) {
              await syncBackendUser(firebaseUser);
            }
          } catch (err) {
            console.error('[AUTH] Auth change sync error:', err);
            if (isMounted) {
              setAuthError(err.message);
            }
          } finally {
            if (isMounted) {
              setLoading(false);
            }
          }
        } else {
          // Firebase user is null
          // Check for active local JWT session (e.g. from standard email/password login)
          const storedToken = localStorage.getItem('renewtech_token');
          if (storedToken) {
            try {
              console.log('[AUTH] Loading profile...');
              const res = await authAPI.getMe();
              if (res.data.success && isMounted) {
                persistSession(storedToken, res.data.user, res.data.profile);
                console.log('[AUTH] User role:', res.data.user.role);
              } else if (isMounted) {
                clearSession();
              }
            } catch {
              if (isMounted) {
                clearSession();
              }
            } finally {
              if (isMounted) {
                setLoading(false);
              }
            }
          } else {
            // No user in Firebase and no local token
            if (isMounted) {
              clearSession();
              setLoading(false);
            }
          }
        }
      });
    };

    initializeAuth();

    return () => {
      isMounted = false;
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [syncBackendUser, getDashboardPath]);

  // Standard Email/Password Login
  const login = async (email, password) => {
    setAuthError(null);
    try {
      const res = await authAPI.login({ email, password });
      if (res.data.success) {
        const { token, user, profile } = res.data;
        persistSession(token, user, profile);
        return { user, profile };
      }
      throw new Error(res.data.message || 'Login failed');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Login failed';
      setAuthError(msg);
      throw new Error(msg);
    }
  };

  // Standard Email/Password Register
  const register = async (formData) => {
    setAuthError(null);
    try {
      const res = await authAPI.register(formData);
      if (res.data.success) {
        const { token, user, profile } = res.data;
        persistSession(token, user, profile);
        return { user, profile };
      }
      throw new Error(res.data.message || 'Registration failed');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Registration failed';
      setAuthError(msg);
      throw new Error(msg);
    }
  };

  // Google Sign-In with Firebase Popup (with Redirect fallback)
  const loginWithGoogle = async () => {
    setAuthError(null);
    try {
      const res = await signInWithGoogle();
      if (res && res.user) {
        const syncData = await syncBackendUser(res.user);
        return syncData;
      }
      return { redirecting: true };
    } catch (err) {
      console.error('[AUTH] Google Sign-in error:', err);
      const friendlyMsg = err.message || 'Google Sign-In could not be completed. Please try again.';
      setAuthError(friendlyMsg);
      throw new Error(friendlyMsg);
    }
  };

  // Select Role for first-time Google or new users
  const selectRole = async (role) => {
    setAuthError(null);
    try {
      console.log('[AUTH] User role:', role);
      const res = await authAPI.selectRole({ role });
      if (res.data.success) {
        const { token, user: updatedUser, profile: updatedProfile } = res.data;
        persistSession(token, updatedUser, updatedProfile);
        const destination = getDashboardPath(role);
        console.log('[AUTH] Redirecting to dashboard:', destination);
        return { user: updatedUser, profile: updatedProfile, destination };
      }
      throw new Error(res.data.message || 'Failed to assign role');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to assign role';
      setAuthError(msg);
      throw new Error(msg);
    }
  };

  // Logout from both platform and Firebase
  const logout = async () => {
    try {
      await logOutFirebase();
    } catch (e) {
      console.warn('Firebase logout warning:', e);
    } finally {
      clearSession();
      setLoading(false);
    }
  };

  const updateProfileState = (newProfile) => {
    setProfile(newProfile);
  };

  const refreshUser = async () => {
    try {
      const res = await authAPI.getMe();
      if (res.data.success) {
        persistSession(null, res.data.user, res.data.profile);
      }
    } catch (e) {
      console.warn('Failed to refresh user', e.message);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        token,
        loading,
        authError,
        setAuthError,
        login,
        register,
        loginWithGoogle,
        selectRole,
        logout,
        updateProfileState,
        refreshUser,
        getDashboardPath,
        isAuthenticated: !!user && !!token,
        needsRoleSelection: user?.role === 'pending_role',
        isTechnician: user?.role === 'technician',
        isCompany: user?.role === 'epc_company',
        isAdmin: user?.role === 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
