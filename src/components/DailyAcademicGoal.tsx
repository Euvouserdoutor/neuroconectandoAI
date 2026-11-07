import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookMarked, 
  Clock, 
  CheckCircle2, 
  RotateCcw, 
  Plus, 
  Sparkles, 
  Award, 
  Brain, 
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Check
} from 'lucide-react';

interface DailyAcademicGoalProps {
  cognitive?: {
    attention: 'High' | 'Moderate' | 'Low';
    stress: 'High' | 'Moderate' | 'Low';
    fatigue: 'High' | 'Moderate' | 'Low';
  };
  biometric?: {
    hrv: number;
    gsr: number;
    headMovement: string;
    heartRate: number;
    temperature: number;
  };
}

export default function DailyAcademicGoal({ cognitive, biometric }: DailyAcademicGoalProps) {
  const [topic, setTopic] = useState(() => {
    return localStorage.getItem('academic_goal_topic') || 'Neuro-Plasticity & Learning';
  });
  const [estimatedTime, setEstimatedTime] = useState(() => {
    const saved = localStorage.getItem('academic_goal_est');
    return saved ? parseInt(saved, 10) : 45;
  });
  const [studiedTime, setStudiedTime] = useState(() => {
    const saved = localStorage.getItem('academic_goal_studied');
    return saved ? parseInt(saved, 10) : 15;
  });

  // AI Workload Optimizer States
  const [workloadType, setWorkloadType] = useState<'light' | 'standard' | 'heavy' | 'research'>(() => {
    return (localStorage.getItem('academic_workload_type') as any) || 'standard';
  });
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isOptimizerExpanded, setIsOptimizerExpanded] = useState(() => {
    return localStorage.getItem('academic_optimizer_expanded') === 'true';
  });
  const [optimizationResult, setOptimizationResult] = useState<{
    targetMins: number;
    topicName: string;
    steps: { id: string; label: string; checked: boolean; type: string }[];
    advice: string;
  } | null>(() => {
    const saved = localStorage.getItem('optimized_workload_result');
    return saved ? JSON.parse(saved) : null;
  });

  // Keep localStorage updated
  useEffect(() => {
    localStorage.setItem('academic_goal_topic', topic);
  }, [topic]);

  useEffect(() => {
    localStorage.setItem('academic_goal_est', estimatedTime.toString());
  }, [estimatedTime]);

  useEffect(() => {
    localStorage.setItem('academic_goal_studied', studiedTime.toString());
  }, [studiedTime]);

  useEffect(() => {
    localStorage.setItem('academic_workload_type', workloadType);
  }, [workloadType]);

  useEffect(() => {
    localStorage.setItem('academic_optimizer_expanded', isOptimizerExpanded ? 'true' : 'false');
  }, [isOptimizerExpanded]);

  // Calculations for progress ring
  const percentage = estimatedTime > 0 ? Math.min(100, Math.round((studiedTime / estimatedTime) * 100)) : 0;
  
  // Radial ring parameters
  const radius = 44;
  const circumference = 2 * Math.PI * radius;

  const handleIncrement = (amount: number) => {
    setStudiedTime(prev => Math.min(estimatedTime, Math.max(0, prev + amount)));
  };

  const handleReset = () => {
    setStudiedTime(0);
  };

  const setEstPreset = (mins: number) => {
    setEstimatedTime(mins);
    if (studiedTime > mins) {
      setStudiedTime(mins);
    }
  };

  // AI Optimizer Actions
  const handleOptimizeWorkload = async () => {
    setIsOptimizing(true);
    
    const att = cognitive?.attention || 'High';
    const str = cognitive?.stress || 'Low';
    const fat = cognitive?.fatigue || 'Low';
    const hr = biometric?.heartRate || 72;
    const hrv = biometric?.hrv || 70;
    const gsr = biometric?.gsr || 2.5;

    const workloadLabels = {
      light: 'Light Review (Quick Quiz & Concept Summary)',
      standard: 'Standard Lecture Prep (Notes & Problem Solving)',
      heavy: 'Intense Exam Cram (Multi-chapter Review & Active Recall)',
      research: 'Deep Scientific Research (Literature review & Technical Analysis)'
    };

    const workloadDescription = workloadLabels[workloadType];

    const promptText = `I have a study session on topic "${topic}". My target workload intensity is: "${workloadDescription}".
    My current live neural and bodily bio-signals are:
    - EEG Stress: ${str}
    - EEG Attention: ${att}
    - EEG Fatigue: ${fat}
    - Heart Rate: ${hr} BPM
    - HRV (Heart Rate Variability): ${hrv} ms
    - GSR (Galvanic Skin Response): ${gsr} µS

    Based on these biometric thresholds, please create a tailored, paced study timeline to optimize my academic workload and prevent cognitive burnout.
    Your output MUST follow this exact template so I can parse it:
    
    OPTIMIZED DURATION: [number between 20 and 120, based on fatigue and stress. E.g. If stress is High, recommend a shorter session like 25 or 30 minutes. If focus is High, recommend 50 or 60 minutes]
    OPTIMIZED TOPIC: [A clean, exciting topic title adapted from "${topic}", e.g. "Optimal ${topic} Focus Block"]
    
    Then provide exactly 4 structured, actionable study milestones or break stages as a bulleted checklist. Make sure they contain durations in minutes. One of the steps should be an active mindfulness or physical posture break to downregulate stress if stress is High, or an active attention booster if focus is Low.
    
    Finally, write a brief, 2-sentence encouraging summary of why this specific pacing profile is optimized for my current stress and attention level.`;

    try {
      const res = await fetch('/api/gemini/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: promptText,
          topic: "Academic Workload Optimization & Bio-Pacing",
          cognitiveState: { attention: att, stress: str, fatigue: fat }
        })
      });

      const data = await res.json();
      if (data.success && data.text) {
        // Parse the Gemini output
        const lines: string[] = data.text.split('\n');
        let targetMins = 45;
        let topicName = topic;
        const steps: any[] = [];
        let adviceLines: string[] = [];

        lines.forEach((line, index) => {
          const trimmed = line.trim();
          if (trimmed.toUpperCase().startsWith('OPTIMIZED DURATION:')) {
            const num = parseInt(trimmed.replace(/OPTIMIZED DURATION:/i, '').trim(), 10);
            if (!isNaN(num)) targetMins = num;
          } else if (trimmed.toUpperCase().startsWith('OPTIMIZED TOPIC:')) {
            topicName = trimmed.replace(/OPTIMIZED TOPIC:/i, '').replace(/[*#]+/g, '').trim();
          } else if (trimmed.startsWith('-') || trimmed.startsWith('*') || /^\d+\./.test(trimmed)) {
            const stepText = trimmed.replace(/^[-*\d.]+\s*/, '').replace(/[*]+/g, '').trim();
            if (stepText) {
              steps.push({
                id: `opt-step-${steps.length + 1}`,
                label: stepText,
                checked: false,
                type: stepText.toLowerCase().includes('break') || stepText.toLowerCase().includes('breathe') || stepText.toLowerCase().includes('stretch') ? 'break' : 'focus'
              });
            }
          } else if (trimmed && !trimmed.toUpperCase().startsWith('OPTIMIZED') && steps.length >= 4) {
            adviceLines.push(trimmed);
          }
        });

        // Ensure we have at least some steps or use high-quality adaptive fallbacks
        const finalSteps = steps.length >= 2 ? steps : [
          { id: 'opt-step-1', label: `Focused Study Interval on ${topic} (${Math.round(targetMins * 0.7)}m)`, checked: false, type: 'focus' },
          { id: 'opt-step-2', label: 'Biometric Posture and Core Stretch (5m)', checked: false, type: 'break' },
          { id: 'opt-step-3', label: 'Active Memory Retrieval Quiz Assessment (10m)', checked: false, type: 'focus' },
          { id: 'opt-step-4', label: 'Vagal Breathing Downregulation & Rest (5m)', checked: false, type: 'break' }
        ];

        const finalAdvice = adviceLines.join(' ') || `This pacing structure is dynamically adjusted. A duration of ${targetMins}m with integrated breaks is ideal to preserve cognitive energy under your current stress state.`;

        const resultObj = {
          targetMins,
          topicName,
          steps: finalSteps,
          advice: finalAdvice
        };

        setOptimizationResult(resultObj);
        localStorage.setItem('optimized_workload_result', JSON.stringify(resultObj));
      } else {
        throw new Error("Invalid response");
      }
    } catch (err) {
      console.error(err);
      // Fallback
      const targetMins = str === 'High' ? 25 : att === 'Low' ? 30 : 50;
      const topicName = `Optimized ${topic}`;
      const resultObj = {
        targetMins,
        topicName,
        steps: [
          { id: 'opt-step-1', label: `Focused Learning Block: ${topic} (${targetMins - 10}m)`, checked: false, type: 'focus' },
          { id: 'opt-step-2', label: `Somatic Rest & Diaphragmatic Breather (5m)`, checked: false, type: 'break' },
          { id: 'opt-step-3', label: `Targeted Active Recall Recall (5m)`, checked: false, type: 'focus' },
          { id: 'opt-step-4', label: `Postural Correction & Reset Block (5m)`, checked: false, type: 'break' }
        ],
        advice: `Pacing optimized locally for ${str} stress and ${att} focus levels to protect memory consolidation pathways.`
      };
      setOptimizationResult(resultObj);
      localStorage.setItem('optimized_workload_result', JSON.stringify(resultObj));
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleToggleStep = (stepId: string) => {
    if (!optimizationResult) return;
    const updatedSteps = optimizationResult.steps.map(s => s.id === stepId ? { ...s, checked: !s.checked } : s);
    const updatedResult = { ...optimizationResult, steps: updatedSteps };
    setOptimizationResult(updatedResult);
    localStorage.setItem('optimized_workload_result', JSON.stringify(updatedResult));
  };

  const handleApplyOptimization = () => {
    if (!optimizationResult) return;
    setEstimatedTime(optimizationResult.targetMins);
    setTopic(optimizationResult.topicName);
    setStudiedTime(0);
  };

  const handleClearOptimization = () => {
    setOptimizationResult(null);
    localStorage.removeItem('optimized_workload_result');
  };

  // Dynamic feedback copy based on study progress level
  let motivationText = "Time to lock in! Setup your goal above.";
  let statusColor = "text-indigo-400";
  if (percentage === 0) {
    motivationText = "Set study goals & click +5m/+15m to track!";
    statusColor = "text-slate-400";
  } else if (percentage < 40) {
    motivationText = "Getting started is the hardest part. You’ve got this!";
    statusColor = "text-sky-400";
  } else if (percentage < 75) {
    motivationText = "Superb focus! You are in the optimal cognitive flow zone.";
    statusColor = "text-emerald-400";
  } else if (percentage < 100) {
    motivationText = "Almost there! One final push to complete your module goal.";
    statusColor = "text-indigo-400";
  } else {
    motivationText = "Fantastic work! Daily Academic Goal successfully achieved! 🎯";
    statusColor = "text-amber-400";
  }

  // Adaptive Styling depending on cognitive state
  const isHighStress = cognitive?.stress === 'High';
  const isLowAttention = cognitive?.attention === 'Low';

  let optBgClass = 'from-slate-950/60 via-slate-900/50 to-indigo-950/10 border-slate-800';
  if (isHighStress) {
    optBgClass = 'from-purple-950/20 via-slate-900/40 to-indigo-950/20 border-purple-500/15';
  } else if (isLowAttention) {
    optBgClass = 'from-amber-955/15 via-slate-900/40 to-orange-955/10 border-amber-500/15';
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-2xl relative overflow-hidden flex flex-col justify-between" id="daily_academic_goal_component">
      {/* Decorative glow background */}
      <div className="absolute top-0 right-0 -mr-12 -mt-12 h-32 w-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
      
      <div>
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <BookMarked className="h-5 w-5 text-indigo-400" />
            <div>
              <h3 className="font-bold text-slate-100 text-sm">Daily Academic Goal</h3>
              <p className="text-[10px] text-slate-400">Log study progress against custom targets</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {percentage >= 100 && (
              <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-amber-400 bg-amber-955/40 border border-amber-900 px-2 py-0.5 rounded animate-pulse">
                <Award className="h-3 w-3" /> Goal Cleared
              </span>
            )}
            <button
              onClick={() => setIsOptimizerExpanded(!isOptimizerExpanded)}
              className={`flex items-center gap-1 text-[9.5px] font-bold px-2.5 py-1 rounded transition-all border cursor-pointer ${
                isOptimizerExpanded
                  ? 'bg-indigo-950/50 border-indigo-500 text-indigo-300'
                  : 'bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-200'
              }`}
              title="Optimize workload using biometric AI"
            >
              <Sparkles className="h-3 w-3 animate-pulse text-indigo-400" />
              <span>AI Optimizer</span>
              {isOptimizerExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>
          </div>
        </div>

        {/* WORKLOAD OPTIMIZER PANEL */}
        <AnimatePresence>
          {isOptimizerExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden mb-4"
            >
              <div className={`bg-gradient-to-br ${optBgClass} border rounded-xl p-3.5 space-y-3.5`} id="workload-optimizer-drawer">
                <div className="flex items-center justify-between border-b border-slate-850/60 pb-2">
                  <div className="flex items-center gap-2">
                    <Brain className="h-4 w-4 text-indigo-400 animate-pulse" />
                    <div>
                      <h4 className="text-[10.5px] font-bold text-white uppercase tracking-wider">AI Workload & Pacing Optimizer</h4>
                      <p className="text-[8px] text-indigo-300 font-mono">Real-Time EEG Biometric Adaptation</p>
                    </div>
                  </div>
                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase ${
                    isHighStress ? 'bg-purple-950 border border-purple-800 text-purple-400' :
                    isLowAttention ? 'bg-amber-950 border border-amber-800 text-amber-400' :
                    'bg-slate-950 border border-slate-850 text-slate-400'
                  }`}>
                    {cognitive?.stress === 'High' ? 'Stress Adapt: ON' :
                     cognitive?.attention === 'Low' ? 'Alertness Boost: ON' :
                     'Optimal Pacing'}
                  </span>
                </div>

                {!optimizationResult && !isOptimizing && (
                  <div className="space-y-3">
                    <p className="text-[9px] text-slate-450 leading-relaxed">
                      Select your intended workload density. The algorithm merges this target with your live EEG biometrics to pace your study and break schedules perfectly.
                    </p>

                    <div className="grid grid-cols-2 gap-1 bg-slate-950/80 p-1 rounded-lg border border-slate-850">
                      {[
                        { key: 'light', label: 'Light Review' },
                        { key: 'standard', label: 'Standard Prep' },
                        { key: 'heavy', label: 'Exam Cram' },
                        { key: 'research', label: 'Research' }
                      ].map((item) => (
                        <button
                          key={item.key}
                          type="button"
                          onClick={() => setWorkloadType(item.key as any)}
                          className={`py-1 text-[8.5px] font-bold tracking-tight rounded-md transition-all cursor-pointer text-center ${
                            workloadType === item.key
                              ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/25'
                              : 'text-slate-500 hover:text-slate-300 border border-transparent'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={handleOptimizeWorkload}
                      className="w-full bg-indigo-650 hover:bg-indigo-550 text-white font-bold py-1.5 rounded-md flex items-center justify-center gap-1.5 transition-all text-[9.5px] uppercase cursor-pointer tracking-wider"
                    >
                      <RefreshCw className="h-3.5 w-3.5 animate-spin-slow" />
                      <span>Calibrate Cognitive Workload</span>
                    </button>
                  </div>
                )}

                {isOptimizing && (
                  <div className="py-6 flex flex-col items-center justify-center text-center space-y-2">
                    <RefreshCw className="h-6 w-6 text-indigo-400 animate-spin" />
                    <span className="text-[10px] text-indigo-300 font-mono">Synthesizing brain metrics and study loads...</span>
                  </div>
                )}

                {optimizationResult && !isOptimizing && (
                  <div className="space-y-3.5">
                    {/* Computed Stats HUD */}
                    <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-850/70 space-y-2">
                      <div className="flex justify-between items-center text-[9.5px]">
                        <span className="text-slate-400 font-semibold uppercase">AI Recommended Goal</span>
                        <span className="text-indigo-400 font-bold font-mono">{optimizationResult.targetMins} Mins</span>
                      </div>
                      <div className="flex justify-between items-center text-[9.5px] border-t border-slate-900 pt-1.5">
                        <span className="text-slate-400 font-semibold uppercase">Focus Topic</span>
                        <span className="text-emerald-450 text-emerald-400 font-bold truncate max-w-[140px]">{optimizationResult.topicName}</span>
                      </div>
                    </div>

                    {/* Milestones Checklist */}
                    <div className="space-y-2">
                      <span className="text-[8.5px] font-bold text-slate-500 uppercase tracking-widest block font-mono">Workload Pacing Milestones</span>
                      <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1 scrollbar-thin">
                        {optimizationResult.steps.map((step) => (
                          <div
                            key={step.id}
                            onClick={() => handleToggleStep(step.id)}
                            className={`p-2 rounded-lg border transition-all text-[9.5px] cursor-pointer flex items-start gap-2 ${
                              step.checked
                                ? 'bg-slate-950/40 border-slate-850 text-slate-500 line-through'
                                : step.type === 'break'
                                ? 'bg-purple-950/15 border-purple-900/30 text-purple-300 hover:bg-purple-950/30'
                                : 'bg-slate-900 border-slate-850 text-slate-200 hover:bg-slate-850/60'
                            }`}
                          >
                            <div className={`h-3.5 w-3.5 rounded border flex items-center justify-center shrink-0 mt-0.5 ${
                              step.checked
                                ? 'bg-indigo-650 border-indigo-600 text-white'
                                : step.type === 'break'
                                ? 'border-purple-800'
                                : 'border-slate-700'
                            }`}>
                              {step.checked && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                            </div>
                            <span className="leading-snug">{step.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* AI Feedback Advice */}
                    <p className="text-[8.5px] text-slate-400 leading-relaxed bg-slate-950/40 p-2.5 rounded border border-slate-850/50 italic">
                      {optimizationResult.advice}
                    </p>

                    {/* Action Panel */}
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleClearOptimization}
                        className="flex-1 py-1.5 rounded-lg text-[9px] font-bold text-slate-400 bg-slate-950 border border-slate-850 hover:text-white hover:border-slate-700 cursor-pointer text-center"
                      >
                        Reset Optimization
                      </button>
                      <button
                        type="button"
                        onClick={handleApplyOptimization}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-1.5 rounded-lg text-[9px] uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer animate-pulse"
                      >
                        <CheckCircle2 className="h-3 w-3" />
                        <span>Apply to Timer</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-4">
          {/* Study Topic Input */}
          <div>
            <label className="block text-[10.5px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Current Focus Topic
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Brain plasticity, Fourier Transforms..."
              className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-500 focus:outline-none px-3 py-2 rounded-lg text-xs text-slate-100 placeholder-slate-650 transition-colors"
            />
          </div>

          {/* Duration Config with Presets */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider">
                Target Study Duration
              </label>
              <span className="text-[11px] font-mono text-indigo-400 font-bold">{estimatedTime} minutes</span>
            </div>
            
            {/* Custom Range Slider */}
            <input
              type="range"
              min="10"
              max="180"
              step="5"
              value={estimatedTime}
              onChange={(e) => setEstPreset(parseInt(e.target.value, 10))}
              className="w-full h-1 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-indigo-500 my-2"
            />

            {/* Quick preset buttons */}
            <div className="flex justify-between gap-1 mt-1">
              {[15, 30, 45, 60, 90, 120].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setEstPreset(mins)}
                  className={`flex-1 text-[9px] font-bold py-1 rounded transition-colors border cursor-pointer text-center ${
                    estimatedTime === mins
                      ? 'bg-indigo-950 border-indigo-700 text-indigo-400'
                      : 'bg-slate-950 border-slate-850 text-slate-500 hover:text-slate-350 hover:border-slate-700'
                  }`}
                >
                  {mins}m
                </button>
              ))}
            </div>
          </div>

          {/* Sibling Flex Layout: Quick Logging Controls (Left) and Visual Arc Ring (Right) */}
          <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-950/40 p-4 rounded-xl border border-slate-850/60 justify-between">
            {/* Study controls list */}
            <div className="space-y-3 w-full sm:flex-1">
              <span className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider">
                Log Active Study Sessions
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleIncrement(5)}
                  disabled={studiedTime >= estimatedTime}
                  className="flex items-center justify-center gap-1 bg-slate-950 border border-slate-800 text-slate-250 px-2 py-2 rounded-lg text-xs font-semibold hover:border-indigo-600 hover:bg-slate-900 disabled:opacity-30 disabled:pointer-events-none cursor-pointer transition-colors"
                >
                  <Plus className="h-3 w-3 text-indigo-450" />
                  <span>+5 Mins</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleIncrement(15)}
                  disabled={studiedTime >= estimatedTime}
                  className="flex items-center justify-center gap-1 bg-slate-950 border border-slate-800 text-slate-250 px-2 py-2 rounded-lg text-xs font-semibold hover:border-indigo-600 hover:bg-slate-900 disabled:opacity-30 disabled:pointer-events-none cursor-pointer transition-colors"
                >
                  <Plus className="h-3.5 w-3.5 text-indigo-455" />
                  <span>+15 Mins</span>
                </button>
              </div>
              
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStudiedTime(estimatedTime)}
                  disabled={studiedTime >= estimatedTime}
                  className="flex-1 flex items-center justify-center gap-1 bg-indigo-600 hover:bg-indigo-500 text-slate-100 px-2.5 py-2 rounded-lg text-xs font-bold disabled:opacity-30 disabled:pointer-events-none cursor-pointer transition-colors"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Mark Complete</span>
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  title="Reset study sessions"
                  className="flex items-center justify-center border border-slate-850 hover:bg-slate-850 text-slate-400 hover:text-slate-205 p-2 rounded-lg text-xs cursor-pointer transition-all"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Circular Progress Ring display */}
            <div className="flex flex-col items-center justify-center py-1 sm:w-32 shrink-0 relative">
              <div className="relative flex items-center justify-center">
                <svg width="112" height="112" className="transform -rotate-90">
                  <circle
                    cx="56"
                    cy="56"
                    r={radius}
                    stroke="#0b0f19"
                    strokeWidth="7"
                    fill="transparent"
                  />
                  <circle
                    cx="56"
                    cy="56"
                    r={radius}
                    stroke={percentage >= 100 ? '#f59e0b' : '#6366f1'}
                    strokeWidth="7"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference - (percentage / 100) * circumference}
                    strokeLinecap="round"
                    fill="transparent"
                    style={{ filter: `blur(2px)`, opacity: 0.2 }}
                    className="transition-all duration-500 ease-out"
                  />
                  <motion.circle
                    cx="56"
                    cy="56"
                    r={radius}
                    stroke={percentage >= 100 ? '#f59e0b' : '#6366f1'}
                    strokeWidth="7"
                    strokeDasharray={circumference}
                    animate={{ strokeDashoffset: circumference - (percentage / 100) * circumference }}
                    transition={{ type: 'spring', stiffness: 60, damping: 15 }}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-[9px] text-slate-550 font-bold uppercase tracking-wider leading-none mb-0.5">Studied</span>
                  <span className="text-lg font-bold text-slate-100 leading-none">
                    {studiedTime}m
                  </span>
                  <span className="text-[8px] text-slate-450 font-mono mt-0.5">
                    / {estimatedTime}m
                  </span>
                </div>
              </div>

              <div className="mt-2 text-center">
                <span className={`text-[9.5px] uppercase tracking-wider font-extrabold ${statusColor} flex items-center justify-center gap-1`}>
                  <Sparkles className="h-3 w-3 animate-pulse" />
                  <span>{percentage}% Done</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Feedback Zone */}
      <div className="mt-4 bg-slate-950/70 p-3 rounded-xl border border-slate-800/60 flex items-center gap-2 text-xs">
        <Clock className="h-4 w-4 text-slate-550 shrink-0" />
        <span className="text-slate-350 leading-relaxed italic">{motivationText}</span>
      </div>
    </div>
  );
}
