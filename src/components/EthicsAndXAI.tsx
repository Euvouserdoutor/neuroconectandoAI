import React, { useState } from 'react';
import { ShieldCheck, EyeOff, Scale, HelpCircle, Check, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';

export default function EthicsAndXAI() {
  const [checklist, setChecklist] = useState({
    consent: true,
    localDenoise: true,
    dataOffload: false,
    noFaceTracking: true,
    teacherExplain: true,
  });

  const toggleCheck = (key: keyof typeof checklist) => {
    setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-6" id="ethics-and-xai-view">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
          <ShieldCheck className="h-5 w-5 text-emerald-400 animate-pulse" />
        </div>
        <div>
          <h3 className="text-sm font-black text-slate-100 uppercase tracking-tight flex items-center gap-1.5 font-sans">
            Explainable AI (XAI) & Ethical Neuro-Privacy
            <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 font-mono text-[8px] uppercase tracking-wider font-extrabold rounded-full border border-emerald-900/40">
              Ethical AI
            </span>
          </h3>
          <p className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold">
            Telemetry Minimization & Student Safeguarding Framework
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Core Principles */}
        <div className="lg:col-span-7 bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-4">
          <h4 className="text-[10px] text-slate-400 font-bold uppercase tracking-wider border-b border-slate-900 pb-2">
            Neuro-Ethical Framework Guidelines
          </h4>

          <div className="space-y-3">
            <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-850 flex gap-3">
              <EyeOff className="h-4.5 w-4.5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h5 className="text-[10.5px] font-bold text-slate-200 uppercase tracking-tight">Biometric Data Sovereignty</h5>
                <p className="text-[9.5px] text-slate-400 leading-normal">
                  No Raw waveforms are stored on-disk. Signals are converted to micro-aggregates (mean HRV interval) on-device and aged-off the buffer immediately after the local feedback loop terminates.
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-850 flex gap-3">
              <Scale className="h-4.5 w-4.5 text-indigo-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h5 className="text-[10.5px] font-bold text-slate-200 uppercase tracking-tight">Bias Elimination in Burnout Predictors</h5>
                <p className="text-[9.5px] text-slate-400 leading-normal">
                  The GNN (Graph Neural Network) does not read socio-demographic features (race, gender, test scores). Inference maps nodes strictly by heart rate variability and response latency metrics.
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-850 flex gap-3">
              <HelpCircle className="h-4.5 w-4.5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h5 className="text-[10.5px] font-bold text-slate-200 uppercase tracking-tight">Explainable Interventions (XAI)</h5>
                <p className="text-[9.5px] text-slate-400 leading-normal">
                  Every burnout notification explains the trigger causality. Rather than generating a black-box percentage, the interface highlights parameters (e.g. "Low respiratory high frequencies in PPG indicating persistent high sympathetic load over last 15 minutes").
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Ethical Audit interactive Checklist */}
        <div className="lg:col-span-5 bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-4">
          <h4 className="text-[10px] text-slate-400 font-bold uppercase tracking-wider border-b border-slate-900 pb-2">
            Active Ethical Compliance Audit
          </h4>

          <div className="space-y-3">
            <div
              onClick={() => toggleCheck('consent')}
              className="p-2.5 bg-slate-900/60 rounded-lg border border-slate-850/60 flex items-center justify-between cursor-pointer hover:bg-slate-900 hover:border-slate-800 transition-all select-none"
            >
              <span className="text-[10px] text-slate-300 font-medium">Double-Consent Opt-in Active</span>
              <div className={`h-4 w-4 rounded flex items-center justify-center border transition-all ${
                checklist.consent ? 'bg-emerald-600 border-emerald-500 text-white' : 'border-slate-700 bg-slate-950'
              }`}>
                {checklist.consent && <Check className="h-3 w-3" />}
              </div>
            </div>

            <div
              onClick={() => toggleCheck('localDenoise')}
              className="p-2.5 bg-slate-900/60 rounded-lg border border-slate-850/60 flex items-center justify-between cursor-pointer hover:bg-slate-900 hover:border-slate-800 transition-all select-none"
            >
              <span className="text-[10px] text-slate-300 font-medium">Local Denoising & Filtering</span>
              <div className={`h-4 w-4 rounded flex items-center justify-center border transition-all ${
                checklist.localDenoise ? 'bg-emerald-600 border-emerald-500 text-white' : 'border-slate-700 bg-slate-950'
              }`}>
                {checklist.localDenoise && <Check className="h-3 w-3" />}
              </div>
            </div>

            <div
              onClick={() => toggleCheck('noFaceTracking')}
              className="p-2.5 bg-slate-900/60 rounded-lg border border-slate-850/60 flex items-center justify-between cursor-pointer hover:bg-slate-900 hover:border-slate-800 transition-all select-none"
            >
              <span className="text-[10px] text-slate-300 font-medium">Zero-camera Facial Tracking</span>
              <div className={`h-4 w-4 rounded flex items-center justify-center border transition-all ${
                checklist.noFaceTracking ? 'bg-emerald-600 border-emerald-500 text-white' : 'border-slate-700 bg-slate-950'
              }`}>
                {checklist.noFaceTracking && <Check className="h-3 w-3" />}
              </div>
            </div>

            <div
              onClick={() => toggleCheck('teacherExplain')}
              className="p-2.5 bg-slate-900/60 rounded-lg border border-slate-850/60 flex items-center justify-between cursor-pointer hover:bg-slate-900 hover:border-slate-800 transition-all select-none"
            >
              <span className="text-[10px] text-slate-300 font-medium">Causal Explanation for Teachers</span>
              <div className={`h-4 w-4 rounded flex items-center justify-center border transition-all ${
                checklist.teacherExplain ? 'bg-emerald-600 border-emerald-500 text-white' : 'border-slate-700 bg-slate-950'
              }`}>
                {checklist.teacherExplain && <Check className="h-3 w-3" />}
              </div>
            </div>

            <div
              onClick={() => toggleCheck('dataOffload')}
              className="p-2.5 bg-slate-900/60 rounded-lg border border-slate-850/60 flex items-center justify-between cursor-pointer hover:bg-slate-900 hover:border-slate-800 transition-all select-none"
            >
              <span className="text-[10px] text-slate-300 font-medium">Full raw sensor data export</span>
              <div className={`h-4 w-4 rounded flex items-center justify-center border transition-all ${
                checklist.dataOffload ? 'bg-emerald-600 border-emerald-500 text-white' : 'border-slate-700 bg-slate-950'
              }`}>
                {checklist.dataOffload && <Check className="h-3 w-3" />}
              </div>
            </div>
          </div>

          <div className="p-3 bg-emerald-950/15 border border-emerald-900/40 rounded-lg flex items-start gap-2 select-none">
            <AlertTriangle className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
            <p className="text-[8.5px] text-slate-400 leading-normal">
              Warning: Enabling "Full raw sensor data export" will override the telemetry data minimization principles. Check with local school boards to verify compliance before toggling on-disk records.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
