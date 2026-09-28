import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Wrench,
  Building2,
  GraduationCap,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Shield,
  Zap,
} from 'lucide-react';

const ChooseRolePage = () => {
  const { user, selectRole, getDashboardPath } = useAuth();
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const roles = [
    {
      id: 'technician',
      title: 'Technician',
      tagline: 'Solar & Wind Field Specialist',
      description: 'Find renewable-energy projects and opportunities',
      icon: Wrench,
      accentColor: 'border-emerald-500 ring-emerald-500 bg-emerald-50/50',
      badgeColor: 'bg-emerald-100 text-emerald-800',
      features: [
        'Verified Skill Passport & QR code verification',
        'Direct access to Solar, Wind & BESS projects',
        'Transparent hourly & contract payouts',
      ],
    },
    {
      id: 'epc_company',
      title: 'EPC Company',
      tagline: 'Contractor & Project Developer',
      description: 'Find verified technicians and build project teams',
      icon: Building2,
      accentColor: 'border-blue-500 ring-blue-500 bg-blue-50/50',
      badgeColor: 'bg-blue-100 text-blue-800',
      features: [
        'Hire pre-screened & certified field specialists',
        'Post and manage multi-MW renewable sites',
        'Milestone tracking & streamlined project rosters',
      ],
    },
    {
      id: 'admin',
      title: 'Institute / Admin',
      tagline: 'Certification Body & Ecosystem Lead',
      description: 'Manage workforce and skill ecosystem',
      icon: GraduationCap,
      accentColor: 'border-indigo-500 ring-indigo-500 bg-indigo-50/50',
      badgeColor: 'bg-indigo-100 text-indigo-800',
      features: [
        'Audit renewable energy technical certifications',
        'Administer national skill assessments',
        'Platform-wide compliance & workforce analytics',
      ],
    },
  ];

  const handleRoleSelection = async (roleId) => {
    setSelectedRole(roleId);
    setLoading(true);
    setError(null);

    try {
      console.log('[AUTH] User role:', roleId);
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
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-8 px-3 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto w-full">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold uppercase tracking-wider mb-3">
            <Zap className="w-3.5 h-3.5" />
            Account Setup
          </div>
          <h1 className="text-2xl sm:text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Choose your role
          </h1>
          <p className="mt-2 sm:mt-3 text-sm sm:text-lg text-slate-600 max-w-2xl mx-auto">
            {user?.name ? `Welcome, ${user.name}! ` : 'Welcome to RenewTech! '}
            Select how you would like to participate in the renewable energy workforce network.
          </p>
          {user?.email && (
            <p className="mt-1 text-xs text-slate-500">
              Signed in as <span className="font-medium text-slate-700">{user.email}</span>
            </p>
          )}
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700 flex items-start gap-2">
            <span className="font-semibold">Notice:</span> {error}
          </div>
        )}

        {/* Role Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8">
          {roles.map((role) => {
            const Icon = role.icon;
            const isSelected = selectedRole === role.id;

            return (
              <div
                key={role.id}
                id={`role-card-${role.id}`}
                onClick={() => !loading && handleRoleSelection(role.id)}
                className={`relative flex flex-col justify-between p-6 bg-white rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  isSelected
                    ? role.accentColor + ' shadow-md scale-[1.02]'
                    : 'border-slate-200 hover:border-emerald-300'
                } ${loading ? 'opacity-70 pointer-events-none' : ''}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 border border-slate-200">
                      <Icon className="w-6 h-6 text-slate-800" />
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                    )}
                  </div>

                  <span className={`inline-block px-2.5 py-0.5 rounded text-xs font-semibold mb-2 ${role.badgeColor}`}>
                    {role.tagline}
                  </span>

                  <h3 className="text-xl font-bold text-slate-900 mb-2">{role.title}</h3>
                  <p className="text-sm text-slate-600 mb-4">{role.description}</p>

                  <div className="pt-4 border-t border-slate-100 space-y-2">
                    {role.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-600">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4">
                  <button
                    type="button"
                    disabled={loading}
                    className={`w-full py-2.5 px-4 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${
                      isSelected && loading
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-900 hover:bg-emerald-700 text-white'
                    }`}
                  >
                    {isSelected && loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Setting up...
                      </>
                    ) : (
                      <>
                        Select {role.title}
                        <ArrowRight className="w-4 h-4" />
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
          <Shield className="w-4 h-4 text-emerald-600" />
          <span>RenewTech Workforce uses enterprise role-based security & skill credentialing.</span>
        </div>
      </div>
    </div>
  );
};

export default ChooseRolePage;
