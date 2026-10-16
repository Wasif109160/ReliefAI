'use client';

import React, { useEffect, useRef, useState } from 'react';
import TacticalMap from '@/components/TacticalMap';
import { DisasterIncident, SOSRequest, Shelter, ResponderTeam } from '@/lib/types';
import { Globe, Shield } from 'lucide-react';

declare global {
  interface Window {
    google?: {
      maps: {
        Map: new (element: HTMLElement, options: Record<string, unknown>) => unknown;
        Marker: new (options: Record<string, unknown>) => { addListener: (event: string, handler: () => void) => void };
        InfoWindow: new (options: { content: string }) => { open: (map: unknown, marker: unknown) => void };
      };
    };
  }
}

interface GoogleLiveMapProps {
  disasters: DisasterIncident[];
  sosRequests: SOSRequest[];
  shelters: Shelter[];
  responders: ResponderTeam[];
  center?: { lat: number; lng: number };
  zoom?: number;
  onDispatchSOS?: (id: string) => void;
  isLoading?: boolean;
}

export default function GoogleLiveMap({
  disasters,
  sosRequests,
  shelters,
  responders,
  center = { lat: 23.8103, lng: 90.4125 }, // Dhaka, Bangladesh
  zoom = 7,
  isLoading = false,
}: GoogleLiveMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(() => {
    if (typeof window === 'undefined') return false;
    return !!window.google?.maps;
  });
  const [activeMode, setActiveMode] = useState<'tactical' | 'google'>('tactical');
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || '';
  const mapInstanceRef = useRef<unknown>(null);

  useEffect(() => {
    if (!apiKey || googleMapsLoaded) return;

    if (window.google?.maps) {
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry`;
    script.async = true;
    script.defer = true;
    script.onload = () => setGoogleMapsLoaded(true);
    document.head.appendChild(script);
  }, [apiKey, googleMapsLoaded]);

  useEffect(() => {
    if (!googleMapsLoaded || !mapRef.current || !window.google?.maps || activeMode !== 'google') return;

    const google = window.google;
    const map = new google.maps.Map(mapRef.current, {
      center,
      zoom,
      mapTypeId: 'terrain',
      styles: [
        { elementType: 'geometry', stylers: [{ color: '#f8fafc' }] },
        { elementType: 'labels.text.stroke', stylers: [{ color: '#ffffff' }] },
        { elementType: 'labels.text.fill', stylers: [{ color: '#334155' }] },
        { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#0f172a' }] },
        { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#64748b' }] },
        { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
        { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#bae6fd' }] },
      ],
    });
    mapInstanceRef.current = map;

    // Add Markers for Disasters
    disasters?.forEach((d) => {
      if (d.location?.lat && d.location?.lng) {
        const marker = new google.maps.Marker({
          position: { lat: d.location.lat, lng: d.location.lng },
          map,
          title: d.title,
        });
        const info = new google.maps.InfoWindow({
          content: `<div style="color:#0f172a;padding:8px;font-family:sans-serif;font-size:12px;">
            <strong style="color:#e11d48;">🚨 ${d.title}</strong><br/>
            <span style="color:#64748b;">Severity:</span> <b>${d.severity.toUpperCase()}</b><br/>
            <span style="color:#64748b;">Affected:</span> <b>${d.affectedPopulation.toLocaleString()}</b>
          </div>`,
        });
        marker.addListener('click', () => info.open(map, marker));
      }
    });

    // Add Markers for Shelters
    shelters?.forEach((s) => {
      if (s.lat && s.lng) {
        const marker = new google.maps.Marker({
          position: { lat: s.lat, lng: s.lng },
          map,
          title: s.name,
        });
        const info = new google.maps.InfoWindow({
          content: `<div style="color:#0f172a;padding:8px;font-family:sans-serif;font-size:12px;">
            <strong style="color:#059669;">🏛️ ${s.name}</strong><br/>
            <span style="color:#64748b;">Capacity:</span> <b>${s.currentOccupancy}/${s.capacity}</b> (${s.status})
          </div>`,
        });
        marker.addListener('click', () => info.open(map, marker));
      }
    });

    // Add Markers for SOS Requests
    sosRequests?.forEach((sos) => {
      if (sos.location?.lat && sos.location?.lng) {
        const marker = new google.maps.Marker({
          position: { lat: sos.location.lat, lng: sos.location.lng },
          map,
          title: `SOS: ${sos.reporterName}`,
        });
        const info = new google.maps.InfoWindow({
          content: `<div style="color:#0f172a;padding:8px;font-family:sans-serif;font-size:12px;">
            <strong style="color:#dc2626;">🆘 SOS: ${sos.priority}</strong><br/>
            <b>${sos.reporterName}</b> (${sos.phone})<br/>
            <span style="color:#475569;">${sos.details}</span>
          </div>`,
        });
        marker.addListener('click', () => info.open(map, marker));
      }
    });
  }, [googleMapsLoaded, center, zoom, activeMode, disasters, shelters, sosRequests]);

  return (
    <div className="relative w-full">
      {/* Mode Toggle Controls if API Key is configured */}
      {apiKey && (
        <div className="absolute top-4 right-4 z-30 flex items-center bg-white border border-slate-200 rounded-2xl p-1 shadow-md">
          <button
            type="button"
            onClick={() => setActiveMode('tactical')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
              activeMode === 'tactical'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Tactical Vector Map</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('google')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
              activeMode === 'google'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Google Satellite Live</span>
          </button>
        </div>
      )}

      {/* Render selected map */}
      {activeMode === 'tactical' || !apiKey ? (
        <TacticalMap
          disasters={disasters}
          sosRequests={sosRequests}
          shelters={shelters}
          responders={responders}
          isLoading={isLoading}
        />
      ) : (
        <div
          ref={mapRef}
          className="w-full h-[740px] rounded-3xl overflow-hidden border border-slate-200/80 shadow-lg bg-slate-50"
        />
      )}
    </div>
  );
}
