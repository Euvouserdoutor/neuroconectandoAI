import React, { useState, useEffect } from 'react';
import { Activity, RefreshCw, Filter, ListCollapse, Database, Search, Flame, ShieldAlert, BadgeInfo } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface SimulationLog {
  id: string;
  userId: string;
  service: string;
  timestamp: string;
  biometrics_snapshot: {
    heartRate: number;
    hrv: number;
    gsr: number;
    headMovement: string;
    temperature: number;
  };
  cognitive_snapshot: {
    attention: 'High' | 'Moderate' | 'Low';
    stress: 'High' | 'Moderate' | 'Low';
    fatigue?: 'High' | 'Moderate' | 'Low';
  };
  inputSnippet?: string;
  score?: number;
  success?: boolean;
}

export default function CognitiveTrendAnalytics() {
  const [logs, setLogs] = useState<SimulationLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<SimulationLog[]>([]);
  const [filterService, setFilterService] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [chartMetric, setChartMetric] = useState<'gsr' | 'heartRate' | 'hrv'>('gsr');

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/simulation/logs');
      const data = await response.json();
      if (data.success && Array.isArray(data.logs)) {
        setLogs(data.logs);
      }
    } catch (err) {
      console.error('Error fetching logs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 5000); // Poll logs every 5s for real-time streaming updates
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let result = [...logs];

    if (filterService !== 'All') {
      result = result.filter(log => log.service === filterService);
    }

    if (searchTerm.trim() !== '') {
      result = result.filter(log => 
        log.inputSnippet?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.service.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredLogs(result);
  }, [logs, filterService, searchTerm]);

  // Map logs to visual chart points
  const chartData = logs.map((log, index) => {
    const formattedTime = new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    return {
      time: formattedTime,
      gsr: log.biometrics_snapshot?.gsr || 2.4,
      heartRate: log.biometrics_snapshot?.heartRate || 70,
      hrv: log.biometrics_snapshot?.hrv || 75,
      score: log.score || 0,
      attention: log.cognitive_snapshot?.attention || 'Moderate',
      stress: log.cognitive_snapshot?.stress || 'Low',
      service: log.service
    };
  });

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-6" id="cognitive_trend_analytics_dashboard">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <Database className="h-5 w-5 text-indigo-400" />
            <h3 className="text-sm font-black text-slate-100 uppercase tracking-tight">Cerebral Log & Trend Telemetry</h3>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
            Real-time biometric data-lake mapping. Aggregates live user interactions, biofeedback scores, and stress events.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          disabled={isLoading}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-950 hover:bg-slate-850 border border-slate-800 rounded-lg text-[10px] text-slate-350 cursor-pointer disabled:opacity-55 transition-all font-mono"
        >
          <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
          <span>REQUERY LOGS ({logs.length})</span>
        </button>
      </div>

      {logs.length === 0 ? (
        <div className="bg-slate-950 border border-dashed border-slate-800 py-10 text-center rounded-xl space-y-2">
          <BadgeInfo className="h-7 w-7 text-indigo-400 mx-auto animate-pulse" />
          <span className="text-xs font-bold text-slate-350 block">No Active session telemetry in data leak yet</span>
          <p className="text-[10px] text-slate-500 max-w-sm mx-auto leading-relaxed">
            Ask questions to the Adaptive Tutor, trigger Wellness Coaching routines, or play the Focus Calibration Assay to stream live data.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Historical Area Chart */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-3">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <span className="text-[10px] font-bold text-slate-300 font-mono flex items-center gap-1.5 uppercase">
                <Activity className="h-3.5 w-3.5 text-indigo-400" />
                Live Bio-Sensor Trend (Past {logs.length} operations)
              </span>

              {/* Chart Metric Selector */}
              <div className="flex space-x-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-[9px] font-mono">
                {[
                  { key: 'gsr', val: 'GSR (µS)' },
                  { key: 'heartRate', val: 'Heart Rate (BPM)' },
                  { key: 'hrv', val: 'Heart HRV (ms)' }
                ].map(metric => (
                  <button
                    key={metric.key}
                    onClick={() => setChartMetric(metric.key as any)}
                    className={`px-2.5 py-1 rounded cursor-pointer transition-all ${
                      chartMetric === metric.key ? 'bg-indigo-600 font-bold text-white shadow-sm' : 'text-slate-400 hover:text-slate-205'
                    }`}
                  >
                    {metric.val}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={chartMetric === 'gsr' ? '#38bdf8' : chartMetric === 'heartRate' ? '#f43f5e' : '#10b981'} stopOpacity={0.2}/>
                      <stop offset="95%" stopColor={chartMetric === 'gsr' ? '#38bdf8' : chartMetric === 'heartRate' ? '#f43f5e' : '#10b981'} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.3} />
                  <XAxis dataKey="time" stroke="#475569" fontSize={9} tickLine={false} axisLine={false} />
                  <YAxis stroke="#475569" fontSize={9} tickLine={false} axisLine={false} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const dataPoint = payload[0].payload;
                        return (
                          <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-lg shadow-xl text-[10px] space-y-1">
                            <p className="font-bold text-slate-350">{dataPoint.time}</p>
                            <div className="flex items-center justify-between gap-4">
                              <span className="text-slate-400">Trigger:</span>
                              <span className="font-bold text-indigo-400 uppercase tracking-tight">{dataPoint.service}</span>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                              <span className="text-slate-400">GSR:</span>
                              <span className="font-mono text-sky-450 text-sky-400 font-bold">{dataPoint.gsr} µS</span>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                              <span className="text-slate-400">Heart Rate:</span>
                              <span className="font-mono text-rose-450 text-rose-400 font-bold">{dataPoint.heartRate} BPM</span>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                              <span className="text-slate-400">HRV State:</span>
                              <span className="font-mono text-emerald-450 text-emerald-400 font-bold">{dataPoint.hrv} ms</span>
                            </div>
                            <div className="flex items-center justify-between gap-4 border-t border-slate-800 pt-1 mt-1">
                              <span className="text-slate-400">Stress:</span>
                              <span className={`font-bold ${dataPoint.stress === 'High' ? 'text-red-400' : 'text-slate-300'}`}>{dataPoint.stress}</span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey={chartMetric}
                    stroke={chartMetric === 'gsr' ? '#38bdf8' : chartMetric === 'heartRate' ? '#f43f5e' : '#10b981'}
                    strokeWidth={1.5}
                    fillOpacity={1}
                    fill="url(#colorMetric)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Interactive filter and search controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-950 p-3 rounded-xl border border-slate-850">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search telemetry payload content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg py-1.5 pl-8 pr-3 text-xs text-slate-200 outline-none focus:border-indigo-500/50"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
              <div className="flex flex-wrap gap-1">
                {['All', 'tutor_chat', 'wellness_coach', 'focus_game_calibration', 'academic_quiz'].map(svc => (
                  <button
                    key={svc}
                    onClick={() => setFilterService(svc)}
                    className={`px-2.5 py-1.5 rounded-lg text-[9px] font-semibold cursor-pointer transition-all border ${
                      filterService === svc
                        ? 'bg-slate-900 border-indigo-500/40 text-indigo-400 font-bold shadow-sm'
                        : 'bg-slate-900/40 border-transparent hover:bg-slate-900 text-slate-400 hover:text-slate-205'
                    }`}
                  >
                    {svc === 'All' ? 'ALL SERVICES' : svc === 'focus_game_calibration' ? 'FOCUS TEST' : svc === 'academic_quiz' ? 'QUIZ ASSAY' : svc.toUpperCase().replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Table list of matching events */}
          <div className="space-y-2 max-h-72 overflow-y-auto scrollbar-thin rounded-xl border border-slate-850 p-2.5 bg-slate-950">
            {filteredLogs.length === 0 ? (
              <div className="text-center py-4 text-xs text-slate-550 font-mono text-slate-500">No telemetry matches this query criteria.</div>
            ) : (
              filteredLogs.map(log => (
                <div
                  key={log.id}
                  className="bg-slate-900/60 p-3 rounded-lg border border-slate-850 hover:bg-slate-900 text-left transition-all text-xs"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-mono tracking-wider font-extrabold uppercase ${
                        log.service === 'focus_game_calibration' ? 'bg-indigo-950 text-indigo-400 border border-indigo-900/50' :
                        log.service === 'academic_quiz' ? 'bg-violet-950 text-violet-400 border border-violet-900/50' :
                        log.service === 'tutor_chat' ? 'bg-emerald-950 text-emerald-400 border border-emerald-900/50' :
                        'bg-sky-950 text-sky-400 border border-sky-900/50'
                      }`}>
                        {log.service.replace('_', ' ')}
                      </span>
                      {log.success !== undefined && (
                        <span className={`flex items-center gap-0.5 text-[8.5px] font-mono font-bold ${log.success ? 'text-emerald-400' : 'text-rose-400'}`}>
                          • {log.success ? 'PASSED CALIB' : 'DEGRADED'}
                        </span>
                      )}
                    </div>
                    <span className="text-[9px] text-slate-500 font-mono">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>

                  <p className="text-[11px] leading-relaxed text-slate-350 mt-1.5 italic font-medium">
                    "{log.inputSnippet || 'Executed query parameters.'}"
                  </p>

                  <div className="grid grid-cols-4 gap-2 mt-2 pt-2 border-t border-slate-900/60 text-[9.5px] font-mono text-slate-500">
                    <div>
                      Stress: <strong className={log.cognitive_snapshot.stress === 'High' ? 'text-rose-400 font-bold' : 'text-slate-300'}>{log.cognitive_snapshot.stress}</strong>
                    </div>
                    <div>
                      Attention: <strong className="text-slate-300">{log.cognitive_snapshot.attention}</strong>
                    </div>
                    <div>
                      GSR: <strong className="text-sky-400">{log.biometrics_snapshot?.gsr || 2.4} µS</strong>
                    </div>
                    <div>
                      Heart Rate: <strong className="text-slate-400">{log.biometrics_snapshot?.heartRate || 70} BPM</strong>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
