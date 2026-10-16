'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts';

const sosTrendData = [
  { time: '00:00', incomingSOS: 8, rescued: 5 },
  { time: '04:00', incomingSOS: 14, rescued: 9 },
  { time: '08:00', incomingSOS: 32, rescued: 21 },
  { time: '12:00', incomingSOS: 48, rescued: 38 },
  { time: '16:00', incomingSOS: 27, rescued: 26 },
  { time: '20:00', incomingSOS: 19, rescued: 18 },
];

const shelterDistributionData = [
  { name: 'Sylhet Govt High', occupied: 864, capacity: 1200 },
  { name: 'Sunamganj Safe 4', occupied: 420, capacity: 450 },
  { name: 'Chittagong Poly', occupied: 240, capacity: 600 },
  { name: 'Cox’s Bazar Hub', occupied: 580, capacity: 700 },
];

export function SOSTrendChart() {
  return (
    <div className="w-full h-64 select-none">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={sosTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorSOS" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#dc2626" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#dc2626" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="colorRescued" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0d9488" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#0d9488" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} />
          <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#ffffff',
              borderColor: '#e2e8f0',
              borderRadius: '12px',
              fontSize: '12px',
              color: '#0f172a',
              boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
            }}
            labelStyle={{ color: '#0f172a', fontWeight: 'bold' }}
          />
          <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px', color: '#64748b' }} />
          <Area type="monotone" dataKey="incomingSOS" name="Incoming SOS Calls" stroke="#dc2626" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSOS)" />
          <Area type="monotone" dataKey="rescued" name="Citizens Rescued" stroke="#0d9488" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRescued)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ShelterOccupancyChart() {
  return (
    <div className="w-full h-64 select-none">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={shelterDistributionData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
          <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#ffffff',
              borderColor: '#e2e8f0',
              borderRadius: '12px',
              fontSize: '12px',
              color: '#0f172a',
              boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
            }}
            labelStyle={{ color: '#0f172a', fontWeight: 'bold' }}
          />
          <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px', color: '#64748b' }} />
          <Bar dataKey="occupied" name="Current Occupants" fill="#2563eb" radius={[6, 6, 0, 0]} />
          <Bar dataKey="capacity" name="Total Capacity" fill="#cbd5e1" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
