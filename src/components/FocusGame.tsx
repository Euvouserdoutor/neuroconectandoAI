import React, { useState, useEffect } from 'react';
import { Target, Check, AlertTriangle, RefreshCw, Trophy, Zap, AlertCircle } from 'lucide-react';
import { CognitiveState, BiometricState } from '../types';

interface FocusGameProps {
  cognitive: CognitiveState;
  setCognitive: React.Dispatch<React.SetStateAction<CognitiveState>>;
  biometric: BiometricState;
  setBiometric: React.Dispatch<React.SetStateAction<BiometricState>>;
}

const COLOR_NAMES = ['Red', 'Green', 'Blue', 'Yellow', 'Purple', 'Orange'];
const COLOR_TAILWINDS: { [key: string]: string } = {
  Red: 'text-red-500',
  Green: 'text-emerald-500',
  Blue: 'text-sky-500',
  Yellow: 'text-amber-400',
  Purple: 'text-fuchsia-500',
  Orange: 'text-orange-500'
};

export default function FocusGame({ cognitive, setCognitive, biometric, setBiometric }: FocusGameProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [word, setWord] = useState('');
  const [textColorName, setTextColorName] = useState('');
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [timer, setTimer] = useState(15);
  const [gameResult, setGameResult] = useState<'success' | 'failure' | null>(null);
  const [streak, setStreak] = useState(0);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState<boolean | null>(null);

  // Generate a random Stroop combination
  const nextRound = () => {
    const randomWord = COLOR_NAMES[Math.floor(Math.random() * COLOR_NAMES.length)];
    // 50% chance that color matches the word meaning
    const match = Math.random() > 0.5;
    let randomColor = randomWord;
    if (!match) {
      const remainingColorNames = COLOR_NAMES.filter(c => c !== randomWord);
      randomColor = remainingColorNames[Math.floor(Math.random() * remainingColorNames.length)];
    }
    setWord(randomWord);
    setTextColorName(randomColor);
  };

  const startGame = () => {
    setScore(0);
    setRound(1);
    setTimer(15);
    setStreak(0);
    setGameResult(null);
    setLastAnswerCorrect(null);
    setIsPlaying(true);
    nextRound();
  };

  const handleChoice = (doesMatch: boolean) => {
    const isActuallyMatching = word === textColorName;
    const isCorrect = (doesMatch === isActuallyMatching);

    if (isCorrect) {
      setScore(s => s + 10);
      setStreak(st => st + 1);
      setLastAnswerCorrect(true);
    } else {
      setStreak(0);
      setLastAnswerCorrect(false);
    }

    if (round >= 10) {
      endGame(score + (isCorrect ? 10 : 0));
    } else {
      setRound(r => r + 1);
      nextRound();
    }
  };

  const endGame = (finalScore: number) => {
    setIsPlaying(false);
    const passed = finalScore >= 70;
    setGameResult(passed ? 'success' : 'failure');

    // Closed loop feedback impact on active student state
    if (passed) {
      setCognitive(prev => ({
        ...prev,
        attention: 'High',
        fatigue: 'Low',
        stress: 'Low'
      }));
      setBiometric(prev => ({
        ...prev,
        hrv: Math.min(110, prev.hrv + 15),
        heartRate: Math.max(60, prev.heartRate - 8),
        gsr: Math.max(1.5, Number((prev.gsr - 0.6).toFixed(1)))
      }));

      // Log calibration success
      fetch('/api/simulation/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'student_alex',
          service: 'focus_game_calibration',
          score: finalScore,
          biometrics_snapshot: biometric,
          cognitive_snapshot: { attention: 'High', stress: 'Low', fatigue: 'Low' },
          inputSnippet: `Completed focus Stroop assessment. Score: ${finalScore}/100. Status: RECALIBRATED OPTIMAL.`,
          success: true
        })
      }).catch(() => {});
    } else {
      // Game failed: user is simulated to be fatigued / inattentive
      setCognitive(prev => ({
        ...prev,
        attention: 'Low',
        fatigue: 'High',
        stress: 'High'
      }));
      setBiometric(prev => ({
        ...prev,
        hrv: Math.max(30, prev.hrv - 12),
        heartRate: Math.min(105, prev.heartRate + 12),
        gsr: Math.min(8.5, Number((prev.gsr + 1.4).toFixed(1)))
      }));

      // Log calibration warning
      fetch('/api/simulation/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'student_alex',
          service: 'focus_game_calibration',
          score: finalScore,
          biometrics_snapshot: biometric,
          cognitive_snapshot: { attention: 'Low', stress: 'High', fatigue: 'High' },
          inputSnippet: `Failed focus Stroop assessment. Score: ${finalScore}/100. Status: DEGRADED PERFORMANCE.`,
          success: false
        })
      }).catch(() => {});
    }
  };

  // Timer loop
  useEffect(() => {
    if (!isPlaying) return;
    if (timer <= 0) {
      endGame(score);
      return;
    }

    const interval = setInterval(() => {
      setTimer(t => t - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, timer]);

  return (
    <div className="bg-slate-900 border border-slate-850 rounded-2xl p-5 shadow-xl relative overflow-hidden" id="cognitive_focus_calibration_game">
      <div className="absolute top-0 right-0 p-3 text-indigo-500 opacity-5 pointer-events-none">
        <Target className="h-20 w-20" />
      </div>

      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <Target className="h-4.5 w-4.5 text-indigo-400 animate-spin-slow" />
          <h3 className="text-sm font-black text-slate-100 uppercase tracking-tight">Focus Calibration Challenge</h3>
        </div>
        {isPlaying && (
          <span className="font-mono text-xs bg-slate-950 px-2.5 py-1 rounded border border-slate-800 text-indigo-400 font-bold">
            TIME LEFT: {timer}s
          </span>
        )}
      </div>

      <p className="text-[11px] text-slate-400 leading-relaxed mb-4">
        Evaluates processing speed and cognitive inhibition through the Stroop Effect. Score above 70% to trigger real-time neural alignment.
      </p>

      {!isPlaying && !gameResult && (
        <div className="bg-slate-950 rounded-xl p-5 border border-slate-850 text-center flex flex-col items-center justify-center space-y-3">
          <Zap className="h-7 w-7 text-indigo-400" />
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-300 block">Stroop Cognitive Inhibition Test</span>
            <p className="text-[10px] text-slate-500 max-w-sm">
              Press match key if the semantic word value exactly corresponds to its printed text color.
            </p>
          </div>
          <button
            onClick={startGame}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-[10px] uppercase tracking-wider px-5 py-2.5 rounded-xl cursor-pointer transition-all hover:scale-[1.02]"
          >
            Launch Neural Assay
          </button>
        </div>
      )}

      {isPlaying && (
        <div className="bg-slate-950 rounded-xl p-5 border border-slate-850 text-center space-y-4">
          <div className="flex justify-between items-center text-[10px] font-mono text-slate-500">
            <span>Progress: {round}/10</span>
            <span className="text-indigo-400 font-bold">Current Score: {score}</span>
          </div>

          {/* Core word box */}
          <div className="py-7 bg-slate-900 border border-slate-850 rounded-xl">
            <h4 className={`text-4xl font-extrabold tracking-tight ${COLOR_TAILWINDS[textColorName]}`}>
              {word}
            </h4>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleChoice(true)}
              className="bg-emerald-950/40 hover:bg-emerald-900/30 border border-emerald-900/40 hover:border-emerald-500/50 py-2.5 text-emerald-400 rounded-xl text-xs font-black cursor-pointer uppercase transition-all tracking-wide"
            >
              Does Match
            </button>
            <button
              onClick={() => handleChoice(false)}
              className="bg-red-950/30 hover:bg-red-900/30 border border-red-900/40 hover:border-red-500/50 py-2.5 text-red-400 rounded-xl text-xs font-black cursor-pointer uppercase transition-all tracking-wide"
            >
              Does Not Match
            </button>
          </div>

          {lastAnswerCorrect !== null && (
            <div className={`text-[10px] font-mono font-medium ${lastAnswerCorrect ? 'text-emerald-400' : 'text-rose-400'}`}>
              {lastAnswerCorrect ? '✓ STREAK MAINTAINED' : '✗ DISCORD DETECTED'}
            </div>
          )}
        </div>
      )}

      {gameResult && (
        <div className="bg-slate-950 rounded-xl p-5 border border-slate-850 text-center space-y-3.5">
          <div className="flex justify-center">
            {gameResult === 'success' ? (
              <div className="p-2.5 bg-emerald-950/45 border border-emerald-900/60 rounded-full animate-bounce">
                <Trophy className="h-6 w-6 text-emerald-400" />
              </div>
            ) : (
              <div className="p-2.5 bg-rose-950/45 border border-rose-900/60 rounded-full animate-pulse">
                <AlertCircle className="h-6 w-6 text-rose-400" />
              </div>
            )}
          </div>

          <div className="space-y-1">
            <h3 className={`text-sm font-black uppercase ${gameResult === 'success' ? 'text-emerald-400' : 'text-rose-400'}`}>
              {gameResult === 'success' ? 'Neural Calibration Passed!' : 'Performance Fatigue Alert'}
            </h3>
            <p className="text-[10px] text-slate-500 font-mono">
              Final Accuracy Score: {score}/100 | Target Threshold: 70%
            </p>
          </div>

          <p className="text-[10px] text-slate-300 leading-relaxed bg-slate-900 p-2.5 border border-slate-850 rounded-lg">
            {gameResult === 'success'
              ? 'Excellent! Accuracy performance remains well within baseline optimal focus levels. Attention triggers have been automatically reset.'
              : 'Attention focus levels dropped beneath target threshold. Initiating micro-conditioning sequence. Recommend unmuting binaural headphones.'}
          </p>

          <button
            onClick={startGame}
            className="w-full bg-slate-850 hover:bg-slate-800 text-slate-300 text-[10px] uppercase font-bold py-2 rounded-lg border border-slate-700 transition-all cursor-pointer"
          >
            Relaunch Assay
          </button>
        </div>
      )}
    </div>
  );
}
