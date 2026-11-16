// AERO DESIGN STUDIO - RC TRAINER DESIGNER
// Vertical Stabilizer & Rudder Generator & Technical Drawing

import React, { useState } from 'react';
import { CalculatedAircraft, ReferenceImage } from '../types/aircraft';
import { TechnicalSvgViewer } from './common/TechnicalSvgViewer';
import { DimensionLine } from './common/DimensionLine';
import { ReferenceImageModal } from './common/ReferenceImageModal';
import { formatDimension, formatArea } from '../engine/units';
import { Image as ImageIcon } from 'lucide-react';

interface VerticalStabilizerTabProps {
  aircraft: CalculatedAircraft;
  onUpdateConfig: (updater: (prev: any) => any) => void;
  referenceImages: Record<string, ReferenceImage>;
  onSaveReferenceImage: (ref: ReferenceImage) => void;
}

export const VerticalStabilizerTab: React.FC<VerticalStabilizerTabProps> = ({
  aircraft,
  onUpdateConfig,
  referenceImages,
  onSaveReferenceImage
}) => {
  const [isRefModalOpen, setIsRefModalOpen] = useState<boolean>(false);

  const { verticalStabilizer, config } = aircraft;
  const unit = config.unit;

  const height = verticalStabilizer.heightMm;
  const cRoot = verticalStabilizer.chordRootMm;
  const cTip = verticalStabilizer.chordTipMm;
  const rudChordRoot = verticalStabilizer.rudderChordRootMm;
  const rudChordTip = verticalStabilizer.rudderChordTipMm;

  // SVG Drawing Coordinate Mapping:
  const drawWidth = 900;
  const drawHeight = 600;
  // Fit height into ~380px
  const scale = 380 / height;

  const ox = 260; // origin X for fin root LE
  const oy = 480; // baseline Y (fuselage tail deck)

  const sHeight = height * scale;
  const sCRoot = cRoot * scale;
  const sCTip = cTip * scale;
  const sRudCRoot = rudChordRoot * scale;
  const sRudCTip = rudChordTip * scale;

  // Sweep calculations: LE sweeps back by ~30% of root chord
  const sweepBack = (cRoot - cTip) * 0.7 * scale;

  const rootLeX = ox;
  const rootTeX = ox + sCRoot;
  const tipLeX = ox + sweepBack;
  const tipTeX = tipLeX + sCTip;
  const tipY = oy - sHeight;

  // Rudder Hinge Line (straight vertical or slightly inclined)
  const hingeRootX = rootTeX - sRudCRoot;
  const hingeTipX = tipTeX - sRudCTip;

  // Fixed Fin Polygon
  const fixedFinPath = `
    M ${rootLeX - 40} ${oy}
    Q ${rootLeX - 10} ${oy - 20} ${rootLeX} ${oy - 40}
    L ${tipLeX} ${tipY}
    L ${hingeTipX} ${tipY}
    L ${hingeRootX} ${oy}
    Z
  `;

  // Rudder Polygon
  const rudderPath = `
    M ${hingeRootX} ${oy}
    L ${hingeTipX} ${tipY}
    L ${tipTeX} ${tipY}
    L ${rootTeX} ${oy}
    Z
  `;

  return (
    <div className="space-y-6">
      {/* Top action bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-900/60 rounded-xl border border-slate-800">
        <div>
          <h3 className="font-bold text-sm text-sky-400">Vertical Stabilizer & Rudder Engineering</h3>
          <p className="text-xs text-slate-400">
            Tail Volume Coefficient Vv: <span className="font-mono text-emerald-400 font-bold">{verticalStabilizer.volumeCoefficientActual}</span> (Trainer range: 0.035 - 0.050)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-slate-800/90 px-3 py-1.5 rounded-lg border border-slate-700 text-xs">
            <span className="text-slate-400">Mode:</span>
            <select
              value={config.designModes.verticalStabilizer}
              onChange={(e) =>
                onUpdateConfig((prev) => ({
                  ...prev,
                  designModes: { ...prev.designModes, verticalStabilizer: e.target.value as 'auto' | 'reference' }
                }))
              }
              className="bg-transparent font-semibold text-sky-400 outline-none cursor-pointer"
            >
              <option value="auto" className="bg-slate-900 text-white">OPTION A: Automatic Sizing</option>
              <option value="reference" className="bg-slate-900 text-white">OPTION B: Reference-Assisted</option>
            </select>
          </div>

          <button
            onClick={() => setIsRefModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-600 transition"
          >
            <ImageIcon className="w-3.5 h-3.5 text-sky-400" />
            {referenceImages['vStab'] ? 'Edit V-Stab Reference' : 'Upload V-Stab Reference'}
          </button>
        </div>
      </div>

      {/* SVG Technical Drawing */}
      <TechnicalSvgViewer
        title="Vertical Stabilizer – Technical Side View"
        subtitle={`Height: ${formatDimension(height, unit)} | Root Chord: ${formatDimension(cRoot, unit)} | Rudder Area: ${verticalStabilizer.rudderAreaPct}%`}
        width={drawWidth}
        height={drawHeight}
        downloadFileName="vertical-stabilizer-blueprint"
      >
        {({ primaryColor, controlSurfaceColor, sparColor, isBlueprint }) => (
          <g id="v-stab-drawing">
            {/* Fuselage Tail Boom Deck line */}
            <line
              x1={rootLeX - 80}
              y1={oy}
              x2={rootTeX + 60}
              y2={oy}
              stroke={primaryColor}
              strokeWidth="1.2"
              strokeDasharray="8,4"
              strokeOpacity="0.5"
            />
            <text
              x={rootLeX - 75}
              y={oy + 18}
              fill={primaryColor}
              fontSize="9"
              fontFamily="monospace"
            >
              FUSELAGE TAIL DECK DATUM
            </text>

            {/* Fixed Vertical Fin (Blue) with integrated dorsal fin */}
            <path
              d={fixedFinPath}
              fill={isBlueprint ? 'rgba(56, 189, 248, 0.08)' : 'rgba(37, 99, 235, 0.05)'}
              stroke={primaryColor}
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <text
              x={rootLeX + sCRoot * 0.28}
              y={oy - sHeight * 0.45}
              textAnchor="middle"
              fill={primaryColor}
              fontSize="10"
              fontFamily="monospace"
              fontWeight="bold"
            >
              FIXED FIN
            </text>

            {/* Rudder Hinge Line */}
            <line
              x1={hingeRootX}
              y1={oy}
              x2={hingeTipX}
              y2={tipY}
              stroke={controlSurfaceColor}
              strokeWidth="2"
              strokeDasharray="5,2"
            />

            {/* Rudder (Amber) */}
            <path
              d={rudderPath}
              fill="url(#controlSurfaceHatch)"
              stroke={controlSurfaceColor}
              strokeWidth="2.2"
            />
            <text
              x={hingeRootX + sRudCRoot * 0.45}
              y={oy - sHeight * 0.50}
              textAnchor="middle"
              fill={controlSurfaceColor}
              fontSize="10"
              fontFamily="monospace"
              fontWeight="bold"
            >
              RUDDER
            </text>

            {/* DIMENSION LINES */}
            {/* 1. Fin Total Height */}
            <DimensionLine
              x1={rootLeX - 90}
              y1={oy}
              x2={rootLeX - 90}
              y2={tipY}
              offset={-20}
              orientation="vertical"
              measuredValueMm={height}
              unit={unit}
              labelPrefix="HEIGHT: "
              color={primaryColor}
            />

            {/* 2. Root Chord */}
            <DimensionLine
              x1={rootLeX}
              y1={oy}
              x2={rootTeX}
              y2={oy}
              offset={40}
              orientation="horizontal"
              measuredValueMm={cRoot}
              unit={unit}
              labelPrefix="ROOT CHORD: "
              color={primaryColor}
            />

            {/* 3. Tip Chord */}
            <DimensionLine
              x1={tipLeX}
              y1={tipY}
              x2={tipTeX}
              y2={tipY}
              offset={-35}
              orientation="horizontal"
              measuredValueMm={cTip}
              unit={unit}
              labelPrefix="TIP CHORD: "
              color={primaryColor}
            />

            {/* 4. Rudder Root Chord */}
            <DimensionLine
              x1={hingeRootX}
              y1={oy}
              x2={rootTeX}
              y2={oy}
              offset={70}
              orientation="horizontal"
              measuredValueMm={rudChordRoot}
              unit={unit}
              labelPrefix="RUDDER ROOT: "
              color={controlSurfaceColor}
            />
          </g>
        )}
      </TechnicalSvgViewer>

      {/* Engineering Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold">Vertical Tail Volume (Vv)</span>
            <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono font-bold">
              {verticalStabilizer.volumeCoefficientActual}
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            Formula: <code className="text-sky-300 font-mono">Vv = (Sv × Ltail) / (Sw × Wingspan)</code>.
            Recommended value is 0.035 to 0.050 to provide positive yaw damping and prevent Dutch roll.
          </p>
        </div>

        <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
          <span className="text-xs text-slate-400 font-semibold">Vertical Fin Area</span>
          <div className="text-base font-bold text-sky-400 font-mono">
            {formatArea(verticalStabilizer.areaMm2, unit)}
          </div>
          <p className="text-[11px] text-slate-400">
            Represents {((verticalStabilizer.areaMm2 / aircraft.wing.wingAreaMm2) * 100).toFixed(1)}% of main wing area.
          </p>
        </div>

        <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
          <span className="text-xs text-slate-400 font-semibold">Rudder Area Authority</span>
          <div className="text-base font-bold text-amber-400 font-mono">
            {verticalStabilizer.rudderAreaPct}% of Fin Area
          </div>
          <p className="text-[11px] text-slate-400">
            Large rudder gives excellent low-speed taxi steering and crosswind correction for beginner pilots.
          </p>
        </div>
      </div>

      {/* Reference Image Modal */}
      <ReferenceImageModal
        isOpen={isRefModalOpen}
        onClose={() => setIsRefModalOpen(false)}
        componentTitle="Vertical Stabilizer"
        componentType="vStab"
        currentReference={referenceImages['vStab']}
        onSaveReference={onSaveReferenceImage}
        unit={unit}
        defaultKnownDimensionMm={height}
      />
    </div>
  );
};
