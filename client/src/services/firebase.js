import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';

// Read configuration strictly from Vite environment variables (prefixed with VITE_)
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || '',
};

/**
 * Checks whether valid Firebase configuration is present
 */
export const isFirebaseConfigured = () => {
  const { apiKey, projectId, authDomain } = firebaseConfig;
  return Boolean(
    apiKey &&
    projectId &&
    authDomain &&
    !apiKey.startsWith('YOUR_') &&
    apiKey.trim() !== ''
  );
};

// Initialize Firebase safely
let app = null;
let auth = null;
let googleProvider = null;

if (isFirebaseConfigured()) {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);

  googleProvider = new GoogleAuthProvider();
  googleProvider.addScope('email');
  googleProvider.addScope('profile');
  googleProvider.setCustomParameters({
    prompt: 'select_account',
  });
  console.log('[Firebase] Successfully initialized for project:', firebaseConfig.projectId);
} else {
  // Graceful fallback for development prior to credentials being added
  console.warn(
    '[Firebase] Web App configuration is not yet configured in client/.env.\n' +
    'Please obtain your web app config from Firebase Console: https://console.firebase.google.com/project/enernexa/overview\n' +
    'and add VITE_FIREBASE_API_KEY, VITE_FIREBASE_APP_ID, etc. into client/.env.'
  );
}

export { app, auth, googleProvider };

/**
 * Maps Firebase Auth error codes to helpful, user-friendly messages
 */
export const mapFirebaseAuthError = (error) => {
  const code = error?.code || '';
  const message = error?.message || '';

  if (code === 'auth/unauthorized-domain') {
    return 'This website is not authorized for Google Sign-In. Please configure the application domain in Firebase Console (Authentication > Settings > Authorized domains).';
  }
  if (code === 'auth/operation-not-allowed' || code === 'auth/configuration-not-found') {
    return 'Google Sign-In is not enabled in Firebase Console. Please enable Google under Authentication > Sign-in method.';
  }
  if (code === 'auth/account-exists-with-different-credential') {
    return 'An account already exists with another sign-in method.';
  }
  if (code === 'auth/network-request-failed') {
    return 'Please check your internet connection and try again.';
  }
  if (code === 'auth/invalid-api-key' || code === 'auth/api-key-not-valid') {
    return 'Firebase API key is invalid. Please check your VITE_FIREBASE_API_KEY in client/.env.';
  }
  if (code === 'auth/user-disabled') {
    return 'This user account has been disabled. Please contact support.';
  }
  if (code === 'auth/invalid-credential') {
    return 'Invalid credentials. Please try signing in again.';
  }
  if (message.includes('api-key') || message.includes('API key')) {
    if (!isFirebaseConfigured()) {
      return 'Firebase API key is not configured. Please add your VITE_FIREBASE_API_KEY in client/.env.';
    }
    return 'Firebase API key was rejected by Google. Please verify that your API key is active in Google Cloud Console / Firebase Console.';
  }

  return 'Google Sign-In could not be completed. Please try again.';
};

/**
 * Start Google Sign-In using Firebase popup with redirect fallback.
 */
export const signInWithGoogle = async () => {
  if (!isFirebaseConfigured() || !auth || !googleProvider) {
    console.error('[Firebase] Google authentication aborted: VITE_FIREBASE_API_KEY is not configured in client/.env.');
    throw new Error('Firebase API key is not configured. Please add your VITE_FIREBASE_API_KEY in client/.env.');
  }

  console.log('[AUTH] Google login started');
  console.log('[Auth] Firebase authDomain:', firebaseConfig.authDomain);
  console.log('[Auth] Current hostname:', typeof window !== 'undefined' ? window.location.hostname : 'unknown');

  try {
    const result = await signInWithPopup(auth, googleProvider);
    if (result && result.user) {
      console.log('[AUTH] Google login successful');
      return { user: result.user, method: 'popup' };
    }
    return null;
  } catch (error) {
    // If popup was blocked by browser, fallback to signInWithRedirect
    if (error.code === 'auth/popup-blocked' || error.code === 'auth/cancelled-popup-request') {
      console.warn('[AUTH] Popup blocked, falling back to signInWithRedirect');
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem('renewtech_google_auth_pending', 'true');
      }
      await signInWithRedirect(auth, googleProvider);
      return { redirecting: true, method: 'redirect' };
    }

    if (error.code === 'auth/popup-closed-by-user') {
      console.log('[AUTH] Google login popup closed by user');
      throw new Error('Google Sign-In was cancelled.');
    }

    console.error('[AUTH] Firebase error code:', error.code);
    console.error('[AUTH] Firebase error message:', error.message);
    const friendlyMsg = mapFirebaseAuthError(error);
    throw new Error(friendlyMsg);
  }
};

/**
 * Process pending Google redirect result after user returns from Google OAuth screen.
 * On normal page load, safely returns null and NEVER throws.
 */
export const checkRedirectResult = async () => {
  if (!isFirebaseConfigured() || !auth) {
    return null;
  }

  try {
    const result = await getRedirectResult(auth);
    if (result && result.user) {
      console.log('[AUTH] Redirect result received');
      console.log('[AUTH] Google login successful');
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.removeItem('renewtech_google_auth_pending');
      }
      return {
        user: result.user,
        credential: GoogleAuthProvider.credentialFromResult(result),
      };
    }
    return null;
  } catch (error) {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem('renewtech_google_auth_pending');
    }
    console.error('[AUTH] Firebase redirect error code:', error.code);
    console.error('[AUTH] Firebase redirect error message:', error.message);
    const friendlyMsg = mapFirebaseAuthError(error);
    throw new Error(friendlyMsg);
  }
};

/**
 * Sign out of Firebase
 */
export const logOutFirebase = async () => {
  if (!auth) return;
  try {
    await signOut(auth);
  } catch (error) {
    console.error('[Auth] Firebase sign-out error:', error);
  }
};

/**
 * Subscribe to Firebase Auth state changes
 */
export const onAuthChange = (callback) => {
  if (!auth) {
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
};

export default app;
