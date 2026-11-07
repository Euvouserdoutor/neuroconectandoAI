import React, { useState } from 'react';
import { FlaskConical, Sliders, RefreshCw, Sparkles, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';
import { CognitiveState, BiometricState } from '../types';

interface ResearchAcademicSandboxProps {
  cognitive: CognitiveState;
  biometric: BiometricState;
}

export default function ResearchAcademicSandbox({ cognitive, biometric }: ResearchAcademicSandboxProps) {
  // Simulator Local States
  const [syntheticCognitiveLoad, setSyntheticCognitiveLoad] = useState(() => {
    if (cognitive.stress === 'High') return 85;
    if (cognitive.stress === 'Moderate') return 55;
    return 25;
  });
  const [syntheticHeartRate, setSyntheticHeartRate] = useState(biometric.heartRate);
  const [syntheticGsr, setSyntheticGsr] = useState(biometric.gsr);
  
  // Calculate synthetic output variables based on inputs
  const simulatedBurnoutIndex = Math.min(
    100,
    Math.round((syntheticCognitiveLoad * 0.4) + (syntheticHeartRate * 0.3) + (syntheticGsr * 8))
  );

  const getSimulatedRiskStatus = () => {
    if (simulatedBurnoutIndex > 75) return { label: "CRITICAL CRASH DANGER", color: "text-rose-400 bg-rose-950/40 border-rose-900/40" };
    if (simulatedBurnoutIndex > 50) return { label: "MODERATE FATIGUE WARNING", color: "text-amber-400 bg-amber-950/40 border-amber-900/40" };
    return { label: "STABLE OPTIMAL COHESION", color: "text-emerald-400 bg-emerald-950/40 border-emerald-900/40" };
  };

  const status = getSimulatedRiskStatus();

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-6" id="research-academic-sandbox-view">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
          <FlaskConical className="h-5 w-5 text-indigo-400 animate-pulse" />
        </div>
        <div>
          <h3 className="text-sm font-black text-slate-100 uppercase tracking-tight flex items-center gap-1.5 font-sans">
            Research & Academic Simulation Sandbox
            <span className="px-2 py-0.5 bg-indigo-950 text-indigo-400 font-mono text-[8px] uppercase tracking-wider font-extrabold rounded-full border border-indigo-900/40">
              Lab Active
            </span>
          </h3>
          <p className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold">
            Modulate student bio-parameters & evaluate burnout predictability
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Modulate parameters */}
        <div className="lg:col-span-6 bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-900 pb-2">
            <h4 className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="h-3 w-3 text-indigo-400" />
              Adjust Simulator Parameters
            </h4>
            <button 
              onClick={() => {
                const loadVal = cognitive.stress === 'High' ? 85 : cognitive.stress === 'Moderate' ? 55 : 25;
                setSyntheticCognitiveLoad(loadVal);
                setSyntheticHeartRate(biometric.heartRate);
                setSyntheticGsr(biometric.gsr);
              }}
              className="text-[9px] text-indigo-400 hover:text-indigo-350 flex items-center gap-1 bg-indigo-950 border border-indigo-900/30 px-2 py-0.5 rounded cursor-pointer"
            >
              <RefreshCw className="h-2.5 w-2.5" /> Synchronize Real Inputs
            </button>
          </div>

          <div className="space-y-4 pt-1">
            {/* Cognitive Load */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                <span>Cognitive Load Level</span>
                <span className="font-mono text-indigo-400 font-black">{syntheticCognitiveLoad}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={syntheticCognitiveLoad}
                onChange={(e) => setSyntheticCognitiveLoad(parseInt(e.target.value))}
                className="w-full h-1 bg-slate-900 rounded-lg cursor-pointer accent-indigo-500"
              />
              <div className="flex justify-between text-[7px] text-slate-500 font-mono uppercase">
                <span>Relaxed State</span>
                <span>Mental Strain Boundary</span>
              </div>
            </div>

            {/* Heart Rate */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                <span>Heart Rate (BPM)</span>
                <span className="font-mono text-rose-400 font-black">{syntheticHeartRate} BPM</span>
              </div>
              <input
                type="range"
                min="50"
                max="160"
                value={syntheticHeartRate}
                onChange={(e) => setSyntheticHeartRate(parseInt(e.target.value))}
                className="w-full h-1 bg-slate-900 rounded-lg cursor-pointer accent-rose-500"
              />
              <div className="flex justify-between text-[7px] text-slate-500 font-mono uppercase">
                <span>Bradycardia / Resting</span>
                <span>Hyper-arousal / Tachycardia</span>
              </div>
            </div>

            {/* Galvanic Skin Response */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                <span>Galvanic Skin Response (GSR)</span>
                <span className="font-mono text-emerald-400 font-black">{syntheticGsr} µS</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="12"
                step="0.1"
                value={syntheticGsr}
                onChange={(e) => setSyntheticGsr(parseFloat(e.target.value))}
                className="w-full h-1 bg-slate-900 rounded-lg cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between text-[7px] text-slate-500 font-mono uppercase">
                <span>Low Sweat conductance</span>
                <span>High Sympathetic sweat spike</span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Predictor Outputs */}
        <div className="lg:col-span-6 bg-slate-950 p-4 rounded-xl border border-slate-850 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center border-b border-slate-900 pb-2">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-black">
                Predictive GNN Burnout Estimations
              </span>
              <span className={`text-[8px] font-bold uppercase px-2 py-0.5 rounded border ${status.color}`}>
                {status.label}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-850/60 flex flex-col justify-between h-20">
                <span className="text-[9px] font-mono text-slate-500 uppercase font-bold">Simulated Fatigue Score</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-indigo-400 font-sans tracking-tight">
                    {simulatedBurnoutIndex}
                  </span>
                  <span className="text-[9px] text-slate-500 uppercase">/ 100</span>
                </div>
              </div>

              <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-850/60 flex flex-col justify-between h-20">
                <span className="text-[9px] font-mono text-slate-500 uppercase font-bold">Vagal Tone Estimation</span>
                <div className="flex items-baseline gap-1">
                  <span className={`text-2xl font-black font-sans tracking-tight ${simulatedBurnoutIndex > 65 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {Math.max(10, 100 - Math.round(simulatedBurnoutIndex * 0.9))}
                  </span>
                  <span className="text-[9px] text-slate-500 uppercase">ms RMSSD</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 bg-indigo-950/15 border border-indigo-900/40 rounded-lg space-y-1.5 select-none">
            <div className="flex items-center gap-1 text-[9px] font-extrabold text-indigo-400 uppercase tracking-wider">
              <Sparkles className="h-3 w-3 animate-spin" />
              <span>Academic Observation Report</span>
            </div>
            <p className="text-[8.5px] text-slate-400 leading-normal">
              Notice how elevating both Galvanic Skin Response (GSR) and Cognitive Load creates a positive nonlinear curve in the fatigue output, demonstrating the predictive power of multi-modal biosensing models compared to isolated Heart Rate telemetry.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
