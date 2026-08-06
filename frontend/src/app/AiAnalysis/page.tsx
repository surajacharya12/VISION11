"use client";

import React, { useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  Attachment,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
} from "@/components/ui/attachment";
import {
  UploadCloud,
  Play,
  CheckCircle2,
  Activity,
  Layers,
  Cpu,
  Download,
  Sparkles,
  ArrowRight,
  Shield,
  BarChart3,
  Video,
  Eye,
  Sliders,
  Target,
  Zap,
  Flame,
  FileVideo,
  FileCheck
} from "lucide-react";

/* ── Analysis Modes Options ── */
const ANALYSIS_MODES = [
  {
    id: "POSSESSION_AND_PASSES",
    label: "Possession & Pass Analytics",
    desc: "Custom Match Analytics Card + 2D Tactical Radar Pitch Overlay",
    icon: BarChart3,
    badge: "Recommended",
  },
  {
    id: "POSSESSION",
    label: "Possession Analytics",
    desc: "Live Ball Possession Percentage Calculation & Card Overlay",
    icon: Activity,
    badge: "Stats",
  },
  {
    id: "PASSES",
    label: "Pass Detection & Analytics",
    desc: "Live Successful Pass Counter & Player Pass Arrow Tracking",
    icon: ArrowRight,
    badge: "Tactics",
  },
  {
    id: "RADAR",
    label: "Tactical Radar Pitch",
    desc: "Real-time 2D Mini-Pitch with Live Team Dots & Movement",
    icon: Target,
    badge: "Popular",
  },
  {
    id: "HEATMAP",
    label: "Spatial Activity Heatmap",
    desc: "Real-time Density Heatmap of Pitch Intensity & Player Spread",
    icon: Flame,
    badge: "Hot",
  },
  {
    id: "PLAYER_TRACKING",
    label: "Player Tracking",
    desc: "Persistent Player Bounding Boxes & ByteTrack IDs",
    icon: Eye,
    badge: "Core",
  },
  {
    id: "PLAYER_DETECTION",
    label: "Player Detection",
    desc: "Bounding Box Detection for On-pitch Players",
    icon: Eye,
    badge: "Detection",
  },
  {
    id: "TEAM_CLASSIFICATION",
    label: "Team Jersey Color Clustering",
    desc: "Automatic SigLIP + K-Means Jersey Color Classification",
    icon: Shield,
    badge: "AI Model",
  },
  {
    id: "BALL_DETECTION",
    label: "Ball Trajectory Slicer",
    desc: "High-speed Sliced Ball Trajectory & Coordinate Tracking",
    icon: Zap,
    badge: "Precision",
  },
  {
    id: "PITCH_DETECTION",
    label: "Pitch Homography Mesh",
    desc: "32-Keypoint Camera Perspective & Field Alignment Mesh",
    icon: Layers,
    badge: "Geometry",
  },
];

/* ── Preset Sample Match Videos ── */
const PRESET_VIDEOS = [
  {
    id: "2e57b9_0.mp4",
    title: "Bundesliga Tactical Clip (2e57b9_0.mp4)",
    desc: "HD Broadcast View • 30 Seconds",
  },
  {
    id: "100001.mp4",
    title: "Full Pitch Scouting Feed (100001.mp4)",
    desc: "Tactical Camera • 60 Seconds",
  },
];

