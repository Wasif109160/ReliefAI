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
  { name: 'Civic Arena', occupied: 864, capacity: 1200 },
  { name: 'Lincoln High', occupied: 420, capacity: 450 },
  { name: 'Redwood Valley', occupied: 140, capacity: 350 },
  { name: 'Transit Hall', occupied: 600, capacity: 600 },
];

export function SOSTrendChart() {
  return (
    <div className="w-full h-64 select-none">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={sosTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorSOS" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="colorRescued" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
          <YAxis stroke="#64748b" fontSize={11} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0f172a',
              borderColor: '#334155',
              borderRadius: '12px',
              fontSize: '11px',
              color: '#f8fafc',
            }}
          />
          <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
          <Area type="monotone" dataKey="incomingSOS" name="Incoming SOS Calls" stroke="#ef4444" fillOpacity={1} fill="url(#colorSOS)" />
          <Area type="monotone" dataKey="rescued" name="Citizens Rescued" stroke="#10b981" fillOpacity={1} fill="url(#colorRescued)" />
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
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
          <YAxis stroke="#64748b" fontSize={11} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0f172a',
              borderColor: '#334155',
              borderRadius: '12px',
              fontSize: '11px',
              color: '#f8fafc',
            }}
          />
          <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
          <Bar dataKey="occupied" name="Current Occupants" fill="#06b6d4" radius={[6, 6, 0, 0]} />
          <Bar dataKey="capacity" name="Total Capacity" fill="#334155" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
