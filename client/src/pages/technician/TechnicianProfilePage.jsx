import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  User,
  MapPin,
  Briefcase,
  Star,
  CheckCircle2,
  ShieldCheck,
  Award,
  Phone,
  Mail,
  Bookmark,
  BookmarkCheck,
  Edit3,
  Save,
  Clock,
  History,
  AlertCircle,
  ExternalLink,
  Plus,
  Trash2,
  X,
  FileCheck,
  QrCode,
  ArrowRight,
  TrendingUp,
  Zap,
  IndianRupee,
  RefreshCw,
  Calendar,
  Building,
  Check,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { technicianAPI, assessmentAPI } from '../../services/api';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import RatingStars from '../../components/common/RatingStars';

const TechnicianProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    user: authUser,
    profile: authProfile,
    isTechnician,
    isCompany,
    isAdmin,
    isAuthenticated,
    updateProfileState,
  } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // Core profile & user data
  const [profileData, setProfileData] = useState(null);
  const [userData, setUserData] = useState(null);
  const [certificates, setCertificates] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [completedAssignments, setCompletedAssignments] = useState([]);

  // Modals & UI states
  const [editProfileModalOpen, setEditProfileModalOpen] = useState(false);
  const [addSkillModalOpen, setAddSkillModalOpen] = useState(false);
  const [addProjectModalOpen, setAddProjectModalOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [isShortlisted, setIsShortlisted] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  // Form State for editing primary profile details
  const [formData, setFormData] = useState({
    profession: '',
    yearsOfExperience: 0,
    currentAvailability: 'Available',
    city: '',
    state: '',
    bio: '',
    phone: '',
    expectedDailyRate: '',
    expectedMonthlyRate: '',
    preferredWorkLocations: '',
  });

  // Form State for adding a new skill
  const [newSkill, setNewSkill] = useState({
    name: '',
    category: 'Solar',
    proficiency: 'Intermediate',
  });
  const [addingSkill, setAddingSkill] = useState(false);

  // Form State for adding a previous project
  const [newProject, setNewProject] = useState({
    title: '',
    projectType: 'Solar',
    capacity: '',
    role: '',
    location: '',
    durationMonths: 3,
    completionYear: new Date().getFullYear(),
    description: '',
  });
  const [addingProject, setAddingProject] = useState(false);

  const showToast = (msg, type = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const targetId = id || authUser?._id || authUser?.id;
  const isOwnProfile = !id || id === authUser?._id || id === authUser?.id;

  // Fetch full technician profile data
  const fetchProfile = async () => {
    try {
      setLoading(true);
      setFetchError(null);

      if (isOwnProfile && authProfile) {
        // Own profile: seed from auth context, then hydrate with live certs & assessments
        setProfileData(authProfile);
        setUserData(authUser);
        populateFormData(authProfile, authUser);

        // Fetch live certificates and assessments in parallel
        const [certsRes, assessRes] = await Promise.all([
          technicianAPI.getMyCertificates().catch((err) => {
            console.warn('[Profile] Could not fetch my certificates:', err.message);
            return { data: { success: false, data: [] } };
          }),
          assessmentAPI.getMyResults().catch((err) => {
            console.warn('[Profile] Could not fetch my assessments:', err.message);
            return { data: { success: false, data: [] } };
          }),
        ]);

        if (certsRes.data?.data) {
          setCertificates(certsRes.data.data);
        }
        if (assessRes.data?.data) {
          setAssessments(assessRes.data.data);
        }
      } else if (targetId) {
        // Public or EPC view: fetch through getById
        const res = await technicianAPI.getById(targetId);
        if (res.data?.success) {
          const d = res.data.data;
          const p = d.profile || d;
          const u = d.user || p.user || d;
          setProfileData(p);
          setUserData(u);
          setCertificates(d.certificates || []);
          setAssessments(d.assessments || []);
          setReviews(d.reviews || []);
          setCompletedAssignments(d.completedAssignments || []);
          populateFormData(p, u);
        } else {
          setFetchError('Technician profile not found or could not be loaded.');
        }
      } else {
        setFetchError('No technician specified.');
      }
    } catch (err) {
      console.error('Error fetching technician profile:', err);
      setFetchError('Failed to load technician profile. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const populateFormData = (p, u) => {
    if (!p) return;
    setFormData({
      profession: p.profession || '',
      yearsOfExperience: p.yearsOfExperience !== undefined ? p.yearsOfExperience : 0,
      currentAvailability: p.currentAvailability || 'Available',
      city: p.city || '',
      state: p.state || '',
      bio: p.bio || '',
      phone: u?.phone || '',
      expectedDailyRate: p.expectedDailyRate || '',
      expectedMonthlyRate: p.expectedMonthlyRate || '',
      preferredWorkLocations: Array.isArray(p.preferredWorkLocations)
        ? p.preferredWorkLocations.join(', ')
        : p.preferredWorkLocations || '',
    });
  };

  useEffect(() => {
    fetchProfile();
  }, [targetId]);

  // Handle Edit Profile Form Save
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setSavingProfile(true);

      const parsedLocations = formData.preferredWorkLocations
        ? formData.preferredWorkLocations
            .split(',')
            .map((loc) => loc.trim())
            .filter(Boolean)
        : [];

      const payload = {
        profession: formData.profession.trim(),
        yearsOfExperience: Number(formData.yearsOfExperience) || 0,
        currentAvailability: formData.currentAvailability,
        city: formData.city.trim(),
        state: formData.state.trim(),
        bio: formData.bio.trim(),
        phone: formData.phone.trim(),
        expectedDailyRate: formData.expectedDailyRate ? Number(formData.expectedDailyRate) : undefined,
        expectedMonthlyRate: formData.expectedMonthlyRate ? Number(formData.expectedMonthlyRate) : undefined,
        preferredWorkLocations: parsedLocations,
      };

      const res = await technicianAPI.updateProfile(payload);
      if (res.data?.success) {
        const updated = res.data.data;
        updateProfileState(updated);
        setProfileData(updated);
        if (updated.user) {
          setUserData(updated.user);
        } else if (formData.phone) {
          setUserData((prev) => ({ ...prev, phone: formData.phone }));
        }
        setEditProfileModalOpen(false);
        showToast('Profile updated successfully!');
      } else {
        showToast(res.data?.message || 'Error saving changes.', 'error');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      showToast(err.response?.data?.message || 'Failed to update profile.', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  // Handle Quick Availability Toggle
  const handleQuickAvailabilityChange = async (newAvailability) => {
    if (!isOwnProfile) return;
    try {
      const res = await technicianAPI.updateAvailability(newAvailability);
      if (res.data?.success) {
        setProfileData((prev) => ({ ...prev, currentAvailability: newAvailability }));
        if (authProfile) {
          updateProfileState({ ...authProfile, currentAvailability: newAvailability });
        }
        showToast(`Availability updated to ${newAvailability}`);
      }
    } catch (err) {
      showToast('Could not update availability.', 'error');
    }
  };

  // Handle Adding a Skill
  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!newSkill.name.trim()) {
      showToast('Please enter a skill name.', 'error');
      return;
    }

    try {
      setAddingSkill(true);
      const existing = profileData?.renewableSkills || [];
      const duplicate = existing.some(
        (s) => s.name.toLowerCase() === newSkill.name.trim().toLowerCase()
      );
      if (duplicate) {
        showToast('This skill is already in your profile.', 'error');
        setAddingSkill(false);
        return;
      }

      const updatedSkills = [
        ...existing,
        {
          name: newSkill.name.trim(),
          category: newSkill.category,
          proficiency: newSkill.proficiency,
          isVerified: false,
        },
      ];

      const res = await technicianAPI.updateProfile({ renewableSkills: updatedSkills });
      if (res.data?.success) {
        const updated = res.data.data;
        updateProfileState(updated);
        setProfileData(updated);
        setNewSkill({ name: '', category: 'Solar', proficiency: 'Intermediate' });
        setAddSkillModalOpen(false);
        showToast('Skill added to your profile!');
      }
    } catch (err) {
      console.error('Error adding skill:', err);
      showToast('Failed to add skill.', 'error');
    } finally {
      setAddingSkill(false);
    }
  };

  // Handle Deleting a Skill
  const handleDeleteSkill = async (skillIndex) => {
    if (!isOwnProfile) return;
    try {
      const existing = profileData?.renewableSkills || [];
      const updatedSkills = existing.filter((_, idx) => idx !== skillIndex);

      const res = await technicianAPI.updateProfile({ renewableSkills: updatedSkills });
      if (res.data?.success) {
        const updated = res.data.data;
        updateProfileState(updated);
        setProfileData(updated);
        showToast('Skill removed.');
      }
    } catch (err) {
      showToast('Could not remove skill.', 'error');
    }
  };

  // Handle Adding a Previous Project
  const handleAddProject = async (e) => {
    e.preventDefault();
    if (!newProject.title.trim()) {
      showToast('Please enter a project title.', 'error');
      return;
    }

    try {
      setAddingProject(true);
      const existing = profileData?.previousProjects || [];
      const updatedProjects = [
        ...existing,
        {
          title: newProject.title.trim(),
          projectType: newProject.projectType,
          capacity: newProject.capacity.trim(),
          role: newProject.role.trim(),
          location: newProject.location.trim(),
          durationMonths: Number(newProject.durationMonths) || 1,
          completionYear: Number(newProject.completionYear) || new Date().getFullYear(),
          description: newProject.description.trim(),
        },
      ];

      const res = await technicianAPI.updateProfile({ previousProjects: updatedProjects });
      if (res.data?.success) {
        const updated = res.data.data;
        updateProfileState(updated);
        setProfileData(updated);
        setNewProject({
          title: '',
          projectType: 'Solar',
          capacity: '',
          role: '',
          location: '',
          durationMonths: 3,
          completionYear: new Date().getFullYear(),
          description: '',
        });
        setAddProjectModalOpen(false);
        showToast('Project added to your work history!');
      }
    } catch (err) {
      console.error('Error adding project:', err);
      showToast('Failed to add project.', 'error');
    } finally {
      setAddingProject(false);
    }
  };

  // Derived display values
  const name = userData?.name || 'Technician';
  const profession = profileData?.profession || 'Renewable Energy Technician';
  const city = profileData?.city || '';
  const state = profileData?.state || '';
  const experienceYears = profileData?.yearsOfExperience || 0;
  const availability = profileData?.currentAvailability || 'Available';
  const rating = profileData?.averageRating || 5.0;
  const ratingsCount = profileData?.ratingsCount || 0;
  const bio = profileData?.bio || '';
  const preferredLocations = profileData?.preferredWorkLocations || [];
  const expectedDailyRate = profileData?.expectedDailyRate;
  const expectedMonthlyRate = profileData?.expectedMonthlyRate;
  const renewableSkills = profileData?.renewableSkills || [];
  const previousProjects = profileData?.previousProjects || [];

  // Verified Status Calculation
  const verifiedCertsCount = certificates.filter((c) => c.status === 'Verified').length;
  const verifiedSkillsCount = renewableSkills.filter((s) => s.isVerified).length;
  const isVerifiedTechnician =
    verifiedCertsCount > 0 || (profileData?.verifiedCertificatesCount || 0) > 0 || verifiedSkillsCount > 0;

  // Profile Completion Calculation & Checklist Items
  const calculateDynamicCompletion = () => {
    let score = 20; // Base account creation
    if (profession && profession !== 'Renewable Energy Technician') score += 15;
    if (experienceYears > 0) score += 10;
    if (city && state) score += 15;
    if (renewableSkills.length >= 3) score += 15;
    else if (renewableSkills.length > 0) score += 10;
    if (previousProjects.length >= 1 || completedAssignments.length >= 1) score += 10;
    if (certificates.length > 0) score += 10;
    if (bio && bio.length > 20) score += 5;
    return Math.min(score, 100);
  };

  const profileCompletionPercent = profileData?.profileCompletion || calculateDynamicCompletion();

  const completionChecklist = [
    {
      id: 'basic',
      label: 'Basic Account Details',
      completed: true,
      action: null,
    },
    {
      id: 'trade',
      label: 'Primary Trade & Profession',
      completed: !!profession && profession !== 'Renewable Energy Technician',
      action: () => setEditProfileModalOpen(true),
    },
    {
      id: 'location',
      label: 'City & State Location',
      completed: !!city && !!state,
      action: () => setEditProfileModalOpen(true),
    },
    {
      id: 'skills',
      label: `Technical Skills (${Math.min(renewableSkills.length, 3)}/3 added)`,
      completed: renewableSkills.length >= 3,
      action: () => setAddSkillModalOpen(true),
    },
    {
      id: 'bio',
      label: 'Professional Bio',
      completed: !!bio && bio.length > 20,
      action: () => setEditProfileModalOpen(true),
    },
    {
      id: 'cert',
      label: 'Upload Certification',
      completed: certificates.length > 0,
      link: '/technician/certificates',
    },
    {
      id: 'projects',
      label: 'Project History',
      completed: previousProjects.length > 0 || completedAssignments.length > 0,
      action: () => setAddProjectModalOpen(true),
    },
  ];

  // Group skills by category: Solar, Wind, Electrical/Other
  const categorizedSkills = {
    Solar: renewableSkills.filter((s) => s.category === 'Solar'),
    Wind: renewableSkills.filter((s) => s.category === 'Wind'),
    'Electrical & Storage': renewableSkills.filter(
      (s) => s.category !== 'Solar' && s.category !== 'Wind'
    ),
  };

  // Avatar URL
  const profilePhotoUrl =
    userData?.profilePhoto ||
    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=059669`;

  // Availability badge configuration
  const getAvailabilityBadge = (status) => {
    switch (status) {
      case 'Available':
        return {
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          dot: 'bg-emerald-500',
          label: 'Available for Work',
        };
      case 'On Project':
        return {
          bg: 'bg-blue-50 text-blue-800 border-blue-200',
          dot: 'bg-blue-500',
          label: 'On Project',
        };
      case 'Unavailable':
      default:
        return {
          bg: 'bg-slate-100 text-slate-700 border-slate-200',
          dot: 'bg-slate-400',
          label: 'Unavailable',
        };
    }
  };

  const availBadge = getAvailabilityBadge(availability);

  // =================== PROFILE MAIN CONTENT ===================
  const profileContent = (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`p-3.5 rounded-xl text-xs font-semibold flex items-center justify-between gap-3 shadow-xs border transition-all ${
            toastType === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {toastType === 'error' ? (
              <AlertCircle size={16} className="text-rose-600 shrink-0" />
            ) : (
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            )}
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage('')}
            className="text-slate-400 hover:text-slate-600 p-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Loading Skeleton State */}
      {loading ? (
        <div className="space-y-6 animate-pulse">
          <div className="bg-white rounded-xl p-6 sm:p-8 border border-slate-200 space-y-6">
            <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
              <div className="w-24 h-24 rounded-2xl bg-slate-200 shrink-0" />
              <div className="space-y-3 flex-1 w-full text-center sm:text-left">
                <div className="h-7 bg-slate-200 rounded w-1/3 mx-auto sm:mx-0" />
                <div className="h-4 bg-slate-100 rounded w-1/4 mx-auto sm:mx-0" />
                <div className="h-4 bg-slate-100 rounded w-1/2 mx-auto sm:mx-0" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-48 bg-white rounded-xl border border-slate-200 p-6" />
              <div className="h-64 bg-white rounded-xl border border-slate-200 p-6" />
              <div className="h-56 bg-white rounded-xl border border-slate-200 p-6" />
            </div>
            <div className="space-y-6">
              <div className="h-64 bg-white rounded-xl border border-slate-200 p-6" />
              <div className="h-72 bg-white rounded-xl border border-slate-200 p-6" />
              <div className="h-48 bg-white rounded-xl border border-slate-200 p-6" />
            </div>
          </div>
        </div>
      ) : fetchError ? (
        // Error State
        <div className="bg-white rounded-xl p-8 sm:p-12 border border-slate-200 text-center space-y-4 max-w-lg mx-auto shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle size={24} />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Profile Not Available</h2>
          <p className="text-xs text-slate-600 leading-relaxed">{fetchError}</p>
          <button
            onClick={fetchProfile}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <RefreshCw size={14} />
            <span>Try Again</span>
          </button>
        </div>
      ) : (
        <>
          {/* ================= SECTION 2: PROFILE HEADER ================= */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              {/* Left Column: Avatar + Essential Identity */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start md:items-center gap-5 text-center sm:text-left">
                {/* Profile Photo / Avatar */}
                <div className="relative shrink-0">
                  <img
                    src={profilePhotoUrl}
                    alt={name}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-emerald-500/80 shadow-xs bg-slate-50"
                  />
                  {isVerifiedTechnician && (
                    <div
                      title="Verified Clean Energy Technician"
                      className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-600 rounded-full border-2 border-white flex items-center justify-center text-white shadow-xs"
                    >
                      <CheckCircle2 size={14} />
                    </div>
                  )}
                </div>

                {/* Identity Info */}
                <div className="space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                      {name}
                    </h1>

                    {/* Verification Status */}
                    {isVerifiedTechnician ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 size={12} className="text-emerald-600" />
                        <span>Verified Technician</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                        <Clock size={12} className="text-amber-600" />
                        <span>Pending Verification</span>
                      </span>
                    )}
                  </div>

                  {/* Professional Role / Trade */}
                  <p className="text-sm font-semibold text-slate-700">{profession}</p>

                  {/* Metadata Row: Location, Experience, Availability */}
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-1.5 text-xs text-slate-600 pt-1">
                    {/* Location */}
                    <span className="inline-flex items-center gap-1">
                      <MapPin size={13} className="text-slate-400 shrink-0" />
                      <span>{city && state ? `${city}, ${state}` : 'Location not specified'}</span>
                    </span>

                    <span className="text-slate-300">•</span>

                    {/* Experience */}
                    <span className="inline-flex items-center gap-1">
                      <Briefcase size={13} className="text-slate-400 shrink-0" />
                      <span>{experienceYears} Years Experience</span>
                    </span>

                    <span className="text-slate-300">•</span>

                    {/* Availability Status */}
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${availBadge.bg}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${availBadge.dot}`} />
                      <span>{availBadge.label}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: Actions & Header Profile Completion Preview */}
              <div className="flex flex-col sm:flex-row md:flex-col items-center md:items-end justify-center gap-4 shrink-0 border-t md:border-t-0 pt-5 md:pt-0 border-slate-100">
                <div className="w-full sm:w-auto flex flex-wrap items-center justify-center gap-2">
                  {isOwnProfile ? (
                    <>
                      {/* Edit Profile Button */}
                      <button
                        onClick={() => setEditProfileModalOpen(true)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <Edit3 size={14} />
                        <span>Edit Profile</span>
                      </button>

                      {/* Skill Passport CTA */}
                      <Link
                        to="/technician/skill-passport"
                        className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold transition-colors inline-flex items-center gap-1.5"
                      >
                        <QrCode size={14} className="text-slate-500" />
                        <span>Skill Passport</span>
                      </Link>
                    </>
                  ) : (
                    <>
                      {/* Contact Technician Button */}
                      <button
                        onClick={() => setContactModalOpen(true)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <Phone size={14} />
                        <span>Contact Technician</span>
                      </button>

                      {/* Shortlist Button */}
                      <button
                        onClick={() => {
                          setIsShortlisted(!isShortlisted);
                          showToast(
                            !isShortlisted
                              ? `Shortlisted ${name} for review.`
                              : `Removed ${name} from shortlist.`
                          );
                        }}
                        className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1.5 cursor-pointer border ${
                          isShortlisted
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        {isShortlisted ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
                        <span>{isShortlisted ? 'Shortlisted' : 'Shortlist'}</span>
                      </button>

                      {/* Public Passport Link */}
                      <Link
                        to={`/passport/${targetId}`}
                        className="px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold inline-flex items-center gap-1"
                      >
                        <QrCode size={13} className="text-slate-500" />
                        <span>Passport</span>
                      </Link>
                    </>
                  )}
                </div>

                {/* Profile Completion Header Indicator */}
                <div className="w-full sm:w-48 bg-slate-50 border border-slate-200 rounded-lg p-2.5 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-semibold">
                    <span className="text-slate-600">Profile Completion</span>
                    <span className="text-emerald-700 font-bold font-mono">
                      {profileCompletionPercent}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${profileCompletionPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Availability Switcher (Own Profile Only) */}
            {isOwnProfile && (
              <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                <span className="font-semibold text-slate-600">Work Availability:</span>
                <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50">
                  {['Available', 'On Project', 'Unavailable'].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => handleQuickAvailabilityChange(opt)}
                      className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                        availability === opt
                          ? 'bg-white text-emerald-800 shadow-2xs font-bold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ================= TWO-COLUMN MAIN GRID LAYOUT ================= */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* ================= LEFT / PRIMARY COLUMN (2 COLS) ================= */}
            <div className="lg:col-span-2 space-y-6">
              {/* SECTION 3: PROFESSIONAL SUMMARY (ABOUT ME) */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                      <User size={16} />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-slate-900">About Me</h2>
                      <p className="text-[11px] text-slate-500">
                        Professional background and renewable energy specialization
                      </p>
                    </div>
                  </div>
                  {isOwnProfile && (
                    <button
                      onClick={() => setEditProfileModalOpen(true)}
                      className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 size={12} />
                      <span>Edit</span>
                    </button>
                  )}
                </div>

                {/* Bio Content or Empty State */}
                {bio ? (
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                    {bio}
                  </p>
                ) : (
                  <div className="p-5 bg-slate-50 border border-dashed border-slate-200 rounded-lg text-center space-y-2.5">
                    <p className="text-xs text-slate-600 max-w-md mx-auto">
                      Add your professional summary to help EPC companies understand your experience,
                      hands-on installations, and project readiness.
                    </p>
                    {isOwnProfile && (
                      <button
                        onClick={() => setEditProfileModalOpen(true)}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer inline-flex items-center gap-1"
                      >
                        <Plus size={13} />
                        <span>Add Professional Summary</span>
                      </button>
                    )}
                  </div>
                )}

                {/* Key Technical Highlights Row */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100 text-xs">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-[11px] text-slate-500 block">Primary Trade</span>
                    <span className="font-bold text-slate-800 mt-0.5 block truncate">
                      {profession}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-[11px] text-slate-500 block">Experience</span>
                    <span className="font-bold text-slate-800 mt-0.5 block">
                      {experienceYears} Years
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 col-span-2 sm:col-span-1">
                    <span className="text-[11px] text-slate-500 block">Daily Rate Expectation</span>
                    <span className="font-bold text-emerald-700 font-mono mt-0.5 block">
                      {expectedDailyRate ? `₹${expectedDailyRate} / day` : 'Negotiable'}
                    </span>
                  </div>
                </div>

                {/* Preferred Locations */}
                {preferredLocations.length > 0 && (
                  <div className="pt-2 text-xs flex flex-wrap items-center gap-1.5">
                    <span className="text-slate-500 font-medium">Preferred Work Locations:</span>
                    {preferredLocations.map((loc, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-medium border border-slate-200 text-[11px]"
                      >
                        {loc}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* SECTION 4: SKILLS & EXPERTISE */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                      <Zap size={16} />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-slate-900">Skills & Expertise</h2>
                      <p className="text-[11px] text-slate-500">
                        {renewableSkills.length} technical skills registered ({verifiedSkillsCount} verified)
                      </p>
                    </div>
                  </div>
                  {isOwnProfile && (
                    <button
                      onClick={() => setAddSkillModalOpen(true)}
                      className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Plus size={13} />
                      <span>Add Skill</span>
                    </button>
                  )}
                </div>

                {renewableSkills.length === 0 ? (
                  <div className="p-6 bg-slate-50 border border-dashed border-slate-200 rounded-lg text-center space-y-2">
                    <p className="text-xs text-slate-500">
                      No technical skills listed yet. Adding your skills helps EPC companies and our
                      matching engine recommend relevant projects.
                    </p>
                    {isOwnProfile && (
                      <button
                        onClick={() => setAddSkillModalOpen(true)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <Plus size={14} />
                        <span>Add Your First Skill</span>
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Render Category Blocks */}
                    {Object.entries(categorizedSkills).map(([catName, skillsInCat]) => {
                      if (skillsInCat.length === 0) return null;
                      return (
                        <div key={catName} className="space-y-2.5">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                            {catName} Specialization ({skillsInCat.length})
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {skillsInCat.map((sk, skIdx) => {
                              // Find actual index in full list for deletion
                              const originalIdx = renewableSkills.findIndex(
                                (item) => item.name === sk.name && item.category === sk.category
                              );

                              return (
                                <div
                                  key={skIdx}
                                  className={`p-3 rounded-lg border flex items-center justify-between gap-2 transition-colors ${
                                    sk.isVerified
                                      ? 'bg-emerald-50/40 border-emerald-200 hover:bg-emerald-50/70'
                                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100/80'
                                  }`}
                                >
                                  <div className="space-y-1 min-w-0">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className="font-bold text-slate-900 text-xs truncate">
                                        {sk.name}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-[11px]">
                                      <span className="text-slate-500 font-medium">
                                        {sk.proficiency || 'Intermediate'}
                                      </span>
                                      <span className="text-slate-300">•</span>
                                      {sk.isVerified ? (
                                        <span className="text-emerald-700 font-bold inline-flex items-center gap-1">
                                          <CheckCircle2 size={11} className="text-emerald-600" />
                                          <span>Verified</span>
                                        </span>
                                      ) : (
                                        <span className="text-slate-500 font-medium inline-flex items-center gap-1">
                                          <Clock size={11} className="text-slate-400" />
                                          <span>Pending Verification</span>
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  {isOwnProfile && (
                                    <button
                                      onClick={() => handleDeleteSkill(originalIdx)}
                                      title="Remove skill"
                                      className="text-slate-400 hover:text-rose-600 p-1.5 rounded transition-colors cursor-pointer shrink-0"
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* SECTION 5: CERTIFICATIONS SUMMARY */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                      <ShieldCheck size={16} />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-slate-900">Verified Certifications</h2>
                      <p className="text-[11px] text-slate-500">
                        Official trade and safety credentials
                      </p>
                    </div>
                  </div>

                  <Link
                    to="/technician/certificates"
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1"
                  >
                    <span>View All Certificates</span>
                    <ChevronRight size={14} />
                  </Link>
                </div>

                {certificates.length === 0 ? (
                  <div className="p-6 bg-slate-50 border border-dashed border-slate-200 rounded-lg text-center space-y-2">
                    <p className="text-xs text-slate-500">
                      No certifications added yet. Uploading your government or OEM certificates
                      increases EPC shortlist rates.
                    </p>
                    {isOwnProfile && (
                      <Link
                        to="/technician/certificates"
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <Plus size={14} />
                        <span>Upload Certification</span>
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {certificates.slice(0, 4).map((cert, idx) => {
                      const issueFormatted = cert.issueDate
                        ? new Date(cert.issueDate).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                          })
                        : null;
                      const expiryFormatted = cert.expiryDate
                        ? new Date(cert.expiryDate).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                          })
                        : null;

                      return (
                        <div
                          key={idx}
                          className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                        >
                          <div className="flex items-start sm:items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-emerald-600 shrink-0 mt-0.5 sm:mt-0">
                              <ShieldCheck size={16} />
                            </div>
                            <div>
                              <span className="font-bold text-slate-900 block text-xs">
                                {cert.certificateName}
                              </span>
                              <span className="text-[11px] text-slate-500 block">
                                {cert.issuingOrganization}
                                {cert.certificateNumber ? ` • Reg: ${cert.certificateNumber}` : ''}
                                {issueFormatted ? ` • Issued: ${issueFormatted}` : ''}
                                {expiryFormatted ? ` • Valid thru: ${expiryFormatted}` : ''}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                            {cert.status === 'Verified' ? (
                              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                                <CheckCircle2 size={12} className="text-emerald-600" />
                                <span>Verified</span>
                              </span>
                            ) : cert.status === 'Rejected' ? (
                              <span className="text-[11px] font-bold text-rose-800 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200 flex items-center gap-1">
                                <AlertCircle size={12} className="text-rose-600" />
                                <span>Rejected</span>
                              </span>
                            ) : (
                              <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
                                <Clock size={12} className="text-amber-600" />
                                <span>Pending Review</span>
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* SECTION 6: EXPERIENCE & PROJECT HISTORY */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                      <History size={16} />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-slate-900">Project & Work History</h2>
                      <p className="text-[11px] text-slate-500">
                        Clean energy installation and commissioning deployments
                      </p>
                    </div>
                  </div>
                  {isOwnProfile && (
                    <button
                      onClick={() => setAddProjectModalOpen(true)}
                      className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Plus size={13} />
                      <span>Add Project</span>
                    </button>
                  )}
                </div>

                {previousProjects.length === 0 && completedAssignments.length === 0 ? (
                  <div className="p-6 bg-slate-50 border border-dashed border-slate-200 rounded-lg text-center space-y-2">
                    <p className="text-xs text-slate-500">No project history added yet.</p>
                    {isOwnProfile && (
                      <button
                        onClick={() => setAddProjectModalOpen(true)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <Plus size={14} />
                        <span>Add Your First Project</span>
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* User's registered previous projects */}
                    {previousProjects.map((proj, idx) => (
                      <div
                        key={`prev-${idx}`}
                        className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-2"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-bold text-slate-900 text-sm">{proj.title}</h4>
                            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded border border-emerald-200">
                              {proj.projectType || 'Solar'}
                            </span>
                            {proj.capacity && (
                              <span className="text-[10px] font-mono font-semibold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                                {proj.capacity}
                              </span>
                            )}
                          </div>
                          {proj.completionYear && (
                            <span className="font-mono text-slate-500 text-[11px]">
                              {proj.completionYear}
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-slate-600 text-[11px]">
                          {proj.role && (
                            <span className="font-semibold text-slate-700">{proj.role}</span>
                          )}
                          {proj.location && (
                            <>
                              <span className="text-slate-300">•</span>
                              <span>{proj.location}</span>
                            </>
                          )}
                          {proj.durationMonths && (
                            <>
                              <span className="text-slate-300">•</span>
                              <span>{proj.durationMonths} Months Duration</span>
                            </>
                          )}
                        </div>

                        {proj.description && (
                          <p className="text-slate-600 leading-relaxed text-[11px] pt-1.5 border-t border-slate-200/60">
                            {proj.description}
                          </p>
                        )}
                      </div>
                    ))}

                    {/* Verified Platform Completed Assignments */}
                    {completedAssignments.map((assign, idx) => (
                      <div
                        key={`assign-${idx}`}
                        className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-2"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-bold text-slate-900 text-sm">
                              {assign.project?.projectName || 'RenewTech Deployment Project'}
                            </h4>
                            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded border border-emerald-200">
                              Verified Platform Project
                            </span>
                          </div>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            Completed
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600">
                          {assign.project?.projectType || 'Solar'} • {assign.project?.location || city}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Reviews Section (if any reviews exist from EPCs) */}
              {reviews.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                        <Star size={16} className="fill-amber-400 text-amber-400" />
                      </div>
                      <div>
                        <h2 className="text-sm font-bold text-slate-900">EPC Client Reviews</h2>
                        <p className="text-[11px] text-slate-500">
                          Verified feedback from project managers
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-slate-900 font-mono">
                        {rating.toFixed(1)}
                      </span>
                      <span className="text-[11px] text-slate-500 block">
                        ({reviews.length} reviews)
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {reviews.map((rev, idx) => (
                      <div
                        key={idx}
                        className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">
                            {rev.company?.name || 'Renewable EPC Partner'}
                          </span>
                          <div className="flex items-center gap-1 text-amber-500 font-bold">
                            <Star size={12} className="fill-amber-400 text-amber-400" />
                            <span>{rev.rating || 5.0}</span>
                          </div>
                        </div>
                        <p className="text-slate-600 italic">"{rev.comment}"</p>
                        {rev.project?.projectName && (
                          <span className="text-[10px] text-slate-400 block pt-1">
                            Project: {rev.project.projectName}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ================= RIGHT / SIDEBAR COLUMN (1 COL) ================= */}
            <div className="space-y-6">
              {/* SECTION 7: PROFILE COMPLETION CARD */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Profile Completion
                  </h3>
                  <span className="text-sm font-extrabold text-emerald-600 font-mono">
                    {profileCompletionPercent}%
                  </span>
                </div>

                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${profileCompletionPercent}%` }}
                  />
                </div>

                <p className="text-[11px] text-slate-500 leading-relaxed">
                  {profileCompletionPercent >= 80
                    ? 'Your profile is highly complete and prioritized in EPC search results.'
                    : 'Complete remaining items to improve your visibility to hiring EPC companies.'}
                </p>

                {/* Dynamic Checklist */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  {completionChecklist.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between text-xs py-1"
                    >
                      <div className="flex items-center gap-2">
                        {item.completed ? (
                          <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                            <Check size={11} className="stroke-[3]" />
                          </div>
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0" />
                        )}
                        <span
                          className={`${
                            item.completed
                              ? 'text-slate-400 line-through'
                              : 'text-slate-700 font-medium'
                          }`}
                        >
                          {item.label}
                        </span>
                      </div>

                      {!item.completed && isOwnProfile && (
                        <div>
                          {item.link ? (
                            <Link
                              to={item.link}
                              className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800"
                            >
                              Add
                            </Link>
                          ) : item.action ? (
                            <button
                              onClick={item.action}
                              className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 cursor-pointer"
                            >
                              Add
                            </button>
                          ) : null}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {isOwnProfile && profileCompletionPercent < 100 && (
                  <button
                    onClick={() => setEditProfileModalOpen(true)}
                    className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold transition-colors cursor-pointer text-center"
                  >
                    Complete Profile
                  </button>
                )}
              </div>

              {/* SECTION 8: PROFESSIONAL INFORMATION CARD */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Professional Information
                  </h3>
                  {isOwnProfile && (
                    <button
                      onClick={() => setEditProfileModalOpen(true)}
                      className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 cursor-pointer"
                    >
                      Edit
                    </button>
                  )}
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-[11px] text-slate-400 block font-medium">Full Name</span>
                    <span className="font-bold text-slate-800 mt-0.5 block">{name}</span>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-400 block font-medium">
                      Primary Trade
                    </span>
                    <span className="font-semibold text-slate-800 mt-0.5 block">{profession}</span>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-400 block font-medium">
                      Experience Level
                    </span>
                    <span className="font-semibold text-slate-800 mt-0.5 block">
                      {experienceYears} Years in Clean Energy
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-400 block font-medium">Location</span>
                    <span className="font-semibold text-slate-800 mt-0.5 block">
                      {city && state ? `${city}, ${state}` : 'Not provided'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-400 block font-medium">
                      Current Availability
                    </span>
                    <span className="font-semibold text-slate-800 mt-0.5 block">{availability}</span>
                  </div>

                  {expectedDailyRate && (
                    <div>
                      <span className="text-[11px] text-slate-400 block font-medium">
                        Expected Daily Rate
                      </span>
                      <span className="font-bold text-emerald-700 font-mono mt-0.5 block">
                        ₹{expectedDailyRate} / day
                      </span>
                    </div>
                  )}

                  {expectedMonthlyRate && (
                    <div>
                      <span className="text-[11px] text-slate-400 block font-medium">
                        Expected Monthly Rate
                      </span>
                      <span className="font-bold text-emerald-700 font-mono mt-0.5 block">
                        ₹{expectedMonthlyRate} / month
                      </span>
                    </div>
                  )}

                  {/* Contact info (masked or visible depending on permissions) */}
                  {(isOwnProfile || isCompany || isAdmin) && userData?.email && (
                    <div>
                      <span className="text-[11px] text-slate-400 block font-medium">
                        Verified Email
                      </span>
                      <span className="font-mono text-slate-700 mt-0.5 block break-all">
                        {userData.email}
                      </span>
                    </div>
                  )}

                  {(isOwnProfile || isCompany || isAdmin) && userData?.phone && (
                    <div>
                      <span className="text-[11px] text-slate-400 block font-medium">
                        Contact Phone
                      </span>
                      <span className="font-mono text-slate-700 mt-0.5 block">
                        {userData.phone}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* SECTION 10: SKILL PASSPORT CTA */}
              <div className="bg-slate-900 text-white rounded-xl p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
                    <QrCode size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Your Skill Passport</h3>
                    <p className="text-[11px] text-slate-400">
                      Your verified professional identity for EPC companies
                    </p>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Cryptographically verified, QR-enabled credential passport ready for rapid on-site
                  verification by EPC contractors.
                </p>

                <Link
                  to={isOwnProfile ? '/technician/skill-passport' : `/passport/${targetId}`}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors inline-flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <QrCode size={14} />
                  <span>View Skill Passport</span>
                </Link>
              </div>

              {/* Skill Assessments Overview (if available) */}
              {assessments.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-3 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Completed Assessments
                    </h3>
                    <Link
                      to="/technician/assessments"
                      className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800"
                    >
                      View All
                    </Link>
                  </div>

                  <div className="space-y-2">
                    {assessments.slice(0, 3).map((ass, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between"
                      >
                        <div className="min-w-0 pr-2">
                          <span className="font-bold text-slate-800 block truncate">
                            {ass.assessmentTitle || ass.title || 'Technical Assessment'}
                          </span>
                          <span className="text-[10px] text-slate-400 block">
                            {ass.category || 'Solar PV'}
                          </span>
                        </div>
                        <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 shrink-0">
                          {ass.score}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* ================= SECTION 9: EDIT PROFILE MODAL ================= */}
      {editProfileModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 border border-slate-200 shadow-xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Edit Technician Profile</h3>
                <p className="text-xs text-slate-500">
                  Update your professional details and workforce availability
                </p>
              </div>
              <button
                onClick={() => setEditProfileModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Primary Trade / Profession Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.profession}
                    onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                    placeholder="e.g. Certified Solar PV Wireman, Wind Turbine O&M Specialist"
                    className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg focus:outline-emerald-600 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Years of Experience *
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="45"
                    required
                    value={formData.yearsOfExperience}
                    onChange={(e) =>
                      setFormData({ ...formData, yearsOfExperience: Number(e.target.value) })
                    }
                    className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg focus:outline-emerald-600 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Current Availability *
                  </label>
                  <select
                    value={formData.currentAvailability}
                    onChange={(e) =>
                      setFormData({ ...formData, currentAvailability: e.target.value })
                    }
                    className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg focus:outline-emerald-600 text-slate-900"
                  >
                    <option value="Available">Available for Work</option>
                    <option value="On Project">On Project</option>
                    <option value="Unavailable">Unavailable</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="e.g. Prayagraj, Jaipur, Ahmedabad"
                    className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg focus:outline-emerald-600 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">State *</label>
                  <input
                    type="text"
                    required
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    placeholder="e.g. Uttar Pradesh, Rajasthan"
                    className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg focus:outline-emerald-600 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg focus:outline-emerald-600 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Expected Daily Rate (₹ INR)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={formData.expectedDailyRate}
                    onChange={(e) => setFormData({ ...formData, expectedDailyRate: e.target.value })}
                    placeholder="e.g. 1500"
                    className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg focus:outline-emerald-600 text-slate-900"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Preferred Work Locations (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.preferredWorkLocations}
                    onChange={(e) =>
                      setFormData({ ...formData, preferredWorkLocations: e.target.value })
                    }
                    placeholder="e.g. Uttar Pradesh, Rajasthan, Gujarat"
                    className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg focus:outline-emerald-600 text-slate-900"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Professional Bio & Experience Summary
                  </label>
                  <textarea
                    rows={4}
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Summarize your hands-on installation experience, certifications, major plant capacities, and safety compliance..."
                    className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg focus:outline-emerald-600 text-slate-900 leading-relaxed"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditProfileModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  {savingProfile ? (
                    <>
                      <RefreshCw size={13} className="animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save size={13} />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= ADD SKILL MODAL ================= */}
      {addSkillModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 border border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Add Technical Skill</h3>
                <p className="text-xs text-slate-500">
                  Add verified trade skills to your technician profile
                </p>
              </div>
              <button
                onClick={() => setAddSkillModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSkill} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Skill Name *
                </label>
                <input
                  type="text"
                  required
                  value={newSkill.name}
                  onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                  placeholder="e.g. PV Array Stringing, Inverter Maintenance, SCADA"
                  className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg focus:outline-emerald-600 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Sector Category *
                </label>
                <select
                  value={newSkill.category}
                  onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value })}
                  className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg focus:outline-emerald-600 text-slate-900"
                >
                  <option value="Solar">Solar Energy</option>
                  <option value="Wind">Wind Energy</option>
                  <option value="Other">Electrical / Clean Energy</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Proficiency Level *
                </label>
                <select
                  value={newSkill.proficiency}
                  onChange={(e) => setNewSkill({ ...newSkill, proficiency: e.target.value })}
                  className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg focus:outline-emerald-600 text-slate-900"
                >
                  <option value="Beginner">Beginner (1-2 years)</option>
                  <option value="Intermediate">Intermediate (2-4 years)</option>
                  <option value="Advanced">Advanced (4-7 years)</option>
                  <option value="Expert">Expert (7+ years)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAddSkillModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingSkill}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  {addingSkill ? (
                    <>
                      <RefreshCw size={13} className="animate-spin" />
                      <span>Adding...</span>
                    </>
                  ) : (
                    <>
                      <Plus size={13} />
                      <span>Add Skill</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= ADD PROJECT MODAL ================= */}
      {addProjectModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 border border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Add Project History</h3>
                <p className="text-xs text-slate-500">
                  Document your clean energy field installation experience
                </p>
              </div>
              <button
                onClick={() => setAddProjectModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddProject} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Project Title *
                </label>
                <input
                  type="text"
                  required
                  value={newProject.title}
                  onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                  placeholder="e.g. 50MW Rewa Solar Park Phase 2"
                  className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg focus:outline-emerald-600 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Technology Type *
                  </label>
                  <select
                    value={newProject.projectType}
                    onChange={(e) => setNewProject({ ...newProject, projectType: e.target.value })}
                    className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg focus:outline-emerald-600 text-slate-900"
                  >
                    <option value="Solar">Solar</option>
                    <option value="Wind">Wind</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Plant Capacity
                  </label>
                  <input
                    type="text"
                    value={newProject.capacity}
                    onChange={(e) => setNewProject({ ...newProject, capacity: e.target.value })}
                    placeholder="e.g. 500kW, 50MW"
                    className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg focus:outline-emerald-600 text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Your Role
                  </label>
                  <input
                    type="text"
                    value={newProject.role}
                    onChange={(e) => setNewProject({ ...newProject, role: e.target.value })}
                    placeholder="e.g. Lead Wireman, Inverter Technician"
                    className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg focus:outline-emerald-600 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={newProject.location}
                    onChange={(e) => setNewProject({ ...newProject, location: e.target.value })}
                    placeholder="e.g. Jodhpur, Rajasthan"
                    className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg focus:outline-emerald-600 text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Duration (Months)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newProject.durationMonths}
                    onChange={(e) =>
                      setNewProject({ ...newProject, durationMonths: Number(e.target.value) })
                    }
                    className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg focus:outline-emerald-600 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Completion Year
                  </label>
                  <input
                    type="number"
                    min="2010"
                    max={new Date().getFullYear()}
                    value={newProject.completionYear}
                    onChange={(e) =>
                      setNewProject({ ...newProject, completionYear: Number(e.target.value) })
                    }
                    className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg focus:outline-emerald-600 text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Scope of Work Performed
                </label>
                <textarea
                  rows={3}
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  placeholder="Describe your hands-on activities, safety protocols followed, commissioning checks, etc."
                  className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg focus:outline-emerald-600 text-slate-900 leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAddProjectModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingProject}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  {addingProject ? (
                    <>
                      <RefreshCw size={13} className="animate-spin" />
                      <span>Adding...</span>
                    </>
                  ) : (
                    <>
                      <Plus size={13} />
                      <span>Add Project</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= CONTACT MODAL (FOR EPC VIEW) ================= */}
      {contactModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 border border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Contact Technician</h3>
              <button
                onClick={() => setContactModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-400 block font-medium">Direct Phone</span>
                <span className="font-bold text-slate-800 text-sm mt-0.5 block">
                  {userData?.phone || 'Available upon shortlist'}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-400 block font-medium">Verified Email</span>
                <span className="font-bold text-slate-800 mt-0.5 block break-all">
                  {userData?.email || 'technician@renewtech.com'}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-400 block font-medium">Location Base</span>
                <span className="font-bold text-slate-800 mt-0.5 block">
                  {city && state ? `${city}, ${state}` : 'Location unconfirmed'}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setContactModalOpen(false)}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Authenticated Dashboard Layout wrapper
  if (isAuthenticated && (isTechnician || isCompany || isAdmin)) {
    return (
      <div className="min-h-screen bg-slate-50 flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
          <Header
            title="Technician Profile"
            subtitle={`${name} • Verified Clean Energy Talent`}
            onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          />
          <main className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto flex-1">
            {profileContent}
          </main>
        </div>
      </div>
    );
  }

  // Public / Unauthenticated Layout wrapper
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        {profileContent}
      </main>
      <Footer />
    </div>
  );
};

export default TechnicianProfilePage;
