import React, { useState, useEffect } from 'react';
import { 
  Network, 
  Sparkles, 
  Brain, 
  Sliders, 
  Play, 
  RotateCcw, 
  Info, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  ArrowRight, 
  BookOpen, 
  Send, 
  Activity,
  Award
} from 'lucide-react';
import { CognitiveState, BiometricState } from '../types';

interface GnnNode {
  id: number;
  label: string;
  x: number;
  y: number;
  initialFreq: number; // Simulated frequency representing brain metric
  features: [number, number]; // [Attention Score, Stress Index]
  neighbors: number[];
}

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

interface GnnLabProps {
  cognitive: CognitiveState;
  setCognitive: React.Dispatch<React.SetStateAction<CognitiveState>>;
  biometric: BiometricState;
  setBiometric: React.Dispatch<React.SetStateAction<BiometricState>>;
}

export default function GnnLab({ cognitive, setCognitive, biometric, setBiometric }: GnnLabProps) {
  // GNN Architecture Selection: GCN (Convolutions), GAT (Attention), GraphSAGE (Sample & Agg)
  const [architecture, setArchitecture] = useState<'gcn' | 'gat' | 'sage'>('gcn');
  
  // Interactive Nodes & Embeddings State
  const [nodes, setNodes] = useState<GnnNode[]>([
    { id: 1, label: 'Prefrontal Cortical Hub', x: 120, y: 70, initialFreq: 14.5, features: [0.85, 0.20], neighbors: [2, 4, 5] },
    { id: 2, label: 'Pre-Motor Synapse Pair', x: 280, y: 50, initialFreq: 8.2, features: [0.60, 0.45], neighbors: [1, 3, 4] },
    { id: 3, label: 'Thalamic Routing Node', x: 440, y: 90, initialFreq: 11.4, features: [0.72, 0.30], neighbors: [2, 6] },
    { id: 4, label: 'Hippocampal Repository', x: 220, y: 190, initialFreq: 6.5, features: [0.90, 0.15], neighbors: [1, 2, 5] },
    { id: 5, label: 'Amydgala Emotional Pivot', x: 100, y: 230, initialFreq: 22.1, features: [0.35, 0.85], neighbors: [1, 4, 6] },
    { id: 6, label: 'Visual Cortex Input Sensor', x: 380, y: 220, initialFreq: 12.0, features: [0.55, 0.50], neighbors: [3, 5] }
  ]);

  // UI state variables
  const [selectedNode, setSelectedNode] = useState<GnnNode | null>(nodes[0]);
  const [step, setStep] = useState<'idle' | 'propagating' | 'aggregated' | 'activated'>('idle');
  const [logs, setLogs] = useState<string[]>([
    'GNN Lab Initialized. Select an architecture and initiate message passing to transform raw network signals into high-dimension cognitive representations.'
  ]);

  // Aggregated and updated feature values for visualization
  const [aggregatedFeatures, setAggregatedFeatures] = useState<Record<number, [number, number]>>({});
  const [updatedFeatures, setUpdatedFeatures] = useState<Record<number, [number, number]>>({});
  const [activeEdgeParticles, setActiveEdgeParticles] = useState<boolean>(false);
  const [weightMatrix, setWeightMatrix] = useState<number[][]>([
    [0.65, -0.25],
    [0.15, 0.80]
  ]);

  // Dynamic weights modifications
  const handleMatrixWeightChange = (row: number, col: number, val: number) => {
    const updated = [...weightMatrix];
    updated[row][col] = Math.min(2, Math.max(-2, parseFloat(val.toFixed(2)) || 0));
    setWeightMatrix(updated);
    addLog(`Self-defined Weights Matrix W changed at [${row},${col}] to: ${val}`);
  };

  const addLog = (message: string) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLogs(prev => [`[${time}] ${message}`, ...prev.slice(0, 25)]);
  };

  // Reset Simulator
  const handleReset = () => {
    setAggregatedFeatures({});
    setUpdatedFeatures({});
    setStep('idle');
    setActiveEdgeParticles(false);
    addLog('Reparameterized graph state. Nodes loaded with raw signal features [Attention %, Stress %].');
  };

  // Custom simulation equations
  const runMessagePassing = () => {
    if (step === 'propagating') return;
    
    setStep('propagating');
    setActiveEdgeParticles(true);
    addLog(`Constructing Graph structure: Adjacent Matrix computed. Triggering Message-Passing step for ${architecture.toUpperCase()}...`);

    // Simulated network propagation timeout
    setTimeout(() => {
      const aggResults: Record<number, [number, number]> = {};
      
      nodes.forEach(node => {
        const neighborNodes = nodes.filter(n => node.neighbors.includes(n.id));
        
        let agg1 = 0;
        let agg2 = 0;

        if (architecture === 'gcn') {
          // GCN style: symmetrical normalization including self-loop
          const selfWeight = 1 / (node.neighbors.length + 1);
          agg1 = node.features[0] * selfWeight;
          agg2 = node.features[1] * selfWeight;

          neighborNodes.forEach(neigh => {
            const edgeWeight = 1 / Math.sqrt((node.neighbors.length + 1) * (neigh.neighbors.length + 1));
            agg1 += neigh.features[0] * edgeWeight;
            agg2 += neigh.features[1] * edgeWeight;
          });
          
        } else if (architecture === 'gat') {
          // GAT style: attention-weighted neighbor aggregation
          // Dynamically compute mock attention coefficients based on feature similarity
          let attentionSum = 1.0; // self coefficient
          agg1 = node.features[0] * 0.4;
          agg2 = node.features[1] * 0.4;

          neighborNodes.forEach((neigh, i) => {
            // Attention based on proximity of attention features
            const sim = 1 - Math.abs(node.features[0] - neigh.features[0]);
            const weight = Math.max(0.1, sim * 0.35);
            attentionSum += weight;
            agg1 += neigh.features[0] * weight;
            agg2 += neigh.features[1] * weight;
          });

          agg1 = agg1 / attentionSum;
          agg2 = agg2 / attentionSum;

        } else {
          // GraphSAGE: Aggregator function (Mean) + Concatenation
          let mean1 = 0;
          let mean2 = 0;
          
          neighborNodes.forEach(neigh => {
            mean1 += neigh.features[0];
            mean2 += neigh.features[1];
          });

          mean1 = mean1 / neighborNodes.length;
          mean2 = mean2 / neighborNodes.length;

          // Simple average as mock neighborhood aggregation
          agg1 = mean1;
          agg2 = mean2;
        }

        aggResults[node.id] = [
          parseFloat(agg1.toFixed(3)),
          parseFloat(agg2.toFixed(3))
        ];
      });

      setAggregatedFeatures(aggResults);
      setStep('aggregated');
      addLog(`Edge features aggregated successfully! Neighborhood message vector sum constructed for each node. Next: Apply Linear Transformation (W) and ReLU non-linearity.`);
    }, 1800);
  };

  const applyActivation = () => {
    if (step !== 'aggregated') return;

    const actResults: Record<number, [number, number]> = {};

    nodes.forEach(node => {
      const agg = aggregatedFeatures[node.id] || node.features;
      
      // Compute Matrix multiplication aggregate * Weights matrix W
      // W[0][0]*agg[0] + W[0][1]*agg[1]
      // W[1][0]*agg[0] + W[1][1]*agg[1]
      let out1 = weightMatrix[0][0] * agg[0] + weightMatrix[0][1] * agg[1];
      let out2 = weightMatrix[1][0] * agg[0] + weightMatrix[1][1] * agg[1];

      // Apply non-linear Activation: ReLU (Rectified Linear Unit)
      const reluOut1 = Math.max(0, out1);
      const reluOut2 = Math.max(0, out2);

      actResults[node.id] = [
        parseFloat(reluOut1.toFixed(3)),
        parseFloat(reluOut2.toFixed(3))
      ];
    });

    setUpdatedFeatures(actResults);
    setStep('activated');
    setActiveEdgeParticles(false);
    
    // Automatically match the node inside the list to selected
    if (selectedNode) {
      setSelectedNode(nodes.find(n => n.id === selectedNode.id) || null);
    }
    
    addLog(`Matrix W multiplied and ReLU(h) Activation completed. Higher-order cognitive node embedding representation achieved! Note the changes in node colors.`);
    
    // Impact cognitive state of app to show high integration
    if (cognitive.attention !== 'High') {
      setCognitive(prev => ({ ...prev, attention: 'High' }));
      addLog(`System sync successful! GNN calibration stabilized Attention states to optimal (High Focus).`);
    }
  };

  // Node customization helper
  const handleFeatureChange = (nodeId: number, fieldIndex: number, value: number) => {
    setNodes(prev => prev.map(node => {
      if (node.id === nodeId) {
        const updatedFeats = [...node.features] as [number, number];
        updatedFeats[fieldIndex] = parseFloat(value.toFixed(2));
        const updatedNode = { ...node, features: updatedFeats };
        if (selectedNode?.id === nodeId) {
          setSelectedNode(updatedNode);
        }
        return updatedNode;
      }
      return node;
    }));
    addLog(`Modified raw baseline vector for ${nodes.find(n => n.id === nodeId)?.label}.`);
  };

  // Pre-configured GNN Academics Quizzes
  const gnnQuizzes: QuizQuestion[] = [
    {
      id: 1,
      question: "Which of the following spatial GNN architectures operates by explicit self-attention values between adjoining nodes to weigh edge messages?",
      options: ["Graph Convolutional Networks (GCN)", "Graph Attention Networks (GAT)", "GraphSAGE (SAmple and AGGregate)", "Spectral CNN"],
      correctAnswer: "Graph Attention Networks (GAT)",
      explanation: "Graph Attention Networks (GAT) introduce anisotropic attention coefficients computed over neighboring nodes, allowing the mechanism to learn unique weights for different edges rather than fixed symmetric weights like classic GCN."
    },
    {
      id: 2,
      question: "What is the primary visual symptom of the 'over-smoothing' phenomenon in multi-layer deep GNNs?",
      options: [
        "Network disconnect and loss of adjacent values",
        "Node embedding vector convergence where all nodes represent near-identical values",
        "Complete computational crash due to memory scale issues",
        "Gradient explosion during initial epochs"
      ],
      correctAnswer: "Node embedding vector convergence where all nodes represent near-identical values",
      explanation: "Over-smoothing happens when adding too many message-passing layers. Since neighbor features are aggregated recursively, each node's representation eventually factors in the entire graph's features, rendering them practically identical."
    },
    {
      id: 3,
      question: "How does GraphSAGE address scale and memory issues inherent to global training of classical full-batch GCNs?",
      options: [
        "It removes edges with low weights prior to propagation",
        "It trains exclusively on single, decoupled nodes with disconnected layers",
        "It utilizes uniform neighbor sampling of fixed sizes to construct mini-batch computational subgraphs",
        "It substitutes graphs with simple feed-forward neural networks"
      ],
      correctAnswer: "It utilizes uniform neighbor sampling of fixed sizes to construct mini-batch computational subgraphs",
      explanation: "GraphSAGE introduces neighborhood sampling where rather than propagating across all neighbors, it uniformly samples a fixed size (e.g., k neighbors) per layer, enabling efficient mini-batch training on giant industrial graphs."
    }
  ];

  const [activeQuizQuestionIdx, setActiveQuizQuestionIdx] = useState(0);
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState<string | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizAnswerChecked, setQuizAnswerChecked] = useState(false);

  const handleQuizAnswerSelect = (option: string) => {
    if (quizAnswerChecked) return;
    setSelectedQuizAnswer(option);
  };

  const handleQuizCheck = () => {
    if (!selectedQuizAnswer || quizAnswerChecked) return;
    setQuizAnswerChecked(true);
    const currentQ = gnnQuizzes[activeQuizQuestionIdx];
    if (selectedQuizAnswer === currentQ.correctAnswer) {
      setQuizScore(prev => prev + 1);
    }
  };

  const handleQuizNext = () => {
    setSelectedQuizAnswer(null);
    setQuizAnswerChecked(false);
    if (activeQuizQuestionIdx < gnnQuizzes.length - 1) {
      setActiveQuizQuestionIdx(prev => prev + 1);
    } else {
      setQuizSubmitted(true);
    }
  };

  const handleQuizReset = () => {
    setActiveQuizQuestionIdx(0);
    setSelectedQuizAnswer(null);
    setQuizAnswerChecked(false);
    setQuizScore(0);
    setQuizSubmitted(false);
  };

  // AI Chat with dedicated GNN focus
  const [gnnChatPrompt, setGnnChatPrompt] = useState('');
  const [gnnChatHistory, setGnnChatHistory] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    {
      role: 'assistant',
      text: "Welcome to the Cognitive Graph Neural Network deep dive block! Ask me mathematical details, architectural constraints, message-passing algorithms, or practical implementation inquiries regarding GAT, GCN, or GraphSAGE. I will structure explanations according to your current biological state."
    }
  ]);
  const [isGnnChatLoading, setIsGnnChatLoading] = useState(false);

  const askGnnTutor = async (prebuiltText?: string) => {
    const promptToSend = prebuiltText || gnnChatPrompt;
    if (!promptToSend.trim() || isGnnChatLoading) return;

    setGnnChatHistory(prev => [...prev, { role: 'user', text: promptToSend }]);
    setGnnChatPrompt('');
    setIsGnnChatLoading(true);

    try {
      const response = await fetch('/api/gemini/tutor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: `Regarding Graph Neural Networks (GNNs): ${promptToSend}`,
          history: gnnChatHistory,
          cognitiveState: cognitive,
          topic: "Graph Neural Networks (GNN) Deep Technical Breakdowns, Layer Equations, SAGE models, and Cognitive Topology Map modeling"
        })
      });

      const data = await response.json();
      if (data.success) {
        setGnnChatHistory(prev => [...prev, { role: 'assistant', text: data.text }]);
      } else {
        throw new Error(data.error || 'Server error');
      }
    } catch (err: any) {
      console.error(err);
      setGnnChatHistory(prev => [
        ...prev,
        {
          role: 'assistant',
          text: `An error occurred while generating learning guidelines. Summarized overview: GNNs process relational inputs by representing attributes as Node Features ($h_v^{(0)}$) and propagating them iteratively: $h_v^{(l+1)} = \\sigma(W \\cdot \\text{AGG}(h_u^{(l)}))$. Please re-execute your search.`
        }
      ]);
    } finally {
      setIsGnnChatLoading(false);
    }
  };

  return (
    <div className="space-y-6" id="gnn_depth_module">
      
      {/* Overview Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Network className="h-40 w-40 text-indigo-400 stroke-[1.5]" />
        </div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-2">
            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-indigo-950/40 border border-indigo-800/60 text-[9px] font-mono font-bold text-indigo-400 uppercase tracking-wider">
              <Sparkles className="h-3 w-3" />
              <span>Academic Engineering Lab</span>
            </span>
            <h2 className="text-xl font-bold text-slate-100 font-sans tracking-tight">
              In-Depth Graph Neural Network (GNN) Play Ground
            </h2>
            <p className="text-xs text-slate-400 max-w-2xl">
              Unlike classical neural networks treating data as flat grids (images or lists), GNNs directly compute over complex geometric structure. By utilizing continuous <strong>Message Passing Algorithms</strong>, they map topological neural associations directly into low-dimensional cognitive embedding spaces.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => askGnnTutor("Can you explain GCN Layer formula step by step with dimensions?")}
              className="text-[10px] bg-slate-950 border border-slate-850 hover:border-slate-700 text-indigo-300 font-medium px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              📐 GCN Formula Math
            </button>
            <button 
              onClick={() => askGnnTutor("How do we model brainwave EEG channels as an active Graph structure?")}
              className="text-[10px] bg-slate-950 border border-slate-850 hover:border-slate-700 text-emerald-300 font-medium px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              🧠 EEG Topology GNN
            </button>
          </div>
        </div>
      </div>

      {/* Main Sandbox Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* INTERACTIVE SIMULATOR CANVAS: 7 COLS */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between shadow-xl min-h-[580px] relative">
          
          {/* Header Panel */}
          <div className="flex items-center justify-between border-b border-slate-850 pb-3 flex-wrap gap-2">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider">Interactive Workbench</span>
              <h3 className="font-extrabold text-slate-200 text-sm flex items-center gap-2">
                <Sliders className="h-4 w-4 text-indigo-400" />
                Geometric Message passing Simulator
              </h3>
            </div>
            
            {/* Architecture Selector */}
            <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-850">
              {(['gcn', 'gat', 'sage'] as const).map(arch => (
                <button
                  key={arch}
                  onClick={() => {
                    setArchitecture(arch);
                    addLog(`Switched network model target: ${arch.toUpperCase()}`);
                  }}
                  className={`px-3 py-1 text-[10px] font-bold rounded-md uppercase transition-all duration-150 cursor-pointer ${
                    architecture === arch 
                      ? 'bg-indigo-600 text-white shadow-md' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {arch}
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic Interactive Schema Formula */}
          <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-850/60 my-3 text-xs">
            <span className="text-[9px] font-mono tracking-widest text-slate-500 font-bold block mb-1">CURRENT PROPAGATION FORMULA</span>
            {architecture === 'gcn' && (
              <div className="space-y-1">
                <code className="text-indigo-400 font-mono block text-sm">
                  h_i^(l+1) = σ ( Σ_j ( 1 / √(D_ii * D_jj) ) * W * h_j^(l) )
                </code>
                <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
                  Symmetric spatial normalization using adjacency degrees. Prevents features from scaling exponentially as neighbor counts increase.
                </p>
              </div>
            )}
            {architecture === 'gat' && (
              <div className="space-y-1">
                <code className="text-emerald-400 font-mono block text-sm">
                  h_i^(l+1) = σ ( Σ_j α_ij * W * h_j^(l) ) &nbsp;[α_ij = Attention Coefficient]
                </code>
                <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
                  Anisotropic aggregation using dynamic attention values computed by continuous comparative soft-max pairings of node vectors.
                </p>
              </div>
            )}
            {architecture === 'sage' && (
              <div className="space-y-1">
                <code className="text-amber-400 font-mono block text-sm">
                  h_i^(l+1) = σ ( W * [ h_i^(l) || Mean_(j∈N)( h_j^(l) ) ] )
                </code>
                <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
                  GraphSAGE (Sample and Aggregate) extracts uniform neighborhood subsets, concatenates self features, and computes linear projection.
                </p>
              </div>
            )}
          </div>

          {/* SIMULATION VISUAL STAGE */}
          <div className="relative bg-slate-950 border border-slate-855 rounded-xl h-[330px] flex items-center justify-center overflow-hidden">
            
            {/* Ambient grid background overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(51,65,85,0.12),transparent_70%)]" />
            
            {/* SVG edges rendering */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
              <defs>
                <linearGradient id="edgeGrad" x1="0" y1="0" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.4" />
                </linearGradient>
              </defs>

              {/* Render edges loop */}
              {nodes.map(node => (
                node.neighbors.map(neighId => {
                  const target = nodes.find(n => n.id === neighId);
                  if (!target || node.id > target.id) return null; // Avoid drawing duplicate paths
                  
                  return (
                    <g key={`edge-${node.id}-${target.id}`}>
                      {/* Base link layout */}
                      <line
                        x1={node.x}
                        y1={node.y}
                        x2={target.x}
                        y2={target.y}
                        stroke="url(#edgeGrad)"
                        strokeWidth="1.5"
                        className="transition-all"
                      />
                      
                      {/* Propagating message dash array animation */}
                      {activeEdgeParticles && (
                        <line
                          x1={node.x}
                          y1={node.y}
                          x2={target.x}
                          y2={target.y}
                          stroke={architecture === 'gat' ? '#10b981' : architecture === 'sage' ? '#f59e0b' : '#6366f1'}
                          strokeWidth="2.5"
                          strokeDasharray="8,15"
                          className="animate-[dash_2s_linear_infinite]"
                          style={{
                            animationKeyframes: 'dash'
                          }}
                        />
                      )}
                    </g>
                  );
                })
              ))}
            </svg>

            {/* Render node circles */}
            {nodes.map(node => {
              const isSelected = selectedNode?.id === node.id;
              const isUpdated = step === 'activated' && updatedFeatures[node.id];
              const feats = isUpdated ? updatedFeatures[node.id] : (step === 'aggregated' ? aggregatedFeatures[node.id] : node.features);
              
              // Map GNN node coordinates to screen percentage/pixels safely
              return (
                <button
                  key={node.id}
                  onClick={() => {
                    setSelectedNode(node);
                    addLog(`Queried metadata for ${node.label}. Current properties: h = [${feats[0]}, ${feats[1]}]`);
                  }}
                  className="absolute p-0 border-none bg-transparent cursor-pointer z-10 transition-transform hover:scale-110 active:scale-95 duration-150 focus:outline-none group"
                  style={{
                    left: `${node.x - 24}px`,
                    top: `${node.y - 24}px`,
                    width: '48px',
                    height: '48px'
                  }}
                >
                  <div className={`w-12 h-12 rounded-full relative flex items-center justify-center border transition-all duration-300 shadow-xl ${
                    isSelected 
                      ? 'bg-indigo-900/90 border-indigo-400 ring-2 ring-indigo-500/50 scale-105' 
                      : isUpdated 
                        ? 'bg-emerald-950/80 border-emerald-500'
                        : 'bg-slate-900 border-slate-750'
                  }`}>
                    <Brain className={`h-5 w-5 ${
                      isSelected 
                        ? 'text-indigo-400 animate-pulse' 
                        : isUpdated 
                          ? 'text-emerald-400' 
                          : 'text-slate-400'
                    }`} />
                    
                    {/* Node Identifier badge */}
                    <span className="absolute -top-1.5 -right-1.5 bg-slate-950 text-slate-300 text-[8px] font-mono font-bold w-4 h-4 rounded-full border border-slate-800 flex items-center justify-center leading-none">
                      N{node.id}
                    </span>

                    {/* Tooltip prompt */}
                    <div className="absolute top-12 left-1/2 -translate-x-1/2 bg-slate-950 border border-slate-800 text-[10px] font-sans text-slate-200 px-2 py-1 rounded shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50 pointer-events-none">
                      <span className="font-bold">{node.label}</span>
                      <span className="text-[9px] text-slate-400 block font-mono">h = [{feats[0]}, {feats[1]}]</span>
                    </div>
                  </div>
                </button>
              );
            })}

            {/* Sim running overlays */}
            {step === 'propagating' && (
              <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[1px] flex flex-col items-center justify-center space-y-2">
                <div className="flex items-center space-x-2 bg-slate-900/95 border border-slate-800 text-xs px-4 py-2.5 rounded-lg shadow-xl font-mono text-indigo-400">
                  <Activity className="h-4 w-4 animate-spin shrink-0" />
                  <span>Computing topological message transforms...</span>
                </div>
              </div>
            )}
          </div>

          {/* Simulation Controls Footer */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 border-t border-slate-850 pt-3">
            <button
              onClick={runMessagePassing}
              disabled={step === 'propagating' || step === 'aggregated' || step === 'activated'}
              className="flex items-center justify-center gap-1.5 bg-indigo-650 hover:bg-indigo-600 disabled:bg-slate-850 disabled:text-slate-600 font-bold text-xs py-2 px-3 rounded-lg text-slate-200 transition-colors cursor-pointer"
            >
              <Play className="h-3.5 w-3.5" />
              <span>1. Aggregate Neighbors</span>
            </button>

            <button
              onClick={applyActivation}
              disabled={step !== 'aggregated'}
              className="flex items-center justify-center gap-1.5 bg-emerald-650 hover:bg-emerald-600 disabled:bg-slate-850 disabled:text-slate-600 font-bold text-xs py-2 px-3 rounded-lg text-slate-200 transition-colors cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>2. Transform & Activate (W)</span>
            </button>

            <button
              onClick={handleReset}
              className="flex items-center justify-center gap-1.5 bg-slate-950 border border-slate-850 hover:border-slate-8a px-3 py-2 text-slate-350 hover:text-slate-200 text-xs rounded-lg transition-colors cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset State</span>
            </button>
          </div>

        </div>

        {/* METADATA CONFIG & MATH CONTROLS: 5 COLS */}
        <div className="lg:col-span-5 flex flex-col space-y-6">
          
          {/* Node Feature and Weights Manipulator */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
            <span className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider block">GNN Layer Parametrization</span>
            <h3 className="font-bold text-slate-200 text-sm mb-3">Node Attributes & Weights W</h3>

            {/* Matrix Weights Grid */}
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-850 mb-4">
              <span className="text-[9px] font-mono tracking-widest text-slate-500 font-bold block mb-1">PROJECTION WEIGHTS MATRIX (W_2x2)</span>
              <div className="grid grid-cols-2 gap-3 mb-2">
                <div>
                  <label className="text-[8px] font-mono text-slate-500 block mb-0.5">W[0][0] (Scale Attn)</label>
                  <input 
                    type="range" min="-1.5" max="1.5" step="0.1" 
                    value={weightMatrix[0][0]} 
                    onChange={(e) => handleMatrixWeightChange(0, 0, parseFloat(e.target.value))}
                    className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-slate-900 rounded"
                  />
                  <span className="text-[10px] font-mono text-indigo-300 block text-right font-bold mt-0.5">{weightMatrix[0][0]}</span>
                </div>
                <div>
                  <label className="text-[8px] font-mono text-slate-500 block mb-0.5">W[0][1] (Mix Stress)</label>
                  <input 
                    type="range" min="-1.5" max="1.5" step="0.1" 
                    value={weightMatrix[0][1]} 
                    onChange={(e) => handleMatrixWeightChange(0, 1, parseFloat(e.target.value))}
                    className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-slate-900 rounded"
                  />
                  <span className="text-[10px] font-mono text-indigo-300 block text-right font-bold mt-0.5">{weightMatrix[0][1]}</span>
                </div>
                <div>
                  <label className="text-[8px] font-mono text-slate-500 block mb-0.5">W[1][0] (Mix Attn)</label>
                  <input 
                    type="range" min="-1.5" max="1.5" step="0.1" 
                    value={weightMatrix[1][0]} 
                    onChange={(e) => handleMatrixWeightChange(1, 0, parseFloat(e.target.value))}
                    className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-slate-900 rounded"
                  />
                  <span className="text-[10px] font-mono text-indigo-300 block text-right font-bold mt-0.5">{weightMatrix[1][0]}</span>
                </div>
                <div>
                  <label className="text-[8px] font-mono text-slate-500 block mb-0.5">W[1][1] (Scale Stress)</label>
                  <input 
                    type="range" min="-1.5" max="1.5" step="0.1" 
                    value={weightMatrix[1][1]} 
                    onChange={(e) => handleMatrixWeightChange(1, 1, parseFloat(e.target.value))}
                    className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-slate-900 rounded"
                  />
                  <span className="text-[10px] font-mono text-indigo-300 block text-right font-bold mt-0.5">{weightMatrix[1][1]}</span>
                </div>
              </div>
            </div>

            {/* Selected Node Properties */}
            {selectedNode ? (
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-855">
                <span className="text-[9px] font-mono tracking-widest text-slate-400 font-bold flex items-center justify-between mb-2">
                  <span>SELECTED NODE SCOPES</span>
                  <span className="text-indigo-400">Node #{selectedNode.id}</span>
                </span>
                
                <h4 className="font-bold text-slate-100 text-xs mb-3">{selectedNode.label} Hub</h4>
                
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-[10px] mb-1 font-mono text-slate-350">
                      <span>Baseline Feature Index 0 (Attention Level)</span>
                      <span className="text-sky-300 font-bold">{selectedNode.features[0].toFixed(2)}</span>
                    </div>
                    <input 
                      type="range" min="0" max="1" step="0.05"
                      value={selectedNode.features[0]}
                      disabled={step !== 'idle'}
                      onChange={(e) => handleFeatureChange(selectedNode.id, 0, parseFloat(e.target.value))}
                      className="w-full accent-sky-505 accent-sky-400 cursor-pointer h-1.5 bg-slate-900 rounded disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[10px] mb-1 font-mono text-slate-350">
                      <span>Baseline Feature Index 1 (Stress Vulnerability)</span>
                      <span className="text-emerald-300 font-bold">{selectedNode.features[1].toFixed(2)}</span>
                    </div>
                    <input 
                      type="range" min="0" max="1" step="0.05"
                      value={selectedNode.features[1]}
                      disabled={step !== 'idle'}
                      onChange={(e) => handleFeatureChange(selectedNode.id, 1, parseFloat(e.target.value))}
                      className="w-full accent-emerald-505 accent-emerald-400 cursor-pointer h-1.5 bg-slate-900 rounded disabled:opacity-50"
                    />
                  </div>

                  {/* Embedding State Output Vector */}
                  <div className="bg-slate-900 border border-slate-800 rounded p-2 text-[10.5px]">
                    <span className="text-[8px] font-mono text-slate-500 block mb-0.5 uppercase tracking-wide">Represented Layer Output Embedding</span>
                    {step === 'activated' ? (
                      <div className="flex items-center space-x-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                        <span className="font-mono text-emerald-400 font-bold">
                          h_new = [{updatedFeatures[selectedNode.id]?.[0] || '0.000'}, {updatedFeatures[selectedNode.id]?.[1] || '0.000'}]
                        </span>
                      </div>
                    ) : step === 'aggregated' ? (
                      <div className="flex items-center space-x-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                        <span className="font-mono text-amber-400 font-bold">
                          h_agg = [{aggregatedFeatures[selectedNode.id]?.[0] || '0.000'}, {aggregatedFeatures[selectedNode.id]?.[1] || '0.000'}]
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-600"></span>
                        <span className="font-mono text-slate-400 font-bold">
                          h_raw = [{selectedNode.features[0]}, {selectedNode.features[1]}]
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 text-center p-3 border border-dashed border-slate-800 rounded">
                Click a visual Node on the Workbench stage to tweak parameters.
              </p>
            )}
          </div>

          {/* LIVE CONSOLE LOGS PANEL */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl flex-1 flex flex-col justify-between h-[210px]">
            <div className="flex items-center justify-between pb-2 border-b border-slate-850">
              <span className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></span>
                Topological Execution Logs
              </span>
              <button 
                onClick={() => setLogs(['Simulation telemetry traces cleared.'])}
                className="text-[9px] text-slate-500 hover:text-slate-350 cursor-pointer underline bg-transparent border-none"
              >
                Clear
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto mt-2 font-mono text-[9.5px] leading-relaxed select-text space-y-2 h-[120px] scrollbar-thin scrollbar-thumb-slate-850 scrollbar-track-transparent">
              {logs.map((log, index) => (
                <div key={index} className="text-slate-300 pr-1 border-l border-slate-800 pl-2">
                  {log}
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Adaptive GNN MCQ Quiz & Cognitive GNN Deep-Dive AI Assistant block */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Academic Evaluation block (GNN Quiz) */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col justify-between min-h-[380px]">
          <div>
            <div className="flex items-center justify-between border-b border-slate-850 pb-3 mb-4">
              <div>
                <span className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider block">Cognitive Calibration</span>
                <h3 className="font-extrabold text-slate-200 text-sm flex items-center gap-2">
                  <Award className="h-4 w-4 text-emerald-400" />
                  Graph Neural Networks Concept Check
                </h3>
              </div>
            </div>

            {!quizSubmitted ? (
              <div className="space-y-4">
                {/* Question Text */}
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-855/80 text-xs text-slate-200">
                  <span className="font-bold text-indigo-400 font-mono block mb-1">Question {activeQuizQuestionIdx + 1} of {gnnQuizzes.length}</span>
                  <p className="leading-relaxed font-sans font-medium">{gnnQuizzes[activeQuizQuestionIdx].question}</p>
                </div>

                {/* Question Options */}
                <div className="grid grid-cols-1 gap-2">
                  {gnnQuizzes[activeQuizQuestionIdx].options.map((option, idx) => {
                    const isSelected = selectedQuizAnswer === option;
                    const isCorrect = option === gnnQuizzes[activeQuizQuestionIdx].correctAnswer;
                    
                    return (
                      <button
                        key={idx}
                        onClick={() => handleQuizAnswerSelect(option)}
                        className={`p-2.5 rounded-lg text-left text-xs transition-all flex items-center justify-between border cursor-pointer ${
                          isSelected 
                            ? 'bg-indigo-950/60 border-indigo-500/80 text-indigo-200 font-bold' 
                            : 'bg-slate-950 border-slate-855 text-slate-350 hover:bg-slate-850 hover:text-slate-100'
                        }`}
                      >
                        <span>{option}</span>
                        {quizAnswerChecked && isCorrect && (
                          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                        )}
                        {quizAnswerChecked && isSelected && !isCorrect && (
                          <XCircle className="h-4 w-4 text-red-400 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Explanation Overlay */}
                {quizAnswerChecked && (
                  <div className="bg-slate-950/90 border border-slate-850 p-3 rounded-lg text-[10.5px] leading-relaxed text-slate-400 animate-fadeIn font-sans">
                    <strong className="text-indigo-400 flex items-center gap-1 mb-1 font-mono">
                      <Info className="h-3.5 w-3.5 text-indigo-400" />
                      EXPLANATION BLUEPRINT
                    </strong>
                    {gnnQuizzes[activeQuizQuestionIdx].explanation}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6 space-y-4 animate-scaleUp">
                <div className="h-14 w-14 bg-indigo-950/40 border border-indigo-800/80 text-indigo-400 rounded-full flex items-center justify-center mx-auto text-xl font-mono font-bold shadow-lg">
                  {quizScore}/{gnnQuizzes.length}
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-200 text-sm">GNN Assessment Completed</h4>
                  <p className="text-xs text-slate-400">
                    {quizScore === gnnQuizzes.length 
                      ? 'Incredible mastery of deep topological representations! You matched the optimal cognitive benchmark.' 
                      : 'Excellent review session! Tweak simulator node characteristics and review aggregation formulas to secure perfect recall.'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer Action */}
          <div className="border-t border-slate-850 pt-3 mt-4 flex justify-end">
            {!quizSubmitted ? (
              <div className="flex items-center gap-3">
                {!quizAnswerChecked ? (
                  <button
                    onClick={handleQuizCheck}
                    disabled={!selectedQuizAnswer}
                    className="bg-indigo-600 hover:bg-indigo-505 bg-indigo-700 hover:bg-indigo-650 cursor-pointer disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold text-[10.5px] px-4 py-2 rounded-lg duration-150 transition-colors"
                  >
                    Check Answer
                  </button>
                ) : (
                  <button
                    onClick={handleQuizNext}
                    className="flex items-center gap-1 bg-slate-955 border border-slate-850 hover:bg-slate-800 text-slate-100 font-bold text-[10.5px] px-4 py-2 rounded-lg duration-150 transition-all cursor-pointer"
                  >
                    <span>{activeQuizQuestionIdx === gnnQuizzes.length - 1 ? 'Finish' : 'Next Question'}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={handleQuizReset}
                className="bg-slate-955 border border-slate-855 hover:bg-slate-800 font-bold text-[10.5px] px-4 py-2 rounded-lg duration-150 cursor-pointer text-slate-300"
              >
                Review Again
              </button>
            )}
          </div>
        </div>

        {/* Gemini Cognitive GNN Deep-Dive Assistant */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col justify-between min-h-[380px]">
          
          <div className="flex flex-col flex-1 h-[270px]">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-850 pb-2 mb-3">
              <div>
                <span className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider block">Bio-Adaptive Tutor Instance</span>
                <h3 className="font-extrabold text-slate-200 text-sm flex items-center gap-2">
                  <Brain className="h-4 w-4 text-indigo-400" />
                  Cognitive GNN Deep-Dive AI Assistant
                </h3>
              </div>
              <Sparkles className="h-4 w-4 text-indigo-400 animate-pulse" />
            </div>

            {/* Chat Messages Body */}
            <div className="flex-1 overflow-y-auto mb-3 space-y-3 font-sans max-h-[190px] scrollbar-thin scrollbar-thumb-slate-850">
              {gnnChatHistory.map((msg, index) => (
                <div key={index} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`p-2.5 rounded-lg text-xs leading-relaxed max-w-[92%] ${
                    msg.role === 'user' 
                      ? 'bg-indigo-650 text-slate-100 rounded-br-none font-medium' 
                      : 'bg-slate-950 text-slate-300 rounded-bl-none border border-slate-850'
                  }`}>
                    <span className="whitespace-pre-wrap">{msg.text}</span>
                  </div>
                </div>
              ))}
              
              {isGnnChatLoading && (
                <div className="flex items-center space-x-2 bg-slate-950 p-2.5 rounded-lg border border-slate-850 text-xs text-slate-400 animate-pulse">
                  <div className="h-1.5 w-1.5 bg-indigo-500 rounded-full animate-ping"></div>
                  <span>Gemini is customizing instructional architecture...</span>
                </div>
              )}
            </div>
          </div>

          {/* Footer Input */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Ask anything about Graph Neural Networks (GCN, GAT, etc.)..."
              value={gnnChatPrompt}
              disabled={isGnnChatLoading}
              onChange={(e) => setGnnChatPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && askGnnTutor()}
              className="flex-1 bg-slate-950 border border-slate-850 text-xs rounded px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 disabled:opacity-50"
            />
            <button
              onClick={() => askGnnTutor()}
              disabled={!gnnChatPrompt.trim() || isGnnChatLoading}
              className="bg-indigo-600 hover:bg-indigo-505 bg-indigo-700 hover:bg-indigo-650 disabled:bg-slate-800 disabled:text-slate-600 font-bold text-xs p-2.5 rounded text-white flex items-center justify-center duration-150 transition-colors cursor-pointer"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
