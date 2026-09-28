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
  Download,
  Bookmark,
  BookmarkCheck,
  Edit,
  Save,
  Clock,
  History,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { technicianAPI } from '../../services/api';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import RatingStars from '../../components/common/RatingStars';

const TechnicianProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: authUser, profile: authProfile, isTechnician, isAuthenticated, updateProfileState } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isShortlisted, setIsShortlisted] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Form State for editing
  const [formData, setFormData] = useState({
    profession: '',
    yearsOfExperience: 4,
    currentAvailability: 'Available',
    city: '',
    state: '',
    bio: '',
    phone: '',
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const targetId = id || authUser?._id || authUser?.id;
  const isOwnProfile = !id || id === authUser?._id || id === authUser?.id;

  const fetchProfile = async () => {
    try {
      setLoading(true);
      if (isOwnProfile && authProfile) {
        setProfileData(authProfile);
        setUserData(authUser);
        setFormData({
          profession: authProfile.profession || 'Solar Technician',
          yearsOfExperience: authProfile.yearsOfExperience || 4,
          currentAvailability: authProfile.currentAvailability || 'Available',
          city: authProfile.city || 'Lucknow',
          state: authProfile.state || 'UP',
          bio: authProfile.bio || '',
          phone: authUser?.phone || '+91 98761 11222',
        });
      } else if (targetId) {
        const res = await technicianAPI.getById(targetId);
        if (res.data?.success) {
          const d = res.data.data;
          setProfileData(d.profile || d);
          setUserData(d.user || d);
        }
      }
    } catch (err) {
      console.error('Error fetching technician profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [targetId, authProfile]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await technicianAPI.updateProfile(formData);
      if (res.data?.success) {
        updateProfileState({ ...profileData, ...formData });
        setProfileData((prev) => ({ ...prev, ...formData }));
        setIsEditing(false);
        showToast('Profile updated successfully!');
      }
    } catch (err) {
      showToast('Error saving profile changes.');
    }
  };

  // Default values matching Section 10
  const name = userData?.name || 'Rahul Kumar';
  const profession = profileData?.profession || 'Solar Technician';
  const city = profileData?.city || 'Lucknow';
  const state = profileData?.state || 'UP';
  const experienceYears = profileData?.yearsOfExperience || 4;
  const availability = profileData?.currentAvailability || 'Available';
  const rating = profileData?.averageRating || 4.9;
  const skillScore = profileData?.overallSkillScore || 87;

  // Exact 5 skill bars as per specification
  const skillsWithScores = [
    { name: 'Solar Installation', score: 94 },
    { name: 'Electrical', score: 91 },
    { name: 'Maintenance', score: 88 },
    { name: 'Safety', score: 96 },
    { name: 'Project Management', score: 85 },
  ];

  // Certificates list
  const certificatesList = [
    { name: 'Solar PV Installer (Level 4 - NSDC)', issuer: 'National Skill Development Corp', status: 'Verified' },
    { name: 'High-Voltage Electrical Safety & LOTO Protocol', issuer: 'Clean Energy Safety Council', status: 'Verified' },
    { name: 'Wind Turbine Maintenance & Rigging', issuer: 'Global Wind Academy', status: 'Verified' },
  ];

  // Work History
  const workHistoryList = [
    { title: '150MW Rewa Ultra Mega Solar Park', year: '2025', role: 'Lead PV Systems Installer', desc: 'Managed string inverter arrays, DC combiner cabling, and ground-fault protection testing.' },
    { title: '50MW Jaisalmer Wind Project', year: '2024', role: 'Turbine O&M Technician', desc: 'Conducted scheduled preventive maintenance, generator brush inspection, and nacelle electrical checks.' },
  ];

  // Completed Projects
  const completedProjectsList = [
    { name: 'Bhadla Solar Park Phase IV (100MW)', role: 'Electrical Commissioning Specialist', duration: '6 Months', status: 'Completed' },
    { name: 'Pavagada Solar Park Grid Tie (50MW)', role: 'PV String Inverter Technician', duration: '4 Months', status: 'Completed' },
    { name: 'Gujarat Hybrid Wind-Solar Facility (25MW)', role: 'Field Maintenance Specialist', duration: '5 Months', status: 'Completed' },
  ];

  // Ratings & Reviews
  const reviewsList = [
    { reviewer: 'Tata Power Renewable EPC', project: 'Rewa Solar Park', rating: 5.0, comment: 'Exceptional technical execution, zero safety infractions on high-voltage connections.', date: 'Jan 2026' },
    { reviewer: 'Adani Green Energy Ltd', project: 'Jaisalmer Wind Facility', rating: 4.8, comment: 'Punctual, highly skilled in inverter diagnostics and mechanical torque inspection.', date: 'Oct 2025' },
  ];

  const profilePhotoUrl =
    userData?.profilePhoto ||
    `https://api.dicebear.com/7.x/initials/svg?seed=${name}&backgroundColor=059669`;

  const profileContent = (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Profile Card */}
      <div className="bg-white rounded-xl p-4 sm:p-8 border border-slate-200 shadow-2xs space-y-6">
        {/* Header: Profile Photo, Name, Profession, Verified Badge, Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <img
              src={profilePhotoUrl}
              alt={name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-emerald-500 shadow-xs shrink-0"
            />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">{name}</h1>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 size={12} /> Verified
                </span>
              </div>
              <p className="text-sm font-semibold text-slate-600 mt-1">{profession}</p>

              {/* Location, Experience, Availability, Rating */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mt-2.5 text-xs text-slate-600">
                <span className="flex items-center gap-1">
                  <MapPin size={13} className="text-slate-400" />
                  <span>{city}, {state}</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Briefcase size={13} className="text-slate-400" />
                  <span>{experienceYears} Years Experience</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 font-semibold text-emerald-700">
                  <Clock size={13} className="text-emerald-600" />
                  <span>{availability}</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-amber-600 font-bold">
                  <Star size={13} className="fill-amber-400 text-amber-400" />
                  <span>{rating.toFixed(1)} / 5.0</span>
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons: Download Skill Passport, Contact, Shortlist */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Link
              to={isOwnProfile ? '/technician/skill-passport' : `/passport/${targetId}`}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-2xs transition-colors flex items-center gap-1.5"
            >
              <Download size={14} />
              <span>Download Skill Passport</span>
            </Link>

            <button
              onClick={() => setContactModalOpen(true)}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Phone size={14} />
              <span>Contact</span>
            </button>

            {!isOwnProfile ? (
              <button
                onClick={() => {
                  setIsShortlisted(!isShortlisted);
                  showToast(!isShortlisted ? `Shortlisted ${name}!` : `Removed ${name} from shortlist.`);
                }}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
                  isShortlisted
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                    : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {isShortlisted ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
                <span>{isShortlisted ? 'Shortlisted' : 'Shortlist'}</span>
              </button>
            ) : (
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Edit size={14} />
                <span>{isEditing ? 'Cancel Edit' : 'Edit Profile'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Skill Score Metric */}
        <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Skill Score
            </span>
            <div className="text-3xl font-extrabold text-emerald-600 font-mono mt-1">
              {skillScore}%
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Standardized assessment & field performance rating
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <Award size={24} />
          </div>
        </div>

        {/* Edit Form if toggled */}
        {isEditing && (
          <form onSubmit={handleSaveProfile} className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Update Profile Details
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Profession Title</label>
                <input
                  type="text"
                  value={formData.profession}
                  onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                  className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg focus:outline-emerald-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Years of Experience</label>
                <input
                  type="number"
                  value={formData.yearsOfExperience}
                  onChange={(e) => setFormData({ ...formData, yearsOfExperience: Number(e.target.value) })}
                  className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg focus:outline-emerald-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg focus:outline-emerald-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">State</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg focus:outline-emerald-600"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold"
              >
                Save Changes
              </button>
            </div>
          </form>
        )}

        {/* 5 Required Skill Bars */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            Skill Competencies
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {skillsWithScores.map((sk, idx) => (
              <div key={idx} className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                  <span className="text-slate-800">{sk.name}</span>
                  <span className="text-emerald-700 font-bold font-mono">{sk.score}%</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${sk.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Verified Certificates Section */}
        <div className="pt-4 border-t border-slate-100">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            Verified Certificates
          </h3>
          <div className="space-y-2">
            {certificatesList.map((cert, idx) => (
              <div
                key={idx}
                className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <ShieldCheck size={18} className="text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-semibold text-slate-900 block">{cert.name}</span>
                    <span className="text-[11px] text-slate-500">{cert.issuer}</span>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200 shrink-0">
                  ✓ Verified
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Work History Section */}
        <div id="work-history" className="pt-4 border-t border-slate-100">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            Work History
          </h3>
          <div className="space-y-3">
            {workHistoryList.map((hist, idx) => (
              <div
                key={idx}
                className="p-4 bg-slate-50 rounded-lg border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{hist.title}</h4>
                  <p className="text-slate-600 mt-0.5">{hist.role} • {hist.desc}</p>
                </div>
                <span className="font-mono font-bold text-slate-600 bg-white px-2.5 py-1 rounded border border-slate-200 self-start sm:self-auto shrink-0">
                  {hist.year}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Completed Projects Section */}
        <div className="pt-4 border-t border-slate-100">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            Completed Projects
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {completedProjectsList.map((proj, idx) => (
              <div key={idx} className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
                <span className="font-bold text-slate-900 block line-clamp-1">{proj.name}</span>
                <span className="text-[11px] text-slate-500 block">{proj.role}</span>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-400 font-mono">{proj.duration}</span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                    Completed
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ratings & Reviews Section */}
        <div className="pt-4 border-t border-slate-100">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            Ratings & Reviews
          </h3>
          <div className="space-y-3">
            {reviewsList.map((rev, idx) => (
              <div key={idx} className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{rev.reviewer}</span>
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star size={13} className="fill-amber-400 text-amber-400" />
                    <span className="font-bold text-slate-800">{rev.rating.toFixed(1)}</span>
                  </div>
                </div>
                <p className="text-slate-600 italic">"{rev.comment}"</p>
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span>Project: {rev.project}</span>
                  <span>{rev.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact Modal */}
      {contactModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 border border-slate-200 shadow-xl space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Contact Technician</h3>
              <button
                onClick={() => setContactModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-400 block font-medium">Direct Phone</span>
                <span className="font-bold text-slate-800 text-sm mt-0.5 block">+91 98761 11222</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-400 block font-medium">Verified Email</span>
                <span className="font-bold text-slate-800 mt-0.5 block">{userData?.email || 'rahul.kumar@gmail.com'}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-400 block font-medium">Current Location</span>
                <span className="font-bold text-slate-800 mt-0.5 block">{city}, {state}</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setContactModalOpen(false)}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

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
