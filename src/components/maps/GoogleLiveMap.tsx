'use client';

import React, { useEffect, useRef, useState } from 'react';
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
  center = { lat: 23.8103, lng: 90.4125 }, // Dhaka, Bangladesh
  zoom = 7,
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
        { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0369a1' }] },
      ],
    });
  }, [googleMapsLoaded, center, zoom]);

  // Always return the rich, custom Bangladesh TacticalMap with SVG layers, real assets and filters
  return <TacticalMap />;
}
