import React, { useState, useEffect, useRef } from 'react';
import { 
  Network, 
  Play, 
  Pause, 
  RotateCcw, 
  Activity, 
  Flame, 
  Sparkles, 
  User, 
  Zap, 
  Brain, 
  Heart, 
  TrendingUp, 
  Sliders, 
  ShieldAlert, 
  TrendingDown, 
  CheckCircle2, 
  Info,
  GitBranch,
  X,
  Radio
} from 'lucide-react';

interface StudentCollabNode {
  id: string;
  name: string;
  attention: 'High' | 'Moderate' | 'Low';
  stress: 'High' | 'Moderate' | 'Low';
  fatigue: 'High' | 'Moderate' | 'Low';
  role: 'Mentor' | 'Receiver' | 'Peer';
  group: 'Alpha' | 'Beta' | 'Gamma';
  features: [number, number, number]; // [Fatigue, Stress, Contribution]
  x: number;
  y: number;
  vx: number;
  vy: number;
}

interface CollabEdge {
  from: string;
  to: string;
  weight: number; // Cognitive Resonance (1-10)
  type: 'mentoring' | 'brainstorm' | 'passive';
}

const academicProgressionData: Record<string, number[]> = {
  '1': [85, 88, 90, 89, 92, 95], // Alex Mercer
  '2': [74, 72, 68, 70, 65, 62], // Jack Peterson
  '3': [90, 92, 91, 93, 94, 96], // Sophia Lin
  '4': [82, 84, 80, 85, 83, 87], // Ethan Hunt
  '5': [88, 90, 93, 92, 95, 98], // Chloe Fraser
  '6': [60, 62, 58, 61, 59, 57], // Zack Ward
  '7': [78, 76, 75, 72, 70, 71], // Abby Williams
  '8': [80, 82, 85, 88, 86, 89], // Lucas Scott
  '9': [85, 87, 85, 89, 88, 90], // Mia Wong
  '10': [70, 68, 65, 62, 60, 58], // Noah Miller
  '11': [82, 83, 85, 84, 86, 88], // Emma Davis
  '12': [88, 89, 91, 93, 92, 94]  // Oliver Taylor
};

