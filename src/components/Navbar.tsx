'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  MapPin,
  Home,
  Truck,
  LifeBuoy,
  ChevronDown,
  Menu,
  X,
  Flame,
  Building2,
  Activity,
  User,
  Settings,
  LogOut,
  Bot,
  Waves,
  HeartHandshake,
  AlertOctagon,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import NotificationBell from './notifications/NotificationBell';

interface NavLinkItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

export default function Navbar() {
  const pathname = usePathname();
  const { user, role, logout, isAuthenticated } = useAuth();
  const [isRoleOpen, setIsRoleOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  // All 7 primary navigation links + dynamic role dashboard
  const navLinks: NavLinkItem[] = [
    { href: '/map', label: 'Tactical Map', icon: MapPin },
    { href: '/shelters', label: 'Shelters', icon: Home },
    { href: '/environment', label: 'River Watch', icon: Waves },
    { href: '/ai-copilot', label: 'AI Copilot', icon: Bot, badge: 'AI' },
    {
      href: isAuthenticated ? currentDashboard.href : '/dashboard/citizen',
      label: isAuthenticated ? currentDashboard.label : 'Citizen Safety',
      icon: isAuthenticated ? currentDashboard.icon : LifeBuoy,
    },
    { href: '/distribution', label: 'Relief Mesh', icon: Truck },
    { href: '/donations', label: 'Donations', icon: HeartHandshake },
  ];

  const userName = user?.displayName || user?.name || (isAuthenticated ? 'Personnel' : 'Guest');

  return (
    <nav
      aria-label="Main Navigation"
      className="bg-white border-b border-slate-200/90 sticky top-0 z-40 shadow-xs text-slate-800"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo with AgroVenture / Relief AI Official Shield Logo */}
          <div className="flex items-center space-x-3 shrink-0">
            <Link
              href="/"
              className="flex items-center space-x-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-xl"
              aria-label="Relief AI Bangladesh Homepage"
            >
              <div className="relative w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 p-1 flex items-center justify-center shadow-xs group-hover:border-blue-400 group-hover:bg-blue-100 transition-all">
                <Image
                  src="/favicon-logo.png"
                  alt="Relief AI National Shield Emblem"
                  width={32}
                  height={32}
                  priority
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="text-lg font-black tracking-tight text-slate-900 leading-none">
                    Relief<span className="text-blue-600">AI</span>
                  </span>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 border border-blue-200">
                    BD
                  </span>
                </div>
                <span className="hidden sm:block text-[9px] font-bangla text-teal-700 font-bold tracking-wide">
                  জাতীয় দুর্যোগ ও উদ্ধার প্ল্যাটফর্ম
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden xl:flex items-center space-x-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-bold border border-blue-100'
                      : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className="text-[9px] font-mono font-bold px-1 py-0.2 rounded bg-blue-100 text-blue-700 border border-blue-200">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center space-x-2.5">
            {/* SOS Dispatch Action Button */}
            <Link
              href="/sos"
              id="navbar-sos-button"
              className="flex items-center space-x-1.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white px-3.5 py-2 rounded-xl font-bold text-xs uppercase tracking-wider transition shadow-xs focus-visible:ring-2 focus-visible:ring-red-500"
            >
              <AlertOctagon className="w-4 h-4 text-white animate-pulse" aria-hidden="true" />
              <span>SOS REPORT</span>
            </Link>

            {/* Notification Bell */}
            <NotificationBell />

            {/* Authenticated User Menu or Sign In */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsRoleOpen(!isRoleOpen)}
                  aria-expanded={isRoleOpen}
                  aria-label="User profile and role menu"
                  className="flex items-center space-x-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 px-2.5 py-1.5 rounded-xl text-xs font-medium transition shadow-xs"
                >
                  <div className="w-6 h-6 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 font-bold text-[10px]">
                    {role.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="text-left hidden lg:block">
                    <div className="text-[11px] font-bold leading-tight text-slate-900 truncate max-w-[90px]">
                      {userName.split(' ')[0]}
                    </div>
                    <div className="text-[9px] font-mono text-blue-600 uppercase font-semibold">{role}</div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {isRoleOpen && (
                  <div className="absolute right-0 mt-2 w-72 rounded-2xl p-2.5 shadow-xl z-50 border border-slate-200 bg-white text-slate-900 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-3 py-2 border-b border-slate-100 mb-2">
                      <p className="text-[10px] font-mono text-blue-600 uppercase tracking-wider font-semibold">Active Session</p>
                      <p className="text-xs text-slate-900 font-bold">{userName}</p>
                      <p className="text-[10px] text-teal-700 font-medium truncate">{user?.organization || 'Registered Personnel'}</p>
                    </div>

                    <div className="space-y-1 pb-2 border-b border-slate-100 mb-2">
                      <Link
                        href={currentDashboard.href}
                        onClick={() => setIsRoleOpen(false)}
                        className="flex items-center space-x-2 px-2.5 py-1.5 rounded-xl text-xs text-slate-700 hover:text-blue-700 hover:bg-blue-50 transition"
                      >
                        <currentDashboard.icon className="w-3.5 h-3.5 text-blue-600" />
                        <span>My Dashboard ({currentDashboard.label})</span>
                      </Link>
                      <Link
                        href="/profile"
                        onClick={() => setIsRoleOpen(false)}
                        className="flex items-center space-x-2 px-2.5 py-1.5 rounded-xl text-xs text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition"
                      >
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>Personnel Profile</span>
                      </Link>
                      <Link
                        href="/settings"
                        onClick={() => setIsRoleOpen(false)}
                        className="flex items-center space-x-2 px-2.5 py-1.5 rounded-xl text-xs text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition"
                      >
                        <Settings className="w-3.5 h-3.5 text-slate-400" />
                        <span>Account Settings</span>
                      </Link>
                    </div>

                    <div className="pt-2 border-t border-slate-100 mt-2">
                      <button
                        onClick={() => {
                          logout();
                          setIsRoleOpen(false);
                        }}
                        className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-xl text-xs text-red-600 hover:bg-red-50 font-semibold transition"
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
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:text-blue-600 hover:bg-slate-50 border border-slate-200 transition"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/register"
                  className="hidden sm:inline-flex px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition shadow-xs"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-2 shadow-lg">
          <div className="grid grid-cols-2 gap-2 pb-3 border-b border-slate-100">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-2 p-2.5 rounded-xl text-xs font-semibold ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-bold border border-blue-100'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-500'}`} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <Link
              href="/sos"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-red-600 text-white font-bold text-xs uppercase"
            >
              <AlertOctagon className="w-4 h-4" />
              <span>Broadcast Emergency SOS (জরুরি সাহায্য)</span>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
