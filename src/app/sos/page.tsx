'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  MapPin,
  Camera,
  Upload,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Radio,
  Zap,
  Phone,
  RefreshCw,
  Plus,
  Minus,
  Navigation,
  AlertOctagon,
  User,
  HeartPulse,
} from 'lucide-react';
import { AIDamageAssessment, AISeverityClassification, SOSRequest } from '@/lib/types';
import { detectDamageWithAI } from '@/lib/gemini/damage-detection';
import { classifySeverityWithAI } from '@/lib/gemini/severity-classification';
import { uploadDisasterImage } from '@/lib/firebase/storage';
import { useNotifications } from '@/context/NotificationContext';
import { ASSETS } from '@/lib/assets';

const sosSchema = z.object({
  reporterName: z.string().min(2, 'আপনার নাম প্রদান করুন (Full name is required)'),
  contactPhone: z.string().min(7, 'সচল ফোন নম্বর দিন (Valid contact phone number required)'),
  address: z.string().min(5, 'নির্দিষ্ট অবস্থান বা ঠিকানা দিন (Specific location address required)'),
  disasterType: z.enum(['flood', 'earthquake', 'wildfire', 'hurricane', 'industrial', 'medical']),
  description: z.string().min(10, 'পরিস্থিতি ও তাৎক্ষণিক বিপদ বিস্তারিত লিখুন (Minimum 10 characters)'),
  trappedCount: z.number().min(0, 'সংখ্যা শূন্য বা তার বেশি হতে হবে'),
  injuredCount: z.number().min(0, 'সংখ্যা শূন্য বা তার বেশি হতে হবে'),
  needsBoat: z.boolean(),
  needsMedical: z.boolean(),
  needsFoodWater: z.boolean(),
});

type SOSFormData = {
  reporterName: string;
  contactPhone: string;
  address: string;
  disasterType: 'flood' | 'earthquake' | 'wildfire' | 'hurricane' | 'industrial' | 'medical';
  description: string;
  trappedCount: number;
  injuredCount: number;
  needsBoat: boolean;
  needsMedical: boolean;
  needsFoodWater: boolean;
};

