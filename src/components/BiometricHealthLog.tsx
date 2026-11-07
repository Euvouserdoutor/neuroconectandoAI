import React, { useState, useEffect, useRef } from 'react';
import { select, scalePoint, scaleLinear, scaleBand, line, curveMonotoneX, axisBottom, axisLeft } from 'd3';
import { 
  Heart, 
  Activity, 
  Zap, 
  TrendingUp, 
  Sparkles, 
  Calendar, 
  RefreshCw, 
  BarChart2, 
  Clock, 
  Compass, 
  Gauge, 
  Brain, 
  ShieldAlert, 
  CheckCircle2, 
  Flame, 
  Sun, 
  Sunset, 
  Moon 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface BiometricHistoryPoint {
  id: string;
  timestamp: string; // e.g. "Mon AM", "Mon PM", "Mon EV"
  day: string;       // e.g. "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"
  heartRate: number; // BPM
  hrv: number;       // ms
  gsr: number;       // µS
  cognitiveLoad: number; // %
}

// 7-day historical biometric logs (3 points per day: Morning AM, Afternoon PM, Evening EV)
const INITIAL_7_DAY_LOGS: BiometricHistoryPoint[] = [
  { id: '1', timestamp: 'Mon AM', day: 'Mon', heartRate: 68, hrv: 74, gsr: 1.8, cognitiveLoad: 35 },
  { id: '2', timestamp: 'Mon PM', day: 'Mon', heartRate: 85, hrv: 55, gsr: 3.4, cognitiveLoad: 68 },
  { id: '3', timestamp: 'Mon EV', day: 'Mon', heartRate: 72, hrv: 68, gsr: 2.1, cognitiveLoad: 42 },
  
  { id: '4', timestamp: 'Tue AM', day: 'Tue', heartRate: 65, hrv: 80, gsr: 1.5, cognitiveLoad: 28 },
  { id: '5', timestamp: 'Tue PM', day: 'Tue', heartRate: 92, hrv: 48, gsr: 4.2, cognitiveLoad: 75 },
  { id: '6', timestamp: 'Tue EV', day: 'Tue', heartRate: 75, hrv: 62, gsr: 2.5, cognitiveLoad: 48 },
  
  { id: '7', timestamp: 'Wed AM', day: 'Wed', heartRate: 70, hrv: 72, gsr: 1.9, cognitiveLoad: 38 },
  { id: '8', timestamp: 'Wed PM', day: 'Wed', heartRate: 80, hrv: 60, gsr: 3.1, cognitiveLoad: 55 },
  { id: '9', timestamp: 'Wed EV', day: 'Wed', heartRate: 78, hrv: 64, gsr: 2.8, cognitiveLoad: 50 },
  
  { id: '10', timestamp: 'Thu AM', day: 'Thu', heartRate: 67, hrv: 76, gsr: 1.7, cognitiveLoad: 32 },
  { id: '11', timestamp: 'Thu PM', day: 'Thu', heartRate: 98, hrv: 42, gsr: 4.8, cognitiveLoad: 82 },
  { id: '12', timestamp: 'Thu EV', day: 'Thu', heartRate: 82, hrv: 58, gsr: 2.9, cognitiveLoad: 54 },
  
  { id: '13', timestamp: 'Fri AM', day: 'Fri', heartRate: 69, hrv: 75, gsr: 1.6, cognitiveLoad: 33 },
  { id: '14', timestamp: 'Fri PM', day: 'Fri', heartRate: 88, hrv: 52, gsr: 3.6, cognitiveLoad: 64 },
  { id: '15', timestamp: 'Fri EV', day: 'Fri', heartRate: 71, hrv: 70, gsr: 2.0, cognitiveLoad: 40 },
  
  { id: '16', timestamp: 'Sat AM', day: 'Sat', heartRate: 62, hrv: 85, gsr: 1.2, cognitiveLoad: 20 },
  { id: '17', timestamp: 'Sat PM', day: 'Sat', heartRate: 75, hrv: 78, gsr: 2.2, cognitiveLoad: 35 },
  { id: '18', timestamp: 'Sat EV', day: 'Sat', heartRate: 66, hrv: 82, gsr: 1.4, cognitiveLoad: 25 },
  
  { id: '19', timestamp: 'Sun AM', day: 'Sun', heartRate: 64, hrv: 82, gsr: 1.3, cognitiveLoad: 22 },
  { id: '20', timestamp: 'Sun PM', day: 'Sun', heartRate: 78, hrv: 74, gsr: 2.4, cognitiveLoad: 38 },
  { id: '21', timestamp: 'Sun EV', day: 'Sun', heartRate: 68, hrv: 79, gsr: 1.6, cognitiveLoad: 27 },
];

export default function BiometricHealthLog() {
  const [data, setData] = useState<BiometricHistoryPoint[]>(INITIAL_7_DAY_LOGS);
  
  // Dashboard Tabs: 'timeline' (Trend line plot), 'scatter' (Stress-Focus quadrant), 'chronotype' (AM/PM/EV distribution), 'states' (Autonomic state composition)
  const [activeDashboardTab, setActiveDashboardTab] = useState<'timeline' | 'scatter' | 'chronotype' | 'states'>('timeline');
  
  // Sub-metrics filter specifically for trend timeline view
  const [activeTimelineFilter, setActiveTimelineFilter] = useState<'all' | 'hr' | 'hrv' | 'gsr'>('all');
  
  const [hoveredPoint, setHoveredPoint] = useState<BiometricHistoryPoint | null>(null);
  const [hoverCoords, setHoverCoords] = useState<{ x: number; y: number } | null>(null);
  
  // Specific interactive tooltips for other charts
  const [hoveredBar, setHoveredBar] = useState<{ group: string; metric: string; value: number; x: number; y: number } | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 680, height: 320 });

  // Handle responsive width & height calculation
  useEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width } = entry.contentRect;
        setDimensions({
          width: Math.max(width, 280),
          height: 320
        });
      }
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Compute a normalized Stress Index: high HR & low HRV indicates high physiological activation (stress)
  const getStressScore = (hr: number, hrv: number) => {
    const hrPart = (Math.max(50, Math.min(110, hr)) - 50) / 60; // 0 to 1
    const hrvPart = 1 - (Math.max(30, Math.min(100, hrv)) - 30) / 70; // 0 to 1 (high HRV = low stress)
    return Math.round((hrPart * 0.65 + hrvPart * 0.35) * 100);
  };

  // Helper to resolve colors based on quadrant mappings
  const getQuadrantColor = (point: BiometricHistoryPoint) => {
    if (point.heartRate < 78) {
      return point.cognitiveLoad >= 50 ? '#10b981' : '#3b82f6'; // Emerald (Flow) vs Blue (Rest)
    } else {
      return point.cognitiveLoad >= 50 ? '#f43f5e' : '#f59e0b'; // Rose (Overload) vs Amber (Arousal)
    }
  };

  // Compute overall statistical aggregates
  const stats = {
    heartRate: {
      avg: Math.round(data.reduce((sum, d) => sum + d.heartRate, 0) / data.length),
      max: Math.max(...data.map(d => d.heartRate)),
      min: Math.min(...data.map(d => d.heartRate)),
    },
    hrv: {
      avg: Math.round(data.reduce((sum, d) => sum + d.hrv, 0) / data.length),
      max: Math.max(...data.map(d => d.hrv)),
      min: Math.min(...data.map(d => d.hrv)),
    },
    gsr: {
      avg: parseFloat((data.reduce((sum, d) => sum + d.gsr, 0) / data.length).toFixed(2)),
      max: Math.max(...data.map(d => d.gsr)),
      min: Math.min(...data.map(d => d.gsr)),
    },
    cognitiveLoad: {
      avg: Math.round(data.reduce((sum, d) => sum + d.cognitiveLoad, 0) / data.length),
      max: Math.max(...data.map(d => d.cognitiveLoad)),
    }
  };

  // Autonomic state classification & percentage calculations
  const totalPointsCount = data.length;
  const stateCounts = data.reduce(
    (acc, point) => {
      const stress = getStressScore(point.heartRate, point.hrv);
      if (point.cognitiveLoad >= 50 && stress < 45) {
        acc.flow += 1;
      } else if (point.cognitiveLoad >= 45 && stress >= 45 && stress < 70) {
        acc.optimal += 1;
      } else if (point.cognitiveLoad < 45 && stress < 40) {
        acc.rest += 1;
      } else {
        acc.stress += 1;
      }
      return acc;
    },
    { flow: 0, optimal: 0, rest: 0, stress: 0 }
  );

  const statePercentages = {
    flow: Math.round((stateCounts.flow / totalPointsCount) * 100),
    optimal: Math.round((stateCounts.optimal / totalPointsCount) * 100),
    rest: Math.round((stateCounts.rest / totalPointsCount) * 100),
    stress: Math.round((stateCounts.stress / totalPointsCount) * 100),
  };

  // Grouped chronobiology data (AM, PM, EV)
  const amPoints = data.filter((d) => d.timestamp.includes('AM'));
  const pmPoints = data.filter((d) => d.timestamp.includes('PM'));
  const evPoints = data.filter((d) => d.timestamp.includes('EV'));

  const chronotypeData = [
    {
      group: 'Morning (AM)',
      cognitiveLoad: Math.round(amPoints.reduce((s, d) => s + d.cognitiveLoad, 0) / amPoints.length),
      stressIndex: Math.round(amPoints.reduce((s, d) => s + getStressScore(d.heartRate, d.hrv), 0) / amPoints.length),
      hrv: Math.round(amPoints.reduce((s, d) => s + d.hrv, 0) / amPoints.length),
    },
    {
      group: 'Afternoon (PM)',
      cognitiveLoad: Math.round(pmPoints.reduce((s, d) => s + d.cognitiveLoad, 0) / pmPoints.length),
      stressIndex: Math.round(pmPoints.reduce((s, d) => s + getStressScore(d.heartRate, d.hrv), 0) / pmPoints.length),
      hrv: Math.round(pmPoints.reduce((s, d) => s + d.hrv, 0) / pmPoints.length),
    },
    {
      group: 'Evening (EV)',
      cognitiveLoad: Math.round(evPoints.reduce((s, d) => s + d.cognitiveLoad, 0) / evPoints.length),
      stressIndex: Math.round(evPoints.reduce((s, d) => s + getStressScore(d.heartRate, d.hrv), 0) / evPoints.length),
      hrv: Math.round(evPoints.reduce((s, d) => s + d.hrv, 0) / evPoints.length),
    },
  ];

  // Re-draw D3 charts dynamically depending on selected analytics view
  useEffect(() => {
    if (!svgRef.current || !data.length) return;

    const { width, height } = dimensions;
    const margin = { top: 30, right: 35, bottom: 45, left: 55 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Clear previous SVG content completely
    const svg = select(svgRef.current);
    svg.selectAll('*').remove();

    // ----------------------------------------------------
    // VIEW 1: TREND TIMELINE LINE CHART
    // ----------------------------------------------------
    if (activeDashboardTab === 'timeline') {
      // Scales
      const xScale = scalePoint()
        .domain(data.map((d) => d.timestamp))
        .range([margin.left, width - margin.right])
        .padding(0.25);

      let yDomain: [number, number] = [0, 100];
      if (activeTimelineFilter === 'hr') {
        const minHR = Math.min(...data.map((d) => d.heartRate));
        const maxHR = Math.max(...data.map((d) => d.heartRate));
        yDomain = [Math.max(40, minHR - 8), maxHR + 8];
      } else if (activeTimelineFilter === 'hrv') {
        const minHRV = Math.min(...data.map((d) => d.hrv));
        const maxHRV = Math.max(...data.map((d) => d.hrv));
        yDomain = [Math.max(20, minHRV - 8), maxHRV + 8];
      } else if (activeTimelineFilter === 'gsr') {
        const minGSR = Math.min(...data.map((d) => d.gsr));
        const maxGSR = Math.max(...data.map((d) => d.gsr));
        yDomain = [Math.max(0, minGSR - 0.4), maxGSR + 0.4];
      } else {
        yDomain = [0, 110];
      }

      const yScale = scaleLinear()
        .domain(yDomain)
        .range([height - margin.bottom, margin.top]);

      // Gridlines
      svg.append('g')
        .attr('class', 'grid-lines')
        .attr('opacity', 0.05)
        .selectAll('line')
        .data(yScale.ticks(5))
        .enter()
        .append('line')
        .attr('x1', margin.left)
        .attr('x2', width - margin.right)
        .attr('y1', (d) => yScale(d))
        .attr('y2', (d) => yScale(d))
        .attr('stroke', '#ffffff')
        .attr('stroke-width', 1);

      // Axes
      const xAxis = axisBottom(xScale)
        .tickFormat((t) => {
          if (t.includes('AM')) return t.replace(' AM', '');
          return '';
        })
        .tickSize(5);

      const yAxis = axisLeft(yScale)
        .ticks(6)
        .tickSize(5);

      svg.append('g')
        .attr('transform', `translate(0, ${height - margin.bottom})`)
        .attr('class', 'x-axis')
        .call(xAxis)
        .selectAll('text')
        .attr('fill', '#94a3b8')
        .style('font-size', '8px')
        .style('font-family', 'JetBrains Mono, monospace');

      svg.select('.x-axis path').attr('stroke', '#334155');
      svg.selectAll('.x-axis line').attr('stroke', '#334155');

      svg.append('g')
        .attr('transform', `translate(${margin.left}, 0)`)
        .attr('class', 'y-axis')
        .call(yAxis)
        .selectAll('text')
        .attr('fill', '#94a3b8')
        .style('font-size', '8px')
        .style('font-family', 'JetBrains Mono, monospace')
        .text((d) => {
          if (activeTimelineFilter === 'gsr') return `${d}µS`;
          if (activeTimelineFilter === 'hrv') return `${d}ms`;
          if (activeTimelineFilter === 'hr') return `${d}b`;
          return `${d}%`;
        });

      svg.select('.y-axis path').attr('stroke', '#334155');
      svg.selectAll('.y-axis line').attr('stroke', '#334155');

      // Lines
      const hrLineGen = line<BiometricHistoryPoint>()
        .x((d) => xScale(d.timestamp) || 0)
        .y((d) => yScale(d.heartRate))
        .curve(curveMonotoneX);

      const hrvLineGen = line<BiometricHistoryPoint>()
        .x((d) => xScale(d.timestamp) || 0)
        .y((d) => yScale(d.hrv))
        .curve(curveMonotoneX);

      const gsrLineGen = line<BiometricHistoryPoint>()
        .x((d) => xScale(d.timestamp) || 0)
        .y((d) => yScale(activeTimelineFilter === 'all' ? d.gsr * 15 : d.gsr))
        .curve(curveMonotoneX);

      if (activeTimelineFilter === 'all' || activeTimelineFilter === 'hr') {
        svg.append('path')
          .datum(data)
          .attr('fill', 'none')
          .attr('stroke', '#f43f5e')
          .attr('stroke-width', 2.2)
          .attr('d', hrLineGen)
          .attr('stroke-linecap', 'round');

        svg.append('path')
          .datum(data)
          .attr('fill', 'none')
          .attr('stroke', '#f43f5e')
          .attr('stroke-width', 5)
          .attr('opacity', 0.1)
          .attr('d', hrLineGen);
      }

      if (activeTimelineFilter === 'all' || activeTimelineFilter === 'hrv') {
        svg.append('path')
          .datum(data)
          .attr('fill', 'none')
          .attr('stroke', '#10b981')
          .attr('stroke-width', 2.2)
          .attr('d', hrvLineGen)
          .attr('stroke-linecap', 'round');

        svg.append('path')
          .datum(data)
          .attr('fill', 'none')
          .attr('stroke', '#10b981')
          .attr('stroke-width', 5)
          .attr('opacity', 0.1)
          .attr('d', hrvLineGen);
      }

      if (activeTimelineFilter === 'all' || activeTimelineFilter === 'gsr') {
        svg.append('path')
          .datum(data)
          .attr('fill', 'none')
          .attr('stroke', '#f59e0b')
          .attr('stroke-width', 2.2)
          .attr('d', gsrLineGen)
          .attr('stroke-linecap', 'round');

        svg.append('path')
          .datum(data)
          .attr('fill', 'none')
          .attr('stroke', '#f59e0b')
          .attr('stroke-width', 5)
          .attr('opacity', 0.1)
          .attr('d', gsrLineGen);
      }

      // Live hovered state drawing (Glow alignment & Guideline)
      if (hoveredPoint) {
        const cx = xScale(hoveredPoint.timestamp) || 0;
        const bandWidth = chartWidth / data.length;

        // Background Column Highlight
        svg.append('rect')
          .attr('x', cx - bandWidth / 2)
          .attr('y', margin.top)
          .attr('width', bandWidth)
          .attr('height', chartHeight)
          .attr('fill', 'rgba(99, 102, 241, 0.04)')
          .attr('pointer-events', 'none');

        // Guideline
        svg.append('line')
          .attr('x1', cx)
          .attr('x2', cx)
          .attr('y1', margin.top)
          .attr('y2', height - margin.bottom)
          .attr('stroke', '#334155')
          .attr('stroke-width', 1)
          .attr('stroke-dasharray', '3,3')
          .attr('pointer-events', 'none');

        // Intersection circle anchors
        const drawDotAnchor = (cy: number, color: string) => {
          svg.append('circle')
            .attr('cx', cx)
            .attr('cy', cy)
            .attr('r', 7)
            .attr('fill', color)
            .attr('opacity', 0.22)
            .attr('pointer-events', 'none');

          svg.append('circle')
            .attr('cx', cx)
            .attr('cy', cy)
            .attr('r', 4)
            .attr('fill', color)
            .attr('stroke', '#0f172a')
            .attr('stroke-width', 1.5)
            .attr('pointer-events', 'none');
        };

        if (activeTimelineFilter === 'all' || activeTimelineFilter === 'hr') {
          drawDotAnchor(yScale(hoveredPoint.heartRate), '#f43f5e');
        }
        if (activeTimelineFilter === 'all' || activeTimelineFilter === 'hrv') {
          drawDotAnchor(yScale(hoveredPoint.hrv), '#10b981');
        }
        if (activeTimelineFilter === 'all' || activeTimelineFilter === 'gsr') {
          const cyGSR = yScale(activeTimelineFilter === 'all' ? hoveredPoint.gsr * 15 : hoveredPoint.gsr);
          drawDotAnchor(cyGSR, '#f59e0b');
        }
      }

      // Overlay hover slices
      const interactionGroup = svg.append('g').attr('class', 'interaction-triggers');
      data.forEach((point) => {
        const cx = xScale(point.timestamp) || 0;
        interactionGroup.append('rect')
          .attr('x', cx - (chartWidth / data.length) / 2)
          .attr('y', margin.top)
          .attr('width', chartWidth / data.length)
          .attr('height', chartHeight)
          .attr('fill', 'transparent')
          .attr('class', 'hover-trigger-cell cursor-crosshair')
          .on('mouseenter', () => {
            setHoveredPoint(point);
            const activeY = activeTimelineFilter === 'hr' ? yScale(point.heartRate)
                          : activeTimelineFilter === 'hrv' ? yScale(point.hrv)
                          : activeTimelineFilter === 'gsr' ? yScale(point.gsr)
                          : yScale(point.heartRate);
            setHoverCoords({ x: cx, y: activeY });
          })
          .on('mouseleave', () => {
            setHoveredPoint(null);
            setHoverCoords(null);
          });
      });
    }

    // ----------------------------------------------------
    // VIEW 2: COGNITIVE SCATTER MATRIX
    // ----------------------------------------------------
    else if (activeDashboardTab === 'scatter') {
      const xScale = scaleLinear()
        .domain([55, 105]) // HR range
        .range([margin.left, width - margin.right]);

      const yScale = scaleLinear()
        .domain([0, 100]) // Cognitive Load range
        .range([height - margin.bottom, margin.top]);

      // Divide quadrants backgrounds
      const renderQuadrantBG = (xStart: number, xEnd: number, yStart: number, yEnd: number, fillColor: string, label: string) => {
        const x1 = xScale(xStart);
        const x2 = xScale(xEnd);
        const y1 = yScale(yStart);
        const y2 = yScale(yEnd);

        svg.append('rect')
          .attr('x', Math.min(x1, x2))
          .attr('y', Math.min(y1, y2))
          .attr('width', Math.abs(x2 - x1))
          .attr('height', Math.abs(y2 - y1))
          .attr('fill', fillColor)
          .attr('opacity', 0.035);

        svg.append('text')
          .attr('x', Math.min(x1, x2) + 8)
          .attr('y', Math.max(y1, y2) - 8)
          .attr('fill', '#475569')
          .style('font-size', '8px')
          .style('font-family', 'JetBrains Mono, monospace')
          .style('font-weight', 'bold')
          .attr('opacity', 0.5)
          .text(label);
      };

      // Plot the 4 cognitive quadrants
      renderQuadrantBG(55, 78, 50, 100, '#10b981', 'CALM FLOW STATE');
      renderQuadrantBG(78, 105, 50, 100, '#f43f5e', 'STRESS COGNITIVE OVERLOAD');
      renderQuadrantBG(55, 78, 0, 50, '#3b82f6', 'PASSIVE RESTORATION');
      renderQuadrantBG(78, 105, 0, 50, '#f59e0b', 'ANXIOUS ACTIVATION');

      // Grid dividers
      svg.append('line')
        .attr('x1', xScale(78))
        .attr('x2', xScale(78))
        .attr('y1', margin.top)
        .attr('y2', height - margin.bottom)
        .attr('stroke', '#1e293b')
        .attr('stroke-width', 1.5)
        .attr('stroke-dasharray', '4,4');

      svg.append('line')
        .attr('x1', margin.left)
        .attr('x2', width - margin.right)
        .attr('y1', yScale(50))
        .attr('y2', yScale(50))
        .attr('stroke', '#1e293b')
        .attr('stroke-width', 1.5)
        .attr('stroke-dasharray', '4,4');

      // Grid lines
      svg.append('g')
        .attr('opacity', 0.03)
        .selectAll('line')
        .data(yScale.ticks(5))
        .enter()
        .append('line')
        .attr('x1', margin.left)
        .attr('x2', width - margin.right)
        .attr('y1', (d) => yScale(d))
        .attr('y2', (d) => yScale(d))
        .attr('stroke', '#ffffff');

      // Axes
      const xAxis = axisBottom(xScale).ticks(6).tickSize(5);
      const yAxis = axisLeft(yScale).ticks(5).tickSize(5);

      svg.append('g')
        .attr('transform', `translate(0, ${height - margin.bottom})`)
        .attr('class', 'x-axis')
        .call(xAxis)
        .selectAll('text')
        .attr('fill', '#94a3b8')
        .style('font-size', '8px')
        .style('font-family', 'JetBrains Mono, monospace');

      svg.append('g')
        .attr('transform', `translate(${margin.left}, 0)`)
        .attr('class', 'y-axis')
        .call(yAxis)
        .selectAll('text')
        .attr('fill', '#94a3b8')
        .style('font-size', '8px')
        .style('font-family', 'JetBrains Mono, monospace');

      svg.select('.x-axis path').attr('stroke', '#334155');
      svg.selectAll('.x-axis line').attr('stroke', '#334155');
      svg.select('.y-axis path').attr('stroke', '#334155');
      svg.selectAll('.y-axis line').attr('stroke', '#334155');

      // Axis Titles
      svg.append('text')
        .attr('x', width / 2 + 10)
        .attr('y', height - 10)
        .attr('text-anchor', 'middle')
        .attr('fill', '#64748b')
        .style('font-size', '8px')
        .style('font-family', 'JetBrains Mono, monospace')
        .text('Heart Rate (BPM) ──>');

      svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', 15)
        .attr('x', -height / 2)
        .attr('text-anchor', 'middle')
        .attr('fill', '#64748b')
        .style('font-size', '8px')
        .style('font-family', 'JetBrains Mono, monospace')
        .text('Cognitive Load (%) ──>');

      // Plot data circles
      data.forEach((point) => {
        const cx = xScale(point.heartRate);
        const cy = yScale(point.cognitiveLoad);
        const isHovered = hoveredPoint?.id === point.id;
        const ptColor = getQuadrantColor(point);

        // Hover rings
        if (isHovered) {
          svg.append('circle')
            .attr('cx', cx)
            .attr('cy', cy)
            .attr('r', 11)
            .attr('fill', ptColor)
            .attr('opacity', 0.25)
            .attr('pointer-events', 'none');
        }

        svg.append('circle')
          .attr('cx', cx)
          .attr('cy', cy)
          .attr('r', isHovered ? 6 : 4.5)
          .attr('fill', ptColor)
          .attr('stroke', isHovered ? '#ffffff' : '#0f172a')
          .attr('stroke-width', isHovered ? 1.5 : 1)
          .style('cursor', 'crosshair')
          .on('mouseenter', () => {
            setHoveredPoint(point);
            setHoverCoords({ x: cx, y: cy });
          })
          .on('mouseleave', () => {
            setHoveredPoint(null);
            setHoverCoords(null);
          });
      });
    }

    // ----------------------------------------------------
    // VIEW 3: CHRONOBIOLOGICAL FOCUS COGNITIVE BAR CHART
    // ----------------------------------------------------
    else if (activeDashboardTab === 'chronotype') {
      const xGroupScale = scaleBand()
        .domain(['Morning (AM)', 'Afternoon (PM)', 'Evening (EV)'])
        .range([margin.left, width - margin.right])
        .padding(0.25);

      const subCategories = ['cognitiveLoad', 'stressIndex', 'hrv'];
      const xSubScale = scaleBand()
        .domain(subCategories)
        .range([0, xGroupScale.bandwidth()])
        .padding(0.08);

      const yScale = scaleLinear()
        .domain([0, 100])
        .range([height - margin.bottom, margin.top]);

      // Gridlines
      svg.append('g')
        .attr('opacity', 0.03)
        .selectAll('line')
        .data(yScale.ticks(5))
        .enter()
        .append('line')
        .attr('x1', margin.left)
        .attr('x2', width - margin.right)
        .attr('y1', (d) => yScale(d))
        .attr('y2', (d) => yScale(d))
        .attr('stroke', '#ffffff');

      // Axes
      const xAxis = axisBottom(xGroupScale).tickSize(5);
      const yAxis = axisLeft(yScale).ticks(5).tickSize(5);

      svg.append('g')
        .attr('transform', `translate(0, ${height - margin.bottom})`)
        .attr('class', 'x-axis')
        .call(xAxis)
        .selectAll('text')
        .attr('fill', '#94a3b8')
        .style('font-size', '8.5px')
        .style('font-weight', 'bold')
        .style('font-family', 'JetBrains Mono, monospace');

      svg.append('g')
        .attr('transform', `translate(${margin.left}, 0)`)
        .attr('class', 'y-axis')
        .call(yAxis)
        .selectAll('text')
        .attr('fill', '#94a3b8')
        .style('font-size', '8px')
        .style('font-family', 'JetBrains Mono, monospace');

      svg.select('.x-axis path').attr('stroke', '#334155');
      svg.selectAll('.x-axis line').attr('stroke', '#334155');
      svg.select('.y-axis path').attr('stroke', '#334155');
      svg.selectAll('.y-axis line').attr('stroke', '#334155');

      const colorsMap: Record<string, string> = {
        cognitiveLoad: '#6366f1', // Indigo-500
        stressIndex: '#f43f5e',   // Rose-500
        hrv: '#10b981',           // Emerald-500
      };

      const labelsMap: Record<string, string> = {
        cognitiveLoad: 'Focus Power',
        stressIndex: 'Stress Level',
        hrv: 'HRV (ms)',
      };

      // Draw Grouped Columns
      chronotypeData.forEach((groupData) => {
        subCategories.forEach((metricKey) => {
          const val = groupData[metricKey as keyof typeof groupData] as number;
          const startX = (xGroupScale(groupData.group) || 0) + (xSubScale(metricKey) || 0);
          const startY = yScale(val);
          const colWidth = xSubScale.bandwidth();
          const colHeight = height - margin.bottom - startY;

          const colColor = colorsMap[metricKey];
          const isBarHovered = hoveredBar && hoveredBar.group === groupData.group && hoveredBar.metric === metricKey;

          svg.append('rect')
            .attr('x', startX)
            .attr('y', startY)
            .attr('width', colWidth)
            .attr('height', Math.max(0, colHeight))
            .attr('fill', colColor)
            .attr('rx', 3)
            .attr('opacity', isBarHovered ? 0.95 : 0.75)
            .style('cursor', 'pointer')
            .on('mouseenter', () => {
              setHoveredBar({
                group: groupData.group,
                metric: labelsMap[metricKey],
                value: val,
                x: startX + colWidth / 2,
                y: startY
              });
            })
            .on('mouseleave', () => {
              setHoveredBar(null);
            });

          // Glow effects for hovered columns
          if (isBarHovered) {
            svg.append('rect')
              .attr('x', startX - 2)
              .attr('y', startY - 2)
              .attr('width', colWidth + 4)
              .attr('height', Math.max(0, colHeight + 2))
              .attr('fill', 'transparent')
              .attr('stroke', colColor)
              .attr('stroke-width', 1.5)
              .attr('opacity', 0.5)
              .attr('rx', 4)
              .attr('pointer-events', 'none');
          }
        });
      });
    }

  }, [data, activeDashboardTab, activeTimelineFilter, dimensions, hoveredPoint, hoveredBar]);

  // Trigger dynamic study simulator update to mock active work stressors
  const handleSimulateUpdate = () => {
    setIsSimulating(true);
    setTimeout(() => {
      const simulatedNewLogs = data.map((point) => {
        const isPM = point.timestamp.includes('PM');
        const hrOffset = isPM ? Math.round((Math.random() - 0.25) * 14) : Math.round((Math.random() - 0.5) * 8);
        const hrvOffset = isPM ? Math.round((Math.random() - 0.7) * 12) : Math.round((Math.random() - 0.4) * 10);
        const gsrOffset = parseFloat(((Math.random() - 0.4) * 0.9).toFixed(2));
        const cogOffset = Math.round((Math.random() - 0.45) * 10);

        return {
          ...point,
          heartRate: Math.min(125, Math.max(55, point.heartRate + hrOffset)),
          hrv: Math.min(105, Math.max(25, point.hrv + hrvOffset)),
          gsr: parseFloat(Math.min(7.5, Math.max(0.4, point.gsr + gsrOffset)).toFixed(2)),
          cognitiveLoad: Math.min(100, Math.max(15, point.cognitiveLoad + cogOffset)),
        };
      });

      setData(simulatedNewLogs);
      setIsSimulating(false);
    }, 850);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5" id="biometric-health-log-card">
      
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
            <Activity className="h-5 w-5 text-indigo-400 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-100 uppercase tracking-tight flex items-center gap-1.5 font-sans">
              Biometric Diagnostic Hub
              <span className="px-2 py-0.5 bg-indigo-950 text-indigo-400 font-mono text-[8px] uppercase tracking-wider font-extrabold rounded-full border border-indigo-900/40">
                7D Engine
              </span>
            </h3>
            <p className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold">
              Advanced Neuro-Cardiovascular & Stress Analytics
            </p>
          </div>
        </div>

        {/* Simulator Button */}
        <button
          type="button"
          onClick={handleSimulateUpdate}
          disabled={isSimulating}
          className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3 py-1.5 bg-slate-950 border border-slate-850 hover:border-slate-700 hover:bg-slate-900 text-[10px] font-bold text-slate-300 hover:text-white rounded-lg transition-all cursor-pointer select-none disabled:opacity-50"
          title="Simulate stressful quiz and heavy cognitive studies to feed logs with active telemetry data"
          id="trigger-biometric-stressor-button"
        >
          <RefreshCw className={`h-3 w-3 ${isSimulating ? 'animate-spin text-rose-400' : 'text-slate-400'}`} />
          <span>{isSimulating ? 'Recalculating Averages...' : 'Simulate Heavy Study Strain'}</span>
        </button>
      </div>

      {/* 2. Primary Analytical Tab Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 bg-slate-950 p-1 rounded-xl border border-slate-850/80 gap-1">
        <button
          onClick={() => setActiveDashboardTab('timeline')}
          className={`px-3 py-2 text-[9px] uppercase font-black tracking-wider rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeDashboardTab === 'timeline'
              ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30'
              : 'text-slate-500 hover:text-slate-350 hover:bg-slate-900/30'
          }`}
          id="dashboard-tab-timeline"
        >
          <TrendingUp className="h-3 w-3" />
          <span>Timeline Trends</span>
        </button>
        <button
          onClick={() => {
            setActiveDashboardTab('scatter');
            setHoveredPoint(null);
            setHoverCoords(null);
          }}
          className={`px-3 py-2 text-[9px] uppercase font-black tracking-wider rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeDashboardTab === 'scatter'
              ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30'
              : 'text-slate-500 hover:text-slate-350 hover:bg-slate-900/30'
          }`}
          id="dashboard-tab-scatter"
        >
          <Compass className="h-3 w-3" />
          <span>Stress Matrix</span>
        </button>
        <button
          onClick={() => {
            setActiveDashboardTab('chronotype');
            setHoveredPoint(null);
            setHoverCoords(null);
          }}
          className={`px-3 py-2 text-[9px] uppercase font-black tracking-wider rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeDashboardTab === 'chronotype'
              ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30'
              : 'text-slate-500 hover:text-slate-350 hover:bg-slate-900/30'
          }`}
          id="dashboard-tab-chronotype"
        >
          <Clock className="h-3 w-3" />
          <span>Focus Peaks</span>
        </button>
        <button
          onClick={() => {
            setActiveDashboardTab('states');
            setHoveredPoint(null);
            setHoverCoords(null);
          }}
          className={`px-3 py-2 text-[9px] uppercase font-black tracking-wider rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeDashboardTab === 'states'
              ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30'
              : 'text-slate-500 hover:text-slate-350 hover:bg-slate-900/30'
          }`}
          id="dashboard-tab-states"
        >
          <Gauge className="h-3 w-3" />
          <span>Autonomic Balance</span>
        </button>
      </div>

      {/* 3. Sub-filter filter selection bar (visible strictly when Trend timeline is selected) */}
      {activeDashboardTab === 'timeline' && (
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-850/50 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTimelineFilter('all')}
            className={`px-2.5 py-1 text-[8px] uppercase font-bold tracking-wider rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTimelineFilter === 'all'
                ? 'bg-slate-900 text-indigo-400 border-b border-indigo-500/30 font-black'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            All Parameters
          </button>
          <button
            onClick={() => setActiveTimelineFilter('hr')}
            className={`px-2.5 py-1 text-[8px] uppercase font-bold tracking-wider rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
              activeTimelineFilter === 'hr'
                ? 'bg-rose-950/30 text-rose-400 border-b border-rose-500/30 font-black'
                : 'text-slate-500 hover:text-rose-350'
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
            Heart Rate (BPM)
          </button>
          <button
            onClick={() => setActiveTimelineFilter('hrv')}
            className={`px-2.5 py-1 text-[8px] uppercase font-bold tracking-wider rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
              activeTimelineFilter === 'hrv'
                ? 'bg-emerald-950/30 text-emerald-400 border-b border-emerald-500/30 font-black'
                : 'text-slate-500 hover:text-emerald-350'
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            HRV (ms)
          </button>
          <button
            onClick={() => setActiveTimelineFilter('gsr')}
            className={`px-2.5 py-1 text-[8px] uppercase font-bold tracking-wider rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
              activeTimelineFilter === 'gsr'
                ? 'bg-amber-950/30 text-amber-400 border-b border-amber-500/30 font-black'
                : 'text-slate-500 hover:text-amber-350'
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            GSR (µS)
          </button>
        </div>
      )}

      {/* 4. Dynamic Stat Aggregate Panels */}
      <AnimatePresence mode="wait">
        {activeDashboardTab === 'timeline' && (
          <motion.div
            key="timeline-stats"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-3 gap-2.5"
          >
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 space-y-1">
              <div className="flex justify-between items-center text-[8px] text-slate-500 font-black uppercase">
                <span>Heart Rate</span>
                <Heart className="h-3 w-3 text-rose-500" />
              </div>
              <div className="flex items-baseline gap-1">
                <strong className="text-slate-100 text-sm font-black font-mono">{stats.heartRate.avg}</strong>
                <span className="text-[7.5px] text-slate-500 font-mono">BPM AVG</span>
              </div>
              <div className="flex justify-between text-[7px] text-slate-500 font-mono pt-1 border-t border-slate-900/60">
                <span>Min: {stats.heartRate.min}</span>
                <span>Max: {stats.heartRate.max}</span>
              </div>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 space-y-1">
              <div className="flex justify-between items-center text-[8px] text-slate-500 font-black uppercase">
                <span>HRV Balance</span>
                <Activity className="h-3 w-3 text-emerald-500" />
              </div>
              <div className="flex items-baseline gap-1">
                <strong className="text-slate-100 text-sm font-black font-mono">{stats.hrv.avg}</strong>
                <span className="text-[7.5px] text-slate-500 font-mono">ms baseline</span>
              </div>
              <div className="flex justify-between text-[7px] text-slate-500 font-mono pt-1 border-t border-slate-900/60">
                <span>Min: {stats.hrv.min}</span>
                <span>Max: {stats.hrv.max}</span>
              </div>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 space-y-1">
              <div className="flex justify-between items-center text-[8px] text-slate-500 font-black uppercase">
                <span>GSR Conductance</span>
                <Zap className="h-3 w-3 text-amber-500" />
              </div>
              <div className="flex items-baseline gap-1">
                <strong className="text-slate-100 text-sm font-black font-mono">{stats.gsr.avg}</strong>
                <span className="text-[7.5px] text-slate-500 font-mono">µS LEVEL</span>
              </div>
              <div className="flex justify-between text-[7px] text-slate-500 font-mono pt-1 border-t border-slate-900/60">
                <span>Min: {stats.gsr.min}</span>
                <span>Max: {stats.gsr.max}</span>
              </div>
            </div>
          </motion.div>
        )}

        {activeDashboardTab === 'scatter' && (
          <motion.div
            key="scatter-stats"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-3 gap-2.5"
          >
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 space-y-1">
              <div className="flex justify-between items-center text-[8px] text-slate-500 font-black uppercase">
                <span>Flow Ratio</span>
                <Sparkles className="h-3 w-3 text-emerald-400" />
              </div>
              <div className="flex items-baseline gap-1">
                <strong className="text-emerald-400 text-sm font-black font-mono">
                  {Math.round((data.filter(d => d.heartRate < 78 && d.cognitiveLoad >= 50).length / data.length) * 100)}%
                </strong>
                <span className="text-[7px] text-slate-500 font-mono uppercase font-bold">Flow state</span>
              </div>
              <div className="text-[7px] text-slate-400 font-sans leading-tight">
                Points with calm heart rate & active mind
              </div>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 space-y-1">
              <div className="flex justify-between items-center text-[8px] text-slate-500 font-black uppercase">
                <span>Overload alerts</span>
                <ShieldAlert className="h-3 w-3 text-rose-500" />
              </div>
              <div className="flex items-baseline gap-1">
                <strong className="text-rose-400 text-sm font-black font-mono">
                  {data.filter(d => d.heartRate >= 78 && d.cognitiveLoad >= 50).length}
                </strong>
                <span className="text-[7px] text-slate-500 font-mono uppercase font-bold">Sessions</span>
              </div>
              <div className="text-[7px] text-slate-400 font-sans leading-tight">
                Risk parameters showing strain & tension
              </div>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 space-y-1">
              <div className="flex justify-between items-center text-[8px] text-slate-500 font-black uppercase">
                <span>Rest Ratio</span>
                <CheckCircle2 className="h-3 w-3 text-blue-400" />
              </div>
              <div className="flex items-baseline gap-1">
                <strong className="text-blue-400 text-sm font-black font-mono">
                  {Math.round((data.filter(d => d.heartRate < 78 && d.cognitiveLoad < 50).length / data.length) * 100)}%
                </strong>
                <span className="text-[7px] text-slate-500 font-mono">RESTORATIVE</span>
              </div>
              <div className="text-[7px] text-slate-400 font-sans leading-tight">
                Parasympathetic rest & neural recovery
              </div>
            </div>
          </motion.div>
        )}

        {activeDashboardTab === 'chronotype' && (
          <motion.div
            key="chronotype-stats"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-3 gap-2.5"
          >
            {chronotypeData.map((chrono) => {
              const isPeak = chrono.cognitiveLoad === Math.max(...chronotypeData.map(c => c.cognitiveLoad));
              return (
                <div key={chrono.group} className={`bg-slate-950 p-3 rounded-xl border ${isPeak ? 'border-indigo-500/30' : 'border-slate-850'} space-y-1 relative overflow-hidden`}>
                  {isPeak && (
                    <div className="absolute top-0 right-0 bg-indigo-500/10 text-indigo-400 text-[6px] font-black uppercase px-1 rounded-bl">
                      Peak Focus
                    </div>
                  )}
                  <div className="flex justify-between items-center text-[8px] text-slate-500 font-black uppercase">
                    <span>{chrono.group}</span>
                    {chrono.group.includes('AM') ? (
                      <Sun className="h-3 w-3 text-amber-400" />
                    ) : chrono.group.includes('PM') ? (
                      <Sunset className="h-3 w-3 text-indigo-400" />
                    ) : (
                      <Moon className="h-3 w-3 text-purple-400" />
                    )}
                  </div>
                  <div className="flex items-baseline gap-1">
                    <strong className="text-slate-100 text-sm font-black font-mono">{chrono.cognitiveLoad}%</strong>
                    <span className="text-[7px] text-slate-500 font-mono">Focus Power</span>
                  </div>
                  <div className="flex justify-between text-[7px] text-slate-500 font-mono pt-1 border-t border-slate-900/60">
                    <span>Stress Score: {chrono.stressIndex}%</span>
                    <span>HRV: {chrono.hrv}ms</span>
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 5. Main Canvas Stage (Conditionally rendering D3 elements inside relative overlay) */}
      {activeDashboardTab !== 'states' && (
        <div className="bg-slate-950/40 rounded-2xl border border-slate-850/80 p-3 relative overflow-hidden" ref={containerRef}>
          
          {/* Static Top-Left Telemetry Status Tag */}
          <div className="absolute top-3 left-3 bg-slate-950/90 border border-slate-800/80 px-2 py-1.5 rounded-lg text-[9px] font-mono pointer-events-none select-none z-10 space-y-0.5">
            <div className="text-slate-500 font-black uppercase text-[7px]">SYSTEM TELEMETRY</div>
            <div className="text-slate-400 font-bold flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {hoveredPoint || hoveredBar ? 'Capturing Node Data' : 'Hover over chart plot'}
            </div>
          </div>

          {/* Dynamic Floating Tooltip: Line Trends & Scatter Quad */}
          <AnimatePresence>
            {hoveredPoint && hoverCoords && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -5 }}
                transition={{ duration: 0.12 }}
                className="absolute bg-slate-950/95 border border-slate-800/90 shadow-2xl rounded-xl p-3 text-[10px] pointer-events-none select-none z-25 w-[185px] backdrop-blur-sm"
                style={{
                  left: `${
                    hoverCoords.x > dimensions.width / 2 
                      ? hoverCoords.x - 200 
                      : hoverCoords.x + 15
                  }px`,
                  top: `${Math.min(dimensions.height - 150, Math.max(15, hoverCoords.y - 45))}px`
                }}
              >
                <div className="flex items-center justify-between border-b border-slate-850 pb-1.5 mb-1.5">
                  <span className="font-extrabold text-slate-200 uppercase tracking-wider text-[8px] flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-indigo-400" />
                    {hoveredPoint.day} - {hoveredPoint.timestamp.includes('AM') ? 'Morning' : hoveredPoint.timestamp.includes('PM') ? 'Afternoon' : 'Evening'}
                  </span>
                  <span className="text-[7px] bg-slate-900 px-1.5 py-0.5 text-slate-400 rounded-md font-mono border border-slate-800">
                    {hoveredPoint.timestamp}
                  </span>
                </div>
                <div className="space-y-1.5 font-mono text-[9px]">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                      Heart Rate:
                    </span>
                    <span className="text-rose-400 font-extrabold">{hoveredPoint.heartRate} BPM</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      HRV Balance:
                    </span>
                    <span className="text-emerald-400 font-extrabold">{hoveredPoint.hrv} ms</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                      GSR Conduct:
                    </span>
                    <span className="text-amber-400 font-extrabold">{hoveredPoint.gsr} µS</span>
                  </div>
                  <div className="flex items-center justify-between pt-1.5 border-t border-slate-900 text-[8px]">
                    <span className="text-slate-400">Cognitive Load:</span>
                    <span className="text-indigo-400 font-black">{hoveredPoint.cognitiveLoad}%</span>
                  </div>
                  <div className="flex items-center justify-between text-[8px]">
                    <span className="text-slate-400">Stress Index:</span>
                    <span className="text-rose-400 font-black">{getStressScore(hoveredPoint.heartRate, hoveredPoint.hrv)}%</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Dynamic Floating Tooltip: Grouped Peaks Bar Chart */}
          <AnimatePresence>
            {hoveredBar && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute bg-slate-950 border border-slate-800 shadow-xl rounded-lg p-2 text-[9px] pointer-events-none select-none z-20 font-mono w-[140px]"
                style={{
                  left: `${hoveredBar.x - 70}px`,
                  top: `${Math.max(10, hoveredBar.y - 50)}px`
                }}
              >
                <div className="text-slate-500 uppercase text-[7px] tracking-wide">{hoveredBar.group}</div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-slate-200 font-medium">{hoveredBar.metric}:</span>
                  <span className="text-indigo-400 font-black">{hoveredBar.value}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* SVG canvas */}
          <svg
            ref={svgRef}
            width={dimensions.width}
            height={dimensions.height}
            className="overflow-visible mx-auto"
          />

          {/* Chart Helper Footer Label */}
          <div className="absolute bottom-12 right-4 flex items-center gap-1.5 bg-slate-900/60 border border-slate-800 px-2 py-0.5 rounded-full text-[8px] font-mono text-slate-500">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
            <span>
              {activeDashboardTab === 'timeline' && '7-Day Longitudinal Series'}
              {activeDashboardTab === 'scatter' && 'Cognitive Arousal Quadrant'}
              {activeDashboardTab === 'chronotype' && 'Circadian Performance Grouping'}
            </span>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------
          VIEW 4: AUTONOMIC STATE COMPOSITION & SEGMENTED CHART
          ---------------------------------------------------- */}
      {activeDashboardTab === 'states' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-950/40 border border-slate-850 p-4 rounded-2xl space-y-5"
          id="autonomic-states-analysis-panel"
        >
          <div className="space-y-1">
            <h4 className="text-xs font-black text-slate-200 uppercase tracking-wide">
              Weekly Circadian Autonomic Balance
            </h4>
            <p className="text-[10px] text-slate-400 leading-normal">
              Continuous multi-parameter mapping processes heart-rate variability (HRV) and skin conductance logs to trace your neurological activation patterns over the 7-day period.
            </p>
          </div>

          {/* Segmented Proportional Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[8px] font-mono font-bold text-slate-400 uppercase tracking-wide">
              <span>Physiological State Distribution</span>
              <span className="text-indigo-400">7-Day Aggregated Series</span>
            </div>
            
            <div className="h-4 w-full rounded-lg overflow-hidden flex border border-slate-900 shadow-inner">
              <div 
                className="bg-emerald-500 hover:bg-emerald-400 transition-all cursor-pointer relative group flex items-center justify-center text-[8px] font-mono font-black text-slate-950 shadow-md"
                style={{ width: `${Math.max(8, statePercentages.flow)}%` }}
                title={`Flow Zone: ${statePercentages.flow}% of studied periods`}
              >
                {statePercentages.flow > 12 && `${statePercentages.flow}%`}
              </div>
              <div 
                className="bg-indigo-500 hover:bg-indigo-400 transition-all cursor-pointer relative group flex items-center justify-center text-[8px] font-mono font-black text-white"
                style={{ width: `${Math.max(8, statePercentages.optimal)}%` }}
                title={`Optimal Focus: ${statePercentages.optimal}% of studied periods`}
              >
                {statePercentages.optimal > 12 && `${statePercentages.optimal}%`}
              </div>
              <div 
                className="bg-blue-500 hover:bg-blue-400 transition-all cursor-pointer relative group flex items-center justify-center text-[8px] font-mono font-black text-slate-950"
                style={{ width: `${Math.max(8, statePercentages.rest)}%` }}
                title={`Parasympathetic Restoration: ${statePercentages.rest}% of studied periods`}
              >
                {statePercentages.rest > 12 && `${statePercentages.rest}%`}
              </div>
              <div 
                className="bg-rose-500 hover:bg-rose-400 transition-all cursor-pointer relative group flex items-center justify-center text-[8px] font-mono font-black text-white"
                style={{ width: `${Math.max(8, statePercentages.stress)}%` }}
                title={`Exhaustion / Distress: ${statePercentages.stress}% of studied periods`}
              >
                {statePercentages.stress > 12 && `${statePercentages.stress}%`}
              </div>
            </div>

            {/* Micro Legand Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1.5">
              <div className="flex items-center gap-1.5 text-[8.5px]">
                <span className="h-2 w-2 rounded bg-emerald-500 shrink-0" />
                <span className="text-slate-350 font-bold">Flow Zone ({statePercentages.flow}%)</span>
              </div>
              <div className="flex items-center gap-1.5 text-[8.5px]">
                <span className="h-2 w-2 rounded bg-indigo-500 shrink-0" />
                <span className="text-slate-350 font-bold">Optimal Focus ({statePercentages.optimal}%)</span>
              </div>
              <div className="flex items-center gap-1.5 text-[8.5px]">
                <span className="h-2 w-2 rounded bg-blue-500 shrink-0" />
                <span className="text-slate-350 font-bold">Restoration ({statePercentages.rest}%)</span>
              </div>
              <div className="flex items-center gap-1.5 text-[8.5px]">
                <span className="h-2 w-2 rounded bg-rose-500 shrink-0" />
                <span className="text-slate-350 font-bold">Overload/Distress ({statePercentages.stress}%)</span>
              </div>
            </div>
          </div>

          {/* Autonomic Diagnostics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 space-y-1.5">
              <div className="flex items-center justify-between text-[9px] font-bold text-slate-200">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <Flame className="h-3.5 w-3.5 text-emerald-400" />
                  COGNITIVE EFFICIENCY SCORE
                </span>
                <span className="text-slate-400 font-mono">FLOW ACTIVE</span>
              </div>
              <p className="text-[9.5px] text-slate-400 leading-relaxed">
                You registered <span className="text-emerald-400 font-mono font-bold">{statePercentages.flow + statePercentages.optimal}%</span> of studied slots inside optimal flow conditions. This correlates with moderate physiological activation combined with deep cognitive focus, enabling high-density knowledge retention with low relative stress.
              </p>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 space-y-1.5">
              <div className="flex items-center justify-between text-[9px] font-bold text-slate-200">
                <span className="flex items-center gap-1.5 text-rose-400">
                  <ShieldAlert className="h-3.5 w-3.5 text-rose-400" />
                  STRESS COMPLIANCE INDEX
                </span>
                <span className="text-slate-400 font-mono">AUTONOMIC DAMPENING</span>
              </div>
              <p className="text-[9.5px] text-slate-400 leading-relaxed">
                Your parasympathetic restorative recovery slots represent <span className="text-blue-400 font-mono font-bold">{statePercentages.rest}%</span>. However, stressful overload peaks cover <span className="text-rose-400 font-mono font-bold">{statePercentages.stress}%</span> of your PM study sessions. Activating physical pacing and rhythmic diaphragmatic breathing offsets these stressors.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* 6. Live Diagnostic Insights Panel (Updates Dynamically) */}
      <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-850 flex items-start gap-2.5 text-[9px] text-slate-400 leading-normal">
        <TrendingUp className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <strong className="text-slate-200 uppercase font-black tracking-wide block text-[8px]">
            {activeDashboardTab === 'timeline' && 'NEURAL-CARDIOVASCULAR INTEGRATION REPORT'}
            {activeDashboardTab === 'scatter' && 'COGNITIVE STRESS QUADRANT DIAGNOSTIC'}
            {activeDashboardTab === 'chronotype' && 'CIRCADIAN EFFICIENCY & INTELLECTUAL OPTIMIZATION'}
            {activeDashboardTab === 'states' && 'AUTONOMIC ADAPTABILITY & WELLNESS ACTION PLAN'}
          </strong>
          
          {activeDashboardTab === 'timeline' && (
            <p>
              When cognitive loads surge during afternoon (PM) review runs, average Heart Rate elevates toward <span className="text-rose-400 font-bold font-mono">{stats.heartRate.max} BPM</span>, while HRV drops to <span className="text-emerald-400 font-bold font-mono">{stats.hrv.min} ms</span>. This demonstrates sympathetic branch dominance under active academic strain.
            </p>
          )}

          {activeDashboardTab === 'scatter' && (
            <p>
              The scatter distribution identifies high density in the <span className="text-emerald-400 font-bold">Calm Flow State Zone</span> (low heart rates, high loads). However, afternoon slots occasionally drift into the <span className="text-rose-400 font-bold">Stress Overload Quadrant</span>. We recommend pairing heavy learning runs with the **Coherence Breather** to sustain flow.
            </p>
          )}

          {activeDashboardTab === 'chronotype' && (
            <p>
              Your peak intellectual output window occurs during the <span className="text-indigo-400 font-bold">Morning (AM) periods</span> with an optimal Focus Power of <span className="text-indigo-400 font-black font-mono">{chronotypeData[0].cognitiveLoad}%</span>, coupled with low physical stress. Schedule highly demanding conceptual subjects during AM, leaving EV for light revision.
            </p>
          )}

          {activeDashboardTab === 'states' && (
            <p>
              Your autonomic resilience shows high parasympathetic adaptability. To further diminish stress levels and stabilize skin conductance spikes (active average <span className="text-amber-400 font-mono font-bold">{stats.gsr.avg} µS</span>), perform 3 minutes of slow-pacing biofeedback breathing every 2 hours of study.
            </p>
          )}
        </div>
      </div>

    </div>
  );
}
