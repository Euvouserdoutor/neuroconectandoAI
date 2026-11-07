import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Brain, Heart, Activity, Compass, ShieldAlert, BookOpen, Send, User, ChevronRight, CheckCircle2, XCircle, ArrowRight, RefreshCw, Smile, Network, Target, GitBranch } from 'lucide-react';
import { CognitiveState, BiometricState, Brainwaves, QuizQuestion } from '../types';
import DailyWellnessCheckin from './DailyWellnessCheckin';
import DailyAcademicGoal from './DailyAcademicGoal';
import NeuroAcoustics from './NeuroAcoustics';
import FocusGame from './FocusGame';
import CognitiveMindmap from './CognitiveMindmap';
import BiometricsCoherenceBreather from './BiometricsCoherenceBreather';
import GnnLab from './GnnLab';
import BiometricHealthLog from './BiometricHealthLog';

interface StudentWorkspaceProps {
  cognitive: CognitiveState;
  setCognitive: React.Dispatch<React.SetStateAction<CognitiveState>>;
  biometric: BiometricState;
  setBiometric: React.Dispatch<React.SetStateAction<BiometricState>>;
}

export default function StudentWorkspace({ cognitive, setCognitive, biometric, setBiometric }: StudentWorkspaceProps) {
  // Live Brainwave details (for plotting & displays)
  const [brainwaves, setBrainwaves] = useState<Brainwaves>({
    alpha: 8.5,
    beta: 14.2,
    theta: 6.1,
    gamma: 4.8
  });

  // Simulator control variables
  const [activeTopic, setActiveTopic] = useState('Neuro-Plasticity & Learning');
  const [customTopic, setCustomTopic] = useState('');
  const [activeSubTab, setActiveSubTab] = useState<'chats' | 'mindmap' | 'games' | 'coherence' | 'gnn' | 'biometrics'>('chats');
  
  // Track previous cognitive states for adaptive auto-navigation transitions
  const [prevStress, setPrevStress] = useState(cognitive.stress);
  const [prevAttention, setPrevAttention] = useState(cognitive.attention);

  useEffect(() => {
    if (cognitive.stress === 'High' && prevStress !== 'High') {
      setActiveSubTab('coherence');
    } else if (cognitive.attention === 'Low' && prevAttention !== 'Low') {
      setActiveSubTab('games');
    }
    setPrevStress(cognitive.stress);
    setPrevAttention(cognitive.attention);
  }, [cognitive.stress, cognitive.attention, prevStress, prevAttention]);
  
  // AI Tutor Chat State
  const [tutorMessage, setTutorMessage] = useState('');
  const [tutorChat, setTutorChat] = useState<Array<{ role: 'user' | 'assistant'; text: string; appliedState?: any }>>([
    {
      role: 'assistant',
      text: "Hello, Alex! I'm your NeuroLearn Adaptive Tutor. I can sense your current brainwave headband metrics. Ask me any question, and I'll tailor my explanations, exercises, and depth to match your cognitive states in real time!",
    }
  ]);
  const [isTutorLoading, setIsTutorLoading] = useState(false);

  // AI Wellness Coach Chat State
  const [coachMessage, setCoachMessage] = useState('');
  const [coachChat, setCoachChat] = useState<Array<{ role: 'user' | 'assistant'; text: string; directives?: string }>>([
    {
      role: 'assistant',
      text: "Hi Alex, I am your Student Wellness Coach. I monitor your skin conductance (GSR), heart rate variability, and posture accelerometers. Feeling tense, tired, or lost focus? Click the quick check-ins or message me directly for a brain refresh!",
    }
  ]);
  const [isCoachLoading, setIsCoachLoading] = useState(false);

  // Adaptive Quiz State
  const [isQuizLoading, setIsQuizLoading] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [qId: number]: string }>({});
  const [submittedQuiz, setSubmittedQuiz] = useState(false);
  const [activeQuizStep, setActiveQuizStep] = useState(0);

  // SVG Waveform state generator
  const [timeOffset, setTimeOffset] = useState(0);

  // Use a ref for cognitive states to avoid recreating interval on every single state change
  const cognitiveRef = useRef(cognitive);
  useEffect(() => {
    cognitiveRef.current = cognitive;
  }, [cognitive.attention, cognitive.stress, cognitive.fatigue]);

  // Trigger continuous baseline telemetry update logic
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeOffset(prev => (prev + 1) % 100);

      const currentCognitive = cognitiveRef.current;

      // Dynamically calculate wave amplitudes based on user-controlled cognitive indices
      setBrainwaves(prev => {
        let baseAlpha = 6.0;
        let baseBeta = 6.0;
        let baseTheta = 6.0;
        let baseGamma = 3.0;

        // Attention index increases Beta and Gamma
        if (currentCognitive.attention === 'High') {
          baseBeta = 18.4 + Math.sin(Date.now() / 300) * 2;
          baseGamma = 9.2 + Math.cos(Date.now() / 400) * 1.5;
          baseAlpha = 4.2 + Math.sin(Date.now() / 500) * 0.8;
          baseTheta = 3.0 + Math.cos(Date.now() / 600) * 0.5;
        } else if (currentCognitive.attention === 'Moderate') {
          baseBeta = 11.5 + Math.sin(Date.now() / 300) * 1;
          baseGamma = 5.0 + Math.cos(Date.now() / 400) * 0.7;
          baseAlpha = 9.8 + Math.sin(Date.now() / 500) * 1.5; // High Alpha indicates relaxed resting alertness
          baseTheta = 5.5 + Math.cos(Date.now() / 600) * 1;
        } else { // Low
          baseBeta = 4.2 + Math.sin(Date.now() / 300) * 0.5;
          baseGamma = 2.1 + Math.cos(Date.now() / 400) * 0.3;
          baseAlpha = 12.0 + Math.sin(Date.now() / 500) * 2.0; // Daydreaming alpha or high theta
          baseTheta = 14.5 + Math.cos(Date.now() / 600) * 3.0; // Drowsiness theta surge
        }

        // Stress surges gamma slightly, suppresses alpha
        if (currentCognitive.stress === 'High') {
          baseGamma += 4.5;
          baseAlpha *= 0.4;
          baseBeta += 3.0;
        }

        return {
          alpha: Number(Math.max(1, baseAlpha + Math.random() * 0.8).toFixed(1)),
          beta: Number(Math.max(1, baseBeta + Math.random() * 1.2).toFixed(1)),
          theta: Number(Math.max(1, baseTheta + Math.random() * 0.9).toFixed(1)),
          gamma: Number(Math.max(0.5, baseGamma + Math.random() * 0.5).toFixed(1))
        };
      });

      // Maintain correlation with sensors
      setBiometric(prev => {
        let hr = prev.heartRate;
        let hrv = prev.hrv;
        let gsr = prev.gsr;
        let temp = prev.temperature;

        if (currentCognitive.stress === 'High') {
          hr = Math.min(130, hr + (Math.random() > 0.5 ? 1 : -1));
          hrv = Math.max(25, hrv - (Math.random() > 0.5 ? 2 : 0));
          gsr = Math.min(12.0, gsr + (Math.random() > 0.5 ? 0.2 : 0));
        } else if (currentCognitive.stress === 'Low') {
          hr = Math.max(55, hr + (Math.random() > 0.5 ? -1 : 1));
          hrv = Math.min(110, hrv + (Math.random() > 0.5 ? 2 : 0));
          gsr = Math.max(1.5, gsr - (Math.random() > 0.5 ? 0.1 : 0));
        }

        if (currentCognitive.fatigue === 'High') {
          temp = Math.max(35.5, temp - (Math.random() > 0.7 ? 0.05 : 0));
          hrv = Math.max(30, hrv - 0.5);
        } else {
          temp = Math.min(37.2, Math.max(36.4, temp + (Math.random() > 0.5 ? 0.02 : -0.02)));
        }

        return {
          ...prev,
          heartRate: Math.round(hr),
          hrv: Math.round(hrv),
          gsr: Number(gsr.toFixed(1)),
          temperature: Number(temp.toFixed(2))
        };
      });
    }, 1300);

    return () => clearInterval(timer);
  }, [setBiometric]);

  // Handle Tutor messages
  const handleSendTutor = async () => {
    if (!tutorMessage.trim() || isTutorLoading) return;
    const userText = tutorMessage;
    setTutorChat(prev => [...prev, { role: 'user', text: userText }]);
    setTutorMessage('');
    setIsTutorLoading(true);

    try {
      const response = await fetch('/api/gemini/tutor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userText,
          history: tutorChat,
          cognitiveState: cognitive,
          topic: activeTopic
        }),
      });
      const data = await response.json();
      if (data.success) {
        setTutorChat(prev => [...prev, { role: 'assistant', text: data.text, appliedState: data.appliedCognitiveProfile }]);
        
        // Log telemetry event to simulated backend
        await fetch('/api/simulation/log', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: 'student_alex',
            service: 'tutor_chat',
            biometrics_snapshot: biometric,
            cognitive_snapshot: cognitive,
            inputSnippet: userText,
            success: true
          })
        });
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      setTutorChat(prev => [...prev, { role: 'assistant', text: "I'm having trouble retrieving a live adaptive response. (Are you hosting on a sandboxed workspace without an API key? Here is an adaptive tip: Practice deep breathing and stay organized!)" }]);
    } finally {
      setIsTutorLoading(false);
    }
  };

  // Handle Wellness coaching messages
  const handleSendCoach = async (overrideMsg?: string) => {
    const textToSubmit = overrideMsg || coachMessage;
    if (!textToSubmit.trim() || isCoachLoading) return;

    setCoachChat(prev => [...prev, { role: 'user', text: textToSubmit }]);
    if (!overrideMsg) setCoachMessage('');
    setIsCoachLoading(true);

    try {
      const response = await fetch('/api/gemini/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSubmit,
          biometricState: biometric
        })
      });
      const data = await response.json();
      if (data.success) {
        setCoachChat(prev => [...prev, { role: 'assistant', text: data.text, directives: data.wellnessDirectives }]);
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      setCoachChat(prev => [...prev, { role: 'assistant', text: "Coach session limits reached. Focus hint: Roll your eyes upward for 5 seconds to instantly trigger alpha-wave synchronization!" }]);
    } finally {
      setIsCoachLoading(false);
    }
  };

  // Generate Adaptive Quiz
  const handleGenerateQuiz = async () => {
    setIsQuizLoading(true);
    setSubmittedQuiz(false);
    setSelectedAnswers({});
    setActiveQuizStep(0);

    try {
      const response = await fetch('/api/gemini/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: activeTopic,
          difficulty: cognitive.attention === 'High' ? 'Hard' : cognitive.attention === 'Moderate' ? 'Medium' : 'Easy',
          cognitiveState: cognitive
        })
      });
      const data = await response.json();
      setQuizQuestions(data.questions || []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsQuizLoading(false);
    }
  };

  // Render ECG/EEG line graphics
  const makeWavePath = (frequencyMultiplier: number, amplitude: number) => {
    let points = [];
    for (let x = 0; x <= 320; x += 4) {
      const y = Math.sin((x / 14) * frequencyMultiplier + timeOffset * 0.15) * amplitude;
      points.push(`${x},${y + 25}`);
    }
    return `M ` + points.join(' L ');
  };

  // State-adaptive dashboard layout configuration using CSS Grid orders & column spans
  const isHighStress = cognitive.stress === 'High';
  const isLowAttention = cognitive.attention === 'Low';

  const layoutConfig = isHighStress
    ? {
        // Calming Lavender-Indigo Layout (Priority: Biofeedback, Rest, Calm soundscapes)
        binauralClass: "lg:col-span-8 xl:col-span-8 order-2",
        academicGoalClass: "lg:col-span-4 xl:col-span-4 order-3",
        interactiveCoreClass: "lg:col-span-12 xl:col-span-12 order-4",
        wellnessCheckinClass: "lg:col-span-8 xl:col-span-8 order-5",
        eegWavesClass: "lg:col-span-4 xl:col-span-4 order-6",
        sensorControllerClass: "lg:col-span-4 xl:col-span-4 order-7",
        quizEngineClass: "lg:col-span-8 xl:col-span-8 order-8",
      }
    : isLowAttention
    ? {
        // Vibrant Neuro-Stimulus Layout (Priority: Motivation, Active Testing, Focus Games)
        academicGoalClass: "lg:col-span-6 xl:col-span-6 order-2",
        quizEngineClass: "lg:col-span-6 xl:col-span-6 order-3",
        interactiveCoreClass: "lg:col-span-8 xl:col-span-8 order-4",
        eegWavesClass: "lg:col-span-4 xl:col-span-4 order-5",
        sensorControllerClass: "lg:col-span-4 xl:col-span-4 order-6",
        binauralClass: "lg:col-span-4 xl:col-span-4 order-7",
        wellnessCheckinClass: "lg:col-span-8 xl:col-span-12 order-8",
      }
    : {
        // Standard Baseline Layout (Neutral)
        wellnessCheckinClass: "lg:col-span-8 xl:col-span-8 order-2",
        academicGoalClass: "lg:col-span-4 xl:col-span-4 order-3",
        sensorControllerClass: "lg:col-span-4 xl:col-span-4 order-4",
        eegWavesClass: "lg:col-span-4 xl:col-span-4 order-5",
        binauralClass: "lg:col-span-4 xl:col-span-4 order-6",
        interactiveCoreClass: "lg:col-span-8 xl:col-span-8 order-7",
        quizEngineClass: "lg:col-span-12 xl:col-span-8 order-8",
      };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="student_workspace_tab">
      
      {/* State-Adaptive Layout Guide Banner */}
      <div className="lg:col-span-12 order-1">
        <div className={`p-4 rounded-xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all duration-500 ${
          isHighStress 
            ? 'bg-purple-950/40 border-purple-855 text-purple-200 shadow-lg shadow-purple-950/10' 
            : isLowAttention 
            ? 'bg-amber-955/40 border-amber-855 text-amber-200 shadow-lg shadow-amber-950/10' 
            : 'bg-slate-900 border-slate-800 text-slate-300'
        }`}>
          <div className="flex items-start space-x-3">
            <div className={`p-2 rounded-lg mt-0.5 ${
              isHighStress ? 'bg-purple-500/20 text-purple-400' : isLowAttention ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-450'
            }`}>
              {isHighStress ? <Heart className="h-5 w-5 animate-pulse" /> : isLowAttention ? <Sparkles className="h-5 w-5 animate-bounce" /> : <Network className="h-5 w-5" />}
            </div>
            <div>
              <h4 className="text-sm font-bold flex items-center gap-2">
                {isHighStress ? 'State-Adaptive Wellness Priority Layout' : isLowAttention ? 'State-Adaptive Cognitive Stimulus Layout' : 'Standard Baseline Learning Layout'}
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-950/50 text-slate-400 uppercase font-black">
                  Cranial Adaptive Grid
                </span>
              </h4>
              <p className="text-xs text-slate-450 mt-1 leading-relaxed">
                {isHighStress 
                  ? 'Your EEG telemetry indicates high stress. The dashboard has automatically rearranged to prioritize calming biofeedback breathers and audio soundscapes.' 
                  : isLowAttention 
                  ? 'Your EEG telemetry indicates low focus levels. The dashboard has rearranged to emphasize active gamified calibration and adaptive recall quiz testing.' 
                  : 'Balanced cognitive telemetry. Normal study chats, adaptive mindmap learning tools, and daily targets are evenly distributed.'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-[10px] font-mono font-black shrink-0 bg-slate-950/40 px-3 py-1.5 rounded-lg border border-slate-850/50">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isHighStress ? 'bg-purple-400' : isLowAttention ? 'bg-amber-400' : 'bg-emerald-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isHighStress ? 'bg-purple-500' : isLowAttention ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
            </span>
            <span className="text-slate-450">AUTO-GRID: ACTIVE</span>
          </div>
        </div>
      </div>

      {/* 1. Daily Wellness Check-in Card (Submit Form & Logs History) */}
      <div className={`${layoutConfig.wellnessCheckinClass} transition-all duration-500`}>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 h-full">
          <DailyWellnessCheckin cognitive={cognitive} />
        </div>
      </div>

      {/* 2. Daily Academic Goal Card */}
      <div className={`${layoutConfig.academicGoalClass} transition-all duration-500`}>
        <DailyAcademicGoal cognitive={cognitive} biometric={biometric} />
      </div>

      {/* 3. Sensory Signal Simulator */}
      <div className={`bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-2xl relative overflow-hidden ${layoutConfig.sensorControllerClass} transition-all duration-500`} id="sensor_controller">
        <div className="absolute top-0 right-0 p-3 text-emerald-500 opacity-20">
          <Activity className="h-20 w-20 animate-pulse" />
        </div>
        
        <h2 className="text-lg font-bold text-slate-100 flex items-center mb-1">
          <span className="h-2.5 w-2.5 bg-sky-500 rounded-full mr-2.5 animate-ping"></span>
          Sensory Signal Simulator
        </h2>
        <p className="text-xs text-slate-400 mb-5">
          Wearer: <strong className="text-sky-400">Alex Mercer</strong> (ID: Student-0046). Slide dials to mock student physical/brain signals.
        </p>

        <div className="space-y-4">
          {/* Attention Level */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-300 font-medium flex items-center">
                <Brain className="h-3.5 w-3.5 text-blue-400 mr-1" /> Cognitive Attention
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                cognitive.attention === 'High' ? 'bg-emerald-950 text-emerald-400 border border-emerald-900' :
                cognitive.attention === 'Moderate' ? 'bg-sky-950 text-sky-400 border border-sky-900' :
                'bg-red-950 text-red-400 border border-red-900'
              }`}>
                {cognitive.attention} Focus
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1">
              {(['Low', 'Moderate', 'High'] as const).map(lev => (
                <button
                  key={lev}
                  onClick={() => setCognitive(p => ({ ...p, attention: lev }))}
                  className={`py-1 text-xs font-semibold rounded cursor-pointer border ${
                    cognitive.attention === lev ? 'bg-sky-600 text-white border-sky-500' : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-750'
                  }`}
                >
                  {lev}
                </button>
              ))}
            </div>
          </div>

          {/* Stress Level */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-300 font-medium flex items-center">
                <Heart className="h-3.5 w-3.5 text-red-400 mr-1" /> Emotional Stress
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                cognitive.stress === 'High' ? 'bg-red-950 text-red-400 border border-red-900 animate-pulse' :
                cognitive.stress === 'Moderate' ? 'bg-amber-950 text-amber-400 border border-amber-900' :
                'bg-emerald-950 text-emerald-400 border border-emerald-900'
              }`}>
                {cognitive.stress} Stress
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1">
              {(['Low', 'Moderate', 'High'] as const).map(lev => (
                <button
                  key={lev}
                  onClick={() => setCognitive(p => ({ ...p, stress: lev }))}
                  className={`py-1 text-xs font-semibold rounded cursor-pointer border ${
                    cognitive.stress === lev ? 'bg-rose-600 text-white border-rose-500' : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-750'
                  }`}
                >
                  {lev}
                </button>
              ))}
            </div>
          </div>

          {/* Fatigue Level */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-300 font-medium flex items-center">
                <Compass className="h-3.5 w-3.5 text-yellow-400 mr-1" /> Mental Fatigue
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                cognitive.fatigue === 'High' ? 'bg-rose-950 text-rose-400 border border-red-900' :
                cognitive.fatigue === 'Moderate' ? 'bg-yellow-950 text-yellow-400 border border-yellow-900' :
                'bg-emerald-950 text-emerald-400 border border-emerald-955'
              }`}>
                {cognitive.fatigue} Fatigue
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1">
              {(['Low', 'Moderate', 'High'] as const).map(lev => (
                <button
                  key={lev}
                  onClick={() => setCognitive(p => ({ ...p, fatigue: lev }))}
                  className={`py-1 text-xs font-semibold rounded cursor-pointer border ${
                    cognitive.fatigue === lev ? 'bg-yellow-600 text-white border-yellow-500' : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-750'
                  }`}
                >
                  {lev}
                </button>
              ))}
            </div>
          </div>

          {/* Posture / Accelerometer Head Movement */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Accelerometer Posture (MPU6050)
            </label>
            <select
              value={biometric.headMovement}
              onChange={(e) => setBiometric(p => ({ ...p, headMovement: e.target.value as any }))}
              className="w-full bg-slate-800 border border-slate-700 text-slate-100 rounded text-xs p-1.5 focus:outline-none focus:border-sky-500"
            >
              <option value="Stable">Stable Alignment (Proper posture)</option>
              <option value="Moderate">Moderate Tilt</option>
              <option value="High">High Wobbling</option>
              <option value="Erratic">Erratic Jerking (Distracted/Micro-naps)</option>
            </select>
          </div>
          
          <div className="pt-3 border-t border-slate-800">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Wearable Sensor Status</h3>
            <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-950/50 p-3 rounded-xl border border-slate-850">
              <div>
                <span className="text-slate-500 block">EEG Signal Strength</span>
                <div className="text-emerald-400 font-medium flex items-center gap-1.5 mt-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                  <span>Excellent (Active)</span>
                </div>
              </div>
              <div>
                <span className="text-slate-500 block">Battery Level</span>
                <div className="text-slate-350 font-bold mt-0.5">85% (Nominal)</div>
              </div>
              <div>
                <span className="text-slate-500 block">Attention Focus</span>
                <div className="text-sky-400 font-bold mt-0.5">
                  {cognitive.attention === 'High' ? '92% (High)' : cognitive.attention === 'Moderate' ? '81% (Flow)' : '35% (Wandering)'}
                </div>
              </div>
              <div>
                <span className="text-slate-500 block">Active Safety Alerts</span>
                <div className={`font-bold mt-0.5 ${cognitive.stress === 'High' ? 'text-rose-450' : 'text-slate-400'}`}>
                  {cognitive.stress === 'High' ? 'Stress Warning' : 'None detected'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Live EEG Signal Waves Card */}
      <div className={`bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-2xl relative ${layoutConfig.eegWavesClass} transition-all duration-500`} id="eeg_visualizer">
        <h2 className="text-lg font-bold text-slate-100 mb-1 flex items-center">
          <Activity className="h-4 w-4 text-emerald-400 mr-2" />
          Live EEG Signal Waves
        </h2>
        <p className="text-xs text-slate-400 mb-4">
          Continuous brain oscillations from frontal FP1-FP2 sensors.
        </p>

        <div className="space-y-4">
          {/* Beta Waves */}
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-850">
            <div className="flex justify-between items-center mb-1 text-[11px]">
              <span className="font-bold text-orange-400">Beta (12-30 Hz) — Analytical Focus</span>
              <span className="font-mono bg-orange-950 text-orange-400 px-1.5 py-0.2 rounded font-bold">{brainwaves.beta} µV</span>
            </div>
            <svg className="w-full h-12 text-orange-500 overflow-visible" viewBox="0 0 320 50">
              <path d={makeWavePath(2.8, brainwaves.beta / 1.5)} fill="none" stroke="currentColor" strokeWidth="1.8" />
            </svg>
          </div>

          {/* Alpha Waves */}
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-850">
            <div className="flex justify-between items-center mb-1 text-[11px]">
              <span className="font-bold text-sky-400">Alpha (8-12 Hz) — Calm Guard / Gating</span>
              <span className="font-mono bg-sky-950 text-sky-400 px-1.5 py-0.2 rounded font-bold">{brainwaves.alpha} µV</span>
            </div>
            <svg className="w-full h-12 text-sky-500 overflow-visible" viewBox="0 0 320 50">
              <path d={makeWavePath(1.2, brainwaves.alpha / 1.5)} fill="none" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </div>

          {/* Theta Waves */}
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-850">
            <div className="flex justify-between items-center mb-1 text-[11px]">
              <span className="font-bold text-purple-400">Theta (4-8 Hz) — Daydreaming / Fatigue</span>
              <span className="font-mono bg-purple-950 text-purple-400 px-1.5 py-0.2 rounded font-bold">{brainwaves.theta} µV</span>
            </div>
            <svg className="w-full h-12 text-purple-500 overflow-visible" viewBox="0 0 320 50">
              <path d={makeWavePath(0.6, brainwaves.theta / 1.5)} fill="none" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </div>

          {/* GSR & HRV Sensors */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-950 p-2.5 rounded border border-slate-850">
              <span className="text-slate-400 block text-[10px]">GSR Sensor (Stress)</span>
              <span className="text-red-400 font-mono font-bold text-sm">{biometric.gsr} µS</span>
              <span className="text-[9px] text-slate-500 block">Baseline: 3.5 - 5 µS</span>
            </div>
            <div className="bg-slate-950 p-2.5 rounded border border-slate-850">
              <span className="text-slate-400 block text-[10px]">HRV Interval (Calm)</span>
              <span className="text-emerald-400 font-mono font-bold text-sm">{biometric.hrv} ms</span>
              <span className="text-[9px] text-slate-500 block">Goal: &gt; 60 ms</span>
            </div>
          </div>

          {/* Heart Rate Baseline Deviation Card */}
          <div className="bg-slate-955 p-3 rounded-lg border border-slate-850 space-y-2">
            <div className="flex justify-between items-center text-[11px]">
              <span className="font-bold text-pink-400 flex items-center gap-1.5">
                <Heart className="h-3.5 w-3.5 text-pink-500 animate-pulse" />
                Baseline Coherence Deviation
              </span>
              {Math.abs((biometric.movingAvg5s ?? biometric.heartRate) - (biometric.dailyBaseline ?? 72)) >= 8 ? (
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-black bg-rose-950/60 text-rose-400 border border-rose-900/50 animate-pulse uppercase tracking-wider">
                  ⚠️ Alert
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-black bg-emerald-950/60 text-emerald-450 border border-emerald-900/55 uppercase tracking-wider">
                  ✨ Calm
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono pt-1">
              <div className="bg-slate-950 p-2 rounded border border-slate-900/80">
                <span className="text-slate-500 block text-[8px] uppercase">5s HR Avg</span>
                <strong className="text-pink-400 text-xs">{biometric.movingAvg5s ?? biometric.heartRate} BPM</strong>
              </div>
              <div className="bg-slate-950 p-2 rounded border border-slate-900/80">
                <span className="text-slate-500 block text-[8px] uppercase">Rolling Baseline</span>
                <strong className="text-slate-300 text-xs">{(biometric.dailyBaseline ?? 72.0).toFixed(1)} BPM</strong>
              </div>
            </div>

            <div className="text-[10px] flex justify-between items-center pt-1.5 border-t border-slate-900/80">
              <span className="text-slate-400 font-sans">Baseline Offset:</span>
              <span className={`font-mono font-extrabold ${
                Math.abs((biometric.movingAvg5s ?? biometric.heartRate) - (biometric.dailyBaseline ?? 72)) >= 8
                  ? 'text-rose-450'
                  : 'text-emerald-400'
              }`}>
                {((biometric.movingAvg5s ?? biometric.heartRate) - (biometric.dailyBaseline ?? 72)) > 0 ? '+' : ''}
                {((biometric.movingAvg5s ?? biometric.heartRate) - (biometric.dailyBaseline ?? 72)).toFixed(1)} BPM
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Dynamic Binaural Sound Therapy */}
      <div className={`${layoutConfig.binauralClass} transition-all duration-500`}>
        <NeuroAcoustics cognitive={cognitive} />
      </div>

      {/* 6. Subject Selector & Main Interactive Hub */}
      <div className={`${layoutConfig.interactiveCoreClass} flex flex-col space-y-6 transition-all duration-500`}>
        {/* Curricular Topic Selector card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl flex flex-wrap gap-2 items-center justify-between">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5 text-sky-400" />
            <div>
              <span className="text-xs text-slate-400 block">Selected Adaptive Subject Module</span>
              <strong className="text-slate-200 text-sm">{activeTopic}</strong>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {['Neuro-Plasticity & Learning', 'Deep Neural Networks', 'Quantum Computing Principles'].map(topic => (
              <button
                key={topic}
                onClick={() => {
                  setActiveTopic(topic);
                  setQuizQuestions([]); // Reset quiz on topic change
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer border transition-colors ${
                  activeTopic === topic ? 'bg-sky-950 text-sky-300 border-sky-800' : 'bg-slate-800 text-slate-400 border-transparent hover:bg-slate-750'
                }`}
              >
                {topic.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Premium Student Workspace Sub-Mode Tab Selector */}
        <div className="flex md:grid overflow-x-auto md:grid-cols-3 lg:grid-cols-6 gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-855 scrollbar-none" id="student_workspace_tab_bar_interactive">
          {[
            { id: 'chats', val: 'Study Assist Chats', icon: Sparkles },
            { id: 'mindmap', val: 'Adaptive Mindmap', icon: Network },
            { id: 'games', val: 'Focus Calibration', icon: Target },
            { id: 'coherence', val: 'Coherence Breather', icon: Heart },
            { id: 'gnn', val: 'GNN Cognitive Lab', icon: GitBranch },
            { id: 'biometrics', val: 'Biometric Health Log', icon: Activity }
          ].map(tab => {
            const Icon = tab.icon;
            const isTabActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`flex-shrink-0 md:flex-shrink flex items-center justify-center gap-1.5 py-2 px-3.5 md:px-2 rounded-xl text-[10.5px] font-bold uppercase transition-all cursor-pointer border whitespace-nowrap md:whitespace-normal ${
                  isTabActive 
                    ? 'bg-slate-900 border-indigo-500/40 text-indigo-400 font-extrabold shadow-md'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/45'
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${isTabActive ? 'text-indigo-400' : 'text-slate-500'}`} />
                <span>{tab.val}</span>
              </button>
            );
          })}
        </div>

        {/* Conditional Sub-Workspace Rendering */}
        {activeSubTab === 'chats' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="dual_agent_chat_terminals">

            {/* PART 1: Adaptive Tutor Interaction Panel */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl flex flex-col h-[520px] shadow-2xl overflow-hidden relative">
              <div className="bg-slate-950 p-4 border-b border-slate-850 flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-blue-500"></div>
                  <div>
                    <h3 className="font-bold text-slate-100 text-sm">Gemini Cognitive Tutor</h3>
                    <p className="text-[10px] text-slate-400">Generates content targeted at <span className="text-sky-300">{cognitive.attention} Attention</span> style</p>
                  </div>
                </div>
                <Sparkles className="h-4 w-4 text-blue-400 animate-pulse" />
              </div>

              {/* Chat Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-800">
                {tutorChat.map((chat, idx) => (
                  <div key={idx} className={`flex flex-col ${chat.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`p-3 rounded-lg text-xs max-w-[90%] font-normal leading-relaxed ${
                      chat.role === 'user' 
                        ? 'bg-sky-600 text-slate-100 rounded-br-none' 
                        : 'bg-slate-950 text-slate-300 rounded-bl-none border border-slate-850'
                    }`}>
                      {chat.role === 'user' ? (
                        <div className="flex items-center space-x-1 mb-1">
                          <User className="h-3 w-3 text-sky-200" />
                          <span className="font-bold text-[10px] text-sky-200">Alex</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between mb-1 gap-2">
                          <div className="flex items-center space-x-1">
                            <Brain className="h-3 w-3 text-sky-400" />
                            <span className="font-bold text-[10px] text-sky-400">NeuroLearn AI</span>
                          </div>
                          {chat.appliedState && (
                            <span className="text-[9px] bg-sky-950 px-1 py-0.2 rounded text-sky-300 leading-none">
                              Matched Profile: {chat.appliedState.attention} Focus
                            </span>
                          )}
                        </div>
                      )}
                      <span className="whitespace-pre-wrap">{chat.text}</span>
                    </div>
                  </div>
                ))}
                {isTutorLoading && (
                  <div className="flex items-center space-x-2 bg-slate-950 p-3 rounded-lg text-xs text-slate-450 animate-pulse border border-slate-850 w-3/4">
                    <RefreshCw className="h-3 w-3 animate-spin text-sky-400" />
                    <span>Gemini is adjusting instructional depth for you...</span>
                  </div>
                )}
              </div>

              {/* Chat Footer */}
              <div className="p-3 bg-slate-950 border-t border-slate-850">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder={`Ask questions on ${activeTopic}...`}
                    value={tutorMessage}
                    onChange={(e) => setTutorMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendTutor()}
                    className="flex-1 bg-slate-900 border border-slate-850 rounded px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-sky-500 placeholder-slate-500"
                  />
                  <button
                    onClick={handleSendTutor}
                    className="bg-sky-600 hover:bg-sky-500 cursor-pointer disabled:bg-slate-700 disabled:text-slate-500 text-white rounded p-1.5 w-8 flex items-center justify-center transition-colors"
                    disabled={!tutorMessage.trim() || isTutorLoading}
                  >
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* PART 2: Focus Recovery / Wellness Coach Panel */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl flex flex-col h-[520px] shadow-2xl overflow-hidden relative">
              <div className="bg-slate-950 p-4 border-b border-slate-850 flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-500"></div>
                  <div>
                    <h3 className="font-bold text-slate-100 text-sm">Emotional Wellness Coach</h3>
                    <p className="text-[10px] text-slate-400">Bio-feedback loop responding to skin conduction and HRV</p>
                  </div>
                </div>
                <Smile className="h-4 w-4 text-emerald-400" />
              </div>

              {/* Chat Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-800">
                {coachChat.map((chat, idx) => (
                  <div key={idx} className={`flex flex-col ${chat.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`p-3 rounded-lg text-xs max-w-[90%] font-normal leading-relaxed ${
                      chat.role === 'user' 
                        ? 'bg-emerald-600 text-slate-100 rounded-br-none' 
                        : 'bg-slate-950 text-slate-300 rounded-bl-none border border-slate-850'
                    }`}>
                      {chat.role === 'user' ? (
                        <span className="font-bold text-[10px] text-emerald-200 block mb-1">Alex (Student)</span>
                      ) : (
                        <span className="font-bold text-[10px] text-emerald-400 block mb-1">Coach Athena</span>
                      )}
                      <span className="whitespace-pre-wrap">{chat.text}</span>
                    </div>
                  </div>
                ))}
                {isCoachLoading && (
                  <div className="flex items-center space-x-2 bg-slate-950 p-3 rounded-lg text-xs text-slate-450 animate-pulse border border-slate-850 w-3/4">
                    <RefreshCw className="h-3 w-3 animate-spin text-emerald-400" />
                    <span>Athena is formulating a calming reset strategy...</span>
                  </div>
                )}
              </div>

              {/* Chat Footer */}
              <div className="p-3 bg-slate-950 border-t border-slate-850">
                {/* Quick Biometrics Checkin Options */}
                <div className="flex flex-wrap gap-1.5 mb-2.5">
                  <button 
                    onClick={() => handleSendCoach("I feel high mental fatigue and my eyes burn.")}
                    className="text-[10px] bg-slate-900 border border-slate-800 text-slate-300 px-2 py-1 rounded hover:bg-slate-800 text-left cursor-pointer transition-colors"
                  >
                    💤 Mindful Break
                  </button>
                  <button 
                    onClick={() => handleSendCoach("I can't focus on this quantum computing topic.")}
                    className="text-[10px] bg-slate-900 border border-slate-800 text-slate-300 px-2 py-1 rounded hover:bg-slate-800 text-left cursor-pointer transition-colors"
                  >
                    🌀 Posture Reset
                  </button>
                  <button 
                    onClick={() => handleSendCoach("My heart is pounding and I feel exam anxiety.")}
                    className="text-[10px] bg-slate-900 border border-slate-800 text-slate-300 px-2 py-1 rounded hover:bg-slate-800 text-left cursor-pointer transition-colors"
                  >
                    ❤️ Exam Calming
                  </button>
                </div>

                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Tell Athens Coach how you feel..."
                    value={coachMessage}
                    onChange={(e) => setCoachMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendCoach()}
                    className="flex-1 bg-slate-900 border border-slate-850 rounded px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500 placeholder-slate-500"
                  />
                  <button
                    onClick={() => handleSendCoach()}
                    className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-500 cursor-pointer text-white rounded p-1.5 w-8 flex items-center justify-center transition-colors"
                    disabled={!coachMessage.trim() || isCoachLoading}
                  >
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>

          </div>
        )}

        {activeSubTab === 'mindmap' && (
          <CognitiveMindmap
            cognitive={cognitive}
            setCognitive={setCognitive}
            biometric={biometric}
            setBiometric={setBiometric}
          />
        )}

        {activeSubTab === 'games' && (
          <FocusGame
            cognitive={cognitive}
            setCognitive={setCognitive}
            biometric={biometric}
            setBiometric={setBiometric}
          />
        )}

        {activeSubTab === 'coherence' && (
          <BiometricsCoherenceBreather
            cognitive={cognitive}
            setCognitive={setCognitive}
            biometric={biometric}
            setBiometric={setBiometric}
          />
        )}

        {activeSubTab === 'gnn' && (
          <GnnLab
            cognitive={cognitive}
            setCognitive={setCognitive}
            biometric={biometric}
            setBiometric={setBiometric}
          />
        )}

        {activeSubTab === 'biometrics' && (
          <BiometricHealthLog />
        )}
      </div>

      {/* 7. Adaptive Quiz Engine */}
      <div className={`${layoutConfig.quizEngineClass} transition-all duration-500`}>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-2xl">
          <div className="flex items-center justify-between mb-4 border-b border-slate-850 pb-3 flex-wrap gap-2">
            <div>
              <h3 className="font-bold text-slate-200 text-base flex items-center gap-2">
                <Compass className="h-4 w-4 text-sky-400" />
                Adaptive Quiz Engine
              </h3>
              <p className="text-[11px] text-slate-400">
                Self-evaluation generated dynamically by AI for your target focus level: <strong className="text-yellow-400">{cognitive.attention} Attention</strong>.
              </p>
            </div>
            
            <button
              onClick={handleGenerateQuiz}
              disabled={isQuizLoading}
              className="bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-500 hover:to-sky-600 text-white font-semibold text-xs px-4 py-2 cursor-pointer rounded-lg transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              {isQuizLoading ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" />
                  Generate Adapted Quiz
                </>
              )}
            </button>
          </div>

          {quizQuestions.length > 0 ? (
            <div className="space-y-6">
              {/* Inline Progress Steps */}
              <div className="flex border-b border-slate-850 justify-between items-center pb-2 text-xs">
                <span className="text-slate-400">Question {activeQuizStep + 1} of {quizQuestions.length}</span>
                <div className="flex space-x-1">
                  {quizQuestions.map((q, idx) => (
                    <div 
                      key={idx} 
                      className={`h-1 py-0.5 px-3 rounded-full transition-all ${
                        activeQuizStep === idx ? 'bg-sky-500' : 'bg-slate-850'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-4">
                  <span className="text-[10px] bg-slate-800 text-sky-400 font-bold px-2 py-0.5 rounded border border-slate-700 uppercase">
                    {quizQuestions[activeQuizStep].cognitiveMetric}
                  </span>
                  <h4 className="text-sm font-semibold text-slate-100 mt-2">{quizQuestions[activeQuizStep].question}</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {quizQuestions[activeQuizStep].options.map((option, idx) => {
                    const isSelected = selectedAnswers[quizQuestions[activeQuizStep].id] === option;
                    const isCorrect = quizQuestions[activeQuizStep].correctAnswer === option;
                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          if (submittedQuiz) return;
                          setSelectedAnswers(prev => ({
                            ...prev,
                            [quizQuestions[activeQuizStep].id]: option
                          }));
                        }}
                        disabled={submittedQuiz}
                        className={`p-3 rounded-lg text-left text-xs transition-all border outline-none cursor-pointer flex justify-between items-center ${
                          submittedQuiz
                            ? isCorrect
                              ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800'
                              : isSelected
                                ? 'bg-rose-950/40 text-rose-400 border-rose-800'
                                : 'bg-slate-950 text-slate-600 border-slate-900'
                            : isSelected
                              ? 'bg-sky-950 text-sky-300 border-sky-600 scale-[1.01]'
                              : 'bg-slate-950 text-slate-300 border-slate-850 hover:border-slate-700'
                        }`}
                      >
                        <span>{option}</span>
                        {submittedQuiz && isCorrect && <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400 shrink-0 ml-1.5" />}
                        {submittedQuiz && isSelected && !isCorrect && <XCircle className="h-4.5 w-4.5 text-rose-500 shrink-0 ml-1.5" />}
                      </button>
                    );
                  })}
                </div>

                {submittedQuiz && (
                  <div className="bg-slate-955 border border-slate-850 rounded-lg p-3.5 mt-4 text-xs">
                    <strong className="text-emerald-400 block mb-1">Adaptive Feedback Insights:</strong>
                    <p className="text-slate-300">{quizQuestions[activeQuizStep].explanation}</p>
                  </div>
                )}
              </div>

              {/* Navigation Actions */}
              <div className="flex justify-between items-center border-t border-slate-850 pt-3">
                <button
                  onClick={() => setActiveQuizStep(prev => Math.max(0, prev - 1))}
                  disabled={activeQuizStep === 0}
                  className="px-3.5 py-1.5 bg-slate-850 hover:bg-slate-800 border cursor-pointer border-slate-800 disabled:opacity-30 rounded text-slate-300 text-xs font-semibold"
                >
                  Previous
                </button>

                {activeQuizStep < quizQuestions.length - 1 ? (
                  <button
                    onClick={() => setActiveQuizStep(prev => prev + 1)}
                    className="px-3.5 py-1.5 bg-slate-850 hover:bg-slate-800 border cursor-pointer border-slate-800 rounded text-slate-300 text-xs font-semibold"
                  >
                    Next Question
                  </button>
                ) : (
                  !submittedQuiz ? (
                    <button
                      onClick={() => setSubmittedQuiz(true)}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-100 rounded text-xs font-bold cursor-pointer transition-colors"
                    >
                      Submit Answers
                    </button>
                  ) : (
                    <button
                      onClick={handleGenerateQuiz}
                      className="px-4 py-1.5 bg-sky-600 hover:bg-sky-500 text-slate-100 rounded text-xs font-bold cursor-pointer transition-colors"
                    >
                      Retry New Adapted Quiz
                    </button>
                  )
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-10 bg-slate-950 rounded-lg border border-slate-850 text-slate-500 text-xs">
              <Compass className="h-8 w-8 text-slate-700 mx-auto mb-2 animate-bounce" />
              <p>Click "Generate Adapted Quiz" to test yourself on <strong>{activeTopic}</strong> dynamically written by Gemini tailored to your attention levels.</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
