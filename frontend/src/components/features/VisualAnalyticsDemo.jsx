import React, { useState } from 'react';
import {
  BarChart3,
  PieChart as PieIcon,
  TrendingUp,
  Building2,
  MapPin,
  Layers,
  ArrowRight,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const CATEGORY_DATA = [
  { name: 'Agriculture & Rural', value: 1120, color: '#16a34a' },
  { name: 'Education & Learning', value: 840, color: '#2563eb' },
  { name: 'Social Welfare', value: 760, color: '#9333ea' },
  { name: 'Health & Wellness', value: 650, color: '#e11d48' },
  { name: 'Women & Child', value: 448, color: '#f59e0b' },
  { name: 'Housing & Urban', value: 480, color: '#0d9488' },
  { name: 'Employment & MSME', value: 395, color: '#475569' },
];

const JURISDICTION_DATA = [
  { name: 'Central', count: 684, fill: '#2563eb' },
  { name: 'Uttar Pradesh', count: 320, fill: '#16a34a' },
  { name: 'Maharashtra', count: 280, fill: '#f59e0b' },
  { name: 'Rajasthan', count: 260, fill: '#9333ea' },
  { name: 'Madhya Pradesh', count: 240, fill: '#0d9488' },
  { name: 'Bihar', count: 210, fill: '#e11d48' },
  { name: 'Gujarat', count: 190, fill: '#475569' },
];

export default function VisualAnalyticsDemo({ onOpenDashboard }) {
  const [activeChart, setActiveChart] = useState('categories'); // 'categories' or 'jurisdictions'

  return (
    <div className="rounded-3xl bg-white border border-slate-200/90 shadow-xl p-6 sm:p-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wide bg-purple-50 px-3 py-1 rounded-full border border-purple-200/60 inline-flex items-center gap-1.5">
            <BarChart3 className="w-3.5 h-3.5" />
            Interactive Recharts SVG Visualization
          </span>
          <h3 className="text-xl font-extrabold text-slate-900 mt-2">
            Macro Welfare Intelligence & Distribution Metrics
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Aggregated real-time analytics across all 4,693 government welfare initiatives.
          </p>
        </div>

        {/* Chart View Toggle */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveChart('categories')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeChart === 'categories'
                ? 'bg-white text-purple-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sector Distribution
          </button>
          <button
            onClick={() => setActiveChart('jurisdictions')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeChart === 'jurisdictions'
                ? 'bg-white text-purple-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Central vs State
          </button>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6">
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
          <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Catalog</span>
          <span className="text-2xl font-black text-slate-900">4,693</span>
          <span className="text-[11px] text-blue-600 font-semibold block mt-0.5">37 States & UTs</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
          <span className="text-[10px] font-bold text-slate-400 uppercase block">Top Sector</span>
          <span className="text-2xl font-black text-emerald-600">1,120</span>
          <span className="text-[11px] text-emerald-700 font-semibold block mt-0.5">Agriculture & Rural</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
          <span className="text-[10px] font-bold text-slate-400 uppercase block">Women Targeted</span>
          <span className="text-2xl font-black text-amber-600">448</span>
          <span className="text-[11px] text-amber-700 font-semibold block mt-0.5">Specialized Schemes</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
          <span className="text-[10px] font-bold text-slate-400 uppercase block">Disability / PwD</span>
          <span className="text-2xl font-black text-purple-600">308</span>
          <span className="text-[11px] text-purple-700 font-semibold block mt-0.5">Inclusive Welfare</span>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-72 w-full pt-4">
        {activeChart === 'categories' ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={CATEGORY_DATA}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={4}
                dataKey="value"
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                labelLine={false}
              >
                {CATEGORY_DATA.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(val, name) => [`${val} Initiatives`, name]}
                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={JURISDICTION_DATA} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-15} textAnchor="end" />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                formatter={(val) => [`${val} Schemes`, 'Scheme Count']}
                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
              />
              <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                {JURISDICTION_DATA.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Bottom CTA */}
      {onOpenDashboard && (
        <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Interactive drill-down available inside the Citizen Dashboard.
          </span>
          <button
            onClick={onOpenDashboard}
            className="text-xs font-bold text-purple-700 hover:text-purple-800 flex items-center gap-1 cursor-pointer"
          >
            <span>Open Full Dashboard Analytics</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

    </div>
  );
}
