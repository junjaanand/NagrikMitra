import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getGlobalStats } from '../../api/client';
import { Layers, MapPin, Users, HeartHandshake, ShieldAlert } from 'lucide-react';

export default function LiveStats() {
  const [stats, setStats] = useState({
    total_schemes: 4693,
    central_schemes: 684,
    state_schemes: 4009,
    categories_count: 25,
    states_count: 37,
    women_schemes_count: 448,
    bpl_schemes_count: 157,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getGlobalStats().then((data) => {
      if (mounted && data) {
        setStats(data);
        setLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const STAT_CARDS = [
    {
      label: 'Verified Welfare Schemes',
      value: stats.total_schemes.toLocaleString(),
      subtext: `${stats.central_schemes} Central + ${stats.state_schemes} State`,
      icon: Layers,
      color: 'text-emerald-600',
    },
    {
      label: 'States & Union Territories',
      value: stats.states_count.toString(),
      subtext: '100% Pan-India Coverage',
      icon: MapPin,
      color: 'text-blue-600',
    },
    {
      label: 'Welfare Categories',
      value: stats.categories_count.toString(),
      subtext: 'Agriculture, Health, Education...',
      icon: Users,
      color: 'text-purple-600',
    },
    {
      label: 'Dedicated Women Schemes',
      value: stats.women_schemes_count.toString(),
      subtext: 'Maternity, Education, Self-Help',
      icon: HeartHandshake,
      color: 'text-rose-600',
    },
    {
      label: 'Targeted BPL Initiatives',
      value: stats.bpl_schemes_count.toString(),
      subtext: 'Subsidies & Antyodaya Support',
      icon: ShieldAlert,
      color: 'text-amber-600',
    },
  ];

  return (
    <section id="stats" className="py-20 bg-slate-900 text-white relative overflow-hidden">
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-slate-950 -z-10" />
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-800/60">
            Real-Time Welfare Footprint
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Unrivaled Scheme Coverage Across India
          </h2>
          <p className="text-base text-slate-400 leading-relaxed">
            Data synchronized directly from official national welfare publications under the Digital
            India framework.
          </p>
        </div>

        {/* Counters Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {STAT_CARDS.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60 backdrop-blur-sm flex flex-col justify-between hover:border-emerald-500/50 transition-colors"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2 rounded-lg bg-slate-700/50 ${stat.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>

                <div>
                  <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-1">
                    {stat.value}
                  </div>
                  <div className="text-xs font-semibold text-slate-200 mb-1 leading-snug">
                    {stat.label}
                  </div>
                  <div className="text-[11px] text-slate-400">{stat.subtext}</div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Footer Note */}
        <div className="mt-12 text-center text-xs text-slate-500">
          * Powered by official scheme records catalogue from Digital India Corporation (MeitY) & National Portal of India.
        </div>
      </div>
    </section>
  );
}
