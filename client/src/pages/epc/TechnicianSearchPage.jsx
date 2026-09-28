import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
} from 'lucide-react';
import { technicianAPI } from '../../services/api';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';

const SKILLS_LIST = [
  'All',
  'Solar Installation',
  'PV Installation',
  'PV Wiring',
  'Electrical Safety',
  'Inverter Installation',
  'Solar O&M',
  'Wind Turbine Installation',
  'Turbine Maintenance',
  'Blade Inspection',
  'Tower Climbing',
];

const LOCATIONS = ['All', 'Lucknow', 'Kanpur', 'Noida', 'Bengaluru', 'Jaisalmer', 'Rajasthan', 'Uttar Pradesh'];

const TechnicianSearchPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [technicians, setTechnicians] = useState([]);
  const [shortlisted, setShortlisted] = useState({});
  const [contactTech, setContactTech] = useState(null);
  const [hireTech, setHireTech] = useState(null);

  // Search & Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('All');
  const [selectedExperience, setSelectedExperience] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [selectedCert, setSelectedCert] = useState('All');
  const [selectedAvailability, setSelectedAvailability] = useState('All');
  const [toastMessage, setToastMessage] = useState('');

  const fetchTechnicians = async () => {
    try {
      setLoading(true);
      const res = await technicianAPI.getAll();
      if (res.data?.success) {
        setTechnicians(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching technicians:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTechnicians();
  }, []);

  const handleToggleShortlist = (techId, techName) => {
    setShortlisted((prev) => {
      const next = !prev[techId];
      if (next) {
        setToastMessage(`Shortlisted ${techName}!`);
      } else {
        setToastMessage(`Removed ${techName} from shortlist.`);
      }
      setTimeout(() => setToastMessage(''), 3000);
      return { ...prev, [techId]: next };
    });
  };

  // Filter logic
  const filteredTechnicians = technicians.filter((tech) => {
    const prof = tech.profile || {};
    const u = tech.user || tech;
    const name = u.name || '';
    const skills = (prof.renewableSkills || []).map((s) => s.name);
    const city = prof.city || '';
    const state = prof.state || '';

    // Search query
    const matchesSearch =
      searchQuery === '' ||
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      state.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

    // Skill filter
    const matchesSkill =
      selectedSkill === 'All' ||
      skills.some((s) => s.toLowerCase().includes(selectedSkill.toLowerCase()));

    // Experience filter
    const exp = prof.yearsOfExperience || 0;
    const matchesExp =
      selectedExperience === 'All' || exp >= parseInt(selectedExperience, 10);

    // Location filter
    const matchesLoc =
      selectedLocation === 'All' ||
      city.toLowerCase().includes(selectedLocation.toLowerCase()) ||
      state.toLowerCase().includes(selectedLocation.toLowerCase());

    // Availability
    const matchesAvail =
      selectedAvailability === 'All' ||
      (prof.currentAvailability || 'Available') === selectedAvailability;

    return matchesSearch && matchesSkill && matchesExp && matchesLoc && matchesAvail;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Header
          title="Find Technicians"
          subtitle="Search and shortlist verified solar and wind talent"
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        />

        <main className="p-4 sm:p-6 lg:p-8 space-y-6 flex-1 max-w-7xl w-full mx-auto">
          {/* Toast Message */}
          {toastMessage && (
            <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* Search Bar & Filters */}
          <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
            {/* Search Input */}
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by skill, name or location"
                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-emerald-600 focus:bg-white"
              />
            </div>

            {/* Filter Dropdowns Grid */}
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 pt-1">
              {/* Skill */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Skill</label>
                <select
                  value={selectedSkill}
                  onChange={(e) => setSelectedSkill(e.target.value)}
                  className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-emerald-600"
                >
                  {SKILLS_LIST.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              {/* Experience */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Experience</label>
                <select
                  value={selectedExperience}
                  onChange={(e) => setSelectedExperience(e.target.value)}
                  className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-emerald-600"
                >
                  <option value="All">Any Experience</option>
                  <option value="1">1+ Years</option>
                  <option value="2">2+ Years</option>
                  <option value="4">4+ Years</option>
                </select>
              </div>

              {/* Location */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Location</label>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-emerald-600"
                >
                  {LOCATIONS.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>

              {/* Certification */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Certification</label>
                <select
                  value={selectedCert}
                  onChange={(e) => setSelectedCert(e.target.value)}
                  className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-emerald-600"
                >
                  <option value="All">All Certifications</option>
                  <option value="NSDC">NSDC Level 4</option>
                  <option value="SCGJ">SCGJ Certified</option>
                  <option value="GWO">GWO BST</option>
                </select>
              </div>

              {/* Availability */}
              <div className="col-span-1 xs:col-span-2 sm:col-span-1">
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Availability</label>
                <select
                  value={selectedAvailability}
                  onChange={(e) => setSelectedAvailability(e.target.value)}
                  className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-emerald-600"
                >
                  <option value="All">All Statuses</option>
                  <option value="Available">Available Now</option>
                  <option value="On Project">On Project</option>
                </select>
              </div>
            </div>
          </div>

          {/* Technicians Grid */}
          {loading ? (
            <div className="py-16 text-center text-xs text-slate-400">Loading technician roster...</div>
          ) : filteredTechnicians.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-xl border border-slate-200 text-xs text-slate-400">
              No technicians matched your search criteria. Try broadening your filters.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredTechnicians.map((item) => {
                const u = item.user || item;
                const prof = item.profile || {};
                const name = u.name || 'Rahul Kumar';
                const profession = prof.profession || 'Solar Technician';
                const city = prof.city || 'Lucknow';
                const state = prof.state || 'UP';
                const expYears = prof.yearsOfExperience || 4;
                const skillScore = prof.overallSkillScore || 87;
                const rating = prof.averageRating || 4.9;
                const availability = prof.currentAvailability || 'Available';
                const matchScore = 94; // 94% Match as specified
                const techSkills = (prof.renewableSkills || [
                  { name: 'Solar Installation' },
                  { name: 'PV Wiring' },
                  { name: 'Electrical Safety' },
                ]).slice(0, 3);
                const isShortlisted = shortlisted[u._id];

                return (
                  <div
                    key={u._id}
                    className="bg-white rounded-xl p-5 border border-slate-200 hover:border-emerald-400 shadow-2xs transition-colors flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      {/* Top Row: Name, Verified Badge, Match Score */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h3 className="text-base font-bold text-slate-900">{name}</h3>
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 flex items-center gap-1 shrink-0">
                              <CheckCircle2 size={10} /> Verified
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-slate-600 mt-0.5">{profession}</p>
                        </div>
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 shrink-0 font-mono">
                          {matchScore}% Match
                        </span>
                      </div>

                      {/* Location, Experience, Rating & Availability */}
                      <div className="text-xs text-slate-500 space-y-1">
                        <div className="flex items-center gap-1">
                          <MapPin size={12} className="text-slate-400 shrink-0" />
                          <span>{city}, {state}</span>
                          <span className="text-slate-300">•</span>
                          <span>{expYears} Years Exp</span>
                        </div>
                        <div className="flex items-center gap-3 pt-0.5">
                          <span className="flex items-center gap-1 text-amber-600 font-bold">
                            <Star size={12} className="fill-amber-400 text-amber-400" />
                            <span>{rating.toFixed(1)}</span>
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="text-emerald-700 font-semibold flex items-center gap-1">
                            <Clock size={11} className="text-emerald-600" />
                            <span>{availability}</span>
                          </span>
                        </div>
                      </div>

                      {/* Skills List */}
                      <div className="py-2.5 border-t border-b border-slate-100 space-y-1.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Skills:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {techSkills.map((sk, sIdx) => (
                            <span
                              key={sIdx}
                              className="text-[11px] font-medium bg-slate-50 text-slate-700 px-2 py-0.5 rounded border border-slate-200"
                            >
                              {sk.name || sk}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* 4 Action Buttons: View Profile, Shortlist, Contact, Hire */}
                    <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
                      <Link
                        to={`/technicians/${u._id}`}
                        className="py-1.5 px-2 text-center text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors flex items-center justify-center gap-1"
                      >
                        <Eye size={12} />
                        <span>View Profile</span>
                      </Link>

                      <button
                        onClick={() => handleToggleShortlist(u._id, name)}
                        className={`py-1.5 px-2 text-center text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer border ${
                          isShortlisted
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                        }`}
                      >
                        {isShortlisted ? <BookmarkCheck size={12} className="text-emerald-600" /> : <Bookmark size={12} />}
                        <span>{isShortlisted ? 'Shortlisted' : 'Shortlist'}</span>
                      </button>

                      <button
                        onClick={() => setContactTech({ name, email: u.email || `${name.toLowerCase().replace(' ', '.')}@email.com`, phone: '+91 98765 43210' })}
                        className="py-1.5 px-2 text-center text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Phone size={12} />
                        <span>Contact</span>
                      </button>

                      <button
                        onClick={() => setHireTech({ id: u._id, name, profession })}
                        className="py-1.5 px-2 text-center text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-2xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <UserCheck size={12} />
                        <span>Hire</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Contact Modal */}
          {contactTech && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-xl max-w-sm w-full p-6 border border-slate-200 shadow-xl space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="text-base font-bold text-slate-900">Direct Contact</h3>
                  <button onClick={() => setContactTech(null)} className="text-slate-400 hover:text-slate-600 p-1">
                    <X size={16} />
                  </button>
                </div>
                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-slate-400 block font-medium">Technician</span>
                    <span className="font-bold text-slate-900 text-sm mt-0.5 block">{contactTech.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Phone Number</span>
                    <span className="font-bold text-slate-900 text-sm mt-0.5 block">{contactTech.phone}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Verified Email</span>
                    <span className="font-medium text-slate-700 mt-0.5 block">{contactTech.email}</span>
                  </div>
                </div>
                <button
                  onClick={() => setContactTech(null)}
                  className="w-full py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700"
                >
                  Done
                </button>
              </div>
            </div>
          )}

          {/* Hire Modal */}
          {hireTech && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
              <div className="bg-white rounded-2xl max-w-sm w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6 border border-slate-200 shadow-xl space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="text-base font-bold text-slate-900">Mobilize & Hire</h3>
                  <button onClick={() => setHireTech(null)} className="text-slate-400 hover:text-slate-600 p-1">
                    <X size={16} />
                  </button>
                </div>
                <p className="text-xs text-slate-600">
                  Send a formal project assignment or offer to <strong>{hireTech.name}</strong> for upcoming renewable works.
                </p>
                <div className="space-y-2 text-xs">
                  <label className="block font-semibold text-slate-700">Select Project to Deploy</label>
                  <select className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                    <option>50MW Utility Solar Installation - Rewa</option>
                    <option>Commercial Rooftop PV 2MW - Kanpur</option>
                    <option>Wind Turbine Generator Maintenance - Jaisalmer</option>
                  </select>
                </div>
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    onClick={() => setHireTech(null)}
                    className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setHireTech(null);
                      setToastMessage(`Hire offer sent to ${hireTech.name}!`);
                      setTimeout(() => setToastMessage(''), 3500);
                    }}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700"
                  >
                    Confirm Hire Offer
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default TechnicianSearchPage;
