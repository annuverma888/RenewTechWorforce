import React, { useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Compass,
  FileText,
  User,
  FileCheck,
  Award,
  ShieldCheck,
  History,
  Settings,
  LogOut,
  PlusCircle,
  Briefcase,
  Users,
  CheckCircle2,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ isOpen = false, onClose = () => {} }) => {
  const navigate = useNavigate();
  const { user, isTechnician, isCompany, isAdmin, logout } = useAuth();

  // Handle escape key and prevent body scrolling when drawer is open on mobile
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = originalOverflow;
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, onClose]);

  const handleLogout = async () => {
    onClose();
    await logout();
    navigate('/login');
  };

  const technicianLinks = [
    { to: '/technician/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/technician/recommended', label: 'Find Projects', icon: Compass },
    { to: '/technician/applications', label: 'Applications', icon: FileText },
    { to: '/technician/profile', label: 'Skill Profile', icon: User },
    { to: '/technician/certificates', label: 'Certificates', icon: FileCheck },
    { to: '/technician/assessments', label: 'Skill Assessment', icon: Award },
    { to: '/technician/skill-passport', label: 'Skill Passport', icon: ShieldCheck },
    { to: '/technician/profile#work-history', label: 'Work History', icon: History },
    { to: '/technician/profile', label: 'Settings', icon: Settings },
  ];

  const epcLinks = [
    { to: '/epc/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/epc/post-project', label: 'Post Project', icon: PlusCircle },
    { to: '/epc/dashboard#projects', label: 'My Projects', icon: Briefcase },
    { to: '/epc/technicians', label: 'Find Technicians', icon: Compass },
    { to: '/epc/applications', label: 'Applications', icon: FileText },
    { to: '/epc/workforce', label: 'Workforce', icon: Users },
    { to: '/epc/workforce#completed', label: 'Completed Projects', icon: CheckCircle2 },
    { to: '/epc/dashboard#settings', label: 'Settings', icon: Settings },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/certificates', label: 'Pending Certificates', icon: FileCheck },
    { to: '/admin/technicians', label: 'Technicians', icon: Users },
    { to: '/admin/companies', label: 'EPC Companies', icon: Briefcase },
    { to: '/projects', label: 'All Projects', icon: Compass },
  ];

  const currentLinks = isTechnician
    ? technicianLinks
    : isCompany
    ? epcLinks
    : isAdmin
    ? adminLinks
    : [];

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden transition-opacity duration-300"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 max-w-[85vw] sm:w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        } border-r border-slate-800`}
        aria-label="Navigation Sidebar"
      >
        {/* Sidebar Header */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold shadow-xs">
              ⚡
            </div>
            <div>
              <span className="font-extrabold text-white text-sm tracking-tight block">
                RenewTech
              </span>
              <span className="block text-[9px] uppercase tracking-wider text-emerald-400 font-semibold">
                {isTechnician ? 'Technician Portal' : isCompany ? 'EPC Portal' : 'Admin Panel'}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close sidebar navigation"
          >
            <X size={20} />
          </button>
        </div>

        {/* User Mini Profile */}
        <div className="p-3 mx-3 my-3 bg-slate-800/80 rounded-xl border border-slate-700/60 flex items-center gap-3 shrink-0">
          <img
            src={
              user?.profilePhoto ||
              `https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || 'User'}&backgroundColor=059669`
            }
            alt={user?.name || 'User'}
            className="w-10 h-10 rounded-xl object-cover border border-slate-700 shrink-0"
          />
          <div className="overflow-hidden min-w-0">
            <h4 className="text-xs font-bold text-white truncate">{user?.name}</h4>
            <p className="text-[10px] text-emerald-400 truncate capitalize font-medium">
              {user?.role === 'epc_company' ? 'EPC Contractor' : user?.role}
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto py-2">
          {currentLinks.map((item, idx) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={idx}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) => {
                  const isCurrent =
                    isActive ||
                    (item.to === '/technician/skill-passport' &&
                      typeof window !== 'undefined' &&
                      window.location.pathname.includes('/technician/passport'));
                  return `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold min-h-[42px] transition-colors ${
                    isCurrent
                      ? 'bg-emerald-600 text-white font-bold shadow-xs'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
                  }`;
                }}
              >
                <Icon size={18} className="shrink-0" />
                <span className="truncate">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer Logout */}
        <div className="p-3 border-t border-slate-800 shrink-0">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl min-h-[42px] transition-colors cursor-pointer"
          >
            <LogOut size={16} className="shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
