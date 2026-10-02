import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Search,
  MapPin,
  CheckCircle2,
  SlidersHorizontal,
  Eye,
  Bookmark,
  BookmarkCheck,
  Award,
  Sparkles,
  Star,
  Phone,
  UserCheck,
  Clock,
  X,
  ShieldCheck,
  QrCode,
  Briefcase,
  Filter,
  ArrowUpDown,
  LayoutGrid,
  List,
  ExternalLink,
  Mail,
  Copy,
  Check,
  RotateCcw,
  Info,
  AlertCircle,
  Calendar,
  Zap,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  IndianRupee,
} from 'lucide-react';
import { technicianAPI, matchingAPI, projectAPI, workforceAPI } from '../../services/api';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import MatchScoreBadge from '../../components/matching/MatchScoreBadge';
import MatchExplanationModal from '../../components/matching/MatchExplanationModal';
import HireTechnicianModal from '../../components/workforce/HireTechnicianModal';

const SHORTLIST_STORAGE_KEY = 'renewtech_epc_shortlist';

const getInitialShortlist = () => {
  try {
    const saved = localStorage.getItem(SHORTLIST_STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
};

const TechnicianSearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialProjectId = searchParams.get('projectId') || '';

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Raw data from APIs
  const [allTechnicians, setAllTechnicians] = useState([]);
  const [myProjects, setMyProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(initialProjectId);
  const [matchedResults, setMatchedResults] = useState([]);
  const [matchingProjectData, setMatchingProjectData] = useState(null);
  const [isMatchingLoading, setIsMatchingLoading] = useState(false);

  // Shortlisting state
  const [shortlisted, setShortlisted] = useState(getInitialShortlist);

  // Modals state
  const [contactCandidate, setContactCandidate] = useState(null);
  const [copiedField, setCopiedField] = useState(null);
  const [projectChooserCandidate, setProjectChooserCandidate] = useState(null);
  const [hireCandidate, setHireCandidate] = useState(null);
  const [hireProjectTarget, setHireProjectTarget] = useState(null);
  const [matchModalCandidate, setMatchModalCandidate] = useState(null);

  // Search & Filter controls
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProfession, setSelectedProfession] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [selectedExperience, setSelectedExperience] = useState('All');
  const [selectedAvailability, setSelectedAvailability] = useState('All');
  const [selectedDomain, setSelectedDomain] = useState('All'); // 'All', 'Solar', 'Wind'
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [shortlistedOnly, setShortlistedOnly] = useState(false);
  const [sortBy, setSortBy] = useState('default'); // 'default', 'score', 'exp', 'rating', 'rate'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Toast notification
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Sync shortlisted with localStorage
  useEffect(() => {
    try {
      localStorage.setItem(SHORTLIST_STORAGE_KEY, JSON.stringify(shortlisted));
    } catch (e) {
      console.warn('Could not save shortlist to localStorage:', e);
    }
  }, [shortlisted]);

  // Load General Technicians and EPC Company Projects
  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [techRes, projRes] = await Promise.all([
        technicianAPI.getAll().catch((err) => {
          console.error('Error fetching technicians:', err);
          return { data: { success: false, data: [] } };
        }),
        projectAPI.getAll().catch((err) => {
          console.error('Error fetching EPC projects:', err);
          return { data: { success: false, data: [] } };
        }),
      ]);

      if (techRes.data?.success && Array.isArray(techRes.data.data)) {
        setAllTechnicians(techRes.data.data);
      } else {
        setAllTechnicians([]);
      }

      if (projRes.data?.success && Array.isArray(projRes.data.data)) {
        setMyProjects(projRes.data.data);
      } else if (Array.isArray(projRes.data)) {
        setMyProjects(projRes.data);
      }
    } catch (err) {
      console.error('Initialization error in TechnicianSearchPage:', err);
      setError('Unable to load technicians list. Please verify your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // When selectedProjectId changes, fetch project-specific match results
  const loadProjectMatches = useCallback(async (projId) => {
    if (!projId) {
      setMatchedResults([]);
      setMatchingProjectData(null);
      return;
    }

    try {
      setIsMatchingLoading(true);
      const res = await matchingAPI.matchForProject(projId);
      if (res.data?.success) {
        setMatchedResults(res.data.data || []);
        setMatchingProjectData(res.data.project || null);
      } else {
        setMatchedResults([]);
      }
    } catch (err) {
      console.error('Error fetching project match results:', err);
      showToast('Could not calculate matches for selected project.', 'error');
      setMatchedResults([]);
    } finally {
      setIsMatchingLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      loadProjectMatches(selectedProjectId);
      setSearchParams({ projectId: selectedProjectId });
    } else {
      setMatchedResults([]);
      setMatchingProjectData(null);
      setSearchParams({});
    }
  }, [selectedProjectId, loadProjectMatches, setSearchParams]);

  // Toggle Shortlist item
  const handleToggleShortlist = (techId, techName) => {
    setShortlisted((prev) => {
      const next = { ...prev };
      if (next[techId]) {
        delete next[techId];
        showToast(`Removed ${techName} from shortlist.`);
      } else {
        next[techId] = true;
        showToast(`Shortlisted ${techName} ⭐`);
      }
      return next;
    });
  };

  // Copy text helper
  const handleCopy = (text, fieldName) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Normalize candidate records so Grid/Table cards consume uniform properties
  const normalizedCandidates = useMemo(() => {
    const isProjectMode = Boolean(selectedProjectId && matchedResults.length > 0);

    if (isProjectMode) {
      return matchedResults.map((item) => {
        const u = item.technician || {};
        const p = item.profile || {};
        const certs = p.verifiedCertificates || [];
        const certCount = p.verifiedCertificatesCount !== undefined ? p.verifiedCertificatesCount : certs.length;
        const skills = p.renewableSkills || [];
        const verifiedSkills = skills.filter((s) => s.isVerified);
        const isVerified = certCount > 0 || verifiedSkills.length > 0;

        return {
          raw: item,
          id: u.id || u._id,
          name: u.name || 'Technician',
          email: u.email || '',
          phone: u.phone || '',
          profilePhoto: u.profilePhoto || '',
          profession: p.profession || 'Renewable Technician',
          yearsOfExperience: p.yearsOfExperience !== undefined ? p.yearsOfExperience : 0,
          currentAvailability: p.currentAvailability || 'Available',
          city: p.city || '',
          state: p.state || '',
          expectedDailyRate: p.expectedDailyRate || 1500,
          overallSkillScore: p.overallSkillScore || 0,
          averageRating: p.averageRating !== undefined ? p.averageRating : 5.0,
          ratingsCount: p.ratingsCount || 0,
          projectsCompleted: p.projectsCompleted || 0,
          renewableSkills: skills,
          verifiedCertificates: certs,
          verifiedCertificatesCount: certCount,
          isVerified,
          // Project matching fields
          matchScore: item.matchScore,
          breakdown: item.breakdown,
          applicationStatus: item.applicationStatus,
          applicationId: item.applicationId,
        };
      });
    }

    return allTechnicians.map((item) => {
      const u = item.user || {};
      const certs = item.verifiedCertificates || [];
      const certCount = item.verifiedCertificatesCount !== undefined ? item.verifiedCertificatesCount : certs.length;
      const skills = item.renewableSkills || [];
      const verifiedSkills = skills.filter((s) => s.isVerified);
      const isVerified = certCount > 0 || verifiedSkills.length > 0;

      return {
        raw: item,
        id: u._id || item._id,
        name: u.name || 'Technician',
        email: u.email || '',
        phone: u.phone || '',
        profilePhoto: u.profilePhoto || '',
        profession: item.profession || 'Renewable Technician',
        yearsOfExperience: item.yearsOfExperience !== undefined ? item.yearsOfExperience : 0,
        currentAvailability: item.currentAvailability || 'Available',
        city: item.city || '',
        state: item.state || '',
        expectedDailyRate: item.expectedDailyRate || 1500,
        overallSkillScore: item.overallSkillScore || 0,
        averageRating: item.averageRating !== undefined ? item.averageRating : 5.0,
        ratingsCount: item.ratingsCount || 0,
        projectsCompleted: item.projectsCompleted || 0,
        renewableSkills: skills,
        verifiedCertificates: certs,
        verifiedCertificatesCount: certCount,
        isVerified,
        matchScore: null,
        breakdown: null,
        applicationStatus: null,
        applicationId: null,
      };
    });
  }, [allTechnicians, selectedProjectId, matchedResults]);

  // Extract dynamic professions from real candidate data
  const availableProfessions = useMemo(() => {
    const set = new Set();
    normalizedCandidates.forEach((c) => {
      if (c.profession && c.profession.trim()) {
        set.add(c.profession.trim());
      }
    });
    return Array.from(set).sort();
  }, [normalizedCandidates]);

  // Extract dynamic locations from real candidate data
  const availableLocations = useMemo(() => {
    const set = new Set();
    normalizedCandidates.forEach((c) => {
      if (c.state && c.state.trim()) set.add(c.state.trim());
      if (c.city && c.city.trim()) set.add(c.city.trim());
    });
    return Array.from(set).sort();
  }, [normalizedCandidates]);

  // Filter & Search Pipeline
  const filteredCandidates = useMemo(() => {
    return normalizedCandidates.filter((cand) => {
      // 1. Keyword search (Name, Profession, City, State, Skill, Certificate)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = cand.name.toLowerCase().includes(q);
        const matchesProf = cand.profession.toLowerCase().includes(q);
        const matchesCity = cand.city.toLowerCase().includes(q);
        const matchesState = cand.state.toLowerCase().includes(q);
        const matchesSkill = cand.renewableSkills.some((s) => s.name?.toLowerCase().includes(q));
        const matchesCert = cand.verifiedCertificates.some((c) => c.certificateName?.toLowerCase().includes(q));

        if (!matchesName && !matchesProf && !matchesCity && !matchesState && !matchesSkill && !matchesCert) {
          return false;
        }
      }

      // 2. Profession filter
      if (selectedProfession !== 'All' && cand.profession !== selectedProfession) {
        return false;
      }

      // 3. Location filter
      if (selectedLocation !== 'All') {
        const locLower = selectedLocation.toLowerCase();
        const matchesCity = cand.city.toLowerCase() === locLower;
        const matchesState = cand.state.toLowerCase() === locLower;
        if (!matchesCity && !matchesState) return false;
      }

      // 4. Experience filter
      if (selectedExperience !== 'All') {
        const minExp = parseInt(selectedExperience, 10);
        if (cand.yearsOfExperience < minExp) return false;
      }

      // 5. Availability filter
      if (selectedAvailability !== 'All' && cand.currentAvailability !== selectedAvailability) {
        return false;
      }

      // 6. Technology Domain filter
      if (selectedDomain === 'Solar') {
        const hasSolarSkill = cand.renewableSkills.some(
          (s) => s.category === 'Solar' || s.name?.toLowerCase().includes('solar') || s.name?.toLowerCase().includes('pv')
        );
        const isSolarProf = cand.profession.toLowerCase().includes('solar') || cand.profession.toLowerCase().includes('pv');
        if (!hasSolarSkill && !isSolarProf) return false;
      } else if (selectedDomain === 'Wind') {
        const hasWindSkill = cand.renewableSkills.some(
          (s) => s.category === 'Wind' || s.name?.toLowerCase().includes('wind') || s.name?.toLowerCase().includes('turbine')
        );
        const isWindProf = cand.profession.toLowerCase().includes('wind') || cand.profession.toLowerCase().includes('turbine');
        if (!hasWindSkill && !isWindProf) return false;
      }

      // 7. Verified Only filter
      if (verifiedOnly && !cand.isVerified) {
        return false;
      }

      // 8. Shortlisted Only filter
      if (shortlistedOnly && !shortlisted[cand.id]) {
        return false;
      }

      return true;
    });
  }, [
    normalizedCandidates,
    searchQuery,
    selectedProfession,
    selectedLocation,
    selectedExperience,
    selectedAvailability,
    selectedDomain,
    verifiedOnly,
    shortlistedOnly,
    shortlisted,
  ]);

  // Sort Pipeline
  const sortedCandidates = useMemo(() => {
    const list = [...filteredCandidates];
    const isProjectMode = Boolean(selectedProjectId && matchedResults.length > 0);

    list.sort((a, b) => {
      if (sortBy === 'score') {
        return (b.overallSkillScore || 0) - (a.overallSkillScore || 0);
      }
      if (sortBy === 'exp') {
        return (b.yearsOfExperience || 0) - (a.yearsOfExperience || 0);
      }
      if (sortBy === 'rating') {
        return (b.averageRating || 0) - (a.averageRating || 0);
      }
      if (sortBy === 'rate') {
        return (a.expectedDailyRate || 0) - (b.expectedDailyRate || 0);
      }

      // Default sorting: In project mode sort by matchScore; in general mode sort by skill score
      if (isProjectMode) {
        return (b.matchScore || 0) - (a.matchScore || 0);
      }
      return (b.overallSkillScore || 0) - (a.overallSkillScore || 0);
    });

    return list;
  }, [filteredCandidates, sortBy, selectedProjectId, matchedResults]);

  // Count active filters
  const activeFiltersCount = [
    selectedProfession !== 'All',
    selectedLocation !== 'All',
    selectedExperience !== 'All',
    selectedAvailability !== 'All',
    selectedDomain !== 'All',
    verifiedOnly,
    shortlistedOnly,
    searchQuery.trim().length > 0,
  ].filter(Boolean).length;

  const handleClearAllFilters = () => {
    setSearchQuery('');
    setSelectedProfession('All');
    setSelectedLocation('All');
    setSelectedExperience('All');
    setSelectedAvailability('All');
    setSelectedDomain('All');
    setVerifiedOnly(false);
    setShortlistedOnly(false);
    setSortBy('default');
  };

  // Metrics for Top Banner
  const totalVerifiedCount = useMemo(() => {
    return allTechnicians.filter((t) => {
      const certCount = t.verifiedCertificatesCount || (t.verifiedCertificates || []).length || 0;
      const verifiedSkills = (t.renewableSkills || []).filter((s) => s.isVerified);
      return certCount > 0 || verifiedSkills.length > 0;
    }).length;
  }, [allTechnicians]);

  const totalAvailableCount = useMemo(() => {
    return allTechnicians.filter((t) => (t.currentAvailability || 'Available') === 'Available').length;
  }, [allTechnicians]);

  const shortlistedCount = Object.keys(shortlisted).length;

  // Selected Project Object for Hire Modal
  const activeProjectObj = useMemo(() => {
    if (!selectedProjectId) return myProjects[0] || null;
    return myProjects.find((p) => p._id === selectedProjectId) || null;
  }, [selectedProjectId, myProjects]);

  // Mobilize Handler with Smart Project Selection
  const handleInitiateMobilize = (cand) => {
    if (myProjects.length === 0) {
      showToast('No active projects found. Please post a project first to deploy crew.', 'error');
      return;
    }

    if (selectedProjectId) {
      const targetProj = myProjects.find((p) => p._id === selectedProjectId) || matchingProjectData || myProjects[0];
      setHireProjectTarget(targetProj);
      setHireCandidate(cand);
    } else if (myProjects.length === 1) {
      setHireProjectTarget(myProjects[0]);
      setHireCandidate(cand);
    } else {
      setProjectChooserCandidate(cand);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Header
          title="Find Verified Technicians"
          subtitle="Discover, evaluate, and mobilize certified solar and wind talent across India"
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        />

        <main className="p-4 sm:p-6 lg:p-8 space-y-6 flex-1 max-w-7xl w-full mx-auto">
          {/* Floating Toast Notification */}
          {toast && (
            <div
              className={`fixed top-20 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-xs sm:text-sm font-semibold border animate-in slide-in-from-top-4 duration-300 ${
                toast.type === 'error'
                  ? 'bg-rose-50 text-rose-800 border-rose-200'
                  : 'bg-emerald-50 text-emerald-900 border-emerald-300'
              }`}
            >
              {toast.type === 'error' ? (
                <AlertCircle size={18} className="text-rose-600 shrink-0" />
              ) : (
                <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
              )}
              <span>{toast.message}</span>
            </div>
          )}

          {/* Breadcrumb Navigation & High-Level Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold">
              <Link to="/epc/dashboard" className="text-slate-500 hover:text-slate-800 transition-colors">
                Dashboard
              </Link>
              <span className="text-slate-300">/</span>
              <span className="text-slate-900 font-bold">Technician Discovery</span>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to="/epc/projects"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 shadow-2xs transition-colors"
              >
                <Briefcase size={14} className="text-slate-500" />
                <span>My Projects</span>
              </Link>
              <Link
                to="/epc/workforce"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-colors"
              >
                <UserCheck size={14} />
                <span>Crew Workforce</span>
              </Link>
            </div>
          </div>

          {/* Project Matching Selector Bar */}
          <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-sm border border-emerald-900/40 space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-emerald-400 animate-pulse" />
                  <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-400">
                    Project-Specific AI Matching
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  Select a live project to rank candidates by proprietary AI match algorithms (skills, certifications, experience & location).
                </p>
              </div>

              {/* Project Select Dropdown */}
              <div className="flex items-center gap-2 shrink-0">
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="bg-slate-800/90 text-white text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-700 hover:border-emerald-500 focus:outline-emerald-500 cursor-pointer max-w-xs truncate"
                >
                  <option value="">🌐 General Talent Directory (No Project)</option>
                  {myProjects.map((p) => (
                    <option key={p._id} value={p._id}>
                      🎯 {p.projectName} ({p.projectType || 'Renewable'} • {p.location?.city || 'Site'})
                    </option>
                  ))}
                </select>

                {selectedProjectId && (
                  <button
                    type="button"
                    onClick={() => setSelectedProjectId('')}
                    className="px-2.5 py-2 text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-colors"
                    title="Clear project selection"
                  >
                    Clear Match
                  </button>
                )}
              </div>
            </div>

            {/* Active Matching Context Banner */}
            {selectedProjectId && (
              <div className="pt-2 border-t border-emerald-900/50 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-mono font-bold text-[11px] border border-emerald-500/30">
                    Active Match
                  </span>
                  <span className="text-slate-200 font-semibold truncate max-w-md">
                    {matchingProjectData?.projectName || 'Project Candidate Evaluation'}
                  </span>
                </div>
                <span className="text-emerald-400 font-mono text-[11px]">
                  {isMatchingLoading ? 'Scoring candidates...' : `${sortedCandidates.length} Candidates Scored by AI`}
                </span>
              </div>
            )}
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Talent Pool</span>
              <p className="text-2xl font-black text-slate-900 mt-1">{allTechnicians.length}</p>
              <span className="text-[11px] text-slate-500 mt-0.5 block">Verified renewable crew roster</span>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">Certified Techs</span>
              <p className="text-2xl font-black text-emerald-700 mt-1">{totalVerifiedCount}</p>
              <span className="text-[11px] text-slate-500 mt-0.5 block">NSDC & SCGJ credentialed</span>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-sky-600">Available Now</span>
              <p className="text-2xl font-black text-sky-700 mt-1">{totalAvailableCount}</p>
              <span className="text-[11px] text-slate-500 mt-0.5 block">Immediate site deployment</span>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600">Saved Shortlist</span>
              <p className="text-2xl font-black text-amber-700 mt-1">{shortlistedCount}</p>
              <span className="text-[11px] text-slate-500 mt-0.5 block">Bookmarked for hiring review</span>
            </div>
          </div>

          {/* Search Bar & Multi-Dimensional Filters */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs space-y-4">
            {/* Search Input Row */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by technician name, trade, skill, city, or certification..."
                  className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-emerald-600 focus:bg-white text-slate-800 placeholder-slate-400"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Mobile Filter Toggle Button */}
              <button
                type="button"
                onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
                className="sm:hidden inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-bold text-xs"
              >
                <SlidersHorizontal size={14} />
                <span>Filters {activeFiltersCount > 0 ? `(${activeFiltersCount})` : ''}</span>
              </button>

              {/* View Mode & Sort Dropdown */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="text-xs font-semibold py-2.5 pl-3 pr-8 bg-slate-50 border border-slate-200 rounded-xl focus:outline-emerald-600 cursor-pointer text-slate-700"
                  >
                    {selectedProjectId ? (
                      <option value="default">Sort: Best AI Match</option>
                    ) : (
                      <option value="default">Sort: Highest Skill Score</option>
                    )}
                    <option value="score">Overall Skill Score</option>
                    <option value="exp">Experience (High to Low)</option>
                    <option value="rating">Rating (Highest First)</option>
                    <option value="rate">Daily Rate (Low to High)</option>
                  </select>
                </div>

                {/* Grid / Table Toggle */}
                <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
                  <button
                    type="button"
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-lg transition-colors ${
                      viewMode === 'grid' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-800'
                    }`}
                    title="Grid Card View"
                  >
                    <LayoutGrid size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('table')}
                    className={`p-1.5 rounded-lg transition-colors ${
                      viewMode === 'table' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-800'
                    }`}
                    title="Compact Table View"
                  >
                    <List size={15} />
                  </button>
                </div>
              </div>
            </div>

            {/* Filter Dropdowns Grid (Desktop & Open Mobile) */}
            <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-1 ${mobileFilterOpen ? 'block' : 'hidden sm:grid'}`}>
              {/* Profession Filter */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Trade / Profession</label>
                <select
                  value={selectedProfession}
                  onChange={(e) => setSelectedProfession(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-emerald-600 text-slate-700"
                >
                  <option value="All">All Professions</option>
                  {availableProfessions.map((prof) => (
                    <option key={prof} value={prof}>
                      {prof}
                    </option>
                  ))}
                </select>
              </div>

              {/* Location Filter */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">State / City</label>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-emerald-600 text-slate-700"
                >
                  <option value="All">All Locations</option>
                  {availableLocations.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>

              {/* Experience Filter */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Experience</label>
                <select
                  value={selectedExperience}
                  onChange={(e) => setSelectedExperience(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-emerald-600 text-slate-700"
                >
                  <option value="All">Any Experience</option>
                  <option value="1">1+ Years</option>
                  <option value="3">3+ Years</option>
                  <option value="5">5+ Years</option>
                </select>
              </div>

              {/* Availability Filter */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Availability</label>
                <select
                  value={selectedAvailability}
                  onChange={(e) => setSelectedAvailability(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-emerald-600 text-slate-700"
                >
                  <option value="All">All Availabilities</option>
                  <option value="Available">Available Now</option>
                  <option value="On Project">On Project</option>
                  <option value="Unavailable">Unavailable</option>
                </select>
              </div>

              {/* Sector / Domain Filter */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Clean Energy Sector</label>
                <select
                  value={selectedDomain}
                  onChange={(e) => setSelectedDomain(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-emerald-600 text-slate-700"
                >
                  <option value="All">Solar & Wind (All)</option>
                  <option value="Solar">☀️ Solar PV Only</option>
                  <option value="Wind">💨 Wind Energy Only</option>
                </select>
              </div>
            </div>

            {/* Quick Toggle Pills: Verified Credentials & Shortlist */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setVerifiedOnly(!verifiedOnly)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                    verifiedOnly
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300 ring-2 ring-emerald-500/20'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <ShieldCheck size={13} className={verifiedOnly ? 'text-emerald-600' : 'text-slate-400'} />
                  <span>Verified Credentials Only</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShortlistedOnly(!shortlistedOnly)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                    shortlistedOnly
                      ? 'bg-amber-50 text-amber-800 border-amber-300 ring-2 ring-amber-500/20'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <BookmarkCheck size={13} className={shortlistedOnly ? 'text-amber-600' : 'text-slate-400'} />
                  <span>Shortlisted Candidates ({shortlistedCount})</span>
                </button>
              </div>

              {activeFiltersCount > 0 && (
                <button
                  type="button"
                  onClick={handleClearAllFilters}
                  className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-700 transition-colors"
                >
                  <RotateCcw size={13} />
                  <span>Clear All ({activeFiltersCount})</span>
                </button>
              )}
            </div>

            {/* Active Filter Chips Strip */}
            {activeFiltersCount > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] font-semibold text-slate-400 mr-1">Active:</span>
                {searchQuery && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs bg-slate-100 text-slate-700 font-medium">
                    Search: "{searchQuery}"
                    <button type="button" onClick={() => setSearchQuery('')} className="hover:text-slate-900">
                      <X size={12} />
                    </button>
                  </span>
                )}
                {selectedProfession !== 'All' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs bg-slate-100 text-slate-700 font-medium">
                    {selectedProfession}
                    <button type="button" onClick={() => setSelectedProfession('All')} className="hover:text-slate-900">
                      <X size={12} />
                    </button>
                  </span>
                )}
                {selectedLocation !== 'All' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs bg-slate-100 text-slate-700 font-medium">
                    {selectedLocation}
                    <button type="button" onClick={() => setSelectedLocation('All')} className="hover:text-slate-900">
                      <X size={12} />
                    </button>
                  </span>
                )}
                {selectedExperience !== 'All' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs bg-slate-100 text-slate-700 font-medium">
                    {selectedExperience}+ Yrs
                    <button type="button" onClick={() => setSelectedExperience('All')} className="hover:text-slate-900">
                      <X size={12} />
                    </button>
                  </span>
                )}
                {selectedAvailability !== 'All' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs bg-slate-100 text-slate-700 font-medium">
                    {selectedAvailability}
                    <button type="button" onClick={() => setSelectedAvailability('All')} className="hover:text-slate-900">
                      <X size={12} />
                    </button>
                  </span>
                )}
                {selectedDomain !== 'All' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs bg-slate-100 text-slate-700 font-medium">
                    Domain: {selectedDomain}
                    <button type="button" onClick={() => setSelectedDomain('All')} className="hover:text-slate-900">
                      <X size={12} />
                    </button>
                  </span>
                )}
                {verifiedOnly && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs bg-emerald-100 text-emerald-800 font-medium">
                    Verified Credentials
                    <button type="button" onClick={() => setVerifiedOnly(false)} className="hover:text-emerald-950">
                      <X size={12} />
                    </button>
                  </span>
                )}
                {shortlistedOnly && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs bg-amber-100 text-amber-800 font-medium">
                    Shortlisted Only
                    <button type="button" onClick={() => setShortlistedOnly(false)} className="hover:text-amber-950">
                      <X size={12} />
                    </button>
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Results Summary Header */}
          <div className="flex items-center justify-between gap-3 text-xs font-semibold text-slate-600 px-1">
            <div>
              {loading || isMatchingLoading ? (
                <span>Scanning database...</span>
              ) : (
                <span>
                  Showing <strong className="text-slate-900">{sortedCandidates.length}</strong>{' '}
                  {selectedProjectId ? 'AI-scored candidates' : 'technicians'}{' '}
                  {activeFiltersCount > 0 && `(filtered from ${normalizedCandidates.length} total)`}
                </span>
              )}
            </div>

            {selectedProjectId && (
              <span className="hidden sm:inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                <Sparkles size={12} /> AI Scoring Enabled
              </span>
            )}
          </div>

          {/* Loading Skeleton State */}
          {loading || isMatchingLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-pulse">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-2xl p-6 border border-slate-200 space-y-4 shadow-2xs">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-200 shrink-0" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-slate-200 rounded-md w-3/4" />
                      <div className="h-3 bg-slate-100 rounded-md w-1/2" />
                    </div>
                  </div>
                  <div className="h-16 bg-slate-50 rounded-xl" />
                  <div className="h-8 bg-slate-100 rounded-md" />
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <div className="h-9 bg-slate-200 rounded-xl" />
                    <div className="h-9 bg-slate-200 rounded-xl" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            /* Error State */
            <div className="bg-white rounded-2xl p-8 border border-rose-200 text-center space-y-4 max-w-md mx-auto shadow-xs">
              <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                <AlertCircle size={24} />
              </div>
              <h3 className="text-base font-bold text-slate-900">Unable to Load Technicians</h3>
              <p className="text-xs text-slate-600">{error}</p>
              <button
                type="button"
                onClick={loadInitialData}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : sortedCandidates.length === 0 ? (
            /* Empty State */
            <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center space-y-4 shadow-2xs">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Search size={28} />
              </div>
              <h3 className="text-base font-bold text-slate-900">No technicians found</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                No technician profiles matched your current search and filter combination. Try clearing filters or searching for alternative trades or locations.
              </p>
              <div className="pt-2 flex justify-center gap-2">
                <button
                  type="button"
                  onClick={handleClearAllFilters}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors"
                >
                  Clear All Filters
                </button>
                {selectedProjectId && (
                  <button
                    type="button"
                    onClick={() => setSelectedProjectId('')}
                    className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold transition-colors"
                  >
                    View All Technicians
                  </button>
                )}
              </div>
            </div>
          ) : viewMode === 'table' ? (
            /* Compact Operations Table View */
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Technician</th>
                      <th className="py-3 px-4">Profession & Domain</th>
                      <th className="py-3 px-4">Location</th>
                      <th className="py-3 px-4">Experience</th>
                      <th className="py-3 px-4">Credentials</th>
                      {selectedProjectId && <th className="py-3 px-4">AI Fit Score</th>}
                      <th className="py-3 px-4">Availability</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {sortedCandidates.map((cand) => {
                      const isShortlisted = Boolean(shortlisted[cand.id]);

                      return (
                        <tr key={cand.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <img
                                src={
                                  cand.profilePhoto ||
                                  `https://api.dicebear.com/7.x/initials/svg?seed=${cand.name}&backgroundColor=059669`
                                }
                                alt={cand.name}
                                className="w-9 h-9 rounded-xl object-cover border border-slate-200 shrink-0"
                              />
                              <div>
                                <Link
                                  to={`/technicians/${cand.id}`}
                                  className="font-bold text-slate-900 hover:text-emerald-600 transition-colors"
                                >
                                  {cand.name}
                                </Link>
                                <div className="flex items-center gap-1 text-[11px] text-slate-500">
                                  <Star size={11} className="fill-amber-400 text-amber-400" />
                                  <span>{cand.averageRating.toFixed(1)}</span>
                                  <span>•</span>
                                  <span>₹{cand.expectedDailyRate}/d</span>
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <span className="font-semibold text-slate-800 block truncate max-w-[180px]">
                              {cand.profession}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              Skill Score: {cand.overallSkillScore}/100
                            </span>
                          </td>

                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1 text-slate-600">
                              <MapPin size={12} className="text-slate-400 shrink-0" />
                              <span className="truncate max-w-[130px]">
                                {cand.city ? `${cand.city}, ${cand.state}` : cand.state || 'India'}
                              </span>
                            </div>
                          </td>

                          <td className="py-3 px-4 font-semibold text-slate-700">
                            {cand.yearsOfExperience} Yrs
                          </td>

                          <td className="py-3 px-4">
                            {cand.isVerified ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                <ShieldCheck size={11} className="text-emerald-600" />
                                {cand.verifiedCertificatesCount > 0
                                  ? `${cand.verifiedCertificatesCount} Certs`
                                  : 'Verified'}
                              </span>
                            ) : (
                              <span className="text-[11px] text-slate-400">Self-attested</span>
                            )}
                          </td>

                          {selectedProjectId && (
                            <td className="py-3 px-4">
                              <MatchScoreBadge
                                score={cand.matchScore || 0}
                                size="sm"
                                onClick={() => setMatchModalCandidate(cand)}
                              />
                            </td>
                          )}

                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                cand.currentAvailability === 'Available'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                  : cand.currentAvailability === 'On Project'
                                  ? 'bg-amber-50 text-amber-800 border-amber-300'
                                  : 'bg-slate-100 text-slate-700 border-slate-300'
                              }`}
                            >
                              <Clock size={10} />
                              <span>{cand.currentAvailability}</span>
                            </span>
                          </td>

                          <td className="py-3 px-4 text-right">
                            <div className="inline-flex items-center justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => handleToggleShortlist(cand.id, cand.name)}
                                className={`p-1.5 rounded-lg border transition-colors ${
                                  isShortlisted
                                    ? 'bg-amber-50 text-amber-700 border-amber-300'
                                    : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                                }`}
                                title={isShortlisted ? 'Remove from Shortlist' : 'Add to Shortlist'}
                              >
                                {isShortlisted ? <BookmarkCheck size={13} /> : <Bookmark size={13} />}
                              </button>

                              <button
                                type="button"
                                onClick={() => setContactCandidate(cand)}
                                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors"
                                title="Contact Technician"
                              >
                                <Phone size={13} />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleInitiateMobilize(cand)}
                                className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-2xs transition-colors"
                              >
                                Mobilize
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* Rich Cards Grid View */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {sortedCandidates.map((cand) => {
                const isShortlisted = Boolean(shortlisted[cand.id]);
                const topSkills = cand.renewableSkills.slice(0, 3);
                const remainingSkillsCount = cand.renewableSkills.length - 3;

                return (
                  <div
                    key={cand.id}
                    className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
                  >
                    {/* Header Row: Avatar, Identity, Verification & Match Score */}
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0">
                          <img
                            src={
                              cand.profilePhoto ||
                              `https://api.dicebear.com/7.x/initials/svg?seed=${cand.name}&backgroundColor=059669`
                            }
                            alt={cand.name}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0 group-hover:scale-105 transition-transform"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <Link
                                to={`/technicians/${cand.id}`}
                                className="text-base font-extrabold text-slate-900 hover:text-emerald-600 transition-colors truncate"
                              >
                                {cand.name}
                              </Link>
                            </div>
                            <p className="text-xs font-semibold text-slate-600 truncate mt-0.5">
                              {cand.profession}
                            </p>
                          </div>
                        </div>

                        {/* Top-Right Badge: AI Match Score OR Shortlist Button */}
                        <div className="flex items-center gap-1 shrink-0">
                          {selectedProjectId && cand.matchScore !== null ? (
                            <MatchScoreBadge
                              score={cand.matchScore}
                              size="sm"
                              onClick={() => setMatchModalCandidate(cand)}
                            />
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleToggleShortlist(cand.id, cand.name)}
                              className={`p-2 rounded-xl border transition-colors ${
                                isShortlisted
                                  ? 'bg-amber-50 text-amber-700 border-amber-300 ring-2 ring-amber-400/20'
                                  : 'bg-slate-50 text-slate-400 hover:text-slate-700 border-slate-200 hover:bg-slate-100'
                              }`}
                              title={isShortlisted ? 'Shortlisted' : 'Add to Shortlist'}
                            >
                              {isShortlisted ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Verified Status & Match Factors */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        {cand.isVerified ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <ShieldCheck size={12} className="text-emerald-600 shrink-0" />
                            <span>
                              {cand.verifiedCertificatesCount > 0
                                ? `${cand.verifiedCertificatesCount} Verified Cert${cand.verifiedCertificatesCount > 1 ? 's' : ''}`
                                : 'Verified Credentials'}
                            </span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-500">
                            Profile Attested
                          </span>
                        )}

                        {/* Availability Pill */}
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full font-bold border ${
                            cand.currentAvailability === 'Available'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : cand.currentAvailability === 'On Project'
                              ? 'bg-amber-50 text-amber-800 border-amber-300'
                              : 'bg-slate-100 text-slate-700 border-slate-300'
                          }`}
                        >
                          <Clock size={10} />
                          <span>{cand.currentAvailability}</span>
                        </span>

                        {cand.applicationStatus && (
                          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md font-extrabold bg-blue-50 text-blue-800 border border-blue-200">
                            Applied: {cand.applicationStatus}
                          </span>
                        )}
                      </div>

                      {/* Match Factor Highlights (Only when matching against project) */}
                      {selectedProjectId && cand.breakdown && (
                        <div className="bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100 text-[11px] space-y-1">
                          <div className="flex items-center justify-between font-bold text-emerald-950">
                            <span className="flex items-center gap-1">
                              <Sparkles size={11} className="text-emerald-600" /> Match Alignment
                            </span>
                            <button
                              type="button"
                              onClick={() => setMatchModalCandidate(cand)}
                              className="text-emerald-700 hover:text-emerald-900 underline font-semibold text-[10px]"
                            >
                              View Breakdown
                            </button>
                          </div>
                          <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-600 pt-0.5">
                            <div>Skills: <strong className="text-slate-900">{cand.breakdown.skillMatch || 0}%</strong></div>
                            <div>Certs: <strong className="text-slate-900">{cand.breakdown.certMatch || 0}%</strong></div>
                            <div>Experience: <strong className="text-slate-900">{cand.breakdown.expMatch || 0}%</strong></div>
                            <div>Location: <strong className="text-slate-900">{cand.breakdown.locationMatch || 0}%</strong></div>
                          </div>
                        </div>
                      )}

                      {/* Location, Experience, Rating & Rate Summary Bar */}
                      <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100 grid grid-cols-2 gap-2 text-xs">
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                            Location
                          </span>
                          <div className="flex items-center gap-1 font-bold text-slate-800 truncate">
                            <MapPin size={12} className="text-slate-400 shrink-0" />
                            <span className="truncate">
                              {cand.city ? `${cand.city}, ${cand.state}` : cand.state || 'India'}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-0.5">
                          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                            Experience
                          </span>
                          <span className="font-bold text-slate-800 block">
                            {cand.yearsOfExperience} Years Exp
                          </span>
                        </div>

                        <div className="space-y-0.5 pt-1 border-t border-slate-200/50">
                          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                            Skill Rating
                          </span>
                          <div className="flex items-center gap-1 font-bold text-slate-800">
                            <Zap size={12} className="text-amber-500 shrink-0" />
                            <span>{cand.overallSkillScore}/100</span>
                            <span className="text-slate-400 font-normal">
                              ({cand.averageRating.toFixed(1)} ★)
                            </span>
                          </div>
                        </div>

                        <div className="space-y-0.5 pt-1 border-t border-slate-200/50">
                          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                            Expected Rate
                          </span>
                          <span className="font-bold text-slate-800 block">
                            ₹{cand.expectedDailyRate.toLocaleString('en-IN')}/day
                          </span>
                        </div>
                      </div>

                      {/* Renewable Skills Tags */}
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Verified Renewable Skills:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {topSkills.length > 0 ? (
                            topSkills.map((sk, sIdx) => (
                              <span
                                key={sIdx}
                                className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-lg border ${
                                  sk.isVerified
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                    : 'bg-slate-50 text-slate-700 border-slate-200'
                                }`}
                              >
                                {sk.isVerified && <CheckCircle2 size={10} className="text-emerald-600" />}
                                <span>{sk.name || sk}</span>
                              </span>
                            ))
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">No skills specified</span>
                          )}

                          {remainingSkillsCount > 0 && (
                            <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-md self-center">
                              +{remainingSkillsCount} more
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons Panel */}
                    <div className="pt-3 border-t border-slate-100 space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <Link
                          to={`/technicians/${cand.id}`}
                          className="py-2 px-2 text-center text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors flex items-center justify-center gap-1.5"
                        >
                          <Eye size={13} />
                          <span>View Profile</span>
                        </Link>

                        <Link
                          to={`/verify/skill-passport/${cand.id}`}
                          className="py-2 px-2 text-center text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors flex items-center justify-center gap-1.5"
                          title="View Digital Skill Passport"
                        >
                          <QrCode size={13} className="text-emerald-600" />
                          <span>Skill Passport</span>
                        </Link>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        {/* Shortlist Toggle */}
                        <button
                          type="button"
                          onClick={() => handleToggleShortlist(cand.id, cand.name)}
                          className={`py-2 px-2 text-center text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1 cursor-pointer border ${
                            isShortlisted
                              ? 'bg-amber-50 text-amber-800 border-amber-300'
                              : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                          }`}
                        >
                          {isShortlisted ? (
                            <BookmarkCheck size={13} className="text-amber-600" />
                          ) : (
                            <Bookmark size={13} />
                          )}
                          <span className="truncate">{isShortlisted ? 'Saved' : 'Shortlist'}</span>
                        </button>

                        {/* Direct Contact Modal Button */}
                        <button
                          type="button"
                          onClick={() => setContactCandidate(cand)}
                          className="py-2 px-2 text-center text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Phone size={13} />
                          <span>Contact</span>
                        </button>

                        {/* Mobilize / Deploy Modal Button */}
                        <button
                          type="button"
                          onClick={() => handleInitiateMobilize(cand)}
                          className="py-2 px-2 text-center text-xs font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-2xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <UserCheck size={13} />
                          <span>Mobilize</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Project Chooser Dialog (when mobilizing without active project filter) */}
          {projectChooserCandidate && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-slate-200 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">Select Project to Mobilize</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Choose which site installation <strong>{projectChooserCandidate.name}</strong> will be assigned to.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setProjectChooserCandidate(null)}
                    className="text-slate-400 hover:text-slate-600 p-1"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {myProjects.map((p) => (
                    <button
                      key={p._id}
                      type="button"
                      onClick={() => {
                        const cand = projectChooserCandidate;
                        setProjectChooserCandidate(null);
                        setHireProjectTarget(p);
                        setHireCandidate(cand);
                      }}
                      className="w-full text-left p-3.5 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 transition-all flex items-center justify-between group cursor-pointer"
                    >
                      <div className="min-w-0 pr-2">
                        <p className="font-bold text-slate-900 text-xs group-hover:text-emerald-800 truncate">
                          {p.projectName}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {p.projectType || 'Renewable'} • {p.location?.city || 'Site'} • Status:{' '}
                          <span className="font-semibold text-slate-700">{p.projectStatus || 'Open'}</span>
                        </p>
                      </div>
                      <ChevronRight size={16} className="text-slate-400 group-hover:text-emerald-600 shrink-0" />
                    </button>
                  ))}
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setProjectChooserCandidate(null)}
                    className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Contact Technician Modal */}
          {contactCandidate && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl max-w-sm w-full p-6 border border-slate-200 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Phone size={18} className="text-emerald-600" />
                    <h3 className="text-base font-bold text-slate-900">Direct Contact Details</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setContactCandidate(null)}
                    className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <img
                    src={
                      contactCandidate.profilePhoto ||
                      `https://api.dicebear.com/7.x/initials/svg?seed=${contactCandidate.name}&backgroundColor=059669`
                    }
                    alt={contactCandidate.name}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{contactCandidate.name}</h4>
                    <p className="text-xs text-slate-500 font-semibold">{contactCandidate.profession}</p>
                    <span className="text-[11px] text-slate-400">
                      {contactCandidate.city ? `${contactCandidate.city}, ${contactCandidate.state}` : 'India'}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  {/* Phone */}
                  <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
                    <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">
                      Registered Phone
                    </span>
                    <div className="flex items-center justify-between">
                      {contactCandidate.phone ? (
                        <>
                          <a
                            href={`tel:${contactCandidate.phone}`}
                            className="font-mono font-bold text-slate-900 text-sm hover:text-emerald-600 transition-colors"
                          >
                            {contactCandidate.phone}
                          </a>
                          <button
                            type="button"
                            onClick={() => handleCopy(contactCandidate.phone, 'phone')}
                            className="p-1 text-slate-400 hover:text-slate-600"
                            title="Copy Phone"
                          >
                            {copiedField === 'phone' ? (
                              <Check size={14} className="text-emerald-600" />
                            ) : (
                              <Copy size={14} />
                            )}
                          </button>
                        </>
                      ) : (
                        <span className="text-slate-400 italic">Not provided on profile</span>
                      )}
                    </div>
                  </div>

                  {/* Email */}
                  <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
                    <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">
                      Email Address
                    </span>
                    <div className="flex items-center justify-between">
                      {contactCandidate.email ? (
                        <>
                          <a
                            href={`mailto:${contactCandidate.email}`}
                            className="font-medium text-slate-900 truncate hover:text-emerald-600 transition-colors"
                          >
                            {contactCandidate.email}
                          </a>
                          <button
                            type="button"
                            onClick={() => handleCopy(contactCandidate.email, 'email')}
                            className="p-1 text-slate-400 hover:text-slate-600"
                            title="Copy Email"
                          >
                            {copiedField === 'email' ? (
                              <Check size={14} className="text-emerald-600" />
                            ) : (
                              <Copy size={14} />
                            )}
                          </button>
                        </>
                      ) : (
                        <span className="text-slate-400 italic">Not provided on profile</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setContactCandidate(null)}
                    className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Match Explanation Modal */}
          {matchModalCandidate && (
            <MatchExplanationModal
              isOpen={Boolean(matchModalCandidate)}
              onClose={() => setMatchModalCandidate(null)}
              matchData={matchModalCandidate.raw || matchModalCandidate}
              candidateName={matchModalCandidate.name}
              projectName={matchingProjectData?.projectName || 'Project'}
            />
          )}

          {/* Hire / Mobilize Technician Modal */}
          {hireCandidate && (
            <HireTechnicianModal
              isOpen={Boolean(hireCandidate)}
              onClose={() => {
                setHireCandidate(null);
                setHireProjectTarget(null);
              }}
              technician={{
                ...hireCandidate,
                _id: hireCandidate.id,
                user: {
                  _id: hireCandidate.id,
                  name: hireCandidate.name,
                  profilePhoto: hireCandidate.profilePhoto,
                },
              }}
              project={hireProjectTarget || activeProjectObj}
              applicationId={hireCandidate.applicationId}
              onSuccess={() => {
                showToast(`Technician ${hireCandidate.name} mobilized to workforce successfully!`);
                setHireCandidate(null);
                setHireProjectTarget(null);
                loadInitialData();
                if (selectedProjectId) {
                  loadProjectMatches(selectedProjectId);
                }
              }}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default TechnicianSearchPage;
