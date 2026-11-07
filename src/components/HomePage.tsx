import React from 'react';
import { Brain, Heart, Globe, Award, ChevronRight, Activity, Cpu, Shield, Sparkles, BookOpen, Layers, Zap, Users } from 'lucide-react';
import { motion } from 'motion/react';

interface HomePageProps {
  onNavigate: (tab: 'student' | 'teacher' | 'parent') => void;
}

export default function HomePage({ onNavigate }: HomePageProps) {
  // Highlights corresponding to SDGs
  const sdgGoals = [
    {
      number: "3",
      title: "Health & Well-Being",
      desc: "Monitors cognitive fatigue and recommends quick breathing exercises and posture adjustments.",
      color: "from-emerald-500 to-teal-600",
      bg: "bg-slate-900/60"
    },
    {
      number: "4",
      title: "Quality Education",
      desc: "Delivers responsive tutoring content and customized review sessions mapped directly to focus levels.",
      color: "from-red-500 to-rose-600",
      bg: "bg-slate-900/60"
    },
    {
      number: "9",
      title: "Industry & Innovation",
      desc: "Leverages an ultra-low-cost, offline-capable ESP32-S3 band running quantized edge AI intelligence.",
      color: "from-amber-500 to-yellow-600",
      bg: "bg-slate-900/60"
    },
    {
      number: "10",
      title: "Reduced Inequalities",
      desc: "Empowers rural and underserved centers via fully subsidized hardware grants funded by premium school tiers.",
      color: "from-indigo-500 to-blue-600",
      bg: "bg-slate-900/60"
    }
  ];

  return (
    <div className="space-y-10" id="homepage_container">
      
      {/* 1. HERO SPOTLIGHT DISPLAY */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 p-8 md:p-10 flex flex-col md:flex-row items-center gap-8 shadow-xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.08),transparent_50%)]" />
        
        <div className="flex-1 space-y-4 relative z-10">
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-indigo-950/40 border border-indigo-800/60 text-[9px] font-mono font-bold text-indigo-400 uppercase tracking-widest">
            <Sparkles className="h-3 w-3" />
            <span>Neuro-Educational Innovation Project</span>
          </span>
          
          <h2 className="text-2xl md:text-4xl font-black tracking-tight leading-tight text-slate-100 font-sans max-w-xl">
            Adaptive Mentorship Powered by <span className="bg-gradient-to-r from-indigo-400 via-sky-400 to-emerald-400 bg-clip-text text-transparent">Live Brainwaves</span>
          </h2>
          
          <p className="text-slate-400 text-xs md:text-sm leading-relaxed max-w-lg">
            NeuroLearn AI is an accessible, offline-first neuro-educational ecosystem. By parsing frontal differential EEG waves, heart rate variability, and skin response, it customizes tutoring pacing in real time while optimizing student wellness.
          </p>

          <div className="flex flex-wrap gap-2.5 pt-1">
            <button
              onClick={() => onNavigate('student')}
              className="bg-indigo-600 hover:bg-indigo-500 text-slate-100 font-bold text-xs px-5 py-2.5 rounded-lg duration-150 cursor-pointer flex items-center gap-1.5 shadow-md shadow-indigo-600/10"
            >
              Launch Student Workspace
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => onNavigate('teacher')}
              className="bg-slate-900 hover:bg-slate-800 text-slate-350 font-bold text-xs px-5 py-2.5 rounded-lg duration-150 cursor-pointer border border-slate-800 flex items-center gap-1.5"
            >
              Open Teacher Heatmap
            </button>
          </div>
        </div>

        {/* Decorative Vector Wave Display */}
        <div className="w-full md:w-80 h-44 relative bg-slate-950 rounded-xl border border-slate-800 p-4 flex flex-col justify-between overflow-hidden">
          <div className="flex justify-between items-center text-[9px] text-slate-500 font-mono font-bold uppercase tracking-wider">
            <span>FP1/FP2 Differential</span>
            <span className="text-emerald-400 flex items-center gap-1 animate-pulse">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span> Live EEG
            </span>
          </div>

          <div className="relative h-20 my-auto">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-16 w-16 bg-indigo-500/5 blur-xl rounded-full" />
            
            <svg className="w-full h-full text-indigo-400 stroke-current opacity-70" viewBox="0 0 300 100" fill="none">
              <path d="M 0,50 Q 25,10 50,50 T 100,50 T 150,20 T 200,80 T 250,50 T 300,50" strokeWidth="2" />
              <path d="M 0,50 Q 25,80 50,40 T 100,70 T 150,30 T 200,60 T 250,40 T 300,50" className="text-emerald-400" strokeWidth="1" strokeDasharray="3,3" />
            </svg>
          </div>

          <div className="grid grid-cols-3 gap-1.5 text-center text-[9px] font-mono text-slate-400">
            <div className="bg-slate-900 py-0.5 rounded">Beta: 18uV</div>
            <div className="bg-slate-900 py-0.5 rounded">Attn: 94%</div>
            <div className="bg-slate-900 py-0.5 rounded">GSR: 2.4uS</div>
          </div>
        </div>
      </section>

      {/* 2. CORE STATEMENT: THE INVISIBLE STRUGGLE */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-slate-900/30 p-6 md:p-8 rounded-2xl border border-slate-800/80">
        <div className="space-y-3">
          <h3 className="text-xs uppercase font-bold tracking-widest text-indigo-400 flex items-center gap-1.5">
            <Shield className="h-4 w-4 text-indigo-400" />
            Cognitive Diagnostics
          </h3>
          <h4 className="text-xl font-bold text-slate-100 font-sans tracking-tight">
            Traditional software tracks progress blindly. NeuroLearn parses real-time stress signals.
          </h4>
          <p className="text-slate-400 text-xs leading-relaxed">
            When students wrestle with dense topics, their brain state fluctuates. Rather than rushing ahead, NeuroLearn intercepts theta fatigue or skin stress spikes to recommend gentle mind breaks.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
            <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider block mb-1">Attention Loss</span>
            <p className="text-slate-400 text-xs leading-relaxed">
              Spots distracted states before students drift off-task.
            </p>
          </div>
          <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
            <span className="text-[10px] text-yellow-400 font-bold uppercase tracking-wider block mb-1">Stress Spikes</span>
            <p className="text-slate-400 text-xs leading-relaxed">
              Detects performance pressure on tough lessons early.
            </p>
          </div>
          <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block mb-1">Fatigue Build-Up</span>
            <p className="text-slate-400 text-xs leading-relaxed">
              Enforces quiet screen detoxes and relaxation breaks.
            </p>
          </div>
          <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
            <span className="text-[10px] text-sky-400 font-bold uppercase tracking-wider block mb-1">Burnout Analysis</span>
            <p className="text-slate-400 text-xs leading-relaxed">
              Helps teachers build gentle, personalized intervention plans.
            </p>
          </div>
        </div>
      </section>

      {/* 3. CORE SDGs ENGINES */}
      <section className="space-y-4">
        <div className="text-center space-y-0.5">
          <h3 className="text-xs uppercase font-bold tracking-widest text-sky-400 flex justify-center items-center gap-1">
            <Globe className="h-4 w-4 text-sky-400" />
            Sustainable Development Goals
          </h3>
          <h4 className="text-xl font-bold text-slate-100 font-sans tracking-tight">Focusing on Social Equity</h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {sdgGoals.map((sdg, index) => (
            <div key={index} className={`${sdg.bg} border border-slate-800 rounded-xl p-4.5 flex flex-col justify-between h-42 hover:border-slate-700 transition-colors`}>
              <div>
                <span className={`inline-flex items-center justify-center h-6 w-16 rounded bg-gradient-to-r ${sdg.color} text-white font-mono text-[9px] font-bold`}>
                  SDG {sdg.number}
                </span>
                <strong className="text-xs font-bold text-slate-200 block mt-3 leading-tight">{sdg.title}</strong>
              </div>
              <p className="text-slate-400 text-[10px] leading-relaxed mt-2">{sdg.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. THE GOOGLE STACK CLOUD INFRASTRUCTURE */}
      <section className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 shadow-md space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-2">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400">Google Workspace & Cloud Stack</h3>
            <p className="text-xs text-slate-400">Integrated serverless edge-to-cloud security blueprint</p>
          </div>
          <span className="text-[10px] bg-indigo-950 text-indigo-400 font-mono px-2 py-0.5 rounded border border-indigo-900/40">
            System Infrastructure Secured
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <span className="text-sky-400 font-bold block mb-1">Adaptive Tutoring (Gemini)</span>
            <p className="text-slate-400 text-xs leading-relaxed">
              Express servers route session biometrics directly to the Gemini API, adjusting instructional content pacing instantly.
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <span className="text-indigo-400 font-bold block mb-1">Vertex AI Pipelines</span>
            <p className="text-slate-400 text-xs leading-relaxed">
              Cognitive logs sync with BigQuery datasets to evaluate continuous attention metrics and improve evaluation.
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <span className="text-emerald-400 font-bold block mb-1">Firebase Persistence</span>
            <p className="text-slate-400 text-xs leading-relaxed">
              Secure Firestore structures capture student reports, wellness analytics, and active support requests reliably.
            </p>
          </div>
        </div>
      </section>

      {/* 5. HARDWARE BLUEPRINTS */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        <div className="lg:col-span-5 space-y-3.5">
          <h3 className="text-xs uppercase font-bold tracking-widest text-yellow-500 flex items-center gap-1.5">
            <Cpu className="h-4 w-4 text-yellow-500" />
            Hardware & Edge Specs
          </h3>
          <h4 className="text-xl font-bold text-slate-100 font-sans tracking-tight">
            Designed for rural schools. Build cost: $32.
          </h4>
          <p className="text-slate-400 text-xs leading-relaxed">
            By avoiding costly components, we utilize custom injection-molded silicone band casings connected to standard ESP32 dual-core processors. Real-time digital signal processing happens entirely offline to protect student privacy.
          </p>

          <div className="pt-1 select-none">
            <span className="inline-flex items-center gap-1.5 bg-yellow-950/30 text-yellow-500 border border-yellow-900/40 text-[9.5px] font-mono font-bold px-2.5 py-1 rounded-lg">
              <span className="h-1.5 w-1.5 rounded-full bg-yellow-500 animate-pulse" />
              100% Offline Signal Processing
            </span>
          </div>
        </div>

        <div className="lg:col-span-7 bg-slate-900/40 rounded-xl border border-slate-800 p-5 space-y-3">
          <span className="text-[10px] text-slate-500 font-mono font-bold uppercase tracking-wider block">Sensor Nodes Assignment</span>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-slate-950 p-3 rounded bg-slate-950 border border-slate-800">
              <strong className="text-sky-400 text-[11px] font-bold block mb-1">Differential EEG</strong>
              <p className="text-[10px] text-slate-400 leading-relaxed">FP1/FP2 frontal nodes monitor relaxed alpha and active beta waves.</p>
            </div>
            
            <div className="bg-slate-950 p-3 rounded bg-slate-950 border border-slate-800">
              <strong className="text-red-400 text-[11px] font-bold block mb-1">PPG HRV Sensor</strong>
              <p className="text-[10px] text-slate-400 leading-relaxed">MAX30102 captures pulse interval ratios to measure sympathetic tone.</p>
            </div>

            <div className="bg-slate-950 p-3 rounded bg-slate-950 border border-slate-800">
              <strong className="text-yellow-400 text-[11px] font-bold block mb-1">MPU6050 Motion</strong>
              <p className="text-[10px] text-slate-400 leading-relaxed">Registers tilt coordinates to watch student posture and physical slouching.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. SYSTEM GATEWAYS (PORTALS INDEX) */}
      <section className="space-y-3 pt-6 border-t border-slate-800">
        <h3 className="text-xs uppercase font-bold tracking-widest text-slate-500 font-mono">Launch Portals</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            onClick={() => onNavigate('student')}
            className="p-4.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="space-y-1">
              <Brain className="h-5 w-5 text-sky-400 mb-1" />
              <strong className="text-xs font-bold text-slate-200 block group-hover:text-sky-400 transition-colors">1. Student Workspace</strong>
              <p className="text-[11px] text-slate-400 leading-relaxed">Toggle live EEG waves, chat with Gemini tutor, and tackle adaptive quiz modules.</p>
            </div>
            <span className="text-[10px] text-sky-400 font-semibold flex items-center gap-0.5 mt-3">Open Portal <ChevronRight className="h-3.5 w-3.5" /></span>
          </div>

          <div
            onClick={() => onNavigate('teacher')}
            className="p-4.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="space-y-1">
              <Users className="h-5 w-5 text-emerald-400 mb-1" />
              <strong className="text-xs font-bold text-slate-200 block group-hover:text-emerald-400 transition-colors">2. Teacher Panel</strong>
              <p className="text-[11px] text-slate-400 leading-relaxed">Monitor engagement seat charts, trigger visual breaks, and audit alert signals.</p>
            </div>
            <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-0.5 mt-3">Open Portal <ChevronRight className="h-3.5 w-3.5" /></span>
          </div>

          <div
            onClick={() => onNavigate('parent')}
            className="p-4.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="space-y-1">
              <Heart className="h-5 w-5 text-purple-400 mb-1" />
              <strong className="text-xs font-bold text-slate-200 block group-hover:text-purple-400 transition-colors">3. Parent Support Hub</strong>
              <p className="text-[11px] text-slate-400 leading-relaxed">Query Athena wellness tips, adjust device safe thresholds, and review sleep waves.</p>
            </div>
            <span className="text-[10px] text-purple-400 font-semibold flex items-center gap-0.5 mt-3">Open Portal <ChevronRight className="h-3.5 w-3.5" /></span>
          </div>
        </div>
      </section>

    </div>
  );
}
