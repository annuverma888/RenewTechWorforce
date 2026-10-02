import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Zap,
  Lock,
  Mail,
  User,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  ShieldCheck,
  Wrench,
  Building2,
  Check,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import GoogleSignInButton from '../../components/auth/GoogleSignInButton';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const roleParam = searchParams.get('role');

  // Determine initial role from URL or default to 'technician'
  const initialRole = roleParam === 'epc_company' ? 'epc_company' : 'technician';
  const [selectedRole, setSelectedRole] = useState(initialRole);

  // Sync state if query parameter changes
  useEffect(() => {
    if (roleParam === 'epc_company' || roleParam === 'technician') {
      setSelectedRole(roleParam);
    }
  }, [roleParam]);

  const { user, loading: authLoading, isAuthenticated, register, loginWithGoogle, getDashboardPath, authError, setAuthError } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Clear previous errors when landing on register page
  useEffect(() => {
    if (setAuthError) {
      setAuthError(null);
    }
  }, [setAuthError]);

  // Auto-redirect if user is already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      const dest = user.role === 'pending_role' ? `/choose-role?role=${selectedRole}` : getDashboardPath(user.role);
      console.log('[AUTH] Redirecting to dashboard:', dest);
      navigate(dest, { replace: true });
    }
  }, [authLoading, isAuthenticated, user, selectedRole, getDashboardPath, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Compute simple password strength (0 to 4)
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: '', color: 'bg-slate-200' };
    let score = 0;
    if (pass.length >= 6) score++;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass) && /[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-rose-500' };
    if (score === 2) return { score: 2, label: 'Fair', color: 'bg-amber-500' };
    if (score === 3) return { score: 3, label: 'Good', color: 'bg-teal-500' };
    return { score: 4, label: 'Strong', color: 'bg-emerald-600' };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter your password.');
      return;
    }

    if (formData.password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    try {
      setLoading(true);
      const { user: registeredUser } = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        role: selectedRole,
      });

      setSuccessMessage('Account created successfully! Redirecting...');
      setTimeout(() => {
        if (registeredUser.role === 'pending_role') {
          navigate(`/choose-role?role=${selectedRole}`, { replace: true });
        } else {
          navigate(getDashboardPath(registeredUser.role), { replace: true });
        }
      }, 500);
    } catch (err) {
      setErrorMessage(err.message || 'Registration failed.');
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setErrorMessage('');
    setSuccessMessage('');
    setGoogleLoading(true);

    try {
      const res = await loginWithGoogle();
      if (res && res.user) {
        setSuccessMessage('Account connected successfully! Redirecting...');
        const dest = res.destination || (res.user.role === 'pending_role' ? `/choose-role?role=${selectedRole}` : getDashboardPath(res.user.role));
        console.log('[AUTH] Redirecting to dashboard:', dest);
        navigate(dest, { replace: true });
      }
    } catch (err) {
      console.error('Google Sign-up initiation error:', err);
      setErrorMessage(err.message || 'Google Sign-In could not be completed. Please try again.');
      setGoogleLoading(false);
    }
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
        {/* DESKTOP LEFT: Branding & Role Highlights */}
        <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950 p-10 text-white flex-col justify-between relative overflow-hidden">
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
                Join India's Leading Renewable Energy Network
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Connect certified field technicians with verified EPC developers and utility-scale projects.
              </p>
            </div>
          </div>

          {/* Role Comparison Visual Card */}
          <div className="relative z-10 my-8 p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm space-y-3.5">
            <div className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
              {selectedRole === 'technician' ? 'Technician Account' : 'EPC Company Account'}
            </div>

            {selectedRole === 'technician' ? (
              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <Check size={13} className="text-emerald-400 shrink-0" />
                  <span>Verified Skill Passport & QR verification</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={13} className="text-emerald-400 shrink-0" />
                  <span>Access to Solar PV, Wind & BESS projects</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={13} className="text-emerald-400 shrink-0" />
                  <span>Direct contractor hiring & transparent terms</span>
                </div>
              </div>
            ) : (
              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <Check size={13} className="text-emerald-400 shrink-0" />
                  <span>Hire pre-screened & certified field specialists</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={13} className="text-emerald-400 shrink-0" />
                  <span>Post and manage multi-MW renewable sites</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={13} className="text-emerald-400 shrink-0" />
                  <span>Milestone tracking & streamlined project rosters</span>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Security Note */}
          <div className="relative z-10 text-[11px] text-slate-400 flex items-center gap-2">
            <ShieldCheck size={14} className="text-emerald-400 shrink-0" />
            <span>Zero Fake Credentials • Encrypted Data Privacy</span>
          </div>
        </div>

        {/* RIGHT / MOBILE MAIN: Registration Form */}
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
                Create Your Account
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-slate-500">
                Join the renewable-energy workforce network.
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

            {/* Role Selection Cards */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Choose Account Type
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Technician Card */}
                <button
                  type="button"
                  onClick={() => setSelectedRole('technician')}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer focus-ring flex flex-col justify-between ${
                    selectedRole === 'technician'
                      ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-600/20 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                        selectedRole === 'technician' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        <Wrench size={14} />
                      </div>
                      <span className="text-xs font-bold text-slate-900">Technician</span>
                    </div>
                    {selectedRole === 'technician' && (
                      <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug">
                    Build your profile, verify skills and find opportunities.
                  </p>
                </button>

                {/* EPC Company Card */}
                <button
                  type="button"
                  onClick={() => setSelectedRole('epc_company')}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer focus-ring flex flex-col justify-between ${
                    selectedRole === 'epc_company'
                      ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-600/20 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                        selectedRole === 'epc_company' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        <Building2 size={14} />
                      </div>
                      <span className="text-xs font-bold text-slate-900">EPC Company</span>
                    </div>
                    {selectedRole === 'epc_company' && (
                      <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug">
                    Find skilled technicians and build your project workforce.
                  </p>
                </button>
              </div>
            </div>

            {/* Continue with Google */}
            <div>
              <GoogleSignInButton
                onClick={handleGoogleSignUp}
                loading={googleLoading}
                disabled={loading}
                text="Continue with Google"
              />
            </div>

            <div className="relative flex items-center justify-center">
              <div className="border-t border-slate-200 w-full" />
              <span className="bg-white px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 absolute">
                Or register with email
              </span>
            </div>

            {/* Registration Form */}
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label htmlFor="register-name" className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
                  <input
                    id="register-name"
                    type="text"
                    required
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Rahul Kumar"
                    autoComplete="name"
                    className="w-full text-xs sm:text-sm pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="register-email" className="block text-xs font-bold text-slate-700 mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
                  <input
                    id="register-email"
                    type="email"
                    required
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="user@renewtech.com"
                    autoComplete="email"
                    className="w-full text-xs sm:text-sm pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="register-password" className="block text-xs font-bold text-slate-700 mb-1">
                  Password (minimum 6 characters) *
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
                  <input
                    id="register-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    autoComplete="new-password"
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

                {/* Password strength indicator */}
                {formData.password && (
                  <div className="mt-1.5 flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden flex gap-1">
                      <div className={`h-full flex-1 rounded-full ${formData.password.length >= 6 ? passwordStrength.color : 'bg-slate-200'}`} />
                      <div className={`h-full flex-1 rounded-full ${passwordStrength.score >= 2 ? passwordStrength.color : 'bg-slate-200'}`} />
                      <div className={`h-full flex-1 rounded-full ${passwordStrength.score >= 3 ? passwordStrength.color : 'bg-slate-200'}`} />
                      <div className={`h-full flex-1 rounded-full ${passwordStrength.score >= 4 ? passwordStrength.color : 'bg-slate-200'}`} />
                    </div>
                    <span className="text-[10px] font-semibold text-slate-500">
                      {passwordStrength.label}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="register-confirm-password" className="block text-xs font-bold text-slate-700 mb-1">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
                  <input
                    id="register-confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    className="w-full text-xs sm:text-sm pl-10 pr-10 py-2.5 border border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-0.5 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || googleLoading}
                className="w-full py-2.5 px-4 min-h-[44px] bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer focus-ring mt-2"
              >
                <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
                <ArrowRight size={15} />
              </button>
            </form>

            <div className="text-center pt-2 text-xs text-slate-500">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-emerald-600 hover:underline">
                Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
