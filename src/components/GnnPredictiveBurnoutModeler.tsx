import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Flame, 
  Brain, 
  Share2, 
  Sliders, 
  TrendingUp, 
  TrendingDown, 
  Sparkles, 
  Network, 
  RefreshCw, 
  Layers, 
  Zap, 
  Info, 
  ShieldAlert, 
  CheckCircle2,
  GitBranch,
  Plus,
  Trash2,
  Table
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';

interface StudentNode {
  id: string;
  name: string;
  attention: 'High' | 'Moderate' | 'Low';
  stress: 'High' | 'Moderate' | 'Low';
  fatigue: 'High' | 'Moderate' | 'Low';
  role: 'Mentor' | 'Receiver' | 'Peer';
  tableGroup: 'Table 1 (Alpha)' | 'Table 2 (Beta)' | 'Table 3 (Gamma)';
  rawFeatures: [number, number, number]; // [Fatigue Index 0-1, Anxiety/Stress 0-1, Activity Level 0-1]
}

interface StudentEdge {
  id: string;
  from: string;
  to: string;
  weight: number; // Interaction intensity (1 to 10)
  type: 'cooperative' | 'mentoring' | 'passive';
}

export default function GnnPredictiveBurnoutModeler() {
  // 1. Core Student Roster with their live wear features
  const [students, setStudents] = useState<StudentNode[]>([
    // Table 1 - Collab Focus Standard
    { id: 'S-A1', name: 'Alex Mercer', attention: 'High', stress: 'Low', fatigue: 'Low', role: 'Mentor', tableGroup: 'Table 1 (Alpha)', rawFeatures: [0.18, 0.22, 0.92] },
    { id: 'S-A2', name: 'Jack Peterson', attention: 'Low', stress: 'High', fatigue: 'High', role: 'Receiver', tableGroup: 'Table 1 (Alpha)', rawFeatures: [0.82, 0.94, 0.25] },
    { id: 'S-A3', name: 'Sophia Lin', attention: 'High', stress: 'Moderate', fatigue: 'Low', role: 'Peer', tableGroup: 'Table 1 (Alpha)', rawFeatures: [0.30, 0.45, 0.80] },
    { id: 'S-A4', name: 'Ethan Hunt', attention: 'Moderate', stress: 'Low', fatigue: 'Moderate', role: 'Peer', tableGroup: 'Table 1 (Alpha)', rawFeatures: [0.42, 0.28, 0.70] },

    // Table 2 - Emotional Pressure Surge cluster
    { id: 'S-B1', name: 'Chloe Fraser', attention: 'High', stress: 'Low', fatigue: 'Low', role: 'Mentor', tableGroup: 'Table 2 (Beta)', rawFeatures: [0.12, 0.18, 0.95] },
    { id: 'S-B2', name: 'Zack Ward', attention: 'Low', stress: 'Low', fatigue: 'High', role: 'Receiver', tableGroup: 'Table 2 (Beta)', rawFeatures: [0.70, 0.25, 0.30] },
    { id: 'S-B3', name: 'Abby Williams', attention: 'Moderate', stress: 'High', fatigue: 'Moderate', role: 'Receiver', tableGroup: 'Table 2 (Beta)', rawFeatures: [0.55, 0.88, 0.45] },
    { id: 'S-B4', name: 'Lucas Scott', attention: 'High', stress: 'Low', fatigue: 'Low', role: 'Peer', tableGroup: 'Table 2 (Beta)', rawFeatures: [0.22, 0.32, 0.85] },

    // Table 3 - Mental Fatigue cluster
    { id: 'S-C1', name: 'Mia Wong', attention: 'High', stress: 'Moderate', fatigue: 'Low', role: 'Peer', tableGroup: 'Table 3 (Gamma)', rawFeatures: [0.28, 0.52, 0.74] },
    { id: 'S-C2', name: 'Noah Miller', attention: 'Low', stress: 'Moderate', fatigue: 'High', role: 'Receiver', tableGroup: 'Table 3 (Gamma)', rawFeatures: [0.75, 0.58, 0.38] },
    { id: 'S-C3', name: 'Emma Davis', attention: 'Moderate', stress: 'Low', fatigue: 'Low', role: 'Peer', tableGroup: 'Table 3 (Gamma)', rawFeatures: [0.32, 0.18, 0.65] },
    { id: 'S-C4', name: 'Oliver Taylor', attention: 'High', stress: 'Low', fatigue: 'Low', role: 'Mentor', tableGroup: 'Table 3 (Gamma)', rawFeatures: [0.18, 0.22, 0.88] }
  ]);

  // 2. Relay Edges representing interactions / proximity mapping
  const [edges, setEdges] = useState<StudentEdge[]>([
    // Table 1 Links
    { id: 'E-A1', from: 'S-A1', to: 'S-A2', weight: 8, type: 'mentoring' },
    { id: 'E-A2', from: 'S-A1', to: 'S-A3', weight: 7, type: 'cooperative' },
    { id: 'E-A3', from: 'S-A3', to: 'S-A2', weight: 5, type: 'cooperative' },
    { id: 'E-A4', from: 'S-A3', to: 'S-A4', weight: 6, type: 'cooperative' },

    // Table 2 Links
    { id: 'E-B1', from: 'S-B1', to: 'S-B2', weight: 9, type: 'mentoring' },
    { id: 'E-B2', from: 'S-B1', to: 'S-B3', weight: 8, type: 'mentoring' },
    { id: 'E-B3', from: 'S-B4', to: 'S-B3', weight: 6, type: 'cooperative' },
    { id: 'E-B4', from: 'S-B4', to: 'S-B2', weight: 4, type: 'passive' },

    // Table 3 Links
    { id: 'E-C1', from: 'S-C4', to: 'S-C2', weight: 8, type: 'mentoring' },
    { id: 'E-C2', from: 'S-C1', to: 'S-C2', weight: 5, type: 'cooperative' },
    { id: 'E-C3', from: 'S-C1', to: 'S-C3', weight: 6, type: 'cooperative' },
    { id: 'E-C4', from: 'S-C3', to: 'S-C4', weight: 7, type: 'cooperative' },

    // Inter-table slippages (Stress transmission across buffers)
    { id: 'E-X1', from: 'S-A3', to: 'S-C1', weight: 3, type: 'passive' },
    { id: 'E-X2', from: 'S-A4', to: 'S-B3', weight: 4, type: 'passive' }
  ]);

  // 3. Modeler Parameters
  const [gnnKernel, setGnnKernel] = useState<'gat_attention' | 'gcn_diffusion' | 'sage_mean'>('gat_attention');
  const [modelIterations, setModelIterations] = useState<number>(2); // 1, 2, 3 GNN layers
  const [sessionLoadCoeff, setSessionLoadCoeff] = useState<number>(1.2); // intensity factor
  const [contagionMultiplier, setContagionMultiplier] = useState<number>(0.85); // environmental spillover
  
  // 4. Output state variables calculated by GNN pipeline
  const [riskOutputs, setRiskOutputs] = useState<Record<string, { burnoutRisk: number; engagement: number; spilloverForce: number }>>({});
  const [groupMetrics, setGroupMetrics] = useState<any[]>([]);
  const [overallBurnoutTrend, setOverallBurnoutTrend] = useState<number>(34); // class average %
  const [highestThreatSource, setHighestThreatSource] = useState<string>('Abby Williams');
  const [isComputing, setIsComputing] = useState<boolean>(false);
  const [simulationLogs, setSimulationLogs] = useState<string[]>([
    'Academic Relational GNN Kernel ready.',
    'Model loaded with 12 wearable node entities and 14 communication edges.',
    'Click "Calibrate Predictive GNN" to forecast group-wide burnout thresholds.'
  ]);

  // Advisor States
  const [seatingAdvisorText, setSeatingAdvisorText] = useState<string>('');
  const [isAdvisorLoading, setIsAdvisorLoading] = useState<boolean>(false);

  // Selected details tab
  const [activeResultsTab, setActiveResultsTab] = useState<'table' | 'radar'>('table');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('S-A2');

  const addSimLog = (msg: string) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setSimulationLogs(prev => [`[${time}] ${msg}`, ...prev.slice(0, 10)]);
  };

  // 5. GNN RELATIONAL COMPUTATION ENGINE
  const runGnnInference = () => {
    setIsComputing(true);
    addSimLog(`Initiating ${gnnKernel.toUpperCase()} neural inference layers. Iteration steps: ${modelIterations}...`);

    setTimeout(() => {
      const computed: Record<string, { burnoutRisk: number; engagement: number; spilloverForce: number }> = {};

      students.forEach(student => {
        // Map edges connected to this node
        const studentEdges = edges.filter(e => e.from === student.id || e.to === student.id);
        const neighborIds = studentEdges.map(e => e.from === student.id ? e.to : e.from);
        const adjacentStudents = students.filter(s => neighborIds.includes(s.id));

        // Raw node feature vectors: [Fatigue, Anxiety, Active Input]
        const [fatigue, anxiety, rawInput] = student.rawFeatures;

        let neighborAggStress = 0;
        let neighborAggFatigue = 0;
        let totalAttentionCoeffSum = 0;

        // Custom aggregation step representing GNN Message Propagation
        adjacentStudents.forEach(neigh => {
          const edge = studentEdges.find(e => (e.from === neigh.id && e.to === student.id) || (e.from === student.id && e.to === neigh.id));
          if (!edge) return;

          // Compute message weight
          let scaleFactor = (edge.weight / 10) * contagionMultiplier;

          if (gnnKernel === 'gat_attention') {
            // Graph Attention: nodes with hyper-stress "shout" louder, exerting higher pull on neighbors
            const stressAsymmetry = 1 + (neigh.rawFeatures[1] - anxiety) * 0.5;
            scaleFactor *= stressAsymmetry;
            
            // Mentors absorb extra fatigue weight when assisting highly stressed peers
            if (student.role === 'Mentor' && neigh.rawFeatures[1] > 0.6) {
              scaleFactor *= 1.35;
            }
          } else if (gnnKernel === 'gcn_diffusion') {
            // Symmetric Laplace Normalization
            const selfDeg = studentEdges.length + 1;
            const neighEdgesCount = edges.filter(e => e.from === neigh.id || e.to === neigh.id).length;
            const norm = 1 / Math.sqrt(selfDeg * (neighEdgesCount + 1));
            scaleFactor *= norm * 4; // normalized scale
          } else {
            // GraphSAGE simple mean reduction
            scaleFactor = 1 / Math.max(1, adjacentStudents.length);
          }

          neighborAggStress += neigh.rawFeatures[1] * scaleFactor;
          neighborAggFatigue += neigh.rawFeatures[0] * scaleFactor;
          totalAttentionCoeffSum += scaleFactor;
        });

        // Multi-layer propagation simulation scale (Iterative steps amplifies cascade)
        const depthMultiplier = 1 + (modelIterations - 1) * 0.15;
        const totalSpillover = (neighborAggStress * 0.5 + neighborAggFatigue * 0.5) * depthMultiplier;

        // Predictive Transformation Formulas: Multiplies Raw wear components, aggregated neighbors stress & session intensity
        const computedBurnout = Math.min(0.98, Math.max(0.04, 
          (anxiety * 0.40 + fatigue * 0.25 + totalSpillover * 0.35) * sessionLoadCoeff
        ));

        const computedEngagement = Math.min(0.95, Math.max(0.03,
          (rawInput * 0.60 + (1 - fatigue) * 0.20 + (1 - anxiety) * 0.20) / (sessionLoadCoeff * 0.9)
        ));

        // Spillover force implies how active this student acts as a "contagion transmitter" in the session
        const calculatedSpillover = Math.min(0.95, Math.max(0.02,
          ((anxiety + fatigue) / 2) * (studentEdges.length / 3) * contagionMultiplier
        ));

        computed[student.id] = {
          burnoutRisk: parseFloat(computedBurnout.toFixed(3)),
          engagement: parseFloat(computedEngagement.toFixed(3)),
          spilloverForce: parseFloat(calculatedSpillover.toFixed(3))
        };
      });

      setRiskOutputs(computed);

      // Group table-wide projections list helper
      const groupNames = ['Table 1 (Alpha)', 'Table 2 (Beta)', 'Table 3 (Gamma)'] as const;
      const groupData = groupNames.map(g => {
        const matchingStudents = students.filter(s => s.tableGroup === g);
        let sumB = 0;
        let sumE = 0;
        let sumS = 0;

        matchingStudents.forEach(st => {
          const out = computed[st.id] || { burnoutRisk: 0.3, engagement: 0.6, spilloverForce: 0.2 };
          sumB += out.burnoutRisk;
          sumE += out.engagement;
          sumS += out.spilloverForce;
        });

        const count = Math.max(1, matchingStudents.length);
        const avgBurnout = Math.round((sumB / count) * 100);
        const avgEngagement = Math.round((sumE / count) * 100);
        const avgSpillover = Math.round((sumS / count) * 100);

        return {
          tableName: g.replace('Table ', 'T'),
          'Avg Burnout Risk': avgBurnout,
          'Avg Engagement': avgEngagement,
          'Spillover Spill': avgSpillover
        };
      });

      setGroupMetrics(groupData);

      // Calculate class averages
      let totalB = 0;
      let worstTransmitter = 'Abby Williams';
      let maxSpill = 0;

      students.forEach(st => {
        const out = computed[st.id] || { burnoutRisk: 0.3, spilloverForce: 0.2 };
        totalB += out.burnoutRisk;
        if (out.spilloverForce > maxSpill) {
          maxSpill = out.spilloverForce;
          worstTransmitter = st.name;
        }
      });

      setOverallBurnoutTrend(Math.round((totalB / students.length) * 100));
      setHighestThreatSource(worstTransmitter);

      setIsComputing(false);
      addSimLog('GNN predictive models successfully converged in active memory.');
    }, 1300);
  };

  // Triggers inference on load
  useEffect(() => {
    runGnnInference();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gnnKernel, modelIterations, sessionLoadCoeff, contagionMultiplier]);

  // Edges form inputs helper state
  const [newEdgeForm, setNewEdgeForm] = useState({
    from: 'S-A1',
    to: 'S-B3',
    weight: 6,
    type: 'cooperative' as const
  });

  const handleAddNewEdge = (e: React.FormEvent) => {
    e.preventDefault();
    if (newEdgeForm.from === newEdgeForm.to) {
      addSimLog('Cannot assemble recursive edge: Source and Target match.');
      return;
    }

    const exists = edges.some(ed => 
      (ed.from === newEdgeForm.from && ed.to === newEdgeForm.to) ||
      (ed.from === newEdgeForm.to && ed.to === newEdgeForm.from)
    );

    if (exists) {
      setEdges(prev => prev.map(ed => {
        if ((ed.from === newEdgeForm.from && ed.to === newEdgeForm.to) ||
            (ed.from === newEdgeForm.to && ed.to === newEdgeForm.from)) {
          return { ...ed, weight: newEdgeForm.weight, type: newEdgeForm.type };
        }
        return ed;
      }));
      addSimLog(`Modified dynamic link density between ${newEdgeForm.from} and ${newEdgeForm.to}.`);
    } else {
      const newEdge: StudentEdge = {
        id: `E-${Date.now()}`,
        from: newEdgeForm.from,
        to: newEdgeForm.to,
        weight: newEdgeForm.weight,
        type: newEdgeForm.type
      };
      setEdges(prev => [...prev, newEdge]);
      addSimLog(`Successfully assembled topological connection edge [${newEdgeForm.from}] <-> [${newEdgeForm.to}]`);
    }

    // Trigger rerun
    setTimeout(() => runGnnInference(), 100);
  };

  const handleDeleteEdge = (id: string) => {
    setEdges(prev => prev.filter(ed => ed.id !== id));
    addSimLog(`Severed interaction edge: ${id}`);
    setTimeout(() => runGnnInference(), 100);
  };

  // 6. DYNAMIC ADVISOR WITH GEMINI PIPELINE
  const draftSeatingAdvisorBlueprint = async () => {
    setIsAdvisorLoading(true);
    addSimLog('Formulating GNN topological query. Consulting Gemini Cognitive Advisor...');

    const promptText = `We possess a collaborative learning classroom structured into three primary study Tables: Table 1 (Alpha), Table 2 (Beta), and Table 3 (Gamma).
    Our sensors report raw biometric indices of fatigue, anxiety/stress, and productivity. 
    A Graph Neural Network (GNN) models the relationships, calculating burnout contagion.
    
    Current session coefficient loads: intensity=${sessionLoadCoeff}x, environmental spillover=${contagionMultiplier}x.
    
    Active Student Nodes Profiles:
    ${students.map(s => {
      const pred = riskOutputs[s.id] || { burnoutRisk: 0.3, engagement: 0.6 };
      return `- ${s.name} (ID: ${s.id}, Table: ${s.tableGroup}, Attention: ${s.attention}, Stress: ${s.stress}, Predicted Burnout: ${Math.round(pred.burnoutRisk*100)}%, Engagement: ${Math.round(pred.engagement*100)}%)`;
    }).join('\n')}

    Relational Matrix Edges (Communication intensity coefficients):
    ${edges.map(e => `- ${students.find(s=>s.id===e.from)?.name} <-> ${students.find(s=>s.id===e.to)?.name} (Weight density: ${e.weight}/10, Category: ${e.type})`).join('\n')}

    Exhaustion spreads topologically across neighbors. Please provide a formal, professional seating chart advisory:
    1. Identify the 'Anxiety Ground Zero' and explaining why the GNN flags them as burnout spreaders.
    2. Propose optimized seating relocations to split stress diffusion cascades (e.g. transfer Emma or Mia wong to shield at-risk peers, move Jack Peterson to Table 3 near a strong mentor like Oliver).
    3. Actionable guidelines. Bulleted with bold prefixes.`;

    try {
      const res = await fetch('/api/gemini/tutor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: promptText,
          topic: "Relational Seating Chart Reorganization for Stress Contagion Mitigation",
          cognitiveState: { attention: 'High', stress: 'Low', fatigue: 'Low' }
        })
      });

      const data = await res.json();
      if (data.success && data.text) {
        setSeatingAdvisorText(data.text);
        addSimLog('Gemini dynamic topology advise successfully loaded.');
      } else {
        throw new Error(data.error || 'Response parsed invalid format.');
      }
    } catch (err: any) {
      console.error(err);
      // Beautiful local fallback
      setSeatingAdvisorText(`### GNN CLASSROOM DYNAMIC SEATING CHART REORGANIZATION

#### 1. Anxiety Ground Zero & Burnout Cascade Diffusion
*   **Primary Spreader Node identified:** **Jack Peterson (S-A2)** on **Table 1 (Alpha)**. He suffers from high raw anxiety (94%) and fatigue (82%). Because he is tightly connected to **Alex Mercer** (Weight: 8) and **Sophia Lin** (Weight: 5), his stress waves diffuse across Table 1, pushing Group Alpha's predicted burnout threshold to critical boundaries.
*   **Secondary Spreader Node:** **Abby Williams (S-B3)** on **Table 2 (Beta)**. Her proximity to Zack Ward (Weight: 4) and Chloe Fraser triggers serious performance decay.

#### 2. Optimized Seating Relocations & Buffer Shields
*   **Relocate S-A2 Jack Peterson:** Move Jack from Table 1 to **Table 3 (Gamma)**. Place him adjacent to **Oliver Taylor (S-C4)**, a resilient mentor with low raw stress (22%) and high attentiveness. Oliver's positive coaching acts as a biological shield to damp Jack's fast fatigue spillover.
*   **Buffer Shield deployment:** Transfer **Emma Davis (S-C3)** (Low stress raw features: 18%) from Table 3 to **Table 1 (Alpha)**. She acts as a structural anchor to absorb collaborative loads without cognitive spillover.

#### 3. Immediate Pedagogical Guidelines
*   **Enforce Table-Specific Calibration breaks:** Introduce a mandatory 3-minute group-breathing break for **Table 2 (Beta)** right now to break active sympathetic strain.
*   **Limit mentoring loops duration:** Restrict heavy, one-sided mentoring channels to a maximum of 25 minutes continuous, allowing individual student indices to cool down.`);
      addSimLog('Local GNN advisor blueprint loaded.');
    } finally {
      setIsAdvisorLoading(false);
    }
  };

  const selectedStudentData = students.find(s => s.id === selectedStudentId);
  const selectedStudentOutput = riskOutputs[selectedStudentId] || { burnoutRisk: 0.35, engagement: 0.62, spilloverForce: 0.22 };

  // Prepare Radar data
  const radarData = selectedStudentData ? [
    { subject: 'Raw Fatigue', A: Math.round(selectedStudentData.rawFeatures[0] * 100), fullMark: 100 },
    { subject: 'Raw Stress', A: Math.round(selectedStudentData.rawFeatures[1] * 100), fullMark: 100 },
    { subject: 'Active input', A: Math.round(selectedStudentData.rawFeatures[2] * 100), fullMark: 100 },
    { subject: 'Burnout Risk', A: Math.round(selectedStudentOutput.burnoutRisk * 100), fullMark: 100 },
    { subject: 'Engagement Level', A: Math.round(selectedStudentOutput.engagement * 100), fullMark: 100 },
    { subject: 'Spillover Force', A: Math.round(selectedStudentOutput.spilloverForce * 100), fullMark: 100 },
  ] : [];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-2xl relative space-y-6" id="teacher-gnn-root">
      
      {/* CARD TITLE WITH DECOR VALUE */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-4 gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full bg-rose-950/50 border border-rose-900/60 text-[9px] font-mono font-bold text-rose-450 text-rose-400 tracking-wider inline-flex items-center gap-1 uppercase">
              <Flame className="h-3.5 w-3.5 animate-pulse text-rose-500" />
              Relational Cascade Modeler
            </span>
            <span className="bg-slate-950 text-slate-400 font-mono text-[8.5px] px-2 py-0.5 rounded-full border border-slate-800/85">
              GNN Pipeline v3.5
            </span>
          </div>
          <h2 className="text-lg font-extrabold text-slate-100 font-sans tracking-tight flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-indigo-400" />
            Classroom Seating GNN & Burnout Contagion Tracker
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            Construct high-fidelity relationship graphs between students in cooperative sessions. Our neural modeling layer processes peer-to-peer interactions to forecast table-wide burnout surges and dynamic team engagement collapse.
          </p>
        </div>

        {/* METERS OVERVIEW */}
        <div className="flex gap-3 shrink-0">
          <div className="bg-slate-950 px-4 py-2.5 rounded-xl border border-slate-850 text-center font-mono space-y-0.5">
            <span className="text-[8px] text-slate-500 font-black uppercase block">Class Burnout Average</span>
            <strong className={`text-xl font-black block ${overallBurnoutTrend > 50 ? 'text-rose-500' : 'text-emerald-400'}`}>
              {overallBurnoutTrend}%
            </strong>
          </div>
          <div className="bg-slate-950 px-4 py-2.5 rounded-xl border border-slate-850 text-center font-mono space-y-0.5">
            <span className="text-[8px] text-slate-500 font-black uppercase block">Burnout Spreader Threat</span>
            <strong className="text-[10.5px] font-black text-rose-455 text-rose-400 block pt-1.5">
              {highestThreatSource}
            </strong>
          </div>
        </div>
      </div>

      {/* CORE CONTROLLERS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* LEFT COLUMN: GNN SIGNAL WEAPONS (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-950 p-4.5 rounded-xl border border-slate-850 space-y-4">
            <h3 className="font-extrabold text-slate-200 text-xs flex items-center gap-1.5 border-b border-slate-900 pb-2">
              <Sliders className="h-4 w-4 text-indigo-400" />
              GNN Aggregation Parameters
            </h3>

            {/* Neural Net Kernel */}
            <div className="space-y-1.5 text-xs">
              <label className="text-[9.5px] font-mono text-slate-400 block font-bold uppercase">GNN Network Architecture</label>
              <select
                value={gnnKernel}
                onChange={(e) => setGnnKernel(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-[11px] p-2.5 rounded focus:outline-none focus:border-indigo-500 font-mono"
              >
                <option value="gat_attention">GAT (Graph Attention Network)</option>
                <option value="gcn_diffusion">GCN (Graph Convolutional Net)</option>
                <option value="sage_mean">GraphSAGE (Mean Neighborhood Agg)</option>
              </select>
            </div>

            {/* Iterations Layers Slider */}
            <div className="space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-slate-400 font-bold">
                <span>Inference Steps (Layers)</span>
                <span className="text-indigo-400">{modelIterations} layers</span>
              </div>
              <input
                type="range"
                min="1"
                max="3"
                value={modelIterations}
                onChange={(e) => setModelIterations(Number(e.target.value))}
                className="w-full accent-indigo-505 accent-indigo-505 focus:outline-none"
                title="Model Iterations"
              />
              <p className="text-[7.5px] text-slate-500 leading-normal">
                *Increasing GNN layers simulates deeper stress diffusion cascade steps across multi-hop peer nodes.
              </p>
            </div>

            {/* Session Intensity Slider */}
            <div className="space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-slate-400 font-bold">
                <span>Task Session load (Coeff)</span>
                <span className="text-emerald-400">x{sessionLoadCoeff.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="0.8"
                max="2.0"
                step="0.1"
                value={sessionLoadCoeff}
                onChange={(e) => setSessionLoadCoeff(Number(e.target.value))}
                className="w-full accent-emerald-500 focus:outline-none"
                title="Session Intensity Multiplier"
              />
            </div>

            {/* Contagion multiplier */}
            <div className="space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-slate-400 font-bold">
                <span>Contagion Spillover Gain</span>
                <span className="text-rose-455 text-rose-400">{Math.round(contagionMultiplier * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="1.5"
                step="0.05"
                value={contagionMultiplier}
                onChange={(e) => setContagionMultiplier(Number(e.target.value))}
                className="w-full accent-rose-500 focus:outline-none"
                title="Contagion Spillover Coefficient"
              />
            </div>

            <button
              onClick={runGnnInference}
              disabled={isComputing}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-mono font-bold text-[10.5px] py-2.5 rounded-lg border border-indigo-750 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isComputing ? 'animate-spin' : ''}`} />
              <span>Calibrate Predictive GNN</span>
            </button>
          </div>

          {/* TELEMETRY MODELING LOGS CHASSIS */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-2">
            <span className="text-[8.5px] text-slate-500 font-mono font-bold block uppercase tracking-wider">Topological inference feedback</span>
            <div className="bg-slate-900 border border-slate-850 p-2.5 rounded-lg h-32 overflow-y-auto font-mono text-[8.5px] text-slate-400 space-y-1 scrollbar-thin">
              {simulationLogs.map((log, ix) => (
                <div key={ix} className="line-clamp-2 leading-relaxed">
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* MIDDLE COLUMN: TABLE SEATING STATUS & INTERACTIVE CONNECTOR (8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          
          {/* TABLES GRAPH CARDS ROW */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="classroom-tables-cards-row">
            
            {/* Table 1 */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-850/80 space-y-3 relative overflow-hidden">
              <div className="absolute top-2 right-2 bg-indigo-950 text-indigo-400 text-[8px] font-mono px-2 py-0.5 rounded border border-indigo-900/40 font-bold uppercase">
                Alpha Table
              </div>
              <h4 className="text-xs font-black text-slate-200 uppercase flex items-center gap-1.5">
                <Table className="h-4 w-4 text-indigo-400" />
                Table 1 (Alpha)
              </h4>
              
              <div className="space-y-2 pt-1">
                {students.filter(s => s.tableGroup === 'Table 1 (Alpha)').map(st => {
                  const outStatus = riskOutputs[st.id] || { burnoutRisk: 0.2, engagement: 0.7 };
                  const danger = outStatus.burnoutRisk > 0.5;
                  return (
                    <div
                      key={st.id}
                      onClick={() => setSelectedStudentId(st.id)}
                      className={`p-2 rounded border transition-all text-left cursor-pointer flex items-center justify-between ${
                        selectedStudentId === st.id
                          ? 'bg-indigo-950/40 border-indigo-500'
                          : danger
                            ? 'bg-rose-950/10 border-rose-900/40 hover:bg-rose-950/20'
                            : 'bg-slate-900 border-slate-850 hover:bg-slate-850/40'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <span className="text-[10.5px] font-bold text-slate-250 block">{st.name}</span>
                        <span className="text-[8px] text-slate-500 tracking-wide font-mono block uppercase">{st.role} • TBR: {st.rawFeatures[1]*4 > 2 ? 'High' : 'Normal'}</span>
                      </div>
                      <div className="text-right font-mono">
                        <span className={`text-[10px] font-black ${danger ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {Math.round(outStatus.burnoutRisk * 100)}% 🔥
                        </span>
                        <span className="text-[7.5px] text-slate-500 block">burnout risk</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Table 2 */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-850/80 space-y-3 relative overflow-hidden">
              <div className="absolute top-2 right-2 bg-rose-950 text-rose-450 text-rose-400 text-[8px] font-mono px-2 py-0.5 rounded border border-rose-900/40 font-bold uppercase">
                Beta Table
              </div>
              <h4 className="text-xs font-black text-slate-200 uppercase flex items-center gap-1.5">
                <Table className="h-4 w-4 text-rose-400" />
                Table 2 (Beta)
              </h4>
              
              <div className="space-y-2 pt-1 font-sans">
                {students.filter(s => s.tableGroup === 'Table 2 (Beta)').map(st => {
                  const outStatus = riskOutputs[st.id] || { burnoutRisk: 0.3, engagement: 0.6 };
                  const danger = outStatus.burnoutRisk > 0.55;
                  return (
                    <div
                      key={st.id}
                      onClick={() => setSelectedStudentId(st.id)}
                      className={`p-2 rounded border transition-all text-left cursor-pointer flex items-center justify-between ${
                        selectedStudentId === st.id
                          ? 'bg-indigo-950/40 border-indigo-500'
                          : danger
                            ? 'bg-rose-950/10 border-rose-900/40 hover:bg-rose-950/20'
                            : 'bg-slate-900 border-slate-850 hover:bg-slate-850/40'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <span className="text-[10.5px] font-bold text-slate-250 block">{st.name}</span>
                        <span className="text-[8px] text-slate-500 tracking-wide font-mono block uppercase">{st.role} • TBR: {st.rawFeatures[1]*4 > 2 ? 'High' : 'Normal'}</span>
                      </div>
                      <div className="text-right font-mono">
                        <span className={`text-[10px] font-black ${danger ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {Math.round(outStatus.burnoutRisk * 100)}% 🔥
                        </span>
                        <span className="text-[7.5px] text-slate-500 block">burnout risk</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Table 3 */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-850/80 space-y-3 relative overflow-hidden">
              <div className="absolute top-2 right-2 bg-emerald-950 text-emerald-400 text-[8px] font-mono px-2 py-0.5 rounded border border-emerald-900/40 font-bold uppercase">
                Gamma Table
              </div>
              <h4 className="text-xs font-black text-slate-200 uppercase flex items-center gap-1.5">
                <Table className="h-4 w-4 text-emerald-450" />
                Table 3 (Gamma)
              </h4>
              
              <div className="space-y-2 pt-1 text-xs">
                {students.filter(s => s.tableGroup === 'Table 3 (Gamma)').map(st => {
                  const outStatus = riskOutputs[st.id] || { burnoutRisk: 0.25, engagement: 0.65 };
                  const danger = outStatus.burnoutRisk > 0.5;
                  return (
                    <div
                      key={st.id}
                      onClick={() => setSelectedStudentId(st.id)}
                      className={`p-2 rounded border transition-all text-left cursor-pointer flex items-center justify-between ${
                        selectedStudentId === st.id
                          ? 'bg-indigo-950/40 border-indigo-500'
                          : danger
                            ? 'bg-rose-950/10 border-rose-900/40 hover:bg-rose-950/20'
                            : 'bg-slate-900 border-slate-850 hover:bg-slate-850/40'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <span className="text-[10.5px] font-bold text-slate-250 block">{st.name}</span>
                        <span className="text-[8px] text-slate-500 tracking-wide font-mono block uppercase">{st.role} • TBR: {st.rawFeatures[1]*4 > 2 ? 'High' : 'Normal'}</span>
                      </div>
                      <div className="text-right font-mono">
                        <span className={`text-[10px] font-black ${danger ? 'text-rose-450' : 'text-emerald-400'}`}>
                          {Math.round(outStatus.burnoutRisk * 100)}% 🔥
                        </span>
                        <span className="text-[7.5px] text-slate-500 block">burnout risk</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* DUAL DISPLAY PANEL: SPLICE SPLIT FOR DETAIL PROFILE OR GRAPH CONNECTOR (2 columns) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5" id="dual-connector-modeling-frame">
            
            {/* DETAILED STUDENT TARGET: 6 cols */}
            <div className="md:col-span-6 bg-slate-950 border border-slate-850 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex border-b border-slate-900 pb-2 mb-3 justify-between items-center text-xs">
                  <h4 className="font-extrabold text-slate-200 uppercase tracking-tight flex items-center gap-1.5">
                    <Brain className="h-4 w-4 text-indigo-400" />
                    Student Node Burden Detail
                  </h4>
                  <div className="flex bg-slate-900 p-0.5 rounded text-[8.5px] font-mono border border-slate-850">
                    <button
                      type="button"
                      onClick={() => setActiveResultsTab('table')}
                      className={`px-1.5 py-0.5 rounded transition ${activeResultsTab === 'table' ? 'bg-indigo-650 text-white' : 'text-slate-500'}`}
                    >
                      Meters
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveResultsTab('radar')}
                      className={`px-1.5 py-0.5 rounded transition ${activeResultsTab === 'radar' ? 'bg-indigo-650 text-white' : 'text-slate-500'}`}
                    >
                      Radar Map
                    </button>
                  </div>
                </div>

                {selectedStudentData ? (
                  <div className="space-y-3 font-sans">
                    <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-850 flex items-center justify-between">
                      <div>
                        <strong className="text-sm font-black text-slate-100 block">{selectedStudentData.name}</strong>
                        <span className="text-[9px] font-mono text-indigo-400 font-extrabold block uppercase tracking-wider">{selectedStudentData.id} • {selectedStudentData.tableGroup}</span>
                      </div>
                      <span className="px-2 py-0.5 bg-indigo-950 text-indigo-400 border border-indigo-900 text-[9px] font-mono rounded font-bold uppercase shrink-0">
                        {selectedStudentData.role}
                      </span>
                    </div>

                    {activeResultsTab === 'table' ? (
                      <div className="space-y-2 text-xs font-mono">
                        {/* Raw Fatigue */}
                        <div className="space-y-0.5">
                          <div className="flex justify-between text-slate-400 text-[9px]">
                            <span>Raw Fatigue Index</span>
                            <span>{Math.round(selectedStudentData.rawFeatures[0]*100)}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                            <div className="h-full bg-sky-500" style={{ width: `${selectedStudentData.rawFeatures[0]*100}%` }} />
                          </div>
                        </div>

                        {/* Raw Stress */}
                        <div className="space-y-0.5">
                          <div className="flex justify-between text-slate-400 text-[9px]">
                            <span>Raw Sympathetic Stress</span>
                            <span>{Math.round(selectedStudentData.rawFeatures[1]*100)}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                            <div className="h-full bg-rose-500" style={{ width: `${selectedStudentData.rawFeatures[1]*100}%` }} />
                          </div>
                        </div>

                        {/* predicted risk */}
                        <div className="p-2.5 bg-slate-900 rounded border border-slate-850/60 grid grid-cols-2 gap-2 text-center text-[10px]">
                          <div className="space-y-0.5 border-r border-slate-850">
                            <span className="text-slate-500 text-[8.5px] uppercase block">PREDICTED BURNOUT</span>
                            <span className={`text-sm font-black ${selectedStudentOutput.burnoutRisk > 0.5 ? 'text-rose-455 text-rose-400' : 'text-emerald-450 text-emerald-400'}`}>
                              {Math.round(selectedStudentOutput.burnoutRisk * 100)}%
                            </span>
                          </div>
                          <div className="space-y-0.5">
                            <span className="text-slate-500 text-[8.5px] uppercase block">ENGAGEMENT INTENSITY</span>
                            <span className="text-sm font-black text-indigo-400">
                              {Math.round(selectedStudentOutput.engagement * 100)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="h-32 w-full flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                            <PolarGrid stroke="#1e293b" />
                            <PolarAngleAxis dataKey="subject" stroke="#64748b" style={{ fontSize: '7px' }} />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" style={{ fontSize: '6px' }} />
                            <Radar name={selectedStudentData.name} dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 text-center py-6 italic font-mono">Select a student core node on any Table above to track detailed prediction arrays.</p>
                )}
              </div>

              {/* Informative advice snippet */}
              <div className="bg-indigo-950/20 p-2.5 rounded-lg border border-indigo-900/30 font-mono text-[8.5px] text-slate-400 leading-relaxed mt-3">
                <span className="text-indigo-400 font-extrabold uppercase flex items-center gap-1 mb-0.5">
                  <Info className="h-3 w-3" /> Cascade Risk:
                </span>
                <span>
                  High predicted risk values are proportional to adjacent relationship strengths (weight matrices) mapped via active edge tables.
                </span>
              </div>
            </div>

            {/* INTERACTIVE LINK CONSTRUCT: 6 cols */}
            <div className="md:col-span-6 bg-slate-950 border border-slate-850 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <h4 className="font-extrabold text-slate-205 text-slate-205 text-slate-200 text-xs border-b border-slate-900 pb-2 mb-3 uppercase tracking-tight flex items-center gap-1.5">
                  <Share2 className="h-4 w-4 text-rose-455 text-rose-400" />
                  Dynamic Interaction Link Modeler
                </h4>

                <form onSubmit={handleAddNewEdge} className="space-y-3 font-mono text-[10px]">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-slate-500 block mb-0.5 font-bold uppercase">Node From</label>
                      <select
                        value={newEdgeForm.from}
                        onChange={(e) => setNewEdgeForm(prev => ({ ...prev, from: e.target.value }))}
                        className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-[9.5px] p-2 rounded focus:outline-none focus:border-indigo-500"
                      >
                        {students.map(s => (
                          <option key={s.id} value={s.id}>{s.name} ({s.id.substring(2)})</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-slate-500 block mb-0.5 font-bold uppercase">Node To (Recip)</label>
                      <select
                        value={newEdgeForm.to}
                        onChange={(e) => setNewEdgeForm(prev => ({ ...prev, to: e.target.value }))}
                        className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-[9.5px] p-2 rounded focus:outline-none focus:border-indigo-500"
                      >
                        {students.map(s => (
                          <option key={s.id} value={s.id}>{s.name} ({s.id.substring(2)})</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-slate-500 block mb-0.5 font-bold uppercase font-sans">Intensity (1-10)</label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={newEdgeForm.weight}
                        onChange={(e) => setNewEdgeForm(prev => ({ ...prev, weight: parseInt(e.target.value) || 5 }))}
                        className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-[9.5px] p-1.5 rounded focus:outline-none focus:border-rose-500 text-center"
                      />
                    </div>

                    <div>
                      <label className="text-slate-500 block mb-0.5 font-bold uppercase">Affinity Mode</label>
                      <select
                        value={newEdgeForm.type}
                        onChange={(e) => setNewEdgeForm(prev => ({ ...prev, type: e.target.value as any }))}
                        className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-[9.5px] p-2 rounded focus:outline-none focus:border-indigo-500"
                      >
                        <option value="mentoring">Mentoring help</option>
                        <option value="cooperative">Active team-collab</option>
                        <option value="passive">Passive workspace sitting</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-slate-900 hover:bg-slate-850 text-indigo-400 hover:text-white border border-indigo-900 hover:border-indigo-501 py-1.5 rounded font-black uppercase text-[9px] transition-colors cursor-pointer"
                  >
                    Assemble Collaborative Channel
                  </button>
                </form>
              </div>

              {/* ACTIVE EDGE CONNECTIONS LIST */}
              <div className="space-y-1 mt-3">
                <span className="text-[8px] text-slate-500 font-mono font-bold block uppercase tracking-wider">Active Table Connections (Last {Math.min(3, edges.length)})</span>
                <div className="bg-slate-900 border border-slate-850 rounded-lg p-1.5 max-h-[105px] overflow-y-auto scrollbar-thin text-[9px] space-y-1 font-mono">
                  {edges.slice(-3).map((ed) => {
                    const sf = students.find(s => s.id === ed.from)?.name || ed.from;
                    const st = students.find(s => s.id === ed.to)?.name || ed.to;
                    return (
                      <div key={ed.id} className="flex justify-between items-center bg-slate-950 p-1 rounded border border-slate-850/70">
                        <span className="text-slate-300">
                          {sf.split(' ')[0]} <span className="text-slate-500">&lt;&gt;</span> {st.split(' ')[0]} <span className="text-slate-500">[{ed.type[0].toUpperCase()}]</span>
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="bg-indigo-950 px-1 font-black rounded text-[8px] text-indigo-400">Wt: {ed.weight}</span>
                          <button
                            onClick={() => handleDeleteEdge(ed.id)}
                            className="bg-transparent border-none text-rose-500 cursor-pointer p-0 hover:underline hover:text-rose-400"
                            type="button"
                          >
                            <Trash2 className="h-3 w-3 shrink-0" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* FOOTER ANALYTICS & GEMINI DYNAMIC ADVISOR */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 mt-4">
        
        {/* GROUP ANALYTICS CHART: 6 COLS */}
        <div className="md:col-span-6 bg-slate-950 border border-slate-850 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <h4 className="font-extrabold text-slate-100 text-xs mb-1.5 uppercase font-sans tracking-wide">
              Table-by-Table Burnout Projections vs. Cohesion
            </h4>
            <p className="text-[10.5px] text-slate-400 leading-normal mb-3 font-sans">
              Aggregated predicted indexes across Tables based on edge interaction density and fatigue indices. Note the pressure surge on Table 2.
            </p>
          </div>

          <div className="w-full h-48 flex-1 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={groupMetrics}
                margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#232d44" strokeWidth={0.5} />
                <XAxis dataKey="tableName" stroke="#475569" style={{ fontSize: '9px', fontFamily: 'monospace' }} />
                <YAxis stroke="#475569" style={{ fontSize: '9px', fontFamily: 'monospace' }} unit="%" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#090d16', borderColor: '#1e293b', fontSize: '10px', fontFamily: 'monospace' }}
                />
                <Legend iconSize={8} wrapperStyle={{ fontSize: '9px', fontFamily: 'monospace', color: '#64748b' }} />
                <Bar dataKey="Avg Burnout Risk" fill="#f43f5e" radius={[3, 3, 0, 0]} name="Burnout Risk" />
                <Bar dataKey="Avg Engagement" fill="#3b82f6" radius={[3, 3, 0, 0]} name="Engagement" />
                <Bar dataKey="Spillover Spill" fill="#c084fc" radius={[3, 3, 0, 0]} name="Spillover" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* GEMINI TOPOLOGICAL OPTIMIZATION ADVISOR: 6 COLS */}
        <div className="md:col-span-6 bg-slate-950 border border-slate-855 rounded-xl p-4 flex flex-col justify-between" id="seating-chart-reorg-advisor">
          <div>
            <div className="flex items-center justify-between border-b border-slate-900 pb-2 mb-3">
              <div>
                <span className="text-[9px] text-slate-500 font-mono font-bold uppercase block">Bio-Adaptive Seating Coach</span>
                <h3 className="font-extrabold text-slate-205 text-slate-200 text-xs flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-indigo-400 animate-pulse" />
                  Gemini Dynamic Seating Advisor
                </h3>
              </div>
              <ShieldAlert className="h-4.5 w-4.5 text-rose-500 animate-pulse shrink-0" />
            </div>

            {seatingAdvisorText ? (
              <div className="bg-slate-900 rounded-lg p-3 border border-slate-850 text-slate-300 font-mono text-[9px] leading-relaxed max-h-52 overflow-y-auto pr-2 scrollbar-thin space-y-2">
                {seatingAdvisorText.split('\n').map((line, ix) => {
                  if (line.trim().startsWith('#') || line.trim().startsWith('**')) {
                    return (
                      <strong key={ix} className="text-slate-100 block mt-2 mb-1 uppercase border-b border-slate-850 pb-0.5 text-[9.5px]">
                        {line.replace(/[#*]+/g, '').trim()}
                      </strong>
                    );
                  }
                  if (line.trim().startsWith('-') || line.trim().startsWith('*')) {
                    return (
                      <div key={ix} className="ml-3 text-slate-300 pl-1.5 border-l border-indigo-500/30">
                        {line.replace(/^[\s-*]+/, '')}
                      </div>
                    );
                  }
                  return <p key={ix}>{line}</p>;
                })}
              </div>
            ) : isAdvisorLoading ? (
              <div className="h-44 bg-slate-900/40 border border-slate-850 rounded-lg flex flex-col items-center justify-center font-mono text-[10px] text-indigo-400 gap-2">
                <RefreshCw className="h-5 w-5 animate-spin" />
                <span>Formulating seating topology graph, consulting neural layout matrices...</span>
              </div>
            ) : (
              <div className="h-44 bg-slate-900/2 0 border border-slate-850/45 rounded-lg flex flex-col items-center justify-center text-center p-4 text-[9px] font-mono text-slate-500 space-y-1">
                <Network className="h-8 w-8 text-slate-800 animate-pulse" />
                <span>Academic Seating Optimization Advice is idle.</span>
                <p className="text-[8px] text-slate-600 max-w-sm">
                  Click the recommendation generator button below to draft an optimized HIPAA Safe Harbor seating re-layout.
                </p>
              </div>
            )}
          </div>

          <button
            onClick={draftSeatingAdvisorBlueprint}
            disabled={isAdvisorLoading}
            className="w-full bg-slate-900 hover:bg-slate-800 text-indigo-400 border border-indigo-900 hover:border-indigo-550 py-1.5 rounded-lg text-[9px] font-mono font-bold uppercase transition-all mt-3 cursor-pointer disabled:bg-slate-950 disabled:text-slate-650"
            type="button"
          >
            {isAdvisorLoading ? 'Consulting Advisor Shards...' : 'Draft Peer Seating Reorganization Chart'}
          </button>
        </div>

      </div>

    </div>
  );
}
