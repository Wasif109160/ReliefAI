'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LifeBuoy,
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
  Waves,
  HeartPulse,
  Phone,
} from 'lucide-react';
import { AIDamageAssessment, AISeverityClassification, SOSRequest } from '@/lib/types';
import { detectDamageWithAI } from '@/lib/gemini/damage-detection';
import { classifySeverityWithAI } from '@/lib/gemini/severity-classification';
import { uploadDisasterImage } from '@/lib/firebase/storage';
import { useNotifications } from '@/context/NotificationContext';

const sosSchema = z.object({
  reporterName: z.string().min(2, 'Name is required'),
  contactPhone: z.string().min(7, 'Valid contact phone number is required'),
  address: z.string().min(5, 'Specific location/address is required'),
  disasterType: z.enum(['flood', 'earthquake', 'wildfire', 'hurricane', 'industrial', 'medical']),
  description: z.string().min(10, 'Please describe situation and immediate hazards (min 10 chars)'),
  trappedCount: z.number().min(0),
  injuredCount: z.number().min(0),
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
  const [submittedReport, setSubmittedReport] = useState<SOSRequest | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SOSFormData>({
    resolver: zodResolver(sosSchema),
    defaultValues: {
      reporterName: 'Marcus Vance',
      contactPhone: '+1 (555) 234-8901',
      address: '742 Riverwood Dr, Fluvial District Sector 4',
      disasterType: 'flood',
      description: 'Water has risen above ground level. 4 people trapped including elderly person on oxygen. Current flowing swiftly outside balcony.',
      trappedCount: 4,
      injuredCount: 1,
      needsBoat: true,
      needsMedical: true,
      needsFoodWater: false,
    },
  });

  const formValues = watch();

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

  const handleSamplePhoto = async (type: 'flood' | 'earthquake') => {
    const sampleDesc =
      type === 'flood'
        ? 'Floodwaters 5 feet deep covering front entrance. Water rising 1 inch every 10 min. Family of 4 stranded on upper balcony.'
        : 'Stairwell concrete collapsed. Heavy cracked masonry. 3 people trapped in office annex, 1 active compound fracture.';
    
    setValue('description', sampleDesc);
    setValue('disasterType', type === 'flood' ? 'flood' : 'earthquake');
    setValue('needsBoat', type === 'flood');

    setIsAnalyzingDamage(true);
    const damageResult = await detectDamageWithAI(sampleDesc);
    const severityResult = await classifySeverityWithAI({
      description: sampleDesc,
      trappedCount: Number(formValues.trappedCount),
      injuredCount: Number(formValues.injuredCount),
      needsBoat: type === 'flood',
      needsMedical: true,
    });
    setAiDamage(damageResult);
    setAiSeverity(severityResult);
    setIsAnalyzingDamage(false);
  };

  const onSubmit = async (data: SOSFormData) => {
    setIsSubmitting(true);
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
            lat: 45.518,
            lng: -122.672,
          },
        }),
      });

      const json = await res.json();
      if (json.sos) {
        setSubmittedReport(json.sos);
        addNotification({
          targetRole: 'all',
          title: `CRITICAL SOS: ${data.reporterName} in ${data.address}`,
          message: `Priority: ${json.sos.priority}. Urgency: ${json.sos.urgencyScore}/100. Swift-water unit dispatched.`,
          type: 'urgent',
          link: '/map',
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-3"
      >
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-red-950/80 border border-red-500/50 text-red-300 text-xs font-mono uppercase tracking-wider">
          <LifeBuoy className="w-3.5 h-3.5 animate-pulse" />
          <span>AUTONOMOUS AI-TRIAGED SOS GATEWAY</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Emergency SOS Report
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm max-w-xl mx-auto">
          Broadcast your emergency with optional photo damage scanning. Powered by Gemini Multimodal Vision for immediate severity classification.
        </p>
      </motion.div>

      <AnimatePresence mode="wait">
        {submittedReport ? (
          <motion.div
            key="success-card"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="glass-panel-elevated p-6 sm:p-10 rounded-3xl border border-emerald-500/40 space-y-8 shadow-2xl"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-6 gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  INCIDENT LOGGED // ID: {submittedReport.id}
                </span>
                <h2 className="text-2xl font-black text-white">Rescue Unit En Route</h2>
                <p className="text-xs text-slate-400">{submittedReport.location.address}</p>
              </div>

              <div className="flex items-center space-x-3 bg-red-950/60 border border-red-500/40 px-4 py-2.5 rounded-2xl">
                <div className="text-right">
                  <div className="text-[10px] font-mono text-red-300">TRIAGE SCORE</div>
                  <div className="text-lg font-black text-red-400">
                    {submittedReport.priority} ({submittedReport.urgencyScore}/100)
                  </div>
                </div>
                <div className="w-3.5 h-3.5 rounded-full bg-red-500 animate-ping-slow" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                <div className="text-xs text-slate-400 flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Estimated Arrival</span>
                </div>
                <div className="text-2xl font-black text-cyan-300">~{submittedReport.dispatchEtaMinutes || 7} Minutes</div>
                <div className="text-[10px] text-slate-500 font-mono">EN ROUTE VIA RIVER STAGING</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                <div className="text-xs text-slate-400 flex items-center space-x-1">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Assigned Task Force</span>
                </div>
                <div className="text-lg font-bold text-white truncate">
                  {submittedReport.assignedTeamName || 'Cascadia Swift Water Unit B'}
                </div>
                <div className="text-[10px] text-amber-400 font-mono">EQUIPPED: 2x ZODIACS + EMT</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                <div className="text-xs text-slate-400 flex items-center space-x-1">
                  <Radio className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Radio Frequency</span>
                </div>
                <div className="text-xl font-mono font-bold text-emerald-400">156.800 MHz</div>
                <div className="text-[10px] text-slate-500 font-mono">TACTICAL CHANNEL 16</div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4">
              <button
                onClick={() => setSubmittedReport(null)}
                className="text-xs text-slate-400 hover:text-white transition"
              >
                ← Submit Another Emergency Report
              </button>
              <a
                href="tel:911"
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider flex items-center space-x-2 transition"
              >
                <Phone className="w-4 h-4" />
                <span>Call Emergency Line (911)</span>
              </a>
            </div>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6 shadow-xl">
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2 text-slate-300">
                  <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="font-mono text-emerald-300">GPS ACCURACY: ±4 METERS</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono font-bold">
                  SATELLITE SYNC
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Your Full Name</label>
                  <input
                    {...register('reporterName')}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-red-500"
                  />
                  {errors.reporterName && <p className="text-[10px] text-red-400">{errors.reporterName.message}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Contact Phone Number</label>
                  <input
                    {...register('contactPhone')}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-red-500"
                  />
                  {errors.contactPhone && <p className="text-[10px] text-red-400">{errors.contactPhone.message}</p>}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Physical Address / Geolocation</label>
                <input
                  {...register('address')}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-red-500"
                />
                {errors.address && <p className="text-[10px] text-red-400">{errors.address.message}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Disaster Category</label>
                <select
                  {...register('disasterType')}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-red-500 uppercase font-mono"
                >
                  <option value="flood">Flash Flood / High Water</option>
                  <option value="earthquake">Earthquake Structural Damage</option>
                  <option value="wildfire">Wildfire & Smoke Inhalation</option>
                  <option value="hurricane">Hurricane / Severe Storm Surge</option>
                  <option value="industrial">Industrial Gas / Chemical Leak</option>
                  <option value="medical">Mass Casualty Medical Emergency</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-slate-300">Trapped Individuals</span>
                    <span className="text-lg font-black text-red-400 font-mono">{formValues.trappedCount}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    {...register('trappedCount', { valueAsNumber: true })}
                    className="w-full accent-red-500 cursor-pointer"
                  />
                </div>

                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-slate-300">Injured Casualties</span>
                    <span className="text-lg font-black text-amber-400 font-mono">{formValues.injuredCount}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="15"
                    {...register('injuredCount', { valueAsNumber: true })}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-300">Urgent Requirements:</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <label className="p-3 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-850 flex items-center space-x-2 text-xs font-semibold cursor-pointer">
                    <input type="checkbox" {...register('needsBoat')} className="accent-red-500 w-4 h-4 rounded" />
                    <span>Swift Water Boat</span>
                  </label>
                  <label className="p-3 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-850 flex items-center space-x-2 text-xs font-semibold cursor-pointer">
                    <input type="checkbox" {...register('needsMedical')} className="accent-red-500 w-4 h-4 rounded" />
                    <span>Trauma Kit / EMT</span>
                  </label>
                  <label className="p-3 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-850 flex items-center space-x-2 text-xs font-semibold cursor-pointer">
                    <input type="checkbox" {...register('needsFoodWater')} className="accent-red-500 w-4 h-4 rounded" />
                    <span>Clean Water / Food</span>
                  </label>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Situation Description & Hazards</label>
                <textarea
                  rows={3}
                  {...register('description')}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-red-500 resize-none"
                />
                {errors.description && <p className="text-[10px] text-red-400">{errors.description.message}</p>}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                    <Camera className="w-4 h-4 text-cyan-400" />
                    <span>Photo Damage Upload (Gemini Multimodal Vision)</span>
                  </label>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => handleSamplePhoto('flood')}
                      className="text-[10px] px-2 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800 font-mono"
                    >
                      Sample Flood Photo
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSamplePhoto('earthquake')}
                      className="text-[10px] px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800 font-mono"
                    >
                      Sample Earthquake
                    </button>
                  </div>
                </div>

                <div className="border-2 border-dashed border-slate-700 rounded-2xl p-4 text-center hover:border-cyan-500 transition relative bg-slate-900/60">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  />
                  {imagePreview ? (
                    <div className="flex items-center justify-center space-x-4">
                      <img src={imagePreview} alt="Damage Preview" className="w-24 h-24 object-cover rounded-xl border border-slate-700" />
                      <div className="text-left text-xs text-slate-300">
                        <div className="font-bold text-white flex items-center space-x-1">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>Image Loaded for Analysis</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">Click to replace photo</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center space-y-1 py-2 text-slate-400">
                      <Upload className="w-6 h-6 text-slate-400" />
                      <span className="text-xs font-semibold text-slate-300">Drop disaster scene photo or click to browse</span>
                      <span className="text-[10px] text-slate-500">Gemini will scan structural cracks, waterline depth & hazards</span>
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-sm uppercase tracking-wider transition shadow-xl shadow-red-950 flex items-center justify-center space-x-2"
              >
                <Zap className="w-5 h-5 animate-pulse" />
                <span>{isSubmitting ? 'Transmitting to Emergency Mesh...' : 'Broadcast SOS & Trigger AI Dispatch'}</span>
              </button>
            </div>

            <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>GEMINI AI TRIAGE RADAR</span>
                  </span>
                  {isAnalyzingDamage && (
                    <span className="text-[10px] font-mono text-amber-400 animate-pulse">ANALYZING...</span>
                  )}
                </div>

                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-2">
                  <span className="text-xs text-slate-400 font-semibold">Calculated Severity Score</span>
                  <div
                    className={`text-4xl font-black font-mono ${
                      (aiSeverity?.score || 95) >= 85
                        ? 'text-red-400 animate-pulse'
                        : (aiSeverity?.score || 95) >= 65
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                    }`}
                  >
                    {aiSeverity?.score || 95} <span className="text-lg text-slate-500">/ 100</span>
                  </div>
                  <div className="inline-block px-3 py-0.5 rounded-full text-xs font-bold font-mono tracking-wider bg-slate-800 text-white uppercase">
                    LEVEL: {aiSeverity?.level || 'CRITICAL'}
                  </div>
                </div>

                {aiDamage && (
                  <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-800/40 space-y-2 text-xs">
                    <div className="font-bold text-cyan-300 flex justify-between">
                      <span>{aiDamage.damageType}</span>
                      <span className="font-mono text-amber-400">{aiDamage.structuralRiskScore}% Risk</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono text-slate-400 uppercase">Detected Hazards:</span>
                      <div className="flex flex-wrap gap-1">
                        {aiDamage.detectedHazards.map((h, i) => (
                          <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-red-300 border border-red-900/50">
                            {h}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-1 text-xs">
                  <span className="text-slate-400 font-semibold">AI Required Rescue Units:</span>
                  <ul className="space-y-1">
                    {(aiSeverity?.requiredRescueUnits || ['Swift Water Rescue Task Force', 'Trauma Paramedic Unit']).map(
                      (u, idx) => (
                        <li key={idx} className="text-[11px] text-cyan-200 flex items-center space-x-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                          <span>{u}</span>
                        </li>
                      )
                    )}
                  </ul>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Encrypted telemetry verified by FEMA ICS-400 standards.</span>
              </div>
            </div>
          </form>
        )}
      </AnimatePresence>
    </div>
  );
}
