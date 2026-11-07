import React, { useState, useEffect } from 'react';
import { Heart, Play, Pause, RefreshCw, Sparkles, CheckSquare, Zap, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CognitiveState, BiometricState } from '../types';

interface BreatherProps {
  cognitive: CognitiveState;
  setCognitive: React.Dispatch<React.SetStateAction<CognitiveState>>;
  biometric: BiometricState;
  setBiometric: React.Dispatch<React.SetStateAction<BiometricState>>;
}

type BreathPhase = 'Inhale' | 'Hold' | 'Exhale' | 'HoldEmpty';

export default function BiometricsCoherenceBreather({ cognitive, setCognitive, biometric, setBiometric }: BreatherProps) {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<BreathPhase>('Inhale');
  const [phaseSeconds, setPhaseSeconds] = useState(4);
  const [cyclesCompleted, setCyclesCompleted] = useState(0);
  const [coherencePercentage, setCoherencePercentage] = useState(65);

  // Core breathing cadence loop (4-7-8 relaxation rhythm)
  useEffect(() => {
    if (!isActive) return;

    const timer = setInterval(() => {
      setPhaseSeconds(prev => {
        if (prev <= 1) {
          // Transition phase
          let nextPhase: BreathPhase = 'Inhale';
          let nextSecs = 4;

          if (phase === 'Inhale') {
            nextPhase = 'Hold';
            nextSecs = 7;
          } else if (phase === 'Hold') {
            nextPhase = 'Exhale';
            nextSecs = 8;
          } else if (phase === 'Exhale') {
            nextPhase = 'Inhale'; // Reset to inhale directly or default 4s
            nextSecs = 4;
            setCyclesCompleted(c => c + 1);
          }

          setPhase(nextPhase);

          // Actively log physiological benefit on wearable sensors
          setBiometric(prevBio => {
            const nextHr = Math.max(55, prevBio.heartRate - 1.5 - (Math.random() * 1.5));
            const nextGsr = Math.max(1.4, prevBio.gsr - 0.2 - (Math.random() * 0.1));
            const nextHrv = Math.min(115, prevBio.hrv + 3 + (Math.random() * 2));
            return {
              ...prevBio,
              heartRate: Math.round(nextHr),
              gsr: Number(nextGsr.toFixed(1)),
              hrv: Math.round(nextHrv)
            };
          });

          // Boost the visual coherence percentage indicator
          setCoherencePercentage(prev => Math.min(100, prev + 6));

          return nextSecs;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, phase, setBiometric]);

  // Adjust cognitive metrics on completing 3 cycles
  useEffect(() => {
    if (cyclesCompleted >= 3) {
      setCognitive(prevCognitive => ({
        ...prevCognitive,
        stress: 'Low',
        fatigue: 'Low',
        attention: 'Moderate'
      }));

      // Log success to analytical server
      fetch('/api/simulation/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'student_alex',
          service: 'wellness_coach',
          biometrics_snapshot: biometric,
          cognitive_snapshot: { attention: 'Moderate', stress: 'Low', fatigue: 'Low' },
          inputSnippet: `Completed 3 full modules of 4-7-8 Breathing Coherence. Heart rate stabilized beautifully.`,
          success: true
        })
      }).catch(() => {});
    }
  }, [cyclesCompleted, setCognitive]);

  const handleReset = () => {
    setIsActive(false);
    setPhase('Inhale');
    setPhaseSeconds(4);
    setCyclesCompleted(0);
    setCoherencePercentage(65);
  };

  // Pulse scale based on current breath phase for high fluidity
  const getBubbleScale = () => {
    if (!isActive) return 1.0;
    if (phase === 'Inhale') {
      // Scale from 1.0 to 1.7 based on remaining time in 4s inhale
      const progress = (4 - phaseSeconds) / 4;
      return 1.0 + (progress * 0.75);
    } else if (phase === 'Hold') {
      return 1.75;
    } else if (phase === 'Exhale') {
      // Deflate from 1.75 back to 1.0 based on 8s exhale
      const progress = (8 - phaseSeconds) / 8;
      return 1.75 - (progress * 0.75);
    }
    return 1.0;
  };

  const getPhaseColor = () => {
    if (phase === 'Inhale') return 'text-sky-400 bg-sky-950/20 border-sky-900/60';
    if (phase === 'Hold') return 'text-violet-400 bg-violet-950/20 border-violet-900/60';
    return 'text-emerald-400 bg-emerald-950/20 border-emerald-900/60';
  };

  return (
    <div className="bg-slate-900 border border-slate-850 rounded-2xl p-5 shadow-xl relative overflow-hidden" id="cognitive_sensory_breathing_coherence">
      <div className="absolute top-0 right-0 p-3 text-pink-500 opacity-5 pointer-events-none">
        <Heart className="h-20 w-20" />
      </div>

      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <Heart className="h-4.5 w-4.5 text-pink-500 animate-pulse" />
          <h3 className="text-sm font-black text-slate-100 uppercase tracking-tight">Biometrics Coherence Breather</h3>
        </div>
        {isActive && (
          <span className="bg-emerald-950 text-emerald-400 border border-emerald-900/50 font-mono text-[9px] px-2.5 py-0.5 rounded font-black tracking-wider uppercase animate-pulse">
            Wearer Synced
          </span>
        )}
      </div>

      <p className="text-[11px] text-slate-400 leading-relaxed mb-5">
        Slow down physical heart rate spikes and consolidate amygdaloid activation. Prompts a visual expand-and-contract cue paired with your headband HRV.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Breathing Animation Cylinder (Col 5) */}
        <div className="md:col-span-5 flex flex-col items-center justify-center p-3 py-6 bg-slate-950 rounded-xl border border-slate-850 min-h-[220px]">
          {/* Animated Pulsing Ring */}
          <div className="relative flex items-center justify-center h-28 w-28">
            <motion.div
              animate={{
                scale: getBubbleScale(),
              }}
              transition={{
                duration: 1.0,
                ease: "easeInOut",
              }}
              className="absolute h-16 w-16 rounded-full bg-gradient-to-tr from-sky-400 to-indigo-600 opacity-20 blur shadow-[0_0_15px_rgba(99,102,241,0.5)]"
            />
            <motion.div
              animate={{
                scale: getBubbleScale(),
              }}
              transition={{
                duration: 1.0,
                ease: "easeInOut",
              }}
              className="relative h-12 w-12 rounded-full bg-gradient-to-tr from-sky-500/80 to-indigo-600/80 border border-white/10 flex items-center justify-center shadow-lg"
            >
              <Heart className="h-5 w-5 text-white/90 animate-pulse" />
            </motion.div>
          </div>

          <div className="mt-6 text-center space-y-1.5 z-10 w-full px-2">
            {!isActive ? (
              <span className="text-[11px] font-bold text-slate-400 font-mono uppercase tracking-wider block">Coherence Calibrator Ready</span>
            ) : (
              <div className="space-y-1">
                <span className={`text-[10px] tracking-widest font-black uppercase border px-3 py-1 rounded-full ${getPhaseColor()}`}>
                  {phase === 'Inhale' ? '➔ Breath IN' : phase === 'Hold' ? '✖ Hold Mindful' : '➔ Breath OUT'}
                </span>
                <span className="text-xl font-mono font-black text-slate-100 block pt-1.5">
                  {phaseSeconds}s
                </span>
              </div>
            )}
            <p className="text-[9.5px] text-slate-500 font-medium">
              Completing 3 full modules (150 seconds) purges stress states entirely. Finished: <strong className="text-indigo-400">{cyclesCompleted}/3 Modules</strong>
            </p>
          </div>
        </div>

        {/* Coherence Readouts panel (Col 7) */}
        <div className="md:col-span-7 space-y-4">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 grid grid-cols-2 gap-3.5">
            <div>
              <span className="text-[8.5px] text-slate-500 block uppercase font-bold tracking-wider font-mono">Simulated Sympathetic Response</span>
              <strong className="text-slate-200 text-lg font-mono font-black block mt-0.5">{biometric.heartRate} BPM</strong>
              <p className="text-[9px] text-slate-500 mt-1">Stops spikes instantly.</p>
            </div>

            <div>
              <span className="text-[8.5px] text-slate-500 block uppercase font-bold tracking-wider font-mono">Cognitive HRV Coherence</span>
              <div className="flex items-baseline space-x-1 mt-0.5">
                <strong className="text-indigo-400 text-lg font-mono font-black">{coherencePercentage}%</strong>
                <span className="text-[9.5px] text-emerald-400 font-bold font-mono">({biometric.hrv} ms)</span>
              </div>
              <p className="text-[9px] text-slate-500 mt-1">High coherence is optimal.</p>
            </div>
          </div>

          <div className="flex gap-2">
            {isActive ? (
              <button
                onClick={() => setIsActive(false)}
                className="flex-1 bg-amber-900/30 hover:bg-amber-900/50 border border-amber-900 text-amber-300 font-bold text-[10px] uppercase tracking-wider py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Pause className="h-3.5 w-3.5" />
                <span>Pause Session</span>
              </button>
            ) : (
              <button
                onClick={() => setIsActive(true)}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 border border-transparent text-white font-extrabold text-[10px] uppercase tracking-wider py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 hover:scale-[1.01]"
              >
                <Play className="h-3.5 w-3.5" />
                <span>Initiate Breathing Coherence</span>
              </button>
            )}

            <button
              onClick={handleReset}
              className="bg-slate-850 hover:bg-slate-800 border border-slate-700 p-2.5 rounded-xl text-slate-400 hover:text-slate-200 cursor-pointer transition-all shrink-0"
              title="Reset Calibration"
            >
              <RefreshCw className="h-4.5 w-4.5" />
            </button>
          </div>

          <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-850 text-[10px] text-slate-400 flex items-start gap-2 leading-relaxed">
            <Zap className="h-4 w-4 text-yellow-400 shrink-0 mt-0.5 animate-bounce" />
            <span>
              <strong>Parasympathetic Synaptic Impact:</strong> Every completed round triggers structural acetylcholine releases, bringing skin conductance triggers (GSR) safely into alpha-relaxed focus values.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
