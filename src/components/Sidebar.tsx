// AERO DESIGN STUDIO - RC TRAINER DESIGNER
// Dark Navy Blue Aerospace Sidebar Navigation

import React from 'react';
import {
  LayoutDashboard,
  Sliders,
  Feather,
  Anchor,
  Compass,
  Box,
  SlidersHorizontal,
  FileSpreadsheet,
  Download
} from 'lucide-react';

interface SidebarProps {
  activeTab: number;
  onSelectTab: (index: number) => void;
  hasCustomOverrides?: boolean;
}

export const NAV_ITEMS = [
  { index: 0, label: '1. Dashboard', icon: LayoutDashboard, desc: 'Overview & 3D Model' },
  { index: 1, label: '2. Aircraft Configuration', icon: Sliders, desc: 'Wingspan & Sizing' },
  { index: 2, label: '3. Wing Design', icon: Feather, desc: 'Planform & Airfoil' },
  { index: 3, label: '4. Horizontal Stabilizer', icon: Anchor, desc: 'H-Stab & Pitch' },
  { index: 4, label: '5. Vertical Stabilizer', icon: Compass, desc: 'V-Fin & Yaw' },
  { index: 5, label: '6. Fuselage Design', icon: Box, desc: 'Top/Side & Reference' },
  { index: 6, label: '7. Control Surfaces', icon: SlidersHorizontal, desc: 'Ail / Elev / Rud' },
  { index: 7, label: '8. Complete Aircraft Blueprint', icon: FileSpreadsheet, desc: 'Full Drawing Sheet' },
  { index: 8, label: '9. Export Design', icon: Download, desc: 'PDF, SVG & CSV' }
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  hasCustomOverrides = false
}) => {
  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col justify-between shrink-0 select-none">
      {/* Navigation list */}
      <div className="py-4 px-3 space-y-1">
        <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
          Engineering Modules
        </div>

        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.index;

          return (
            <button
              key={item.index}
              onClick={() => onSelectTab(item.index)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all group ${
                isActive
                  ? 'bg-sky-600 text-white font-semibold shadow-lg shadow-sky-950 border border-sky-400/40'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900 border border-transparent'
              }`}
            >
              <div
                className={`p-1.5 rounded-lg transition ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-900 text-slate-400 group-hover:text-sky-400 group-hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="overflow-hidden">
                <span className="text-xs block truncate leading-tight font-medium">
                  {item.label}
                </span>
                <span className={`text-[10px] block truncate ${isActive ? 'text-sky-100' : 'text-slate-500'}`}>
                  {item.desc}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer System Status Badge */}
      <div className="p-4 border-t border-slate-900 bg-slate-950/60 text-[11px] text-slate-400 space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 font-mono text-[10px] text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            ENGINE ACTIVE
          </span>
          <span className="text-[10px] font-mono text-slate-500">v1.0-RC</span>
        </div>
        <p className="text-[10px] text-slate-500 leading-tight">
          Parametric Aircraft preliminary sizing CAD for beginner RC model builders.
        </p>
      </div>
    </aside>
  );
};
