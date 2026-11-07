import React, { useState, useEffect } from 'react';
import { Users, LayoutGrid, AlertTriangle, CheckSquare, Sparkles, HelpCircle, Activity, Heart, ShieldAlert, Zap, Layers, Volume2, TrendingUp, Calendar, GitBranch, Network, Award } from 'lucide-react';
import { CognitiveState, BiometricState } from '../types';
import { getWellnessCheckIns, WellnessData, getDistressSignals, DistressSignal } from '../lib/firebase';
import CognitiveTrendAnalytics from './CognitiveTrendAnalytics';
import GnnCollaborationLab from './GnnCollaborationLab';
import GnnPredictiveBurnoutModeler from './GnnPredictiveBurnoutModeler';
import ModelAccuracyTable from './ModelAccuracyTable';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  BarChart,
  Bar
} from 'recharts';

interface StudentData {
  id: string;
  name: string;
  attention: 'High' | 'Moderate' | 'Low';
  stress: 'High' | 'Moderate' | 'Low';
  fatigue: 'High' | 'Moderate' | 'Low';
  hrv: number;
  gsr: number;
  posture: string;
}

interface TeacherDashboardProps {
  cognitive?: CognitiveState;
  biometric?: BiometricState;
}

export default function TeacherDashboard({ cognitive, biometric }: TeacherDashboardProps) {
  // Mock student roster of exactly 60 students
  const [students, setStudents] = useState<StudentData[]>(() => {
    const baseList: StudentData[] = [
      { id: '1', name: 'Alex Mercer', attention: 'High', stress: 'Low', fatigue: 'Low', hrv: 85, gsr: 3.2, posture: 'Proper' },
      { id: '2', name: 'Jack Peterson', attention: 'Low', stress: 'High', fatigue: 'High', hrv: 32, gsr: 9.8, posture: 'Slouched' },
      { id: '3', name: 'Sophia Lin', attention: 'High', stress: 'Moderate', fatigue: 'Low', hrv: 62, gsr: 5.4, posture: 'Proper' },
      { id: '4', name: 'Ethan Hunt', attention: 'Moderate', stress: 'Low', fatigue: 'Moderate', hrv: 72, gsr: 4.1, posture: 'Moving' },
      { id: '5', name: 'Chloe Fraser', attention: 'High', stress: 'Low', fatigue: 'Low', hrv: 94, gsr: 2.8, posture: 'Proper' },
      { id: '6', name: 'Zack Ward', attention: 'Low', stress: 'Low', fatigue: 'High', hrv: 69, gsr: 3.0, posture: 'Micro-naps' },
      { id: '7', name: 'Abby Williams', attention: 'Moderate', stress: 'High', fatigue: 'Moderate', hrv: 44, gsr: 8.5, posture: 'Forward lean' },
      { id: '8', name: 'Lucas Scott', attention: 'High', stress: 'Low', fatigue: 'Low', hrv: 88, gsr: 3.3, posture: 'Proper' },
      { id: '9', name: 'Mia Wong', attention: 'High', stress: 'Moderate', fatigue: 'Low', hrv: 55, gsr: 5.8, posture: 'Slouched' },
      { id: '10', name: 'Noah Miller', attention: 'Low', stress: 'Moderate', fatigue: 'High', hrv: 48, gsr: 6.2, posture: 'Restless' },
      { id: '11', name: 'Emma Davis', attention: 'Moderate', stress: 'Low', fatigue: 'Low', hrv: 79, gsr: 3.9, posture: 'Proper' },
      { id: '12', name: 'Oliver Taylor', attention: 'High', stress: 'Low', fatigue: 'Low', hrv: 90, gsr: 2.9, posture: 'Proper' }
    ];

    const firstNames = [
      'John', 'Robert', 'William', 'James', 'David', 'Joseph', 'Charles', 'Thomas', 'Daniel', 'Matthew',
      'Ava', 'Isabella', 'Sophia', 'Charlotte', 'Amelia', 'Mia', 'Harper', 'Evelyn', 'Abigail', 'Emily',
      'Liam', 'Noah', 'Oliver', 'Elijah', 'Benjamin', 'Lucas', 'Henry', 'Alexander', 'Mason', 'James',
      'Sofia', 'Priya', 'Kenji', 'Aaron', 'Emma', 'Chloe', 'Abby', 'Zack', 'Ethan', 'Jack', 'Sarah',
      'Leo', 'Carlos', 'Mei', 'Yuki', 'Omar', 'Fatima', 'Santiago', 'Elena', 'Nina', 'Julian', 'Grace'
    ];
    const lastNames = [
      'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
      'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
      'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson',
      'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores', 'Green', 'Adams'
    ];

    const attTypes: ('High' | 'Moderate' | 'Low')[] = ['High', 'Moderate', 'Low'];
    const stressTypes: ('High' | 'Moderate' | 'Low')[] = ['High', 'Moderate', 'Low'];
    const fatigueTypes: ('High' | 'Moderate' | 'Low')[] = ['High', 'Moderate', 'Low'];
    const postureTypes = ['Proper', 'Slouched', 'Moving', 'Micro-naps', 'Forward lean', 'Restless'];

    const fullList = [...baseList];
    const usedNames = new Set(baseList.map(s => s.name));

    for (let i = 13; i <= 60; i++) {
      let uniqueName = '';
      let attempts = 0;
      do {
        const fn = firstNames[Math.floor(Math.random() * firstNames.length)];
        const ln = lastNames[Math.floor(Math.random() * lastNames.length)];
        uniqueName = `${fn} ${ln}`;
        attempts++;
      } while (usedNames.has(uniqueName) && attempts < 100);

      usedNames.add(uniqueName);

      const attentionValue = attTypes[Math.floor(Math.random() * attTypes.length)];
      const stressValue = stressTypes[Math.floor(Math.random() * stressTypes.length)];
      const fatigueValue = fatigueTypes[Math.floor(Math.random() * fatigueTypes.length)];
      const hrvValue = Math.floor(Math.random() * 55) + 35; // 35 - 90
      const gsrValue = Number((Math.random() * 7 + 2).toFixed(1)); // 2.0 - 9.0
      const postureValue = postureTypes[Math.floor(Math.random() * postureTypes.length)];

      fullList.push({
        id: String(i),
        name: uniqueName,
        attention: attentionValue,
        stress: stressValue,
        fatigue: fatigueValue,
        hrv: hrvValue,
        gsr: gsrValue,
        posture: postureValue
      });
    }

    return fullList;
  });

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
        console.error("Failed to load data in Teacher Dashboard", err);
      } finally {
        setIsLogsLoading(false);
        setIsDistressLoading(false);
      }
    }
    loadData();
  }, []);

  const mappedStudents = students.map(s => {
    if (s.id === '1' && cognitive && biometric) {
      return {
        ...s,
        attention: cognitive.attention,
        stress: cognitive.stress,
        fatigue: cognitive.fatigue,
        hrv: biometric.hrv,
        gsr: biometric.gsr,
        posture: biometric.headMovement === 'Stable' ? 'Proper' : biometric.headMovement === 'Erratic' ? 'Restless' : 'Proper'
      };
    }
    return s;
  });

  const [hoveredStudent, setHoveredStudent] = useState<StudentData | null>(null);
  const [selectedAlert, setSelectedAlert] = useState<string | null>(null);
  const [classroomFocusTriggered, setClassroomFocusTriggered] = useState(false);

  // Dynamic search and status layout filtering states
  const [filterQuery, setFilterQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'focus' | 'stressed' | 'fatigued'>('all');

  // Stats calculation
  const totalStudents = mappedStudents.length;
  const highAttentionCount = mappedStudents.filter(s => s.attention === 'High').length;
  const highStressCount = mappedStudents.filter(s => s.stress === 'High').length;
  const highFatigueCount = mappedStudents.filter(s => s.fatigue === 'High').length;

  const averageAttentionIndex = Math.round((mappedStudents.filter(s => s.attention !== 'Low').length / totalStudents) * 105);

  const [chartView, setChartView] = useState<'individual' | 'class' | 'comparison'>('individual');

  // Compile historical trend data based on Firestore wellnessLogs and mock baselines for missing days
  const getHistoricalTrendData = () => {
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const data = [];
    
    // Create trend endpoints for the last 7 days
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayName = daysOfWeek[d.getDay()];
      const dateStr = d.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });
      
      // Look for a real matching wellness Check-in document from Firestore
      const matchingLog = wellnessLogs.find(log => {
        if (!log.createdAt) return false;
        const logDate = new Date(log.createdAt);
        return logDate.getDate() === d.getDate() && 
               logDate.getMonth() === d.getMonth() && 
               logDate.getFullYear() === d.getFullYear();
      });

      // Default baseline models for individual Alex Mercer
      let alexStress = 35;
      let alexCognitive = 72;
      let sleepHrs = 7.0;

      if (matchingLog) {
        // Map real values loaded from Firestore!
        // Mood: scale 1-5. Stress maps to: 5 -> 20, 4 -> 40, 3 -> 60, 2 -> 80, 1 -> 95
        alexStress = (6 - matchingLog.mood) * 18 + 10;
        
        // Attention Snapshot maps to Cognitive Load score
        if (matchingLog.attentionSnapshot === 'High') {
          alexCognitive = 88;
        } else if (matchingLog.attentionSnapshot === 'Moderate') {
          alexCognitive = 65;
        } else if (matchingLog.attentionSnapshot === 'Low') {
          alexCognitive = 35;
        }
        sleepHrs = matchingLog.sleepHours;
      } else {
        // Safe, beautiful mock baseline offset for historical preview
        const offset = (d.getDate() % 4);
        alexStress = 30 + offset * 12;
        alexCognitive = 78 - offset * 8;
        sleepHrs = parseFloat((7.2 - (offset * 0.4)).toFixed(1));
      }

      // Class average represents smoothed values
      const classAvgStress = Math.round(41 + (d.getDate() % 3) * 6);
      const classAvgCognitive = Math.round(74 - (d.getDate() % 3) * 5);

      // Distribute 60 class students according to average cognitive load
      let highStrainCount = 10;
      let optimalFlowCount = 40;
      let lowFocusCount = 10;

      if (classAvgCognitive > 74) {
        highStrainCount = 15;
        optimalFlowCount = 35;
        lowFocusCount = 10;
      } else if (classAvgCognitive < 70) {
        highStrainCount = 5;
        optimalFlowCount = 30;
        lowFocusCount = 25;
      }

      data.push({
        dayName: dayName,
        dateStr: dateStr,
        label: `${dayName} ${dateStr}`,
        alexStress,
        alexCognitive,
        classAvgStress,
        classAvgCognitive,
        sleepHours: sleepHrs,
        highStrainCount,
        optimalFlowCount,
        lowFocusCount
      });
    }
    return data;
  };

  const trendData = getHistoricalTrendData();

  const [alerts, setAlerts] = useState([
    {
      id: 'alert_1',
      studentName: 'Jack Peterson',
      type: 'Burnout Warning',
      severity: 'CRITICAL',
      timestamp: '2 mins ago',
      details: 'GSR score of 9.8 µS sustained with theta brainwaves dominating for 40 mins. High risk of immediate cognitive exhaustion.',
      recom: 'Trigger 5-minute offline screen detoxification and breathing exercises immediately.'
    },
    {
      id: 'alert_2',
      studentName: 'Abby Williams',
      type: 'Cognitive Stress Spillover',
      severity: 'HIGH',
      timestamp: '5 mins ago',
      details: 'Heart rate variability falling steadily to 44ms (suggests sympathetic nervous strain). Posture reveals erratic jerking.',
      recom: 'Instruct Abby to explore the Wellness Athena Coach page for shoulder posture shrugging.'
    },
    {
      id: 'alert_3',
      studentName: 'Zack Ward',
      type: 'Prolonged Attention Fade',
      severity: 'MODERATE',
      timestamp: '15 mins ago',
      details: 'Attentional indices sitting inside Low focus category. Alpha/Beta amplitude has degraded. Theta surges suggest drowsiness.',
      recom: 'Present an interactive gaming micro-challenge rather than another long explanation.'
    }
  ]);

  const [activeView, setActiveView] = useState<'monitor' | 'gnn'>('monitor');
  const [gnnModeTab, setGnnModeTab] = useState<'collab_resonance' | 'predictive_burnout' | 'model_accuracy'>('predictive_burnout');

  const triggerClassroomFocusBreak = () => {
    setClassroomFocusTriggered(true);
    setTimeout(() => {
      setClassroomFocusTriggered(false);
    }, 4500);
  };

  return (
    <div className="space-y-6" id="teacher_dashboard_tab">
      
      {/* Alert Ribbon for Classroom Focus Overlay Triggers */}
      {classroomFocusTriggered && (
        <div className="bg-gradient-to-r from-sky-600 to-sky-700 text-white rounded-xl p-4 flex items-center justify-between shadow-lg animate-pulse border border-sky-400">
          <div className="flex items-center space-x-3">
            <Volume2 className="h-5 w-5 animate-bounce" />
            <div>
              <strong className="text-sm block">Broadcast Sent: Adaptive Focus Break Enforced!</strong>
              <p className="text-xs text-sky-200">Enforcing a 60-second breathing overlay and posture alignment screen on all student platforms.</p>
            </div>
          </div>
          <span className="text-xs bg-sky-950 font-semibold px-2 py-1 rounded">Activating...</span>
        </div>
      )}

      {/* Dynamic Tab Switcher for Teacher Dashboard Modes */}
      <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-800 justify-between items-center flex-wrap gap-3 my-2" id="teacher_dashboard_view_switcher">
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setActiveView('monitor')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeView === 'monitor'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <LayoutGrid className="h-4 w-4" />
            <span>Classroom Live Monitor</span>
          </button>
          
          <button
            type="button"
            onClick={() => setActiveView('gnn')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeView === 'gnn'
                ? 'bg-rose-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <GitBranch className="h-4 w-4 animate-pulse text-rose-400" />
            <span>Collaborative GNN Network Lab</span>
          </button>
        </div>

        <div className="flex items-center space-x-2 text-[10px] text-slate-400 mr-2">
          <Network className="h-3.5 w-3.5 text-indigo-405 text-indigo-400 animate-spin" />
          <span className="font-mono uppercase tracking-wider font-bold">Relational brainwave modeler : ONLINE</span>
        </div>
      </div>

      {/* Classroom KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Students */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4.5 flex items-center space-x-4">
          <div className="p-3 bg-slate-950 text-sky-400 rounded-lg">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Class Roster</span>
            <strong className="text-2xl text-slate-100 font-bold">12 Students</strong>
            <p className="text-[10px] text-emerald-400">100% sensors online</p>
          </div>
        </div>

        {/* Avg Attention */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4.5 flex items-center space-x-4">
          <div className="p-3 bg-slate-950 text-emerald-400 rounded-lg">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Cognitive Focus</span>
            <strong className="text-2xl text-slate-100 font-bold">{averageAttentionIndex}%</strong>
            <p className="text-[10px] text-slate-400">Optimal flow limits</p>
          </div>
        </div>

        {/* Active Stress Alert count */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4.5 flex items-center space-x-4">
          <div className="p-3 bg-slate-950 text-red-400 rounded-lg">
            <ShieldAlert className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Active Burnout Risks</span>
            <strong className="text-2xl text-red-400 font-bold">{highStressCount} Students</strong>
            <p className="text-[10px] text-rose-300">Requires offline detox</p>
          </div>
        </div>

        {/* Active Fatigue Count */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4.5 flex items-center space-x-4">
          <div className="p-3 bg-slate-950 text-yellow-400 rounded-lg">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">High Fatigue</span>
            <strong className="text-2xl text-slate-100 font-bold">{highFatigueCount} Students</strong>
            <p className="text-[10px] text-yellow-400">Theta brainwaves elevated</p>
          </div>
        </div>
      </div>

      {activeView === 'monitor' ? (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* HEATMAP GRID: Left Column (Span 7) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-850 pb-3 mb-4 gap-3">
              <div>
                <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2">
                  <LayoutGrid className="h-4 w-4 text-sky-400" />
                  Live Seating Engagement Heatmap ({totalStudents} Desks)
                </h3>
                <p className="text-[11px] text-slate-400">
                  Physical seating topology. Hover on any desk to probe deep wearable sensory streams.
                </p>
              </div>
              {/* Quick Map Legend */}
              <div className="flex items-center space-x-2 text-[9px] text-slate-400 self-start md:self-auto font-mono">
                <span className="flex items-center"><span className="h-2 w-2 bg-emerald-500 rounded-full mr-1 animate-pulse"></span> Focus</span>
                <span className="flex items-center"><span className="h-2 w-2 bg-yellow-500 rounded-full mr-1 animate-pulse"></span> Tired</span>
                <span className="flex items-center"><span className="h-2 w-2 bg-rose-500 rounded-full mr-1 animate-pulse"></span> Stress</span>
              </div>
            </div>

            {/* HIGH-FIDELITY TOOLBAR: SEARCH & STATUS FILTERS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
              <input
                type="text"
                placeholder="🔍 Search student name..."
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                className="bg-slate-950 border border-slate-850 text-xs text-slate-200 px-3 py-1.5 rounded-lg focus:outline-none focus:border-indigo-500 placeholder-slate-600 font-sans"
              />
              <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-lg border border-slate-850 font-sans">
                <button
                  type="button"
                  onClick={() => setStatusFilter('all')}
                  className={`flex-1 py-1 text-[9px] font-bold font-mono uppercase rounded transition-all cursor-pointer ${
                    statusFilter === 'all' ? 'bg-indigo-600 text-slate-100' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  All ({totalStudents})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('focus')}
                  className={`flex-1 py-1 text-[9px] font-bold font-mono uppercase rounded transition-all cursor-pointer ${
                    statusFilter === 'focus' ? 'bg-emerald-950/60 text-emerald-450 border border-emerald-900/40' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  Focus
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('stressed')}
                  className={`flex-1 py-1 text-[9px] font-bold font-mono uppercase rounded transition-all cursor-pointer ${
                    statusFilter === 'stressed' ? 'bg-rose-950/60 text-rose-450 border border-rose-900/40' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  Stress
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('fatigued')}
                  className={`flex-1 py-1 text-[9px] font-bold font-mono uppercase rounded transition-all cursor-pointer ${
                    statusFilter === 'fatigued' ? 'bg-amber-950/60 text-yellow-450 border border-amber-900/40' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  Tired
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Seating Grid representing 60 desks, scrollable & dense */}
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-6 gap-2 overflow-y-auto max-h-[380px] p-1 pr-2 scrollbar-none">
            {mappedStudents.map((student) => {
              // Determine status highlight class
              let colorClass = 'border-slate-850 bg-slate-950/80 hover:border-slate-500 text-slate-300';
              if (student.attention === 'High' && student.stress !== 'High') {
                colorClass = 'bg-emerald-950/15 text-emerald-400 border-emerald-950/80 hover:border-emerald-600';
              } else if (student.stress === 'High') {
                colorClass = 'bg-rose-950/15 text-rose-400 border-rose-950/80 hover:border-rose-600';
              } else if (student.fatigue === 'High' || student.attention === 'Low') {
                colorClass = 'bg-amber-950/15 text-yellow-405 border-amber-950/80 hover:border-yellow-600';
              }

              // Filter match evaluation
              const matchesSearch = student.name.toLowerCase().includes(filterQuery.toLowerCase());
              let matchesStatus = true;
              if (statusFilter === 'focus') {
                matchesStatus = student.attention === 'High' && student.stress !== 'High';
              } else if (statusFilter === 'stressed') {
                matchesStatus = student.stress === 'High';
              } else if (statusFilter === 'fatigued') {
                matchesStatus = student.fatigue === 'High' || student.attention === 'Low';
              }

              const visible = matchesSearch && matchesStatus;

              return (
                <div
                  key={student.id}
                  onMouseEnter={() => setHoveredStudent(student)}
                  onMouseLeave={() => setHoveredStudent(null)}
                  className={`p-2 rounded-lg border cursor-pointer text-center transition-all duration-200 flex flex-col justify-between h-[52px] ${colorClass} ${
                    visible ? 'opacity-100 scale-100 hover:shadow-md' : 'opacity-25 scale-95 hover:opacity-40'
                  }`}
                >
                  <strong className="text-[10px] truncate block leading-tight text-slate-200">
                    {student.name.split(' ')[0]}
                  </strong>
                  <span className="text-[8.5px] text-slate-500 block font-mono pr-1 bg-slate-950 border border-slate-900/60 rounded py-0.5 tracking-tight scale-90">
                    HRV {student.hrv}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Hover Details Panel */}
          {hoveredStudent ? (() => {
            const activeHoveredStudent = mappedStudents.find(s => s.id === hoveredStudent.id) || hoveredStudent;
            const latestCheckin = activeHoveredStudent.id === '1' && wellnessLogs.length > 0 ? wellnessLogs[0] : null;

            return (
              <div className="bg-slate-950 border border-slate-850 p-4 mt-5 rounded-lg flex flex-col justify-between transition-all">
                <div className="flex items-center justify-between w-full">
                  <div>
                    <strong className="text-sm text-slate-200 block">{activeHoveredStudent.name}</strong>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wide">Dynamic Wearable Telemetry</span>
                    <div className="grid grid-cols-3 gap-4 mt-2">
                      <div>
                        <span className="text-[9px] text-slate-500 block">Attention Index</span>
                        <strong className="text-xs text-emerald-400 font-semibold">{activeHoveredStudent.attention}</strong>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-500 block">Posture Angle</span>
                        <strong className="text-xs text-sky-400 font-semibold">{activeHoveredStudent.posture}</strong>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-500 block">Stress Indicator (GSR)</span>
                        <strong className="text-xs text-rose-400 font-bold">{activeHoveredStudent.gsr} µS</strong>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 text-right">
                    <span className="text-[9px] text-slate-400 block font-mono">HR / HRV</span>
                    <strong className="text-sm text-slate-200 mt-1 font-bold block">{activeHoveredStudent.id === '1' && biometric ? biometric.heartRate : 78} BPM</strong>
                    <span className="text-[9px] text-slate-500 font-mono block">SDNN: {activeHoveredStudent.hrv} ms</span>
                  </div>
                </div>

                {latestCheckin && (
                  <div className="mt-3 pt-3 border-t border-slate-900 text-[10px] text-slate-400 flex items-center md:justify-between flex-wrap gap-2">
                    <span className="flex items-center gap-1">
                      <Heart className="h-3.5 w-3.5 text-pink-500 animate-pulse" />
                      <span>Firebase Daily Reported State: <strong className="text-pink-400">{latestCheckin.moodLabel}</strong> (Mood: {latestCheckin.mood}/5)</span>
                    </span>
                    <span className="bg-indigo-950 text-indigo-400 px-2 py-0.5 rounded border border-indigo-900/60">
                      Sleep: <strong>{latestCheckin.sleepHours} hrs</strong> ({latestCheckin.sleepQuality})
                    </span>
                  </div>
                )}
              </div>
            );
          })() : (
            <div className="bg-slate-950 border border-slate-900 p-4 mt-5 rounded-lg text-center text-xs text-slate-500">
              Hover over student tiles in the workspace layout above to inspect high-frequency EEG data channels.
            </div>
          )}

          {/* Cognitive Load Map & Daily Stress Hours Section using Recharts */}
          <div className="mt-6 border-t border-slate-850 pt-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                  <Layers className="h-4.5 w-4.5 text-sky-450 text-sky-400" />
                  Historical Cognitive & Stress Trends (7-Day Analytics)
                </h4>
                <p className="text-[11px] text-slate-400 mt-1">
                  Bi-hemispheric signal synchronization and telemetry loaded directly from Firestore.
                </p>
              </div>

              {/* Toggle controls */}
              <div className="flex space-x-1 bg-slate-950 p-1 rounded-lg border border-slate-800 self-start sm:self-center">
                <button
                  type="button"
                  onClick={() => setChartView('individual')}
                  className={`px-2.5 py-1 rounded text-[10px] font-bold cursor-pointer transition-all ${
                    chartView === 'individual' ? 'bg-indigo-600 text-slate-100' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Alex Mercer
                </button>
                <button
                  type="button"
                  onClick={() => setChartView('class')}
                  className={`px-2.5 py-1 rounded text-[10px] font-bold cursor-pointer transition-all ${
                    chartView === 'class' ? 'bg-indigo-600 text-slate-100' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Class Average
                </button>
                <button
                  type="button"
                  onClick={() => setChartView('comparison')}
                  className={`px-2.5 py-1 rounded text-[10px] font-bold cursor-pointer transition-all ${
                    chartView === 'comparison' ? 'bg-indigo-600 text-slate-100' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Dual View
                </button>
              </div>
            </div>

            <div className="bg-slate-950 rounded-xl p-4 border border-slate-800">
              <div className="w-full h-64 mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={trendData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorCognitive" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorStress" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorClassCog" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorClassStress" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.4} />
                    <XAxis 
                      dataKey="dayName" 
                      stroke="#64748b" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false}
                    />
                    <YAxis 
                      stroke="#64748b" 
                      fontSize={10} 
                      domain={[0, 100]} 
                      tickLine={false} 
                      axisLine={false}
                      tickFormatter={(v) => `${v}%`}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const dataPoint = payload[0].payload;
                          return (
                            <div className="bg-slate-950 border border-slate-800 p-2.5 rounded-lg shadow-xl text-[11px] font-sans space-y-1">
                              <p className="font-bold text-slate-350 border-b border-slate-900 pb-1 mb-1 flex items-center gap-1">
                                <Calendar className="h-3 w-3 text-indigo-400" />
                                {dataPoint.label}
                              </p>
                              {payload.map((item: any, idx: number) => (
                                <div key={idx} className="flex items-center justify-between gap-4">
                                  <span style={{ color: item.color }} className="font-semibold">
                                    {item.name}:
                                  </span>
                                  <span className="font-mono font-bold text-slate-100">
                                    {item.value}%
                                  </span>
                                </div>
                              ))}
                              {dataPoint.sleepHours !== undefined && (
                                <p className="text-[10px] text-slate-500 pt-1 border-t border-slate-900 font-mono">
                                  Rest cycle: {dataPoint.sleepHours} hrs slept
                                </p>
                              )}
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend 
                      verticalAlign="top" 
                      height={36} 
                      iconSize={8}
                      iconType="circle"
                      wrapperStyle={{ fontSize: '10px', color: '#94a3b8' }}
                    />
                    
                    {/* Add ReferenceLine at 80% to indicate Cognitive Burnout Threshold */}
                    <ReferenceLine 
                      y={80} 
                      stroke="#ef4444" 
                      strokeDasharray="3 3" 
                      label={{ 
                        value: 'Burnout Threshold', 
                        fill: '#ef4444', 
                        fontSize: 8, 
                        position: 'top',
                        fontWeight: '600'
                      }} 
                    />

                    {/* Conditional rendering based on active tab view */}
                    {(chartView === 'individual' || chartView === 'comparison') && (
                      <Area
                        type="monotone"
                        name="Alex Mercer Cognitive Load"
                        dataKey="alexCognitive"
                        stroke="#6366f1"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorCognitive)"
                      />
                    )}
                    {(chartView === 'individual' || chartView === 'comparison') && (
                      <Area
                        type="monotone"
                        name="Alex Mercer Stress Level"
                        dataKey="alexStress"
                        stroke="#ef4444"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorStress)"
                      />
                    )}
                    
                    {(chartView === 'class' || chartView === 'comparison') && (
                      <Area
                        type="monotone"
                        name="Class Cognitive Load"
                        dataKey="classAvgCognitive"
                        stroke="#0ea5e9"
                        strokeWidth={1.5}
                        strokeDasharray={chartView === 'comparison' ? '4 4' : undefined}
                        fillOpacity={1}
                        fill="url(#colorClassCog)"
                      />
                    )}
                    {(chartView === 'class' || chartView === 'comparison') && (
                      <Area
                        type="monotone"
                        name="Class Stress average"
                        dataKey="classAvgStress"
                        stroke="#f43f5e"
                        strokeWidth={1.5}
                        strokeDasharray={chartView === 'comparison' ? '4 4' : undefined}
                        fillOpacity={1}
                        fill="url(#colorClassStress)"
                      />
                    )}
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Secondary Recharts Bar Graph: Class-Wide Cognitive Load Distribution */}
            <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 mt-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <TrendingUp className="h-4 w-4 text-emerald-400" />
                    Class-Wide Cognitive Load Distribution (Past Week)
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Daily headcount breakdown of student clusters categorized by objective biometric cognitive load levels.
                  </p>
                </div>
                {/* Visual Legend indicator */}
                <div className="flex items-center space-x-2.5 text-[9px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-sm bg-indigo-500"></span>
                    <span>High Strain (&gt;80%)</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-sm bg-emerald-500"></span>
                    <span>Optimal Flow (50-80%)</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-sm bg-amber-500"></span>
                    <span>Low Focus (&lt;50%)</span>
                  </span>
                </div>
              </div>

              <div className="w-full h-64 mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={trendData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.4} />
                    <XAxis 
                      dataKey="dayName" 
                      stroke="#64748b" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false}
                    />
                    <YAxis 
                      stroke="#64748b" 
                      fontSize={10} 
                      domain={[0, 12]} 
                      tickLine={false} 
                      axisLine={false}
                      tickFormatter={(v) => `${v} Std`}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const dataPoint = payload[0].payload;
                          return (
                            <div className="bg-slate-950 border border-slate-800 p-2.5 rounded-lg shadow-xl text-[11px] font-sans space-y-1">
                              <p className="font-bold text-slate-350 border-b border-slate-900 pb-1 mb-1 flex items-center gap-1">
                                <Calendar className="h-3 w-3 text-indigo-450 text-indigo-400" />
                                {dataPoint.label} Distribution
                              </p>
                              <div className="flex items-center justify-between gap-4">
                                <span className="text-indigo-400 font-semibold">High Strain:</span>
                                <span className="font-mono font-bold text-slate-100">{dataPoint.highStrainCount} students</span>
                              </div>
                              <div className="flex items-center justify-between gap-4">
                                <span className="text-emerald-400 font-semibold">Optimal Flow:</span>
                                <span className="font-mono font-bold text-slate-100">{dataPoint.optimalFlowCount} students</span>
                              </div>
                              <div className="flex items-center justify-between gap-4">
                                <span className="text-amber-400 font-semibold">Low Focus:</span>
                                <span className="font-mono font-bold text-slate-100">{dataPoint.lowFocusCount} students</span>
                              </div>
                              <p className="text-[10px] text-slate-500 pt-1 border-t border-slate-900 font-mono text-center">
                                Total Class size: 12 active
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend 
                      verticalAlign="top" 
                      height={36} 
                      iconSize={8}
                      iconType="rect"
                      wrapperStyle={{ fontSize: '10px', color: '#94a3b8' }}
                    />
                    
                    <Bar 
                      dataKey="highStrainCount" 
                      name="High Strain" 
                      stackId="classStack" 
                      fill="#6366f1" 
                    />
                    <Bar 
                      dataKey="optimalFlowCount" 
                      name="Optimal Flow" 
                      stackId="classStack" 
                      fill="#10b981" 
                    />
                    <Bar 
                      dataKey="lowFocusCount" 
                      name="Low Focus" 
                      stackId="classStack" 
                      fill="#f59e0b" 
                      radius={[4, 4, 0, 0]} 
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

        </div>

        {/* ALERTS & INTELLIGENT ACTIONS CHANNEL: Right Column (Span 5) */}
        <div className="lg:col-span-5 flex flex-col space-y-6">
          
          {/* Active alerts panel */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl flex-1 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-slate-200 text-sm flex items-center mb-1">
                <AlertTriangle className="h-4.5 w-4.5 text-rose-500 mr-2" />
                Live Burnout Alerts Feed
              </h3>
              <p className="text-xs text-slate-400 mb-4 pb-2 border-b border-slate-850">
                Continuous edge processing triggers real-time educational interventions.
              </p>

              <div className="space-y-3">
                {(() => {
                  const activeAlerts = [...alerts];
                  if (cognitive && cognitive.stress === 'High') {
                    if (!activeAlerts.some(a => a.id === 'mercer_stress')) {
                      activeAlerts.unshift({
                        id: 'mercer_stress',
                        studentName: 'Alex Mercer',
                        type: 'Active Sympathetic Strain Surge',
                        severity: 'CRITICAL',
                        timestamp: 'Just now',
                        details: `Live wearable band reports biometric values out of safe zone: GSR is elevated to ${biometric ? biometric.gsr : 8.5} µS, and Heart Rate Variability has collapsed to ${biometric ? biometric.hrv : 38}ms. High alpha/theta load indicating cognitive burnout risk.`,
                        recom: 'Instruct Alex to pause study module, take deep breathing block, and complete an emotional refresh.'
                      });
                    }
                  } else if (cognitive && cognitive.fatigue === 'High') {
                    if (!activeAlerts.some(a => a.id === 'mercer_fatigue')) {
                      activeAlerts.unshift({
                        id: 'mercer_fatigue',
                        studentName: 'Alex Mercer',
                        type: 'Sustained Fatigue Detected',
                        severity: 'HIGH',
                        timestamp: 'Just now',
                        details: `Wearable band metrics suggest fatigue levels have crossed safe threshold limits. Alpha activity decreased while slow-theta waveforms rose by 32%.`,
                        recom: 'Broadcast adaptive focus break, or prompt quick physical posture stretch.'
                      });
                    }
                  }

                  // Inject manual distress signal alerts triggered by students
                  distressSignals.forEach((ds) => {
                    const dId = `distress_${ds.id || 'new'}`;
                    if (!activeAlerts.some(a => a.id === dId)) {
                      activeAlerts.unshift({
                        id: dId,
                        studentName: ds.studentName,
                        type: 'MANUAL DISTRESS / RESCUE SIGNAL',
                        severity: 'CRITICAL',
                        timestamp: ds.createdAt ? new Date(ds.createdAt).toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit'}) : 'Just now',
                        details: `Student manually pressed 'Emergency Help' on headband console. Message details: "${ds.message}". Biometric Context -> Stress: ${ds.stressSnapshot || 'N/A'}, Attention Focus: ${ds.attentionSnapshot || 'N/A'}, Heart Rate: ${ds.heartRateSnapshot ? ds.heartRateSnapshot + ' BPM' : 'N/A'}.`,
                        recom: 'Deploy Immediate Intervention. Initiate active dialogue link or quiet desk check-in.'
                      });
                    }
                  });

                  return activeAlerts.map((al) => (
                    <div
                      key={al.id}
                      onClick={() => setSelectedAlert(selectedAlert === al.id ? null : al.id)}
                      className={`p-3.5 rounded-lg border text-left cursor-pointer transition-all ${
                        selectedAlert === al.id 
                          ? 'bg-slate-950 border-rose-500' 
                          : al.severity === 'CRITICAL'
                            ? 'bg-rose-950/15 border-rose-900/60 hover:bg-rose-950/25'
                            : al.severity === 'HIGH'
                              ? 'bg-amber-950/15 border-amber-900/60 hover:bg-amber-950/25'
                              : 'bg-slate-950/50 border-slate-850 hover:bg-slate-850/30'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-rose-400 flex items-center gap-1">
                          <span className="h-1.5 w-1.5 bg-red-500 rounded-full animate-ping"></span>
                          {al.severity} • {al.type}
                        </span>
                        <span className="text-[9px] text-slate-500">{al.timestamp}</span>
                      </div>
                      <strong className="text-xs text-slate-200 block">{al.studentName}</strong>
                      <p className={`text-[11px] leading-relaxed mt-1 text-slate-400 ${selectedAlert === al.id ? '' : 'truncate'}`}>
                        {al.details}
                      </p>

                      {selectedAlert === al.id && (
                        <div className="mt-3.5 pt-3 border-t border-slate-850 bg-slate-950/80 p-2.5 rounded text-[11px]">
                          <strong className="text-emerald-400 flex items-center gap-1 mb-1">
                            <Sparkles className="h-3.5 w-3.5 text-yellow-400" /> RECOMMENDED REMEDIAL ACTION:
                          </strong>
                          <p className="text-slate-300 font-medium leading-relaxed">{al.recom}</p>
                        </div>
                      )}
                    </div>
                  ));
                })()}
              </div>
            </div>

            {/* Quick intervention broad cast panel */}
            <div className="pt-5 border-t border-slate-850 mt-5">
              <h4 className="text-xs font-bold text-slate-200 mb-2">Classroom Intervention Broadcaster</h4>
              <p className="text-[10px] text-slate-400 mb-3.5 leading-relaxed">
                Notice general attention fading or post-exam burnout? Enforce a calming physical rest session on all client screens instantly.
              </p>
              <button
                onClick={triggerClassroomFocusBreak}
                className="w-full bg-slate-850 hover:bg-slate-850 cursor-pointer text-sky-400 border border-sky-900 hover:border-sky-500 text-xs font-semibold py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5"
              >
                <Volume2 className="h-4 w-4" />
                BroadCast Calming Focus Break
              </button>
            </div>

            {/* Real-time self report log stream */}
            <div className="pt-5 border-t border-slate-850 mt-5">
              <h4 className="text-xs font-bold text-slate-250 mb-2.5 flex items-center gap-1.5 justify-between">
                <span className="flex items-center gap-1.5">
                  <Heart className="h-3.5 w-3.5 text-pink-500 animate-pulse" />
                  Alex's Real-time Self-Report Stream
                </span>
                <span className="text-[9px] font-mono text-pink-400 bg-pink-950/40 border border-pink-900/60 px-1.5 py-0.2 rounded font-bold uppercase">
                  Firebase Stream
                </span>
              </h4>
              {isLogsLoading ? (
                <div className="text-[11px] text-slate-500 animate-pulse text-center py-2">Loading logs...</div>
              ) : wellnessLogs.length > 0 ? (
                <div className="space-y-2 max-h-[160px] overflow-y-auto scrollbar-thin">
                  {wellnessLogs.slice(0, 2).map((log, index) => (
                    <div key={index} className="bg-slate-950 p-2.5 rounded border border-slate-850 text-[10px] space-y-1">
                      <div className="flex justify-between items-center text-slate-300">
                        <span className="font-bold">{log.moodLabel} (Score: {log.mood}/5)</span>
                        <span className="text-slate-500 text-[8px]">{log.createdAt ? new Date(log.createdAt).toLocaleDateString() : 'Today'}</span>
                      </div>
                      <p className="text-slate-400 text-[10px]">Sleep: <strong className="text-indigo-400">{log.sleepHours}h</strong> ({log.sleepQuality})</p>
                      {log.notes && (
                        <p className="border-l-2 border-indigo-500/40 pl-1.5 text-slate-400 italic text-[9.5px]">
                          "{log.notes}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-[11px] text-center py-3 border border-dashed border-slate-800 rounded">No self-reports yet.</p>
              )}
            </div>

            {/* Real-time distress signal alerts stream */}
            <div className="pt-5 border-t border-slate-850 mt-5">
              <h4 className="text-xs font-bold text-slate-250 mb-2.5 flex items-center gap-1.5 justify-between">
                <span className="flex items-center gap-1.5 text-rose-500">
                  <ShieldAlert className="h-4 w-4 animate-pulse text-red-500" />
                  Alex's Incident / Distress Stream
                </span>
                <span className="text-[9px] font-mono text-red-400 bg-red-950/40 border border-red-900/60 px-1.5 py-0.2 rounded font-bold uppercase">
                  Firestore Stream
                </span>
              </h4>
              {isDistressLoading ? (
                <div className="text-[11px] text-slate-500 animate-pulse text-center py-2">Loading distress signals...</div>
              ) : distressSignals.length > 0 ? (
                <div className="space-y-2 max-h-[160px] overflow-y-auto scrollbar-thin">
                  {distressSignals.slice(0, 3).map((sig, index) => (
                    <div key={index} className="bg-red-950/15 p-2.5 rounded border border-red-900/30 text-[10px] space-y-1">
                      <div className="flex justify-between items-center text-rose-400 font-bold">
                        <span>Incident Signal Triggered</span>
                        <span className="text-slate-500 text-[8px] font-mono">
                          {sig.createdAt ? new Date(sig.createdAt).toLocaleTimeString() : 'Just now'}
                        </span>
                      </div>
                      <p className="text-slate-250 italic">"{sig.message}"</p>
                      <div className="flex items-center gap-1 text-[8.5px] font-mono text-slate-400">
                        {sig.stressSnapshot && <span>Stress: {sig.stressSnapshot} |</span>}
                        {sig.attentionSnapshot && <span>Focus: {sig.attentionSnapshot} |</span>}
                        {sig.heartRateSnapshot && <span className="text-pink-400">{sig.heartRateSnapshot} BPM</span>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-[11px] text-center py-3 border border-dashed border-slate-800 rounded">No emergency alerts logged.</p>
              )}
            </div>

          </div>

        </div>

      </div>

      {/* High-fidelity Live Session Analytics Panel */}
      <div className="mt-8" id="teacher_historical_session_trend_panel">
        <CognitiveTrendAnalytics />
      </div>
        </>
      ) : (
        <div className="space-y-6">
          {/* Sublayout Toggler for GNN variants */}
          <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-800 font-sans text-xs font-semibold justify-center items-center gap-2 max-w-2xl mx-auto" id="teacher_gnn_mode_tab_switcher">
            <button
              type="button"
              onClick={() => setGnnModeTab('predictive_burnout')}
              className={`flex-1 py-1.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                gnnModeTab === 'predictive_burnout'
                  ? 'bg-rose-600 text-white shadow-md font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <GitBranch className="h-4 w-4 text-rose-400 animate-pulse" />
              <span>Predictive Burnout Modeler</span>
            </button>
            <button
              type="button"
              onClick={() => setGnnModeTab('collab_resonance')}
              className={`flex-1 py-1.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                gnnModeTab === 'collab_resonance'
                  ? 'bg-indigo-600 text-white shadow-md font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Network className="h-4 w-4 text-indigo-400" />
              <span>Physical Resonance Lab</span>
            </button>
            <button
              type="button"
              onClick={() => setGnnModeTab('model_accuracy')}
              className={`flex-1 py-1.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                gnnModeTab === 'model_accuracy'
                  ? 'bg-emerald-600 text-white shadow-md font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Award className="h-4 w-4 text-emerald-400" />
              <span>Model Accuracies</span>
            </button>
          </div>

          {gnnModeTab === 'predictive_burnout' && (
            <GnnPredictiveBurnoutModeler />
          )}
          {gnnModeTab === 'collab_resonance' && (
            <GnnCollaborationLab />
          )}
          {gnnModeTab === 'model_accuracy' && (
            <ModelAccuracyTable />
          )}
        </div>
      )}

    </div>
  );
}
