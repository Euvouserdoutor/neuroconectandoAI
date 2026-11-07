import React, { useState, useEffect, useRef } from 'react';
import { Headphones, Volume2, VolumeX, Radio, Sparkles, Activity, AlertCircle, Info, RefreshCw } from 'lucide-react';
import { CognitiveState } from '../types';

interface NeuroAcousticsProps {
  cognitive: CognitiveState;
}

export default function NeuroAcoustics({ cognitive }: NeuroAcousticsProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.15); // Safe initial volume
  const [selectedBeat, setSelectedBeat] = useState<'alpha' | 'beta' | 'theta' | 'gamma' | 'adaptive'>('adaptive');
  const [carrierFreq, setCarrierFreq] = useState(200); // base carrier wave frequency in Hz

  // Web Audio refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const leftOscRef = useRef<OscillatorNode | null>(null);
  const rightOscRef = useRef<OscillatorNode | null>(null);
  const leftGainRef = useRef<GainNode | null>(null);
  const rightGainRef = useRef<GainNode | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);

  // Status metrics
  const [activeFrequency, setActiveFrequency] = useState(10); // Current active differential frequency in Hz
  const [feedbackMessage, setFeedbackMessage] = useState('Autopilot is reading biometric signals...');

  useEffect(() => {
    // Determine target differential frequency based on selection and cognitive profile
    let freq = 10; // default alpha
    let msg = '';

    if (selectedBeat === 'adaptive') {
      if (cognitive.stress === 'High') {
        freq = 7.5; // High Theta / Low Alpha calm
        msg = 'Dampening Stress: Emitting soothing Alpha-Theta (7.5 Hz) to tranquilize stress nodes.';
      } else if (cognitive.attention === 'Low') {
        freq = 18.0; // Focused Beta
        msg = 'Compensating wandering focus: Transmitting alert Beta (18 Hz) waves to recruit frontal lobe focus.';
      } else if (cognitive.fatigue === 'High') {
        freq = 40.0; // cognitive binder Gamma
        msg = 'Overriding academic fatigue: Delivering high-cognitive Gamma (40 Hz) waves to trigger fresh mental stamina.';
      } else {
        freq = 10.0; // Ideal Alpha
        msg = 'Optimal State: Harmonizing resting alert Alpha (10 Hz) waves for consistent learning flow.';
      }
    } else {
      switch (selectedBeat) {
        case 'theta':
          freq = 6.0;
          msg = 'Therapeutic Theta (6.0 Hz): Best for deep visualization, retrieval, and mental relaxation.';
          break;
        case 'alpha':
          freq = 10.0;
          msg = 'Calmed Alpha (10.0 Hz): Ideal for anxiety prevention, memorization, and comfortable learning.';
          break;
        case 'beta':
          freq = 16.0;
          msg = 'Analytical Beta (16.0 Hz): Promotes analytical processing, hyper-focus, and logical problem solving.';
          break;
        case 'gamma':
          freq = 40.0;
          msg = 'Integration Gamma (40.0 Hz): Encourages cross-hemisphere synthesis and supreme memory consolidation.';
          break;
      }
    }

    setActiveFrequency(freq);
    setFeedbackMessage(msg);

    // If currently playing, adjust live parameters in the Web Audio graph
    if (isPlaying && audioCtxRef.current) {
      const now = audioCtxRef.current.currentTime;
      // Left ear gets base carrier
      if (leftOscRef.current) {
        leftOscRef.current.frequency.setTargetAtTime(carrierFreq, now, 0.1);
      }
      // Right ear gets base + binaural differential
      if (rightOscRef.current) {
        rightOscRef.current.frequency.setTargetAtTime(carrierFreq + freq, now, 0.1);
      }
    }
  }, [cognitive.attention, cognitive.stress, cognitive.fatigue, selectedBeat, isPlaying, carrierFreq]);

  // Adjust volume change
  useEffect(() => {
    if (masterGainRef.current && audioCtxRef.current) {
      masterGainRef.current.gain.setTargetAtTime(volume, audioCtxRef.current.currentTime, 0.1);
    }
  }, [volume]);

  const startSound = async () => {
    try {
      // Lazy init AudioContext on user action
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      // Resume context if suspended (common browser policy auto-suspension)
      if (audioCtxRef.current.state === 'suspended') {
        await audioCtxRef.current.resume();
      }

      const ctx = audioCtxRef.current;
      const now = ctx.currentTime;

      // Create main nodes
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(volume, now);
      masterGain.connect(ctx.destination);
      masterGainRef.current = masterGain;

      // Binaural setup needs Left channel split and Right channel split
      // We use StereoPannerNode for Left and Right panning separation, or ChannelMergerNode
      const leftPanner = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
      const rightPanner = ctx.createStereoPanner ? ctx.createStereoPanner() : null;

      const leftOsc = ctx.createOscillator();
      leftOsc.type = 'sine';
      leftOsc.frequency.setValueAtTime(carrierFreq, now);

      const rightOsc = ctx.createOscillator();
      rightOsc.type = 'sine';
      rightOsc.frequency.setValueAtTime(carrierFreq + activeFrequency, now);

      if (leftPanner && rightPanner) {
        leftPanner.pan.setValueAtTime(-1, now);
        rightPanner.pan.setValueAtTime(1, now);

        leftOsc.connect(leftPanner).connect(masterGain);
        rightOsc.connect(rightPanner).connect(masterGain);
      } else {
        // Fallback simple merge if StereoPanner isn't supported (highly unlikely)
        leftOsc.connect(masterGain);
        rightOsc.connect(masterGain);
      }

      leftOsc.start(now);
      rightOsc.start(now);

      leftOscRef.current = leftOsc;
      rightOscRef.current = rightOsc;
      setIsPlaying(true);
    } catch (error) {
      console.error('Failed to boot neuro-acoustics audio generator', error);
    }
  };

  const stopSound = () => {
    try {
      if (leftOscRef.current) {
        leftOscRef.current.stop();
        leftOscRef.current.disconnect();
        leftOscRef.current = null;
      }
      if (rightOscRef.current) {
        rightOscRef.current.stop();
        rightOscRef.current.disconnect();
        rightOscRef.current = null;
      }
      if (masterGainRef.current) {
        masterGainRef.current.disconnect();
        masterGainRef.current = null;
      }
      setIsPlaying(false);
    } catch (err) {
      console.error(err);
    }
  };

  const togglePlayback = () => {
    if (isPlaying) {
      stopSound();
    } else {
      startSound();
    }
  };

  // Safe clean-up on component unmount
  useEffect(() => {
    return () => {
      if (isPlaying) {
        try {
          if (leftOscRef.current) leftOscRef.current.stop();
          if (rightOscRef.current) rightOscRef.current.stop();
        } catch (e) {
          // silent error on fast unmount
        }
      }
    };
  }, [isPlaying]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-2xl relative overflow-hidden" id="neuro_acoustics_component">
      {/* Absolute graphic background nodes */}
      <div className="absolute top-0 right-0 p-3 text-sky-500 opacity-5 pointer-events-none">
        <Headphones className="h-24 w-24" />
      </div>

      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-black text-slate-100 flex items-center uppercase tracking-tight">
          <Headphones className="h-4.5 w-4.5 text-sky-400 mr-2 animate-bounce" />
          Neuro-Acoustic Binaural Therapy
        </h2>
        <span className={`h-2 w-2 rounded-full ${isPlaying ? 'bg-sky-400 animate-pulse' : 'bg-slate-600'}`} />
      </div>

      <p className="text-[11px] text-slate-400 leading-relaxed mb-4">
        Synthesizes active binaural beats to stimulate brainwaves. 
        Wear headphones to allow true cerebral synchronization.
      </p>

      {/* Acoustic waveform indicator frame */}
      <div className="bg-slate-950 rounded-xl p-4 border border-slate-850 relative overflow-hidden flex flex-col justify-between mb-4 h-28">
        <div className="flex justify-between items-center text-[9px] font-mono text-slate-500 uppercase tracking-widest relative z-10">
          <span>Carrier: {carrierFreq}Hz L-Channel</span>
          <span className="text-sky-400 font-bold">Resonance: {activeFrequency}Hz R-Channel</span>
        </div>

        {/* Visualizer animation */}
        <div className="flex items-center justify-center gap-1.5 h-10 my-1 relative z-10">
          {Array.from({ length: 16 }).map((_, i) => {
            const delay = i * 0.1;
            const stateAmp = isPlaying 
              ? selectedBeat === 'adaptive' 
                ? cognitive.attention === 'High' ? 1.4 : cognitive.stress === 'High' ? 0.7 : 1.0 
                : 1.0 
              : 0.15;
            const animateHeight = isPlaying 
              ? [12, 44 * stateAmp, 12] 
              : [12, 12];

            return (
              <span
                key={i}
                className={`w-1 rounded-full ${
                  isPlaying 
                    ? selectedBeat === 'adaptive' 
                      ? cognitive.stress === 'High' ? 'bg-red-500' : cognitive.attention === 'Low' ? 'bg-amber-400' : 'bg-emerald-400'
                      : 'bg-indigo-400'
                    : 'bg-slate-800'
                }`}
                style={{
                  height: '14px',
                  animation: isPlaying ? `pulse-wave 1.1s ease-in-out infinite` : 'none',
                  animationDelay: `${delay}s`,
                }}
              />
            );
          })}
          
          <style>{`
            @keyframes pulse-wave {
              0%, 100% { transform: scaleY(1); }
              50% { transform: scaleY(3.2); }
            }
          `}</style>
        </div>

        <div className="text-[10px] bg-slate-900/60 p-1.5 rounded border border-slate-800 text-slate-350 leading-relaxed font-sans relative z-10">
          <span className="font-bold text-[9px] uppercase tracking-wider text-sky-400 block mb-0.5">Live Diagnostic Directives:</span>
          {feedbackMessage}
        </div>
      </div>

      <div className="space-y-3.5 relative z-10">
        {/* Frequency selector buttons */}
        <div>
          <label className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1.5">
            Target Therapeutic Tone
          </label>
          <div className="grid grid-cols-5 gap-1">
            <button
              onClick={() => setSelectedBeat('adaptive')}
              className={`py-1 text-[10px] font-bold rounded cursor-pointer border flex flex-col items-center justify-center transition-all ${
                selectedBeat === 'adaptive' 
                  ? 'bg-sky-950 text-sky-300 border-sky-600 font-extrabold' 
                  : 'bg-slate-850 hover:bg-slate-800 text-slate-400 border-transparent'
              }`}
            >
              <Sparkles className="h-3 w-3 mb-0.5 text-indigo-400" />
              <span>Auto</span>
            </button>
            <button
              onClick={() => setSelectedBeat('theta')}
              className={`py-1 text-[10px] font-mono font-medium rounded cursor-pointer border flex flex-col items-center justify-center transition-all ${
                selectedBeat === 'theta' 
                  ? 'bg-purple-950 text-purple-300 border-purple-800 font-bold' 
                  : 'bg-slate-850 hover:bg-slate-800 text-slate-400 border-transparent'
              }`}
            >
              <span className="text-[9px] uppercase font-bold tracking-tighter">Theta</span>
              <span>6Hz</span>
            </button>
            <button
              onClick={() => setSelectedBeat('alpha')}
              className={`py-1 text-[10px] font-mono font-medium rounded cursor-pointer border flex flex-col items-center justify-center transition-all ${
                selectedBeat === 'alpha' 
                  ? 'bg-sky-950 text-sky-300 border-sky-800 font-bold' 
                  : 'bg-slate-850 hover:bg-slate-800 text-slate-400 border-transparent'
              }`}
            >
              <span className="text-[9px] uppercase font-bold tracking-tighter">Alpha</span>
              <span>10Hz</span>
            </button>
            <button
              onClick={() => setSelectedBeat('beta')}
              className={`py-1 text-[10px] font-mono font-medium rounded cursor-pointer border flex flex-col items-center justify-center transition-all ${
                selectedBeat === 'beta' 
                  ? 'bg-orange-950 text-orange-300 border-orange-850 font-bold' 
                  : 'bg-slate-850 hover:bg-slate-800 text-slate-400 border-transparent'
              }`}
            >
              <span className="text-[9px] uppercase font-bold tracking-tighter">Beta</span>
              <span>16Hz</span>
            </button>
            <button
              onClick={() => setSelectedBeat('gamma')}
              className={`py-1 text-[10px] font-mono font-medium rounded cursor-pointer border flex flex-col items-center justify-center transition-all ${
                selectedBeat === 'gamma' 
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-800 font-bold' 
                  : 'bg-slate-850 hover:bg-slate-800 text-slate-400 border-transparent'
              }`}
            >
              <span className="text-[9px] uppercase font-bold tracking-tighter">Gamma</span>
              <span>40Hz</span>
            </button>
          </div>
        </div>

        {/* Carrier pitch and Volume Control Row */}
        <div className="grid grid-cols-2 gap-3.5 pt-1">
          <div>
            <div className="flex justify-between items-center text-[10px] mb-1">
              <span className="text-slate-400 font-semibold uppercase tracking-wider">Base Carrier Pitch</span>
              <span className="text-sky-400 font-mono font-bold">{carrierFreq} Hz</span>
            </div>
            <input
              type="range"
              min="100"
              max="400"
              step="10"
              value={carrierFreq}
              onChange={(e) => setCarrierFreq(Number(e.target.value))}
              className="w-full select-none accent-sky-500 h-1 bg-slate-950 rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between items-center text-[10px] mb-1">
              <span className="text-slate-400 font-semibold uppercase tracking-wider">Therapy Volume</span>
              <span className="text-emerald-400 font-mono font-bold">{Math.round(volume * 100)}%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button 
                onClick={() => setVolume(p => p === 0 ? 0.15 : 0)}
                className="text-slate-400 hover:text-white transition-opacity cursor-pointer"
              >
                {volume === 0 ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
              </button>
              <input
                type="range"
                min="0"
                max="0.4"
                step="0.01"
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-full select-none accent-emerald-500 h-1 bg-slate-950 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Master Playback controls */}
        <div className="pt-2">
          {isPlaying ? (
            <button
              onClick={togglePlayback}
              className="w-full bg-red-600 hover:bg-red-500 hover:shadow-red-600/10 text-white font-extrabold text-xs py-2 rounded-xl transition-all cursor-pointer text-center uppercase tracking-wider shadow-md"
            >
              Mute Acoustic Resonance
            </button>
          ) : (
            <button
              onClick={togglePlayback}
              className="w-full bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 hover:shadow-sky-500/10 text-slate-100 font-extrabold text-xs py-2 rounded-xl transition-all cursor-pointer text-center uppercase tracking-wider shadow-md shadow-sky-600/10"
            >
              Unmute Acoustic Resonance
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
