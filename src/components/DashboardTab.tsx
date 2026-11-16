// AERO DESIGN STUDIO - RC TRAINER DESIGNER
// Executive Engineering Dashboard & Overview

import React from 'react';
import { CalculatedAircraft } from '../types/aircraft';
import { ThreeDViewer } from './common/ThreeDViewer';
import { formatDimension, formatArea } from '../engine/units';
import {
  Plane,
  Gauge,
  Activity,
  Layers,
  ShieldAlert,
  ShieldCheck,
  ArrowRight,
  Info,
  Scale
} from 'lucide-react';

interface DashboardTabProps {
  aircraft: CalculatedAircraft;
  onNavigateTab: (tabIndex: number) => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  aircraft,
  onNavigateTab
}) => {
  const { wing, fuselage, horizontalStabilizer, verticalStabilizer, performance, config, warnings, assumptions } = aircraft;
  const unit = config.unit;

  return (
    <div className="space-y-6">
      {/* Hero Quick Sizing Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {/* Card 1: Wingspan */}
        <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">Wingspan</span>
          <div className="text-xl font-bold text-white font-mono">{formatDimension(wing.wingspanMm, unit)}</div>
          <span className="text-[10px] text-sky-400 block font-mono">AR: {wing.aspectRatio.toFixed(1)}</span>
        </div>

        {/* Card 2: Wing Area */}
        <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">Wing Area</span>
          <div className="text-xl font-bold text-white font-mono">{formatArea(wing.wingAreaMm2, unit, 0)}</div>
          <span className="text-[10px] text-sky-400 block font-mono">MAC: {formatDimension(wing.meanAerodynamicChordMm, unit)}</span>
        </div>

        {/* Card 3: Est. All-Up Weight */}
        <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">Est. Weight (AUW)</span>
          <div className="text-xl font-bold text-emerald-400 font-mono">{performance.estimatedWeightGrams} g</div>
          <span className="text-[10px] text-slate-400 block font-mono">{(performance.estimatedWeightGrams / 28.35).toFixed(1)} oz</span>
        </div>

        {/* Card 4: Wing Loading */}
        <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">Wing Loading</span>
          <div className="text-xl font-bold text-amber-400 font-mono">{performance.wingLoadingGramsPerDm2} <span className="text-xs">g/dm²</span></div>
          <span className="text-[10px] text-slate-400 block font-mono">{performance.wingLoadingOzPerSqFt} oz/sq ft</span>
        </div>

        {/* Card 5: Stall Speed */}
        <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">Stall Speed</span>
          <div className="text-xl font-bold text-sky-300 font-mono">{performance.stallSpeedKmh} <span className="text-xs">km/h</span></div>
          <span className="text-[10px] text-slate-400 block font-mono">{performance.stallSpeedMph} mph (gentle)</span>
        </div>

        {/* Card 6: Pitch Stability Vh */}
        <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">Tail Volume Vh</span>
          <div className="text-xl font-bold text-emerald-400 font-mono">{horizontalStabilizer.volumeCoefficientActual}</div>
          <span className="text-[10px] text-slate-400 block font-mono">Vv: {verticalStabilizer.volumeCoefficientActual}</span>
        </div>
      </div>

      {/* Main Row: 3D Visualization & Design Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: 3D Airframe Interactive Preview */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Plane className="w-4 h-4 text-sky-400" />
              Dynamic 3D Airframe Sizing Preview
            </h3>
            <button
              onClick={() => onNavigateTab(7)} // Navigate to complete blueprint tab
              className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 font-medium"
            >
              View Full 2D Blueprint Sheet <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <ThreeDViewer aircraft={aircraft} />
        </div>

        {/* Right Col: Aerodynamic Stability & Health Diagnostics */}
        <div className="p-5 bg-slate-900 rounded-2xl border border-slate-800 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <h3 className="font-bold text-sm text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              Engineering Stability Check
            </h3>

            {warnings.length === 0 ? (
              <div className="p-3 bg-emerald-950/50 border border-emerald-800 rounded-xl text-xs text-emerald-300 flex items-start gap-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">All Design Ratios Nominal</span>
                  Pitch volume (Vh = {horizontalStabilizer.volumeCoefficientActual}) and directional volume (Vv = {verticalStabilizer.volumeCoefficientActual}) are in the sweet spot for a stable, self-recovering trainer.
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {warnings.map((w, i) => (
                  <div key={i} className="p-2.5 bg-amber-950/60 border border-amber-800 rounded-xl text-xs text-amber-200 flex items-start gap-2">
                    <ShieldAlert className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                    <span>{w}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Quick Sizing Checklist */}
            <div className="space-y-2 pt-2 border-t border-slate-800 text-xs text-slate-300">
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Wing Configuration:</span>
                <span className="font-semibold text-white">High Wing (Self-Righting)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Airfoil:</span>
                <span className="font-semibold text-white">{wing.airfoil.toUpperCase()} ({wing.maxThicknessPct}% Thick)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Target CG Location:</span>
                <span className="font-semibold text-emerald-400 font-mono">28% - 30% MAC</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Rec. Brushless Motor:</span>
                <span className="font-semibold text-amber-300 font-mono">{performance.recommendedMotorWatts} W</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Rec. Propeller Size:</span>
                <span className="font-semibold text-sky-300 font-mono">{performance.recommendedPropeller}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab(1)} // Navigate to config tab
            className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border border-slate-700 transition"
          >
            Adjust Configuration & Ratios
          </button>
        </div>
      </div>

      {/* Engineering Design Assumptions & Formulas */}
      <div className="p-5 bg-slate-900/60 rounded-2xl border border-slate-800 space-y-3">
        <h4 className="font-bold text-xs uppercase tracking-wider text-sky-400 flex items-center gap-2">
          <Info className="w-4 h-4" />
          Engineering Formulas & Design Assumptions
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300">
          <div className="space-y-1.5">
            <p className="font-semibold text-white">1. Wing & Tail Volume Equations:</p>
            <p className="text-slate-400 font-mono">
              • Wing Area: S = b × c_mean = b² / AR<br />
              • Horizontal Tail Volume: Vh = (S_h × L_tail) / (S_w × MAC)<br />
              • Vertical Tail Volume: Vv = (S_v × L_tail) / (S_w × b)
            </p>
          </div>
          <div className="space-y-1.5">
            <p className="font-semibold text-white">2. Trainer Sizing Philosophy:</p>
            <p className="text-slate-400 leading-relaxed">
              Designed for gentle stalls, positive pitch stability (high Vh), and forgiving low-speed landings.
              Preliminary sizing estimates are mathematical guides for RC construction and require physical CG check prior to flight.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
