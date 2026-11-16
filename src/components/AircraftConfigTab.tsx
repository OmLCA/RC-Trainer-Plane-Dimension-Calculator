// AERO DESIGN STUDIO - RC TRAINER DESIGNER
// Aircraft Configuration & Parameter Sizing Input Panel

import React, { useState, useEffect } from 'react';
import { AircraftConfig, UnitType, AirfoilType, WingPlanformType, LandingGearType } from '../types/aircraft';
import { mmToUnit, unitToMm, formatDimension } from '../engine/units';
import { Sparkles, RotateCcw, Sliders, ChevronDown, ChevronUp, Check, Info } from 'lucide-react';

interface AircraftConfigTabProps {
  config: AircraftConfig;
  onUpdateConfig: (updater: (prev: AircraftConfig) => AircraftConfig) => void;
  onGenerateAircraft: () => void;
}

export const AircraftConfigTab: React.FC<AircraftConfigTabProps> = ({
  config,
  onUpdateConfig,
  onGenerateAircraft
}) => {
  const unit = config.unit;

  // Local state for numeric inputs so user can type freely without jitter
  const [wingspanInput, setWingspanInput] = useState<string>(
    mmToUnit(config.wingspanMm, unit).toFixed(1)
  );

  // Keep input in sync when global unit changes or external config updates
  useEffect(() => {
    setWingspanInput(mmToUnit(config.wingspanMm, unit).toFixed(1));
  }, [config.wingspanMm, unit]);

  const [showAdvancedRatios, setShowAdvancedRatios] = useState<boolean>(false);
  const [showManualOverrides, setShowManualOverrides] = useState<boolean>(false);

  // Handle Wingspan change
  const handleWingspanChange = (valStr: string) => {
    setWingspanInput(valStr);
    const parsed = parseFloat(valStr);
    if (!isNaN(parsed) && parsed > 0) {
      const mm = unitToMm(parsed, unit);
      onUpdateConfig((prev) => ({
        ...prev,
        wingspanMm: Math.round(mm)
      }));
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Prominent Generate Aircraft Banner */}
      <div className="p-6 bg-gradient-to-r from-sky-900/60 via-slate-900 to-slate-900 rounded-2xl border border-sky-800/60 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white tracking-wide">
            AIRCRAFT PRELIMINARY SIZING ENGINE
          </h2>
          <p className="text-xs text-sky-300 mt-1">
            Specify wingspan and configuration to dynamically size all flying surfaces and generate dimensioned technical drawings.
          </p>
        </div>

        <button
          onClick={onGenerateAircraft}
          className="px-6 py-3.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-sm uppercase tracking-wider rounded-xl shadow-lg shadow-sky-500/25 flex items-center gap-2 transform active:scale-95 transition"
        >
          <Sparkles className="w-5 h-5 fill-slate-950" />
          GENERATE AIRCRAFT
        </button>
      </div>

      {/* Main Parameters Card */}
      <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800 space-y-6">
        <h3 className="text-sm font-bold text-sky-400 uppercase tracking-wider flex items-center gap-2">
          <Sliders className="w-4 h-4" />
          Core Aircraft Parameters
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* MANDATORY INPUT: Wingspan */}
          <div className="p-4 bg-slate-950/80 rounded-xl border border-sky-900/50 space-y-2">
            <label className="text-xs font-bold text-white flex items-center justify-between">
              <span>MANDATORY INPUT: WINGSPAN</span>
              <span className="text-sky-400 font-mono">({unit.toUpperCase()})</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step={unit === 'cm' ? '1' : '0.5'}
                min="30"
                max="500"
                value={wingspanInput}
                onChange={(e) => handleWingspanChange(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-lg font-bold font-mono text-sky-400 focus:border-sky-500 outline-none"
              />
              <span className="px-3 py-2.5 bg-slate-800 text-slate-300 font-bold rounded-lg text-xs uppercase font-mono">
                {unit}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Equivalent internal dimension: <strong className="text-slate-200">{config.wingspanMm} mm</strong> ({formatDimension(config.wingspanMm, unit === 'cm' ? 'in' : 'cm')}).
            </p>
          </div>

          {/* Wing Planform Type */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">Wing Planform Type</label>
            <div className="grid grid-cols-2 gap-2">
              {(['rectangular', 'tapered'] as WingPlanformType[]).map((planform) => (
                <button
                  key={planform}
                  type="button"
                  onClick={() =>
                    onUpdateConfig((prev) => ({
                      ...prev,
                      wingPlanform: planform
                    }))
                  }
                  className={`py-2.5 px-3 rounded-lg text-xs font-semibold border capitalize transition ${
                    config.wingPlanform === planform
                      ? 'bg-sky-600 border-sky-400 text-white shadow'
                      : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {planform} Wing
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-400">
              {config.wingPlanform === 'rectangular'
                ? 'Constant chord: easiest to build and provides benign stall progression.'
                : 'Trapezoidal taper: higher aerodynamic efficiency and reduced tip weight.'}
            </p>
          </div>

          {/* Airfoil Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">Airfoil Profile</label>
            <select
              value={config.airfoil}
              onChange={(e) =>
                onUpdateConfig((prev) => ({
                  ...prev,
                  airfoil: e.target.value as AirfoilType
                }))
              }
              className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-xs font-semibold text-slate-200 focus:border-sky-500 outline-none"
            >
              <option value="clark-y">Clark Y (11.7% Flat Bottom – Classic Trainer)</option>
              <option value="naca-2412">NACA 2412 (12% Semi-Symmetrical – Smooth Glide)</option>
              <option value="naca-4412">NACA 4412 (12% Cambered – High Lift STOL)</option>
              <option value="custom">Custom Airfoil (Parametric NACA 4-Digit)</option>
            </select>
          </div>

          {/* Dihedral Angle */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <label className="font-semibold text-slate-300">Wing Dihedral Angle (Γ)</label>
              <span className="font-mono text-sky-400 font-bold">{config.dihedralDeg.toFixed(1)}°</span>
            </div>
            <input
              type="range"
              min="0"
              max="8"
              step="0.5"
              value={config.dihedralDeg}
              onChange={(e) =>
                onUpdateConfig((prev) => ({
                  ...prev,
                  dihedralDeg: parseFloat(e.target.value)
                }))
              }
              className="w-full accent-sky-400"
            />
            <p className="text-[11px] text-slate-400">
              Trainer recommendation: 3.0° to 4.5° with ailerons for positive spiral stability.
            </p>
          </div>

          {/* Fixed Architectural Configurations */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">Wing Configuration</label>
            <input
              type="text"
              readOnly
              value="High Wing (Cabin Mount – Self Righting)"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-medium text-slate-400 cursor-not-allowed"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">Tail Configuration</label>
            <input
              type="text"
              readOnly
              value="Conventional Tail (Horizontal Stabilizer + Vertical Fin)"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-medium text-slate-400 cursor-not-allowed"
            />
          </div>

          {/* Landing Gear Type */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">Landing Gear Configuration</label>
            <div className="grid grid-cols-2 gap-2">
              {(['tricycle', 'taildragger'] as LandingGearType[]).map((gear) => (
                <button
                  key={gear}
                  type="button"
                  onClick={() =>
                    onUpdateConfig((prev) => ({
                      ...prev,
                      landingGearType: gear
                    }))
                  }
                  className={`py-2 px-3 rounded-lg text-xs font-semibold border capitalize transition ${
                    config.landingGearType === gear
                      ? 'bg-sky-600 border-sky-400 text-white shadow'
                      : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {gear === 'tricycle' ? 'Tricycle (Nose Wheel)' : 'Taildragger'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Custom Airfoil Parametric Sliders (if Custom selected) */}
        {config.airfoil === 'custom' && (
          <div className="p-4 bg-slate-950 rounded-xl border border-sky-900/50 space-y-4">
            <h4 className="text-xs font-bold text-sky-400 uppercase">Custom Airfoil Geometry</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>Max Thickness</span>
                  <span className="font-mono text-sky-400">{config.customAirfoilThicknessPct}%</span>
                </div>
                <input
                  type="range"
                  min="8"
                  max="16"
                  step="0.5"
                  value={config.customAirfoilThicknessPct}
                  onChange={(e) =>
                    onUpdateConfig((prev) => ({
                      ...prev,
                      customAirfoilThicknessPct: parseFloat(e.target.value)
                    }))
                  }
                  className="w-full accent-sky-400"
                />
              </div>
              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>Max Camber</span>
                  <span className="font-mono text-sky-400">{config.customAirfoilCamberPct}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="6"
                  step="0.5"
                  value={config.customAirfoilCamberPct}
                  onChange={(e) =>
                    onUpdateConfig((prev) => ({
                      ...prev,
                      customAirfoilCamberPct: parseFloat(e.target.value)
                    }))
                  }
                  className="w-full accent-sky-400"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Advanced Engineering Ratios Accordion */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
        <button
          onClick={() => setShowAdvancedRatios(!showAdvancedRatios)}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-800/50 transition"
        >
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-sky-400" />
            <div>
              <h4 className="text-sm font-bold text-white">Configurable Design Ratios</h4>
              <p className="text-xs text-slate-400">
                Tail volume coefficients (Vh, Vv), aspect ratios, and moment arm ratios
              </p>
            </div>
          </div>
          {showAdvancedRatios ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
        </button>

        {showAdvancedRatios && (
          <div className="p-6 border-t border-slate-800 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              {/* Wing Aspect Ratio */}
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-300">Wing Aspect Ratio (AR)</span>
                  <span className="font-mono text-sky-400 font-bold">{config.wingAspectRatio.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="5.0"
                  max="8.0"
                  step="0.1"
                  value={config.wingAspectRatio}
                  onChange={(e) =>
                    onUpdateConfig((prev) => ({
                      ...prev,
                      wingAspectRatio: parseFloat(e.target.value)
                    }))
                  }
                  className="w-full accent-sky-400"
                />
                <span className="text-[10px] text-slate-500">Standard trainer: 5.5 - 6.5</span>
              </div>

              {/* Horizontal Tail Volume Vh */}
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-300">Horiz. Volume Coeff (Vh)</span>
                  <span className="font-mono text-emerald-400 font-bold">{config.horizontalTailVolumeCoeff.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.50"
                  max="0.80"
                  step="0.02"
                  value={config.horizontalTailVolumeCoeff}
                  onChange={(e) =>
                    onUpdateConfig((prev) => ({
                      ...prev,
                      horizontalTailVolumeCoeff: parseFloat(e.target.value)
                    }))
                  }
                  className="w-full accent-emerald-400"
                />
                <span className="text-[10px] text-slate-500">Standard trainer: 0.55 - 0.70</span>
              </div>

              {/* Vertical Tail Volume Vv */}
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-300">Vert. Volume Coeff (Vv)</span>
                  <span className="font-mono text-emerald-400 font-bold">{config.verticalTailVolumeCoeff.toFixed(3)}</span>
                </div>
                <input
                  type="range"
                  min="0.030"
                  max="0.060"
                  step="0.002"
                  value={config.verticalTailVolumeCoeff}
                  onChange={(e) =>
                    onUpdateConfig((prev) => ({
                      ...prev,
                      verticalTailVolumeCoeff: parseFloat(e.target.value)
                    }))
                  }
                  className="w-full accent-emerald-400"
                />
                <span className="text-[10px] text-slate-500">Standard trainer: 0.035 - 0.045</span>
              </div>

              {/* Fuselage Length Ratio */}
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-300">Fuselage Length Ratio</span>
                  <span className="font-mono text-sky-400 font-bold">{config.fuselageLengthRatio.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.65"
                  max="0.85"
                  step="0.01"
                  value={config.fuselageLengthRatio}
                  onChange={(e) =>
                    onUpdateConfig((prev) => ({
                      ...prev,
                      fuselageLengthRatio: parseFloat(e.target.value)
                    }))
                  }
                  className="w-full accent-sky-400"
                />
                <span className="text-[10px] text-slate-500">L_fuse = {Math.round(config.fuselageLengthRatio * 100)}% of wingspan</span>
              </div>

              {/* Tail Moment Ratio */}
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-300">Tail Moment Arm Ratio</span>
                  <span className="font-mono text-sky-400 font-bold">{config.tailMomentRatio.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.50"
                  max="0.70"
                  step="0.01"
                  value={config.tailMomentRatio}
                  onChange={(e) =>
                    onUpdateConfig((prev) => ({
                      ...prev,
                      tailMomentRatio: parseFloat(e.target.value)
                    }))
                  }
                  className="w-full accent-sky-400"
                />
                <span className="text-[10px] text-slate-500">L_tail = {Math.round(config.tailMomentRatio * 100)}% of fuselage</span>
              </div>

              {/* Aileron Span Ratio */}
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-300">Aileron Span Ratio</span>
                  <span className="font-mono text-amber-400 font-bold">{config.aileronSpanRatio.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.30"
                  max="0.60"
                  step="0.02"
                  value={config.aileronSpanRatio}
                  onChange={(e) =>
                    onUpdateConfig((prev) => ({
                      ...prev,
                      aileronSpanRatio: parseFloat(e.target.value)
                    }))
                  }
                  className="w-full accent-amber-400"
                />
                <span className="text-[10px] text-slate-500">{Math.round(config.aileronSpanRatio * 100)}% of semi-span</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
