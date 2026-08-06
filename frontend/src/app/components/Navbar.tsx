"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown, Trophy, Globe, Shield } from "lucide-react";
import { Leagues } from "@/data/leagues";

/* ─── Quick-link categories ─────────────────────────────── */
const QUICK_CATEGORIES = [
  {
    key: "leagues",
    label: "Leagues",
    icon: Shield,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
    items: Leagues.filter((l) => l.category === "league"),
  },
  {
    key: "cups",
    label: "Cups",
    icon: Trophy,
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20",
    items: Leagues.filter((l) => l.category === "cup"),
  },
  {
    key: "international",
    label: "International",
    icon: Globe,
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/20",
    items: Leagues.filter(
      (l) =>
        l.category === "international-club" ||
        l.category === "international-country"
    ).slice(0, 8),
  },
  {
    key: "friendlies",
    label: "Friendlies",
    icon: Globe,
    color: "text-purple-400",
    bg: "bg-purple-500/10 border-purple-500/20",
    items: Leagues.filter((l) => l.category === "friendly"),
  },
];

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Fixtures", href: "/fixtures" },
  { label: "Standings", href: "/standings" },
  { label: "Teams", href: "/teams" },
  { label: "Players", href: "/players" },
  { label: "Live Football", href: "/Livestreamplayer" },
  { label: "Tactical Studio", href: "/AiAnalysis" },
];

/* ─── Quick-Links dropdown (desktop) ───────────────────── */
function QuickLinksDropdown() {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("leagues");
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const active = QUICK_CATEGORIES.find((c) => c.key === activeTab)!;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1 text-sm font-medium transition-colors hover:text-emerald-400 relative group ${
          open ? "text-emerald-400" : "text-neutral-400"
        }`}
      >
        Quick Links
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
        <span
          className={`absolute -bottom-1 left-0 h-0.5 bg-emerald-400 transition-all duration-200 ${
            open ? "w-full" : "w-0 group-hover:w-full"
          }`}
        />
      </button>

      {open && (
        <div className="absolute top-8 left-1/2 -translate-x-1/2 w-[420px] bg-[#0e1424] border border-white/8 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden z-50">
          {/* Category tabs */}
          <div className="flex border-b border-white/5">
            {QUICK_CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveTab(cat.key)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold transition-colors ${
                  activeTab === cat.key
                    ? `${cat.color} border-b-2 border-current`
                    : "text-neutral-500 hover:text-neutral-300"
                }`}
              >
                <cat.icon className="w-3.5 h-3.5" />
                {cat.label}
              </button>
            ))}
          </div>

          {/* League/Cup list */}
          <div className="p-3 grid grid-cols-2 gap-1.5 max-h-72 overflow-y-auto">
            {active.items.map((league) => (
              <Link
                key={league.id}
                href={`/${league.href}`}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/3 hover:bg-white/8 border border-transparent hover:border-white/10 transition-all duration-150 group"
              >
                {league.logo && (
                  <img
                    src={league.logo}
                    alt={league.name}
                    className="w-5 h-5 object-contain shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                )}
                <span className="text-[11px] font-medium text-neutral-300 group-hover:text-white truncate leading-tight">
                  {league.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Mobile Quick-Links accordion ─────────────────────── */
function MobileQuickLinks({ onClose }: { onClose: () => void }) {
  const [openCat, setOpenCat] = useState<string | null>(null);

  return (
    <div className="border-t border-white/5 mt-1 pt-1">
      <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-neutral-600">
        Quick Links
      </p>
      {QUICK_CATEGORIES.map((cat) => (
        <div key={cat.key}>
          <button
            onClick={() =>
              setOpenCat((prev) => (prev === cat.key ? null : cat.key))
            }
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-neutral-400 hover:bg-white/5 hover:text-white transition-colors"
          >
            <span className={`flex items-center gap-2 ${cat.color}`}>
              <cat.icon className="w-4 h-4" />
              {cat.label}
            </span>
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform duration-200 ${
                openCat === cat.key ? "rotate-180" : ""
              }`}
            />
          </button>

          {openCat === cat.key && (
            <div className="ml-3 mr-2 mb-2 grid grid-cols-2 gap-1">
              {cat.items.map((league) => (
                <Link
                  key={league.id}
                  href={`/${league.href}`}
                  onClick={onClose}
                  className="flex items-center gap-2 px-2.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                >
                  {league.logo && (
                    <img
                      src={league.logo}
                      alt={league.name}
                      className="w-4 h-4 object-contain shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  )}
                  <span className="text-[11px] text-neutral-300 truncate">
                    {league.name}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ─── Main Navbar ───────────────────────────────────────── */
const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Fixed top bar */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-[#0f0f1a]/95 backdrop-blur-md shadow-lg shadow-black/40"
            : "bg-[#0f0f1a]/85 backdrop-blur-sm"
        }`}
      >
        <div className="max-w-screen-2xl mx-auto px-4 md:px-8 flex items-center justify-between h-14 md:h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 shrink-0">
            <div className="relative h-8 w-8 md:h-9 md:w-9">
              <Image
                src="/vision11.png"
                alt="Vision 11"
                fill
                className="object-contain"
                priority
              />
            </div>
            <span className="text-xl md:text-2xl font-bold tracking-tight text-white">
              VISION<span className="text-emerald-400">11</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center space-x-6 lg:space-x-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-emerald-400 relative group ${
                  isActive(link.href) ? "text-emerald-400" : "text-neutral-400"
                }`}
              >
                {link.label}
                <span
                  className={`absolute -bottom-1 left-0 h-0.5 bg-emerald-400 transition-all duration-200 ${
                    isActive(link.href) ? "w-full" : "w-0 group-hover:w-full"
                  }`}
                />
              </Link>
            ))}
          </nav>

          {/* Mobile hamburger */}
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((prev) => !prev)}
            className="md:hidden inline-flex items-center justify-center rounded-lg p-2 text-neutral-300 hover:bg-white/10 active:bg-white/20 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile dropdown */}
      {open && (
        <div
          className="fixed top-14 left-0 right-0 z-40 md:hidden"
          onClick={() => setOpen(false)}
        >
          <nav
            className="bg-[#0f0f1a]/98 backdrop-blur-lg border-b border-white/10 shadow-xl shadow-black/50 px-4 py-3 flex flex-col gap-1 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? "bg-emerald-500/15 text-emerald-400"
                    : "text-neutral-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}

            {/* Mobile Quick Links accordion */}
            <MobileQuickLinks onClose={() => setOpen(false)} />
          </nav>
        </div>
      )}
    </>
  );
};

export default Navbar;