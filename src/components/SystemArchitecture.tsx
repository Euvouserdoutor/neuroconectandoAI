import React, { useState } from 'react';
import { Cpu, Zap, Radio, Database, Sliders, ChevronRight, HardDrive, HelpCircle } from 'lucide-react';
import { motion } from 'motion/react';

export default function SystemArchitecture() {
  const [activeLayer, setActiveLayer] = useState<'sensing' | 'dsp' | 'edge' | 'bridge'>('sensing');

  const components = {
    sensing: {
      title: "Biometric Sensor Array",
      description: "Direct analog & digital sensing interfaces capturing physiological telemetry at high frequencies.",
      specs: [
        { name: "PPG Optical Sensor", value: "Green LED (525nm) with transimpedance amplifier, sampling at 100Hz" },
        { name: "GSR Electrodes", value: "Dual stainless steel contacts measuring skin conductance at 20Hz" },
        { name: "ADC Resolution", value: "12-bit internal ADC on ESP32 (Vref @ 1.1V, low-noise calibration)" }
      ]
    },
    dsp: {
      title: "Local Digital Signal Processing",
      description: "On-chip digital filtration to clean noisy biometric signals before feature extraction.",
      specs: [
        { name: "Motion Artifact Filter", value: "3-axis accelerometer feedback with adaptive recursive least squares (RLS)" },
        { name: "PPG Bandpass", value: "Butterworth 2nd-order filter (cutoff 0.5Hz - 4.0Hz) to isolate heart pulses" },
        { name: "PPI Detection", value: "Peak-to-Peak interval algorithm with dynamic thresholding for HRV ms calculation" }
      ]
    },
    edge: {
      title: "ESP32 Embedded Compute Engine",
      description: "Low-cost, high-performance offline processor running real-time state estimation.",
      specs: [
        { name: "Core Architecture", value: "Tensilica Xtensa Dual-Core 32-bit LX6 Microprocessor @ 240 MHz" },
        { name: "SRAM & Flash", value: "520 KB SRAM with 4 MB external SPI Flash memory" },
        { name: "Power Management", value: "Deep sleep mode active under idle states (< 15µA current draw)" }
      ]
    },
    bridge: {
      title: "Secure Encrypted Telemetry Bridge",
      description: "Zero-knowledge edge-to-cloud sync pipeline that respects strict privacy guardrails.",
      specs: [
        { name: "Transmission protocol", value: "Bluetooth Low Energy (BLE) 4.2 with custom 128-bit AES telemetry payload" },
        { name: "Local Cache storage", value: "Cyclic ring buffer in ESP32 Partition Table (keeps last 24H logs offline)" },
        { name: "Network Gateway", value: "Anonymous local proxy gateway; zero personal identifier fields are synced" }
      ]
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-6" id="system-architecture-view">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
          <Cpu className="h-5 w-5 text-yellow-400 animate-pulse" />
        </div>
        <div>
          <h3 className="text-sm font-black text-slate-100 uppercase tracking-tight flex items-center gap-1.5 font-sans">
            Offline Hardware Spec & Telemetry Architecture
            <span className="px-2 py-0.5 bg-yellow-950 text-yellow-400 font-mono text-[8px] uppercase tracking-wider font-extrabold rounded-full border border-yellow-900/40">
              ESP32-S3 Edge
            </span>
          </h3>
          <p className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold">
            Digital Signal Processing (DSP) & Bio-Circuit Schematic
          </p>
        </div>
      </div>

      {/* Visual Hardware Schematic Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-5 bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-4">
          <h4 className="text-[10px] text-slate-400 font-bold uppercase tracking-wider border-b border-slate-900 pb-2">
            System Telemetry Flow Pipeline
          </h4>
          
          <div className="space-y-2">
            <button
              onClick={() => setActiveLayer('sensing')}
              className={`w-full p-2.5 rounded-lg text-left text-xs transition-all flex items-center justify-between border ${
                activeLayer === 'sensing'
                  ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400 font-bold'
                  : 'bg-slate-900/50 border-slate-850 text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <Radio className="h-4 w-4" />
                <span>1. Analog Biosensors</span>
              </div>
              <ChevronRight className="h-3 w-3" />
            </button>

            <button
              onClick={() => setActiveLayer('dsp')}
              className={`w-full p-2.5 rounded-lg text-left text-xs transition-all flex items-center justify-between border ${
                activeLayer === 'dsp'
                  ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400 font-bold'
                  : 'bg-slate-900/50 border-slate-850 text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <Sliders className="h-4 w-4" />
                <span>2. Local DSP Filtration</span>
              </div>
              <ChevronRight className="h-3 w-3" />
            </button>

            <button
              onClick={() => setActiveLayer('edge')}
              className={`w-full p-2.5 rounded-lg text-left text-xs transition-all flex items-center justify-between border ${
                activeLayer === 'edge'
                  ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400 font-bold'
                  : 'bg-slate-900/50 border-slate-850 text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <Cpu className="h-4 w-4" />
                <span>3. ESP32 CPU Module</span>
              </div>
              <ChevronRight className="h-3 w-3" />
            </button>

            <button
              onClick={() => setActiveLayer('bridge')}
              className={`w-full p-2.5 rounded-lg text-left text-xs transition-all flex items-center justify-between border ${
                activeLayer === 'bridge'
                  ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400 font-bold'
                  : 'bg-slate-900/50 border-slate-850 text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                <span>4. Encrypted Sync Bridge</span>
              </div>
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>

          <div className="p-3 bg-yellow-950/20 border border-yellow-900/40 rounded-lg space-y-1">
            <div className="flex items-center gap-1.5 text-[9px] font-bold text-yellow-400 uppercase">
              <Zap className="h-3 w-3 text-yellow-500 animate-bounce" />
              <span>Low-Cost Fabrication Target</span>
            </div>
            <p className="text-[9px] text-slate-400 leading-normal">
              Designed for budget-constrained schools. Total estimated material cost (BOM) is under $12 per device.
            </p>
          </div>
        </div>

        {/* Selected Layer Technical Specs */}
        <div className="lg:col-span-7 bg-slate-950 p-4 rounded-xl border border-slate-850 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-900 pb-2">
              <h4 className="text-[11px] font-extrabold text-slate-200 uppercase tracking-tight">
                {components[activeLayer].title}
              </h4>
              <span className="text-[7.5px] bg-yellow-950/40 text-yellow-500 border border-yellow-900/40 px-2 py-0.5 rounded font-mono uppercase font-black">
                SPEC ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {components[activeLayer].description}
            </p>

            <div className="space-y-2 pt-1">
              {components[activeLayer].specs.map((spec, i) => (
                <div key={i} className="p-2.5 bg-slate-900/60 rounded-lg border border-slate-850/50 flex flex-col md:flex-row md:items-center justify-between gap-1">
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-extrabold">
                    {spec.name}
                  </span>
                  <span className="text-[10.5px] font-medium text-slate-300">
                    {spec.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive hardware signal visualizer mockup */}
          <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-850/60 space-y-2">
            <div className="flex justify-between items-center text-[8px] font-mono text-slate-500">
              <span>LIVE SIGNAL DE-NOISING TEST (SIMULATED)</span>
              <span className="text-emerald-500 flex items-center gap-1">
                <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse" />
                FILTER OK (SNR: +28dB)
              </span>
            </div>
            <div className="h-12 bg-slate-950 rounded border border-slate-900/60 relative overflow-hidden flex items-center justify-center">
              {/* Simple aesthetic canvas line representation */}
              <svg className="w-full h-full" viewBox="0 0 400 40">
                <path
                  d="M 0,20 Q 25,5 50,20 T 100,20 T 150,20 T 200,20 T 250,20 T 300,20 T 350,20 T 400,20"
                  fill="none"
                  stroke="#eab308"
                  strokeWidth="1.5"
                  strokeDasharray="4 2"
                  className="opacity-40"
                />
                <path
                  d="M 0,20 Q 25,12 50,20 T 100,20 T 150,15 T 200,20 T 250,23 T 300,20 T 350,18 T 400,20"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2"
                />
              </svg>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-950/20 to-slate-950 pointer-events-none" />
            </div>
            <div className="flex justify-between text-[7px] text-slate-500 font-mono">
              <span>0ms (RAW)</span>
              <span>250ms (BUTTERWORTH 0.5-4Hz)</span>
              <span>500ms (FILTERED OUTFLOW)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
