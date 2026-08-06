import TopMatchesCarousel from "./components/TopMatchesCarousel";
import Link from "next/link";
import {
  Sparkles,
  TrendingUp,
  UploadCloud,
  ChevronRight,
  Activity,
  Tv2,
  CalendarDays,
  Users2,
  Shield,
  Trophy,
  ArrowRight,
  PlayCircle,
  Database
} from "lucide-react";

export default function Home() {
  const nd = new Date();
  const dateConvert = nd.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="w-full max-w-[760px] mx-auto px-4 md:px-0 pb-32 space-y-8 animate-in fade-in duration-500">
      
      {/* ── HERO SECTION ── */}
      <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#0a0f1a] via-[#111827] to-[#1e1b4b] px-6 py-10 shadow-2xl shadow-indigo-900/20">
        {/* Decorative Orbs */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-emerald-500/20 blur-[100px]" />
        <div className="pointer-events-none absolute -left-16 -bottom-16 h-64 w-64 rounded-full bg-indigo-500/20 blur-[100px]" />

        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full bg-white/10 border border-white/5 px-3 py-1 text-xs font-semibold text-emerald-300 backdrop-blur-sm shadow-sm">
              <CalendarDays className="h-3.5 w-3.5" />
              {dateConvert}
            </span>
            <span className="flex items-center gap-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 px-3 py-1 text-xs font-semibold text-rose-400 backdrop-blur-sm animate-pulse shadow-sm">
              <Activity className="h-3.5 w-3.5" />
              Live Season
            </span>
          </div>

          <div className="space-y-3">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
              The Ultimate <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                Football Companion
              </span>
            </h1>
            <p className="text-sm md:text-base text-slate-400 font-medium max-w-[400px] leading-relaxed">
              Experience the beautiful game with real-time analytics, AI tactical breakdowns, and historical squad databases.
            </p>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Link
              href="/fixtures"
              className="inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold px-6 py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5"
            >
              Match Center <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/Livestreamplayer"
              className="inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold px-6 py-3 rounded-xl transition-all hover:border-white/20"
            >
              <PlayCircle className="w-4 h-4 text-rose-400" /> Watch Live
            </Link>
          </div>
        </div>
      </section>

      {/* ── TOP MATCHES CAROUSEL ── */}
      <TopMatchesCarousel />

      {/* ── FEATURE GRID ── */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Teams & Squads */}
        <Link
          href="/teams"
          className="group relative flex flex-col p-5 rounded-[1.5rem] border border-white/5 bg-[#0f1423] hover:bg-[#141b2e] transition-all duration-300 hover:border-emerald-500/30 overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-5 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0 duration-300">
            <ChevronRight className="h-5 w-5 text-emerald-400" />
          </div>
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 w-fit mb-4">
            <Shield className="h-6 w-6 text-emerald-400" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1.5">Teams & Squads</h3>
          <p className="text-xs text-slate-400 leading-relaxed pr-6">
            Dive into comprehensive club profiles. Explore active rosters, historical performance, and detailed team statistics.
          </p>
        </Link>

        {/* Player Database */}
        <Link
          href="/players"
          className="group relative flex flex-col p-5 rounded-[1.5rem] border border-white/5 bg-[#0f1423] hover:bg-[#141b2e] transition-all duration-300 hover:border-purple-500/30 overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-5 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0 duration-300">
            <ChevronRight className="h-5 w-5 text-purple-400" />
          </div>
          <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 w-fit mb-4">
            <Users2 className="h-6 w-6 text-purple-400" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1.5">Player Database</h3>
          <p className="text-xs text-slate-400 leading-relaxed pr-6">
            Scouting metrics, fitness records, and comprehensive career histories for every player on the pitch.
          </p>
        </Link>

        {/* Global Standings */}
        <Link
          href="/standings"
          className="group relative flex flex-col p-5 rounded-[1.5rem] border border-white/5 bg-[#0f1423] hover:bg-[#141b2e] transition-all duration-300 hover:border-amber-500/30 overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-5 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0 duration-300">
            <ChevronRight className="h-5 w-5 text-amber-400" />
          </div>
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 w-fit mb-4">
            <Trophy className="h-6 w-6 text-amber-400" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1.5">Global Standings</h3>
          <p className="text-xs text-slate-400 leading-relaxed pr-6">
            Track league tables, cup brackets, and golden boot races from the top competitions worldwide.
          </p>
        </Link>

        {/* Live Matches */}
        <Link
          href="/fixtures"
          className="group relative flex flex-col p-5 rounded-[1.5rem] border border-white/5 bg-[#0f1423] hover:bg-[#141b2e] transition-all duration-300 hover:border-blue-500/30 overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-5 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0 duration-300">
            <ChevronRight className="h-5 w-5 text-blue-400" />
          </div>
          <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 w-fit mb-4">
            <Database className="h-6 w-6 text-blue-400" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1.5">Match Analytics</h3>
          <p className="text-xs text-slate-400 leading-relaxed pr-6">
            Minute-by-minute updates, expected goals (xG), passing networks, and head-to-head records.
          </p>
        </Link>
      </section>

      {/* ── MATCH TACTICAL STUDIO CTA ── */}
      <Link
        href="/AiAnalysis"
        className="group relative block overflow-hidden rounded-[2rem] border border-indigo-500/20 bg-gradient-to-br from-[#0f1423] to-[#1e1b4b]/40 p-6 shadow-xl transition-all duration-500 hover:border-indigo-500/40 hover:shadow-indigo-500/10"
      >
        <div className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-indigo-500/5 to-transparent transition-transform duration-1000 group-hover:translate-x-[100%]" />
        
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-emerald-400/30 bg-gradient-to-b from-emerald-500/20 to-emerald-500/5 shadow-inner transition-transform group-hover:scale-105">
              <UploadCloud className="h-7 w-7 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <h3 className="text-lg font-bold text-white tracking-wide">Match Tactical Studio</h3>
                <span className="flex items-center gap-1 rounded bg-emerald-500/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-emerald-300 border border-emerald-500/20">
                  <Sparkles className="h-2.5 w-2.5" /> Video Analytics
                </span>
              </div>
              <p className="text-xs md:text-sm text-slate-300/80 leading-relaxed max-w-[400px]">
                Upload match video clips to generate real-time 2D tactical radar pitches, spatial activity heatmaps, player tracking, and possession statistics.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm font-bold text-emerald-400 group-hover:text-emerald-300 transition-colors ml-14 md:ml-0">
            Open Tactical Studio <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </Link>
      
    </div>
  );
}