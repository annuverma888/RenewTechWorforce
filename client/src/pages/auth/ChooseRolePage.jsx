import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Wrench,
  Building2,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  Zap,
} from 'lucide-react';

const ChooseRolePage = () => {
  const { user, selectRole, getDashboardPath } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const roleParam = searchParams.get('role');

  const [selectedRole, setSelectedRole] = useState(
    roleParam === 'epc_company' ? 'epc_company' : 'technician'
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (roleParam === 'epc_company' || roleParam === 'technician') {
      setSelectedRole(roleParam);
    }
  }, [roleParam]);

  const roles = [
    {
      id: 'technician',
      title: 'Technician',
      tagline: 'Solar & Wind Field Specialist',
      description: 'Build your skills, create your Skill Passport and discover renewable-energy opportunities.',
      cta: 'Continue as Technician',
      icon: Wrench,
      features: [
        'Verified Skill Passport & tamper-evident QR verification',
        'Direct connection to Solar PV, Wind & BESS sites',
        'Standardized competency assessments & transparent hiring',
      ],
    },
    {
      id: 'epc_company',
      title: 'EPC Company',
      tagline: 'Contractor & Project Developer',
      description: 'Find verified technicians and build your project workforce.',
      cta: 'Continue as EPC Company',
      icon: Building2,
      features: [
        'Hire pre-screened & certified field specialists',
        'Post and manage multi-MW renewable energy sites',
        'Real-time workforce rosters & milestone tracking',
      ],
    },
  ];

  const handleRoleSelection = async (roleId) => {
    setSelectedRole(roleId);
    setLoading(true);
    setError(null);

    try {
      console.log('[AUTH] Selecting user role:', roleId);
      await selectRole(roleId);
      const destination = getDashboardPath(roleId);
      console.log('[AUTH] Redirecting to dashboard:', destination);
      navigate(destination, { replace: true });
    } catch (err) {
      console.error('Role selection failed:', err);
      setError(err.message || 'Failed to set up your account role. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-8">
      {/* Top Back to Home */}
      <div className="max-w-4xl mx-auto w-full mb-4">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-700 transition-colors focus-ring rounded-lg py-1 px-2"
          aria-label="Back to Home"
        >
          <ArrowLeft size={14} className="shrink-0" />
          <span>Back to Home</span>
        </Link>
      </div>

      <div className="max-w-4xl mx-auto w-full">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200/80 mb-3 shadow-2xs">
            <Zap size={14} className="text-emerald-600" />
            <span>Account Onboarding</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            How will you use RenewTech Workforce?
          </h1>

          <p className="mt-2.5 text-xs sm:text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
            {user?.name ? `Welcome, ${user.name}! ` : 'Welcome to RenewTech Workforce! '}
            Select your account type to personalize your verified clean energy experience.
          </p>

          {user?.email && (
            <p className="mt-1 text-xs text-slate-400">
              Signed in as <span className="font-semibold text-slate-600">{user.email}</span>
            </p>
          )}
        </div>

        {error && (
          <div
            role="alert"
            className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-300 text-xs sm:text-sm text-rose-800 flex items-start gap-2.5 shadow-2xs"
          >
            <span className="font-bold">Error:</span> {error}
          </div>
        )}

        {/* 2 Clear Role Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 mb-8">
          {roles.map((role) => {
            const Icon = role.icon;
            const isSelected = selectedRole === role.id;

            return (
              <div
                key={role.id}
                id={`role-card-${role.id}`}
                onClick={() => !loading && setSelectedRole(role.id)}
                className={`relative flex flex-col justify-between p-6 sm:p-8 bg-white rounded-2xl border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                  isSelected
                    ? 'border-emerald-600 ring-2 ring-emerald-600/20 shadow-md scale-[1.01]'
                    : 'border-slate-200 hover:border-slate-300'
                } ${loading ? 'opacity-70 pointer-events-none' : ''}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      isSelected ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700'
                    }`}>
                      <Icon size={24} />
                    </div>
                    {isSelected ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                        <CheckCircle2 size={14} /> Selected
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400 font-medium">Click to select</span>
                    )}
                  </div>

                  <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200/80 mb-2">
                    {role.tagline}
                  </span>

                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-2">
                    {role.title}
                  </h2>

                  <p className="text-xs sm:text-sm text-slate-600 mb-5 leading-relaxed">
                    {role.description}
                  </p>

                  <div className="pt-4 border-t border-slate-100 space-y-2.5">
                    {role.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-600">
                        <CheckCircle2 size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                        <span className="leading-snug">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 pt-4">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRoleSelection(role.id);
                    }}
                    className={`w-full py-3 px-4 min-h-[44px] rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-2xs focus-ring cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md'
                        : 'bg-slate-900 hover:bg-slate-800 text-white'
                    }`}
                  >
                    {loading && isSelected ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Setting up your account...</span>
                      </>
                    ) : (
                      <>
                        <span>{role.cta}</span>
                        <ArrowRight size={15} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Security / Trust footer */}
        <div className="text-center text-xs text-slate-500 flex items-center justify-center gap-2">
          <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
          <span>RenewTech Workforce uses role-based security & government accredited credential standards.</span>
        </div>
      </div>
    </div>
  );
};

export default ChooseRolePage;
