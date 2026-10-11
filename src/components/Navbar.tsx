'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ShieldAlert,
  MapPin,
  Home,
  Users,
  Activity,
  HeartHandshake,
  Truck,
  LifeBuoy,
  ChevronDown,
  UserCheck,
  Menu,
  X,
  Flame,
  Building2,
  Lock,
  User,
  Settings,
  LogOut,
  Sparkles,
  Bot,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/lib/types';
import NotificationBell from './notifications/NotificationBell';

export default function Navbar() {
  const pathname = usePathname();
  const { user, role, switchRole, logout, isAuthenticated } = useAuth();
  const [isRoleOpen, setIsRoleOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  interface NavLinkItem {
    href: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }

  // Dynamic role dashboard target
  const getRoleDashboard = (userRole: string): NavLinkItem => {
    switch (userRole) {
      case 'admin':
        return { href: '/dashboard/admin', label: 'Admin Command', icon: Activity };
      case 'government':
        return { href: '/dashboard/government', label: 'Civil Defense', icon: Building2 };
      case 'ngo':
        return { href: '/dashboard/ngo', label: 'NGO Logistics', icon: Truck };
      case 'rescue_team':
      case 'volunteer':
      case 'responder':
        return { href: '/dashboard/rescue', label: 'Rescue Ops', icon: Flame };
      case 'citizen':
      default:
        return { href: '/dashboard/citizen', label: 'Citizen Safety', icon: LifeBuoy };
    }
  };

  const currentDashboard = getRoleDashboard(role);

  // Nav links: Dynamically shows the user's authorized role dashboard and common public pages
  const navLinks: NavLinkItem[] = [
    { href: '/map', label: 'Live Map', icon: MapPin },
    { href: '/shelters', label: 'Shelter Finder', icon: Home },
    { href: '/ai-copilot', label: 'AI Copilot', icon: Bot, badge: 'Gemini' },
    ...(isAuthenticated ? [currentDashboard] : []),
    { href: '/distribution', label: 'Relief Tracking', icon: Truck },
    { href: '/donations', label: 'Donations', icon: HeartHandshake },
  ];

  const rolesList: { role: UserRole; title: string; desc: string }[] = [
    { role: 'citizen', title: 'Citizen', desc: 'SOS Broadcast & Safe Shelters' },
    { role: 'rescue_team', title: 'Rescue Team', desc: 'Tactical SAR & Mission Check-in' },
    { role: 'ngo', title: 'NGO Logistics', desc: 'Depot Stock & Relief Convoys' },
    { role: 'government', title: 'Government', desc: 'Civil Defense & CAP Cell Alerts' },
    { role: 'admin', title: 'Incident Commander', desc: 'Full ICS-400 Operations & RBAC' },
  ];

  const userName = user?.displayName || user?.name || (isAuthenticated ? 'Personnel' : 'Guest');

  return (
    <nav className="glass-panel border-b border-slate-800 sticky top-0 z-40 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-2.5 group">
              <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 via-rose-600 to-amber-600 p-0.5 shadow-lg shadow-red-950/40 group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <ShieldAlert className="w-5 h-5 text-red-500 group-hover:text-red-400 transition" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
              </div>
              <div>
                <span className="text-xl font-black tracking-tight text-white flex items-center gap-1">
                  Relief<span className="text-red-500">AI</span>
                </span>
                <span className="hidden sm:block text-[9px] font-mono tracking-widest text-slate-400 uppercase -mt-1">
                  Autonomous Crisis OS
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    isActive
                      ? 'bg-slate-800 text-cyan-400 border border-cyan-500/30 shadow-sm shadow-cyan-500/10'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-gradient-to-r from-cyan-600 to-blue-600 text-white">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center space-x-2.5">
            {/* SOS Dispatch Button */}
            <Link
              href="/sos"
              className="relative group overflow-hidden rounded-xl p-px font-semibold text-xs transition active:scale-95 shadow-md shadow-red-950"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 animate-pulse" />
              <span className="relative flex items-center space-x-1.5 bg-red-700 hover:bg-red-600 px-3.5 py-2 rounded-[11px] text-white transition">
                <LifeBuoy className="w-4 h-4" />
                <span className="font-black tracking-wide uppercase text-[11px]">SOS REPORT</span>
              </span>
            </Link>

            {/* Notification Bell */}
            <NotificationBell />

            {/* Authenticated User Menu or Sign In */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsRoleOpen(!isRoleOpen)}
                  className="flex items-center space-x-2 bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 text-slate-200 px-3 py-1.5 rounded-xl text-xs font-medium transition"
                >
                  <div className="w-6 h-6 rounded-full bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-bold text-[10px]">
                    {role.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="text-left hidden md:block">
                    <div className="text-[11px] font-semibold leading-tight text-white truncate max-w-[100px]">
                      {userName.split(' ')[0]}
                    </div>
                    <div className="text-[9px] font-mono text-cyan-400 uppercase">{role}</div>
                  </div>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {isRoleOpen && (
                  <div className="absolute right-0 mt-2 w-72 rounded-2xl glass-panel-elevated p-2 shadow-2xl z-50 border border-slate-700 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-2 border-b border-slate-800 mb-2">
                      <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">Active Session</p>
                      <p className="text-xs text-white font-bold">{userName}</p>
                      <p className="text-[10px] text-cyan-400 truncate">{user?.organization || 'General Public'}</p>
                    </div>

                    {/* Links to Profile and Settings */}
                    <div className="space-y-1 pb-2 border-b border-slate-800 mb-2">
                      <Link
                        href={currentDashboard.href}
                        onClick={() => setIsRoleOpen(false)}
                        className="flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-slate-800/80 transition"
                      >
                        <currentDashboard.icon className="w-3.5 h-3.5 text-cyan-400" />
                        <span>My Dashboard ({currentDashboard.label})</span>
                      </Link>
                      <Link
                        href="/profile"
                        onClick={() => setIsRoleOpen(false)}
                        className="flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-slate-800/80 transition"
                      >
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>Personnel Profile</span>
                      </Link>
                      <Link
                        href="/settings"
                        onClick={() => setIsRoleOpen(false)}
                        className="flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-slate-800/80 transition"
                      >
                        <Settings className="w-3.5 h-3.5 text-slate-400" />
                        <span>Security & Passwords</span>
                      </Link>
                    </div>

                    {/* Switch Demo Persona */}
                    <p className="text-[9px] font-mono text-slate-400 uppercase px-2.5 mb-1 font-semibold">
                      Fast RBAC Role Switch (Testing)
                    </p>
                    <div className="space-y-0.5 max-h-48 overflow-y-auto">
                      {rolesList.map((r) => {
                        const isSelected = r.role === role;
                        return (
                          <button
                            key={r.role}
                            onClick={() => {
                              switchRole(r.role);
                              setIsRoleOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-left text-xs transition ${
                              isSelected
                                ? 'bg-cyan-950/70 text-cyan-300 border border-cyan-500/30'
                                : 'hover:bg-slate-800/70 text-slate-300'
                            }`}
                          >
                            <div>
                              <div className="font-bold text-white text-[11px]">{r.title}</div>
                              <div className="text-[9px] text-slate-400">{r.desc}</div>
                            </div>
                            {isSelected && <UserCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>

                    {/* Logout */}
                    <div className="pt-2 border-t border-slate-800 mt-2">
                      <button
                        onClick={() => {
                          setIsRoleOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-xl text-xs text-red-400 hover:bg-red-950/50 hover:text-red-300 transition"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out of Platform</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/auth/login"
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/register"
                  className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-xs font-bold text-white transition shadow-md shadow-cyan-950"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-800 py-3 px-1 space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-2.5 px-3 py-2 rounded-xl text-sm font-medium transition ${
                    isActive ? 'bg-slate-800 text-cyan-400' : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4 text-cyan-400" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
            {isAuthenticated ? (
              <div className="pt-2 border-t border-slate-800 space-y-1">
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-sm text-slate-300 hover:bg-slate-800/60"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  <span>Personnel Profile</span>
                </Link>
                <Link
                  href="/settings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-sm text-slate-300 hover:bg-slate-800/60"
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                  <span>Security & Settings</span>
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-sm text-red-400 hover:bg-red-950/40"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="pt-2 border-t border-slate-800 flex gap-2 px-2">
                <Link
                  href="/auth/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 py-2 text-center rounded-xl bg-slate-800 text-white text-xs font-semibold"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 py-2 text-center rounded-xl bg-cyan-600 text-white text-xs font-bold"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
