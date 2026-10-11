'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Compass, Radio, MapPin, AlertTriangle, Home, Users } from 'lucide-react';
import TacticalMap from '@/components/TacticalMap';
import { DisasterIncident, SOSRequest, Shelter, ResponderTeam } from '@/lib/types';

interface GoogleLiveMapProps {
  disasters: DisasterIncident[];
  sosRequests: SOSRequest[];
  shelters: Shelter[];
  responders: ResponderTeam[];
  center?: { lat: number; lng: number };
  zoom?: number;
  onDispatchSOS?: (id: string) => void;
}

export default function GoogleLiveMap({
  disasters,
  sosRequests,
  shelters,
  responders,
  center = { lat: 45.5152, lng: -122.6784 },
  zoom = 12,
  onDispatchSOS,
}: GoogleLiveMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || '';

  useEffect(() => {
    if (!apiKey) return;

    if ((window as any).google && (window as any).google.maps) {
      setGoogleMapsLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry`;
    script.async = true;
    script.defer = true;
    script.onload = () => setGoogleMapsLoaded(true);
    document.head.appendChild(script);
  }, [apiKey]);

  useEffect(() => {
    if (!googleMapsLoaded || !mapRef.current || !(window as any).google) return;

    const google = (window as any).google;
    const map = new google.maps.Map(mapRef.current, {
      center,
      zoom,
      styles: [
        { elementType: 'geometry', stylers: [{ color: '#090d16' }] },
        { elementType: 'labels.text.stroke', stylers: [{ color: '#090d16' }] },
        { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
        { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#38bdf8' }] },
        { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
        { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1e293b' }] },
        { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0284c7' }] },
      ],
    });

    // Add markers for SOS
    sosRequests.forEach((sos) => {
      new google.maps.Marker({
        position: { lat: sos.location.lat, lng: sos.location.lng },
        map,
        title: `${sos.reporterName} (${sos.priority})`,
      });
    });

    // Add markers for Shelters
    shelters.forEach((she) => {
      new google.maps.Marker({
        position: { lat: she.lat, lng: she.lng },
        map,
        title: she.name,
      });
    });
  }, [googleMapsLoaded, disasters, sosRequests, shelters, responders, center, zoom]);

  // If Google Maps API key is configured and loaded
  if (apiKey && googleMapsLoaded) {
    return (
      <div className="relative w-full h-[650px] rounded-2xl overflow-hidden border border-slate-700/80 shadow-2xl">
        <div ref={mapRef} className="w-full h-full" />
      </div>
    );
  }

  // Tactical Radar Map
  return (
    <TacticalMap
      disasters={disasters}
      sosRequests={sosRequests}
      shelters={shelters}
      responders={responders}
      onDispatchSOS={onDispatchSOS}
    />
  );
}
