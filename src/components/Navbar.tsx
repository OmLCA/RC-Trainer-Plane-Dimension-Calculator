// AERO DESIGN STUDIO - RC TRAINER DESIGNER
// Top Navigation Bar with Global Unit Selector (cm / in)

import React from 'react';
import { UnitType, BlueprintTheme } from '../types/aircraft';
import { Plane, Ruler, Sun, Moon, Download, RotateCcw } from 'lucide-react';
import { formatDimension } from '../engine/units';

interface NavbarProps {
  unit: UnitType;
  onUnitChange: (newUnit: UnitType) => void;
  wingspanMm: number;
  theme: BlueprintTheme;
  onThemeToggle: () => void;
  onResetDefaults: () => void;
  onNavigateToExport: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  unit,
  onUnitChange,
  wingspanMm,
  theme,
  onThemeToggle,
  onResetDefaults,
  onNavigateToExport
}) => {
  const isBlueprint = theme === 'blueprint';

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-900/95 backdrop-blur border-b border-slate-800 text-slate-100 px-4 lg:px-6 py-3 flex items-center justify-between">
      {/* Brand & Titles */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 shadow-md shadow-sky-950">
          <Plane className="w-5 h-5 -rotate-45" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-black tracking-wider uppercase text-white font-mono">
              AERO DESIGN STUDIO
            </h1>
            <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30 font-mono">
              RC TRAINER
            </span>
          </div>
          <p className="text-[11px] text-slate-400 hidden sm:block">
            RC Trainer Aircraft Preliminary Design Tool
          </p>
        </div>
      </div>

      {/* Center & Right Controls: GLOBAL UNIT SELECTOR, Quick Stats, Actions */}
      <div className="flex items-center gap-3">
        {/* Quick Wingspan Badge */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1 bg-slate-800/80 rounded-lg border border-slate-700 text-xs">
          <span className="text-slate-400">Wingspan:</span>
          <span className="font-mono text-sky-400 font-bold">
            {formatDimension(wingspanMm, unit)}
          </span>
        </div>

        {/* GLOBAL UNIT SELECTOR (MANDATORY REQUIREMENT) */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-sky-900/60 shadow-inner">
          <span className="px-2 text-[10px] font-bold text-sky-400 flex items-center gap-1 uppercase tracking-wider hidden sm:flex">
            <Ruler className="w-3.5 h-3.5" />
            Unit:
          </span>
          <button
            onClick={() => onUnitChange('cm')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
              unit === 'cm'
                ? 'bg-sky-500 text-slate-950 shadow-md font-mono'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            cm (Centimetres)
          </button>
          <button
            onClick={() => onUnitChange('in')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
              unit === 'in'
                ? 'bg-sky-500 text-slate-950 shadow-md font-mono'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            in (Inches)
          </button>
        </div>

        {/* Blueprint Theme Toggle */}
        <button
          onClick={onThemeToggle}
          className="p-2 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition"
          title={isBlueprint ? 'Switch to CAD Light Paper' : 'Switch to Blueprint Navy'}
        >
          {isBlueprint ? <Moon className="w-4 h-4 text-sky-400" /> : <Sun className="w-4 h-4 text-amber-400" />}
        </button>

        {/* Quick Reset */}
        <button
          onClick={onResetDefaults}
          className="p-2 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition"
          title="Reset to Factory Trainer Defaults"
        >
          <RotateCcw className="w-4 h-4 text-slate-400" />
        </button>

        {/* Quick Export Button */}
        <button
          onClick={onNavigateToExport}
          className="hidden lg:flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white shadow-md shadow-sky-900/40 transition"
        >
          <Download className="w-3.5 h-3.5" />
          Export
        </button>
      </div>
    </header>
  );
};
