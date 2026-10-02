import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  PlusCircle,
  Briefcase,
  MapPin,
  Calendar,
  Clock,
  Sparkles,
  Users,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sun,
  Wind,
  Layers,
  IndianRupee,
  Trash2,
  Eye,
  Plus,
  Zap,
  Building,
  Check,
  ChevronLeft,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { projectAPI, technicianAPI } from '../../services/api';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';

const POPULAR_SOLAR_SKILLS = [
  'PV Installation',
  'PV Wiring',
  'Inverter Installation',
  'Solar O&M',
  'Site Survey',
  'Electrical Maintenance',
  'DC Stringing',
  'Combiner Box Wiring',
  'Electrical Safety',
  'Site Safety',
];

const POPULAR_WIND_SKILLS = [
  'Wind Turbine Installation',
  'Turbine Maintenance',
  'Blade Inspection',
  'Tower Climbing',
  'Electrical Maintenance',
  'Electrical Safety',
  'Site Safety',
  'Gearbox Inspection',
  'Pitch Calibration',
];

const POPULAR_CERTIFICATIONS = [
  'Solar PV Installer',
  'NISE Suryamitra Skill Certificate',
  'GWO Basic Safety Training (BST)',
  'GWO Working at Heights',
  'GWO Basic Technical Training (BTT)',
  'National Electrical Wireman License',
  'OSHA 30hr Construction Safety',
];

const INDIAN_STATES = [
  'Rajasthan',
  'Gujarat',
  'Uttar Pradesh',
  'Tamil Nadu',
  'Karnataka',
  'Maharashtra',
  'Andhra Pradesh',
  'Madhya Pradesh',
  'Telangana',
  'Punjab',
  'Haryana',
  'Bihar',
  'Odisha',
  'Pan-India',
];

