import React, { useState } from 'react';
import { Database, Cpu, Sparkles, Send, ShieldCheck, RefreshCw, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function CloudAndVertex() {
  const [activeTab, setActiveTab] = useState<'firebase' | 'vertex' | 'api'>('firebase');
  
  // Vertex Parameters
  const [temperature, setTemperature] = useState(0.7);
  const [topP, setTopP] = useState(0.9);
  const [maxTokens, setMaxTokens] = useState(1024);
  const [prompt, setPrompt] = useState('Analyse biometric telemetry: Heart Rate 92, HRV 45, GSR 4.2. Output immediate cognitive fatigue mitigation advice.');
  const [isQuerying, setIsQuerying] = useState(false);
  const [responseOutput, setResponseOutput] = useState<string | null>(null);

  const handleSimulateAPI = () => {
    setIsQuerying(true);
    setTimeout(() => {
      setResponseOutput(JSON.stringify({
        telemetryAnalysis: {
          physioActivation: "High cardiovascular engagement with depressed parasympathetic tone (low HRV). Elevated GSR indicates sweat gland activity (sympathetic spike).",
          fatigueRisk: "82% Burnout warning threshold breached.",
          recommendedIntervention: {
            coherencePacing: "Initiate 4-second box-breathing cycle to increase vagal nerve stimulation.",
            sensoryAdjustment: "Adjust lighting to cool color spectrum; decrease white-noise volume.",
            academicPacing: "Pause high-density problem solving; engage in visual mind mapping for 5 minutes."
          }
        }
      }, null, 2));
      setIsQuerying(false);
    }, 900);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-6" id="cloud-and-vertex-view">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
            <Database className="h-5 w-5 text-indigo-400 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-100 uppercase tracking-tight flex items-center gap-1.5 font-sans">
              Google Workspace & Cloud Stack Specs
              <span className="px-2 py-0.5 bg-indigo-950 text-indigo-400 font-mono text-[8px] uppercase tracking-wider font-extrabold rounded-full border border-indigo-900/40">
                GCP Stack
              </span>
            </h3>
            <p className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold">
              Serverless Edge-to-Cloud Database & Neural Inference Architecture
            </p>
          </div>
        </div>
      </div>

      {/* Primary Sub-Tabs */}
      <div className="grid grid-cols-3 bg-slate-950 p-1 rounded-xl border border-slate-850 gap-1">
        <button
          onClick={() => setActiveTab('firebase')}
          className={`px-3 py-2 text-[9px] uppercase font-black tracking-wider rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'firebase'
              ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30'
              : 'text-slate-500 hover:text-slate-350 hover:bg-slate-900/30'
          }`}
        >
          <Database className="h-3.5 w-3.5" />
          <span>Firestore Schema</span>
        </button>
        <button
          onClick={() => setActiveTab('vertex')}
          className={`px-3 py-2 text-[9px] uppercase font-black tracking-wider rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'vertex'
              ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30'
              : 'text-slate-500 hover:text-slate-350 hover:bg-slate-900/30'
          }`}
        >
          <Cpu className="h-3.5 w-3.5" />
          <span>Vertex Tuning</span>
        </button>
        <button
          onClick={() => setActiveTab('api')}
          className={`px-3 py-2 text-[9px] uppercase font-black tracking-wider rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'api'
              ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30'
              : 'text-slate-500 hover:text-slate-350 hover:bg-slate-900/30'
          }`}
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>AI Emulator</span>
        </button>
      </div>

      {/* Content Panels */}
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-850">
        <AnimatePresence mode="wait">
          {activeTab === 'firebase' && (
            <motion.div
              key="firebase-tab"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-black">
                  Firestore Database collections structure
                </span>
                <span className="text-[7px] bg-emerald-950/40 text-emerald-400 border border-emerald-900/40 px-1.5 py-0.5 rounded font-mono font-bold uppercase">
                  Connected
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div className="bg-slate-900/70 p-3 rounded-lg border border-slate-850/60 space-y-2">
                  <h5 className="text-[10px] text-slate-200 font-extrabold uppercase tracking-tight flex items-center gap-1.5">
                    <Layers className="h-3 w-3 text-indigo-400" />
                    Collection: `wellness_logs`
                  </h5>
                  <p className="text-[9px] text-slate-400">
                    Stores chronological logs of student stress, heart rates, skin conductance, and qualitative burnout responses.
                  </p>
                  <pre className="text-[7.5px] font-mono text-slate-400 bg-slate-950 p-2 rounded border border-slate-900/80 overflow-x-auto leading-normal">
{`{
  userId: string,
  timestamp: string,       // UTC Iso
  heartRate: number,       // BPM
  hrv: number,             // ms
  gsr: number,             // µS
  cognitiveLoad: number,   // %
  wellnessResponse: number // 1-5 scale
}`}
                  </pre>
                </div>

                <div className="bg-slate-900/70 p-3 rounded-lg border border-slate-850/60 space-y-2">
                  <h5 className="text-[10px] text-slate-200 font-extrabold uppercase tracking-tight flex items-center gap-1.5">
                    <Layers className="h-3 w-3 text-rose-400" />
                    Collection: `distress_signals`
                  </h5>
                  <p className="text-[9px] text-slate-400">
                    High-importance collection storing automated triggers when a student's distress indices exceed safety bounds.
                  </p>
                  <pre className="text-[7.5px] font-mono text-slate-400 bg-slate-950 p-2 rounded border border-slate-900/80 overflow-x-auto leading-normal">
{`{
  userId: string,
  timestamp: string,
  riskCategory: "fatigue" | "burnout",
  triggerSource: "GNN_Model" | "User_Self",
  wellnessDelta: number,  // calculated delta
  isResolved: boolean
}`}
                  </pre>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'vertex' && (
            <motion.div
              key="vertex-tab"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-black">
                  Model configurations & Inference parameters
                </span>
                <span className="text-[8px] bg-indigo-950 text-indigo-400 font-mono px-2 py-0.5 rounded border border-indigo-900/40">
                  Gemini 2.5 Flash API
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[9px] text-slate-400 font-bold uppercase">
                    <span>Temperature</span>
                    <span className="font-mono text-indigo-400">{temperature}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={temperature}
                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                    className="w-full accent-indigo-500 h-1 bg-slate-900 rounded-lg cursor-pointer"
                  />
                  <p className="text-[8px] text-slate-500">
                    Controls creativity. Lower values yield deterministic, diagnostic outputs.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-[9px] text-slate-400 font-bold uppercase">
                    <span>Top-P (Nucleus)</span>
                    <span className="font-mono text-indigo-400">{topP}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={topP}
                    onChange={(e) => setTopP(parseFloat(e.target.value))}
                    className="w-full accent-indigo-500 h-1 bg-slate-900 rounded-lg cursor-pointer"
                  />
                  <p className="text-[8px] text-slate-500">
                    Limits selection to the cumulative probability mass.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-[9px] text-slate-400 font-bold uppercase">
                    <span>Max Output Tokens</span>
                    <span className="font-mono text-indigo-400">{maxTokens}</span>
                  </div>
                  <input
                    type="range"
                    min="128"
                    max="2048"
                    step="64"
                    value={maxTokens}
                    onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                    className="w-full accent-indigo-500 h-1 bg-slate-900 rounded-lg cursor-pointer"
                  />
                  <p className="text-[8px] text-slate-500">
                    Limits response scale to control API consumption.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-indigo-950/10 border border-indigo-900/40 rounded-lg flex items-start gap-2.5">
                <ShieldCheck className="h-4 w-4 text-indigo-400 mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  <h6 className="text-[9.5px] font-black text-slate-200 uppercase tracking-wider">Safety Filters Enforced</h6>
                  <p className="text-[8.5px] text-slate-400 leading-normal">
                    Hate Speech, Harassment, Dangerous Content, and Sexually Explicit parameters are mapped to high filters. Educational sandbox constraints actively reject unsolicited inputs.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'api' && (
            <motion.div
              key="api-tab"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <label className="text-[9px] font-mono text-slate-500 uppercase tracking-wider font-extrabold block">
                  Write prompt query payload
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 outline-none focus:border-indigo-500 font-sans"
                  />
                  <button
                    onClick={handleSimulateAPI}
                    disabled={isQuerying}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-xs text-white font-bold rounded-lg flex items-center gap-1 cursor-pointer disabled:opacity-50 transition-all"
                  >
                    <Send className="h-3 w-3" />
                    <span>Run Query</span>
                  </button>
                </div>
              </div>

              {/* Code output mock */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[8.5px] font-mono text-slate-500">
                  <span>VERTEX CLOUD RESPONSE OUTPUT</span>
                  {isQuerying && (
                    <span className="text-indigo-400 flex items-center gap-1">
                      <RefreshCw className="h-2.5 w-2.5 animate-spin" /> Querying API Model...
                    </span>
                  )}
                </div>

                <div className="h-44 bg-slate-900 rounded-lg border border-slate-850 p-3 overflow-y-auto font-mono text-[8px] text-indigo-300 leading-normal whitespace-pre">
                  {responseOutput ? (
                    responseOutput
                  ) : (
                    <span className="text-slate-600 italic">No request sent yet. Click 'Run Query' above to view simulated JSON telemetry output.</span>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
