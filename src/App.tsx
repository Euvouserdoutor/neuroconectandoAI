import React, { useState, useEffect, useRef } from 'react';
import { Brain, Users, Home, Cpu, Database, ShieldCheck, Award, Activity, Heart, Info, Globe, AlertTriangle, LifeBuoy, X, Sparkles, Play, Pause, Clock, Zap, Sliders, FlaskConical, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  Line
} from 'recharts';
import { CognitiveState, BiometricState } from './types';
import HomePage from './components/HomePage';
import StudentWorkspace from './components/StudentWorkspace'; import TeacherDashboard from './components/TeacherDashboard';
import ParentDashboard from './components/ParentDashboard';
import BiometricHealthLog from './components/BiometricHealthLog';
import { sendDistressSignal, DistressSignal } from './lib/firebase';
import WellnessCompanionSidebar from './components/WellnessCompanionSidebar';
import SystemArchitecture from './components/SystemArchitecture';
import CloudAndVertex from './components/CloudAndVertex';
import EthicsAndXAI from './components/EthicsAndXAI';
import ResearchAcademicSandbox from './components/ResearchAcademicSandbox';
import WellnessRecommendations from './components/WellnessRecommendations';

const generateInitialPulseHistory = (): { time: string; intensity: number }[] => {
  const data = [];
  const now = Date.now();
  for (let i = 29; i >= 0; i--) {
    const secsAgo = i === 0 ? 'Now' : `-${i * 2}s`;
    const baseWave = 65 + Math.sin(i * 0.45) * 12 + Math.cos(i * 0.9) * 3;
    const noise = Math.random() * 5 - 2.5;
    data.push({
      time: secsAgo,
      intensity: Math.min(100, Math.max(10, Math.round(baseWave + noise)))
    });
  }
  return data;
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'student' | 'teacher' | 'parent' | 'arch' | 'cloud' | 'ethics' | 'research'>('home');
  const [devMode, setDevMode] = useState(false);

  // Real-time Cognitive Pulse telemetries (last 60 seconds / 2-second interval)
  const [pulseHistory, setPulseHistory] = useState(() => generateInitialPulseHistory());
  const [isPulseModalOpen, setIsPulseModalOpen] = useState(false);
  const [isStreamPaused, setIsStreamPaused] = useState(false);
  const [pulseModalTab, setPulseModalTab] = useState<'live' | 'log'>('live');
  const [showPulseTrends, setShowPulseTrends] = useState(false);

  // Calculate 10-second moving average for the latest point in the 60s live history window
  const lastPulseIdx = pulseHistory.length - 1;
  const pulseSubset = pulseHistory.slice(Math.max(0, lastPulseIdx - 4), lastPulseIdx + 1);
  const pulseSum = pulseSubset.reduce((acc, curr) => acc + curr.intensity, 0);
  const latest10sMA = pulseSubset.length > 0 ? Math.round((pulseSum / pulseSubset.length) * 10) / 10 : 0;
  const pulseBaselineVal = 68;
  const pulseDeviationPercent = Math.round(((latest10sMA - pulseBaselineVal) / pulseBaselineVal) * 100);
  const isPulseTrendThresholdCrossed = Math.abs(pulseDeviationPercent) >= 15;

  // Shared Biometric / Cognitive states for the live simulation
  const [cognitive, setCognitive] = useState<CognitiveState>({
    attention: 'High',
    stress: 'Low',
    fatigue: 'Low'
  });

  const [biometric, setBiometric] = useState<BiometricState>({
    hrv: 78,
    gsr: 2.4,
    headMovement: 'Stable',
    heartRate: 70,
    temperature: 36.60,
    movingAvg5s: 70,
    dailyBaseline: 72.00
  });

  // 5-second moving average queues and rolling baseline calculation effect
  const [hrWindow, setHrWindow] = useState<{ value: number; time: number }[]>([]);

  // Cache current heart rate to allow interval to run smoothly without clearing on every heartbeat
  const currentHrRef = useRef(biometric.heartRate);
  useEffect(() => {
    currentHrRef.current = biometric.heartRate;
  }, [biometric.heartRate]);

  useEffect(() => {
    const handleBiometricsUpdate = setInterval(() => {
      const now = Date.now();
      const currentHr = currentHrRef.current;

      setHrWindow(prev => {
        const threshold = now - 5000;
        const valid = prev.filter(item => item.time > threshold);
        const next = [...valid, { value: currentHr, time: now }];
        
        // Compute 5-second moving average
        const avg = Math.round(next.reduce((sum, item) => sum + item.value, 0) / next.length);
        
        // Initialize or update the daily rolling baseline slowly (exponential decay factor alpha = 0.05)
        setBiometric(current => {
          const currentBaseline = current.dailyBaseline ?? 72;
          const nextBaseline = Number((currentBaseline * 0.95 + currentHr * 0.05).toFixed(2));
          
          if (current.movingAvg5s === avg && current.dailyBaseline === nextBaseline) {
            return current;
          }
          return {
            ...current,
            movingAvg5s: avg,
            dailyBaseline: nextBaseline
          };
        });

        return next;
      });
    }, 1000);

    return () => clearInterval(handleBiometricsUpdate);
  }, []);

  const [highStressCount, setHighStressCount] = useState(0);

  // Tracks switches from 'Optimal' to either 'High Stress' or 'Low Attention' for more than 10 seconds
  const [pulseToast, setPulseToast] = useState<{
    message: string;
    type: 'stress' | 'attention';
    timestamp: string;
  } | null>(null);

  // Track recent high-stress occurrences over the active session
  useEffect(() => {
    if (cognitive.stress === 'High') {
      setHighStressCount(prev => prev + 1);
    }
  }, [cognitive.stress]);

  useEffect(() => {
    const currentState = cognitive.stress === 'High' ? 'High Stress' : cognitive.attention === 'Low' ? 'Low Attention' : 'Optimal';

    if (currentState === 'Optimal') {
      // Switched back to Optimal - automatically dismiss the warning toast
      setPulseToast(null);
      return;
    }

    // Set a timer for 10 seconds (10000ms) to trigger a warning toast
    const timer = setTimeout(() => {
      const type = currentState === 'High Stress' ? 'stress' : 'attention';
      const message = currentState === 'High Stress'
        ? "Alex Mercer's neural sensors indicate sustained High Stress level for over 10 seconds. Recommending a breathing break."
        : "Low Attention span detected for over 10 seconds. Try launching a gamified quiz module to regain focus alignment.";
      
      setPulseToast({
        message,
        type,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      });
    }, 10000);

    return () => clearTimeout(timer);
  }, [cognitive.stress, cognitive.attention]);

  // Telemetry loop for simulating real-time brain pulses
  useEffect(() => {
    if (isStreamPaused) return;

    const interval = setInterval(() => {
      setPulseHistory((prev) => {
        const next = prev.slice(1).map((item, idx) => {
          const secs = (30 - idx - 1) * 2;
          return {
            ...item,
            time: `-${secs}s`
          };
        });

        const baseWave = 68 + Math.sin(Date.now() / 8000) * 12 + Math.cos(Date.now() / 3000) * 4;
        const attentionMultiplier = cognitive.attention === 'High' ? 6 : cognitive.attention === 'Low' ? -12 : 0;
        const fatigueMultiplier = cognitive.fatigue === 'High' ? -8 : 0;
        const noise = Math.random() * 6 - 3;
        
        const newIntensity = Math.min(100, Math.max(10, Math.round(baseWave + attentionMultiplier + fatigueMultiplier + noise)));

        next.push({
          time: 'Now',
          intensity: newIntensity
        });

        return next;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [isStreamPaused, cognitive]);

  // Emergency help distress states
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [emergencyMessage, setEmergencyMessage] = useState('Elevated fatigue / stress threshold limit crossed during intensive research block. Seeking advisor assistance.');
  const [customEmergencyText, setCustomEmergencyText] = useState('');
  const [isSendingEmergency, setIsSendingEmergency] = useState(false);
  const [emergencySuccess, setEmergencySuccess] = useState<string | null>(null);
  const [emergencyError, setEmergencyError] = useState<string | null>(null);

  const handleTriggerEmergency = async () => {
    setIsSendingEmergency(true);
    setEmergencySuccess(null);
    setEmergencyError(null);

    const finalMessage = customEmergencyText.trim() || emergencyMessage;

    const signal: DistressSignal = {
      studentId: 'student_alex',
      studentName: 'Alex Mercer',
      message: finalMessage,
      attentionSnapshot: cognitive.attention,
      stressSnapshot: cognitive.stress,
      heartRateSnapshot: biometric.heartRate
    };

    try {
      await sendDistressSignal(signal);
      setEmergencySuccess("Incident signal successfully broadcasted to Cloud DB!");
      setCustomEmergencyText('');
    } catch (err) {
      console.error(err);
      setEmergencyError("Network latency or offline status detected. Signal preserved in offline core safely.");
    } finally {
      setIsSendingEmergency(false);
    }
  };

  // State-Adaptive Themes properties definition
  const isHighStress = cognitive.stress === 'High';
  const isLowAttention = cognitive.attention === 'Low';

  let themeContainerClass = "bg-slate-950 text-slate-100 transition-colors duration-1000";
  let themeBadgeText = "Standard Slate Mode";
  let themeBadgeColor = "text-emerald-450 bg-emerald-950/25 border-emerald-900/40 text-emerald-400";
  let themeDescription = "Cranial parameters baseline neutral. Default dark layout active.";
  let themeAccentText = "text-emerald-400";
  let themeIconComponent = <Sparkles className="h-4 w-4 text-emerald-400" />;
  
  if (isHighStress) {
    themeContainerClass = "bg-gradient-to-b from-[#060410] via-[#090b20] to-[#0e0719] text-indigo-50 transition-colors duration-1000 selection:bg-purple-900 selection:text-white";
    themeBadgeText = "Calming Lavender-Indigo Mode";
    themeBadgeColor = "text-purple-400 bg-purple-950/40 border-purple-900/60 font-bold animate-pulse";
    themeDescription = "EEG telemetry indicates high stress. Calming deep lavender/indigo tones applied to induce systemic relaxation & lower cognitive load.";
    themeAccentText = "text-purple-400";
    themeIconComponent = <Heart className="h-4 w-4 text-purple-400 animate-pulse" />;
  } else if (isLowAttention) {
    themeContainerClass = "bg-gradient-to-tr from-[#0a0a09] via-[#241304] to-[#0d0701] text-amber-50 transition-colors duration-1000 selection:bg-amber-900 selection:text-white border-t-2 border-amber-600/45";
    themeBadgeText = "Vibrant Neuro-Stimulus Mode";
    themeBadgeColor = "text-amber-400 bg-amber-955/50 border-amber-950/60 font-black animate-pulse";
    themeDescription = "EEG telemetry indicates low focus. High-contrast energetic orange/gold highlights applied to stimulate wearer alertness.";
    themeAccentText = "text-amber-400";
    themeIconComponent = <Zap className="h-4 w-4 text-amber-400 animate-bounce" />;
  }
  
  let pulseColorClass = 'text-emerald-400';
  let pulseBgClass = 'bg-emerald-400';
  let pulseBorderClass = 'border-emerald-500/30';
  let pulseStatusText = 'Cognitive Pulse';
  let graphColor = '#10b981'; // emerald
  let pingBgClass = 'bg-emerald-400';
  
  if (isHighStress) {
    pulseColorClass = 'text-red-400';
    pulseBgClass = 'bg-red-400';
    pulseBorderClass = 'border-red-500/30';
    pulseStatusText = 'Pulse: High Stress';
    graphColor = '#f43f5e'; // rose/red
    pingBgClass = 'bg-red-400';
  } else if (isLowAttention) {
    pulseColorClass = 'text-amber-400';
    pulseBgClass = 'bg-amber-400';
    pulseBorderClass = 'border-amber-500/30';
    pulseStatusText = 'Pulse: Low Focus';
    graphColor = '#f59e0b'; // amber
    pingBgClass = 'bg-amber-400';
  }

  // Dynamic baseline threshold calculations
  const baselineY = 68;
  const optimalMin = 60;
  const optimalMax = 78;
  const currentIntensity = pulseHistory[pulseHistory.length - 1]?.intensity || 0;
  
  let thresholdLineColor = '#10b981'; // calming emerald for optimal range
  let thresholdStatusText = 'Optimal (68%)';
  if (currentIntensity > optimalMax) {
    thresholdLineColor = '#f43f5e'; // warning rose/red for high hyperactive spikes
    thresholdStatusText = 'High Stress Alert';
  } else if (currentIntensity < optimalMin) {
    thresholdLineColor = '#f59e0b'; // warning amber/yellow for low-focus drop-offs
    thresholdStatusText = 'Low Focus Alert';
  }

  return (
    <div className={`min-h-screen ${themeContainerClass} flex flex-col font-sans`} id="neurolearn-root-container">
      
      {/* GLOBAL STICKY HEADER & NAVIGATION WRAPPER */}
      <div className="sticky top-0 z-50 bg-slate-950/95 backdrop-blur-md border-b border-slate-900/80">
        
        {/* GLOBAL HIGH-FIDELITY APP HEADER */}
        <header className="p-4 border-b border-slate-900/40">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-tr from-indigo-500 to-indigo-700 p-2 rounded-xl shadow-lg shadow-indigo-500/10">
                <Brain className="h-5.5 w-5.5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-black text-slate-100 tracking-tight flex items-center gap-1.5 uppercase font-sans">
                  NEUROLEARN AI
                </h1>
                <p className="text-[10px] text-slate-400 font-medium tracking-wide">Brain-Adaptive Learning & Wellness Ecosystem</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Live active wearer block */}
              <div className="bg-slate-950/60 border border-slate-800 px-3 py-1.5 rounded-lg text-[10px] text-slate-400 font-medium flex items-center gap-2.5 font-mono">
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75 animate-duration-1000"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                  </span>
                  <span>Wearer: <strong className="text-slate-200">Alex Mercer</strong></span>
                </div>
                <div className="h-3 w-px bg-slate-800" />
                <button
                  type="button"
                  onClick={() => {
                    setIsPulseModalOpen(true);
                  }}
                  title={`Click to view 60s Pulse Telemetry history (${isHighStress ? 'High Stress' : isLowAttention ? 'Low Attention' : 'Optimal'})`}
                  className={`flex items-center gap-2 hover:bg-slate-900 px-2 py-0.5 rounded cursor-pointer transition-all border border-transparent hover:border-slate-800/80 text-[10px] ${
                    isHighStress
                      ? 'bg-red-950/20'
                      : isLowAttention
                      ? 'bg-amber-950/20'
                      : ''
                  }`}
                  id="header-cognitive-pulse-trigger"
                >
                  <span className={`text-[9px] uppercase font-bold tracking-wider flex items-center gap-1.5 animate-pulse ${pulseColorClass}`}>
                    {pulseStatusText}
                  </span>
                  {highStressCount > 0 && (
                    <span className="bg-red-500 text-white font-mono font-extrabold text-[9px] h-3.5 min-w-[14px] px-1 rounded-full flex items-center justify-center animate-bounce shadow-sm shadow-red-500/30" title={`${highStressCount} high stress occurrences this session`}>
                      {highStressCount}
                    </span>
                  )}
                  <span className="flex items-center gap-0.5 h-3">
                    <motion.span
                      animate={{ height: [4, 12, 4] }}
                      transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
                      className={`w-0.5 rounded-full block ${pulseBgClass}`}
                    />
                    <motion.span
                      animate={{ height: [10, 4, 10] }}
                      transition={{ repeat: Infinity, duration: 0.8, ease: "easeInOut" }}
                      className={`w-0.5 rounded-full block ${pulseBgClass}`}
                    />
                    <motion.span
                      animate={{ height: [3, 9, 3] }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                      className={`w-0.5 rounded-full block ${pulseBgClass}`}
                    />
                  </span>
                </button>
              </div>

              {/* Global simulated disaster trigger button */}
              <button
                onClick={() => {
                  setIsEmergencyModalOpen(true);
                  setEmergencySuccess(null);
                  setEmergencyError(null);
                }}
                className="bg-red-950/40 hover:bg-red-900/40 border border-red-900/40 hover:border-red-500/40 text-red-400 hover:text-red-300 text-xs font-bold px-3.5 py-1.5 rounded-lg flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer shrink-0"
                id="emergency-trigger-header-button"
              >
                <LifeBuoy className="h-3.5 w-3.5 text-red-500" />
                <span>Emergency Help</span>
              </button>
            </div>
          </div>
        </header>

        {/* CORE TAB NAVIGATION BAR */}
        <nav className="p-2 overflow-x-auto scrollbar-none">
          <div className="max-w-7xl mx-auto flex items-center justify-between bg-slate-950/30 p-1 rounded-xl border border-slate-800/50">
            <div className="flex space-x-1 overflow-x-auto scrollbar-none">
              <button
                onClick={() => setActiveTab('home')}
                className={`relative px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center space-x-1.5 cursor-pointer whitespace-nowrap ${
                  activeTab === 'home' 
                    ? 'bg-indigo-600/15 text-indigo-400 font-bold shadow-sm' 
                    : 'text-slate-400 hover:text-slate-205 text-slate-350'
                }`}
              >
                <Home className="h-3.5 w-3.5" />
                <span>Home</span>
                {activeTab === 'home' && (
                  <motion.span
                    layoutId="activeTabUnderline"
                    className="absolute bottom-1 left-2.5 right-2.5 h-0.5 bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.6)]"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </button>

              <button
                onClick={() => setActiveTab('student')}
                className={`relative px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center space-x-1.5 cursor-pointer whitespace-nowrap ${
                  activeTab === 'student' 
                    ? 'bg-indigo-600/15 text-indigo-400 font-bold shadow-sm' 
                    : 'text-slate-400 hover:text-slate-205 text-slate-350'
                }`}
              >
                <Brain className="h-3.5 w-3.5" />
                <span>Student Workspace</span>
                {activeTab === 'student' && (
                  <motion.span
                    layoutId="activeTabUnderline"
                    className="absolute bottom-1 left-2.5 right-2.5 h-0.5 bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.6)]"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </button>

              <button
                onClick={() => setActiveTab('teacher')}
                className={`relative px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center space-x-1.5 cursor-pointer whitespace-nowrap ${
                  activeTab === 'teacher' 
                    ? 'bg-indigo-600/15 text-indigo-400 font-bold shadow-sm' 
                    : 'text-slate-400 hover:text-slate-205 text-slate-350'
                }`}
              >
                <Users className="h-3.5 w-3.5" />
                <span>Teacher Panel</span>
                {activeTab === 'teacher' && (
                  <motion.span
                    layoutId="activeTabUnderline"
                    className="absolute bottom-1 left-2.5 right-2.5 h-0.5 bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.6)]"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </button>

              <button
                onClick={() => setActiveTab('parent')}
                className={`relative px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center space-x-1.5 cursor-pointer whitespace-nowrap ${
                  activeTab === 'parent' 
                    ? 'bg-indigo-600/15 text-indigo-400 font-bold shadow-sm' 
                    : 'text-slate-400 hover:text-slate-205 text-slate-350'
                }`}
              >
                <Heart className="h-3.5 w-3.5" />
                <span>Parent Hub</span>
                {activeTab === 'parent' && (
                  <motion.span
                    layoutId="activeTabUnderline"
                    className="absolute bottom-1 left-2.5 right-2.5 h-0.5 bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.6)]"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </button>

              {devMode && (
                <>
                  <button
                    onClick={() => setActiveTab('arch')}
                    className={`relative px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center space-x-1.5 cursor-pointer whitespace-nowrap ${
                      activeTab === 'arch' 
                        ? 'bg-indigo-600/15 text-indigo-400 font-bold shadow-sm' 
                        : 'text-slate-400 hover:text-slate-205 text-slate-350'
                    }`}
                  >
                    <Cpu className="h-3.5 w-3.5 text-yellow-500" />
                    <span>Hardware Specs</span>
                    {activeTab === 'arch' && (
                      <motion.span
                        layoutId="activeTabUnderline"
                        className="absolute bottom-1 left-2.5 right-2.5 h-0.5 bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.6)]"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </button>

                  <button
                    onClick={() => setActiveTab('cloud')}
                    className={`relative px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center space-x-1.5 cursor-pointer whitespace-nowrap ${
                      activeTab === 'cloud' 
                        ? 'bg-indigo-600/15 text-indigo-400 font-bold shadow-sm' 
                        : 'text-slate-400 hover:text-slate-205 text-slate-350'
                    }`}
                  >
                    <Database className="h-3.5 w-3.5 text-indigo-400" />
                    <span>Cloud Spec</span>
                    {activeTab === 'cloud' && (
                      <motion.span
                        layoutId="activeTabUnderline"
                        className="absolute bottom-1 left-2.5 right-2.5 h-0.5 bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.6)]"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </button>

                  <button
                    onClick={() => setActiveTab('ethics')}
                    className={`relative px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center space-x-1.5 cursor-pointer whitespace-nowrap ${
                      activeTab === 'ethics' 
                        ? 'bg-indigo-600/15 text-indigo-400 font-bold shadow-sm' 
                        : 'text-slate-400 hover:text-slate-205 text-slate-350'
                    }`}
                  >
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Ethical AI</span>
                    {activeTab === 'ethics' && (
                      <motion.span
                        layoutId="activeTabUnderline"
                        className="absolute bottom-1 left-2.5 right-2.5 h-0.5 bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.6)]"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </button>

                  <button
                    onClick={() => setActiveTab('research')}
                    className={`relative px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center space-x-1.5 cursor-pointer whitespace-nowrap ${
                      activeTab === 'research' 
                        ? 'bg-indigo-600/15 text-indigo-400 font-bold shadow-sm' 
                        : 'text-slate-400 hover:text-slate-205 text-slate-350'
                    }`}
                  >
                    <FlaskConical className="h-3.5 w-3.5 text-pink-500" />
                    <span>Academic Sandbox</span>
                    {activeTab === 'research' && (
                      <motion.span
                        layoutId="activeTabUnderline"
                        className="absolute bottom-1 left-2.5 right-2.5 h-0.5 bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.6)]"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </button>
                </>
              )}
            </div>

            <div className="flex items-center space-x-2 pl-4 pr-1.5 ml-auto border-l border-slate-800 shrink-0">
              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest font-black select-none">Dev Mode</span>
              <button
                onClick={() => {
                  const nextDevMode = !devMode;
                  setDevMode(nextDevMode);
                  if (!nextDevMode && ['arch', 'cloud', 'ethics', 'research'].includes(activeTab)) {
                    setActiveTab('home');
                  }
                }}
                title="Toggle Developer & Technical Spec Views"
                className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 focus:outline-none cursor-pointer flex items-center ${
                  devMode ? 'bg-indigo-600' : 'bg-slate-800'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                    devMode ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </nav>

      </div>

      {/* STATE-ADAPTIVE THEME METADATA HUD BAR */}
      <div className="max-w-7xl mx-auto w-full px-4 md:px-6 pt-4" id="state-adaptive-theme-hud">
        <div className={`p-4 rounded-2xl border transition-all duration-1000 flex flex-col md:flex-row items-center justify-between gap-4 ${
          isHighStress 
            ? 'bg-purple-950/20 border-purple-800/45 shadow-lg shadow-purple-950/40' 
            : isLowAttention 
            ? 'bg-amber-955/15 border-amber-800/40 shadow-lg shadow-amber-955/20' 
            : 'bg-slate-900/45 border-slate-800/70'
        }`}>
          <div className="flex items-start gap-3.5">
            <div className={`p-2.5 rounded-xl border transition-all duration-1000 bg-slate-950/80 ${
              isHighStress 
                ? 'border-purple-900 text-purple-400' 
                : isLowAttention 
                ? 'border-amber-900 text-amber-400' 
                : 'border-slate-800 text-emerald-400'
            }`}>
              {themeIconComponent}
            </div>

            <div className="space-y-1">
              <div className="flex items-center flex-wrap gap-2">
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 font-mono">Neural Biofeedback Theme Engine</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-extrabold border ${themeBadgeColor}`}>
                  {themeBadgeText}
                </span>
              </div>
              <p className="text-xs text-slate-300 font-sans leading-snug">
                {themeDescription}
              </p>
            </div>
          </div>

          {/* Quick Simulation triggers to make validation instant and satisfying */}
          <div className="flex flex-wrap items-center gap-2 bg-slate-950/50 p-2 rounded-xl border border-slate-900 font-mono text-[9px] w-full md:w-auto justify-end">
            <span className="text-slate-500 uppercase font-black tracking-wider px-1.5">Simulation Overrides</span>
            <button
              onClick={() => {
                setCognitive(prev => ({ ...prev, stress: 'High', attention: 'High' }));
                setBiometric(prev => ({ ...prev, heartRate: 110, gsr: 6.8, hrv: 32 }));
              }}
              className={`px-3 py-1.5 rounded-lg border text-[9px] font-bold uppercase transition-all cursor-pointer ${
                isHighStress 
                  ? 'bg-purple-950 text-purple-400 border-purple-800' 
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
              title="Simulate High Stress"
              type="button"
            >
              High Stress
            </button>
            <button
              onClick={() => {
                setCognitive(prev => ({ ...prev, attention: 'Low', stress: 'Low' }));
                setBiometric(prev => ({ ...prev, heartRate: 58, gsr: 1.1, hrv: 85 }));
              }}
              className={`px-3 py-1.5 rounded-lg border text-[9px] font-bold uppercase transition-all cursor-pointer ${
                isLowAttention 
                  ? 'bg-amber-950 text-amber-400 border-amber-800' 
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
              title="Simulate Low Attention"
              type="button"
            >
              Low Attention
            </button>
            <button
              onClick={() => {
                setCognitive(prev => ({ ...prev, stress: 'Low', attention: 'High' }));
                setBiometric(prev => ({ ...prev, heartRate: 72, gsr: 2.1, hrv: 76 }));
              }}
              className={`px-3 py-1.5 rounded-lg border text-[9px] font-bold uppercase transition-all cursor-pointer ${
                (!isHighStress && !isLowAttention) 
                  ? 'bg-emerald-950 text-emerald-400 border-emerald-800/80' 
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-100'
              }`}
              title="Force Optimal State"
              type="button"
            >
              Optimal State
            </button>
          </div>
        </div>
      </div>

      {/* MAIN LAYOUT SPACE */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 pb-20">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          {activeTab === 'home' && (
            <HomePage onNavigate={setActiveTab} />
          )}

          {activeTab === 'student' && (
            <StudentWorkspace 
              cognitive={cognitive} 
              setCognitive={setCognitive} 
              biometric={biometric} 
              setBiometric={setBiometric} 
            />
          )}

          {activeTab === 'teacher' && (
            <TeacherDashboard 
              cognitive={cognitive} 
              biometric={biometric} 
            />
          )}

          {activeTab === 'parent' && (
            <ParentDashboard 
              cognitive={cognitive} 
              biometric={biometric} 
            />
          )}

          {activeTab === 'arch' && (
            <SystemArchitecture />
          )}

          {activeTab === 'cloud' && (
            <CloudAndVertex />
          )}

          {activeTab === 'ethics' && (
            <EthicsAndXAI />
          )}

          {activeTab === 'research' && (
            <ResearchAcademicSandbox 
              cognitive={cognitive} 
              biometric={biometric} 
            />
          )}
        </motion.div>
      </main>

      {/* PROFESSIONAL SLATE APP FOOTER */}
      <footer className="bg-slate-950/90 border-t border-slate-900/80 py-8 px-6 text-xs text-slate-500 mt-auto font-sans" id="neurolearn-pro-footer">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Brand and Description Info */}
          <div className="md:col-span-6 space-y-2 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start space-x-2">
              <div className="bg-indigo-600/10 p-1.5 rounded-lg border border-indigo-500/20">
                <Brain className="h-4 w-4 text-indigo-400" />
              </div>
              <span className="font-mono text-xs font-black text-slate-350 tracking-wider">NEUROLEARN AI</span>
              <span className="bg-indigo-950 text-indigo-400 font-mono text-[9px] px-2 py-0.5 rounded-full border border-indigo-900/40">POC v3.2.0</span>
            </div>
            <p className="text-slate-400 leading-relaxed max-w-xl">
              <strong>NeuroLearn AI Applet Proof-of-concept</strong>. Developed for standard evaluation with active post-training quantized edge routines, BigQuery analytics warehouses, and premium Gemini learning assistants.
            </p>
          </div>

          {/* SDG Micro Badges list */}
          <div className="md:col-span-3 flex flex-col items-center justify-center space-y-2.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold">SDG Target Frameworks</span>
            <div className="flex flex-wrap gap-1.5 justify-center">
              {['SDG 3', 'SDG 4', 'SDG 9', 'SDG 10'].map((sdg) => (
                <span key={sdg} className="px-2 py-0.5 bg-slate-900 border border-slate-800 text-slate-400 text-[9.5px] font-mono font-extrabold rounded-md hover:border-slate-750 transition-all hover:text-slate-200">
                  {sdg}
                </span>
              ))}
            </div>
          </div>

          {/* Secure channels & copyright metadata */}
          <div className="md:col-span-3 text-center md:text-right space-y-2 sm:space-y-1.5 font-mono">
            <div className="inline-flex items-center gap-1.5 bg-rose-950/25 border border-rose-900/30 px-2.5 py-1 rounded-lg text-rose-400 text-[9.5px] font-bold">
              <ShieldCheck className="h-3 w-3 animate-pulse text-rose-500" />
              <span>AES-256 GCM SECURED</span>
            </div>
            <p className="text-[9.5px] text-slate-500 leading-relaxed">
              Protected under dual AES-256 GCM encrypted channels.<br />
              All rights reserved. © {new Date().getFullYear()} NeuroLearn.
            </p>
          </div>
        </div>

        {/* Bottom subtle bar */}
        <div className="max-w-7xl mx-auto pt-5 mt-6 border-t border-slate-900 flex flex-col sm:flex-row justify-between items-center text-[10px] text-slate-600 gap-2 font-mono">
          <div className="flex items-center gap-2">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
            </span>
            <span>Edge Routines: Quantized INT8</span>
          </div>
          <div>
            <span>Data Source: BigQuery Analytics Warehouse</span>
          </div>
          <div className="flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-indigo-400 animate-pulse" />
            <span>AI Provider: Gemini 2.5 Flash</span>
          </div>
        </div>
      </footer>

      {/* GLOBAL EMERGENCY DISTRESS SIGNAL SIMULATOR MODAL */}
      <AnimatePresence>
        {isEmergencyModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" id="emergency-modal-backdrop">
            {/* Backdrop slide-in and blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEmergencyModalOpen(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-slate-900 border border-red-900/45 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl p-6 space-y-5"
              id="emergency-modal-content-panel"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3 text-red-400">
                  <div className="p-2.5 bg-red-950 border border-red-900/60 rounded-xl">
                    <LifeBuoy className="h-6 w-6 text-red-500 animate-spin-slow" />
                  </div>
                  <div>
                    <h3 className="text-base font-black tracking-tight text-slate-200 uppercase">Trigger Distress Signal Alert</h3>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Live Wearable Bio-Sensor Telemetry Broadcast</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEmergencyModalOpen(false)}
                  className="p-1 px-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Bio snapshot box */}
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2 text-slate-400">
                <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider block font-mono">Current Alex Mercer Snapshot</span>
                <div className="grid grid-cols-3 gap-2.5">
                  <div className="bg-slate-900/40 p-2 rounded-md border border-slate-800 text-center">
                    <span className="text-[8px] text-slate-500 block">EEG Stress State</span>
                    <strong className="text-red-400 text-xs font-black">{cognitive.stress}</strong>
                  </div>
                  <div className="bg-slate-900/40 p-2 rounded-md border border-slate-800 text-center">
                    <span className="text-[8px] text-slate-500 block">EEG Attention</span>
                    <strong className="text-emerald-400 text-xs font-black">{cognitive.attention}</strong>
                  </div>
                  <div className="bg-slate-900/40 p-2 rounded-md border border-slate-800 text-center">
                    <span className="text-[8px] text-slate-500 block">Heart Rate</span>
                    <strong className="text-pink-400 text-xs font-black font-mono">{biometric.heartRate} BPM</strong>
                  </div>
                </div>
              </div>

              {/* Suggestions */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 block">Select Simulated Distress Alert Payload Template:</label>
                <div className="grid grid-cols-1 gap-1.5">
                  {[
                    'Elevated fatigue / stress threshold limit crossed during intensive research block. Seeking advisor assistance.',
                    'Panic and cognitive overload triggered during computed logic exam tasks. Immediate remediation coaching requested.',
                    'Biometric sensors indicate prolonged hyperarousal states. Heart Rate spikes above normal resting threshold.'
                  ].map((tpl) => (
                    <button
                      type="button"
                      key={tpl}
                      onClick={() => {
                        setEmergencyMessage(tpl);
                        setEmergencySuccess(null);
                        setEmergencyError(null);
                      }}
                      className={`text-left p-2.5 rounded-lg border text-xs leading-relaxed transition-all cursor-pointer ${
                        emergencyMessage === tpl && !customEmergencyText
                          ? 'bg-red-950/15 border-red-900/40 text-red-200 font-medium'
                          : 'bg-slate-950/40 border-slate-800 hover:bg-slate-900 text-slate-400'
                      }`}
                    >
                      {tpl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom message box */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 block">Or Customize Distress Message / Situation:</label>
                <textarea
                  value={customEmergencyText}
                  onChange={(e) => {
                    setCustomEmergencyText(e.target.value);
                    setEmergencySuccess(null);
                    setEmergencyError(null);
                  }}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-red-900 focus:outline-none p-3 rounded-lg text-xs text-slate-200 placeholder-slate-600 resize-none h-16 font-sans leading-relaxed"
                  placeholder="Type a custom simulated distress alert status report... (e.g. Anxiety elevated due to high cognitive strain under continuous tests)"
                />
              </div>

              {/* Messages success / error feedback */}
              {emergencySuccess && (
                <div className="bg-emerald-950/20 border border-emerald-900/60 text-emerald-300 rounded-lg p-2.5 text-xs leading-relaxed flex items-center gap-1.5 font-medium animate-fadeIn">
                  <Sparkles className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>{emergencySuccess}</span>
                </div>
              )}
              {emergencyError && (
                <div className="bg-red-950/20 border border-red-900/60 text-red-300 rounded-lg p-2.5 text-xs leading-relaxed flex items-center gap-1.5 font-medium">
                  <AlertTriangle className="h-4 w-4 text-red-400 shrink-0" />
                  <span>{emergencyError}</span>
                </div>
              )}

              {/* Submit triggers */}
              <div className="flex gap-2.5 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEmergencyModalOpen(false)}
                  className="flex-1 bg-slate-850 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 text-xs font-bold py-2.5 rounded-xl transition-all cursor-pointer"
                >
                  Cancel / Close
                </button>
                <button
                  type="button"
                  disabled={isSendingEmergency}
                  onClick={handleTriggerEmergency}
                  className="flex-1 bg-gradient-to-r from-red-750 to-red-650 hover:from-red-750 hover:to-red-550 cursor-pointer text-white text-xs font-bold py-2.5 rounded-xl shadow-lg shadow-red-950/50 hover:shadow-red-900/20 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                  id="submit-distress-broadcast-button"
                >
                  {isSendingEmergency ? (
                    <span className="flex items-center gap-2">
                      <span className="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      Broadcast is active...
                    </span>
                  ) : (
                    <>
                      <LifeBuoy className="h-4 w-4 animate-pulse" />
                      <span>Trigger Distress Call</span>
                    </>
                  )}
                </button>
              </div>

            </motion.div>
          </div>
        )}

        {/* REAL-TIME COGNITIVE PULSE HISTORY MODAL */}
        {isPulseModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in" id="pulse-history-modal-backdrop">
            {/* Backdrop slide-in and blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPulseModalOpen(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`relative bg-slate-900 border border-indigo-900/30 rounded-2xl w-full overflow-hidden shadow-2xl p-5 space-y-4 transition-all duration-300 ${pulseModalTab === 'log' ? 'max-w-3xl' : 'max-w-md'}`}
              id="pulse-modal-content-panel"
            >
              <div className="flex items-start justify-between">
                <div className={`flex items-center space-x-2.5 ${pulseColorClass}`}>
                  <div className={`p-2 bg-slate-950/60 border ${pulseBorderClass} rounded-xl animate-pulse`}>
                    <Activity className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black tracking-tight text-white uppercase">Cognitive Pulse History</h3>
                    <p className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold">Continuous High-Frequency Telemetry Feed</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPulseModalOpen(false)}
                  className="p-1 hover:bg-slate-850 rounded-lg text-slate-450 hover:text-white transition-all cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Telemetry view selector */}
              <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-850 gap-1">
                <button
                  type="button"
                  onClick={() => setPulseModalTab('live')}
                  className={`flex-1 py-1.5 text-[9px] uppercase font-bold tracking-wider rounded-lg transition-all cursor-pointer ${
                    pulseModalTab === 'live'
                      ? 'bg-indigo-600/15 border border-indigo-900/35 text-indigo-400 font-extrabold shadow-sm'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  Live 60s Pulse
                </button>
                <button
                  type="button"
                  onClick={() => setPulseModalTab('log')}
                  className={`flex-1 py-1.5 text-[9px] uppercase font-bold tracking-wider rounded-lg transition-all cursor-pointer ${
                    pulseModalTab === 'log'
                      ? 'bg-indigo-600/15 border border-indigo-900/35 text-indigo-400 font-extrabold shadow-sm'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  7-Day Biometric Log
                </button>
              </div>

              {pulseModalTab === 'live' && (
                <>
                  {/* Statistical snapshot row */}
                  <div className="space-y-2 py-1">
                    <div className="grid grid-cols-3 gap-2">
                      <div className={`bg-slate-950 p-2.5 rounded-xl border transition-all duration-300 text-center ${
                        isPulseTrendThresholdCrossed 
                          ? pulseDeviationPercent > 0 
                            ? 'border-red-500/50 bg-red-950/10 shadow-[0_0_10px_rgba(239,68,68,0.15)]' 
                            : 'border-amber-500/50 bg-amber-955/10 shadow-[0_0_10px_rgba(245,158,11,0.15)]'
                          : 'border-slate-800/80'
                      }`}>
                        <div className="flex items-center justify-center gap-1.5 mb-0.5">
                          <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">Live Score</span>
                          {isPulseTrendThresholdCrossed && (
                            <span className={`relative flex h-1.5 w-1.5`}>
                              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${pulseDeviationPercent > 0 ? 'bg-red-400' : 'bg-amber-400'}`}></span>
                              <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${pulseDeviationPercent > 0 ? 'bg-red-500' : 'bg-amber-500'}`}></span>
                            </span>
                          )}
                        </div>
                        <strong className={`${pulseColorClass} text-sm font-black font-mono`}>
                          {pulseHistory[pulseHistory.length - 1]?.intensity || 0}%
                        </strong>
                      </div>
                      <div className={`bg-slate-950 p-2.5 rounded-xl border transition-all duration-300 text-center ${
                        isPulseTrendThresholdCrossed
                          ? pulseDeviationPercent > 0 
                            ? 'border-red-500/30 bg-red-950/5' 
                            : 'border-amber-500/30 bg-amber-955/5'
                          : 'border-slate-800/80'
                      }`}>
                        <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider block mb-0.5">60s Average</span>
                        <strong className="text-slate-200 text-sm font-black font-mono">
                          {Math.round(pulseHistory.reduce((sum, item) => sum + item.intensity, 0) / pulseHistory.length)}%
                        </strong>
                      </div>
                      <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 text-center">
                        <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider block mb-0.5">Peak Intensity</span>
                        <strong className="text-indigo-400 text-sm font-black font-mono animate-pulse">
                          {Math.max(...pulseHistory.map(item => item.intensity))}%
                        </strong>
                      </div>
                    </div>

                    {/* Subtle emerging trend alert notification within the stats row */}
                    {isPulseTrendThresholdCrossed && (
                      <div className={`p-2 rounded-xl border text-[9px] flex items-center justify-between font-medium leading-normal shadow-sm animate-pulse ${
                        pulseDeviationPercent > 0
                          ? 'bg-red-500/10 border-red-500/25 text-red-400'
                          : 'bg-amber-500/10 border-amber-500/25 text-amber-400'
                      }`} id="pulse-modal-trend-alert">
                        <span className="flex items-center gap-1 uppercase tracking-wider font-extrabold text-[8px] shrink-0">
                          <TrendingUp className={`h-3 w-3 ${pulseDeviationPercent > 0 ? 'text-red-400 animate-bounce' : 'text-amber-400 animate-pulse'}`} />
                          <span>Emerging Trend</span>
                        </span>
                        <span className="font-sans text-right ml-2 leading-tight">
                          10s Moving Average (<strong className="font-extrabold">{latest10sMA}%</strong>) is {pulseDeviationPercent > 0 ? 'elevated' : 'depressed'} by <strong className="font-black">{Math.abs(pulseDeviationPercent)}%</strong> from baseline ({pulseBaselineVal}%)
                        </span>
                      </div>
                    )}
                  </div>
              {/* Recharts Area Plot */}
              <div className="bg-slate-950 rounded-xl p-3 border border-slate-850/80">
                <div className="flex justify-between items-center mb-1 text-[9px] text-slate-400 font-mono">
                  <span>Spectral Power Density</span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setShowPulseTrends(!showPulseTrends)}
                      className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md transition-all cursor-pointer border text-[8px] font-bold tracking-wider uppercase ${
                        showPulseTrends 
                          ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-300 font-extrabold shadow-sm' 
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Sliders className="h-2.5 w-2.5" />
                      <span>Show Trends: {showPulseTrends ? 'On' : 'Off'}</span>
                    </button>
                    <span className="flex items-center gap-1">
                      <span className={`h-1.5 w-1.5 rounded-full ${pingBgClass} animate-ping`}></span>
                      <span>60s Live Window</span>
                    </span>
                  </div>
                </div>
                
                <div className="w-full h-36 mt-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={pulseHistory.map((item, idx) => {
                        const startIdx = Math.max(0, idx - 4);
                        const subset = pulseHistory.slice(startIdx, idx + 1);
                        const sum = subset.reduce((acc, curr) => acc + curr.intensity, 0);
                        const trendMA = Math.round((sum / subset.length) * 10) / 10;
                        return {
                          ...item,
                          trendMA,
                        };
                      })}
                      margin={{ top: 5, right: 0, left: -40, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="modalPulseGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={graphColor} stopOpacity={0.25}/>
                          <stop offset="95%" stopColor={graphColor} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.15} />
                      <XAxis 
                        dataKey="time" 
                        stroke="#64748b" 
                        fontSize={8} 
                        tickLine={false} 
                        axisLine={false}
                        interval={4} 
                      />
                      <YAxis 
                        stroke="#64748b" 
                        fontSize={8} 
                        domain={[0, 100]} 
                        tickLine={false} 
                        axisLine={false}
                        tickFormatter={(v) => `${v}%`}
                      />
                      <ReferenceLine 
                        y={baselineY} 
                        stroke={thresholdLineColor} 
                        strokeWidth={1.5} 
                        strokeDasharray="4 4" 
                        label={{
                          value: `Baseline: ${thresholdStatusText}`,
                          fill: thresholdLineColor,
                          position: 'top',
                          fontSize: 8,
                          fontWeight: 'bold',
                        }} 
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const dataPoint = payload[0].payload;
                            
                            // Find the index of the current data point in the 60s history window
                            const idx = pulseHistory.findIndex(item => item.time === dataPoint.time);
                            let tenSecondAvg = dataPoint.intensity;
                            
                            if (idx !== -1) {
                              // Each point represents a 2-second interval, so 10 seconds of data is the last 5 points.
                              const startIdx = Math.max(0, idx - 4);
                              const subset = pulseHistory.slice(startIdx, idx + 1);
                              const sum = subset.reduce((acc, curr) => acc + curr.intensity, 0);
                              tenSecondAvg = Math.round((sum / subset.length) * 10) / 10;
                            }
                            
                            const diff = dataPoint.intensity - tenSecondAvg;
                            let trendArrow = "→";
                            let trendColor = "text-slate-400 bg-slate-950/80 border-slate-800";
                            let trendText = "Stable";
                            
                            if (diff > 0.1) {
                              trendArrow = "↑";
                              trendColor = "text-rose-450 text-red-400 bg-red-950/20 border-red-900/30";
                              trendText = "Rising Stress";
                            } else if (diff < -0.1) {
                              trendArrow = "↓";
                              trendColor = "text-emerald-400 bg-emerald-950/20 border-emerald-900/30";
                              trendText = "Calming Down";
                            }
                            
                            return (
                              <div className="bg-slate-950 border border-slate-800/80 p-2 rounded-xl text-[10px] font-sans shadow-xl min-w-[150px] space-y-1.5 backdrop-blur-md">
                                <div className="flex justify-between items-center text-slate-450 border-b border-slate-900 pb-1 flex-wrap gap-1">
                                  <span className="font-semibold text-slate-400">Time: {dataPoint.time}</span>
                                  <span className="text-[8px] px-1 py-0.2 bg-slate-900 rounded-md font-mono text-slate-500">2s Interval</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-slate-500">Last 2s Data:</span>
                                  <span className={`font-black font-mono ${pulseColorClass}`}>
                                    {dataPoint.intensity}%
                                  </span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-slate-505 text-slate-500">10s Average:</span>
                                  <span className="font-black font-mono text-slate-300">
                                    {tenSecondAvg}%
                                  </span>
                                </div>
                                <div className={`flex items-center justify-between border border-transparent p-1 px-1.5 rounded-lg text-[9px] font-bold ${trendColor}`}>
                                  <span>Trend:</span>
                                  <span className="flex items-center gap-1">
                                    <span className="text-xs font-black">{trendArrow}</span>
                                    <span>{trendText}</span>
                                    <span className="font-mono text-[8px]">({diff > 0 ? "+" : ""}{diff.toFixed(1)}%)</span>
                                  </span>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Area
                        type="monotone"
                        name="Pulse Intensity"
                        dataKey="intensity"
                        stroke={graphColor}
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#modalPulseGradient)"
                      />
                      {showPulseTrends && (
                        <Line
                          type="monotone"
                          name="10s Moving Average"
                          dataKey="trendMA"
                          stroke="#38bdf8"
                          strokeWidth={2}
                          strokeDasharray="4 4"
                          dot={false}
                          activeDot={{ r: 4 }}
                        />
                      )}
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Wellness Recommendations section - only visible when pulse indicates high stress */}
              {(isHighStress || currentIntensity > optimalMax) && (
                <WellnessRecommendations
                  isHighStress={isHighStress || currentIntensity > optimalMax}
                  currentIntensity={currentIntensity}
                  onCalmSystem={() => {
                    setCognitive(prev => ({ ...prev, stress: 'Low', attention: 'High' }));
                    setBiometric(prev => ({ ...prev, heartRate: 72, gsr: 2.1, hrv: 76 }));
                  }}
                />
              )}

              {/* High stress alerts cumulative report banner */}
              {highStressCount > 0 && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] px-3 py-2 rounded-xl flex items-center justify-between font-medium">
                  <div className="flex items-center gap-1.5 animate-pulse">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span>
                    </span>
                    <span>Session Stress Events: <strong className="text-white font-mono">{highStressCount}</strong></span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setHighStressCount(0)}
                    className="text-[9px] uppercase font-bold text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-950 border border-slate-800 transition-colors cursor-pointer"
                  >
                    Reset Count
                  </button>
                </div>
              )}

              {/* Feed Meta status and toggle */}
              <div className="flex justify-between items-center text-[10px] bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Clock className="h-3.5 w-3.5 text-slate-500" />
                  <span>Epoch Rate: 0.5Hz • Wearable v2.1</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsStreamPaused(!isStreamPaused)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[9px] font-bold cursor-pointer border transition-colors ${
                    isStreamPaused
                      ? 'bg-emerald-950/40 border-emerald-800 text-emerald-400 hover:bg-emerald-900/30'
                      : 'bg-slate-850 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  {isStreamPaused ? (
                    <>
                      <Play className="h-2.5 w-2.5" />
                      <span>Resume</span>
                    </>
                  ) : (
                    <>
                      <Pause className="h-2.5 w-2.5" />
                      <span>Pause Feed</span>
                    </>
                  )}
                </button>
              </div>
            </>
          )}

          {pulseModalTab === 'log' && (
            <BiometricHealthLog />
          )}

          <div className="pt-1 select-none">
                <button
                  type="button"
                  onClick={() => setIsPulseModalOpen(false)}
                  className="w-full bg-slate-850 hover:bg-slate-850 text-slate-200 border border-slate-800 text-xs font-bold py-2 rounded-xl transition-all cursor-pointer text-center"
                >
                  Dismiss Telemetry Feed
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* PERSISTENT REAL-TIME COGNITIVE ALERTS TOAST */}
        {pulseToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9, x: 50 }}
            animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className={`fixed bottom-5 right-5 z-[210] max-w-sm w-full bg-slate-900 border ${
              pulseToast.type === 'stress' ? 'border-red-900/40' : 'border-amber-900/40'
            } rounded-2xl p-4 shadow-2xl overflow-hidden`}
            id="pulse-status-toast-notification"
          >
            {/* Glowing ambient backing */}
            <div className={`absolute top-0 right-0 -mr-8 -mt-8 h-20 w-20 ${
              pulseToast.type === 'stress' ? 'bg-red-500/10' : 'bg-amber-500/10'
            } rounded-full blur-xl pointer-events-none`} />

            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2.5">
                <span className="relative flex h-2.5 w-2.5 shrink-0">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${
                    pulseToast.type === 'stress' ? 'bg-red-400' : 'bg-amber-400'
                  } opacity-75`}></span>
                  <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                    pulseToast.type === 'stress' ? 'bg-red-500' : 'bg-amber-500'
                  }`}></span>
                </span>
                <div>
                  <h4 className={`text-[11px] font-black tracking-wider uppercase ${
                    pulseToast.type === 'stress' ? 'text-red-400' : 'text-amber-400'
                  }`}>
                    {pulseToast.type === 'stress' ? 'Neural Stress Spike' : 'Sustained Focus Overload'}
                  </h4>
                  <p className="text-[9px] text-slate-500 font-mono">Telemetry Time: {pulseToast.timestamp}</p>
                </div>
              </div>
              
              <button
                type="button"
                onClick={() => setPulseToast(null)}
                className="p-1 hover:bg-slate-850 rounded-lg text-slate-500 hover:text-white transition-all cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="mt-2.5 select-text">
              <p className="text-slate-300 text-xs leading-relaxed font-sans font-medium">
                {pulseToast.message}
              </p>
            </div>

            <div className="mt-3.5 pt-2.5 border-t border-slate-850 flex items-center justify-between gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setIsPulseModalOpen(true);
                  setPulseToast(null);
                }}
                className={`text-[10px] font-bold ${
                  pulseToast.type === 'stress' ? 'bg-red-950/40 hover:bg-red-900/30 text-red-350' : 'bg-amber-950/40 hover:bg-amber-900/30 text-amber-350'
                } px-2.5 py-1.5 rounded-lg border ${
                  pulseToast.type === 'stress' ? 'border-red-900/40' : 'border-amber-900/40'
                } transition-all cursor-pointer`}
              >
                See Pulse Details
              </button>
              <button
                type="button"
                onClick={() => setPulseToast(null)}
                className="text-[9px] text-slate-450 hover:text-white font-semibold flex items-center gap-1 cursor-pointer"
              >
                Dismiss Alert
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DEDICATED GEMINI WELLNESS COMPANION SIDEBAR */}
      <WellnessCompanionSidebar cognitive={cognitive} biometric={biometric} />

    </div>
  );
}
