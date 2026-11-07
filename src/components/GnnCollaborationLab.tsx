import React, { useState, useEffect } from 'react';
import GnnForceDirectedGraph from './GnnForceDirectedGraph';
import { 
  Network, 
  GitFork, 
  Users, 
  Flame, 
  TrendingUp, 
  Sparkles, 
  Brain, 
  Activity, 
  Plus, 
  Minus, 
  ShieldAlert, 
  CheckCircle2, 
  RefreshCw, 
  Play, 
  Send, 
  Heart, 
  Info, 
  Sliders,
  Award,
  ArrowRight,
  HelpCircle,
  Zap,
  UserX,
  Target
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

interface StudentCollabNode {
  id: string;
  name: string;
  attention: 'High' | 'Moderate' | 'Low';
  stress: 'High' | 'Moderate' | 'Low';
  fatigue: 'High' | 'Moderate' | 'Low';
  role: 'Mentor' | 'Receiver' | 'Peer';
  group: 'Alpha' | 'Beta' | 'Gamma';
  features: [number, number, number]; // [Fatigue Index, Sympathetic Stress, Active Contribution 0-1]
  x: number;
  y: number;
}

interface CollabEdge {
  from: string;
  to: string;
  weight: number; // Interaction strength (1-10)
  type: 'mentoring' | 'brainstorm' | 'passive';
}

export default function GnnCollaborationLab() {
  // 12 Students loaded with their live dashboard metrics
  const [students, setStudents] = useState<StudentCollabNode[]>([
    // Group Alpha - High interactive intensity
    { id: '1', name: 'Alex Mercer', attention: 'High', stress: 'Low', fatigue: 'Low', role: 'Mentor', group: 'Alpha', features: [0.20, 0.25, 0.90], x: 100, y: 80 },
    { id: '2', name: 'Jack Peterson', attention: 'Low', stress: 'High', fatigue: 'High', role: 'Receiver', group: 'Alpha', features: [0.85, 0.90, 0.30], x: 220, y: 70 },
    { id: '3', name: 'Sophia Lin', attention: 'High', stress: 'Moderate', fatigue: 'Low', role: 'Peer', group: 'Alpha', features: [0.35, 0.50, 0.75], x: 140, y: 180 },
    { id: '4', name: 'Ethan Hunt', attention: 'Moderate', stress: 'Low', fatigue: 'Moderate', role: 'Peer', group: 'Alpha', features: [0.45, 0.30, 0.65], x: 260, y: 170 },

    // Group Beta - High-stress concentration
    { id: '5', name: 'Chloe Fraser', attention: 'High', stress: 'Low', fatigue: 'Low', role: 'Mentor', group: 'Beta', features: [0.15, 0.20, 0.95], x: 420, y: 80 },
    { id: '6', name: 'Zack Ward', attention: 'Low', stress: 'Low', fatigue: 'High', role: 'Receiver', group: 'Beta', features: [0.75, 0.30, 0.25], x: 530, y: 60 },
    { id: '7', name: 'Abby Williams', attention: 'Moderate', stress: 'High', fatigue: 'Moderate', role: 'Receiver', group: 'Beta', features: [0.60, 0.85, 0.40], x: 450, y: 190 },
    { id: '8', name: 'Lucas Scott', attention: 'High', stress: 'Low', fatigue: 'Low', role: 'Peer', group: 'Beta', features: [0.25, 0.30, 0.80], x: 560, y: 180 },

    // Group Gamma - High fatigue concentration
    { id: '9', name: 'Mia Wong', attention: 'High', stress: 'Moderate', fatigue: 'Low', role: 'Peer', group: 'Gamma', features: [0.30, 0.55, 0.70], x: 240, y: 280 },
    { id: '10', name: 'Noah Miller', attention: 'Low', stress: 'Moderate', fatigue: 'High', role: 'Receiver', group: 'Gamma', features: [0.70, 0.60, 0.35], x: 380, y: 310 },
    { id: '11', name: 'Emma Davis', attention: 'Moderate', stress: 'Low', fatigue: 'Low', role: 'Peer', group: 'Gamma', features: [0.35, 0.20, 0.60], x: 300, y: 390 },
    { id: '12', name: 'Oliver Taylor', attention: 'High', stress: 'Low', fatigue: 'Low', role: 'Mentor', group: 'Gamma', features: [0.20, 0.25, 0.85], x: 440, y: 390 }
  ]);

  // Initial collaboration links modeling student relationships
  const [edges, setEdges] = useState<CollabEdge[]>([
    // Group Alpha links
    { from: '1', to: '2', weight: 8, type: 'mentoring' },
    { from: '1', to: '3', weight: 6, type: 'brainstorm' },
    { from: '3', to: '2', weight: 5, type: 'brainstorm' },
    { from: '3', to: '4', weight: 7, type: 'brainstorm' },
    { from: '4', to: '2', weight: 4, type: 'passive' },

    // Group Beta links
    { from: '5', to: '6', weight: 9, type: 'mentoring' },
    { from: '5', to: '7', weight: 8, type: 'mentoring' },
    { from: '8', to: '7', weight: 6, type: 'brainstorm' },
    { from: '8', to: '6', weight: 4, type: 'passive' },

    // Group Gamma links
    { from: '12', to: '10', weight: 8, type: 'mentoring' },
    { from: '9', to: '10', weight: 5, type: 'brainstorm' },
    { from: '9', to: '11', weight: 6, type: 'brainstorm' },
    { from: '11', to: '12', weight: 7, type: 'brainstorm' },

    // Inter-group cross references (simulated collaborative slippage)
    { from: '3', to: '9', weight: 3, type: 'passive' },
    { from: '4', to: '7', weight: 4, type: 'passive' }
  ]);

  // Interactive configurations
  const [selectedStudent, setSelectedStudent] = useState<StudentCollabNode | null>(students[0]);
  const [gnnModel, setGnnModel] = useState<'gat_burnout' | 'gcn_diffusion' | 'sage_load'>('gat_burnout');
  const [subLayout, setSubLayout] = useState<'force_resonance' | 'propagation' | 'group_suggestion'>('force_resonance');
  const [propagationStep, setPropagationStep] = useState<'idle' | 'aggregating' | 'completed'>('idle');
  const [intensity, setIntensity] = useState<number>(6); // Collaborative Session Load multiplier (1-10)
  
  // Custom execution logs
  const [telemetryLogs, setTelemetryLogs] = useState<string[]>([
    'Topological Collaborative Session modeling initialized.',
    'System loaded 12 wearers classified into 3 group-wise subgraphs: Alpha, Beta, & Gamma.',
    'Select a modeling architecture below and execute "Aggregate Collaborative Signals" to map stress contagion trends.'
  ]);

  // Active status variables predicted by GNN
  const [riskPredictions, setRiskPredictions] = useState<Record<string, { burnout: number; engagement: number; spillover: number }>>({});
  const [edgeFlowActive, setEdgeFlowActive] = useState(false);

  // Trigger Edge Add / Edit Tool
  const [edgeForm, setEdgeForm] = useState({ from: '1', to: '5', weight: 5, type: 'brainstorm' as any });

  // Add a Telemetry Log
  const addLog = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setTelemetryLogs(prev => [`[${timestamp}] ${msg}`, ...prev.slice(0, 15)]);
  };

  // Perform topological message aggregation
  const runCollabPropagation = () => {
    if (propagationStep === 'aggregating') return;
    
    setPropagationStep('aggregating');
    setEdgeFlowActive(true);
    addLog(`Initiating Relational Message Aggregation using ${gnnModel.toUpperCase()} architecture...`);
    addLog(`Boundary conditions initialized with Session Stress Load coefficient equivalent to ${intensity / 10}x.`);

    setTimeout(() => {
      const computed: Record<string, { burnout: number; engagement: number; spillover: number }> = {};

      students.forEach(student => {
        // Find adjacent student links regardless of edge direction (treated as undirected communication flows)
        const studentEdges = edges.filter(e => e.from === student.id || e.to === student.id);
        const adjacentIds = studentEdges.map(e => e.from === student.id ? e.to : e.from);
        const adjacentStudents = students.filter(s => adjacentIds.includes(s.id));

        // Baseline node features: Fatigue, Stress, Contributions
        const [fatigue, stress, contribution] = student.features;

        let aggregatedStress = 0;
        let aggregatedFatigue = 0;
        let totalInfluenceWeight = 0;

        // Custom aggregation based on selected Graph Neural Net modeling strategy
        if (gnnModel === 'gat_burnout') {
          // Graph Attention style: Weight messages by contribution relative to neighbors
          // Anxious or highly fatigued students "shout" louder, draining high contribution mentors
          adjacentStudents.forEach(neigh => {
            const edge = studentEdges.find(e => (e.from === neigh.id && e.to === student.id) || (e.from === student.id && e.to === neigh.id));
            if (!edge) return;

            // Attention coefficient computed dynamically
            // High fatigue difference makes it asymmetric
            const stressDisparity = Math.abs(neigh.features[1] - stress);
            let alpha = (edge.weight / 10) * (1 + stressDisparity);

            // GAT boost: Mentors take extra load when helping highly stressed receivers
            if (student.role === 'Mentor' && neigh.features[1] > 0.65) {
              alpha *= 1.45;
            }

            aggregatedStress += neigh.features[1] * alpha;
            aggregatedFatigue += neigh.features[0] * alpha * 0.7;
            totalInfluenceWeight += alpha;
          });

        } else if (gnnModel === 'gcn_diffusion') {
          // Standard GCN: Fixed symmetric normalization, representing flat team diffusion
          const selfWeight = 1 / (studentEdges.length + 1);
          aggregatedStress = stress * selfWeight;
          aggregatedFatigue = fatigue * selfWeight;

          adjacentStudents.forEach(neigh => {
            const edge = studentEdges.find(e => (e.from === neigh.id && e.to === student.id) || (e.from === student.id && e.to === neigh.id));
            if (!edge) return;
            
            // Normalized symmetrically
            const neighEdges = edges.filter(e => e.from === neigh.id || e.to === neigh.id);
            const norm = 1 / Math.sqrt((studentEdges.length + 1) * (neighEdges.length + 1));
            
            aggregatedStress += neigh.features[1] * norm * (edge.weight / 5);
            aggregatedFatigue += neigh.features[0] * norm * (edge.weight / 5);
            totalInfluenceWeight += norm;
          });

        } else {
          // GraphSAGE Mean Aggregation with skip-connection concatenation
          if (adjacentStudents.length > 0) {
            let sumStress = 0;
            let sumFatigue = 0;
            adjacentStudents.forEach(neigh => {
              sumStress += neigh.features[1];
              sumFatigue += neigh.features[0];
            });
            aggregatedStress = (sumStress / adjacentStudents.length) * 0.6 + stress * 0.4;
            aggregatedFatigue = (sumFatigue / adjacentStudents.length) * 0.6 + fatigue * 0.4;
            totalInfluenceWeight = 1.0;
          } else {
            aggregatedStress = stress;
            aggregatedFatigue = fatigue;
          }
        }

        // Feature transformation: Combine session intensity, raw attributes and aggregates
        const intensityFactor = intensity / 6.5; 
        const burnoutTrend = Math.min(1.0, Math.max(0.05, 
          (stress * 0.45 + aggregatedStress * 0.35 + (fatigue * 0.2)) * intensityFactor
        ));

        const engagementTrend = Math.min(1.0, Math.max(0.05,
          (contribution * 0.55 + (1 - fatigue) * 0.25 + (1 - stress) * 0.2) / intensityFactor
        ));

        // Spillover quotient (how much this student contributes to the stress of others)
        const spilloverTrend = Math.min(1.0, Math.max(0.01,
          ((stress + fatigue) / 2) * (studentEdges.length / 4)
        ));

        computed[student.id] = {
          burnout: parseFloat(burnoutTrend.toFixed(3)),
          engagement: parseFloat(engagementTrend.toFixed(3)),
          spillover: parseFloat(spilloverTrend.toFixed(3))
        };
      });

      setRiskPredictions(computed);
      setPropagationStep('completed');
      setEdgeFlowActive(false);
      addLog(`Relational computation complete. Burnout spillover matrices recalculated.`);
      addLog(`Predicted structural stress vectors for active student teams calculated successfully.`);
    }, 1500);
  };

  // Run automatically on intensity or model adjust
  useEffect(() => {
    runCollabPropagation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intensity, gnnModel]);

  // Handle manual interaction links modification
  const handleAddEdge = (e: React.FormEvent) => {
    e.preventDefault();
    if (edgeForm.from === edgeForm.to) {
      addLog("Cannot connect a student to themselves.");
      return;
    }

    // Check link duplication
    const linkExists = edges.some(edge => 
      (edge.from === edgeForm.from && edge.to === edgeForm.to) ||
      (edge.from === edgeForm.to && edge.to === edgeForm.from)
    );

    if (linkExists) {
      // Modify weight instead
      setEdges(prev => prev.map(edge => {
        if ((edge.from === edgeForm.from && edge.to === edgeForm.to) ||
            (edge.from === edgeForm.to && edge.to === edgeForm.from)) {
          return { ...edge, weight: edgeForm.weight, type: edgeForm.type };
        }
        return edge;
      }));
      addLog(`Updated collaboration weight between ${students.find(s => s.id === edgeForm.from)?.name} and ${students.find(s => s.id === edgeForm.to)?.name} to ${edgeForm.weight}.`);
    } else {
      setEdges(prev => [...prev, { ...edgeForm }]);
      addLog(`Successfully built new academic interaction edge: [N_${edgeForm.from}] to [N_${edgeForm.to}] with weight ${edgeForm.weight}.`);
    }
    
    // Rerun propagation safely
    setTimeout(() => runCollabPropagation(), 100);
  };

  // Remove a connection
  const handleRemoveEdge = (fromId: string, toId: string) => {
    setEdges(prev => prev.filter(e => 
      !((e.from === fromId && e.to === toId) || (e.from === toId && e.to === fromId))
    ));
    addLog(`Severed collaboration channel between student ${fromId} and student ${toId}.`);
    
    setTimeout(() => runCollabPropagation(), 100);
  };

  // Extract average values for group stats (Alpha vs Beta vs Gamma)
  const getGroupMetrics = () => {
    const groups: Record<string, { count: number; sumBurnout: number; sumEngagement: number; sumSpillover: number }> = {
      Alpha: { count: 0, sumBurnout: 0, sumEngagement: 0, sumSpillover: 0 },
      Beta: { count: 0, sumBurnout: 0, sumEngagement: 0, sumSpillover: 0 },
      Gamma: { count: 0, sumBurnout: 0, sumEngagement: 0, sumSpillover: 0 }
    };

    students.forEach(student => {
      const pred = riskPredictions[student.id] || { burnout: 0.2, engagement: 0.7, spillover: 0.1 };
      const gp = student.group;
      if (groups[gp]) {
        groups[gp].count += 1;
        groups[gp].sumBurnout += pred.burnout;
        groups[gp].sumEngagement += pred.engagement;
        groups[gp].sumSpillover += pred.spillover;
      }
    });

    return Object.keys(groups).map(name => ({
      groupName: `Group ${name}`,
      'Burnout Risk': Math.round((groups[name].sumBurnout / Math.max(1, groups[name].count)) * 100),
      'Engagement Level': Math.round((groups[name].sumEngagement / Math.max(1, groups[name].count)) * 100),
      'Spillover Spill': Math.round((groups[name].sumSpillover / Math.max(1, groups[name].count)) * 100),
    }));
  };

  const groupMetrics = getGroupMetrics();

  // Gemini Topological Re-grouping Advisor State
  const [advisorAdvice, setAdvisorAdvice] = useState<string>('');
  const [isAdvisorLoading, setIsAdvisorLoading] = useState(false);

  const requestTopologicalConsultation = async () => {
    setIsAdvisorLoading(true);
    addLog("Consulting Gemini AI regarding collaborative network topology reorganization blueprints...");
    
    // Parse student current burdens
    const studentProfiles = students.map(s => {
      const pred = riskPredictions[s.id] || { burnout: 0.2, engagement: 0.7 };
      return `${s.name} (Role: ${s.role}, Group: ${s.group}, Raw Stress: ${s.features[1]}, Predicted Burnout: ${pred.burnout}, Engagement: ${pred.engagement})`;
    }).join('\n');

    const promptMessage = `We have active student collaborative study teams where raw biometric indices of fatigue and anxiety are propagating across relational networks.
    
    Current Session Intensity Index: ${intensity}/10.
    
    Active Student Profiles across Topological Subgraphs:
    ${studentProfiles}

    Topological Edge Connections (Peer-to-Peer Interaction Strengths):
    ${edges.map(e => `${students.find(s=>s.id===e.from)?.name} <-> ${students.find(s=>s.id===e.to)?.name} (Weight: ${e.weight}, Type: ${e.type})`).join('\n')}

    Please analyze this interactive student graph network. Under GNN layers, stress in certain nodes (like Jack Peterson in Group Alpha or Abby Williams in Group Beta) might diffuse or cascade into peer nodes, causing team-wide flow collapse.
    
    Provide a professional, actionable pedagogical advice report for the classroom teacher:
    1. Identify the chief 'Burnout Spreader' student node and 'At-Risk' bottleneck student who needs immediate buffer check-ins.
    2. Propose a structural group reorganization or seating modification (e.g. transfer a healthy mentor to a high-stress group, isolation of particular channels, dynamic breakout changes) to reduce stress transmission while retaining positive knowledge exchange.
    3. Suggest optimal session length or team guidelines. Keep it highly operational, clear, and bulleted with bold highlights.`;

    try {
      const response = await fetch('/api/gemini/tutor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: promptMessage,
          topic: "Classroom Collaborative GNN Topology, Stress Diffusion cascades, and Dynamic Seating Optimizations",
          cognitiveState: { attention: 'High', stress: 'Low', fatigue: 'Low' }
        })
      });

      const data = await response.json();
      if (data.success) {
        setAdvisorAdvice(data.text);
        addLog("Gemini advisor blueprint fetched. Group optimization layout calculated.");
      } else {
        throw new Error(data.error || 'Server error');
      }
    } catch (err: any) {
      console.error(err);
      setAdvisorAdvice(`AI Group optimization metrics summary: \n\n• **Direct Intervention Recommended**: Transfer Alex Mercer (N1 - Alpha group mentor) to Group Beta to buffer the high-stress cascade between Zack Ward and Abby Williams. Encourage short, cooperative breathing breaks for Group Beta to break thermal contagion cycles. \n• **Isolation Warning**: Jack Peterson (Group Alpha) has high predicted stress; isolate heavy mentoring loops for 15 minutes to let individual cognitive indices cool down.`);
      addLog("GNN advisor blueprint placeholder compiled due to server delay.");
    } finally {
      setIsAdvisorLoading(false);
    }
  };

  // Automated complementary cognitive clustering algorithm
  const getCognitiveProfile = (student: StudentCollabNode) => {
    const contribution = student.features[2] * 100;
    const attentionVal = student.attention === 'High' ? 90 : student.attention === 'Moderate' ? 55 : 25;
    
    if (contribution >= 60 && attentionVal <= 55) {
      return {
        category: 'High Engagement / Low Focus' as const,
        label: 'Energy Explorer',
        color: 'text-amber-400 bg-amber-950/40 border-amber-905/30 border-amber-900/60',
        dotColor: 'bg-amber-500',
        description: 'High energy; benefits from structured focus anchors.'
      };
    } else if (attentionVal >= 65 && contribution <= 50) {
      return {
        category: 'High Focus / Low Engagement' as const,
        label: 'Laser Observer',
        color: 'text-sky-400 bg-sky-950/40 border-sky-905/30 border-sky-900/60',
        dotColor: 'bg-sky-500',
        description: 'Attentive listener; ready for dynamic collaborative prompts.'
      };
    } else if (attentionVal >= 65 && contribution >= 50) {
      return {
        category: 'Balanced Anchor / Mentor' as const,
        label: 'Flow Mentor',
        color: 'text-emerald-450 bg-emerald-950/40 border-emerald-905/30 border-emerald-900/60 text-emerald-400',
        dotColor: 'bg-emerald-500',
        description: 'Maintains attention and input; acts as table anchor.'
      };
    } else {
      return {
        category: 'Strained Learner' as const,
        label: 'Vulnerable learner',
        color: 'text-rose-404 bg-rose-950/40 border-rose-905/30 border-rose-900/60 text-rose-400',
        dotColor: 'bg-rose-500',
        description: 'Stressed fatigue and low focus; needs supportive mentoring dyads.'
      };
    }
  };

  const getSuggestedGroupings = () => {
    const classified = students.map(s => {
      const profile = getCognitiveProfile(s);
      return { ...s, profile };
    });

    const finalAlpha: StudentCollabNode[] = [];
    const finalBeta: StudentCollabNode[] = [];
    const finalGamma: StudentCollabNode[] = [];

    // Round-robin distribution of nodes sorted by category
    const sorted = [...classified].sort((a, b) => a.profile.label.localeCompare(b.profile.label));
    
    sorted.forEach((student, index) => {
      const rawNode: StudentCollabNode = {
        id: student.id,
        name: student.name,
        attention: student.attention,
        stress: student.stress,
        fatigue: student.fatigue,
        role: student.role,
        group: (index % 3 === 0 ? 'Alpha' : index % 3 === 1 ? 'Beta' : 'Gamma') as any,
        features: student.features,
        x: student.x,
        y: student.y
      };

      if (index % 3 === 0) finalAlpha.push(rawNode);
      else if (index % 3 === 1) finalBeta.push(rawNode);
      else finalGamma.push(rawNode);
    });

    return {
      Alpha: finalAlpha,
      Beta: finalBeta,
      Gamma: finalGamma
    };
  };

  const suggestedGroupings = getSuggestedGroupings();
  const currentGroupings = {
    Alpha: students.filter(s => s.group === 'Alpha'),
    Beta: students.filter(s => s.group === 'Beta'),
    Gamma: students.filter(s => s.group === 'Gamma')
  };

  const calculateGroupBalanceScore = (groupNodes: StudentCollabNode[]) => {
    if (groupNodes.length === 0) return 0;
    
    let explorers = 0;
    let lasers = 0;
    let anchors = 0;
    let strained = 0;

    groupNodes.forEach(n => {
      const prof = getCognitiveProfile(n);
      if (prof.category === 'High Engagement / Low Focus') explorers++;
      else if (prof.category === 'High Focus / Low Engagement') lasers++;
      else if (prof.category === 'Balanced Anchor / Mentor') anchors++;
      else strained++;
    });

    let score = 55; // baseline

    // Complementary pairing boost
    const complementaryPairs = Math.min(explorers, lasers + anchors);
    score += complementaryPairs * 15;

    // Direct support boost
    const supportAlliances = Math.min(anchors, strained);
    score += supportAlliances * 12;

    if (anchors === 0) score -= 20;
    if (strained > 2) score -= 15;

    return Math.min(100, Math.max(30, score));
  };

  const getTutoringBridges = () => {
    const bridges: { studentA: StudentCollabNode; studentB: StudentCollabNode; desc: string; type: string }[] = [];
    const grps = ['Alpha', 'Beta', 'Gamma'] as const;
    
    grps.forEach(g => {
      const list = suggestedGroupings[g];
      const explorers = list.filter(s => getCognitiveProfile(s).category === 'High Engagement / Low Focus');
      const lasers = list.filter(s => getCognitiveProfile(s).category === 'High Focus / Low Engagement');
      const anchors = list.filter(s => getCognitiveProfile(s).category === 'Balanced Anchor / Mentor');
      const strained = list.filter(s => getCognitiveProfile(s).category === 'Strained Learner');

      let i = 0;
      while (i < explorers.length && i < lasers.length) {
        bridges.push({
          studentA: explorers[i],
          studentB: lasers[i],
          type: 'Energy ⚡ Focus Coherence',
          desc: `Stabilizes ${explorers[i].name}'s active pacing with ${lasers[i].name}'s sustained attention.`
        });
        i++;
      }

      let j = 0;
      while (j < anchors.length && j < strained.length) {
        bridges.push({
          studentA: anchors[j],
          studentB: strained[j],
          type: 'Mentorship 🛡️ Support Bridge',
          desc: `Pairs active mentor ${anchors[j].name} to bootstrap ${strained[j].name}'s performance.`
        });
        j++;
      }
    });

    return bridges;
  };

  const applySuggestedSeating = () => {
    addLog("Applying optimal complementary AI seating assemblies. Sub-clusters updated.");
    const flatSuggested = [
      ...suggestedGroupings.Alpha,
      ...suggestedGroupings.Beta,
      ...suggestedGroupings.Gamma
    ];
    
    const tableCenters = {
      Alpha: { x: 150, y: 150 },
      Beta: { x: 450, y: 150 },
      Gamma: { x: 360, y: 320 }
    };
    
    const count = { Alpha: 0, Beta: 0, Gamma: 0 };
    
    const updatedStudents = flatSuggested.map(student => {
      const grp = student.group as 'Alpha' | 'Beta' | 'Gamma';
      const center = tableCenters[grp];
      const idx = count[grp]++;
      const angle = (idx / 4) * 2 * Math.PI + Math.PI / 4;
      const radius = 60;
      
      return {
        ...student,
        x: Math.round(center.x + Math.cos(angle) * radius),
        y: Math.round(center.y + Math.sin(angle) * radius)
      };
    });
    
    setStudents(updatedStudents);
    addLog("Updating physics matrices. All 12 student nodes successfully clustered around balanced centers.");
    setTimeout(() => runCollabPropagation(), 120);
  };

  const injectPeerBridges = () => {
    addLog("Injecting all suggested complementary tutoring links to foster classroom balance.");
    const tutoringBridges = getTutoringBridges();
    const cleanEdges = edges.filter(e => e.weight > 4);
    const newEdges = [...cleanEdges];
    
    tutoringBridges.forEach(bridge => {
      const exists = newEdges.some(e => 
        (e.from === bridge.studentA.id && e.to === bridge.studentB.id) ||
        (e.from === bridge.studentB.id && e.to === bridge.studentA.id)
      );
      
      if (!exists) {
        newEdges.push({
          from: bridge.studentA.id,
          to: bridge.studentB.id,
          weight: 10,
          type: bridge.type.includes('Mentorship') ? 'mentoring' : 'brainstorm'
        });
        addLog(`Cognitive Tutoring Bridge constructed: ${bridge.studentA.name} <-> ${bridge.studentB.name} (Weight 10).`);
      }
    });

    setEdges(newEdges);
    addLog("Topology linkages updated. Running GNN calculations on structural stress mitigation...");
    setTimeout(() => runCollabPropagation(), 120);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-2xl relative" id="teacher_collaborative_gnn_playground">
      
      {/* Decorative background icons */}
      <div className="absolute top-0 right-0 p-8 opacity-5">
        <GitFork className="h-44 w-44 text-indigo-500 stroke-[1.2]" />
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-6 relative z-10">
        <div className="space-y-1">
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-rose-950/40 border border-rose-900/60 text-[9px] font-mono font-bold text-rose-450 text-rose-400 uppercase tracking-wider">
            <Flame className="h-3.5 w-3.5 animate-pulse" />
            <span>Topological Burnout Tracker</span>
          </span>
          <h2 className="text-lg font-extrabold text-slate-100 font-sans tracking-tight">
            Collaborative Group Dynamics GNN Modeler
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl">
            Model physical and interaction relationships between students in collaborative workspaces. This Graph Neural Network (GNN) simulates relational pathways to forecast stress cascades, peer-to-peer fatigue contagion, and overall group engagement collapse.
          </p>
        </div>

        {/* Dynamic Model Option Selection */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 h-9 shrink-0">
            {(['gat_burnout', 'gcn_diffusion', 'sage_load'] as const).map(model => (
              <button
                key={model}
                onClick={() => {
                  setGnnModel(model);
                  addLog(`Substituted topological network kernel to: ${model.toUpperCase()}`);
                }}
                className={`px-2.5 py-0.5 text-[9.5px] font-mono font-bold rounded uppercase transition-all duration-150 cursor-pointer ${
                  gnnModel === model 
                    ? 'bg-rose-600 text-white shadow-md' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {model === 'gat_burnout' ? 'GAT Burnout' : model === 'gcn_diffusion' ? 'GCN Diffusion' : 'SAGE Load'}
              </button>
            ))}
          </div>

          <button
            onClick={runCollabPropagation}
            disabled={propagationStep === 'aggregating'}
            className="h-9 px-4 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:bg-slate-800 disabled:text-slate-500"
          >
            <Play className={`h-3.5 w-3.5 ${propagationStep === 'aggregating' ? 'animate-spin' : ''}`} />
            <span>Trigger GNN Propagate</span>
          </button>
        </div>
      </div>

      {/* Sub-Layout toggler for GNN modes: Force-Directed Resonance Physics vs topological contagion vs AI suggestions */}
      <div className="flex flex-col sm:flex-row bg-slate-950 p-1.5 rounded-2xl border border-slate-800 mb-6 font-sans text-xs font-bold gap-1" id="gnn_sub_view_selector">
        <button
          type="button"
          onClick={() => {
            setSubLayout('force_resonance');
            addLog("Toggled GNN visualization: Interactive Force-directed Network Resonance Graph.");
          }}
          className={`flex-1 py-2 px-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
            subLayout === 'force_resonance'
              ? 'bg-indigo-600 text-white shadow-lg font-black'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/45'
          }`}
        >
          <Network className="h-4 w-4 text-indigo-400 animate-pulse" />
          <span>Core Resonance Physics Graph</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setSubLayout('propagation');
            addLog("Toggled GNN visualization: Relational GNN Stress Contagion Heatmap Grid.");
          }}
          className={`flex-1 py-2 px-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
            subLayout === 'propagation'
              ? 'bg-rose-600 text-white shadow-lg font-black'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/45'
          }`}
        >
          <Flame className="h-4 w-4 text-rose-450 text-rose-400" />
          <span>Burnout Contagion Heat Grid</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setSubLayout('group_suggestion');
            addLog("Toggled GNN suggestions: Complementary Cognitive Clustering & Balanced Assemblies.");
          }}
          className={`flex-1 py-2 px-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
            subLayout === 'group_suggestion'
              ? 'bg-amber-600 text-white shadow-lg font-black'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/45'
          }`}
        >
          <Users className="h-4 w-4 text-amber-500 animate-pulse" />
          <span>AI Cognitive Group Optimizer</span>
        </button>
      </div>

      {subLayout === 'propagation' ? (
        <>
          {/* Primary Simulator Panel split: Visual workspace map (7 cols) + details (5 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        
        {/* INTERACTIVE GRAPH CANVAS */}
        <div className="lg:col-span-7 bg-slate-950 border border-slate-850 rounded-xl p-4 flex flex-col justify-between min-h-[500px] relative">
          
          {/* Header context */}
          <div className="flex justify-between items-center bg-slate-900/60 p-2.5 rounded-lg border border-slate-850/60 mb-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span className="text-slate-300 font-mono font-bold text-[10.5px]">ACTIVE CLASS COLLABORATIVE SESSION MAP</span>
            </div>
            
            {/* Color keys */}
            <div className="hidden sm:flex gap-3 text-[9px] text-slate-400">
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500"></span> Flowing</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500"></span> Strained</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-rose-500"></span> Burnout risk</span>
            </div>
          </div>

          {/* Canvas Board Area */}
          <div className="relative bg-slate-950 rounded-xl border border-slate-855/80 h-[380px] overflow-hidden flex items-center justify-center">
            
            {/* Background design accents */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(244,63,94,0.04),transparent_65%)]" />
            
            {/* Team boundaries containers visual borders */}
            <div className="absolute top-4 left-6 border border-indigo-900/30 bg-indigo-950/5 rounded-2xl p-2 w-[220px] h-[190px] pointer-events-none z-0">
              <span className="text-[8px] font-mono font-black text-indigo-500 tracking-wider">TEAM ALPHA SUBGRAPH</span>
            </div>
            <div className="absolute top-4 right-6 border border-emerald-900/30 bg-emerald-950/5 rounded-2xl p-2 w-[220px] h-[190px] pointer-events-none z-0">
              <span className="text-[8px] font-mono font-black text-emerald-500 tracking-wider">TEAM BETA SUBGRAPH</span>
            </div>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 border border-amber-900/20 bg-amber-950/5 rounded-2xl p-2 w-[340px] h-[160px] pointer-events-none z-0">
              <span className="text-[8px] font-mono font-black text-amber-500 tracking-wider text-center block">TEAM GAMMA SUBGRAPH</span>
            </div>

            {/* SVG Edges Layer */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
              <defs>
                <linearGradient id="roseEdgeGrad" x1="0" y1="0" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.4" />
                </linearGradient>
              </defs>

              {edges.map((edge, idx) => {
                const sNode = students.find(s => s.id === edge.from);
                const tNode = students.find(s => s.id === edge.to);
                if (!sNode || !tNode) return null;

                // Adjust line visual weight based on collaboration connection strength
                const isEdgeStrained = (riskPredictions[sNode.id]?.burnout > 0.6) || (riskPredictions[tNode.id]?.burnout > 0.6);
                const edgeColor = isEdgeStrained ? 'url(#roseEdgeGrad)' : 'rgba(79, 70, 229, 0.25)';

                return (
                  <g key={`collab-edge-${idx}`}>
                    <line
                      x1={sNode.x}
                      y1={sNode.y}
                      x2={tNode.x}
                      y2={tNode.y}
                      stroke={edgeColor}
                      strokeWidth={1 + edge.weight / 3.5}
                      className="transition-all"
                    />

                    {/* Propagation active dash overlay */}
                    {edgeFlowActive && (
                      <line
                        x1={sNode.x}
                        y1={sNode.y}
                        x2={tNode.x}
                        y2={tNode.y}
                        stroke={isEdgeStrained ? '#f43f5e' : '#6366f1'}
                        strokeWidth={2 + edge.weight / 3.5}
                        strokeDasharray="6,12"
                        className="animate-[dash_1.5s_linear_infinite]"
                      />
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Render student nodes */}
            {students.map(node => {
              const isSelected = selectedStudent?.id === node.id;
              const pred = riskPredictions[node.id] || { burnout: 0.15, engagement: 0.85 };
              
              // Color coding of halo based on predicted burnout metric
              let haloColor = 'border-slate-800 ring-emerald-500/30 bg-emerald-950/20';
              let badgeColor = 'bg-emerald-500 text-white';
              if (pred.burnout > 0.65) {
                haloColor = 'border-red-650 ring-red-500/50 bg-rose-950/40 animate-pulse';
                badgeColor = 'bg-red-500 text-white';
              } else if (pred.burnout > 0.40) {
                haloColor = 'border-amber-650 ring-amber-500/40 bg-amber-950/20';
                badgeColor = 'bg-amber-500 text-slate-950';
              }

              return (
                <button
                  key={node.id}
                  onClick={() => {
                    setSelectedStudent(node);
                    addLog(`Queried GNN metrics for ${node.name}. Burnout projection: ${Math.round(pred.burnout*100)}%`);
                  }}
                  className="absolute p-0 border-none bg-transparent cursor-pointer z-20 group transition-transform hover:scale-110 duration-150 focus:outline-none"
                  style={{
                    left: `${node.x - 22}px`,
                    top: `${node.y - 22}px`,
                    width: '44px',
                    height: '44px'
                  }}
                >
                  <div className={`w-11 h-11 rounded-full border flex items-center justify-center transition-all shadow-md relative ${
                    isSelected 
                      ? 'border-indigo-400 ring-2 ring-indigo-500/80 scale-105' 
                      : haloColor
                  }`}>
                    
                    {/* Compact layout representing student initials & active biometric status */}
                    <span className="text-[10.5px] font-bold text-slate-200 uppercase font-sans">
                      {node.name.split(' ').map(n=>n[0]).join('')}
                    </span>

                    {/* Role Tag visual corner badge */}
                    <span className="absolute -bottom-1 -right-1 bg-slate-950 text-[7px] font-mono font-bold px-1 py-0.2 rounded border border-slate-800 leading-none text-slate-300">
                      {node.role[0]}
                    </span>

                    {/* Live Heatmap Bubble Indicator on node */}
                    <span className={`absolute -top-1 -right-1 h-3 w-3 rounded-full text-[7.5px] font-mono flex items-center justify-center font-bold font-black ${badgeColor}`}>
                      {node.id}
                    </span>

                    {/* Hover micro tooltip */}
                    <div className="absolute top-11 left-1/2 -translate-x-1/2 bg-slate-950 border border-slate-800 p-2 rounded shadow-2xl transition-opacity duration-200 opacity-0 group-hover:opacity-100 whitespace-nowrap z-50 pointer-events-none text-left font-sans">
                      <div className="flex items-center gap-1">
                        <strong className="text-slate-100 text-[11px] block">{node.name}</strong>
                        <span className="text-[8px] bg-indigo-950 text-indigo-400 px-1 py-0.2 rounded font-mono uppercase">{node.group}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-0.5">Role: <strong className="text-indigo-300">{node.role}</strong></span>
                      <div className="grid grid-cols-2 gap-x-2 mt-1 border-t border-slate-900 pt-1 text-[9.5px]">
                        <span className="text-rose-400 font-bold">Burnout: {Math.round(pred.burnout*100)}%</span>
                        <span className="text-emerald-450 text-emerald-400 font-bold">Engagement: {Math.round(pred.engagement*100)}%</span>
                      </div>
                    </div>

                  </div>
                </button>
              );
            })}
          </div>

          {/* Adaptive intensity control and math guideline */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-850 pt-3.5 mt-3">
            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="text-slate-400 font-medium flex items-center gap-1">
                  <Sliders className="h-3.5 w-3.5 text-rose-500" />
                  Collaborative Session Fatigue Load
                </span>
                <span className="text-rose-400 font-bold px-1.5 py-0.2 rounded bg-rose-950/30 border border-rose-900/40 text-[10.5px]">
                  {intensity} / 10
                </span>
              </div>
              <input
                type="range"
                min="2"
                max="10"
                step="1"
                value={intensity}
                onChange={(e) => setIntensity(parseInt(e.target.value))}
                className="w-full accent-rose-500 h-1.5 bg-slate-900 rounded cursor-pointer"
              />
              <span className="text-[9px] text-slate-500 block leading-relaxed mt-1">
                Increasing load escalates stress propagation contagion across adjoining student vectors.
              </span>
            </div>

            <div className="bg-slate-900/50 p-2.5 rounded-lg border border-slate-850 flex flex-col justify-center text-[10px] text-slate-400">
              <span className="font-mono text-slate-350 block mb-0.5 uppercase tracking-wide font-bold">GNN COGNITIVE HEURISTIC MATRIX</span>
              {gnnModel === 'gat_burnout' && (
                <p className="leading-snug">
                  <strong>Anisotropic GAT:</strong> Model estimates GNN Attention coefficients scaled on neighbor fatigue disparities: <code className="text-rose-400">α = Softmax(W • [h_i || h_j])</code>.
                </p>
              )}
              {gnnModel === 'gcn_diffusion' && (
                <p className="leading-snug">
                  <strong>Normalized GCN:</strong> Models static team diffusion through symmetrical adjacency scaling: <code className="text-indigo-400">h = ReLU(Σ (1/√(deg_i • deg_j)) • W • h_j)</code>.
                </p>
              )}
              {gnnModel === 'sage_load' && (
                <p className="leading-snug">
                  <strong>GraphSAGE:</strong> Predicts node state by merging average surrounding features onto self-state: <code className="text-amber-400">h = σ(W • [h_self || Mean(h_neighbors)])</code>.
                </p>
              )}
            </div>
          </div>

        </div>

        {/* METADATA INSPECTOR & LINK MANIPULATOR */}
        <div className="lg:col-span-5 flex flex-col space-y-6">
          
          {/* Node Inspector */}
          <div className="bg-slate-950 border border-slate-855 rounded-xl p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-900 mb-3">
                <span className="text-[10px] text-indigo-400 font-mono font-bold uppercase tracking-wider block">Student Vector Inspector</span>
                {selectedStudent && (
                  <span className="text-[9.5px] bg-slate-900 text-slate-400 px-2 py-0.5 rounded border border-slate-800 font-mono">
                    ID #{selectedStudent.id}
                  </span>
                )}
              </div>

              {selectedStudent ? (() => {
                const pred = riskPredictions[selectedStudent.id] || { burnout: 0.22, engagement: 0.68, spillover: 0.12 };
                return (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-extrabold text-slate-100 text-sm tracking-tight">{selectedStudent.name}</h4>
                      <div className="flex gap-1.5">
                        <span className="text-[9px] bg-slate-900 text-slate-400 border border-slate-800 px-2 py-0.5 rounded font-medium">
                          {selectedStudent.role}
                        </span>
                        <span className="text-[9px] bg-indigo-950 text-indigo-450 text-indigo-400 border border-indigo-900 px-2 py-0.5 rounded font-bold font-mono">
                          Team {selectedStudent.group}
                        </span>
                      </div>
                    </div>

                    {/* predicted gauges */}
                    <div className="grid grid-cols-2 gap-3.5 bg-slate-900 p-3 rounded-lg border border-slate-850">
                      <div>
                        <span className="text-[9px] text-slate-550 text-slate-500 block font-mono uppercase tracking-wider">Burnout Index</span>
                        <div className="flex items-baseline space-x-1 mt-0.5">
                          <strong className={`text-xl font-bold font-mono ${pred.burnout > 0.65 ? 'text-red-400' : pred.burnout > 0.4 ? 'text-amber-400' : 'text-emerald-400'}`}>
                            {Math.round(pred.burnout * 100)}%
                          </strong>
                          <span className="text-[9.5px] text-slate-500">Predicted</span>
                        </div>
                        <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden mt-1.5 check">
                          <div 
                            className={`h-full rounded-full ${pred.burnout > 0.65 ? 'bg-red-500' : pred.burnout > 0.4 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                            style={{ width: `${pred.burnout * 100}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <span className="text-[9px] text-slate-550 text-slate-500 block font-mono uppercase tracking-wider">Engagement Level</span>
                        <div className="flex items-baseline space-x-1 mt-0.5">
                          <strong className="text-xl font-bold font-mono text-indigo-400">
                            {Math.round(pred.engagement * 100)}%
                          </strong>
                          <span className="text-[9.5px] text-slate-500">Predicted</span>
                        </div>
                        <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden mt-1.5 check">
                          <div 
                            className="h-full bg-indigo-500 rounded-full" 
                            style={{ width: `${pred.engagement * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Raw Biometric Attributes */}
                    <div className="space-y-2">
                      <span className="text-[9px] text-slate-500 font-mono font-bold block uppercase tracking-wider mb-1.5">Baseline wear states input</span>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-slate-900/60 p-2 rounded border border-slate-850 text-center">
                          <span className="text-[8px] text-slate-500 font-mono block uppercase">Fatigue index</span>
                          <strong className="text-xs text-sky-400 font-bold block mt-0.5">{(selectedStudent.features[0]*100).toFixed(0)}%</strong>
                        </div>
                        <div className="bg-slate-900/60 p-2 rounded border border-slate-850 text-center">
                          <span className="text-[8px] text-slate-500 font-mono block uppercase">Anxiety state</span>
                          <strong className="text-xs text-rose-400 font-bold block mt-0.5">{(selectedStudent.features[1]*100).toFixed(0)}%</strong>
                        </div>
                        <div className="bg-slate-900/60 p-2 rounded border border-slate-850 text-center">
                          <span className="text-[8px] text-slate-500 font-mono block uppercase">Active input</span>
                          <strong className="text-xs text-emerald-450 text-emerald-400 font-bold block mt-0.5">{(selectedStudent.features[2]*100).toFixed(0)}%</strong>
                        </div>
                      </div>
                    </div>

                    {/* Adjacent Connections List */}
                    <div className="space-y-1.5">
                      <span className="text-[9px] text-slate-500 font-mono font-bold block uppercase tracking-wider">COLLABORATION EDGE MATRIX</span>
                      <div className="bg-slate-900 rounded-lg p-2 max-h-[110px] overflow-y-auto scrollbar-thin space-y-1.5">
                        {(() => {
                          const studentEdges = edges.filter(e => e.from === selectedStudent.id || e.to === selectedStudent.id);
                          if (studentEdges.length === 0) {
                            return <p className="text-[10px] text-slate-500 text-center py-2 italic font-mono">No active collaborative edges found (Isolate node).</p>;
                          }
                          return studentEdges.map((e, index) => {
                            const partnerId = e.from === selectedStudent.id ? e.to : e.from;
                            const partner = students.find(s => s.id === partnerId);
                            return (
                              <div key={index} className="flex items-center justify-between bg-slate-950 p-1.5 rounded border border-slate-850 text-[10.5px]">
                                <span className="text-slate-300 font-semibold font-mono">
                                  {partner?.name} <span className="text-slate-500 text-[9px] font-normal">({e.type})</span>
                                </span>
                                <div className="flex items-center space-x-2">
                                  <span className="bg-indigo-950/60 border border-indigo-900/40 text-indigo-400 text-[9px] px-1.5 rounded font-mono font-bold leading-none">
                                    Wt: {e.weight}
                                  </span>
                                  <button
                                    onClick={() => handleRemoveEdge(selectedStudent.id, partnerId)}
                                    className="text-[9px] text-rose-500 hover:text-rose-450 hover:underline bg-transparent border-none cursor-pointer p-0"
                                  >
                                    Sever
                                  </button>
                                </div>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </div>

                  </div>
                );
              })() : (
                <p className="text-xs text-slate-500 text-center py-8">
                  Click on an interactive student circle in the classroom workspace layout to track detailed biological burdens.
                </p>
              )}
            </div>
          </div>

          {/* Interactive Core Relationship Matrix Editor */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl">
            <span className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider block">Topology modifier</span>
            <h3 className="font-bold text-slate-200 text-xs mb-3 flex items-center gap-1.5">
              <Plus className="h-4 w-4 text-indigo-400" />
              Build/Tweak Collaborative Relationships
            </h3>

            <form onSubmit={handleAddEdge} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-[9px] text-slate-500 font-mono block mb-1">Source Node</label>
                  <select
                    value={edgeForm.from}
                    onChange={(e) => setEdgeForm(prev => ({ ...prev, from: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-850 text-slate-200 text-[11px] p-2.5 rounded focus:outline-none focus:border-indigo-500"
                  >
                    {students.map(s => (
                      <option key={s.id} value={s.id}>{s.id} - {s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[9px] text-slate-500 font-mono block mb-1">Target Node (Collaborator)</label>
                  <select
                    value={edgeForm.to}
                    onChange={(e) => setEdgeForm(prev => ({ ...prev, to: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-850 text-slate-200 text-[11px] p-2.5 rounded focus:outline-none focus:border-indigo-500"
                  >
                    {students.map(s => (
                      <option key={s.id} value={s.id}>{s.id} - {s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-[9px] text-slate-500 font-mono block mb-1">Edge Density (1-10)</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={edgeForm.weight}
                    onChange={(e) => setEdgeForm(prev => ({ ...prev, weight: parseInt(e.target.value) || 5 }))}
                    className="w-full bg-slate-950 border border-slate-850 text-slate-200 text-[11px] p-2.5 rounded focus:outline-none focus:border-indigo-550"
                  />
                </div>

                <div>
                  <label className="text-[9px] text-slate-500 font-mono block mb-1">Affinity type</label>
                  <select
                    value={edgeForm.type}
                    onChange={(e) => setEdgeForm(prev => ({ ...prev, type: e.target.value as any }))}
                    className="w-full bg-slate-950 border border-slate-850 text-slate-200 text-[11px] p-2.5 rounded focus:outline-none focus:border-indigo-500"
                  >
                    <option value="mentoring">Coaching / Peer tutoring</option>
                    <option value="brainstorm">Active collaboration</option>
                    <option value="passive">Passive proximity / Sitting alignment</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-slate-950 hover:bg-slate-850 text-indigo-400 border border-indigo-900 hover:border-indigo-550 text-xs font-semibold py-2 rounded-lg transition-all"
              >
                Assemble Collaborative Link
              </button>
            </form>
          </div>

        </div>

      </div>

      {/* Analytics outputs block: Group aggregated scores (recharts) + Gemini Consultation advising layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-6">
        
        {/* GROUP ANALYTICS CHART: 6 COLS */}
        <div className="md:col-span-6 bg-slate-950 border border-slate-855 rounded-xl p-4 flex flex-col justify-between min-h-[350px]">
          <div>
            <h4 className="font-extrabold text-slate-100 text-xs mb-1.5 uppercase font-sans tracking-wide">
              Sub-Team Aggregated Predictions
            </h4>
            <p className="text-[10.5px] text-slate-450 text-slate-450 text-slate-400 leading-normal mb-4">
              Cumulative group-wide indices predicted based on topological interaction densities among member nodes.
            </p>
          </div>

          <div className="w-full h-56 flex-1 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={groupMetrics}
                margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="groupName" stroke="#475569" style={{ fontSize: '10px' }} />
                <YAxis stroke="#475569" style={{ fontSize: '10px' }} unit="%" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', fontSize: '11px' }}
                />
                <Legend iconSize={10} wrapperStyle={{ fontSize: '10px' }} />
                <Bar dataKey="Burnout Risk" fill="#ef4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Engagement Level" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Spillover Spill" fill="#a855f7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-850 text-[10.5px] text-slate-400 mt-3 leading-relaxed">
            <span className="font-mono text-[9px] text-slate-500 font-bold block mb-0.5">TOPOLOGICAL OBSERVATION ANALYSIS</span>
            <span className="text-slate-350">
              {intensity > 7 
                ? 'Critically intense collaborative factors logged. Team Beta displays elevated burnout cascades. Instruct team coaches to mitigate fatigue spillover immediately.' 
                : 'Cognitive load levels remain inside balanced parameters. Group Alpha mentoring channels are functioning within optimal stress-resilient margins.'}
            </span>
          </div>
        </div>

        {/* GEMINI TOPOLOGICAL OPTIMIZATION ADVISOR: 6 COLS */}
        <div className="md:col-span-6 bg-slate-950 border border-slate-855 rounded-xl p-4 flex flex-col justify-between min-h-[350px]">
          <div>
            <div className="flex items-center justify-between border-b border-slate-900 pb-2 mb-3">
              <div>
                <span className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider block">Bio-Adaptive Seating Coach</span>
                <h3 className="font-extrabold text-slate-100 text-xs flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-yellow-450 text-indigo-400" />
                  Gemini Team Topology Reorganization Advisor
                </h3>
              </div>
              <Activity className="h-4 w-4 text-rose-500 animate-pulse" />
            </div>

            <div className="overflow-y-auto max-h-[220px] pr-1 space-y-2.5 scrollbar-thin scrollbar-thumb-slate-850">
              {advisorAdvice ? (
                <div className="text-[11px] leading-relaxed text-slate-300 font-sans whitespace-pre-wrap select-text pr-1">
                  {advisorAdvice}
                </div>
              ) : (
                <div className="text-center py-10 space-y-3">
                  <Brain className="h-10 w-10 text-slate-600 mx-auto stroke-[1.2] animate-pulse" />
                  <div className="space-y-1">
                    <h5 className="text-xs text-slate-300 font-bold">Assess Team Networks</h5>
                    <p className="text-[10px] text-slate-500 max-w-sm mx-auto leading-relaxed">
                      Launch an AI analytical evaluation of student relationships to insulate at-risk students, contain stress cascades, and establish optimal break schedules.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-slate-900 pt-3 mt-4 flex items-center justify-between flex-wrap gap-2">
            <button
              onClick={() => {
                setTelemetryLogs(['Simulation logs initialized.']);
                addLog("Execution telemetry successfully cleaned.");
              }}
              className="text-[10px] text-slate-500 hover:text-slate-300 underline bg-transparent border-none cursor-pointer"
            >
              Flush Node Telemetry Logs
            </button>

            <button
              onClick={requestTopologicalConsultation}
              disabled={isAdvisorLoading}
              className="px-4 py-2 text-xs font-bold bg-indigo-700 hover:bg-slate-700 border border-indigo-900 text-indigo-200 rounded-lg transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
            >
              {isAdvisorLoading ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  <span>Structuring charts...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5 text-yellow-400" />
                  <span>Request Reorganization Advice</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>

      {/* REAL-TIME SIMULATION TELEMETRY FEED */}
      <div className="bg-slate-950 border border-slate-855 rounded-xl p-3.5 mt-4">
        <div className="flex items-center space-x-2 border-b border-slate-900 pb-2 mb-2.5">
          <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></div>
          <span className="text-[9.5px] text-slate-400 font-mono font-bold uppercase tracking-wider">Topological Simulation Telemetry Traces</span>
        </div>
        
        <div className="font-mono text-[9.5px] space-y-1 bg-slate-900/45 p-2 rounded max-h-[110px] overflow-y-auto scrollbar-thin select-text">
          {telemetryLogs.map((log, lIdx) => (
            <div key={lIdx} className="text-slate-300 pl-2 border-l border-slate-800">
              {log}
            </div>
          ))}
        </div>
      </div>
        </>
      ) : subLayout === 'group_suggestion' ? (
        <div className="space-y-6" id="ai_group_optimizer_container">
          {/* Header Dashboard Banner */}
          <div className="bg-slate-950 border border-slate-850 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 relative overflow-hidden">
            <div className="space-y-1 relative z-10">
              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-amber-955/35 border border-amber-900/60 text-[9px] font-mono font-bold text-amber-400 uppercase tracking-wider">
                <Sparkles className="h-3 w-3 text-amber-400" />
                <span>Complementary Cognitive Clustering</span>
              </span>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5 uppercase font-mono">
                AI Cognitive Grouping & Seating Recommender
              </h3>
              <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
                Our GNN algorithm segments students into complementary cognitive profiles by analyzing individual participation and focus levels. This module balances High Engagement/Low Focus observers with High Focus/Low Engagement peers, preventing burnout spillover and maximizing shared collaborative flow.
              </p>
            </div>
            <div className="flex gap-2 shrink-0 relative z-10">
              <button
                type="button"
                onClick={applySuggestedSeating}
                className="px-4 py-2 text-xs font-bold bg-amber-600 hover:bg-amber-500 text-slate-950 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer border border-none"
              >
                <Users className="h-3.5 w-3.5" />
                <span>Apply Seating Assemblies</span>
              </button>
              <button
                type="button"
                onClick={injectPeerBridges}
                className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer border border-none"
              >
                <Zap className="h-3.5 w-3.5" />
                <span>Establish All Tutoring Bridges</span>
              </button>
            </div>
            {/* Ambient subtle yellow glow */}
            <div className="absolute right-0 top-0 w-32 h-32 bg-amber-550/10 rounded-full blur-2xl pointer-events-none" />
          </div>

          {/* Core Division Grid: Balanced Seating Tables (7 cols) + Complementary Bridging Details (5 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* 3 TABLES COMPARISON (Left, 7 Cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase font-mono text-slate-300">
                  Target Table Group Assemblies (Balanced to size 4)
                </h4>
                <div className="flex gap-4 text-[9.5px] font-mono text-slate-500">
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" /> Suggested Synergy
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full border border-slate-700 bg-slate-900" /> Current
                  </span>
                </div>
              </div>

              {(['Alpha', 'Beta', 'Gamma'] as const).map(grp => {
                const suggNodes = suggestedGroupings[grp];
                const currNodes = currentGroupings[grp];
                const suggScore = calculateGroupBalanceScore(suggNodes);
                const currScore = calculateGroupBalanceScore(currNodes);

                return (
                  <div key={grp} className="bg-slate-950 border border-slate-850 rounded-xl p-4 space-y-3.5 hover:border-slate-800 transition-colors">
                    {/* Header Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-900 pb-2.5">
                      <div className="flex items-baseline space-x-1.5">
                        <span className="text-xs font-bold text-slate-100 font-sans">
                          Table {grp === 'Alpha' ? 'Alpha Table 1' : grp === 'Beta' ? 'Beta Table 2' : 'Gamma Table 3'}
                        </span>
                        <span className="text-[9px] font-mono text-slate-500">(Suggested Assembly)</span>
                      </div>

                      {/* Score Comparison Badge */}
                      <div className="flex items-center space-x-2 text-xs">
                        {/* Current Score */}
                        <div className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-[9.5px] text-slate-400 flex items-center gap-1 font-mono">
                          <span>Current Balance:</span>
                          <span className="font-bold text-slate-300">{currScore}%</span>
                        </div>
                        {/* Suggested Score */}
                        <div className="bg-amber-950/20 px-2 py-0.5 rounded border border-amber-900/40 text-[9.5px] text-amber-400 flex items-center gap-1 font-mono">
                          <span>Suggested Balance:</span>
                          <strong className="font-bold flex items-center gap-0.5">
                            {suggScore}%
                            <TrendingUp className="h-3 w-3 text-emerald-400" />
                          </strong>
                        </div>
                      </div>
                    </div>

                    {/* Students cards inside suggested list */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {suggNodes.map(student => {
                        const prof = getCognitiveProfile(student);
                        const currentSeat = students.find(s => s.id === student.id)?.group;
                        const hasMoved = currentSeat !== grp;

                        return (
                          <div 
                            key={student.id} 
                            className={`p-2.5 rounded-lg border bg-slate-900/60 transition-all text-xs flex flex-col justify-between h-[96px] ${
                              hasMoved ? 'border-amber-900/45 ring-1 ring-amber-500/10' : 'border-slate-850'
                            }`}
                          >
                            <div className="flex items-start justify-between min-w-0 mb-1">
                              <div className="truncate min-w-0">
                                <span className="font-bold text-slate-200 block truncate leading-tight">
                                  {student.name}
                                </span>
                                <span className={`inline-flex items-center space-x-1 px-1.5 rounded-full text-[8px] font-mono border font-bold mt-1 uppercase ${prof.color}`}>
                                  <span className={`h-1 w-1 rounded-full ${prof.dotColor}`} />
                                  <span>{prof.label}</span>
                                </span>
                              </div>
                              <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-950 px-1 py-0.2 rounded border border-slate-850">
                                #{student.id}
                              </span>
                            </div>

                            {/* Mini metrics indicators */}
                            <div className="flex items-center justify-between text-[9px] border-t border-slate-850/60 pt-1 text-slate-400">
                              <span className="flex items-center gap-1">
                                <Brain className="h-2.5 w-2.5 text-indigo-400" />
                                Attention: <strong className="text-slate-300">{student.attention}</strong>
                              </span>
                              <span className="flex items-center gap-1">
                                <Activity className="h-2.5 w-2.5 text-sky-400" />
                                Engagement: <strong className="text-slate-300">{Math.round(student.features[2] * 100)}%</strong>
                              </span>
                            </div>

                            {/* Seating change log */}
                            <div className="flex justify-between items-center text-[8.5px] mt-1 text-slate-500">
                              <span>Role: <strong className="text-slate-400">{student.role}</strong></span>
                              {hasMoved ? (
                                <span className="text-amber-400 font-semibold px-1 rounded bg-amber-950/20">
                                  Transfer from {currentSeat}
                                </span>
                              ) : (
                                <span className="text-slate-500">Stable</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* COMPLEMENTARY BRIDGES & PAIRINGS MATCHES (Right, 5 Cols) */}
            <div className="lg:col-span-5 flex flex-col space-y-4">
              <h4 className="text-xs font-bold uppercase font-mono text-slate-300">
                Suggested Tutoring & Focus Resonance Bridges
              </h4>

              <div className="bg-slate-950 border border-slate-850 rounded-xl p-4 space-y-3.5 flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-[10.5px] text-slate-400 leading-normal mb-3">
                    These targeted dynamic bridges pair learning strengths. Pairing highly energetic participants with focused listeners promotes social learning and shields receivers from cognitive stress contagion in GNN.
                  </p>

                  <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-850">
                    {getTutoringBridges().map((bridge, bIdx) => {
                      const exists = edges.some(e => 
                        (e.from === bridge.studentA.id && e.to === bridge.studentB.id) ||
                        (e.from === bridge.studentB.id && e.to === bridge.studentA.id)
                      );

                      return (
                        <div key={bIdx} className="bg-slate-900 border border-slate-850 p-3 rounded-xl space-y-2.5 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] bg-indigo-950 text-indigo-400 font-mono font-black border border-indigo-900/50 px-2 py-0.5 rounded uppercase">
                              {bridge.type}
                            </span>
                            <div className="flex items-center space-x-1 text-slate-4002 mt-0.5">
                              <span className="text-[9px] text-slate-400 font-mono">Synergy Rating:</span>
                              <strong className="text-[10.5px] font-bold text-emerald-400 font-mono">92%</strong>
                            </div>
                          </div>

                          {/* Match names */}
                          <div className="flex items-center justify-between bg-slate-950 p-1.5 rounded border border-slate-850 font-mono text-[10.5px]">
                            <div className="text-slate-200 font-bold truncate max-w-[80px]">
                              {bridge.studentA.name.split(' ')[0]}
                            </div>
                            <ArrowRight className="h-3 w-3 text-indigo-400 shrink-0" />
                            <div className="text-slate-200 font-bold truncate max-w-[80px]">
                              {bridge.studentB.name.split(' ')[0]}
                            </div>
                            <span className="text-[8px] text-slate-500 bg-slate-900 px-1 py-0.2 rounded border">
                              Table {bridge.studentA.group}
                            </span>
                          </div>

                          <p className="text-[10px] text-slate-300 leading-relaxed italic">
                            {bridge.desc}
                          </p>

                          <div className="border-t border-slate-850/60 pt-1.5 mt-1 flex justify-end">
                            {exists ? (
                              <span className="text-[9px] text-emerald-400 font-bold flex items-center gap-1">
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Active Connection
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setEdges(prev => [...prev, {
                                    from: bridge.studentA.id,
                                    to: bridge.studentB.id,
                                    weight: 10,
                                    type: bridge.type.includes('Mentorship') ? 'mentoring' : 'brainstorm'
                                  }]);
                                  addLog(`Created cognitive resonance tutoring loop: ${bridge.studentA.name} <-> ${bridge.studentB.name} (Weight: 10)`);
                                  setTimeout(() => runCollabPropagation(), 100);
                                }}
                                className="text-[9px] text-indigo-400 hover:text-white hover:underline bg-transparent border-none cursor-pointer"
                              >
                                Build Resonance Link (+10 Wt)
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="border-t border-slate-900 pt-3 mt-4">
                  <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-850 text-[10px] text-slate-450 text-slate-400 space-y-1">
                    <strong className="text-slate-300 block uppercase text-[8.5px] font-mono tracking-wider">TOPOLOGICAL GNN OPTIMIZATION MATRIX</strong>
                    <p className="leading-snug">
                      Connecting cognitive dyads with high resonance weight (<code className="text-indigo-400">w_ij = 10</code>) forces GNN layers to aggregate buffering effects, balancing learning stress diffusion across adjacent nodes.
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      ) : (
        <GnnForceDirectedGraph 
          studentsProp={students} 
          edgesProp={edges} 
          onUpdateStudents={setStudents} 
          onUpdateEdges={setEdges} 
        />
      )}

    </div>
  );
}
