import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart3,
  PieChart as PieIcon,
  TrendingUp,
  Building2,
  MapPin,
  Layers,
  ArrowRight,
  Filter,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  IndianRupee,
  Users,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Sliders,
  Calculator,
  X,
  Loader2,
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
  CartesianGrid,
} from 'recharts';
import { getAnalyticsData, getSchemes } from '../../api/client';
import SchemeCard from '../dashboard/SchemeCard';

const PALETTE = [
  '#2563eb', // Blue
  '#9333ea', // Purple
  '#16a34a', // Green
  '#f59e0b', // Amber
  '#e11d48', // Rose
  '#0d9488', // Teal
  '#0284c7', // Sky
  '#475569', // Slate
  '#6366f1', // Indigo
  '#d97706', // Amber-600
];

export default function AnalyticsDashboard({
  matchedResults,
  userProfile,
  onDrilldownToExplorer,
  onViewSchemeDetails,
  bookmarkedSlugs = [],
  onToggleBookmark,
}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scope, setScope] = useState('macro'); // 'macro' or 'matched'
  
  // Drilldown Filter State
  const [activeFilter, setActiveFilter] = useState(null); // { type: 'category' | 'state', value: string }
  const [drilldownSchemes, setDrilldownSchemes] = useState([]);
  const [drilldownLoading, setDrilldownLoading] = useState(false);

  // Subsidy Calculator State
  const [familyMembers, setFamilyMembers] = useState(4);
  const [annualIncome, setAnnualIncome] = useState(userProfile?.annual_income || 150000);
  const [landAcres, setLandAcres] = useState(userProfile?.occupation === 'farmer' ? 2.5 : 0);
  const [isBpl, setIsBpl] = useState(Boolean(userProfile?.is_bpl));
  const [hasDisability, setHasDisability] = useState(Boolean(userProfile?.has_disability));

  // Load backend analytics
  useEffect(() => {
    let mounted = true;
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const res = await getAnalyticsData();
        if (mounted) setData(res);
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchAnalytics();
    return () => {
      mounted = false;
    };
  }, []);

  // Fetch schemes when user clicks a drilldown slice/bar
  useEffect(() => {
    if (!activeFilter) {
      setDrilldownSchemes([]);
      return;
    }

    const fetchDrilldown = async () => {
      setDrilldownLoading(true);
      try {
        const params = {
          page: 1,
          page_size: 6,
          category: activeFilter.type === 'category' ? activeFilter.value : undefined,
          state: activeFilter.type === 'state' ? activeFilter.value : undefined,
        };
        const res = await getSchemes(params);
        setDrilldownSchemes(res.items || []);
      } catch (err) {
        console.error('Failed to fetch drilldown schemes:', err);
      } finally {
        setDrilldownLoading(false);
      }
    };

    fetchDrilldown();
  }, [activeFilter]);

  // Transform personalized matched breakdown into Recharts format
  const matchedCategoryData = useMemo(() => {
    if (!matchedResults || !matchedResults.category_breakdown) return [];
    const total = matchedResults.total_matched || 1;
    return Object.entries(matchedResults.category_breakdown).map(([name, count], idx) => ({
      name,
      count,
      percentage: Number(((count / total) * 100).toFixed(1)),
      color: PALETTE[idx % PALETTE.length],
    }));
  }, [matchedResults]);

  // Calculator Entitlement Computation
  const calculatedEntitlement = useMemo(() => {
    let cashDbt = 0;
    let healthInsurance = 500000; // Ayushman Bharat universal base cover
    let assetSubsidy = 0;
    let educationGrants = 0;

    // PM-Kisan & Agri DBT
    if (landAcres > 0) {
      cashDbt += 6000; // PM-Kisan
      if (landAcres <= 2.5) {
        assetSubsidy += 35000; // Drip/Sprinkler subsidy
      }
    }

    // Low income & BPL benefits
    if (isBpl || annualIncome <= 100000) {
      cashDbt += familyMembers * 3600; // Ration / NFSA subsidy equivalent (approx ₹300/mo/member)
      assetSubsidy += 120000; // PMAY Rural Housing assistance
    }

    // PwD Assistance
    if (hasDisability) {
      cashDbt += 12000; // Divyangjan monthly pension ₹1,000/mo
      assetSubsidy += 15000; // Assistive aids & appliances
    }

    // Children Educational Grants
    if (familyMembers >= 3 && annualIncome <= 250000) {
      educationGrants += Math.min(3, Math.max(1, familyMembers - 2)) * 12000; // Pre/Post matric scholarship
    }

    const totalEstimated = cashDbt + healthInsurance + assetSubsidy + educationGrants;

    return {
      cashDbt,
      healthInsurance,
      assetSubsidy,
      educationGrants,
      totalEstimated,
    };
  }, [familyMembers, annualIncome, landAcres, isBpl, hasDisability]);

  if (loading && !data) {
    return (
      <div className="p-16 text-center text-slate-400 bg-white rounded-3xl border border-slate-200/80 shadow-xs flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        <span className="text-sm font-semibold">Synthesizing macro welfare intelligence...</span>
      </div>
    );
  }

  const categoryChartData =
    scope === 'matched' && matchedCategoryData.length > 0
      ? matchedCategoryData
      : data?.category_distribution || [];

  return (
    <div className="space-y-8">
      
      {/* Top Banner & Scope Switcher */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400 bg-emerald-500/20 px-2.5 py-1 rounded-full border border-emerald-400/30 flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5" />
                Macro & Micro Civic Intelligence
              </span>
              <span className="text-[10px] text-slate-400 font-semibold">
                Recharts SVG Engine v3.10
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Visual Analytics & Welfare Distribution Dashboard
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Interactive structural breakdown of statutory criteria, financial outlays, and sector distribution. Click any chart slice or bar to drill down directly into qualifying schemes.
            </p>
          </div>

          {/* Scope Switcher Pill */}
          <div className="flex items-center gap-1 bg-slate-800/90 p-1.5 rounded-2xl border border-slate-700/80 shrink-0 self-start lg:self-center">
            <button
              onClick={() => {
                setScope('macro');
                setActiveFilter(null);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                scope === 'macro'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Macro Catalog (4,693)</span>
            </button>

            <button
              onClick={() => {
                setScope('matched');
                setActiveFilter(null);
              }}
              disabled={!matchedResults}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                scope === 'matched'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : matchedResults
                  ? 'text-slate-300 hover:text-white'
                  : 'text-slate-500 opacity-50 cursor-not-allowed'
              }`}
              title={matchedResults ? 'View analytics for your matched profile' : 'Run Eligibility Wizard first to enable'}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>
                My Matched Profile {matchedResults ? `(${matchedResults.total_matched})` : ''}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Macro KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">
              {scope === 'macro' ? 'Total Initiatives' : 'Eligible Schemes'}
            </span>
            <Layers className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {scope === 'macro' ? (
              data?.total_schemes?.toLocaleString() || '4,693'
            ) : (
              matchedResults?.total_matched?.toLocaleString() || '0'
            )}
          </div>
          <span className="text-xs text-emerald-600 font-semibold mt-1 block">
            {scope === 'macro' ? '37 States & UTs Sourced' : '100% Deterministic Match'}
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">
              {scope === 'macro' ? 'Estimated Subsidy Pool' : 'Personal Entitlement'}
            </span>
            <IndianRupee className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600">
            {scope === 'macro' ? (
              data?.estimated_total_subsidy_pool || '₹4,28,000 Cr+'
            ) : (
              `₹${calculatedEntitlement.totalEstimated.toLocaleString()}+`
            )}
          </div>
          <span className="text-xs text-slate-500 font-medium mt-1 block">
            Direct & In-Direct Subsidies
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">
              Central Flagship
            </span>
            <Building2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {data?.target_demographics?.central_flagship || 684}
          </div>
          <span className="text-xs text-blue-600 font-semibold mt-1 block">
            Pan-India Direct Coverage
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">
              Women & Inclusion
            </span>
            <Users className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-600">
            {(data?.target_demographics?.women_targeted || 448) + (data?.target_demographics?.pwd_targeted || 308)}
          </div>
          <span className="text-xs text-slate-500 font-medium mt-1 block">
            Specialized Protected Quotas
          </span>
        </div>
      </div>

      {/* Active Drilldown Banner (If user clicked a slice/bar) */}
      {activeFilter && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <Filter className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-xs font-extrabold text-emerald-900">
                Filtered by {activeFilter.type === 'category' ? 'Sector' : 'Jurisdiction'}:{' '}
                <span className="underline decoration-emerald-500">{activeFilter.value}</span>
              </span>
              <span className="text-[11px] text-emerald-700 block">
                Showing top qualifying initiatives below. Click "Explore All in Scheme Explorer" to view full catalog.
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                if (onDrilldownToExplorer) {
                  onDrilldownToExplorer({
                    category: activeFilter.type === 'category' ? activeFilter.value : 'All',
                    state: activeFilter.type === 'state' ? activeFilter.value : 'All',
                  });
                }
              }}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <span>Explore in Full Catalog</span>
              <ArrowRight className="w-3 h-3" />
            </button>

            <button
              onClick={() => setActiveFilter(null)}
              className="p-1.5 rounded-xl bg-white hover:bg-emerald-100 text-slate-600 transition-colors cursor-pointer"
              title="Clear Filter"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Charts 2x2 Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* CHART 1: Sector Distribution (Donut Chart) */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-1.5 text-emerald-700 text-xs font-extrabold">
                <PieIcon className="w-3.5 h-3.5" />
                <span>Sector Distribution (Click Slice to Drill Down)</span>
              </div>
              <h4 className="text-base font-bold text-slate-900 mt-0.5">
                {scope === 'macro' ? 'All Welfare Sectors' : 'My Matched Sectors'}
              </h4>
            </div>
            <span className="text-[10px] px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-bold border border-slate-200">
              Interactive Donut
            </span>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={105}
                  paddingAngle={3}
                  dataKey="count"
                  cursor="pointer"
                  onClick={(entry) => {
                    if (entry && entry.name) {
                      setActiveFilter({ type: 'category', value: entry.name });
                    }
                  }}
                >
                  {categoryChartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color || PALETTE[index % PALETTE.length]}
                      stroke="#fff"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val, name, item) => [
                    `${val} Schemes (${item?.payload?.percentage || 0}%)`,
                    name,
                  ]}
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px',
                    fontWeight: 600,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend / Click pill tags */}
          <div className="flex flex-wrap items-center gap-1.5 pt-3 border-t border-slate-100">
            {categoryChartData.slice(0, 6).map((c) => (
              <button
                key={c.name}
                onClick={() => setActiveFilter({ type: 'category', value: c.name })}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeFilter?.value === c.name
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full inline-block"
                  style={{ backgroundColor: c.color }}
                />
                <span>
                  {c.name}: {c.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* CHART 2: Central vs State Governance (Bar Chart) */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-1.5 text-blue-700 text-xs font-extrabold">
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Geographic Jurisdiction (Click Bar to Filter)</span>
              </div>
              <h4 className="text-base font-bold text-slate-900 mt-0.5">
                Central Flagship vs Top State Programs
              </h4>
            </div>
            <span className="text-[10px] px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-bold border border-slate-200">
              Bar Distribution
            </span>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data?.jurisdiction_distribution || []}
                margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  angle={-20}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip
                  formatter={(val) => [`${val} Initiatives`, 'Scheme Count']}
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px',
                    fontWeight: 600,
                  }}
                />
                <Bar
                  dataKey="count"
                  radius={[6, 6, 0, 0]}
                  cursor="pointer"
                  onClick={(entry) => {
                    if (entry && entry.name) {
                      setActiveFilter({ type: 'state', value: entry.name });
                    }
                  }}
                >
                  {(data?.jurisdiction_distribution || []).map((entry, index) => (
                    <Cell
                      key={`bar-${index}`}
                      fill={entry.name === 'Central' ? '#2563eb' : '#10b981'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
                Central (684)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                States (4,009)
              </span>
            </div>
            <span className="text-[11px] font-semibold text-slate-400">
              Click any state to view schemes
            </span>
          </div>
        </div>

        {/* CHART 3: Benefit Delivery Mechanisms */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-1.5 text-purple-700 text-xs font-extrabold">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Delivery Mechanism Breakdown</span>
              </div>
              <h4 className="text-base font-bold text-slate-900 mt-0.5">
                Cash Transfer, Credit Subsidies & Health Cover
              </h4>
            </div>
            <span className="text-[10px] px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-bold border border-slate-200">
              Mode of Benefit
            </span>
          </div>

          <div className="space-y-3.5 pt-4">
            {(data?.benefit_types || []).map((bt, idx) => {
              const colors = ['#2563eb', '#9333ea', '#e11d48', '#0d9488', '#f59e0b'];
              const color = colors[idx % colors.length];
              return (
                <div key={bt.type} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">{bt.type}</span>
                    <span className="font-extrabold text-slate-900">
                      {bt.count} <span className="text-slate-400 font-normal">({bt.percentage}%)</span>
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${bt.percentage}%`, backgroundColor: color }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 block">{bt.description}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* CHART 4: Subsidy Value Brackets */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-1.5 text-amber-700 text-xs font-extrabold">
                <IndianRupee className="w-3.5 h-3.5" />
                <span>Subsidy Amount Distribution</span>
              </div>
              <h4 className="text-base font-bold text-slate-900 mt-0.5">
                Financial Assistance Brackets (Histogram)
              </h4>
            </div>
            <span className="text-[10px] px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-bold border border-slate-200">
              Quantum Tiers
            </span>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data?.financial_brackets || []}
                margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="bracket" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip
                  formatter={(val, name, item) => [
                    `${val} Schemes`,
                    item?.payload?.label || 'Target Bracket',
                  ]}
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px',
                    fontWeight: 600,
                  }}
                />
                <Bar dataKey="count" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <p className="text-[11px] text-slate-500 pt-3 border-t border-slate-100">
            Over 53% of all government financial initiatives provide direct cash or wage support under ₹50,000 annually to maximize grassroots coverage.
          </p>
        </div>

      </div>

      {/* Drilldown Schemes Results Grid */}
      {activeFilter && (
        <div className="p-6 rounded-3xl bg-slate-100/70 border border-slate-200/90 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-lg font-black text-slate-900">
                Top Initiatives in "{activeFilter.value}" ({drilldownSchemes.length} sample results)
              </h4>
              <p className="text-xs text-slate-500">
                Interactive preview matching your chart selection. Click any card to inspect statutory requirements.
              </p>
            </div>
            <button
              onClick={() => {
                if (onDrilldownToExplorer) {
                  onDrilldownToExplorer({
                    category: activeFilter.type === 'category' ? activeFilter.value : 'All',
                    state: activeFilter.type === 'state' ? activeFilter.value : 'All',
                  });
                }
              }}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
            >
              <span>View all in Explorer</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {drilldownLoading ? (
            <div className="p-8 text-center text-slate-400 flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
              <span className="text-xs font-semibold">Filtering schemes...</span>
            </div>
          ) : drilldownSchemes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {drilldownSchemes.map((scheme) => (
                <SchemeCard
                  key={scheme.slug}
                  scheme={scheme}
                  isBookmarked={bookmarkedSlugs.includes(scheme.slug)}
                  onToggleBookmark={onToggleBookmark}
                  onViewDetails={onViewSchemeDetails}
                />
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
              No direct schemes found for this filter.
            </div>
          )}
        </div>
      )}

      {/* Interactive Welfare Subsidy Calculator */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-1.5 text-emerald-700 text-xs font-extrabold">
              <Calculator className="w-4 h-4" />
              <span>Interactive Citizen Subsidy Calculator</span>
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 mt-1">
              Estimate Your Family's Annual Welfare Entitlement
            </h3>
            <p className="text-xs text-slate-500">
              Simulate dynamic social security benefits based on demographic parameters and statutory welfare quotas.
            </p>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Estimated Annual Potential
            </span>
            <span className="text-2xl sm:text-3xl font-black text-emerald-600">
              ₹{calculatedEntitlement.totalEstimated.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Sliders and Toggles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Family Members */}
          <div className="space-y-2 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800">
              <span>Family Members</span>
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                {familyMembers} Persons
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={familyMembers}
              onChange={(e) => setFamilyMembers(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <span className="text-[10px] text-slate-500 block">
              Scales PDS ration & educational scholarship allocations.
            </span>
          </div>

          {/* Annual Income */}
          <div className="space-y-2 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800">
              <span>Annual Family Income</span>
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                ₹{annualIncome.toLocaleString()}
              </span>
            </div>
            <input
              type="range"
              min="20000"
              max="1000000"
              step="10000"
              value={annualIncome}
              onChange={(e) => setAnnualIncome(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <span className="text-[10px] text-slate-500 block">
              Determines BPL thresholds and income-tested housing grants.
            </span>
          </div>

          {/* Landholding */}
          <div className="space-y-2 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800">
              <span>Agri Landholding</span>
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                {landAcres} Acres
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="15"
              step="0.5"
              value={landAcres}
              onChange={(e) => setLandAcres(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <span className="text-[10px] text-slate-500 block">
              Unlocks PM-Kisan (₹6,000) & micro-irrigation subsidies.
            </span>
          </div>

        </div>

        {/* Vulnerability Checkboxes */}
        <div className="flex flex-wrap items-center gap-6 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
          <label className="flex items-center gap-2 font-semibold text-slate-800 cursor-pointer">
            <input
              type="checkbox"
              checked={isBpl}
              onChange={(e) => setIsBpl(e.target.checked)}
              className="rounded text-emerald-600 w-4 h-4 accent-emerald-600"
            />
            <span>Below Poverty Line (BPL / AAY Cardholder)</span>
          </label>

          <label className="flex items-center gap-2 font-semibold text-slate-800 cursor-pointer">
            <input
              type="checkbox"
              checked={hasDisability}
              onChange={(e) => setHasDisability(e.target.checked)}
              className="rounded text-emerald-600 w-4 h-4 accent-emerald-600"
            />
            <span>Persons with Disabilities (PwD / दिव्यांग)</span>
          </label>
        </div>

        {/* Entitlement Breakdown Pillars */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-200">
            <span className="text-[10px] font-bold text-blue-700 uppercase block">
              Annual Cash & DBT
            </span>
            <span className="text-lg font-black text-blue-900">
              ₹{calculatedEntitlement.cashDbt.toLocaleString()}
            </span>
            <span className="text-[10px] text-blue-600 block mt-0.5">Direct to Bank Account</span>
          </div>

          <div className="p-3.5 rounded-xl bg-rose-50/80 border border-rose-200">
            <span className="text-[10px] font-bold text-rose-700 uppercase block">
              Healthcare Insurance
            </span>
            <span className="text-lg font-black text-rose-900">
              ₹{calculatedEntitlement.healthInsurance.toLocaleString()}
            </span>
            <span className="text-[10px] text-rose-600 block mt-0.5">Ayushman Bharat Cover</span>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200">
            <span className="text-[10px] font-bold text-emerald-700 uppercase block">
              Asset & Housing Subsidy
            </span>
            <span className="text-lg font-black text-emerald-900">
              ₹{calculatedEntitlement.assetSubsidy.toLocaleString()}
            </span>
            <span className="text-[10px] text-emerald-600 block mt-0.5">PMAY & Agri Kits</span>
          </div>

          <div className="p-3.5 rounded-xl bg-purple-50/80 border border-purple-200">
            <span className="text-[10px] font-bold text-purple-700 uppercase block">
              Educational Grants
            </span>
            <span className="text-lg font-black text-purple-900">
              ₹{calculatedEntitlement.educationGrants.toLocaleString()}
            </span>
            <span className="text-[10px] text-purple-600 block mt-0.5">Scholarships & Fees</span>
          </div>
        </div>

      </div>

    </div>
  );
}