export default function GnnForceDirectedGraph({
  studentsProp,
  edgesProp,
  onUpdateStudents,
  onUpdateEdges
}: {
  studentsProp?: StudentCollabNode[];
  edgesProp?: CollabEdge[];
  onUpdateStudents?: React.Dispatch<React.SetStateAction<StudentCollabNode[]>>;
  onUpdateEdges?: React.Dispatch<React.SetStateAction<CollabEdge[]>>;
} = {}) {
  // Dimension coordinates of the force arena
  const width = 640;
  const height = 400;

  // Initial student node states
  const initialStudents: StudentCollabNode[] = [
    { id: '1', name: 'Alex Mercer', attention: 'High', stress: 'Low', fatigue: 'Low', role: 'Mentor', group: 'Alpha', features: [0.20, 0.25, 0.90], x: 150, y: 150, vx: 0, vy: 0 },
    { id: '2', name: 'Jack Peterson', attention: 'Low', stress: 'High', fatigue: 'High', role: 'Receiver', group: 'Alpha', features: [0.85, 0.90, 0.30], x: 200, y: 120, vx: 0, vy: 0 },
    { id: '3', name: 'Sophia Lin', attention: 'High', stress: 'Moderate', fatigue: 'Low', role: 'Peer', group: 'Alpha', features: [0.35, 0.50, 0.75], x: 180, y: 190, vx: 0, vy: 0 },
    { id: '4', name: 'Ethan Hunt', attention: 'Moderate', stress: 'Low', fatigue: 'Moderate', role: 'Peer', group: 'Alpha', features: [0.45, 0.30, 0.65], x: 230, y: 200, vx: 0, vy: 0 },

    { id: '5', name: 'Chloe Fraser', attention: 'High', stress: 'Low', fatigue: 'Low', role: 'Mentor', group: 'Beta', features: [0.15, 0.20, 0.95], x: 450, y: 150, vx: 0, vy: 0 },
    { id: '6', name: 'Zack Ward', attention: 'Low', stress: 'Low', fatigue: 'High', role: 'Receiver', group: 'Beta', features: [0.75, 0.30, 0.25], x: 500, y: 130, vx: 0, vy: 0 },
    { id: '7', name: 'Abby Williams', attention: 'Moderate', stress: 'High', fatigue: 'Moderate', role: 'Receiver', group: 'Beta', features: [0.60, 0.85, 0.40], x: 470, y: 220, vx: 0, vy: 0 },
    { id: '8', name: 'Lucas Scott', attention: 'High', stress: 'Low', fatigue: 'Low', role: 'Peer', group: 'Beta', features: [0.25, 0.30, 0.80], x: 520, y: 180, vx: 0, vy: 0 },

    { id: '9', name: 'Mia Wong', attention: 'High', stress: 'Moderate', fatigue: 'Low', role: 'Peer', group: 'Gamma', features: [0.30, 0.55, 0.70], x: 300, y: 280, vx: 0, vy: 0 },
    { id: '10', name: 'Noah Miller', attention: 'Low', stress: 'Moderate', fatigue: 'High', role: 'Receiver', group: 'Gamma', features: [0.70, 0.60, 0.35], x: 380, y: 310, vx: 0, vy: 0 },
    { id: '11', name: 'Emma Davis', attention: 'Moderate', stress: 'Low', fatigue: 'Low', role: 'Peer', group: 'Gamma', features: [0.35, 0.20, 0.60], x: 320, y: 350, vx: 0, vy: 0 },
    { id: '12', name: 'Oliver Taylor', attention: 'High', stress: 'Low', fatigue: 'Low', role: 'Mentor', group: 'Gamma', features: [0.20, 0.25, 0.85], x: 420, y: 340, vx: 0, vy: 0 }
  ];

  const initialEdges: CollabEdge[] = [
    { from: '1', to: '2', weight: 8, type: 'mentoring' },
    { from: '1', to: '3', weight: 6, type: 'brainstorm' },
    { from: '3', to: '2', weight: 5, type: 'brainstorm' },
    { from: '4', to: '2', weight: 4, type: 'passive' },
    { from: '3', to: '4', weight: 7, type: 'brainstorm' },

    { from: '5', to: '6', weight: 9, type: 'mentoring' },
    { from: '5', to: '7', weight: 8, type: 'mentoring' },
    { from: '8', to: '7', weight: 6, type: 'brainstorm' },
    { from: '8', to: '6', weight: 4, type: 'passive' },

    { from: '12', to: '10', weight: 8, type: 'mentoring' },
    { from: '9', to: '10', weight: 5, type: 'brainstorm' },
    { from: '9', to: '11', weight: 6, type: 'brainstorm' },
    { from: '11', to: '12', weight: 7, type: 'brainstorm' },

    // Inter-group cross references
    { from: '3', to: '9', weight: 3, type: 'passive' },
    { from: '4', to: '7', weight: 4, type: 'passive' }
  ];

  // State
  const [nodes, setNodes] = useState<StudentCollabNode[]>(() => {
    const rawNodes = studentsProp || initialStudents;
    return rawNodes.map(n => ({
      ...n,
      x: isNaN(n.x) || n.x === undefined ? 100 : n.x,
      y: isNaN(n.y) || n.y === undefined ? 100 : n.y,
      vx: isNaN((n as any).vx) || (n as any).vx === undefined ? 0 : (n as any).vx,
      vy: isNaN((n as any).vy) || (n as any).vy === undefined ? 0 : (n as any).vy
    }));
  });
  const [edges, setEdges] = useState<CollabEdge[]>(edgesProp || initialEdges);

  // Synchronize dynamic inputs from parent props change
  useEffect(() => {
    if (studentsProp) {
      setNodes(prev => {
        return studentsProp.map(sp => {
          const match = prev.find(p => p.id === sp.id);
          const px = match ? match.x : sp.x;
          const py = match ? match.y : sp.y;
          const pvx = match ? match.vx : 0;
          const pvy = match ? match.vy : 0;
          return {
            ...sp,
            x: isNaN(px) || px === undefined ? (isNaN(sp.x) || sp.x === undefined ? 100 : sp.x) : px,
            y: isNaN(py) || py === undefined ? (isNaN(sp.y) || sp.y === undefined ? 100 : sp.y) : py,
            vx: isNaN(pvx) || pvx === undefined ? 0 : pvx,
            vy: isNaN(pvy) || pvy === undefined ? 0 : pvy
          };
        });
      });
    }
  }, [studentsProp]);

  useEffect(() => {
    if (edgesProp) {
      setEdges(edgesProp);
    }
  }, [edgesProp]);

  // Serialize non-coordinate data to safely detect business logic changes without circular re-renders
  const nodesFeatureSignature = JSON.stringify(nodes.map(n => ({
    id: n.id,
    role: n.role,
    group: n.group,
    attention: n.attention,
    stress: n.stress,
    fatigue: n.fatigue,
    features: n.features
  })));

  const edgesSignature = JSON.stringify(edges);

  useEffect(() => {
    if (onUpdateStudents) {
      onUpdateStudents(prev => {
        const hasChanges = prev.some(p => {
          const match = nodes.find(n => n.id === p.id);
          if (!match) return false;
          return p.role !== match.role || 
                 p.group !== match.group || 
                 p.attention !== match.attention || 
                 p.stress !== match.stress || 
                 p.fatigue !== match.fatigue || 
                 p.features[0] !== match.features[0] ||
                 p.features[1] !== match.features[1] ||
                 p.features[2] !== match.features[2];
        });
        if (hasChanges) {
          return prev.map(p => {
            const match = nodes.find(n => n.id === p.id);
            return match ? { ...p, ...match, x: p.x, y: p.y } : p; 
          });
        }
        return prev;
      });
    }
  }, [nodesFeatureSignature, onUpdateStudents]);

  useEffect(() => {
    if (onUpdateEdges) {
      onUpdateEdges(prev => {
        const hasChanges = prev.length !== edges.length || prev.some((e, i) => {
          const matching = edges[i];
          if (!matching) return true;
          return e.from !== matching.from || e.to !== matching.to || e.weight !== matching.weight || e.type !== matching.type;
        });
        return hasChanges ? edges : prev;
      });
    }
  }, [edgesSignature, onUpdateEdges]);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [selectedNode, setSelectedNode] = useState<StudentCollabNode | null>(initialStudents[0]);
  const [popoverActiveNodeId, setPopoverActiveNodeId] = useState<string | null>(null);
  
  // Physics parameters adjustable by user
  const [gravity, setGravity] = useState<number>(0.15); // Global central pull
  const [repulsion, setRepulsion] = useState<number>(100); // Coulomb parameter
  const [linkForce, setLinkForce] = useState<number>(0.2); // Hooke spring parameter
  const [damping, setDamping] = useState<number>(0.85); // Velocity decay

  // Interactive modes
  const [resonanceThreshold, setResonanceThreshold] = useState<number>(5.5);
  const [engagementThreshold, setEngagementThreshold] = useState<number>(60); // percent (0-100)
  const [isConfigModalOpen, setIsConfigModalOpen] = useState<boolean>(false);

  const [activeResonanceShockId, setActiveResonanceShockId] = useState<string | null>(null);
  const [phaseSyncActive, setPhaseSyncActive] = useState<boolean>(false);
  const [alertLogs, setAlertLogs] = useState<string[]>([
    'Force-directed graph engine successfully initialized.',
    'Calculating spatial placement vectors styled by dynamic peer resonance coefficients.',
    'Standard Alpha, Beta, & Gamma clusters identified mapping multi-agent brainwave synchronies.'
  ]);

  // Dragging states
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const writeLog = (msg: string) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setAlertLogs(prev => [`[${time}] ${msg}`, ...prev.slice(0, 10)]);
  };

  // Run Physics Loop using requestAnimationFrame
  useEffect(() => {
    if (!isPlaying) return;

    let animFrame: number;

    const tick = () => {
      setNodes(prevNodes => {
        // Clone nodes for updates
        const nextNodes = prevNodes.map(n => ({ ...n }));

        // Map for fast index lookups
        const nodeMap: Record<string, StudentCollabNode> = {};
        nextNodes.forEach(n => {
          nodeMap[n.id] = n;
        });

        // 1. Repulsion force (Coulomb's Law)
        for (let i = 0; i < nextNodes.length; i++) {
          const nodeA = nextNodes[i];
          for (let j = i + 1; j < nextNodes.length; j++) {
            const nodeB = nextNodes[j];
            const dx = nodeA.x - nodeB.x;
            const dy = nodeA.y - nodeB.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 5;

            // Invert distance or limit to avoid extreme values close-up
            const maxRadius = 150;
            if (dist < maxRadius) {
              const capDist = Math.max(30, dist);
              // Force inverse proportional to square of distance
              const strength = (repulsion * 500) / (capDist * capDist);
              const fx = (dx / dist) * strength;
              const fy = (dy / dist) * strength;

              if (nodeA.id !== draggingId) {
                nodeA.vx += fx;
                nodeA.vy += fy;
              }
              if (nodeB.id !== draggingId) {
                nodeB.vx -= fx;
                nodeB.vy -= fy;
              }
            }
          }
        }

        // 2. Attraction Force (Hooke's Spring Law over edges)
        edges.forEach(edge => {
          const source = nodeMap[edge.from];
          const target = nodeMap[edge.to];
          if (!source || !target) return;

          const dx = target.x - source.x;
          const dy = target.y - source.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 5;

          // Resonance weight (1-10) scales rest length and stiffness
          const cognitiveResonance = edge.weight / 10;
          
          // Higher resonance pulls nodes closer and tighter together
          const targetDistance = phaseSyncActive ? 55 : 120 * (1.2 - cognitiveResonance);
          const stiffness = (phaseSyncActive ? 0.45 : linkForce * 0.15) * cognitiveResonance;

          const forceDiff = dist - targetDistance;
          const force = forceDiff * stiffness;

          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;

          if (source.id !== draggingId) {
            source.vx += fx;
            source.vy += fy;
          }
          if (target.id !== draggingId) {
            target.vx -= fx;
            target.vy -= fy;
          }
        });

        // 3. Central Gravity (Anchor coordinates back to container hub)
        const cx = width / 2;
        const cy = height / 2;
        nextNodes.forEach(node => {
          // Fallback sanity checks to prevent NaN cascade or drag residue in spatial metrics
          if (isNaN(node.x) || node.x === undefined) node.x = Math.random() * (width - 100) + 50;
          if (isNaN(node.y) || node.y === undefined) node.y = Math.random() * (height - 100) + 50;
          if (isNaN(node.vx) || node.vx === undefined) node.vx = 0;
          if (isNaN(node.vy) || node.vy === undefined) node.vy = 0;

          if (node.id === draggingId) return;

          const dx = cx - node.x;
          const dy = cy - node.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;

          node.vx += dx * (gravity * 0.05);
          node.vy += dy * (gravity * 0.05);

          // Dampen velocity
          node.vx *= damping;
          node.vy *= damping;

          // Clamp maximum speed to avoid chaotic flyaways
          const speedCap = 12;
          const speed = Math.sqrt(node.vx * node.vx + node.vy * node.vy);
          if (speed > speedCap && speed > 0) {
            node.vx = (node.vx / speed) * speedCap;
            node.vy = (node.vy / speed) * speedCap;
          }

          // Update actual coordinates
          node.x += node.vx;
          node.y += node.vy;

          // Keep within layout boundary constraints
          const padding = 25;
          if (node.x < padding) { node.x = padding; node.vx = -node.vx * 0.2; }
          if (node.x > width - padding) { node.x = width - padding; node.vx = -node.vx * 0.2; }
          if (node.y < padding) { node.y = padding; node.vy = -node.vy * 0.2; }
          if (node.y > height - padding) { node.y = height - padding; node.vy = -node.vy * 0.2; }

          // Final verification guarantees node coordinates are never NaN
          if (isNaN(node.x)) node.x = width / 2;
          if (isNaN(node.y)) node.y = height / 2;
        });

        return nextNodes;
      });

      animFrame = requestAnimationFrame(tick);
    };

    animFrame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animFrame);
  }, [isPlaying, edges, gravity, repulsion, linkForce, damping, draggingId, phaseSyncActive]);

  // Handle Drag Events on SVG Container
  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const pWidth = rect.width || 640;
    const pHeight = rect.height || 400;
    const mouseX = ((e.clientX - rect.left) / pWidth) * width;
    const mouseY = ((e.clientY - rect.top) / pHeight) * height;

    // Detect if mouse is over any student node circle (radius approx 24px)
    const clickedNode = nodes.find(node => {
      const dx = node.x - mouseX;
      const dy = node.y - mouseY;
      return Math.sqrt(dx * dx + dy * dy) <= 24;
    });

    if (clickedNode) {
      setDraggingId(clickedNode.id);
      setSelectedNode(clickedNode);
      setPopoverActiveNodeId(clickedNode.id);
      writeLog(`Dragging student vector: ${clickedNode.name}. Dynamic link spacing recalibrating.`);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!draggingId || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const pWidth = rect.width || 640;
    const pHeight = rect.height || 400;
    const mouseX = ((e.clientX - rect.left) / pWidth) * width;
    const mouseY = ((e.clientY - rect.top) / pHeight) * height;

    setNodes(prev => prev.map(node => {
      if (node.id === draggingId) {
        // Dynamic position override for dragged item
        return {
          ...node,
          x: Math.min(width - 20, Math.max(20, mouseX)),
          y: Math.min(height - 20, Math.max(20, mouseY)),
          vx: 0,
          vy: 0
        };
      }
      return node;
    }));
  };

  const handleMouseUpOrLeave = () => {
    if (draggingId) {
      writeLog(`Student position locked. Dynamic spring tension modeling initiated.`);
      setDraggingId(null);
    }
  };

  // Interaction actions
  const triggerPhaseSynchronizer = () => {
    if (phaseSyncActive) {
      setPhaseSyncActive(false);
      writeLog("Phase coherence stabilizer deactivated. Student networks returning to dynamic flow parameters.");
    } else {
      setPhaseSyncActive(true);
      // Bring all edges to a high resonance coherence
      setEdges(prev => prev.map(e => ({ ...e, weight: Math.min(10, e.weight + 2) })));
      writeLog("STIMULATED FLOW ALIGNMENT COHERENCE: Aligning classroom brainwaves to 10.5Hz Alpha-Frequency. Nodes cluster tightly.");
      
      // Briefly trigger ripple on selected node
      if (selectedNode) {
        setActiveResonanceShockId(selectedNode.id);
        setTimeout(() => setActiveResonanceShockId(null), 1200);
      }
    }
  };

  const triggerDynamicStressor = (nodeId: string) => {
    setActiveResonanceShockId(nodeId);
    writeLog(`CRITICAL BIO-STRESS CASCADE INJECTED AT PORTAL #[N_${nodeId}]. Synchronous alpha flow collapsing.`);
    
    // Distort edge resonance weights attached to this node
    setEdges(prev => prev.map(e => {
      if (e.from === nodeId || e.to === nodeId) {
        // Cascade: sever resonance strength down to low indices
        return { ...e, weight: Math.max(1, e.weight - 4) };
      }
      return e;
    }));

    // Visually nudge the node away with random kinetics
    setNodes(prev => prev.map(n => {
      if (n.id === nodeId) {
        return {
          ...n,
          vx: (Math.random() - 0.5) * 45,
          vy: (Math.random() - 0.5) * 45,
          features: [Math.min(1.0, n.features[0] + 0.20), 0.95, Math.max(0.05, n.features[2] - 0.35)] // Raise fatigue and stress
        };
      }
      return n;
    }));

    // Reset shock ripple
    setTimeout(() => {
      setActiveResonanceShockId(null);
    }, 1500);
  };

  const triggerTeamBreakoutShuffle = () => {
    // Shuffles edges for cross-group learning
    const shuffled = [...edges];
    // Modify some weights randomly to simulate real interactive chatter
    const updated = shuffled.map(e => {
      const change = Math.round((Math.random() - 0.5) * 4);
      return {
        ...e,
        weight: Math.min(10, Math.max(1, e.weight + change))
      };
    });
    setEdges(updated);
    writeLog("TEAM COLLABORATIVE CHANNELS SHUFFLED: Interactive chat logs and shared whiteboards updated.");
  };

  const handleResetForceDirectedLayout = () => {
    setNodes(initialStudents);
    setEdges(initialEdges);
    setPhaseSyncActive(false);
    writeLog("Restored GNN node coordinates and relational weights to default layout arrays.");
  };

  const simulateClusterCollapse = (groupName: 'Alpha' | 'Beta' | 'Gamma') => {
    writeLog(`[SIMULATOR] Injecting rapid engagement drop in Cluster ${groupName}...`);
    
    // Low contribution, high fatigue, high stress
    setNodes(prev => prev.map(n => {
      if (n.group === groupName) {
        return {
          ...n,
          attention: 'Low',
          fatigue: 'High',
          stress: 'High',
          features: [0.85, 0.90, 0.15], 
          vx: (Math.random() - 0.5) * 45,
          vy: (Math.random() - 0.5) * 45
        };
      }
      return n;
    }));

    // Cascade reduction in edges weights
    setEdges(prevEdges => prevEdges.map(e => {
      const sNode = initialStudents.find(n => n.id === e.from);
      const tNode = initialStudents.find(n => n.id === e.to);
      const inGroup = (sNode && sNode.group === groupName) || (tNode && tNode.group === groupName);
      if (inGroup) {
        return { ...e, weight: Math.max(1, Math.round(e.weight * 0.25)) };
      }
      return e;
    }));
  };

  interface ClusterAlert {
    id: string;
    cluster: 'Alpha' | 'Beta' | 'Gamma';
    type: 'resonance' | 'interaction' | 'both';
    resonanceVal: number;
    engagementVal: number;
    severity: 'High' | 'Critical';
    timestamp: string;
    description: string;
    recommendation: string;
  }

  const getClusterAlerts = (): ClusterAlert[] => {
    const alerts: ClusterAlert[] = [];
    const groups: ('Alpha' | 'Beta' | 'Gamma')[] = ['Alpha', 'Beta', 'Gamma'];

    groups.forEach(group => {
      const groupNodes = nodes.filter(n => n.group === group);
      if (groupNodes.length === 0) return;

      const groupNodeIds = new Set(groupNodes.map(n => n.id));

      // Avg engagement
      const avgContribution = groupNodes.reduce((sum, n) => sum + n.features[2], 0) / groupNodes.length;
      const avgEngagement = Math.round(avgContribution * 100);

      // Avg resonance
      const internalEdges = edges.filter(e => groupNodeIds.has(e.from) && groupNodeIds.has(e.to));
      const avgResonance = internalEdges.length > 0
        ? internalEdges.reduce((sum, e) => sum + e.weight, 0) / internalEdges.length
        : 0;

      const isResonanceCritical = avgResonance < resonanceThreshold;
      const isEngagementCritical = avgEngagement < engagementThreshold;

      if (isResonanceCritical || isEngagementCritical) {
        const severity = (isResonanceCritical && isEngagementCritical) ? 'Critical' : 'High';
        let desc = '';
        let reco = '';

        if (isResonanceCritical && isEngagementCritical) {
          desc = `Rapid drop in both engagement (${avgEngagement}%) and peer cognitive resonance (${avgResonance.toFixed(1)}/10) inside Group ${group}. Coherence index is highly compromised.`;
          reco = `Execute a seating realignment immediately, issue an Alpha-Coherence Phase Sync, or launch an active brain break for Group ${group}.`;
        } else if (isResonanceCritical) {
          desc = `Weak learning connection: Group ${group} resonance (${avgResonance.toFixed(1)}/10) fell below your threshold of ${resonanceThreshold}/10.`;
          reco = `Check cluster peer dynamics. A localized brainstorm sprint or allocating an active high-resonance student mentor will restore synchrony.`;
        } else {
          desc = `Low contribution: Group ${group} engagement level (${avgEngagement}%) falls below safety threshold of ${engagementThreshold}%.`;
          reco = `Push interactive workspace challenges or call on the focal mentor of Group ${group} to stimulate active collaboration.`;
        }

        alerts.push({
          id: `alert-${group}`,
          cluster: group,
          type: (isResonanceCritical && isEngagementCritical) ? 'both' : isResonanceCritical ? 'resonance' : 'interaction',
          resonanceVal: parseFloat(avgResonance.toFixed(1)),
          engagementVal: avgEngagement,
          severity,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          description: desc,
          recommendation: reco
        });
      }
    });

    return alerts;
  };

  const getAverages = () => {
    const totalEdg = edges.length || 1;
    let sumRes = 0;
    edges.forEach(e => sumRes += e.weight);
    const avgRes = sumRes / totalEdg;

    let sumAtten = 0;
    nodes.forEach(n => {
      const atVal = n.attention === 'High' ? 0.9 : n.attention === 'Moderate' ? 0.6 : 0.3;
      sumAtten += atVal;
    });
    const avgAtten = (sumAtten / nodes.length) * 100;

    return {
      resonance: Math.round(avgRes * 10), // out of 100%
      alignment: Math.round(avgAtten),
      isOptimal: avgRes > 6 && avgAtten > 70
    };
  };

  const stats = getAverages();
  const activeAlerts = getClusterAlerts();

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl relative overflow-hidden" id="gnn_force_directed_graph_canvas">
      
      {/* Visual background guide */}
      <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none">
        <Radio className="h-64 w-64 text-indigo-500 animate-ping stroke-[1]" />
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-5 relative z-10">
        <div>
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-indigo-950/50 border border-indigo-800/55 text-[9px] font-mono font-extrabold text-indigo-400 uppercase tracking-widest">
            <Radio className="h-3 w-3 text-indigo-400 animate-pulse" />
            <span>Interactive Node Physics</span>
          </span>
          <h3 className="text-sm font-black text-slate-100 font-sans tracking-tight uppercase flex items-center gap-2 mt-1">
            Student Cognitive Resonance Force-Directed Graph
          </h3>
          <p className="text-[11px] text-slate-400 max-w-xl">
            Spring lengths correspond to topological shared learning synchronizations. Grab, drag, and reorganize student nodes in real-time to adjust virtual collaboration physical models.
          </p>
        </div>

        {/* Play Pause Controls */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 items-center shrink-0 h-9">
          <button
            onClick={() => setIsConfigModalOpen(true)}
            className="p-1.5 px-2.5 rounded text-[10.5px] font-bold transition-all cursor-pointer bg-slate-900 border border-slate-800 text-indigo-400 hover:text-white hover:bg-indigo-950/40 flex items-center space-x-1 mr-1.5 h-7"
            title="Open Critical Thresholds Config Modal"
            id="gnn-open-config-btn"
          >
            <Sliders className="h-3 w-3" />
            <span>CONFIG</span>
          </button>

          <button
            onClick={() => setIsPlaying(prev => !prev)}
            className={`p-1.5 px-3 rounded text-[10.5px] font-bold transition-all cursor-pointer flex items-center space-x-1 ${
              isPlaying 
                ? 'bg-rose-950/40 border border-rose-900/40 text-rose-400 hover:bg-rose-900/30' 
                : 'bg-emerald-950/40 border border-emerald-900/40 text-emerald-400 hover:bg-emerald-900/30'
            }`}
            title={isPlaying ? 'Pause simulation frames' : 'Resume simulation physics'}
          >
            {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
            <span>{isPlaying ? 'PAUSE' : 'RESUME'}</span>
          </button>

          <button
            onClick={handleResetForceDirectedLayout}
            className="p-1.5 text-slate-400 hover:text-slate-100 transition-colors ml-1"
            title="Reset topological arrays"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Grid: 8 Cols Arena Canvas + 4 Cols Diagnostics details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 relative z-10">
        
        {/* FORCE DIRECTED SVG ARENA CONTAINER */}
        <div className="lg:col-span-8 flex flex-col justify-between bg-slate-950 border border-slate-850/80 rounded-xl p-3">
          
          <div className="flex items-center justify-between text-[11px] px-1 py-1.5 border-b border-slate-900 mb-2">
            <div className="flex items-center gap-1.5 text-slate-350">
              <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
              <span className="font-mono font-bold uppercase tracking-wider text-[10px]">Real-time Flow Coherence: {stats.resonance}%</span>
            </div>
            
            <div className="flex gap-4 text-[9px] text-slate-500 font-mono">
              <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-indigo-500" /> Alpha</span>
              <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Beta</span>
              <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> Gamma</span>
            </div>
          </div>

          {/* SVG Frame holding nodes & springs */}
          <div className="relative bg-slate-950 rounded-lg border border-slate-900 h-[360px] overflow-hidden select-none">
            
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.02),transparent_75%)] pointer-events-none" />

            <svg 
              ref={svgRef}
              className="absolute inset-0 w-full h-full cursor-crosshair"
              viewBox="0 0 640 400"
              preserveAspectRatio="xMidYMid meet"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUpOrLeave}
              onMouseLeave={handleMouseUpOrLeave}
            >
              <defs>
                {/* Node glowing gradients for active synchrony ripples */}
                <radialGradient id="nodeActiveGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="resonanceAlignGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#818cf8" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                </radialGradient>
                <linearGradient id="edgeResonantGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#312e81" />
                  <stop offset="50%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#312e81" />
                </linearGradient>
              </defs>

              {/* Edge connections rendered as spring vectors */}
              {edges.map((edge, idx) => {
                const source = nodes.find(n => n.id === edge.from);
                const target = nodes.find(n => n.id === edge.to);
                if (!source || !target) return null;

                // Edge weight relates to cognitive resonance
                const resonance = edge.weight / 10;
                
                // Colors corresponding to cognitive flow alignment helper
                let edgeColor = 'rgba(79, 70, 229, 0.25)';
                let glowColor = 'rgba(99, 102, 241, 0.6)';
                
                if (resonance > 0.75) {
                  edgeColor = 'rgba(99, 102, 241, 0.55)';
                  glowColor = '#818cf8';
                } else if (source.stress === 'High' || target.stress === 'High') {
                  edgeColor = 'rgba(239, 68, 68, 0.35)'; // Red stress linkage
                  glowColor = '#f87171';
                } else if (resonance < 0.45) {
                  edgeColor = 'rgba(148, 163, 184, 0.15)'; // Muted linkage
                  glowColor = '#94a3b8';
                }

                const dx = target.x - source.x;
                const dy = target.y - source.y;
                const dist = Math.sqrt(dx * dx + dy * dy) || 1;

                // Midpoint tracking for placing live floating weight value
                const midX = (source.x + target.x) / 2;
                const midY = (source.y + target.y) / 2;

                return (
                  <g key={`spring-edge-${idx}`} className="transition-all">
                    {/* Glowing wide shadow link backing */}
                    <line
                      x1={source.x}
                      y1={source.y}
                      x2={target.x}
                      y2={target.y}
                      stroke={glowColor}
                      strokeWidth={resonance > 0.75 ? 6 : 1}
                      strokeOpacity={resonance > 0.75 ? 0.08 : 0}
                    />

                    {/* Primary link line vector */}
                    <line
                      x1={source.x}
                      y1={source.y}
                      x2={target.x}
                      y2={target.y}
                      stroke={edgeColor}
                      strokeWidth={1 + resonance * 3.5}
                      strokeDasharray={resonance > 0.6 ? undefined : "3,4"}
                    />

                    {/* Dynamic flowing coherence particle pulses */}
                    {isPlaying && (
                      <circle
                        r="2.5"
                        fill={glowColor}
                        className="animate-pulse"
                      >
                        <animateMotion
                          dur={`${2.2 - resonance * 1.8}s`}
                          repeatCount="indefinite"
                          path={`M ${source.x} ${source.y} L ${target.x} ${target.y}`}
                        />
                      </circle>
                    )}

                    {/* Edge interactive weight annotation */}
                    {dist > 75 && (
                      <g transform={`translate(${midX}, ${midY})`}>
                        <rect
                          x="-10"
                          y="-7"
                          width="20"
                          height="14"
                          rx="4"
                          fill="#030712"
                          stroke="rgba(30, 41, 59, 0.8)"
                          strokeWidth="1"
                        />
                        <text
                          textAnchor="middle"
                          dominantBaseline="central"
                          fill={resonance > 0.7 ? '#818cf8' : '#64748b'}
                          fontSize="8.5px"
                          fontWeight="bold"
                          fontFamily="monospace"
                        >
                          {edge.weight}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}

              {/* Shockwave ripple ring */}
              {activeResonanceShockId && (() => {
                const source = nodes.find(n => n.id === activeResonanceShockId);
                if (!source) return null;
                return (
                  <g>
                    <circle
                      cx={source.x}
                      cy={source.y}
                      r="48"
                      fill="url(#nodeActiveGlow)"
                      className="animate-ping"
                    />
                    <circle
                      cx={source.x}
                      cy={source.y}
                      r="75"
                      fill="none"
                      stroke={phaseSyncActive ? "rgba(99, 102, 241, 0.3)" : "rgba(244, 63, 94, 0.25)"}
                      strokeWidth="2"
                      className="animate-pulse"
                    />
                  </g>
                );
              })()}

              {/* Render Nodes (Interactive Student Circles) */}
              {nodes.map(node => {
                const isSelected = selectedNode?.id === node.id;
                const isDragging = draggingId === node.id;
                
                // Team color profiles
                let nodeFill = '#4f46e5'; // Team Alpha default
                let nodeStroke = '#818cf8';
                let shadowGlow = 'rgba(79, 70, 229, 0.25)';
                
                if (node.group === 'Beta') {
                  nodeFill = '#059669'; // Team Beta
                  nodeStroke = '#34d399';
                  shadowGlow = 'rgba(5, 150, 105, 0.25)';
                } else if (node.group === 'Gamma') {
                  nodeFill = '#d97706'; // Team Gamma
                  nodeStroke = '#fbbf24';
                  shadowGlow = 'rgba(217, 119, 6, 0.25)';
                }

                // If highly stressed, display crimson border
                const isStressed = node.features[1] > 0.75;
                if (isStressed) {
                  nodeStroke = '#f43f5e';
                  shadowGlow = 'rgba(244, 63, 94, 0.45)';
                }

                return (
                  <g key={`fd-node-${node.id}`} className="cursor-grab select-none">
                    {/* Underlying interactive drag halo */}
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r="22"
                      fill="none"
                      stroke={isSelected ? '#6366f1' : 'transparent'}
                      strokeWidth="1.5"
                      strokeDasharray={isDragging ? '4,4' : undefined}
                      className="transition-all"
                    />

                    {/* Outer glow ring backing for stress/flow state */}
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r="16"
                      fill="transparent"
                      stroke={shadowGlow}
                      strokeWidth="7"
                      className={isStressed ? "animate-pulse" : undefined}
                    />

                    {/* Primary Node Sphere */}
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r="15"
                      fill="#0b0f19"
                      stroke={nodeStroke}
                      strokeWidth={isSelected ? 3.5 : 2}
                      className="transition-all"
                    />

                    {/* Human init labels */}
                    <text
                      x={node.x}
                      y={node.y}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill="#f1f5f9"
                      fontSize="9px"
                      fontWeight="bold"
                      fontFamily="sans-serif"
                    >
                      {node.name.split(' ').map(n=>n[0]).join('')}
                    </text>

                    {/* High Fatigued symbol indicator */}
                    {node.features[0] > 0.7 && (
                      <g transform={`translate(${node.x + 9}, ${node.y - 12})`}>
                        <circle r="4.5" fill="#f43f5e" />
                        <path d="M-0.5 -1.5 L-0.5 1.5 M-0.5 2.5 L-0.5 2.5" stroke="#fff" strokeWidth="1" />
                      </g>
                    )}

                    {/* Tag id text beneath standard student */}
                    <text
                      x={node.x}
                      y={node.y + 24}
                      textAnchor="middle"
                      fill="#94a3b8"
                      fontSize="8px"
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      {node.name.split(' ')[0]}
                    </text>
                  </g>
                );
              })}
            </svg>

            {popoverActiveNodeId && (() => {
              const pNode = nodes.find(n => n.id === popoverActiveNodeId);
              if (!pNode) return null;
              
              // Team color profiles
              let teamBorder = 'border-indigo-500/40 shadow-indigo-950/40 text-indigo-400';
              let teamBadge = 'bg-indigo-950 text-indigo-400 border-indigo-900/50';
              if (pNode.group === 'Beta') {
                teamBorder = 'border-emerald-500/40 shadow-emerald-950/40 text-emerald-400';
                teamBadge = 'bg-emerald-950 text-emerald-400 border-emerald-900/50';
              } else if (pNode.group === 'Gamma') {
                teamBorder = 'border-amber-500/40 shadow-amber-950/40 text-amber-400';
                teamBadge = 'bg-amber-950 text-amber-400 border-amber-900/50';
              }
              
              // If stressed features[1] > 0.75 show red accent
              const isPNodeStressed = pNode.features[1] > 0.75;
              if (isPNodeStressed) {
                teamBorder = 'border-rose-500/50 shadow-rose-950/50 text-rose-400';
              }

              // Determine display position relative to node coordinate
              const isUpperHalf = pNode.y < 185;
              const popoverWidth = 240;
              const popoverHeight = 180; 
              
              const popoverLeft = Math.max(12, Math.min(width - popoverWidth - 12, pNode.x - popoverWidth / 2));
              const popoverTop = isUpperHalf ? (pNode.y + 24) : (pNode.y - popoverHeight - 24);

              // Scores for academic trend
              const scores = academicProgressionData[pNode.id] || [80, 80, 80, 80, 80, 80];
              const maxVal = 100;
              const minVal = 50;
              const sparkH = 28;
              const sparkW = 200;
              const points = scores.map((score, sIdx) => {
                const sx = (sIdx / (scores.length - 1)) * sparkW;
                const sy = sparkH - ((score - minVal) / (maxVal - minVal)) * sparkH;
                return `${sx},${sy}`;
              });
              const pathStr = `M ${points.join(' L ')}`;
              const areaPathStr = `${pathStr} L ${sparkW},${sparkH} L 0,${sparkH} Z`;
              const isUpwardTrend = scores[scores.length - 1] >= scores[0];

              return (
                <div
                  id="student-popover-card"
                  className={`absolute z-40 bg-slate-900/95 border ${teamBorder} rounded-xl p-3 shadow-[0_15px_30px_rgba(0,0,0,0.65)] backdrop-blur-md transition-all duration-150 text-left`}
                  style={{
                    left: `${popoverLeft}px`,
                    top: `${popoverTop}px`,
                    width: `${popoverWidth}px`
                  }}
                  onMouseDown={(e) => e.stopPropagation()} // Stop propagation so we don't trigger canvas node selection or drag events on the card!
                >
                  {/* Close and Title Row */}
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5 mb-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className={`text-[8px] uppercase font-mono font-black border rounded px-1.5 py-0.2 select-none ${teamBadge}`}>
                        {pNode.group} W-{pNode.id}
                      </span>
                      <strong className="text-slate-100 text-xs font-bold leading-none truncate block">
                        {pNode.name}
                      </strong>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPopoverActiveNodeId(null);
                      }}
                      className="text-slate-400 hover:text-rose-400 p-0.5 rounded cursor-pointer pointer-events-auto hover:bg-slate-800/60 font-bold"
                      title="Close"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>

                  {/* Real-time attention and stress metrics */}
                  <div className="grid grid-cols-2 gap-2 mb-2 text-[10.5px]">
                    {/* Attention */}
                    <div className="bg-slate-950/50 border border-slate-850/60 rounded-lg p-1.5 text-center">
                      <span className="text-[8px] text-slate-500 font-mono block uppercase">Attention</span>
                      <div className="flex items-center justify-center gap-1 mt-0.5">
                        <span className={`h-1.5 w-1.5 rounded-full ${pNode.attention === 'High' ? 'bg-emerald-500 animate-pulse' : pNode.attention === 'Moderate' ? 'bg-amber-500' : 'bg-rose-500 animate-ping'}`} />
                        <strong className={`font-bold ${pNode.attention === 'High' ? 'text-emerald-400' : pNode.attention === 'Moderate' ? 'text-amber-400' : 'text-rose-400'}`}>
                          {pNode.attention}
                        </strong>
                      </div>
                    </div>

                    {/* Stress */}
                    <div className="bg-slate-950/50 border border-slate-850/60 rounded-lg p-1.5 text-center">
                      <span className="text-[8px] text-slate-500 font-mono block uppercase">Stress</span>
                      <div className="flex items-center justify-center gap-1 mt-0.5">
                        <span className={`h-1.5 w-1.5 rounded-full ${pNode.stress === 'Low' ? 'bg-emerald-500' : pNode.stress === 'Moderate' ? 'bg-amber-500' : 'bg-rose-500 animate-pulse'}`} />
                        <strong className={`font-bold ${pNode.stress === 'Low' ? 'text-emerald-400' : pNode.stress === 'Moderate' ? 'text-amber-400' : 'text-rose-400'}`}>
                          {pNode.stress} <span className="text-[8px] font-mono text-slate-400 font-normal">({(pNode.features[1] * 100).toFixed(0)}%)</span>
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Academic Regression trend */}
                  <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-850">
                    <div className="flex justify-between items-center text-[8px] text-slate-500 uppercase tracking-wider font-mono mb-1">
                      <span>Academic Progress</span>
                      <span className={`font-bold ${isUpwardTrend ? "text-emerald-400" : "text-rose-400"}`}>
                        {isUpwardTrend ? '📈 Upward' : '📉 Decline'} ({scores[scores.length - 1]}%)
                      </span>
                    </div>

                    <div className="relative h-7 w-full overflow-hidden">
                      <svg className="w-full h-full overflow-visible" viewBox={`0 0 ${sparkW} ${sparkH}`} preserveAspectRatio="none">
                        <defs>
                          <linearGradient id={`popover-spark-grad-${pNode.id}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={isUpwardTrend ? '#10b981' : '#f43f5e'} stopOpacity="0.25" />
                            <stop offset="100%" stopColor={isUpwardTrend ? '#10b981' : '#f43f5e'} stopOpacity="0" />
                          </linearGradient>
                        </defs>
                        <line x1="0" y1={sparkH/2} x2={sparkW} y2={sparkH/2} stroke="#1e293b" strokeDasharray="3,3" strokeWidth="0.75" />
                        <path d={areaPathStr} fill={`url(#popover-spark-grad-${pNode.id})`} />
                        <path d={pathStr} fill="none" stroke={isUpwardTrend ? '#10b981' : '#f43f5e'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        {scores.map((score, sIdx) => {
                          const sx = (sIdx / (scores.length - 1)) * sparkW;
                          const sy = sparkH - ((score - minVal) / (maxVal - minVal)) * sparkH;
                          return (
                            <circle
                              key={sIdx}
                              cx={sx}
                              cy={sy}
                              r={sIdx === scores.length - 1 ? "2.5" : "1.5"}
                              fill={sIdx === scores.length - 1 ? (isUpwardTrend ? '#10b981' : '#f43f5e') : '#475569'}
                              stroke="#0f172a"
                              strokeWidth="0.5"
                            />
                          );
                        })}
                      </svg>
                    </div>
                  </div>

                  {/* Micro Helper Note */}
                  <span className="text-[7.5px] text-slate-500 font-mono text-center block mt-1">
                    Wearer bio-telemetry updated 1s ago
                  </span>
                </div>
              );
            })()}
          </div>

          {/* Spring constants adjustable parameters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-slate-900 pt-3 text-[10px] text-slate-400">
            <div>
              <div className="flex justify-between items-center mb-0.5">
                <span>Charge (Repelling)</span>
                <span className="text-slate-300 font-bold">{repulsion}</span>
              </div>
              <input
                type="range"
                min="20"
                max="250"
                value={repulsion}
                onChange={(e) => setRepulsion(parseInt(e.target.value))}
                className="w-full accent-indigo-500 h-1 bg-slate-900 rounded cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-0.5">
                <span>Spring Tension</span>
                <span className="text-slate-300 font-bold">{(linkForce).toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.50"
                step="0.05"
                value={linkForce}
                onChange={(e) => setLinkForce(parseFloat(e.target.value))}
                className="w-full accent-indigo-500 h-1 bg-slate-900 rounded cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-0.5">
                <span>Central Pull</span>
                <span className="text-slate-300 font-bold">{(gravity).toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.02"
                max="0.40"
                step="0.02"
                value={gravity}
                onChange={(e) => setGravity(parseFloat(e.target.value))}
                className="w-full accent-indigo-500 h-1 bg-slate-900 rounded cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-0.5">
                <span>Viscous Friction</span>
                <span className="text-slate-300 font-bold">{(damping).toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.60"
                max="0.95"
                step="0.05"
                value={damping}
                onChange={(e) => setDamping(parseFloat(e.target.value))}
                className="w-full accent-indigo-500 h-1 bg-slate-900 rounded cursor-pointer"
              />
            </div>
          </div>

        </div>

        {/* FORCE DIRECTED SIDE PANEL */}
        <div className="lg:col-span-4 flex flex-col space-y-4">
          
          {/* Quick Stats Panel */}
          <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl">
            <h4 className="text-slate-205 text-slate-200 text-xs font-bold uppercase tracking-wider font-mono mb-3 flex items-center gap-1.5 border-b border-slate-900 pb-1.5">
              <Activity className="h-4 w-4 text-emerald-400" />
              Relational Bio-Diagnostics
            </h4>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="bg-slate-900/40 border border-slate-850 p-2.5 rounded-lg text-center">
                <span className="text-[9px] text-slate-500 block uppercase font-mono font-bold">Resonance</span>
                <strong className={`text-lg font-bold font-mono ${stats.resonance > 65 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {stats.resonance}%
                </strong>
                <span className="text-[8px] text-slate-400 block mt-0.5">Group alignment</span>
              </div>

              <div className="bg-slate-900/40 border border-slate-850 p-2.5 rounded-lg text-center">
                <span className="text-[9px] text-slate-500 block uppercase font-mono font-bold">Coherence</span>
                <strong className="text-lg font-bold font-mono text-indigo-400">
                  {stats.alignment}%
                </strong>
                <span className="text-[8px] text-slate-400 block mt-0.5">Focus levels</span>
              </div>
            </div>

            {/* Quick intervention advice */}
            <div className="bg-emerald-950/20 border border-emerald-900/45 p-2 rounded-lg text-[10.5px] text-slate-450 text-slate-300 leading-normal">
              {stats.isOptimal ? (
                <p>
                  🚀 <strong>High Resonance Detected:</strong> Dynamic clusters show students in highly aligned cognitive alignment (typical of productive co-learning). Keep active parameters constant.
                </p>
              ) : (
                <p>
                  ⚠️ <strong>Resonance Bottlenecks:</strong> Certain student pairs have low alignment coherence indices. Execute <em>Phase Synchronization</em> or seating updates to restore engagement.
                </p>
              )}
            </div>
          </div>

          {/* HIGH-PRIORITY ALERT TRAY */}
          <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl flex-col" id="gnn-alert-tray">
            <div className="flex items-center justify-between pb-2 border-b border-slate-900 mb-3">
              <h4 className="text-slate-205 text-slate-200 text-xs font-bold uppercase tracking-wider font-mono flex items-center gap-1.5">
                <ShieldAlert className="h-4 w-4 text-rose-500" />
                Cluster-Level Alerts ({activeAlerts.length})
              </h4>
              <span className="text-[9px] text-slate-500 font-mono bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                Res &lt; {resonanceThreshold} | Eng &lt; {engagementThreshold}%
              </span>
            </div>

            {activeAlerts.length > 0 ? (
              <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
                {activeAlerts.map(alert => (
                  <div key={alert.id} className="bg-rose-950/20 border border-rose-900/40 p-3 rounded-lg relative overflow-hidden backdrop-blur-sm shadow-inner transition-all hover:bg-rose-955/25">
                    {/* Blink badge */}
                    <div className="absolute top-1 right-1 h-2 w-2 bg-rose-500 animate-ping rounded-full m-3" />
                    
                    <div className="flex items-center justify-between font-mono mb-2 text-[10px]">
                      <span className="font-extrabold uppercase text-rose-400 flex items-center gap-1">
                        <Flame className="h-3.5 w-3.5 animate-pulse" />
                        {alert.cluster} Cluster - {alert.severity}
                      </span>
                      <span className="text-[8.5px] text-slate-400 uppercase bg-rose-955/50 px-1 rounded border border-rose-900/30">
                        {alert.timestamp}
                      </span>
                    </div>

                    <p className="text-[10.5px] text-slate-300 leading-snug mb-2.5">
                      {alert.description}
                    </p>

                    <div className="text-[10px] text-emerald-400 bg-emerald-950/20 px-2.5 py-2 rounded border border-emerald-900/30 leading-snug mb-2.5">
                      <strong>Solution:</strong> {alert.recommendation}
                    </div>

                    {/* Quick action resolve button */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          // Actionable remedy
                          setNodes(prev => prev.map(n => {
                            if (n.group === alert.cluster) {
                              const baseInit = initialStudents.find(i => i.id === n.id)!;
                              return { ...n, attention: 'High', stress: 'Low', features: [0.20, 0.25, 0.85] };
                            }
                            return n;
                          }));
                          // Reset edge weights
                          setEdges(prevEdges => prevEdges.map(e => {
                            const initE = initialEdges.find(ie => ie.from === e.from && ie.to === e.to);
                            if (initE) {
                              const s = initialStudents.find(n => n.id === e.from);
                              if (s && s.group === alert.cluster) {
                                return { ...e, weight: initE.weight };
                              }
                            }
                            return e;
                          }));
                          writeLog(`[RESOLVED] Re-established attention parameters and learning synchronies for ${alert.cluster} Cluster.`);
                        }}
                        className="flex-1 py-1.5 px-2 bg-emerald-950/40 hover:bg-emerald-900/30 border border-emerald-800/50 text-emerald-400 font-bold font-mono text-[9px] rounded uppercase transition-colors cursor-pointer text-center"
                      >
                        ✓ Resolve & Realign
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-3.5 bg-slate-900/40 border border-slate-850 rounded-lg text-center">
                  <div className="flex items-center justify-center space-x-1.5 text-emerald-400 text-[10.5px] font-bold font-mono">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 animate-pulse" />
                    <span>ALL CLUSTERS BELOW THRESHOLDS</span>
                  </div>
                  <p className="text-[9.5px] text-slate-500 mt-1 leading-normal">
                    No active student groups showing rapid drop in learning engagement or cognitive mismatch.
                  </p>
                </div>

                {/* Simulation block */}
                <div className="pt-2.5 border-t border-slate-900">
                  <span className="text-[9px] font-mono text-slate-500 block uppercase mb-1.5">Test Alert Triggers:</span>
                  <div className="grid grid-cols-3 gap-1.5 text-[9px] font-mono">
                    <button
                      type="button"
                      onClick={() => simulateClusterCollapse('Alpha')}
                      className="py-1 bg-slate-900 hover:bg-rose-950/20 hover:text-rose-400 text-slate-400 hover:border-rose-900/40 rounded transition-all cursor-pointer text-center border border-slate-850"
                    >
                      Fail Alpha
                    </button>
                    <button
                      type="button"
                      onClick={() => simulateClusterCollapse('Beta')}
                      className="py-1 bg-slate-900 hover:bg-rose-950/20 hover:text-rose-400 text-slate-400 hover:border-rose-900/40 rounded transition-all cursor-pointer text-center border border-slate-850"
                    >
                      Fail Beta
                    </button>
                    <button
                      type="button"
                      onClick={() => simulateClusterCollapse('Gamma')}
                      className="py-1 bg-slate-900 hover:bg-rose-950/20 hover:text-rose-400 text-slate-400 hover:border-rose-900/40 rounded transition-all cursor-pointer text-center border border-slate-850"
                    >
                      Fail Gamma
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Selected Node Details Card */}
          <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-900 mb-3 text-[10px]">
                <span className="font-mono font-bold uppercase text-slate-400">Active Node Portal</span>
                {selectedNode && (
                  <span className="bg-indigo-950 text-indigo-400 px-1.5 py-0.2 rounded font-mono">
                    ID #{selectedNode.id}
                  </span>
                )}
              </div>

              {selectedNode ? (
                <div className="space-y-4">
                  <div>
                    <h5 className="font-sans font-extrabold text-slate-100 text-sm tracking-tight">{selectedNode.name}</h5>
                    <div className="flex gap-2 mt-1">
                      <span className="text-[8.5px] bg-slate-900 border border-slate-850 text-slate-400 px-1.5 py-0.2 rounded">
                        Role: {selectedNode.role}
                      </span>
                      <span className="text-[8.5px] bg-indigo-950 text-indigo-405 text-indigo-400 border border-indigo-900/50 px-1.5 py-0.2 rounded font-mono font-bold">
                        Group {selectedNode.group}
                      </span>
                    </div>
                  </div>

                  {/* Attributes Gauges */}
                  <div className="space-y-2 text-[10px] text-slate-450">
                    <div>
                      <div className="flex justify-between items-center text-[9px] text-slate-500 uppercase font-mono tracking-wider mb-1">
                        <span>Anxiety Level</span>
                        <strong className={selectedNode.features[1] > 0.7 ? 'text-rose-450 text-rose-400' : 'text-indigo-400'}>
                          {(selectedNode.features[1] * 100).toFixed(0)}%
                        </strong>
                      </div>
                      <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${selectedNode.features[1] > 0.75 ? 'bg-rose-500' : 'bg-indigo-500'}`}
                          style={{ width: `${selectedNode.features[1] * 100}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center text-[9px] text-slate-500 uppercase font-mono tracking-wider mb-1">
                        <span>Active Collaboration Contribution</span>
                        <strong className="text-emerald-455 text-emerald-400">
                          {(selectedNode.features[2] * 100).toFixed(0)}%
                        </strong>
                      </div>
                      <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-500"
                          style={{ width: `${selectedNode.features[2] * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Node Wave visualization mock */}
                  <div className="bg-slate-900/40 border border-slate-850 p-2 rounded-lg relative overflow-hidden">
                    <span className="text-[8px] font-mono text-slate-500 block uppercase mb-1">Brainwave synchronization alignment frequency</span>
                    <div className="h-10 flex items-center justify-center">
                      <svg viewBox="0 0 100 40" className="w-full h-full stroke-indigo-450 stroke-indigo-400 fill-none">
                        <path 
                          d={phaseSyncActive 
                            ? "M 0 20 Q 25 5, 50 35 T 100 20" 
                            : isStressed(selectedNode.features[1]) 
                              ? "M 0 20 L 5 10 L 10 30 L 15 5 L 20 35 L 25 10 L 30 30 L 35 15 L 40 30 L 45 5 L 50 35 L 55 10 L 60 30 L 65 15 L 70 35 L 75 5 L 80 30 L 85 10 L 90 35 L 95 20 L 100 20"
                              : "M 0 20 Q 15 10, 30 30 T 60 10 T 90 30 L 100 20"
                          } 
                          strokeWidth="1.5"
                          className={isPlaying ? "animate-[dash_1.2s_linear_infinite]" : undefined}
                          strokeDasharray={phaseSyncActive ? "none" : "4,2"}
                        />
                      </svg>
                    </div>
                  </div>

                  {/* Interactive actions for this selected node */}
                  <div className="grid grid-cols-2 gap-2 text-[10.5px]">
                    <button
                      onClick={() => triggerDynamicStressor(selectedNode.id)}
                      className="py-1.5 bg-rose-955 bg-rose-950/40 border border-rose-900/50 text-rose-400 rounded-lg font-bold hover:bg-rose-900/30 transition-colors cursor-pointer flex items-center justify-center gap-1 leading-none"
                    >
                      <Flame className="h-3.5 w-3.5" />
                      <span>Inject Stressor</span>
                    </button>

                    <button
                      onClick={() => {
                        // Isolate student: clear its anxiety features
                        setNodes(prev => prev.map(n => {
                          if (n.id === selectedNode.id) {
                            return { ...n, features: [0.15, 0.15, n.features[2]] };
                          }
                          return n;
                        }));
                        writeLog(`Isolated classroom anchor [${selectedNode.name}]. Stress cooling down.`);
                      }}
                      className="py-1.5 bg-indigo-950/40 border border-indigo-900/50 text-indigo-400 rounded-lg font-bold hover:bg-indigo-900/30 transition-colors cursor-pointer flex items-center justify-center gap-1 leading-none"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      <span>Cool Down Portal</span>
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-[11px] text-slate-500 text-center py-10">
                  Select a student node on the graph canvas to trace live resonance metrics, view brainwaves, or inject simulation stressors.
                </p>
              )}

            </div>

            {/* Live action selectors */}
            <div className="border-t border-slate-900 pt-3.5 mt-4 space-y-2">
              <button
                onClick={triggerPhaseSynchronizer}
                className={`w-full py-2.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  phaseSyncActive
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950'
                    : 'bg-indigo-750 bg-indigo-600 hover:bg-indigo-500 border border-indigo-500 text-white shadow-lg'
                }`}
              >
                <Sparkles className="h-4 w-4 text-amber-300" />
                <span>{phaseSyncActive ? 'ACTIVE ALPHA PHASE SYNC' : 'STIMULATE PHASE SYNCHRONY'}</span>
              </button>

              <button
                onClick={triggerTeamBreakoutShuffle}
                className="w-full py-2 text-xs font-bold bg-slate-900 hover:bg-slate-850 text-indigo-455 text-indigo-400 border border-indigo-950 hover:border-indigo-850 rounded-lg transition-all cursor-pointer"
              >
                Shuffle Shared Interaction Channels
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* REAL-TIME TELEMETRY TRACE TRAIL */}
      <div className="bg-slate-950 border border-slate-855 rounded-xl p-3 mt-4 text-[11px]">
        <div className="flex items-center space-x-2 border-b border-slate-900 pb-2 mb-2">
          <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-ping"></div>
          <span className="font-mono text-slate-450 uppercase font-bold text-[9px] tracking-wide">Relational Physics Telemetry Stream</span>
        </div>

        <div className="font-mono text-[9px] space-y-1 bg-slate-900/50 p-2 rounded max-h-[100px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800">
          {alertLogs.map((log, index) => (
            <div key={index} className="text-slate-300 border-l border-slate-800 pl-2">
              {log}
            </div>
          ))}
        </div>
      </div>

      {/* TRIGGERED THRESHOLDS CONFIGURATION OVERLAY MODAL */}
      {isConfigModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-all" id="gnn-config-modal-overlay">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            {/* Close button icon */}
            <button
              onClick={() => setIsConfigModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white hover:bg-slate-800 p-1.5 rounded-lg transition-colors cursor-pointer"
              title="Close modal"
              type="button"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800 mb-5">
              <div className="p-2 bg-indigo-950 text-indigo-400 rounded-xl border border-indigo-850">
                <Sliders className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-100 uppercase tracking-tight font-sans">Critical Thresholds Manager</h4>
                <p className="text-[11px] text-slate-400">Define GNN telemetry cutoffs for real-time risk classification.</p>
              </div>
            </div>

            {/* Content sliders */}
            <div className="space-y-6">
              {/* Slider 1: Critical Resonance Threshold */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-1.5">
                    <Radio className="h-3.5 w-3.5 text-indigo-400 animate-pulse" />
                    Critical Resonance
                  </label>
                  <span className="text-xs font-black font-mono text-indigo-400 bg-indigo-950 px-2 py-0.5 rounded border border-indigo-900/50">
                    {resonanceThreshold.toFixed(1)} / 10
                  </span>
                </div>
                <p className="text-[10px] text-slate-450 leading-relaxed mb-2.5 text-slate-400">
                  Triggers an alarm if cluster peer learning connections fall below this weighted Spring Force value (typical: 4.5 - 6.5).
                </p>
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-mono text-slate-500">1.0</span>
                  <input
                    type="range"
                    min="1.0"
                    max="10.0"
                    step="0.5"
                    value={resonanceThreshold}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setResonanceThreshold(val);
                      writeLog(`Updated Critical Resonance threshold limit to ${val.toFixed(1)}/10.`);
                    }}
                    className="flex-1 accent-indigo-500 h-1.5 bg-slate-950 rounded-lg cursor-pointer"
                  />
                  <span className="text-[10px] font-mono text-slate-400 text-indigo-400">10.0</span>
                </div>
              </div>

              {/* Slider 2: Critical Engagement Threshold (Contribution) */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-1.5">
                    <Activity className="h-3.5 w-3.5 text-emerald-400" />
                    Critical Engagement
                  </label>
                  <span className="text-xs font-black font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-900/50">
                    {engagementThreshold}%
                  </span>
                </div>
                <p className="text-[10px] text-slate-450 leading-relaxed mb-2.5 text-slate-400">
                  Triggers a warning if students' average actively-measured contribution percent falls below this level (typical: 50% - 70%).
                </p>
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-mono text-slate-500">20%</span>
                  <input
                    type="range"
                    min="20"
                    max="95"
                    step="5"
                    value={engagementThreshold}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setEngagementThreshold(val);
                      writeLog(`Updated Critical Engagement threshold limit to ${val}%.`);
                    }}
                    className="flex-1 accent-emerald-500 h-1.5 bg-slate-950 rounded-lg cursor-pointer"
                  />
                  <span className="text-[10px] font-mono text-slate-400 text-emerald-400 font-bold">95%</span>
                </div>
              </div>

              {/* Quick Preset Actions */}
              <div className="bg-slate-950 border border-slate-855 p-3 rounded-xl">
                <span className="text-[10px] font-mono font-bold text-slate-400 block uppercase tracking-wide mb-2">Simulate Active Drops to Test Alerts</span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => {
                      simulateClusterCollapse('Alpha');
                      setIsConfigModalOpen(false);
                    }}
                    className="p-1.5 rounded bg-slate-900 hover:bg-rose-950/30 border border-slate-850 hover:border-rose-900/30 text-[9.5px] font-mono text-slate-300 hover:text-rose-400 transition-all cursor-pointer text-center"
                    type="button"
                  >
                    Collapse Alpha
                  </button>
                  <button
                    onClick={() => {
                      simulateClusterCollapse('Beta');
                      setIsConfigModalOpen(false);
                    }}
                    className="p-1.5 rounded bg-slate-900 hover:bg-rose-950/30 border border-slate-850 hover:border-rose-900/30 text-[9.5px] font-mono text-slate-300 hover:text-rose-400 transition-all cursor-pointer text-center"
                    type="button"
                  >
                    Collapse Beta
                  </button>
                  <button
                    onClick={() => {
                      simulateClusterCollapse('Gamma');
                      setIsConfigModalOpen(false);
                    }}
                    className="p-1.5 rounded bg-slate-900 hover:bg-rose-950/30 border border-slate-850 hover:border-rose-900/30 text-[9.5px] font-mono text-slate-300 hover:text-rose-400 transition-all cursor-pointer text-center"
                    type="button"
                  >
                    Collapse Gamma
                  </button>
                </div>
              </div>
            </div>

            {/* Footer buttons */}
            <div className="flex gap-2.5 border-t border-slate-800 pt-4 mt-6">
              <button
                onClick={() => {
                  setResonanceThreshold(5.5);
                  setEngagementThreshold(60);
                  writeLog("Reset telemetry thresholds to default system baselines (Resonance: 5.5, Engagement: 60%).");
                }}
                className="flex-1 py-2 text-xs font-bold text-slate-400 bg-slate-950 hover:bg-slate-900 border border-slate-850 hover:text-slate-200 rounded-xl transition-all cursor-pointer text-center"
                type="button"
              >
                Reset Default
              </button>
              <button
                onClick={() => setIsConfigModalOpen(false)}
                className="flex-1 py-2 text-xs font-black text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-950/50 transition-all cursor-pointer text-center"
                type="button"
              >
                Apply Cutoffs
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );

  function isStressed(stressLevel: number) {
    return stressLevel > 0.75;
  }
}
