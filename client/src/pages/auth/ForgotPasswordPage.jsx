import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSelector from '../../components/common/LanguageSelector';
import {
  Zap,
  Mail,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import { authAPI } from '../../services/api';

const ForgotPasswordPage = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setMessage('');
    try {
      setLoading(true);
      const res = await authAPI.forgotPassword({ email });
      if (res.data.success) {
        setMessage(res.data.message || t('auth.resetLinkSent'));
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || t('errors.somethingWentWrong'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-8">
      {/* Top Bar with Back Link and Language Selector */}
      <div className="max-w-md mx-auto w-full mb-4 flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-700 transition-colors focus-ring rounded-lg py-1 px-2"
          aria-label={t('auth.backToHome')}
        >
          <ArrowLeft size={14} className="shrink-0" />
          <span>{t('auth.backToHome')}</span>
        </Link>
        <LanguageSelector />
      </div>

      <div className="max-w-md mx-auto w-full">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shrink-0">
              <Zap size={22} />
            </div>
            <span className="text-xl font-black text-slate-900 tracking-tight">
              RenewTech <span className="text-emerald-600">Workforce</span>
            </span>
          </Link>

          <h1 className="mt-5 text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            {t('auth.resetYourPassword')}
          </h1>

          <p className="mt-1.5 text-xs sm:text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
            {t('auth.resetPasswordSubtitle')}
          </p>
        </div>

        {/* Card Form */}
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl rounded-3xl border border-slate-200/90 space-y-6">
          {message && (
            <div
              role="status"
              className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-xs sm:text-sm font-semibold flex items-start gap-2.5"
            >
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
              <span>{message}</span>
            </div>
          )}

          {errorMessage && (
            <div
              role="alert"
              className="p-4 bg-rose-50 border border-rose-300 text-rose-800 rounded-xl text-xs sm:text-sm font-semibold flex items-start gap-2.5"
            >
              <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="forgot-email" className="block text-xs font-bold text-slate-700 mb-1">
                {t('auth.email')}
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
                <input
                  id="forgot-email"
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 min-h-[44px] bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 focus-ring"
            >
              <span>{loading ? t('auth.sendingInstructions') : t('auth.sendResetLink')}</span>
              <ArrowRight size={15} />
            </button>
          </form>

          <div className="pt-2 border-t border-slate-100 flex flex-col items-center gap-2 text-xs">
            <Link
              to="/login"
              className="font-bold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1.5 focus-ring rounded py-1 px-1.5"
            >
              <ArrowLeft size={13} />
              <span>{t('auth.backToLogin')}</span>
            </Link>
          </div>
        </div>

        {/* Security Footer */}
        <div className="mt-8 text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
          <ShieldCheck size={14} className="text-emerald-600 shrink-0" />
          <span>{t('auth.secureRecovery')}</span>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
