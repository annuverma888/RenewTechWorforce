import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Zap,
  Lock,
  Mail,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  ShieldCheck,
  Sun,
  Wind,
  Check,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import GoogleSignInButton from '../../components/auth/GoogleSignInButton';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading, isAuthenticated, login, loginWithGoogle, getDashboardPath, authError, setAuthError } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
      const { user: authedUser } = await login(email, password);
      setSuccessMessage('Successfully signed in! Redirecting...');
      setTimeout(() => {
        if (authedUser.role === 'pending_role') {
          navigate('/choose-role', { replace: true });
        } else if (from) {
          navigate(from, { replace: true });
        } else {
          navigate(getDashboardPath(authedUser.role), { replace: true });
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
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-6 sm:py-12 px-4 sm:px-6 lg:px-8">
      {/* Top Navigation Bar: Back to Home */}
      <div className="max-w-5xl mx-auto w-full mb-4">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-700 transition-colors focus-ring rounded-lg py-1 px-2"
          aria-label="Back to Home"
        >
          <ArrowLeft size={14} className="shrink-0" />
          <span>Back to Home</span>
        </Link>
      </div>

      <div className="max-w-5xl mx-auto w-full bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* DESKTOP LEFT: RenewTech branding & visual */}
        <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950 p-10 text-white flex-col justify-between relative overflow-hidden">
          {/* Subtle background ambient graphic */}
          <div className="absolute -right-16 -top-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Top Brand */}
          <div className="relative z-10">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shrink-0">
                <Zap size={22} />
              </div>
              <span className="text-xl font-black text-white tracking-tight">
                RenewTech <span className="text-emerald-400">Workforce</span>
              </span>
            </Link>

            <div className="mt-8 space-y-3">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-300 bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-800">
                <ShieldCheck size={12} />
                <span>Verified Clean Energy Network</span>
              </span>
              <h2 className="text-2xl font-black text-white tracking-tight leading-snug">
                Powering Renewable Projects with Verified Skilled Talent
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Connect certified solar and wind technicians with utility-scale EPC projects across India.
              </p>
            </div>
          </div>

          {/* Center Graphic Card */}
          <div className="relative z-10 my-8 p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center">
                <Sun size={18} />
              </div>
              <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-300 flex items-center justify-center">
                <Wind size={18} />
              </div>
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
                <Zap size={18} />
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-white/10 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <Check size={13} className="text-emerald-400 shrink-0" />
                <span>100% Verified Accreditations & Licenses</span>
              </div>
              <div className="flex items-center gap-2">
                <Check size={13} className="text-emerald-400 shrink-0" />
                <span>Tamper-proof Digital Skill Passports</span>
              </div>
              <div className="flex items-center gap-2">
                <Check size={13} className="text-emerald-400 shrink-0" />
                <span>Algorithmic EPC Project Matching</span>
              </div>
            </div>
          </div>

          {/* Bottom Security Note */}
          <div className="relative z-10 text-[11px] text-slate-400 flex items-center gap-2">
            <ShieldCheck size={14} className="text-emerald-400 shrink-0" />
            <span>Encrypted Session • Standard Role Verification</span>
          </div>
        </div>

        {/* RIGHT / MOBILE MAIN: Login form */}
        <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-center">
          {/* Mobile branding header */}
          <div className="lg:hidden text-center mb-6">
            <Link to="/" className="inline-flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shrink-0">
                <Zap size={20} />
              </div>
              <span className="text-lg font-black text-slate-900 tracking-tight">
                RenewTech <span className="text-emerald-600">Workforce</span>
              </span>
            </Link>
          </div>

          <div className="max-w-md w-full mx-auto space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Welcome Back
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-slate-500">
                Sign in to continue to your RenewTech Workforce account.
              </p>
            </div>

            {/* Error & Success Feedback */}
            {(errorMessage || authError) && (
              <div
                role="alert"
                className="p-3.5 bg-rose-50 border border-rose-300 text-rose-800 rounded-xl text-xs font-semibold flex items-center gap-2.5"
              >
                <AlertCircle size={16} className="text-rose-600 shrink-0" />
                <span>{errorMessage || authError}</span>
              </div>
            )}

            {successMessage && (
              <div
                role="status"
                className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2.5"
              >
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

            {/* Login Form */}
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <label htmlFor="login-email" className="block text-xs font-bold text-slate-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
                  <input
                    id="login-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    autoComplete="email"
                    className="w-full text-xs sm:text-sm pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="login-password" className="block text-xs font-bold text-slate-700">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 hover:underline"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="w-full text-xs sm:text-sm pl-10 pr-10 py-2.5 border border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-0.5 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || googleLoading}
                className="w-full py-2.5 px-4 min-h-[44px] bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer focus-ring"
              >
                <span>{loading ? 'Authenticating...' : 'Login'}</span>
                <ArrowRight size={15} />
              </button>
            </form>

            {/* Quick 1-Click Demo Accounts */}
            <div className="pt-4 border-t border-slate-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block text-center mb-2.5">
                Quick Demo Access
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => fillDemoAccount('rahul.kumar@gmail.com', 'Tech@123')}
                  className="text-left p-2.5 rounded-xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/40 transition-all text-xs focus-ring"
                >
                  <span className="font-bold text-slate-800 block truncate">Rahul Kumar</span>
                  <span className="text-[10px] text-slate-500 block truncate">Technician (Solar)</span>
                </button>

                <button
                  type="button"
                  onClick={() => fillDemoAccount('contact@greenvolt.in', 'Company@123')}
                  className="text-left p-2.5 rounded-xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/40 transition-all text-xs focus-ring"
                >
                  <span className="font-bold text-slate-800 block truncate">GreenVolt Energy</span>
                  <span className="text-[10px] text-slate-500 block truncate">EPC Company</span>
                </button>

                <button
                  type="button"
                  onClick={() => fillDemoAccount('admin@renewtech.com', 'Admin@123')}
                  className="text-left p-2.5 rounded-xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/40 transition-all text-xs focus-ring"
                >
                  <span className="font-bold text-slate-800 block truncate">RenewTech Admin</span>
                  <span className="text-[10px] text-slate-500 block truncate">Platform Admin</span>
                </button>
              </div>
            </div>

            <div className="text-center pt-2 text-xs text-slate-500">
              Don't have an account?{' '}
              <Link to="/register" className="font-bold text-emerald-600 hover:underline">
                Create one
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
