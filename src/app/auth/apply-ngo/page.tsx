'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Truck,
  Building,
  Mail,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Upload,
  Globe,
  MapPin,
  ShieldCheck,
  ArrowLeft,
} from 'lucide-react';
import { HeroAmbientBeams } from '@/components/ui/hero-ambient-beams';
import { FadeIn } from '@/components/ui/motion-wrapper';

const BANGLADESH_DISTRICTS = [
  'Sylhet (সিলেট)',
  'Sunamganj (সুনামগঞ্জ)',
  'Kurigram (কুড়িগ্রাম)',
  'Chittagong (চট্টগ্রাম)',
  'Cox\'s Bazar (কক্সবাজার)',
  'Netrokona (নেত্রকোণা)',
  'Barisal (বরিশাল)',
  'Satkhira (সাতক্ষীরা)',
  'Sirajganj (সিরাজগঞ্জ)',
  'Dhaka Division (ঢাকা)',
];

const CAPABILITIES = [
  'Water Purification & Filtration (পানি বিশুদ্ধকরণ)',
  'Emergency Food Rations & Dry Food (জরুরি খাদ্য ও শুকনো খাবার)',
  'Mobile Medical Clinics & Trauma Care (ভ্রাম্যমাণ চিকিৎসা দল)',
  'Zodiac Speedboats & Water Extraction (উদ্ধারকারী স্পিডবোট)',
  'Shelter Management & Winter Kits (আশ্রয়কেন্দ্র ও শীতবস্ত্র)',
  'Infant Nutrition & Hygiene Kits (শিশু খাদ্য ও স্বাস্থ্য সুরক্ষা সামগ্রী)',
];

