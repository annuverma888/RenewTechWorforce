import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Zap,
  Menu,
  X,
  ArrowRight,
  LogOut,
  LayoutDashboard,
  ShieldCheck,
  Briefcase,
  Compass,
  User,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import NotificationDropdown from './NotificationDropdown';

const Navbar = () => {
  const { user, isAuthenticated, isTechnician, isCompany, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);

  const getDashboardRoute = useCallback(() => {
    if (user?.role === 'pending_role') return '/choose-role';
    if (isAdmin) return '/admin/dashboard';
    if (isCompany) return '/epc/dashboard';
    return '/technician/dashboard';
  }, [user?.role, isAdmin, isCompany]);

  const handleLogout = async () => {
    setMobileMenuOpen(false);
    await logout();
    navigate('/');
  };

  // Smooth scroll handler for section anchors and route navigation
  const handleNavClick = (e, target) => {
    e.preventDefault();
    setMobileMenuOpen(false);

    if (target.type === 'route') {
      navigate(target.path);
      return;
    }

    if (target.type === 'home') {
      if (location.pathname === '/') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        window.history.pushState(null, '', '/');
        setActiveSection('');
      } else {
        navigate('/');
      }
      return;
    }

    if (target.type === 'section') {
      const sectionId = target.id;
      if (location.pathname !== '/') {
        navigate(`/#${sectionId}`);
        setTimeout(() => {
          const el = document.getElementById(sectionId);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
          }
        }, 150);
      } else {
        const el = document.getElementById(sectionId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
          window.history.pushState(null, '', `#${sectionId}`);
          setActiveSection(sectionId);
        }
      }
    }
  };

  // Nav Items specification: Home, Jobs, Technicians, Skill Passport, About
  const navLinks = [
    {
      id: 'home',
      label: 'Home',
      type: 'home',
      path: '/',
      isActive: location.pathname === '/' && !activeSection,
    },
    {
      id: 'jobs',
      label: 'Jobs',
      type: 'route',
      path: '/projects',
      isActive: location.pathname.startsWith('/projects'),
    },
    {
      id: 'technicians',
      label: 'Technicians',
      type: 'section',
      idVal: 'technicians',
      path: '/#technicians',
      isActive: location.pathname === '/' && activeSection === 'technicians',
    },
    {
      id: 'skill-passport',
      label: 'Skill Passport',
      type: 'route',
      path: '/verify/skill-passport',
      isActive:
        location.pathname.startsWith('/verify/skill-passport') ||
        (location.pathname === '/' && activeSection === 'verified-skills'),
    },
    {
      id: 'about',
      label: 'About',
      type: 'section',
      idVal: 'how-it-works',
      path: '/#how-it-works',
      isActive: location.pathname === '/' && activeSection === 'how-it-works',
    },
  ];

  // Track scroll position & active section on landing page
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);

      if (location.pathname !== '/') {
        setActiveSection('');
        return;
      }

      const scrollPosition = window.scrollY + 140;
      const trackedSections = [
        'how-it-works',
        'why-renewtech',
        'technicians',
        'epc-companies',
        'verified-skills',
      ];

      let current = '';
      for (const id of trackedSections) {
        const element = document.getElementById(id);
        if (element) {
          const top = element.offsetTop;
          const height = element.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            current = id;
            break;
          }
        }
      }

      if (current) {
        setActiveSection(current);
      } else if (window.scrollY < 200) {
        setActiveSection('');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  // Lock body scroll when mobile drawer is open and handle Escape key
  useEffect(() => {
    if (mobileMenuOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          setMobileMenuOpen(false);
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = prevOverflow;
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [mobileMenuOpen]);

  const userDisplayName = user?.name ? user.name.split(' ')[0] : 'User';
  const userRoleLabel =
    user?.role === 'technician'
      ? 'Technician'
      : user?.role === 'epc_company'
      ? 'EPC Contractor'
      : user?.role === 'admin'
      ? 'Admin'
      : 'Member';

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-200 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs'
          : 'bg-white border-b border-slate-200/80 shadow-none'
      }`}
    >
      <nav
        className="renew-container h-16 sm:h-[68px] flex items-center justify-between"
        role="navigation"
        aria-label="Main Navigation"
      >
        {/* Left: RenewTech Workforce Brand Logo */}
        <Link
          to="/"
          onClick={(e) => {
            if (location.pathname === '/') {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
              setActiveSection('');
            }
          }}
          className="flex items-center gap-2.5 sm:gap-3 group min-w-0 focus-ring rounded-xl py-1"
          aria-label="RenewTech Workforce Home"
        >
          {/* Logo Badge with Clean Energy Zap SVG Icon */}
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-emerald-700 via-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-2xs transition-transform duration-200 group-hover:scale-105 shrink-0 ring-1 ring-emerald-500/20">
            <Zap size={19} className="fill-white/90 text-white" />
          </div>

          {/* Logo Brand Typography */}
          <div className="min-w-0">
            <span className="text-base sm:text-lg font-black tracking-tight text-slate-900 flex items-center gap-1 leading-tight truncate">
              RenewTech <span className="text-emerald-600 font-extrabold">Workforce</span>
            </span>
            <span className="hidden sm:block text-[9px] text-slate-500 font-semibold tracking-wider uppercase leading-none mt-0.5 truncate">
              Renewable Energy Talent Network
            </span>
          </div>
        </Link>

        {/* Center: Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-1 lg:gap-1.5 text-xs lg:text-sm font-semibold">
          {navLinks.map((item) => {
            const isCurrent = item.isActive;
            return (
              <button
                key={item.id}
                type="button"
                onClick={(e) =>
                  handleNavClick(e, {
                    type: item.type,
                    path: item.path,
                    id: item.idVal,
                  })
                }
                className={`relative px-3 py-1.5 rounded-xl transition-all duration-150 flex items-center gap-1.5 focus-ring cursor-pointer select-none ${
                  isCurrent
                    ? 'text-emerald-700 bg-emerald-50/90 font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 font-semibold'
                }`}
                aria-current={isCurrent ? 'page' : undefined}
              >
                {isCurrent && (
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0"
                    aria-hidden="true"
                  />
                )}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right: Authentication & Profile Actions */}
        <div className="hidden md:flex items-center gap-2.5 lg:gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-2 sm:gap-2.5">
              <NotificationDropdown />

              <Link
                to={getDashboardRoute()}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold border border-emerald-200/80 shadow-2xs transition-colors focus-ring"
              >
                <LayoutDashboard size={15} />
                <span>Dashboard</span>
              </Link>

              {/* User Profile Pill */}
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <img
                  src={
                    user?.profilePhoto ||
                    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                      user?.name || 'User'
                    )}&backgroundColor=059669`
                  }
                  alt={user?.name || 'User avatar'}
                  className="w-8 h-8 rounded-full border border-slate-200 object-cover ring-2 ring-emerald-500/10 shrink-0"
                />
                <div className="hidden lg:block text-left pr-1">
                  <span className="block text-xs font-bold text-slate-800 leading-tight truncate max-w-[100px]">
                    {userDisplayName}
                  </span>
                  <span className="block text-[10px] text-emerald-600 font-semibold leading-tight truncate">
                    {userRoleLabel}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  title="Sign out of account"
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer focus-ring"
                  aria-label="Logout"
                >
                  <LogOut size={16} />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors focus-ring"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-2xs hover:shadow transition-all focus-ring"
              >
                <span>Get Started</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu trigger */}
        <div className="flex md:hidden items-center gap-1.5">
          {isAuthenticated && <NotificationDropdown />}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl focus-ring transition-colors cursor-pointer"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {/* Mobile Navigation Drawer with AnimatePresence */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-xs md:hidden"
              aria-hidden="true"
            />

            {/* Mobile Drawer Content */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="relative z-50 md:hidden bg-white border-b border-slate-200/90 shadow-xl px-4 py-4 space-y-3"
            >
              {/* Primary Mobile Navigation Links */}
              <div className="space-y-1">
                {navLinks.map((item) => {
                  const isCurrent = item.isActive;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={(e) =>
                        handleNavClick(e, {
                          type: item.type,
                          path: item.path,
                          id: item.idVal,
                        })
                      }
                      className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center justify-between min-h-[44px] cursor-pointer focus-ring ${
                        isCurrent
                          ? 'text-emerald-700 bg-emerald-50 font-bold'
                          : 'text-slate-700 hover:text-emerald-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>{item.label}</span>
                      {isCurrent && (
                        <span className="w-2 h-2 rounded-full bg-emerald-600" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Mobile Auth Actions Strip */}
              <div className="pt-3 border-t border-slate-200/80">
                {isAuthenticated ? (
                  <div className="space-y-2">
                    {/* User Mini Banner */}
                    <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-50 border border-slate-200/70 mb-2">
                      <img
                        src={
                          user?.profilePhoto ||
                          `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                            user?.name || 'User'
                          )}&backgroundColor=059669`
                        }
                        alt={user?.name || 'User'}
                        className="w-9 h-9 rounded-full object-cover border border-slate-200"
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-800 truncate">
                          {user?.name}
                        </div>
                        <div className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider">
                          {userRoleLabel}
                        </div>
                      </div>
                    </div>

                    <Link
                      to={getDashboardRoute()}
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white font-bold rounded-xl text-xs sm:text-sm min-h-[44px] shadow-xs hover:bg-emerald-700 active:bg-emerald-800 transition-colors focus-ring"
                    >
                      <LayoutDashboard size={16} />
                      <span>Go to Dashboard</span>
                    </Link>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 text-rose-600 hover:bg-rose-50 rounded-xl text-xs sm:text-sm font-semibold min-h-[42px] transition-colors cursor-pointer focus-ring"
                    >
                      <LogOut size={16} />
                      <span>Logout</span>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full text-center px-4 py-2.5 min-h-[44px] flex items-center justify-center border border-slate-300 text-slate-700 font-bold rounded-xl text-xs hover:bg-slate-50 active:bg-slate-100 transition-colors focus-ring"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full text-center px-4 py-2.5 min-h-[44px] flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold rounded-xl text-xs shadow-2xs transition-colors focus-ring"
                    >
                      Get Started
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
