import React from 'react';
import { motion } from 'framer-motion';
import { Users, Award, Mail, GraduationCap } from 'lucide-react';

const TEAM_MEMBERS = [
  {
    name: 'Lead Full-Stack Architect',
    role: 'Frontend & System Integration',
    college: 'B.Tech Computer Science & Engineering',
    focus: 'React 18 Architecture, Deterministic Rule Engine, Supabase Auth',
    tag: 'Project Lead',
    tagColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    avatar: '👨‍💻',
  },
  {
    name: 'AI & Vision Specialist',
    role: 'Computer Vision & OCR Pipeline',
    college: 'B.Tech Computer Science & Engineering',
    focus: 'Tesseract 5.0 OCR, Image Preprocessing, Camera Stream',
    tag: 'Core Engineer',
    tagColor: 'bg-blue-100 text-blue-800 border-blue-200',
    avatar: '👁️',
  },
  {
    name: 'NLP & Data Engineer',
    role: 'RAG Knowledge & Database Ops',
    college: 'B.Tech Computer Science & Engineering',
    focus: 'Groq & Gemini Fallback, ChromaDB Embeddings, SQLite Schema',
    tag: 'Core Engineer',
    tagColor: 'bg-purple-100 text-purple-800 border-purple-200',
    avatar: '🤖',
  },
];

export default function TeamProfiles() {
  return (
    <section id="team" className="py-24 bg-white border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/60 inline-flex items-center gap-1.5">
            <GraduationCap className="w-3.5 h-3.5" />
            Engineering Design Capstone
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            The Team Behind NagrikMitra
          </h2>
          <p className="text-base text-slate-600 leading-relaxed">
            Developed as an academic major engineering capstone project addressing the national
            challenge of citizen welfare awareness and accessibility.
          </p>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {TEAM_MEMBERS.map((member, i) => (
            <motion.div
              key={member.role}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-white hover:border-emerald-300 hover:shadow-lg transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-2xl shadow-xs">
                    {member.avatar}
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${member.tagColor}`}
                  >
                    {member.tag}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900">{member.name}</h3>
                <p className="text-xs font-semibold text-emerald-700 mt-0.5">{member.role}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{member.college}</p>

                <div className="mt-4 p-3 rounded-xl bg-white border border-slate-100 text-xs text-slate-600">
                  <span className="font-semibold text-slate-800 block text-[11px] uppercase mb-1">
                    Key Contributions:
                  </span>
                  {member.focus}
                </div>
              </div>

              {/* Social Links */}
              <div className="mt-6 pt-3 border-t border-slate-200 flex items-center gap-3 text-slate-400">
                <a href="#" className="hover:text-slate-800 transition-colors" title="GitHub">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                  </svg>
                </a>
                <a href="#" className="hover:text-blue-600 transition-colors" title="LinkedIn">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                </a>
                <a href="#" className="hover:text-emerald-600 transition-colors" title="Email">
                  <Mail className="w-4 h-4" />
                </a>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Project Mentor & Institutional Attribution Box */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold">Faculty Mentor & Project Guide</h4>
              <p className="text-xs text-slate-300 mt-0.5">
                Department of Computer Science & Engineering • Academic Session 2025–2026
              </p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              Final Year Capstone Project
            </span>
          </div>
        </div>

      </div>
    </section>
  );
}
