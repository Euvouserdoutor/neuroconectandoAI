import React, { useState, useEffect } from 'react';
import { Home, ClipboardList, Shield, Brain, Heart, Star, Compass, AlertCircle, Smile, Moon } from 'lucide-react';
import { getWellnessCheckIns, WellnessData, getDistressSignals, DistressSignal } from '../lib/firebase';
import { CognitiveState, BiometricState } from '../types';

interface ParentDashboardProps {
  cognitive?: CognitiveState;
  biometric?: BiometricState;
}

export default function ParentDashboard({ cognitive, biometric }: ParentDashboardProps) {
  const [parentAdviceText, setParentAdviceText] = useState('');
  const [adviceResponse, setAdviceResponse] = useState<string | null>(null);
  const [isAdviceLoading, setIsAdviceLoading] = useState(false);
  const [wellnessLogs, setWellnessLogs] = useState<WellnessData[]>([]);
  const [isLogsLoading, setIsLogsLoading] = useState(false);
  const [distressSignals, setDistressSignals] = useState<DistressSignal[]>([]);
  const [isDistressLoading, setIsDistressLoading] = useState(false);

  useEffect(() => {
    async function loadData() {
      setIsLogsLoading(true);
      setIsDistressLoading(true);
      try {
        const [logs, signals] = await Promise.all([
          getWellnessCheckIns('student_alex'),
          getDistressSignals()
        ]);
        setWellnessLogs(logs);
        setDistressSignals(signals);
      } catch (err) {
        console.error("Failed to load telemetry in Parent Dashboard", err);
      } finally {
        setIsLogsLoading(false);
        setIsDistressLoading(false);
      }
    }
    loadData();
  }, []);

  const hasLogs = wellnessLogs.length > 0;
  const avgSleep = hasLogs 
    ? Number((wellnessLogs.reduce((acc, log) => acc + log.sleepHours, 0) / wellnessLogs.length).toFixed(1))
    : 7.8;
  const sleepEff = Math.min(100, hasLogs 
    ? Math.round((avgSleep / 8.0) * 100)
    : 88);

  const activeAttentionValue = cognitive 
    ? (cognitive.attention === 'High' ? 95 : cognitive.attention === 'Moderate' ? 78 : 42)
    : 84;

  const activePostureCompliance = biometric
    ? (biometric.headMovement === 'Stable' ? 96 : biometric.headMovement === 'Erratic' ? 72 : 85)
    : 92;

  // High-fidelity Mock analytics for Parent view on student "Alex Mercer"
  const studentMetrics = {
    weeklyFocusAvg: activeAttentionValue, // %
    stressLevelWeekly: cognitive ? cognitive.stress : (hasLogs && wellnessLogs[0].mood <= 2 ? 'Mod/Elevated' : 'Optimal/Low'),
    completedQuizzes: 12,
    sleepEfficiency: sleepEff, // %
    postureCompliance: activePostureCompliance, // %
    streakDays: 8
  };

  const recentHomeActivities = [
    { day: 'Thursday', subject: 'Machine Learning', state: 'Perfect attention', score: '95%' },
    { day: 'Wednesday', subject: 'Quantum Physics', state: 'Restless posture resolved via 4-7-8 breathing', score: '88%' },
    { day: 'Tuesday', subject: 'Neuroscience Basic', state: 'Drowsiness warning triggered at 3PM', score: '100%' },
    { day: 'Monday', subject: 'Calculus', state: 'Highly Focused', score: '92%' }
  ];

  const handleAskAdvice = (topic?: string) => {
    setIsAdviceLoading(true);
    setAdviceResponse(null);

    const query = topic || parentAdviceText;

    setTimeout(() => {
      setIsAdviceLoading(false);
      if (query.toLowerCase().includes('fatigue') || query.toLowerCase().includes('drowsy')) {
        setAdviceResponse("Alex's EEG headband detected high theta-wave surges at 3:00 PM today, correlating with a minor posture slump. We recommend offering a 10-minute quiet screen detox with high hydration before starting the next home educational quiz.");
      } else if (query.toLowerCase().includes('stress') || query.toLowerCase().includes('exam')) {
        setAdviceResponse("Alex displays great resilience, but his skin conductance spikes slightly during rapid-fire quizzes. To maintain a calm mental flow, toggle the 'Stress De-escalation' filter in his student portal, encouraging him to practice the 4-7-8 breath with Athena Coach.");
      } else {
        setAdviceResponse("Based on Alex's biometric history, he performs best in 25-minute intervals paired with active posture resets. We recommend keeping his learning workspace brightly lit with cool spectrum daylight (5000K) to optimize low theta wave distribution.");
      }
    }, 1200);
  };

  return (
    <div className="space-y-6" id="parent_dashboard_tab">
      
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {/* Weekly Focus */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-center space-x-3.5 shadow-sm">
          <div className="p-2.5 bg-slate-950 text-sky-455 text-sky-400 rounded-lg">
            <Brain className="h-4.5 w-4.5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Focus Efficiency</span>
            <strong className="text-lg text-slate-100 font-bold">{studentMetrics.weeklyFocusAvg}%</strong>
          </div>
        </div>

        {/* Home Stress */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-center space-x-3.5 shadow-sm">
          <div className="p-2.5 bg-slate-950 text-emerald-455 text-emerald-400 rounded-lg">
            <Heart className="h-4.5 w-4.5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Emotional Rest</span>
            <strong className="text-lg text-slate-100 font-bold">{studentMetrics.stressLevelWeekly}</strong>
          </div>
        </div>

        {/* Posture Score */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-center space-x-3.5 shadow-sm">
          <div className="p-2.5 bg-slate-950 text-yellow-455 text-yellow-400 rounded-lg">
            <Compass className="h-4.5 w-4.5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Posture Compliance</span>
            <strong className="text-lg text-slate-100 font-bold">{studentMetrics.postureCompliance}%</strong>
          </div>
        </div>

        {/* Sleep Efficiency */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-center space-x-3.5 shadow-sm">
          <div className="p-2.5 bg-slate-950 text-purple-455 text-purple-400 rounded-lg">
            <Smile className="h-4.5 w-4.5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Deep Sleep (EEG)</span>
            <strong className="text-lg text-slate-100 font-bold">{studentMetrics.sleepEfficiency}%</strong>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Progress logs and Sleep analytics */}
        <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800 rounded-xl p-5 shadow-md space-y-6">
          
          <div>
            <h3 className="font-bold text-slate-200 text-sm flex items-center mb-1">
              <ClipboardList className="h-4.5 w-4.5 text-sky-400 mr-2" />
              Recent Home Learning Activity
            </h3>
            <p className="text-[11px] text-slate-400 mb-4">
              Real-time synchronization of home classroom accomplishments and biometrics.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {recentHomeActivities.map((act, index) => (
                <div key={index} className="p-3 bg-slate-950 rounded-lg border border-slate-800/80 flex items-center justify-between">
                  <div>
                    <span className="text-[8px] text-slate-500 block font-mono uppercase">{act.day}</span>
                    <strong className="text-xs text-slate-205 text-slate-350 block font-semibold">{act.subject}</strong>
                    <span className="text-[10px] text-sky-400 block font-normal mt-0.5">💡 {act.state}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[8px] text-slate-500 block">Score</span>
                    <span className="text-xs font-bold text-emerald-400">{act.score}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Synchronized Student Daily Wellness Check-ins */}
          <div className="border-t border-slate-800 pt-5">
            <h4 className="text-xs font-bold text-slate-350 uppercase tracking-wider mb-3 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Heart className="h-4 w-4 text-pink-500" />
                Student Daily Wellness Logs
              </span>
              <span className="text-[8px] font-mono text-indigo-400 bg-indigo-950/40 border border-indigo-900/60 px-1.5 py-0.5 rounded uppercase font-bold">
                Synced Stream
              </span>
            </h4>
            
            {isLogsLoading ? (
              <div className="text-center py-4 text-xs text-slate-500 animate-pulse">
                Fetching wellness logs...
              </div>
            ) : wellnessLogs.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {wellnessLogs.slice(0, 4).map((log, index) => (
                  <div key={index} className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-[11px] space-y-1.5">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="font-bold text-slate-205">{log.moodLabel} (Score: {log.mood}/5)</span>
                      <span className="text-slate-500 font-mono text-[9px]">
                        {log.createdAt ? new Date(log.createdAt).toLocaleDateString('en-US', {month:'short', day:'numeric'}) : 'Today'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-[10px]">
                      <span className="bg-indigo-950/40 text-indigo-455 text-indigo-400 px-1.5 py-0.5 rounded border border-indigo-900/60 flex items-center gap-1">
                        <Moon className="h-2.5 w-2.5" /> Sleep: <strong>{log.sleepHours}h</strong>
                      </span>
                      <span className="bg-purple-950/40 text-purple-455 text-purple-400 px-1.5 py-0.5 rounded border border-purple-900/60">
                        {log.sleepQuality}
                      </span>
                    </div>
                    {log.notes && (
                      <p className="text-slate-400 italic text-[10px] border-l border-indigo-500/50 pl-2 mt-1">
                        "{log.notes}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-slate-950 p-4 border border-slate-800 rounded-lg text-center text-slate-500 text-xs text-slate-400">
                No self-reported logs found. App is using active simulator settings.
              </div>
            )}
          </div>

          {/* Synchronized Student Emergency Distress Signals */}
          <div className="border-t border-slate-800 pt-5">
            <h4 className="text-xs font-bold text-slate-350 uppercase tracking-wider mb-3 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-rose-400">
                <AlertCircle className="h-4 w-4 animate-pulse text-red-500" />
                Active Custom distress Alerts
              </span>
              <span className="text-[8px] font-mono text-red-400 bg-red-950/30 border border-red-900/50 px-1.5 py-0.5 rounded uppercase font-bold">
                Firestore Stream
              </span>
            </h4>
            
            {isDistressLoading ? (
              <div className="text-center py-4 text-xs text-slate-500 animate-pulse">
                Fetching alert triggers...
              </div>
            ) : distressSignals.length > 0 ? (
              <div className="space-y-2.5">
                {distressSignals.map((signal, index) => (
                  <div key={index} className="bg-red-955/10 bg-red-950/20 p-3 rounded-lg border border-red-900/25 text-[11px] space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-rose-400 flex items-center gap-1 text-[10px]">
                        <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-ping"></span>
                        Emergency Signal Alert
                      </span>
                      <span className="text-slate-505 font-mono text-[9px] text-slate-400">
                        {signal.createdAt ? new Date(signal.createdAt).toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit'}) : 'Just now'}
                      </span>
                    </div>
                    <p className="text-slate-205 text-xs font-medium pl-2.5 border-l-2 border-red-500">
                      "{signal.message}"
                    </p>
                    <div className="flex items-center gap-1.5 mt-1 flex-wrap text-[9px] font-mono">
                      {signal.stressSnapshot && (
                        <span className="bg-red-950/40 border border-red-900/40 text-red-400 px-2 py-0.5 rounded">
                          Stress: <strong>{signal.stressSnapshot}</strong>
                        </span>
                      )}
                      {signal.attentionSnapshot && (
                        <span className="bg-slate-900 border border-slate-800 text-sky-400 px-2 py-0.5 rounded">
                          Attention: <strong>{signal.attentionSnapshot}</strong>
                        </span>
                      )}
                      {signal.heartRateSnapshot && (
                        <span className="bg-slate-900 border border-slate-800 text-pink-400 px-2 py-0.5 rounded">
                          pulse: <strong>{signal.heartRateSnapshot} BPM</strong>
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-slate-950 p-3 border border-slate-850 rounded-lg text-center text-slate-500 text-xs">
                No active simulated emergency signals on file. Workspace state is within safe ranges.
              </div>
            )}
          </div>

          {/* Sleep Quality (EEG delta waves distribution) info card */}
          <div className="border-t border-slate-800 pt-5">
            <h4 className="text-xs font-bold text-slate-350 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Star className="h-4 w-4 text-purple-400" />
              Nocturnal Sleep Wave Profile
            </h4>
            <div className="bg-slate-950 p-4 border border-slate-800 rounded-lg">
              <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
                Delta wave density (0.5 - 4 Hz) collected through our headband indicates healthy deep sleep indices.
              </p>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                    <span>Deep Slow-Wave Sleep (Delta Peak)</span>
                    <span className="text-purple-400 font-bold">58%</span>
                  </div>
                  <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full" style={{ width: '58%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                    <span>Light REM Rest (Theta active)</span>
                    <span className="text-sky-400 font-bold">30%</span>
                  </div>
                  <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
                    <div className="h-full bg-sky-500 rounded-full" style={{ width: '30%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: AI Pediatric Advice & Parental Controls */}
        <div className="lg:col-span-5 bg-slate-900/60 border border-slate-800 rounded-xl p-5 shadow-md flex flex-col justify-between">
          
          <div className="space-y-4">
            <div className="pb-3 border-b border-slate-800">
              <h3 className="font-bold text-slate-200 text-sm flex items-center">
                <Shield className="h-4.5 w-4.5 text-emerald-450 text-emerald-400 mr-2" />
                Athena Support Assistant
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Neuroscience-backed tips for reinforcing student mental endurance at home.
              </p>
            </div>

            {/* Quick pre-designed questions */}
            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold mb-2">Common Inquiries</span>
              <div className="space-y-1.5">
                <button
                  onClick={() => handleAskAdvice("Why is Alex fatigued at 3PM?")}
                  className="w-full text-xs text-left p-2 rounded bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 transition-all cursor-pointer"
                >
                  💤 Why does Alex get fatigued at 3PM?
                </button>
                <button
                  onClick={() => handleAskAdvice("How to adjust stress settings?")}
                  className="w-full text-xs text-left p-2 rounded bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 transition-all cursor-pointer"
                >
                  🌀 Adjusting parameters for high exam stress?
                </button>
              </div>
            </div>

            {/* Response area */}
            {isAdviceLoading && (
              <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-lg text-slate-400 text-xs animate-pulse">
                Consulting metrics database...
              </div>
            )}

            {adviceResponse && (
              <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-lg text-xs leading-relaxed font-sans">
                <strong className="text-sky-305 text-sky-400 block mb-1">Athena Advisor Response:</strong>
                <p className="text-slate-300 text-slate-400">{adviceResponse}</p>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-800 mt-5 space-y-2.5">
            <h4 className="text-xs font-bold text-slate-205">Parental Safety Caps</h4>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              Enable hardware automatic cut-offs to guarantee healthy screen-detox balances.
            </p>
            <div className="space-y-1.5 text-xs text-slate-305 text-slate-400">
              <label className="flex items-center space-x-2.5 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded border-slate-800 bg-slate-950 text-indigo-505 text-indigo-650 cursor-pointer" />
                <span>Auto-lock screen if pupil fatigue exceeds 80%</span>
              </label>
              <label className="flex items-center space-x-2.5 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded border-slate-800 bg-slate-950 text-indigo-505 text-indigo-650 cursor-pointer" />
                <span>Force 4-7-8 breathing on rapid stress spikes</span>
              </label>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
