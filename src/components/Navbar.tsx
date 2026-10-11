'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ShieldAlert,
  MapPin,
  LifeBuoy,
  Users,
  Home,
  Bot,
  HeartHandshake,
  Activity,
  Truck,
  ChevronDown,
  UserCheck,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/lib/types';
import NotificationBell from './notifications/NotificationBell';

export default function Navbar() {
  const pathname = usePathname();
  const { user, role, switchRole } = useAuth();
  const [isRoleOpen, setIsRoleOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/map', label: 'Live Map', icon: MapPin },
    { href: '/shelters', label: 'Shelter Finder', icon: Home },
    { href: '/dashboard/volunteer', label: 'Volunteer', icon: Users, badge: 'Tasks' },
    { href: '/dashboard/ngo', label: 'NGO Depot', icon: Truck },
    { href: '/dashboard/admin', label: 'Admin Command', icon: Activity },
    { href: '/distribution', label: 'Relief Tracking', icon: Truck },
    { href: '/donations', label: 'Donations', icon: HeartHandshake },
  ];

  const rolesList: { role: UserRole; title: string; desc: string }[] = [
    { role: 'citizen', title: 'Citizen / Victim', desc: 'SOS Broadcast & Safe Shelters' },
    { role: 'volunteer', title: 'Volunteer Worker', desc: 'Mission Assignments & Check-in' },
    { role: 'ngo', title: 'NGO Logistics Lead', desc: 'Relief Distribution Tracking' },
    { role: 'admin', title: 'Incident Commander', desc: 'Command Analytics & Dispatch' },
  ];

  const userName = user?.displayName || user?.name || 'User';

  return (
    <nav className="glass-panel border-b border-slate-800 sticky top-[37px] z-40 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-2.5 group">
              <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 via-rose-600 to-amber-600 p-0.5 shadow-lg shadow-red-950/40 group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <ShieldAlert className="w-5 h-5 text-red-500 group-hover:text-red-400 transition" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping-slow" />
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
          <div className="hidden xl:flex items-center space-x-1">
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

            {/* Persona Switcher Dropdown */}
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
                  <div className="text-[11px] font-semibold leading-tight text-white truncate max-w-[90px]">
                    {userName.split(' ')[0]}
                  </div>
                  <div className="text-[9px] font-mono text-cyan-400 uppercase">{role}</div>
                </div>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {/* Dropdown Menu */}
              {isRoleOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl glass-panel-elevated p-2 shadow-2xl z-50 border border-slate-700 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-2.5 py-1.5 border-b border-slate-800 mb-1">
                    <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">Active Persona</p>
                    <p className="text-xs text-white font-bold">{userName}</p>
                    <p className="text-[10px] text-cyan-400 truncate">{user?.organization || 'General Public'}</p>
                  </div>

                  {rolesList.map((r) => {
                    const isSelected = r.role === role;
                    return (
                      <button
                        key={r.role}
                        onClick={() => {
                          switchRole(r.role);
                          setIsRoleOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left text-xs transition mb-0.5 ${
                          isSelected
                            ? 'bg-cyan-950/70 text-cyan-300 border border-cyan-500/30'
                            : 'hover:bg-slate-800/70 text-slate-300'
                        }`}
                      >
                        <div>
                          <div className="font-bold flex items-center gap-1.5 text-white">
                            <span>{r.title}</span>
                          </div>
                          <div className="text-[10px] text-slate-400">{r.desc}</div>
                        </div>
                        {isSelected && <UserCheck className="w-4 h-4 text-cyan-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="xl:hidden border-t border-slate-800 py-3 px-1 space-y-1">
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
          </div>
        )}
      </div>
    </nav>
  );
}
