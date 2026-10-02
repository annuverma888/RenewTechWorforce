import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, ChevronDown, Check, Clock, AlertCircle, User, ShieldCheck, LogOut, LayoutDashboard, Users, Building } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { technicianAPI } from '../../services/api';
import NotificationDropdown from './NotificationDropdown';
import Badge from './Badge';

const Header = ({ title = 'Dashboard', subtitle = '', onMenuToggle, onMenuClick }) => {
  const navigate = useNavigate();
  const handleMenuToggle = onMenuToggle || onMenuClick || (() => {});
  const { user, profile, isTechnician, isCompany, isAdmin, updateProfileState, logout } = useAuth();
  const [availabilityDropdown, setAvailabilityDropdown] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [updatingAvail, setUpdatingAvail] = useState(false);

  const availDropdownRef = useRef(null);
  const profileDropdownRef = useRef(null);

  // Close dropdowns when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (availDropdownRef.current && !availDropdownRef.current.contains(e.target)) {
        setAvailabilityDropdown(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target)) {
        setProfileMenuOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setAvailabilityDropdown(false);
        setProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleProfileLogout = async () => {
    setProfileMenuOpen(false);
    await logout();
    navigate('/login');
  };

  const currentAvail = profile?.currentAvailability || 'Available';

  const handleUpdateAvailability = async (newStatus) => {
    try {
      setUpdatingAvail(true);
      setAvailabilityDropdown(false);
      const res = await technicianAPI.updateAvailability(newStatus);
      if (res.data.success) {
        updateProfileState({ ...profile, currentAvailability: newStatus });
      }
    } catch (err) {
      console.error('Failed to update availability:', err);
    } finally {
      setUpdatingAvail(false);
    }
  };

  const availConfig = {
    Available: {
      color: 'bg-emerald-500 text-white ring-emerald-300',
      badge: 'available',
      label: 'Available',
      icon: Check,
    },
    'On Project': {
      color: 'bg-blue-600 text-white ring-blue-300',
      badge: 'onProject',
      label: 'On Project',
      icon: Clock,
    },
    Unavailable: {
      color: 'bg-slate-500 text-white ring-slate-300',
      badge: 'unavailable',
      label: 'Unavailable',
      icon: AlertCircle,
    },
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-3 sm:px-8 py-2.5 sm:py-3 flex items-center justify-between w-full max-w-full">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          type="button"
          onClick={handleMenuToggle}
          className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
          aria-label="Toggle navigation menu"
        >
          <Menu size={22} />
        </button>
        <div className="min-w-0">
          <h1 className="text-base sm:text-2xl font-black text-slate-900 tracking-tight truncate max-w-[140px] xs:max-w-[220px] sm:max-w-none">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-slate-500 hidden sm:block mt-0.5 font-medium truncate">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Right: Actions, Availability Toggle & Notifications */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        {/* Availability Toggle for Technicians */}
        {isTechnician && (
          <div className="relative" ref={availDropdownRef}>
            <button
              type="button"
              onClick={() => setAvailabilityDropdown(!availabilityDropdown)}
              disabled={updatingAvail}
              className="flex items-center gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-bold border border-slate-200 bg-white hover:bg-slate-50 shadow-2xs transition-all cursor-pointer"
              title="Change deployment availability status"
            >
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${
                  currentAvail === 'Available'
                    ? 'bg-emerald-500 animate-pulse'
                    : currentAvail === 'On Project'
                    ? 'bg-blue-500'
                    : 'bg-slate-400'
                }`}
              />
              <span className="hidden md:inline text-slate-700">Status:</span>
              <span className="text-[11px] sm:text-xs text-slate-800 font-semibold truncate max-w-[80px] sm:max-w-none">
                {currentAvail}
              </span>
              <ChevronDown size={13} className="text-slate-400 shrink-0" />
            </button>

            {availabilityDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in duration-100">
                <div className="px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                  Set Deployment Status
                </div>
                {['Available', 'On Project', 'Unavailable'].map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => handleUpdateAvailability(status)}
                    className="w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-slate-50 font-medium text-slate-700 transition-colors cursor-pointer"
                  >
                    <span>{status}</span>
                    {currentAvail === status && (
                      <Check size={14} className="text-emerald-600 font-bold" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <NotificationDropdown />

        {/* Profile Avatar Pill with Dropdown Menu */}
        <div className="relative" ref={profileDropdownRef}>
          <button
            type="button"
            onClick={() => setProfileMenuOpen(!profileMenuOpen)}
            className="flex items-center gap-1.5 sm:gap-2 pl-1 sm:pl-2 border-l border-slate-200 cursor-pointer hover:opacity-90 transition-opacity"
            aria-label="User profile menu"
          >
            <img
              src={
                user?.profilePhoto ||
                `https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || 'User'}&backgroundColor=059669`
              }
              alt={user?.name || 'User'}
              className="w-8 h-8 rounded-full ring-2 ring-emerald-500/20 object-cover shrink-0"
            />
            <div className="hidden sm:block text-left">
              <span className="block text-xs font-bold text-slate-800 leading-tight">
                {user?.name?.split(' ')[0] || 'User'}
              </span>
              <span className="block text-[10px] font-semibold text-emerald-600 uppercase tracking-wider">
                {user?.role === 'technician' ? 'Technician' : user?.role === 'epc_company' ? 'EPC' : user?.role === 'admin' ? 'Admin' : 'Member'}
              </span>
            </div>
            <ChevronDown size={14} className="text-slate-400 hidden sm:block shrink-0" />
          </button>

          {profileMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in duration-100">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900 truncate">{user?.name}</p>
                <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                <div className="mt-1">
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider">
                    {user?.role === 'technician' ? 'Technician' : user?.role === 'epc_company' ? 'EPC Contractor' : 'System Admin'}
                  </span>
                </div>
              </div>

              <div className="py-1">
                {isTechnician && (
                  <Link
                    to="/technician/profile"
                    onClick={() => setProfileMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium"
                  >
                    <User size={14} className="text-slate-400" />
                    <span>Profile</span>
                  </Link>
                )}
                {isTechnician && (
                  <Link
                    to="/technician/skill-passport"
                    onClick={() => setProfileMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium"
                  >
                    <ShieldCheck size={14} className="text-slate-400" />
                    <span>Skill Passport</span>
                  </Link>
                )}
                {isCompany && (
                  <Link
                    to="/epc/dashboard"
                    onClick={() => setProfileMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium"
                  >
                    <LayoutDashboard size={14} className="text-slate-400" />
                    <span>Dashboard</span>
                  </Link>
                )}
                {isCompany && (
                  <Link
                    to="/epc/workforce"
                    onClick={() => setProfileMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium"
                  >
                    <Users size={14} className="text-slate-400" />
                    <span>Active Workforce</span>
                  </Link>
                )}
                {isAdmin && (
                  <Link
                    to="/admin/dashboard"
                    onClick={() => setProfileMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium"
                  >
                    <LayoutDashboard size={14} className="text-slate-400" />
                    <span>Admin Dashboard</span>
                  </Link>
                )}
                {isAdmin && (
                  <Link
                    to="/admin/certificates"
                    onClick={() => setProfileMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium"
                  >
                    <ShieldCheck size={14} className="text-slate-400" />
                    <span>Certificate Audits</span>
                  </Link>
                )}
                {isAdmin && (
                  <Link
                    to="/admin/technicians"
                    onClick={() => setProfileMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium"
                  >
                    <Users size={14} className="text-slate-400" />
                    <span>Technicians</span>
                  </Link>
                )}
                {isAdmin && (
                  <Link
                    to="/admin/companies"
                    onClick={() => setProfileMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium"
                  >
                    <Building size={14} className="text-slate-400" />
                    <span>EPC Companies</span>
                  </Link>
                )}
              </div>

              <div className="pt-1 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleProfileLogout}
                  className="w-full flex items-center gap-2 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                >
                  <LogOut size={14} />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
