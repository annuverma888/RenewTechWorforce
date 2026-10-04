import React, { useState } from 'react';
import {
  User,
  Award,
  ShieldCheck,
  Search,
  Send,
  Briefcase,
  PlusCircle,
  Users,
  Target,
  UserCheck,
  LayoutDashboard,
  ArrowRight,
  ArrowDown,
} from 'lucide-react';

const WorkflowSection = () => {
  const [activeWorkflow, setActiveWorkflow] = useState('epc'); // 'epc' | 'technician'

  const technicianSteps = [
    {
      num: '01',
      title: 'Create Profile',
      desc: 'Set up your technical profile highlighting trade specializations, mobile availability, and location.',
      icon: User,
    },
    {
      num: '02',
      title: 'Add Skills & Certifications',
      desc: 'Document your solar PV, wind, and electrical skills alongside government accreditations.',
      icon: Award,
    },
    {
      num: '03',
      title: 'Verify Skills',
      desc: 'Complete standardized assessments and verify eligible certifications for your Skill Passport.',
      icon: ShieldCheck,
    },
    {
      num: '04',
      title: 'Discover Projects',
      desc: 'Explore active renewable-energy projects looking for technicians with your specific skill set.',
      icon: Search,
    },
    {
      num: '05',
      title: 'Apply',
      desc: 'Submit your profile directly to project requisitions with transparent terms and verified credentials.',
      icon: Send,
    },
    {
      num: '06',
      title: 'Get Hired',
      desc: 'Get selected by project contractors and mobilize onto site crews with direct project agreements.',
      icon: Briefcase,
    },
  ];

  const epcSteps = [
    {
      num: '01',
      title: 'Post Project',
      desc: 'Define project scope, location, required renewable skills, certifications, and crew size.',
      icon: PlusCircle,
    },
    {
      num: '02',
      title: 'Find Technicians',
      desc: 'Search our directory of certified solar and wind specialists ready for site deployment.',
      icon: Users,
    },
    {
      num: '03',
      title: 'Review & Match',
      desc: 'Review skills, certifications, experience, and available matching scores to shortlist candidates.',
      icon: Target,
    },
    {
      num: '04',
      title: 'Hire',
      desc: 'Select suitable technicians and issue mobilization contracts directly through the platform.',
      icon: UserCheck,
    },
    {
      num: '05',
      title: 'Manage Workforce',
      desc: 'Manage hired technicians, monitor active assignments, and review field performance.',
      icon: LayoutDashboard,
    },
  ];

  const currentSteps = activeWorkflow === 'epc' ? epcSteps : technicianSteps;

  return (
    <section
      id="how-it-works"
      className="py-16 sm:py-24 bg-slate-50 text-slate-900 border-b border-slate-200 scroll-mt-[70px]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/70 px-3 py-1 rounded-full border border-emerald-200">
            How It Works
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mt-3 tracking-tight">
            Clear Pathways for Both Sides
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mt-3 leading-relaxed">
            Understand how technicians and EPC companies connect and collaborate on RenewTech Workforce.
          </p>

          {/* Workflow Toggle Buttons */}
          <div className="mt-8 inline-flex p-1 bg-white rounded-2xl border border-slate-200 shadow-2xs">
            <button
              type="button"
              onClick={() => setActiveWorkflow('epc')}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeWorkflow === 'epc'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Users size={16} className={activeWorkflow === 'epc' ? 'text-emerald-400' : 'text-slate-500'} />
              <span>EPC Company Workflow (5 Steps)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveWorkflow('technician')}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeWorkflow === 'technician'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <User size={16} className={activeWorkflow === 'technician' ? 'text-white' : 'text-slate-500'} />
              <span>Technician Workflow (6 Steps)</span>
            </button>
          </div>
        </div>

        {/* Workflow Steps Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {activeWorkflow === 'epc'
                ? 'EPC Journey: Post → Find → Match → Hire → Manage'
                : 'Technician Journey: Profile → Skills → Verify → Discover → Apply → Get Hired'}
            </span>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              {currentSteps.length} Steps
            </span>
          </div>

          <div
            className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${
              activeWorkflow === 'epc' ? '5' : '6'
            } gap-4 sm:gap-5`}
          >
            {currentSteps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div
                  key={idx}
                  className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 hover:border-emerald-300 hover:shadow-xs transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-bold font-mono text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200/80">
                        Step {step.num}
                      </span>
                      {idx < currentSteps.length - 1 && (
                        <ArrowRight
                          size={14}
                          className="hidden lg:block text-slate-300 group-hover:text-emerald-600 transition-colors"
                        />
                      )}
                    </div>

                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3.5 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                      <Icon size={18} />
                    </div>

                    <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                      {step.title}
                    </h3>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between lg:hidden text-[11px] text-slate-400">
                    <span className="font-semibold text-emerald-700">
                      Step {step.num} of 0{currentSteps.length}
                    </span>
                    {idx < currentSteps.length - 1 && (
                      <ArrowDown size={12} className="text-slate-400" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WorkflowSection;
