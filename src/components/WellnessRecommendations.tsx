import React, { useState, useEffect, useRef } from 'react';
import { Wind, Play, Square, Sparkles, RotateCcw, CheckCircle2, ChevronRight, Eye, Heart, Brain, Smile } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface WellnessRecommendationsProps {
  isHighStress: boolean;
  currentIntensity: number;
  onCalmSystem?: () => void;
}

type PracticeType = 'box' | '478' | 'grounding';

export default function WellnessRecommendations({
  isHighStress,
  currentIntensity,
  onCalmSystem
}: WellnessRecommendationsProps) {
  const [activePractice, setActivePractice] = useState<PracticeType>('box');
  const [isPracticing, setIsPracticing] = useState(false);
  const [currentCycle, setCurrentCycle] = useState(1);
  const [totalCyclesNeeded] = useState(4);
  const [breathingStage, setBreathingStage] = useState<'Inhale' | 'Hold' | 'Exhale' | 'HoldOut'>('Inhale');
  const [secondsLeft, setSecondsLeft] = useState(4);
  const [groundingStep, setGroundingStep] = useState(5); // 5 down to 1
  const [isCompleted, setIsCompleted] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Stop practicing if activePractice changes
  useEffect(() => {
    stopPractice();
  }, [activePractice]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const stopPractice = () => {
    setIsPracticing(false);
    setIsCompleted(false);
    setCurrentCycle(1);
    setGroundingStep(5);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const startPractice = () => {
    setIsPracticing(true);
    setIsCompleted(false);
    setCurrentCycle(1);
    
    if (activePractice === 'box') {
      setBreathingStage('Inhale');
      setSecondsLeft(4);
    } else if (activePractice === '478') {
      setBreathingStage('Inhale');
      setSecondsLeft(4);
    } else {
      setGroundingStep(5);
    }
  };

  // Breathing interval controller
  useEffect(() => {
    if (!isPracticing || activePractice === 'grounding') return;

    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          // Transition stage
          if (activePractice === 'box') {
            switch (breathingStage) {
              case 'Inhale':
                setBreathingStage('Hold');
                return 4;
              case 'Hold':
                setBreathingStage('Exhale');
                return 4;
              case 'Exhale':
                setBreathingStage('HoldOut');
                return 4;
              case 'HoldOut':
                if (currentCycle >= totalCyclesNeeded) {
                  handleSessionComplete();
                  return 0;
                } else {
                  setCurrentCycle((c) => c + 1);
                  setBreathingStage('Inhale');
                  return 4;
                }
              default:
                return 4;
            }
          } else if (activePractice === '478') {
            switch (breathingStage) {
              case 'Inhale':
                setBreathingStage('Hold');
                return 7;
              case 'Hold':
                setBreathingStage('Exhale');
                return 8;
              case 'Exhale':
                if (currentCycle >= totalCyclesNeeded) {
                  handleSessionComplete();
                  return 0;
                } else {
                  setCurrentCycle((c) => c + 1);
                  setBreathingStage('Inhale');
                  return 4;
                }
              default:
                return 4;
            }
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isPracticing, breathingStage, activePractice, currentCycle]);

  const handleNextGrounding = () => {
    if (groundingStep > 1) {
      setGroundingStep((prev) => prev - 1);
    } else {
      handleSessionComplete();
    }
  };

  const handleSessionComplete = () => {
    setIsPracticing(false);
    setIsCompleted(true);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    // Trigger biological calm down feedback loop!
    if (onCalmSystem) {
      onCalmSystem();
    }
  };

  // Circle scaling calculation for visual guidance ring
  const getScaleClass = () => {
    if (!isPracticing) return 'scale-100';
    if (breathingStage === 'Inhale') {
      // Linear interpolation based on seconds left: starts small, goes big
      const maxSeconds = 4;
      const progress = (maxSeconds - secondsLeft) / maxSeconds;
      return `scale-[${(1 + progress * 0.75).toFixed(2)}]`;
    }
    if (breathingStage === 'Hold') {
      return 'scale-[1.75] shadow-indigo-500/20';
    }
    if (breathingStage === 'Exhale') {
      // Starts big, goes small
      const maxSeconds = activePractice === 'box' ? 4 : 8;
      const progress = secondsLeft / maxSeconds;
      return `scale-[${(1 + progress * 0.75).toFixed(2)}]`;
    }
    return 'scale-100'; // HoldOut / rest state is compact
  };

  const getStageColor = () => {
    if (breathingStage === 'Inhale') return 'text-sky-400 border-sky-500/30 bg-sky-950/20';
    if (breathingStage === 'Hold') return 'text-indigo-400 border-indigo-500/30 bg-indigo-950/20';
    if (breathingStage === 'Exhale') return 'text-teal-400 border-teal-500/30 bg-teal-950/20';
    return 'text-slate-400 border-slate-700 bg-slate-950/20';
  };

  return (
    <div className="bg-gradient-to-br from-indigo-950/20 via-slate-900/60 to-purple-950/15 border border-purple-500/15 rounded-xl p-3.5 space-y-3.5" id="wellness-recommendations-section">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
            <Wind className="h-3.5 w-3.5 text-indigo-400 animate-pulse" />
          </div>
          <div>
            <h4 className="text-[10px] font-bold text-white uppercase tracking-wider">Orientador de relaxamento neurológico</h4>
            <p className="text-[8px] text-indigo-300 font-mono">Regulação da atividade do sistema nervoso simpático</p>
          </div>
        </div>
        <span className="bg-red-500/15 text-red-400 border border-red-500/25 px-1.5 py-0.5 rounded text-[8px] font-bold tracking-wide uppercase font-mono animate-pulse">
          Exercício de relaxamento ativo
        </span>
      </div>

      {!isPracticing && !isCompleted && (
        <>
          <p className="text-[9px] text-slate-400 leading-relaxed">
            Exercícios respiratórios e de atenção corporal para explorar a regulação do <strong>Nervo vago</strong>, favorecendo uma pausa confortável durante os estudos.
          </p>

          {/* Sorter Selector tabs */}
          <div className="grid grid-cols-3 gap-1 bg-slate-950/80 p-1 rounded-lg border border-slate-850">
            <button
              type="button"
              onClick={() => setActivePractice('box')}
              className={`py-1 text-[8.5px] font-bold tracking-tight rounded-md transition-all cursor-pointer ${
                activePractice === 'box'
                  ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/25'
                  : 'text-slate-500 hover:text-slate-300 border border-transparent'
              }`}
            >
              Tactical Box
            </button>
            <button
              type="button"
              onClick={() => setActivePractice('478')}
              className={`py-1 text-[8.5px] font-bold tracking-tight rounded-md transition-all cursor-pointer ${
                activePractice === '478'
                  ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/25'
                  : 'text-slate-500 hover:text-slate-300 border border-transparent'
              }`}
            >
              4-7-8 Breath
            </button>
            <button
              type="button"
              onClick={() => setActivePractice('grounding')}
              className={`py-1 text-[8.5px] font-bold tracking-tight rounded-md transition-all cursor-pointer ${
                activePractice === 'grounding'
                  ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/25'
                  : 'text-slate-500 hover:text-slate-300 border border-transparent'
              }`}
            >
              5-4-3 Grounding
            </button>
          </div>

          {/* Quick practice spec card */}
          <div className="bg-slate-950/50 rounded-lg p-2.5 border border-slate-850/60 text-[9px] space-y-1.5">
            {activePractice === 'box' && (
              <>
                <div className="flex justify-between items-center text-slate-300">
                  <span className="font-semibold text-white">Respiração quadrada (ciclo 4-4-4-4)</span>
                  <span className="text-slate-500 font-mono">Duração: ~60 s</span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Respiração quadrada: inspire por 4 segundos, pause por 4, expire por 4 e pause por 4. Repita confortavelmente, sem forçar a respiração.
                </p>
              </>
            )}

            {activePractice === '478' && (
              <>
                <div className="flex justify-between items-center text-slate-300">
                  <span className="font-semibold text-white">Respiração relaxante 4-7-8</span>
                  <span className="text-slate-500 font-mono">Duração: ~75 s</span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Respiração 4-7-8: exercício de ritmo respiratório. Ajuste os tempos se necessário e interrompa caso sinta desconforto.
                </p>
              </>
            )}

            {activePractice === 'grounding' && (
              <>
                <div className="flex justify-between items-center text-slate-300">
                  <span className="font-semibold text-white">Exercício sensorial 5-4-3-2-1</span>
                  <span className="text-slate-500 font-mono">Duração: no seu ritmo</span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Exercício de atenção ao ambiente: identifique elementos visuais, texturas, sons, aromas e sabores para redirecionar o foco.
                </p>
              </>
            )}

            <button
              type="button"
              onClick={startPractice}
              className="w-full mt-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-1.5 rounded-md flex items-center justify-center gap-1.5 transition-all text-[9.5px] uppercase cursor-pointer tracking-wider"
            >
              <Play className="h-3 w-3 fill-current" />
              <span>Iniciar exercício de regulação</span>
            </button>
          </div>
        </>
      )}

      {isPracticing && (
        <div className="bg-slate-950/80 rounded-xl p-4 border border-indigo-950/40 text-center space-y-4">
          {activePractice !== 'grounding' ? (
            <>
              {/* Visual expanding/collapsing breathing ring */}
              <div className="relative h-20 w-20 mx-auto flex items-center justify-center">
                {/* Outer guide ring with motion properties */}
                <div 
                  className={`absolute inset-0 rounded-full border border-indigo-500/10 transition-transform duration-[1000ms] ease-in-out ${
                    breathingStage === 'Inhale' ? 'scale-[1.8] bg-sky-500/5' : 
                    breathingStage === 'Hold' ? 'scale-[1.8] bg-indigo-500/10' : 
                    breathingStage === 'Exhale' ? 'scale-100 bg-teal-500/5' : 
                    'scale-100'
                  }`}
                />
                
                {/* Pulsing Core circle */}
                <div 
                  className={`h-12 w-12 rounded-full flex items-center justify-center transition-all duration-[1000ms] ease-in-out ${
                    breathingStage === 'Inhale' ? 'bg-gradient-to-tr from-sky-500 to-sky-600 shadow-[0_0_15px_rgba(56,189,248,0.4)] scale-125' :
                    breathingStage === 'Hold' ? 'bg-gradient-to-tr from-indigo-500 to-indigo-600 shadow-[0_0_15px_rgba(99,102,241,0.4)] scale-[1.35]' :
                    breathingStage === 'Exhale' ? 'bg-gradient-to-tr from-teal-400 to-emerald-500 shadow-[0_0_15px_rgba(45,212,191,0.3)] scale-100' :
                    'bg-slate-800 shadow-none scale-90'
                  }`}
                >
                  <Wind className="h-5 w-5 text-white animate-spin-slow opacity-80" />
                </div>
              </div>

              {/* Timing parameters & countdown */}
              <div className="space-y-1">
                <div className={`mx-auto inline-block text-[9px] uppercase font-bold px-2.5 py-0.5 rounded-full border tracking-widest transition-all duration-300 ${getStageColor()}`}>
                  {breathingStage === 'Inhale' && 'Breathe In Deeply'}
                  {breathingStage === 'Hold' && 'Retain Breath'}
                  {breathingStage === 'Exhale' && 'Exhale Completely'}
                  {breathingStage === 'HoldOut' && 'Rest / Retain Out'}
                </div>
                <div className="text-2xl font-black font-mono text-white animate-pulse">
                  {secondsLeft} <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">segundos</span>
                </div>
                <div className="text-[9px] text-slate-500 font-mono tracking-wide">
                  Autonomous Cycle <strong className="text-indigo-400">{currentCycle}</strong> / {totalCyclesNeeded}
                </div>
              </div>

              {/* Abort button */}
              <button
                type="button"
                onClick={stopPractice}
                className="mx-auto flex items-center gap-1.5 text-[8.5px] font-bold text-slate-400 hover:text-white px-2.5 py-1 rounded bg-slate-900 border border-slate-800 transition-colors cursor-pointer"
              >
                <Square className="h-2.5 w-2.5" />
                <span>Encerrar exercício</span>
              </button>
            </>
          ) : (
            <>
              {/* Cognitive 5-4-3-2-1 Grounding steps */}
              <div className="space-y-3.5 text-left py-1">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] text-indigo-400 uppercase tracking-widest font-bold">Calibrador sensorial cognitivo</span>
                  <span className="text-[9px] text-slate-500 font-mono">Step {6 - groundingStep}/5</span>
                </div>

                <div className="bg-slate-900 p-3 rounded-lg border border-slate-850 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-black text-indigo-400 font-mono">{groundingStep}</span>
                    <span className="text-[10px] font-bold text-white uppercase tracking-wider">
                      {groundingStep === 5 && 'Elementos para observar'}
                      {groundingStep === 4 && 'Texturas para perceber'}
                      {groundingStep === 3 && 'Sons para escutar'}
                      {groundingStep === 2 && 'Aromas para identificar'}
                      {groundingStep === 1 && 'Sabores para perceber'}
                    </span>
                  </div>

                  <p className="text-[9px] text-slate-450 leading-relaxed">
                    {groundingStep === 5 && 'Observe o ambiente ao redor e identifique cinco objetos. Preste atenção às formas, às cores ou aos materiais.'}
                    {groundingStep === 4 && 'Toque superfícies próximas, como a roupa, a mesa ou o teclado. Perceba diferenças de textura e temperatura.'}
                    {groundingStep === 3 && 'Se for confortável, feche os olhos por um instante e identifique três sons do ambiente.'}
                    {groundingStep === 2 && 'Perceba dois aromas presentes no ambiente, como madeira, café ou chá.'}
                    {groundingStep === 1 && 'Identifique um sabor na boca ou perceba o gosto da água.'}
                  </p>
                </div>

                {/* Navigation and abort buttons */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={stopPractice}
                    className="flex-1 text-center py-1.5 rounded text-[8.5px] font-bold text-slate-400 bg-slate-900 border border-slate-800 hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleNextGrounding}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-1.5 rounded text-[8.5px] uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>{groundingStep === 1 ? 'Concluir sessão' : 'I Acknowledge'}</span>
                    <ChevronRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {isCompleted && (
        <div className="bg-emerald-950/25 rounded-xl p-4 border border-emerald-900/30 text-center space-y-3.5 animate-fade-in">
          <div className="relative mx-auto h-12 w-12 flex items-center justify-center bg-emerald-500/10 border border-emerald-500/30 rounded-full text-emerald-400">
            <CheckCircle2 className="h-6 w-6 animate-pulse" />
          </div>

          <div className="space-y-1">
            <h5 className="text-[10px] font-bold text-white uppercase tracking-wider">Equilíbrio estimulado</h5>
            <p className="text-[9px] text-emerald-400 leading-relaxed font-sans font-medium">
              Exercício concluído. Os indicadores simulados foram atualizados para a referência.
            </p>
          </div>

          {/* Calming biofeedback trigger to update telemetry back to baseline */}
          <div className="pt-1">
            <button
              type="button"
              onClick={stopPractice}
              className="px-4 py-1.5 bg-slate-950 border border-slate-800 hover:border-slate-750 text-slate-300 rounded-lg text-[9px] font-bold uppercase transition-all cursor-pointer inline-flex items-center gap-1.5"
            >
              <Smile className="h-3.5 w-3.5 text-emerald-400" />
              <span>Voltar ao monitoramento</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