export default function AiAnalysisPage() {
  const [selectedMode, setSelectedMode] = useState<string>("POSSESSION_AND_PASSES");
  const [device, setDevice] = useState<string>("mps");
  const [file, setFile] = useState<File | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<string | null>("2e57b9_0.mp4");

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [outputVideoUrl, setOutputVideoUrl] = useState<string | null>(null);

  const activeModeDetails = ANALYSIS_MODES.find((m) => m.id === selectedMode)!;

  const handleAnalyze = async () => {
    setIsProcessing(true);
    setProgress(10);
    setStatusMessage("Initializing video pipeline and ML models...");

    try {
      const formData = new FormData();
      formData.append("mode", selectedMode);
      formData.append("device", device);

      if (file) {
        formData.append("video", file);
        setStatusMessage("Uploading and analyzing video footage...");
      } else if (selectedPreset) {
        setStatusMessage(`Processing preset match clip (${selectedPreset})...`);
        formData.append("preset_name", selectedPreset);
      } else {
        throw new Error("Please upload a video file or select a preset match clip.");
      }

      // Progress animation
      const interval = setInterval(() => {
        setProgress((prev) => (prev >= 90 ? 90 : prev + 10));
      }, 1000);

      const res = await fetch("http://localhost:8000/api/analyze", {
        method: "POST",
        body: formData,
      });

      clearInterval(interval);

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ detail: `Server error status ${res.status}` }));
        throw new Error(errorData.detail || `Server status ${res.status}`);
      }

      const data = await res.json();
      setProgress(100);
      setStatusMessage("Analysis complete! Video ready for playback below.");

      if (data.filename) {
        setOutputVideoUrl(`http://localhost:8000/api/download/${data.filename}`);
      }
    } catch (err: any) {
      console.error("Video analysis error:", err);
      setProgress(100);
      setStatusMessage(`Analysis failed: ${err.message || "Could not connect to backend server."}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 md:px-6 py-8 pb-32 space-y-10 animate-in fade-in duration-300">
      
      {/* ── HERO BANNER ── */}
      <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-[#0c101d] via-[#111827] to-[#1e1b4b] p-8 md:p-10 shadow-2xl">
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-emerald-500/15 blur-[120px]" />
        <div className="pointer-events-none absolute -left-20 -bottom-20 h-72 w-72 rounded-full bg-indigo-500/15 blur-[120px]" />

        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-400">
              <Activity className="h-3.5 w-3.5" /> Match Tactical Studio
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 text-xs font-semibold text-indigo-300">
              <Sparkles className="h-3.5 w-3.5" /> Computer Vision Engine
            </span>
          </div>

          <div className="max-w-2xl space-y-2">
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
              Match Video Analytics & <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-indigo-400">
                Tactical Breakdown Studio
              </span>
            </h1>
            <p className="text-sm md:text-base text-slate-400 font-medium leading-relaxed">
              Upload match footage or select sample clips, choose your tactical pipeline mode using analyze video output in real time below.
            </p>
          </div>
        </div>
      </div>

      {/* ── INPUT FORM CARD WITH SHADCN UI ── */}
      <div className="rounded-3xl border border-white/10 bg-[#0f1423] p-6 md:p-8 space-y-8 shadow-xl">
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Sliders className="h-5 w-5 text-emerald-400" />
              Configure Video Analysis
            </h2>
            <p className="text-xs text-slate-400">
              Upload file, select mode and device acceleration
            </p>
          </div>
       
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* File Upload Box (Attachment Component) */}
          <div className="lg:col-span-2 space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <UploadCloud className="h-4 w-4 text-indigo-400" />
              1. Upload Match Video Footage
            </label>

            <div className="relative border-2 border-dashed border-white/10 hover:border-emerald-500/50 rounded-2xl p-5 bg-white/[0.02] hover:bg-white/[0.04] transition-all cursor-pointer group">
              <input
                type="file"
                accept="video/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setFile(e.target.files[0]);
                    setSelectedPreset(null);
                  }
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />

              {file ? (
                <Attachment state="done" className="w-full bg-emerald-500/10 border-emerald-500/30">
                  <AttachmentMedia variant="icon">
                    <FileCheck className="h-5 w-5 text-emerald-400" />
                  </AttachmentMedia>
                  <AttachmentContent>
                    <AttachmentTitle className="text-white font-bold">{file.name}</AttachmentTitle>
                    <AttachmentDescription className="text-slate-300">
                      {(file.size / (1024 * 1024)).toFixed(1)} MB • Video ready for processing
                    </AttachmentDescription>
                  </AttachmentContent>
                </Attachment>
              ) : (
                <div className="flex flex-col items-center gap-2 text-center py-2">
                  <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 group-hover:scale-110 transition-transform">
                    <FileVideo className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">Click or Drag & Drop Video File</p>
                    <p className="text-xs text-slate-400">Supports .mp4, .mov, .mkv footage</p>
                  </div>
                </div>
              )}
            </div>

            {/* Preset Clips Selection */}
            <div className="pt-2 space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Or Select Preset Match Clip
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {PRESET_VIDEOS.map((preset) => {
                  const isPresetActive = selectedPreset === preset.id && !file;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        setSelectedPreset(preset.id);
                        setFile(null);
                      }}
                      className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all ${
                        isPresetActive
                          ? "bg-indigo-500/20 border-indigo-500/50 text-white shadow-md"
                          : "bg-white/3 border-white/5 text-slate-400 hover:bg-white/8"
                      }`}
                    >
                      <Play className="h-4 w-4 text-emerald-400 shrink-0" />
                      <div className="overflow-hidden">
                        <p className="text-xs font-bold truncate text-white">{preset.title}</p>
                        <p className="text-[10px] text-slate-400">{preset.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Mode & Device Selectors (Shadcn UI Select) */}
          <div className="space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              
              {/* Mode Select */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <Target className="h-4 w-4 text-emerald-400" />
                  2. Select Analysis Mode
                </label>

                <Select value={selectedMode} onValueChange={(val: string) => setSelectedMode(val)}>
                  <SelectTrigger className="w-full bg-[#151c30] border-white/10 text-white h-11 px-3.5 rounded-xl">
                    <SelectValue placeholder="Select mode..." />
                  </SelectTrigger>
                  <SelectContent className="bg-[#151c30] border border-white/10 text-white rounded-xl">
                    <SelectGroup>
                      <SelectLabel className="text-emerald-400 font-bold text-xs uppercase px-2 py-1">
                        Tactical Pipelines
                      </SelectLabel>
                      {ANALYSIS_MODES.map((m) => (
                        <SelectItem key={m.id} value={m.id} className="focus:bg-white/10 text-xs py-2">
                          <span className="font-bold">{m.label}</span>
                          <span className="ml-2 text-[10px] text-slate-400">({m.badge})</span>
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>

                <div className="p-3 rounded-xl bg-white/3 border border-white/5 text-xs text-slate-300">
                  <span className="font-bold text-emerald-400">{activeModeDetails.label}: </span>
                  <span>{activeModeDetails.desc}</span>
                </div>
              </div>

              {/* Hardware Device Select */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-cyan-400" />
                  3. Hardware Device Acceleration
                </label>

                <Select value={device} onValueChange={(val: string) => setDevice(val)}>
                  <SelectTrigger className="w-full bg-[#151c30] border-white/10 text-white h-11 px-3.5 rounded-xl">
                    <SelectValue placeholder="Select device..." />
                  </SelectTrigger>
                  <SelectContent className="bg-[#151c30] border border-white/10 text-white rounded-xl">
                    <SelectItem value="mps" className="focus:bg-white/10 text-xs">
                      Apple MPS (GPU Metal Acceleration)
                    </SelectItem>
                    <SelectItem value="cpu" className="focus:bg-white/10 text-xs">
                      Standard CPU Inference
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

            </div>

            {/* Submit Action Button */}
            <div className="pt-2">
              <Button
                disabled={isProcessing}
                onClick={handleAnalyze}
                size="lg"
                className="w-full h-12 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-neutral-950 font-black text-sm rounded-xl shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <Spinner className="h-4 w-4 text-neutral-950" />
                    Processing Video...
                  </>
                ) : (
                  <>
                    Run Tactical Analysis <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>

          </div>

        </div>

        {/* Progress & Status Message */}
        {isProcessing && (
          <div className="space-y-2 pt-2 animate-in fade-in">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300">
              <span className="flex items-center gap-2">
                <Spinner className="h-3.5 w-3.5 text-emerald-400" />
                {statusMessage}
              </span>
              <span className="text-emerald-400">{progress}%</span>
            </div>
            <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* ── DISPLAY ANALYZED OUTPUT BELOW ── */}
      <section className="space-y-6 pt-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-wide flex items-center gap-2">
              <Video className="h-6 w-6 text-emerald-400" />
              Analyzed Output Video & Tactical Breakdown
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Video rendering and live analytics metrics displayed directly below
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Output Video Player */}
          <div className="lg:col-span-2 rounded-3xl border border-white/10 bg-[#0a0e1a] overflow-hidden shadow-2xl flex flex-col justify-between">
            <div className="relative aspect-video w-full bg-black flex items-center justify-center">
              {outputVideoUrl ? (
                <video
                  key={outputVideoUrl}
                  controls
                  autoPlay
                  loop
                  muted
                  className="w-full h-full object-contain"
                >
                  <source src={outputVideoUrl} type="video/mp4" />
                  Your browser does not support video playback.
                </video>
              ) : (
                <div className="flex flex-col items-center gap-3 p-10 text-center">
                  <div className="p-4 rounded-full bg-white/5 border border-white/10 text-slate-500">
                    <Play className="h-8 w-8 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-base font-bold text-white">No Analysis Video Loaded Yet</p>
                    <p className="text-xs text-slate-400 max-w-sm mt-1">
                      Configure your mode above and click "Run Tactical Analysis" to render the output video here.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-[#0d1222] border-t border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Active Mode: <span className="text-emerald-400 font-bold">{selectedMode}</span>
              </div>

              {outputVideoUrl && (
                <a
                  href={outputVideoUrl}
                  download="tactical_match_analysis.mp4"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-3.5 py-1.5 rounded-xl transition-colors"
                >
                  <Download className="h-3.5 w-3.5" /> Download Video
                </a>
              )}
            </div>
          </div>

     

        </div>
      </section>

    </div>
  );
}