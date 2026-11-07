import React, { useState } from 'react';
import { Network, Sparkles, Brain, Lightbulb, RefreshCw, BadgeHelp, Eye, CheckCircle, Flame, Target } from 'lucide-react';
import { CognitiveState, BiometricState } from '../types';

interface MindmapNode {
  id: string;
  label: string;
  description: string;
  recallCue: string;
  suggestedBreakActivity: string;
  parentId: string | null;
}

interface MindmapProps {
  cognitive: CognitiveState;
  setCognitive: React.Dispatch<React.SetStateAction<CognitiveState>>;
  biometric: BiometricState;
  setBiometric: React.Dispatch<React.SetStateAction<BiometricState>>;
}

const PRESET_TOPICS = [
  'Prefrontal Cortex Focus Controls',
  'Synaptic Plasticity & Long-Term Potentiation',
  'Autonomous Nervous Modulation',
  'Dopaminergic Feedback Pathways',
  'Deep Sleep Memory Consolidation'
];

export default function CognitiveMindmap({ cognitive, setCognitive, biometric, setBiometric }: MindmapProps) {
  const [topic, setTopic] = useState('Prefrontal Cortex Focus Controls');
  const [customTopic, setCustomTopic] = useState('');
  const [nodes, setNodes] = useState<MindmapNode[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedNode, setSelectedNode] = useState<MindmapNode | null>(null);
  const [learnedNodes, setLearnedNodes] = useState<string[]>([]);
  const [breakPerformed, setBreakPerformed] = useState<string | null>(null);

  const generateMindmap = async (targetTopic: string) => {
    setIsLoading(true);
    setSelectedNode(null);
    setBreakPerformed(null);
    try {
      const response = await fetch('/api/gemini/mindmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: targetTopic,
          cognitiveState: cognitive
        })
      });
      const data = await response.json();
      if (data.success && data.mindmap?.nodes) {
        setNodes(data.mindmap.nodes);
        // Focus the root node initially
        const root = data.mindmap.nodes.find((n: MindmapNode) => !n.parentId) || data.mindmap.nodes[0];
        setSelectedNode(root);
        setLearnedNodes([]);
      } else {
        throw new Error('Fallback trigger');
      }
    } catch (err) {
      console.warn('Network issue or fallback mapping active.', err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleLearned = (nodeId: string) => {
    setLearnedNodes(prev => 
      prev.includes(nodeId) ? prev.filter(id => id !== nodeId) : [...prev, nodeId]
    );

    // Active learning micro-feedback lowers fatigue slightly!
    setCognitive(prev => ({
      ...prev,
      fatigue: prev.fatigue === 'High' ? 'Moderate' : 'Low'
    }));
  };

  const performBreakActivity = (node: MindmapNode) => {
    setBreakPerformed(node.id);
    
    // Decreases stress, boosts mental HRV metrics
    setCognitive(prev => ({
      ...prev,
      stress: 'Low',
      fatigue: 'Low'
    }));

    setBiometric(prev => ({
      ...prev,
      hrv: Math.min(115, prev.hrv + 10),
      heartRate: Math.max(62, prev.heartRate - 5),
      gsr: Math.max(1.5, Number((prev.gsr - 0.5).toFixed(1)))
    }));

    // Log the healthy wellness intervention to the simulation database
    fetch('/api/simulation/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'student_alex',
        service: 'wellness_coach',
        biometrics_snapshot: biometric,
        cognitive_snapshot: { attention: 'High', stress: 'Low', fatigue: 'Low' },
        inputSnippet: `Completed Mindmap stretch break: "${node.suggestedBreakActivity}". Realigned focus baseline.`,
        success: true
      })
    }).catch(() => {});
  };

  const activeTopic = customTopic.trim() || topic;

  return (
    <div className="bg-slate-900 border border-slate-850 rounded-2xl p-5 shadow-xl space-y-5" id="cognitive_lesson_planner_mindmap">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <Network className="h-4.5 w-4.5 text-indigo-400 rotate-45" />
          <h3 className="text-sm font-black text-slate-100 uppercase tracking-tight">AI Cognitive Lesson Planner</h3>
        </div>
        <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-wide">GEMINI 3.5 HYBRID MODEL</span>
      </div>

      <p className="text-[11px] text-slate-400 leading-relaxed">
        Input any complex research query. Gemini translates the topic into a structured, custom memory hierarchy mapped directly against your live brainwave band receptive states.
      </p>

      {/* Inputs controls */}
      <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-850" id="mindmap_input_panels">
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Choose Preset Focus Pathway:</label>
          <div className="flex flex-wrap gap-1.5">
            {PRESET_TOPICS.map(t => (
              <button
                key={t}
                onClick={() => { setTopic(t); setCustomTopic(''); }}
                className={`px-2.5 py-1.5 rounded-lg text-[9.5px] font-semibold text-left transition-all cursor-pointer border ${
                  activeTopic === t && !customTopic 
                    ? 'bg-indigo-600/10 border-indigo-500/40 text-indigo-400 font-bold shadow-sm'
                    : 'bg-slate-900 border-transparent hover:bg-slate-850 text-slate-400'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="h-px bg-slate-900" />

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Or Custom Construct a Target Concept:</label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. Mitochondria ATP cycle, Quantum Cryptography..."
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-840 rounded-xl px-3 py-2 text-xs outline-none text-slate-100 focus:border-indigo-500/50"
            />
            <button
              onClick={() => generateMindmap(activeTopic)}
              disabled={isLoading}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-extrabold text-[10px] uppercase px-4 py-2 rounded-xl cursor-pointer transition-all shrink-0 flex items-center justify-center gap-1.5"
            >
              <Sparkles className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Architecting...' : 'Build Mindmap'}</span>
            </button>
          </div>
        </div>
      </div>

      {nodes.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5" id="mindmap_recharting_space">
          {/* Left Column: Interactive Cognitive Nodes Tree (Col Span 6) */}
          <div className="lg:col-span-6 space-y-3">
            <span className="text-[9.5px] font-bold text-slate-500 uppercase tracking-wider block font-mono">Cognitive Map Nodes Hierarchy:</span>
            
            <div className="space-y-2 text-left">
              {nodes.map(node => {
                const isRoot = !node.parentId;
                const isSelected = selectedNode?.id === node.id;
                const isLearned = learnedNodes.includes(node.id);

                return (
                  <div
                    key={node.id}
                    onClick={() => setSelectedNode(node)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all relative overflow-hidden ${
                      isSelected
                        ? 'bg-indigo-950/20 border-indigo-500/50 shadow-md shadow-indigo-500/5'
                        : 'bg-slate-950/50 border-slate-850 hover:bg-slate-850/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <div className={`p-1.5 rounded ${
                          isRoot ? 'bg-indigo-950 border border-indigo-900/55 text-indigo-400' : 'bg-slate-900 border border-slate-800 text-slate-400'
                        }`}>
                          <Brain className="h-3.5 w-3.5" />
                        </div>
                        <div>
                          <h4 className="text-[11px] font-bold text-slate-200 uppercase tracking-tight flex items-center gap-1">
                            {node.label}
                            {isRoot && <span className="bg-indigo-900/40 text-[7.5px] font-mono px-1 py-0.1 border border-indigo-850 rounded text-indigo-400 uppercase font-black tracking-widest leading-none">Root</span>}
                          </h4>
                          {node.parentId && (
                            <span className="text-[8.5px] text-slate-500 font-mono">Depends on parent: {node.parentId}</span>
                          )}
                        </div>
                      </div>

                      {isLearned && (
                        <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Node Details, Recall Mnemonics, and Quick Interventions (Col Span 6) */}
          <div className="lg:col-span-6">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-4 text-left h-full flex flex-col justify-between">
              {selectedNode ? (
                <div className="space-y-4">
                  <div className="border-b border-slate-900 pb-2.5">
                    <span className="text-[8.5px] uppercase font-bold text-slate-500 tracking-wider block font-mono">Selected Concept Details</span>
                    <h3 className="text-sm font-black text-slate-200 mt-1 uppercase tracking-tight">{selectedNode.label}</h3>
                  </div>

                  <div className="space-y-3.5">
                    {/* Description */}
                    <div className="space-y-1">
                      <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-wide flex items-center gap-1">
                        <Eye className="h-3.5 w-3.5 text-indigo-400" /> Explanation Model
                      </span>
                      <p className="text-[11px] leading-relaxed text-slate-350">
                        {selectedNode.description}
                      </p>
                    </div>

                    {/* Recall Cue */}
                    <div className="bg-indigo-900/10 border border-indigo-900/30 p-3 rounded-lg space-y-1">
                      <span className="text-[9.5px] font-bold text-yellow-400 uppercase tracking-wide flex items-center gap-1">
                        <Lightbulb className="h-3.5 w-3.5 text-yellow-400" /> Cognitive Recall Assist
                      </span>
                      <p className="text-[10px] leading-relaxed text-slate-300 italic font-mono">
                        {selectedNode.recallCue}
                      </p>
                    </div>

                    {/* suggested break */}
                    <div className="bg-pink-950/20 border border-pink-900/20 p-3 rounded-lg space-y-2">
                      <span className="text-[9.5px] font-bold text-pink-400 uppercase tracking-wide flex items-center gap-1">
                        <Flame className="h-3.5 w-3.5 text-pink-500 animate-pulse" /> Live Brain-State Conditioner
                      </span>
                      <p className="text-[10px] leading-relaxed text-slate-300">
                        Wearable feedback suggests performing: <strong className="text-slate-100">{selectedNode.suggestedBreakActivity}</strong>. This relaxes focal tension back to resting flow coordinates.
                      </p>

                      {breakPerformed === selectedNode.id ? (
                        <div className="bg-emerald-950/40 border border-emerald-900/60 p-2 rounded text-center text-[9px] font-bold text-emerald-400 flex items-center justify-center gap-1">
                          <CheckCircle className="h-3.5 w-3.5" /> STRETCH COMPLETED - STRESS RESET DETECTED
                        </div>
                      ) : (
                        <button
                          onClick={() => performBreakActivity(selectedNode)}
                          className="w-full bg-pink-900/40 hover:bg-pink-900/60 border border-pink-800 text-pink-300 text-[9px] uppercase font-bold py-1.5 rounded-lg cursor-pointer transition-all"
                        >
                          Perform Conditioning Break
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-900 flex justify-between gap-3">
                    <button
                      onClick={() => toggleLearned(selectedNode.id)}
                      className={`flex-1 py-2 rounded-lg text-[9px] font-bold uppercase transition-all cursor-pointer border ${
                        learnedNodes.includes(selectedNode.id)
                          ? 'bg-emerald-950 text-emerald-450 border-emerald-900/60 text-emerald-400'
                          : 'bg-slate-900 hover:bg-slate-850 border-slate-800 text-slate-300'
                      }`}
                    >
                      {learnedNodes.includes(selectedNode.id) ? 'Marked as Retained ✓' : 'Mark Concept as Retained'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 text-slate-600 text-xs">Select a node from the cognitive map to inspect mnemonic cues.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
