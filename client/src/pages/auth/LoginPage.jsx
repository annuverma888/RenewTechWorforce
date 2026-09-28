import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Zap, Lock, Mail, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import GoogleSignInButton from '../../components/auth/GoogleSignInButton';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading, isAuthenticated, login, loginWithGoogle, getDashboardPath, authError, setAuthError } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Clear previous errors when landing on login page
  useEffect(() => {
    if (setAuthError) {
      setAuthError(null);
    }
  }, [setAuthError]);

  // Handle redirect from protected route
  const from = location.state?.from?.pathname;

  // Auto-redirect if user is already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      const dest = user.role === 'pending_role' ? '/choose-role' : (from || getDashboardPath(user.role));
      console.log('[AUTH] Redirecting to dashboard:', dest);
      navigate(dest, { replace: true });
    }
  }, [authLoading, isAuthenticated, user, from, getDashboardPath, navigate]);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    try {
      setLoading(true);
      const { user } = await login(email, password);
      setSuccessMessage('Successfully signed in! Redirecting...');
      setTimeout(() => {
        if (user.role === 'pending_role') {
          navigate('/choose-role', { replace: true });
        } else if (from) {
          navigate(from, { replace: true });
        } else {
          navigate(getDashboardPath(user.role), { replace: true });
        }
      }, 500);
    } catch (err) {
      setErrorMessage(err.message || 'Invalid email or password.');
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage('');
    setSuccessMessage('');
    setGoogleLoading(true);

    try {
      const res = await loginWithGoogle();
      if (res && res.user) {
        setSuccessMessage('Successfully signed in! Redirecting...');
        const dest = res.destination || (res.user.role === 'pending_role' ? '/choose-role' : (from || getDashboardPath(res.user.role)));
        console.log('[AUTH] Redirecting to dashboard:', dest);
        navigate(dest, { replace: true });
      }
    } catch (err) {
      console.error('Google Sign-in initiation error:', err);
      setErrorMessage(err.message || 'Google Sign-In could not be completed. Please try again.');
      setGoogleLoading(false);
    }
  };

  const fillDemoAccount = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-8 px-3 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-700 to-teal-500 flex items-center justify-center text-white shadow-md shrink-0">
            <Zap size={22} />
          </div>
          <span className="text-xl font-black text-slate-900 tracking-tight">
            RenewTech <span className="text-emerald-600">Workforce</span>
          </span>
        </Link>
        <h2 className="mt-5 text-center text-xl sm:text-2xl font-black tracking-tight text-slate-900">
          Sign In to Clean Energy Portal
        </h2>
        <p className="mt-1 text-center text-xs text-slate-500 max-w-xs mx-auto">
          Access verified renewable workforce profiles, matching, and EPC project assignments.
        </p>
      </div>

      <div className="mt-6 sm:mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-6 px-4 sm:py-8 shadow-xl rounded-2xl sm:px-10 border border-slate-200 space-y-5 sm:space-y-6">
          {(errorMessage || authError) && (
            <div className="p-3.5 bg-rose-50 border border-rose-300 text-rose-800 rounded-xl text-xs font-semibold flex items-center gap-2">
              <AlertCircle size={16} className="text-rose-600 shrink-0" />
              <span>{errorMessage || authError}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Continue with Google */}
          <div>
            <GoogleSignInButton
              onClick={handleGoogleSignIn}
              loading={googleLoading}
              disabled={loading}
              text="Continue with Google"
            />
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 absolute">
              Or sign in with email
            </span>
          </div>

          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="technician@renewtech.com"
                  className="w-full text-xs pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-[11px] font-semibold text-emerald-600 hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full py-2.5 px-4 min-h-[44px] bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              <span>{loading ? 'Authenticating...' : 'Login'}</span>
              <ArrowRight size={14} />
            </button>
          </form>

          {/* Quick 1-Click Demo Accounts */}
          <div className="pt-4 border-t border-slate-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block text-center mb-2.5">
              1-Click Demo Accounts
            </span>
            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() => fillDemoAccount('rahul.kumar@gmail.com', 'Tech@123')}
                className="w-full text-left p-2.5 rounded-xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/50 transition-all text-xs flex items-center justify-between"
              >
                <div>
                  <span className="font-bold text-slate-800 block">Rahul Kumar</span>
                  <span className="text-[10px] text-slate-500">Technician • Solar PV Wireman</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Select
                </span>
              </button>

              <button
                type="button"
                onClick={() => fillDemoAccount('contact@greenvolt.in', 'Company@123')}
                className="w-full text-left p-2.5 rounded-xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/50 transition-all text-xs flex items-center justify-between"
              >
                <div>
                  <span className="font-bold text-slate-800 block">GreenVolt Energy</span>
                  <span className="text-[10px] text-slate-500">EPC Company • Utility Solar</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Select
                </span>
              </button>

              <button
                type="button"
                onClick={() => fillDemoAccount('admin@renewtech.com', 'Admin@123')}
                className="w-full text-left p-2.5 rounded-xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/50 transition-all text-xs flex items-center justify-between"
              >
                <div>
                  <span className="font-bold text-slate-800 block">RenewTech Admin</span>
                  <span className="text-[10px] text-slate-500">Platform Verification & Admin</span>
                </div>
                <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
                  Select
                </span>
              </button>
            </div>
          </div>

          <div className="text-center pt-2 text-xs text-slate-500">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-bold text-emerald-600 hover:underline">
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