export default function ApplyNGOPage() {
  const [orgName, setOrgName] = useState('');
  const [regNumber, setRegNumber] = useState('');
  const [focalName, setFocalName] = useState('');
  const [focalEmail, setFocalEmail] = useState('');
  const [focalPhone, setFocalPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [hqAddress, setHqAddress] = useState('');
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>(['Sylhet (সিলেট)', 'Sunamganj (সুনামগঞ্জ)']);
  const [selectedCapabilities, setSelectedCapabilities] = useState<string[]>([
    'Water Purification & Filtration (পানি বিশুদ্ধকরণ)',
    'Emergency Food Rations & Dry Food (জরুরি খাদ্য ও শুকনো খাবার)',
  ]);
  const [documentName, setDocumentName] = useState('NGOAB_Registration_Certificate_2025.pdf');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{ applicationId: string; orgName: string } | null>(null);

  const toggleDistrict = (district: string) => {
    setSelectedDistricts((prev) =>
      prev.includes(district) ? prev.filter((d) => d !== district) : [...prev, district]
    );
  };

  const toggleCapability = (cap: string) => {
    setSelectedCapabilities((prev) =>
      prev.includes(cap) ? prev.filter((c) => c !== cap) : [...prev, cap]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (selectedDistricts.length === 0) {
      setError('Please select at least one operational district in Bangladesh.');
      return;
    }

    if (selectedCapabilities.length === 0) {
      setError('Please select at least one relief capability.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/ngo-apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationName: orgName,
          registrationNumber: regNumber,
          focalPersonName: focalName,
          focalPersonEmail: focalEmail,
          focalPersonPhone: focalPhone,
          website,
          hqAddress,
          operationalDistricts: selectedDistricts,
          reliefCapabilities: selectedCapabilities,
          documentName,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to submit NGO application.');
        setLoading(false);
        return;
      }

      setSuccessData({
        applicationId: data.applicationId,
        orgName,
      });
    } catch {
      setError('Network error submitting application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadSampleData = () => {
    setOrgName('Bangladesh Humanitarian Disaster Alliance (BHDA)');
    setRegNumber('NGOAB-DH-2025-9921');
    setFocalName('Kamrul Ahsan (Executive Director)');
    setFocalEmail('contact@bhda-relief.org');
    setFocalPhone('+880 1712-889900');
    setWebsite('https://bhda-relief.org');
    setHqAddress('House 42, Road 11, Banani, Dhaka-1213');
    setDocumentName('BHDA_NGO_Affairs_Bureau_License_2025.pdf');
    setError(null);
  };

  return (
    <FadeIn className="relative max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      {/* Light Ambient Beams Atmosphere */}
      <HeroAmbientBeams className="opacity-70" />

      {/* Header */}
      <div className="relative z-10 text-center space-y-2">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs text-blue-800 uppercase shadow-xs font-bold">
          <Truck className="w-3.5 h-3.5 text-blue-600" />
          <span>গণপ্রজাতন্ত্রী বাংলাদেশ • NGO LOGISTICS ACCREDITATION</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Apply for NGO Logistics Accreditation
        </h1>
        <span className="block text-teal-700 font-bangla text-xl sm:text-2xl font-bold">
          জাতীয় দুর্যোগ ত্রাণ নেটওয়ার্কে এনজিও নিবন্ধন আবেদন
        </span>
        <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
          Humanitarian organizations and relief charities must complete official administrative accreditation. Upon verification, official portal credentials and activation OTP codes are dispatched.
        </p>
      </div>

      {successData ? (
        <div className="relative z-10 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/90 space-y-6 text-center shadow-xs">
          <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-emerald-600">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <h2 className="text-2xl font-extrabold text-slate-900">Application Submitted Successfully!</h2>
            <p className="text-xs sm:text-sm text-slate-600">
              The accreditation application for <strong>{successData.orgName}</strong> has been registered in the National EOC verification queue.
            </p>
          </div>

          {/* Reference ID card */}
          <div className="p-5 rounded-2xl bg-blue-50/70 border border-blue-200 text-left max-w-lg mx-auto space-y-2">
            <div className="text-xs uppercase text-blue-700 font-bold">Official Application Reference ID</div>
            <div className="text-xl font-extrabold font-mono text-slate-900">{successData.applicationId}</div>
            <p className="text-xs text-slate-600">
              A confirmation email has been dispatched to your focal email address. Our Command Verification officers review credentials within 24–48 hours.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 max-w-lg mx-auto text-xs text-left text-slate-600 space-y-1">
            <div className="font-bold text-slate-800">What happens after approval?</div>
            <div>• An official NGO Logistics account will be created by Command Administration.</div>
            <div>• An activation email containing your temporary password and a 6-digit verification code (OTP) will be dispatched.</div>
            <div>• You will verify your email on first sign in to gain full access to the Relief Mesh distribution system.</div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link
              href="/"
              className="py-3 px-6 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs uppercase tracking-wider transition"
            >
              Return to Home
            </Link>
            <Link
              href="/auth/login"
              className="py-3 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider transition shadow-xs"
            >
              Go to Sign In
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="relative z-10 bg-white p-6 sm:p-9 rounded-3xl border border-slate-200/90 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">Institutional Application Form</h2>
              <p className="text-xs text-slate-500">Provide legal registration details from NGO Affairs Bureau or Social Welfare</p>
            </div>
            <button
              type="button"
              onClick={loadSampleData}
              className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold transition flex items-center space-x-1 cursor-pointer"
            >
              <span>Autofill Sample NGO</span>
            </button>
          </div>

          {error && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center space-x-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Organization Details */}
          <div className="space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center space-x-2">
              <Building className="w-4 h-4 text-blue-600" />
              <span>1. Organization Identification</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Official Organization Name</label>
                <input
                  type="text"
                  required
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="e.g. Bangladesh Red Crescent Society / BRAC"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 shadow-xs transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">NGOAB / Government License Number</label>
                <input
                  type="text"
                  required
                  value={regNumber}
                  onChange={(e) => setRegNumber(e.target.value)}
                  placeholder="e.g. NGOAB-REG-2024-889"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 shadow-xs transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Headquarters Address in Bangladesh</label>
                <input
                  type="text"
                  required
                  value={hqAddress}
                  onChange={(e) => setHqAddress(e.target.value)}
                  placeholder="e.g. Red Crescent Sarak, Bara Moghbazar, Dhaka"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 shadow-xs transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Official Website (Optional)</label>
                <div className="relative">
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="e.g. https://bdrcs.org"
                    className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 shadow-xs transition"
                  />
                  <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Authorized Focal Person */}
          <div className="space-y-4 pt-2">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center space-x-2">
              <Mail className="w-4 h-4 text-blue-600" />
              <span>2. Authorized Focal Person & Contact Details</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Focal Officer Name</label>
                <input
                  type="text"
                  required
                  value={focalName}
                  onChange={(e) => setFocalName(e.target.value)}
                  placeholder="e.g. Farhana Huq (Director)"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 shadow-xs transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Official Email Address</label>
                <input
                  type="email"
                  required
                  value={focalEmail}
                  onChange={(e) => setFocalEmail(e.target.value)}
                  placeholder="e.g. relief.director@bdrcs.org"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 shadow-xs transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Emergency Phone Number</label>
                <input
                  type="tel"
                  required
                  value={focalPhone}
                  onChange={(e) => setFocalPhone(e.target.value)}
                  placeholder="e.g. +880 1912-003344"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 shadow-xs transition"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Operational Districts */}
          <div className="space-y-2.5 pt-2">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span>3. Primary Operational Districts in Bangladesh</span>
            </div>
            <p className="text-xs text-slate-500">Select regions where your relief units are active or warehouse depots are stationed:</p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {BANGLADESH_DISTRICTS.map((dist) => {
                const isSelected = selectedDistricts.includes(dist);
                return (
                  <button
                    key={dist}
                    type="button"
                    onClick={() => toggleDistrict(dist)}
                    className={`p-2.5 rounded-xl border text-left text-xs font-medium transition flex items-center space-x-2 cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50 border-blue-300 text-blue-900 font-bold'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${
                      isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 bg-white'
                    }`}>
                      {isSelected && '✓'}
                    </span>
                    <span className="truncate">{dist}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 4: Relief Capabilities */}
          <div className="space-y-2.5 pt-2">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              <span>4. Relief Logistics & Field Capabilities</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {CAPABILITIES.map((cap) => {
                const isSelected = selectedCapabilities.includes(cap);
                return (
                  <button
                    key={cap}
                    type="button"
                    onClick={() => toggleCapability(cap)}
                    className={`p-2.5 rounded-xl border text-left text-xs transition flex items-center space-x-2 cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${
                      isSelected ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 bg-white'
                    }`}>
                      {isSelected && '✓'}
                    </span>
                    <span className="truncate">{cap}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 5: Supporting Document Upload */}
          <div className="space-y-2 pt-2">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center space-x-2">
              <FileCheck className="w-4 h-4 text-blue-600" />
              <span>5. Supporting Accreditation Document (NGOAB / Social Welfare)</span>
            </div>

            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-4 text-center hover:border-blue-400 transition bg-slate-50">
              <Upload className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <div className="text-xs font-bold text-slate-800">
                Attached Document: <span className="font-mono text-blue-700">{documentName}</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                PDF, DOCX, or scanned certificate (Max 15MB). Sample verification certificate loaded.
              </p>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="btn-shine w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-extrabold text-xs uppercase tracking-wider transition shadow-xs flex items-center justify-center space-x-2 cursor-pointer"
            >
              {loading ? (
                <span>Submitting Accreditation Application...</span>
              ) : (
                <>
                  <span>Submit Application for Administrative Verification</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          <div className="text-center pt-2 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-center space-x-1">
            <Link href="/auth/register" className="text-slate-600 hover:text-slate-900 inline-flex items-center space-x-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Citizen Registration</span>
            </Link>
          </div>
        </form>
      )}
    </FadeIn>
  );
}