export default function SOSReportPage() {
  const { addNotification } = useNotifications();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzingDamage, setIsAnalyzingDamage] = useState(false);
  const [aiDamage, setAiDamage] = useState<AIDamageAssessment | null>(null);
  const [aiSeverity, setAiSeverity] = useState<AISeverityClassification | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submittedReport, setSubmittedReport] = useState<SOSRequest | null>(null);

  // Real GPS state
  const [gpsStatus, setGpsStatus] = useState<'idle' | 'detecting' | 'success' | 'error'>('idle');
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsMessage, setGpsMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SOSFormData>({
    resolver: zodResolver(sosSchema),
    defaultValues: {
      reporterName: 'রফিকুল ইসলাম (Rafiqul Islam)',
      contactPhone: '+880 1712-345678',
      address: 'গ্রাম: লামাকাজী, গোয়াইনঘাট উপজেলা, সিলেট (Lamakazi, Gowainghat, Sylhet)',
      disasterType: 'flood',
      description: 'সুরমা নদীর পানি আকস্মিক বৃদ্ধি পেয়ে ঘরের চাল ছুঁয়েছে। বৃদ্ধা দাদি ও ছোট শিশু সহ ৬ জন আটকা পড়ে আছি। অবিলম্বে স্পিডবোট ও নিরাপদ উদ্ধার প্রয়োজন।',
      trappedCount: 6,
      injuredCount: 1,
      needsBoat: true,
      needsMedical: true,
      needsFoodWater: false,
    },
  });

  const formValues = watch();

  // Geolocation detector using real browser API
  const handleDetectGPS = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setGpsStatus('error');
      setGpsMessage('ব্রাউজারে Geolocation সমর্থিত নয়। অনুগ্রহ করে ম্যানুয়ালি ঠিকানা লিখুন।');
      return;
    }

    setGpsStatus('detecting');
    setGpsMessage('স্যাটেলাইট ও নেটওয়ার্ক থেকে সঠিক অবস্থান খোঁজা হচ্ছে...');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const accuracy = Math.round(pos.coords.accuracy);
        setGpsCoords({ lat, lng });
        setGpsStatus('success');
        setGpsMessage(`জিপিএস নির্ভুলতা: ±${accuracy} মিটার (${lat.toFixed(5)}°N, ${lng.toFixed(5)}°E)`);
        setValue(
          'address',
          `GPS স্থানাঙ্ক: ${lat.toFixed(5)}°N, ${lng.toFixed(5)}°E (${formValues.address.split('(')[0].trim() || 'সিলেট অঞ্চল'})`
        );
      },
      (err) => {
        setGpsStatus('error');
        if (err.code === err.PERMISSION_DENIED) {
          setGpsMessage('অবস্থান ব্যবহারের অনুমতি দেওয়া হয়নি। নিচে আপনার ঠিকানা ম্যানুয়ালি লিখুন।');
        } else if (err.code === err.TIMEOUT) {
          setGpsMessage('অবস্থান নির্ধারণে সময় শেষ হয়েছে। নিচে ঠিকানা লিখে ফর্ম জমা দিন।');
        } else {
          setGpsMessage('অবস্থান শনাক্ত করা যায়নি। অনুগ্রহ করে ঠিকানা লিখে দিন।');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      const preview = URL.createObjectURL(file);
      setImagePreview(preview);
      triggerAIDamageDetection(file, preview, formValues.description);
    }
  };

  const triggerAIDamageDetection = async (file: File, previewUrl: string, desc: string) => {
    setIsAnalyzingDamage(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        const damageResult = await detectDamageWithAI(desc, base64);
        setAiDamage(damageResult);

        const severityResult = await classifySeverityWithAI({
          description: desc,
          trappedCount: Number(formValues.trappedCount),
          injuredCount: Number(formValues.injuredCount),
          needsBoat: formValues.needsBoat,
          needsMedical: formValues.needsMedical,
        });
        setAiSeverity(severityResult);
        setIsAnalyzingDamage(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      setIsAnalyzingDamage(false);
    }
  };

  const handleSamplePhoto = async (type: 'flood' | 'fire' | 'rescue') => {
    let sampleDesc = '';
    let previewPath = '';

    if (type === 'flood') {
      sampleDesc = 'সুরমা নদী উপচে ৫ ফুট পানি প্রবেশ করেছে। বিদ্যুৎ বিচ্ছিন্ন ও খাবার পানি শেষ। পরিবারের ৬ জন চালের উপর আটকে আছেন।';
      previewPath = ASSETS.flood;
      setValue('disasterType', 'flood');
      setValue('needsBoat', true);
      setValue('needsMedical', true);
      setValue('trappedCount', 6);
    } else if (type === 'fire') {
      sampleDesc = 'চকবাজার রাসায়নিক গুদামে তীব্র অগ্নিকাণ্ড ও বিষাক্ত ধোঁয়া। সরু গলিতে ফায়ার সার্ভিসের গাড়ি প্রবেশ বিঘ্নিত। জরুরি উদ্ধারের জন্য ড্রোন ম্যাপিং প্রয়োজন।';
      previewPath = ASSETS.fireService;
      setValue('disasterType', 'industrial');
      setValue('needsBoat', false);
      setValue('needsMedical', true);
      setValue('trappedCount', 4);
    } else {
      sampleDesc = 'যমুনা নদীর চিলমারী ঘাটে প্রবল ভাঙন ও স্রোত। বাঁধ ভেঙে ১৫টি বসতভিটা তলিয়ে গেছে। স্পিডবোট উদ্ধারকারী দল প্রয়োজন।';
      previewPath = ASSETS.rescueOperation;
      setValue('disasterType', 'flood');
      setValue('needsBoat', true);
      setValue('needsMedical', false);
      setValue('trappedCount', 8);
    }

    setValue('description', sampleDesc);
    setImagePreview(previewPath);

    setIsAnalyzingDamage(true);
    try {
      const damageResult = await detectDamageWithAI(sampleDesc);
      const severityResult = await classifySeverityWithAI({
        description: sampleDesc,
        trappedCount: Number(formValues.trappedCount),
        injuredCount: Number(formValues.injuredCount),
        needsBoat: type === 'flood' || type === 'rescue',
        needsMedical: true,
      });
      setAiDamage(damageResult);
      setAiSeverity(severityResult);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzingDamage(false);
    }
  };

  const onSubmit = async (data: SOSFormData) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      let finalImageUrl = imagePreview || undefined;
      if (imageFile) {
        finalImageUrl = await uploadDisasterImage(imageFile);
      }

      const res = await fetch('/api/sos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reporterName: data.reporterName,
          phone: data.contactPhone,
          details: data.description,
          trappedCount: Number(data.trappedCount),
          injuriesCount: Number(data.injuredCount),
          needsBoat: data.needsBoat,
          needsMedical: data.needsMedical,
          needsFoodWater: data.needsFoodWater,
          disasterId: 'dis-001',
          imageUrl: finalImageUrl,
          location: {
            address: data.address,
            lat: gpsCoords?.lat || 25.0760,
            lng: gpsCoords?.lng || 91.9750,
          },
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Failed to submit SOS report.');
      }

      if (json.sos) {
        setSubmittedReport(json.sos);
        addNotification({
          targetRole: 'all',
          title: `CRITICAL SOS: ${data.reporterName} in ${data.address}`,
          message: `Priority: ${json.sos.priority}. Urgency: ${json.sos.urgencyScore}/100. Dispatched to SAR queue.`,
          type: 'urgent',
          link: '/map',
        });
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'জরুরি বার্তা পাঠাতে সমস্যা হয়েছে। অনুগ্রহ করে সরাসরি ৯৯৯ নম্বরে কল করুন।';
      setSubmitError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Severity color calculation
  const getSeverityBadge = (score?: number, level?: string) => {
    if (!score) return null;
    if (score >= 80) {
      return {
        bg: 'bg-rose-50 text-rose-800 border-rose-200',
        text: 'text-rose-600',
        bar: 'bg-rose-600',
        label: level || 'CRITICAL',
      };
    }
    if (score >= 60) {
      return {
        bg: 'bg-amber-50 text-amber-800 border-amber-200',
        text: 'text-amber-600',
        bar: 'bg-amber-500',
        label: level || 'HIGH',
      };
    }
    if (score >= 40) {
      return {
        bg: 'bg-sky-50 text-sky-800 border-sky-200',
        text: 'text-sky-600',
        bar: 'bg-sky-500',
        label: level || 'MODERATE',
      };
    }
    return {
      bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      text: 'text-emerald-600',
      bar: 'bg-emerald-500',
      label: level || 'LOW',
    };
  };

  const severityBadge = getSeverityBadge(aiSeverity?.score, aiSeverity?.level);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-700 text-xs font-semibold uppercase tracking-wider">
          <AlertOctagon className="w-3.5 h-3.5 text-red-600" aria-hidden="true" />
          <span>NATIONAL EMERGENCY SOS GATEWAY // বাংলাদেশ জাতীয় দুর্যোগ রেসপন্স</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Emergency SOS Incident Report
        </h1>
        <p className="text-slate-600 text-xs sm:text-sm max-w-2xl mx-auto font-normal">
          Broadcast your urgent situation for emergency rescue, evacuation, or medical trauma assistance. Reports are triaged via the Gemini AI analysis engine for rapid task force dispatch.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {submittedReport ? (
          /* Submission Success State */
          <motion.div
            key="success-card"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="p-6 sm:p-10 rounded-2xl border border-emerald-200 bg-white shadow-md space-y-6 text-slate-900"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-5 gap-4">
              <div className="space-y-1">
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  INCIDENT REGISTERED // ID: {submittedReport.id}
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  SOS Report Received & Transmitted to Dispatch Queue
                </h2>
                <p className="text-xs text-slate-600">
                  স্থান: <strong className="text-slate-800">{submittedReport.location.address}</strong>
                </p>
              </div>

              <div className="flex items-center space-x-3 bg-red-50 border border-red-200 px-4 py-2 rounded-xl">
                <div>
                  <div className="text-[10px] font-bold text-red-700 uppercase tracking-wider">TRIAGE SCORE</div>
                  <div className="text-lg font-extrabold text-red-700">
                    {submittedReport.priority} ({submittedReport.urgencyScore}/100)
                  </div>
                </div>
                <div className="w-3 h-3 rounded-full bg-red-600 animate-pulse" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <div className="text-xs text-slate-500 font-semibold flex items-center space-x-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Queue Status</span>
                </div>
                <div className="text-lg font-extrabold text-slate-900">
                  {submittedReport.status === 'dispatched' ? 'Unit En Route' : 'Pending Tactical Assignment'}
                </div>
                <div className="text-[11px] text-slate-500">Verified by MoDMR EOC</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <div className="text-xs text-slate-500 font-semibold flex items-center space-x-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span>Recommended Team Type</span>
                </div>
                <div className="text-sm font-bold text-slate-800 truncate">
                  {submittedReport.needsBoat ? 'Swift-Water Rescue (বোট ইউনিট)' : 'Land SAR / Trauma Unit'}
                </div>
                <div className="text-[11px] text-slate-500">FSCD / BDRCS Network</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <div className="text-xs text-slate-500 font-semibold flex items-center space-x-1.5">
                  <Radio className="w-3.5 h-3.5 text-emerald-600" />
                  <span>National Dispatch Net</span>
                </div>
                <div className="text-base font-mono font-bold text-emerald-700">FSCD VHF CH-16</div>
                <div className="text-[11px] text-slate-500">156.800 MHz Monitoring</div>
              </div>
            </div>

            {submittedReport.aiTriageSummary && (
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 space-y-1">
                <span className="font-bold text-blue-800 uppercase text-[10px] tracking-wider block">
                  AI Triage Assessment Summary:
                </span>
                <p className="leading-relaxed">{submittedReport.aiTriageSummary}</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => setSubmittedReport(null)}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition flex items-center gap-1.5"
              >
                ← Submit Another Emergency Report (আরেকটি রিপোর্ট করুন)
              </button>

              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <a
                  href="tel:999"
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-1.5 transition shadow-xs"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call 999 (জাতীয় জরুরি হটলাইন)</span>
                </a>
              </div>
            </div>
          </motion.div>
        ) : (
          /* Form Layout */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Form Column (7 Cols on Desktop) */}
            <div className="lg:col-span-7">
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-7 shadow-xs space-y-5"
                noValidate
              >
                {/* Section 1: Reporter Contact Details */}
                <div className="space-y-3 pb-4 border-b border-slate-100">
                  <div className="flex items-center space-x-2 text-slate-900">
                    <User className="w-4 h-4 text-blue-600" />
                    <h2 className="text-sm font-bold uppercase tracking-wider">
                      1. Reporter Information (প্রতিবেদকের তথ্য)
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <label htmlFor="reporterName" className="text-xs font-semibold text-slate-700">
                        আপনার পূর্ণ নাম (Full Name) <span className="text-red-600">*</span>
                      </label>
                      <input
                        id="reporterName"
                        {...register('reporterName')}
                        placeholder="e.g. রফিকুল ইসলাম"
                        className="w-full h-10 bg-white border border-slate-200 rounded-xl px-3.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition shadow-xs"
                      />
                      {errors.reporterName && (
                        <p className="text-[11px] text-red-600 font-medium">{errors.reporterName.message}</p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="contactPhone" className="text-xs font-semibold text-slate-700">
                        সচল ফোন নম্বর (Contact Phone) <span className="text-red-600">*</span>
                      </label>
                      <input
                        id="contactPhone"
                        type="tel"
                        {...register('contactPhone')}
                        placeholder="e.g. +880 1712-345678"
                        className="w-full h-10 bg-white border border-slate-200 rounded-xl px-3.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition shadow-xs"
                      />
                      {errors.contactPhone && (
                        <p className="text-[11px] text-red-600 font-medium">{errors.contactPhone.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Section 2: Physical Address & Real Geolocation */}
                <div className="space-y-3 pb-4 border-b border-slate-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-slate-900">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      <h2 className="text-sm font-bold uppercase tracking-wider">
                        2. Location & Coordinates (অবস্থান)
                      </h2>
                    </div>

                    <button
                      type="button"
                      onClick={handleDetectGPS}
                      disabled={gpsStatus === 'detecting'}
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:text-blue-600 hover:bg-slate-50 transition shadow-xs disabled:opacity-60"
                      aria-label="Detect current GPS location"
                    >
                      <Navigation className={`w-3.5 h-3.5 text-blue-600 ${gpsStatus === 'detecting' ? 'animate-spin' : ''}`} />
                      <span>{gpsStatus === 'detecting' ? 'জিপিএস খোঁজা হচ্ছে...' : 'Detect My Location'}</span>
                    </button>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="address" className="text-xs font-semibold text-slate-700">
                      নির্দিষ্ট অবস্থান বা গ্রাম/ইউনিয়ন/উপজেলা (Address Description) <span className="text-red-600">*</span>
                    </label>
                    <input
                      id="address"
                      {...register('address')}
                      placeholder="e.g. গ্রাম: লামাকাজী, গোয়াইনঘাট, সিলেট"
                      className="w-full h-10 bg-white border border-slate-200 rounded-xl px-3.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition shadow-xs"
                    />
                    {errors.address && (
                      <p className="text-[11px] text-red-600 font-medium">{errors.address.message}</p>
                    )}
                  </div>

                  {gpsMessage && (
                    <div
                      className={`p-2.5 rounded-xl text-xs flex items-center space-x-2 ${
                        gpsStatus === 'success'
                          ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                          : gpsStatus === 'error'
                          ? 'bg-amber-50 border border-amber-200 text-amber-800'
                          : 'bg-slate-50 border border-slate-200 text-slate-700'
                      }`}
                    >
                      {gpsStatus === 'success' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      )}
                      <span>{gpsMessage}</span>
                    </div>
                  )}
                </div>

                {/* Section 3: Disaster Category & Description */}
                <div className="space-y-3 pb-4 border-b border-slate-100">
                  <div className="flex items-center space-x-2 text-slate-900">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <h2 className="text-sm font-bold uppercase tracking-wider">
                      3. Disaster Nature & Situation (দুর্যোগের বিবরণ)
                    </h2>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="disasterType" className="text-xs font-semibold text-slate-700">
                      দুর্যোগের ধরন (Disaster Category) <span className="text-red-600">*</span>
                    </label>
                    <select
                      id="disasterType"
                      {...register('disasterType')}
                      className="w-full h-10 bg-white border border-slate-200 rounded-xl px-3 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition shadow-xs"
                    >
                      <option value="flood">Flash Flood / High Water (আকস্মিক বন্যা ও জলাবদ্ধতা)</option>
                      <option value="earthquake">Earthquake Structural Damage (ভূমিকম্প ও ভবন ধস)</option>
                      <option value="wildfire">Industrial Fire & Smoke (অগ্নিকাণ্ড ও বিষাক্ত ধোঁয়া)</option>
                      <option value="hurricane">Cyclone & Severe Storm Surge (ঘূর্ণিঝড় ও জলোচ্ছ্বাস)</option>
                      <option value="industrial">Chemical / Gas Leak (রাসায়নিক নির্গমন ও দুর্ঘটনা)</option>
                      <option value="medical">Mass Casualty Medical Emergency (চিকিৎসা সংকট)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="description" className="text-xs font-semibold text-slate-700">
                      পরিস্থিতির বিবরণ ও তাৎক্ষণিক ঝুঁকি (Description & Hazards) <span className="text-red-600">*</span>
                    </label>
                    <textarea
                      id="description"
                      rows={3}
                      {...register('description')}
                      placeholder="পানির উচ্চতা কতটুকু, বিদ্যুৎ আছে কি না, কোনো পথ রুদ্ধ কি না বিস্তারিত লিখুন..."
                      className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 resize-none transition shadow-xs"
                    />
                    {errors.description && (
                      <p className="text-[11px] text-red-600 font-medium">{errors.description.message}</p>
                    )}
                  </div>
                </div>

                {/* Section 4: Casualties & Urgent Requirements */}
                <div className="space-y-3 pb-4 border-b border-slate-100">
                  <div className="flex items-center space-x-2 text-slate-900">
                    <HeartPulse className="w-4 h-4 text-red-600" />
                    <h2 className="text-sm font-bold uppercase tracking-wider">
                      4. Casualties & Urgent Requirements (প্রয়োজনীয় সহায়তা)
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* Trapped Persons Counter Stepper */}
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-semibold text-slate-700">আটকে পড়া ব্যক্তি (Trapped)</span>
                        <span className="text-base font-extrabold text-red-600 font-mono">
                          {formValues.trappedCount} জন
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => setValue('trappedCount', Math.max(0, Number(formValues.trappedCount || 0) - 1))}
                          className="w-9 h-9 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-700 font-bold transition shadow-xs"
                          aria-label="Decrease trapped count"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          {...register('trappedCount', { valueAsNumber: true })}
                          className="flex-1 h-9 bg-white border border-slate-200 rounded-lg text-center text-xs font-bold font-mono text-slate-900 focus:outline-none focus:border-blue-600 shadow-xs"
                        />
                        <button
                          type="button"
                          onClick={() => setValue('trappedCount', Number(formValues.trappedCount || 0) + 1)}
                          className="w-9 h-9 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-700 font-bold transition shadow-xs"
                          aria-label="Increase trapped count"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Injured Persons Counter Stepper */}
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-semibold text-slate-700">আহত ব্যক্তি (Injured)</span>
                        <span className="text-base font-extrabold text-amber-600 font-mono">
                          {formValues.injuredCount} জন
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => setValue('injuredCount', Math.max(0, Number(formValues.injuredCount || 0) - 1))}
                          className="w-9 h-9 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-700 font-bold transition shadow-xs"
                          aria-label="Decrease injured count"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          {...register('injuredCount', { valueAsNumber: true })}
                          className="flex-1 h-9 bg-white border border-slate-200 rounded-lg text-center text-xs font-bold font-mono text-slate-900 focus:outline-none focus:border-blue-600 shadow-xs"
                        />
                        <button
                          type="button"
                          onClick={() => setValue('injuredCount', Number(formValues.injuredCount || 0) + 1)}
                          className="w-9 h-9 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-700 font-bold transition shadow-xs"
                          aria-label="Increase injured count"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Requirements checkboxes */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-xs font-semibold text-slate-700">জরুরি সরঞ্জামের চাহিদা:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <label className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/80 flex items-center space-x-2 text-xs font-semibold text-slate-800 cursor-pointer transition shadow-xs">
                        <input
                          type="checkbox"
                          {...register('needsBoat')}
                          className="w-4 h-4 rounded text-blue-600 accent-blue-600 cursor-pointer"
                        />
                        <span>উদ্ধারকারী বোট (Boat)</span>
                      </label>
                      <label className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/80 flex items-center space-x-2 text-xs font-semibold text-slate-800 cursor-pointer transition shadow-xs">
                        <input
                          type="checkbox"
                          {...register('needsMedical')}
                          className="w-4 h-4 rounded text-blue-600 accent-blue-600 cursor-pointer"
                        />
                        <span>জরুরি চিকিৎসা (EMT)</span>
                      </label>
                      <label className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/80 flex items-center space-x-2 text-xs font-semibold text-slate-800 cursor-pointer transition shadow-xs">
                        <input
                          type="checkbox"
                          {...register('needsFoodWater')}
                          className="w-4 h-4 rounded text-blue-600 accent-blue-600 cursor-pointer"
                        />
                        <span>খাবার ও পানি (Food)</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Section 5: Supporting Scene Photos */}
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                    <div className="flex items-center space-x-2 text-slate-900">
                      <Camera className="w-4 h-4 text-blue-600" />
                      <h2 className="text-sm font-bold uppercase tracking-wider">
                        5. Scene Photo Damage Scan (ছবি সংযোজন)
                      </h2>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleSamplePhoto('flood')}
                        className="text-[10px] px-2.5 py-1 rounded-lg bg-slate-50 text-slate-700 border border-slate-200 font-semibold hover:bg-slate-100 hover:border-slate-300 transition shadow-xs"
                      >
                        🌊 সিলেট বন্যা
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSamplePhoto('fire')}
                        className="text-[10px] px-2.5 py-1 rounded-lg bg-slate-50 text-slate-700 border border-slate-200 font-semibold hover:bg-slate-100 hover:border-slate-300 transition shadow-xs"
                      >
                        🔥 চকবাজার আগুন
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSamplePhoto('rescue')}
                        className="text-[10px] px-2.5 py-1 rounded-lg bg-slate-50 text-slate-700 border border-slate-200 font-semibold hover:bg-slate-100 hover:border-slate-300 transition shadow-xs"
                      >
                        🚤 নদী উদ্ধার
                      </button>
                    </div>
                  </div>

                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:border-blue-500 transition relative bg-slate-50/50">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                      aria-label="Upload disaster scene photo"
                    />
                    {imagePreview ? (
                      <div className="flex items-center justify-center space-x-4">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={imagePreview}
                          alt="Damage scene preview"
                          className="w-20 h-20 object-cover rounded-lg border border-slate-200 shadow-xs"
                        />
                        <div className="text-left text-xs text-slate-700">
                          <div className="font-bold text-emerald-700 flex items-center space-x-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>ছবি আপলোড সম্পন্ন</span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">নতুন ছবি দিতে ক্লিক বা ড্র্যাগ করুন</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center space-y-1 py-2 text-slate-500">
                        <Upload className="w-5 h-5 text-slate-400" />
                        <span className="text-xs font-semibold text-slate-700">ছবি আপলোড করতে ক্লিক করুন অথবা ড্র্যাগ করুন</span>
                        <span className="text-[11px] text-slate-500">Gemini Vision ক্ষয়ক্ষতি ও জরুরি ঝুঁকির স্তর বিশ্লেষণ করবে</span>
                      </div>
                    )}
                  </div>
                </div>

                {submitError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center space-x-2">
                    <AlertOctagon className="w-4 h-4 text-red-600 shrink-0" />
                    <span>{submitError}</span>
                  </div>
                )}

                {/* Primary Submission Action */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 disabled:opacity-50 text-white font-extrabold text-sm uppercase tracking-wider transition shadow-xs flex items-center justify-center space-x-2 focus-visible:ring-2 focus-visible:ring-red-500"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                      <span>Transmitting SOS to Emergency Grid...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      <span>Broadcast SOS & Trigger AI Dispatch</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Right Column: AI Severity & Emergency Panel (5 Cols on Desktop) */}
            <div className="lg:col-span-5 space-y-4">
              {/* AI Severity Panel */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4 text-slate-900">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-900">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <span>GEMINI AI SEVERITY ASSESSMENT</span>
                  </div>

                  {isAnalyzingDamage ? (
                    <span className="text-[10px] text-amber-600 font-bold animate-pulse">ANALYZING...</span>
                  ) : aiSeverity ? (
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      LIVE TRIAGE
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full font-medium">
                      STANDBY
                    </span>
                  )}
                </div>

                {/* Severity Score Gauge / Progress */}
                {aiSeverity ? (
                  <div className="space-y-3">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs font-bold text-slate-700 uppercase">Calculated Severity Score</span>
                      <div className="flex items-center space-x-2">
                        <span className={`text-2xl font-extrabold font-mono ${severityBadge?.text || 'text-slate-900'}`}>
                          {aiSeverity.score} <span className="text-xs text-slate-400 font-normal">/ 100</span>
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${severityBadge?.bg || ''}`}>
                          {severityBadge?.label}
                        </span>
                      </div>
                    </div>

                    {/* Score Bar */}
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                      <div
                        className={`h-full transition-all duration-500 rounded-full ${severityBadge?.bar || 'bg-slate-500'}`}
                        style={{ width: `${Math.min(100, Math.max(0, aiSeverity.score))}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-center space-y-1.5">
                    <span className="text-xs font-bold text-slate-800 block">AI Triage Radar Standby</span>
                    <p className="text-[11px] text-slate-500 leading-snug">
                      ঝুঁকির মাত্রা (Severity Score) আপনার বিবরণ ও ছবি থেকে স্বয়ংক্রিয়ভাবে গণনা করা হবে।
                    </p>
                  </div>
                )}

                {/* Detected Hazards */}
                {aiDamage && (
                  <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 space-y-2 text-xs">
                    <div className="font-bold text-blue-900 flex justify-between items-center">
                      <span>{aiDamage.damageType}</span>
                      <span className="font-mono text-amber-700 text-[11px] font-bold">
                        {aiDamage.structuralRiskScore}% Structural Risk
                      </span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider block">Detected Scene Hazards:</span>
                      <div className="flex flex-wrap gap-1">
                        {aiDamage.detectedHazards.map((h, i) => (
                          <span
                            key={i}
                            className="text-[10px] px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200 font-semibold"
                          >
                            {h}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Required Rescue Units */}
                <div className="space-y-2 text-xs">
                  <span className="font-bold text-slate-800">AI Suggested Task Force Units:</span>
                  <ul className="space-y-1.5">
                    {(aiSeverity?.requiredRescueUnits || [
                      formValues.needsBoat ? 'Swift-Water Zodiac Rescue Team' : 'Local Civil Defense Task Force',
                      formValues.needsMedical ? 'Trauma Paramedic Emergency Unit' : 'General Evacuation Squad',
                    ]).map((u, idx) => (
                      <li key={idx} className="text-xs text-slate-700 font-medium flex items-center space-x-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>{u}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>MoDMR National Incident Command taxonomy verified.</span>
                </div>
              </div>

              {/* Immediate Life-Safety Guidance */}
              <div className="bg-red-50 border border-red-200 rounded-2xl p-5 space-y-3 shadow-xs">
                <div className="flex items-center space-x-2 text-red-700">
                  <Phone className="w-4 h-4 text-red-600" />
                  <h3 className="text-xs font-bold uppercase tracking-wider">
                    Direct Voice Emergency Hotlines (জরুরি হটলাইন)
                  </h3>
                </div>
                <p className="text-xs text-slate-600 leading-snug">
                  ইন্টারনেট সংযোগ বিঘ্নিত হলে অথবা তাৎক্ষণিক কথা বলতে নিম্নের টোল-ফ্রি হটলাইনে সরাসরি কল করুন:
                </p>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <a
                    href="tel:999"
                    className="p-2.5 rounded-xl bg-white border border-red-200 text-red-700 hover:bg-red-100/40 transition font-bold text-center shadow-xs"
                  >
                    📞 999 (National SOS)
                  </a>
                  <a
                    href="tel:102"
                    className="p-2.5 rounded-xl bg-white border border-red-200 text-red-700 hover:bg-red-100/40 transition font-bold text-center shadow-xs"
                  >
                    🚒 102 (Fire Service)
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