const PostProjectPage = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successCreatedProject, setSuccessCreatedProject] = useState(null);

  // Available candidate pool preview
  const [talentPoolCount, setTalentPoolCount] = useState(12);

  // Form State
  const [formData, setFormData] = useState({
    projectName: '',
    projectType: 'Solar',
    description: '',
    location: {
      siteName: '',
      city: '',
      state: 'Rajasthan',
      address: '',
    },
    startDate: '',
    endDate: '',
    numberWorkers: 6,
    workerRoles: [
      { role: 'Solar Installers', count: 4 },
      { role: 'PV Wiremen', count: 2 },
    ],
    requiredSkills: ['PV Installation', 'PV Wiring', 'Electrical Safety'],
    minimumExperience: 2,
    requiredCertifications: ['Solar PV Installer'],
    budget: 450000,
    workType: 'Full-time Contract',
    perks: {
      accommodation: true,
      food: true,
      transport: true,
      safetyPPE: true,
    },
  });

  const [customSkillInput, setCustomSkillInput] = useState('');

  // Auto calculate duration in days
  const calculateDuration = () => {
    if (!formData.startDate || !formData.endDate) return 30;
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const diff = Math.round((end - start) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 1;
  };

  // Switch default roles & skills when project type changes
  const handleTypeChange = (type) => {
    if (type === 'Solar') {
      setFormData((prev) => ({
        ...prev,
        projectType: 'Solar',
        requiredSkills: ['PV Installation', 'PV Wiring', 'Electrical Safety'],
        requiredCertifications: ['Solar PV Installer'],
        workerRoles: [
          { role: 'Solar Installers', count: 4 },
          { role: 'PV Wiremen', count: 2 },
        ],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        projectType: 'Wind',
        requiredSkills: ['Wind Turbine Installation', 'Turbine Maintenance', 'Tower Climbing'],
        requiredCertifications: ['GWO Basic Safety Training (BST)', 'GWO Working at Heights'],
        workerRoles: [
          { role: 'Wind Turbine Technicians', count: 3 },
          { role: 'Tower Climbing Techs', count: 2 },
        ],
      }));
    }
  };

  // Toggle skills in list
  const toggleSkill = (skill) => {
    setFormData((prev) => {
      const exists = prev.requiredSkills.includes(skill);
      return {
        ...prev,
        requiredSkills: exists
          ? prev.requiredSkills.filter((s) => s !== skill)
          : [...prev.requiredSkills, skill],
      };
    });
  };

  // Add custom skill
  const handleAddCustomSkill = (e) => {
    e.preventDefault();
    if (!customSkillInput.trim()) return;
    if (!formData.requiredSkills.includes(customSkillInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        requiredSkills: [...prev.requiredSkills, customSkillInput.trim()],
      }));
    }
    setCustomSkillInput('');
  };

  // Toggle certifications
  const toggleCert = (cert) => {
    setFormData((prev) => {
      const exists = prev.requiredCertifications.includes(cert);
      return {
        ...prev,
        requiredCertifications: exists
          ? prev.requiredCertifications.filter((c) => c !== cert)
          : [...prev.requiredCertifications, cert],
      };
    });
  };

  // Dynamic Worker Roles Management
  const handleRoleChange = (index, field, value) => {
    const updatedRoles = [...formData.workerRoles];
    updatedRoles[index][field] = field === 'count' ? Number(value) : value;
    const totalCount = updatedRoles.reduce((acc, r) => acc + (Number(r.count) || 0), 0);
    setFormData((prev) => ({
      ...prev,
      workerRoles: updatedRoles,
      numberWorkers: totalCount > 0 ? totalCount : prev.numberWorkers,
    }));
  };

  const handleAddRole = () => {
    setFormData((prev) => ({
      ...prev,
      workerRoles: [
        ...prev.workerRoles,
        { role: prev.projectType === 'Solar' ? 'PV Specialist' : 'Wind Tech', count: 1 },
      ],
      numberWorkers: prev.numberWorkers + 1,
    }));
  };

  const handleRemoveRole = (index) => {
    if (formData.workerRoles.length <= 1) return;
    const updated = formData.workerRoles.filter((_, i) => i !== index);
    const totalCount = updated.reduce((acc, r) => acc + (Number(r.count) || 0), 0);
    setFormData((prev) => ({
      ...prev,
      workerRoles: updated,
      numberWorkers: totalCount,
    }));
  };

  // Live estimate talent pool availability
  useEffect(() => {
    const fetchTalentEstimate = async () => {
      try {
        const res = await technicianAPI.getAll({
          category: formData.projectType,
          location: formData.location.state,
        });
        if (res.data?.data) {
          setTalentPoolCount(Math.max(res.data.data.length, 3));
        }
      } catch {
        setTalentPoolCount(8);
      }
    };
    fetchTalentEstimate();
  }, [formData.projectType, formData.location.state]);

  // Form Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // Validation
    if (!formData.projectName.trim()) {
      setErrorMsg('Please enter a project title.');
      return;
    }
    if (!formData.description.trim()) {
      setErrorMsg('Please provide a scope of work/description.');
      return;
    }
    if (!formData.location.city.trim()) {
      setErrorMsg('Please specify the site city or district.');
      return;
    }
    if (!formData.startDate || !formData.endDate) {
      setErrorMsg('Please specify both project start and end dates.');
      return;
    }
    if (new Date(formData.endDate) <= new Date(formData.startDate)) {
      setErrorMsg('Project end date must be after start date.');
      return;
    }
    if (formData.requiredSkills.length === 0) {
      setErrorMsg('Please select at least one required renewable skill.');
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        projectName: formData.projectName,
        projectType: formData.projectType,
        description: formData.description,
        location: {
          siteName: formData.location.siteName || `${formData.projectName} Site`,
          city: formData.location.city,
          state: formData.location.state,
          address: formData.location.address,
        },
        startDate: formData.startDate,
        endDate: formData.endDate,
        numberWorkers: Number(formData.numberWorkers),
        workerRoles: formData.workerRoles,
        requiredSkills: formData.requiredSkills,
        minimumExperience: Number(formData.minimumExperience),
        requiredCertifications: formData.requiredCertifications,
        budget: Number(formData.budget),
        workType: formData.workType,
      };

      const res = await projectAPI.create(payload);

      if (res.data.success) {
        setSuccessCreatedProject(res.data.data);
      }
    } catch (err) {
      console.error('Error posting project:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to publish project. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <Header
          title="Post New Project"
          subtitle="Publish clean-energy installations & mobilize certified workforce"
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-8">
          {/* Breadcrumb & Navigation */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                to="/epc/projects"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
              >
                <ChevronLeft size={16} />
                <span>Projects</span>
              </Link>
              <span className="text-slate-300">/</span>
              <span className="text-xs font-semibold text-slate-700">Post New Project</span>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              EPC Project Publishing Studio
            </span>
          </div>

          {/* Success Banner / Modal */}
          {successCreatedProject ? (
            <div className="bg-white rounded-3xl p-8 border border-emerald-300 shadow-xl text-center max-w-2xl mx-auto space-y-6 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 size={36} />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-black text-slate-900">
                  Project Published Successfully! 🚀
                </h2>
                <p className="text-sm text-slate-600">
                  "<span className="font-bold text-slate-900">{successCreatedProject.projectName}</span>"
                  is now live on the marketplace. Verified technicians matching these skills have received
                  instant match alerts.
                </p>
              </div>

              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-left space-y-2 text-xs">
                <div className="flex justify-between text-emerald-900">
                  <span className="font-semibold">Project Location:</span>
                  <span>{successCreatedProject.location?.city}, {successCreatedProject.location?.state}</span>
                </div>
                <div className="flex justify-between text-emerald-900">
                  <span className="font-semibold">Required Workforce:</span>
                  <span>{successCreatedProject.numberWorkers} Technicians</span>
                </div>
                <div className="flex justify-between text-emerald-900">
                  <span className="font-semibold">Project Budget:</span>
                  <span>₹{successCreatedProject.budget?.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <Link
                  to={`/epc/projects/${successCreatedProject._id}`}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold shadow-lg shadow-emerald-600/25 transition-all"
                >
                  <Sparkles size={16} />
                  <span>View Project & Candidates</span>
                </Link>
                <Link
                  to="/epc/projects"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all border border-slate-200"
                >
                  <Briefcase size={15} />
                  <span>View Projects Portfolio</span>
                </Link>
                <Link
                  to="/epc/dashboard"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-bold transition-all border border-slate-200"
                >
                  <span>Dashboard</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left 2 Cols: Main Creation Form */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-8">
                  <div>
                    <h1 className="text-2xl font-extrabold text-slate-900">
                      Post a Renewable Energy Project
                    </h1>
                    <p className="text-xs text-slate-500 mt-1">
                      Define project specifications, skills required, and dispatch requisitions to
                      certified solar & wind technicians.
                    </p>
                  </div>

                  {errorMsg && (
                    <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
                      <AlertCircle size={16} className="text-rose-600 shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-8">
                    {/* SECTION 1: Category & Project Title */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                        <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 text-xs font-black flex items-center justify-center">
                          1
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                          Project Basics
                        </h3>
                      </div>

                      {/* Project Type Radio Cards */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-2">
                          Project Domain / Category <span className="text-rose-500">*</span>
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                          <button
                            type="button"
                            onClick={() => handleTypeChange('Solar')}
                            className={`p-4 rounded-2xl border-2 text-left flex items-start gap-3 transition-all ${
                              formData.projectType === 'Solar'
                                ? 'border-amber-500 bg-amber-50/50 shadow-md ring-2 ring-amber-500/20'
                                : 'border-slate-200 hover:border-slate-300 bg-white'
                            }`}
                          >
                            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                              <Sun size={22} />
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-slate-900">Solar PV Project</h4>
                              <p className="text-[11px] text-slate-500 mt-0.5">
                                Rooftop, Ground-mount, Utility Park, Floating Solar, O&M
                              </p>
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleTypeChange('Wind')}
                            className={`p-4 rounded-2xl border-2 text-left flex items-start gap-3 transition-all ${
                              formData.projectType === 'Wind'
                                ? 'border-sky-500 bg-sky-50/50 shadow-md ring-2 ring-sky-500/20'
                                : 'border-slate-200 hover:border-slate-300 bg-white'
                            }`}
                          >
                            <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
                              <Wind size={22} />
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-slate-900">Wind Energy Project</h4>
                              <p className="text-[11px] text-slate-500 mt-0.5">
                                Onshore Turbines, Blade Maintenance, Nacelle Overhaul, GWO Work
                              </p>
                            </div>
                          </button>
                        </div>
                      </div>

                      {/* Project Title */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Project Name / Title <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.projectName}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, projectName: e.target.value }))
                          }
                          placeholder={
                            formData.projectType === 'Solar'
                              ? 'e.g., 25MW Ground Mount Solar Park Erection'
                              : 'e.g., 50MW Wind Farm Scheduled Maintenance & Blade Service'
                          }
                          className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-600 bg-white"
                        />
                      </div>

                      {/* Work Type */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Engagement / Work Type
                          </label>
                          <select
                            value={formData.workType}
                            onChange={(e) =>
                              setFormData((prev) => ({ ...prev, workType: e.target.value }))
                            }
                            className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
                          >
                            <option value="Full-time Contract">Full-time Contract</option>
                            <option value="Daily Basis">Daily Basis</option>
                            <option value="Turnkey Milestone">Turnkey Milestone</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Min. Experience Required (Years)
                          </label>
                          <select
                            value={formData.minimumExperience}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                minimumExperience: Number(e.target.value),
                              }))
                            }
                            className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
                          >
                            <option value={1}>1+ Years (Junior Tech)</option>
                            <option value={2}>2+ Years (Standard Competent)</option>
                            <option value={3}>3+ Years (Skilled / Lead)</option>
                            <option value={5}>5+ Years (Master / Specialist)</option>
                          </select>
                        </div>
                      </div>

                      {/* Scope of Work / Description */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Scope of Work & Project Description <span className="text-rose-500">*</span>
                        </label>
                        <textarea
                          rows={4}
                          required
                          value={formData.description}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, description: e.target.value }))
                          }
                          placeholder="Provide detailed description of deliverables, site conditions, module specs or turbine models, tool requirements, and safety standards..."
                          className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-600 bg-white"
                        />
                      </div>
                    </div>

                    {/* SECTION 2: Location & Site */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                        <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 text-xs font-black flex items-center justify-center">
                          2
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                          Site Location & Landmark
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            City / District <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.location.city}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                location: { ...prev.location, city: e.target.value },
                              }))
                            }
                            placeholder="e.g. Jodhpur, Bhadla, Kanpur"
                            className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            State <span className="text-rose-500">*</span>
                          </label>
                          <select
                            value={formData.location.state}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                location: { ...prev.location, state: e.target.value },
                              }))
                            }
                            className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
                          >
                            {INDIAN_STATES.map((st) => (
                              <option key={st} value={st}>
                                {st}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Site / Substation Name
                          </label>
                          <input
                            type="text"
                            value={formData.location.siteName}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                location: { ...prev.location, siteName: e.target.value },
                              }))
                            }
                            placeholder="e.g. Solar Park Phase 2"
                            className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Full Site Address or Highway Landmark
                        </label>
                        <input
                          type="text"
                          value={formData.location.address}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              location: { ...prev.location, address: e.target.value },
                            }))
                          }
                          placeholder="e.g. Near 220kV Substation, NH 11 Highway, Panki Industrial Area"
                          className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
                        />
                      </div>
                    </div>

                    {/* SECTION 3: Timeline & Schedule */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                        <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 text-xs font-black flex items-center justify-center">
                          3
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                          Timeline & Schedule
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Expected Mobilization Date <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="date"
                            required
                            value={formData.startDate}
                            onChange={(e) =>
                              setFormData((prev) => ({ ...prev, startDate: e.target.value }))
                            }
                            className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Estimated Completion Date <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="date"
                            required
                            value={formData.endDate}
                            onChange={(e) =>
                              setFormData((prev) => ({ ...prev, endDate: e.target.value }))
                            }
                            className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
                          />
                        </div>
                      </div>

                      <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 flex items-center gap-2 text-xs text-emerald-900">
                        <Clock size={16} className="text-emerald-600 shrink-0" />
                        <span>
                          Estimated Project Duration:{' '}
                          <strong className="text-emerald-950">{calculateDuration()} Days</strong>
                        </span>
                      </div>
                    </div>

                    {/* SECTION 4: Manpower & Specific Roles */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 text-xs font-black flex items-center justify-center">
                            4
                          </span>
                          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                            Manpower & Role Breakdown
                          </h3>
                        </div>
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                          Total: {formData.numberWorkers} Workers
                        </span>
                      </div>

                      <div className="space-y-3">
                        {formData.workerRoles.map((roleItem, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200"
                          >
                            <input
                              type="text"
                              value={roleItem.role}
                              onChange={(e) => handleRoleChange(idx, 'role', e.target.value)}
                              placeholder="Role Name (e.g. Solar Installer)"
                              className="flex-1 text-xs p-2 rounded-lg border border-slate-300 bg-white"
                            />
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs text-slate-500">Count:</span>
                              <input
                                type="number"
                                min={1}
                                max={100}
                                value={roleItem.count}
                                onChange={(e) => handleRoleChange(idx, 'count', e.target.value)}
                                className="w-16 text-xs p-2 rounded-lg border border-slate-300 bg-white text-center font-bold"
                              />
                            </div>
                            {formData.workerRoles.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveRole(idx)}
                                className="text-slate-400 hover:text-rose-600 p-1"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        ))}

                        <button
                          type="button"
                          onClick={handleAddRole}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 p-2"
                        >
                          <Plus size={14} />
                          <span>+ Add Another Specific Role</span>
                        </button>
                      </div>
                    </div>

                    {/* SECTION 5: Skills & Certifications Required */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                        <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 text-xs font-black flex items-center justify-center">
                          5
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                          Skills & Certifications
                        </h3>
                      </div>

                      {/* Popular Skills Cloud */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-2">
                          Select Required Renewable Skills (Click to toggle){' '}
                          <span className="text-rose-500">*</span>
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {(formData.projectType === 'Solar'
                            ? POPULAR_SOLAR_SKILLS
                            : POPULAR_WIND_SKILLS
                          ).map((skill) => {
                            const isSelected = formData.requiredSkills.includes(skill);
                            return (
                              <button
                                key={skill}
                                type="button"
                                onClick={() => toggleSkill(skill)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                                  isSelected
                                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                                }`}
                              >
                                {isSelected ? '✓ ' : '+ '}
                                {skill}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Custom Skill Input */}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={customSkillInput}
                          onChange={(e) => setCustomSkillInput(e.target.value)}
                          placeholder="Add custom skill (e.g. SCADA Integration, High Voltage Cable Splicing)"
                          className="flex-1 text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
                        />
                        <button
                          type="button"
                          onClick={handleAddCustomSkill}
                          className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold"
                        >
                          Add
                        </button>
                      </div>

                      {/* Required Certifications */}
                      <div className="pt-2">
                        <label className="block text-xs font-bold text-slate-700 mb-2">
                          Mandatory / Preferred Certifications
                        </label>
                        <div className="space-y-2">
                          {POPULAR_CERTIFICATIONS.map((cert) => {
                            const isChecked = formData.requiredCertifications.includes(cert);
                            return (
                              <label
                                key={cert}
                                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                                  isChecked
                                    ? 'bg-emerald-50/60 border-emerald-300'
                                    : 'bg-white border-slate-200 hover:bg-slate-50'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => toggleCert(cert)}
                                  className="w-4 h-4 text-emerald-600 rounded-sm border-slate-300 focus:ring-emerald-500"
                                />
                                <span className="text-xs font-bold text-slate-800">{cert}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* SECTION 6: Budget & Logistics */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                        <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 text-xs font-black flex items-center justify-center">
                          6
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                          Budget & Logistics
                        </h3>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Total Allocated Project Budget (INR ₹) <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm">
                            ₹
                          </span>
                          <input
                            type="number"
                            required
                            min={10000}
                            step={10000}
                            value={formData.budget}
                            onChange={(e) =>
                              setFormData((prev) => ({ ...prev, budget: Number(e.target.value) }))
                            }
                            className="w-full pl-8 pr-4 py-3 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-sm font-bold bg-white"
                          />
                        </div>
                      </div>

                      {/* Site Amenities Checkboxes */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-2">
                          Site Amenities Provided
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          <label className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer text-xs font-medium text-slate-700">
                            <input
                              type="checkbox"
                              checked={formData.perks.accommodation}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  perks: { ...prev.perks, accommodation: e.target.checked },
                                }))
                              }
                              className="text-emerald-600 rounded-sm"
                            />
                            <span>Accommodation Provided</span>
                          </label>

                          <label className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer text-xs font-medium text-slate-700">
                            <input
                              type="checkbox"
                              checked={formData.perks.food}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  perks: { ...prev.perks, food: e.target.checked },
                                }))
                              }
                              className="text-emerald-600 rounded-sm"
                            />
                            <span>Food / Mess Provided</span>
                          </label>

                          <label className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer text-xs font-medium text-slate-700">
                            <input
                              type="checkbox"
                              checked={formData.perks.transport}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  perks: { ...prev.perks, transport: e.target.checked },
                                }))
                              }
                              className="text-emerald-600 rounded-sm"
                            />
                            <span>Site Transport Provided</span>
                          </label>

                          <label className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer text-xs font-medium text-slate-700">
                            <input
                              type="checkbox"
                              checked={formData.perks.safetyPPE}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  perks: { ...prev.perks, safetyPPE: e.target.checked },
                                }))
                              }
                              className="text-emerald-600 rounded-sm"
                            />
                            <span>Safety PPE Kit Included</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                      <Link
                        to="/epc/dashboard"
                        className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-800"
                      >
                        Cancel
                      </Link>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-xl shadow-emerald-600/30 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 transition-all"
                      >
                        <PlusCircle size={18} />
                        <span>{submitting ? 'Publishing Project...' : 'Publish Project to Marketplace'}</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              {/* Right 1 Col: Live Preview & Talent Availability Sidebar */}
              <div className="space-y-6">
                {/* Talent Availability Intelligence Card */}
                <div className="bg-gradient-to-br from-slate-900 to-emerald-950 rounded-3xl p-6 text-white shadow-xl border border-slate-800 space-y-4">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <Sparkles size={18} />
                    <span className="text-xs uppercase font-extrabold tracking-wider">
                      Talent Intelligence
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="text-3xl font-black text-white">
                      ~{talentPoolCount} Available Techs
                    </div>
                    <p className="text-xs text-slate-300">
                      Found in <strong className="text-emerald-300">{formData.location.state}</strong>{' '}
                      matching <strong className="text-emerald-300">{formData.projectType}</strong> skills.
                    </p>
                  </div>

                  <div className="p-3 bg-white/10 rounded-2xl border border-white/10 text-xs space-y-1.5 text-slate-200">
                    <div className="flex items-center gap-2">
                      <Check size={14} className="text-emerald-400" />
                      <span>Instant AI matching upon publishing</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check size={14} className="text-emerald-400" />
                      <span>Automated SMS/Email notification to certified talent</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check size={14} className="text-emerald-400" />
                      <span>Verified Digital Skill Passports guaranteed</span>
                    </div>
                  </div>
                </div>

                {/* Live Card Preview */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Live Technician Job Preview
                    </span>
                    <Eye size={16} className="text-slate-400" />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                          formData.projectType === 'Solar'
                            ? 'bg-amber-50 text-amber-800 border-amber-300'
                            : 'bg-sky-50 text-sky-800 border-sky-300'
                        }`}
                      >
                        {formData.projectType === 'Solar' ? '☀️ Solar PV' : '💨 Wind Farm'}
                      </span>
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium">
                        {formData.workType}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 line-clamp-2">
                      {formData.projectName || 'Your Project Title Here'}
                    </h4>

                    <p className="text-xs text-slate-500">
                      Posted by:{' '}
                      <span className="font-semibold text-slate-700">
                        {profile?.companyName || user?.name || 'Your Company'}
                      </span>
                    </p>

                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <MapPin size={13} className="text-slate-400 shrink-0" />
                      <span>
                        {formData.location.city || 'City'}, {formData.location.state}
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Required Crew:</span>
                        <span className="font-bold text-slate-900">
                          {formData.numberWorkers} Workers
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Budget:</span>
                        <span className="font-bold text-emerald-700">
                          ₹{Number(formData.budget).toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Duration:</span>
                        <span className="font-bold text-slate-700">
                          {calculateDuration()} Days
                        </span>
                      </div>
                    </div>

                    {/* Skills pills */}
                    <div className="flex flex-wrap gap-1">
                      {formData.requiredSkills.slice(0, 4).map((sk, i) => (
                        <span
                          key={i}
                          className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700"
                        >
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default PostProjectPage;
