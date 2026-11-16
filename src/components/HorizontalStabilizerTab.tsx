// AERO DESIGN STUDIO - RC TRAINER DESIGNER
// Horizontal Stabilizer & Elevator Generator & Technical Drawing

import React, { useState } from 'react';
import { CalculatedAircraft, ReferenceImage } from '../types/aircraft';
import { TechnicalSvgViewer } from './common/TechnicalSvgViewer';
import { DimensionLine } from './common/DimensionLine';
import { ReferenceImageModal } from './common/ReferenceImageModal';
import { formatDimension, formatArea } from '../engine/units';
import { Image as ImageIcon, Info, HelpCircle } from 'lucide-react';

interface HorizontalStabilizerTabProps {
  aircraft: CalculatedAircraft;
  onUpdateConfig: (updater: (prev: any) => any) => void;
  referenceImages: Record<string, ReferenceImage>;
  onSaveReferenceImage: (ref: ReferenceImage) => void;
}

export const HorizontalStabilizerTab: React.FC<HorizontalStabilizerTabProps> = ({
  aircraft,
  onUpdateConfig,
  referenceImages,
  onSaveReferenceImage
}) => {
  const [isRefModalOpen, setIsRefModalOpen] = useState<boolean>(false);

  const { horizontalStabilizer, config } = aircraft;
  const unit = config.unit;

  const span = horizontalStabilizer.spanMm;
  const halfSpan = horizontalStabilizer.halfSpanMm;
  const cRoot = horizontalStabilizer.chordRootMm;
  const cTip = horizontalStabilizer.chordTipMm;
  const elevChord = horizontalStabilizer.elevatorChordMm;
  const cutoutW = horizontalStabilizer.centerCutoutWidthMm;

  // SVG Drawing Coordinate Mapping:
  const drawWidth = 950;
  const drawHeight = 550;
  const scale = 580 / span;

  const cx = 475;
  const cy = 250;

  const sSpan = span * scale;
  const sHalf = halfSpan * scale;
  const sCRoot = cRoot * scale;
  const sCTip = cTip * scale;
  const sElevChord = elevChord * scale;
  const sCutoutW = cutoutW * scale;

  // LE Sweep: tip is inset back
  const sweepBack = (cRoot - cTip) * 0.45 * scale;

  const rootLeY = cy - sCRoot / 2;
  const rootTeY = cy + sCRoot / 2;
  const tipLeY = rootLeY + sweepBack;
  const tipTeY = rootTeY;

  const leftX = cx - sHalf;
  const rightX = cx + sHalf;

  // Fixed Horizontal Fin Polygon (excluding elevator)
  const hingeY = rootTeY - sElevChord;
  const fixedFinPath = `
    M ${leftX} ${tipLeY}
    L ${cx} ${rootLeY}
    L ${rightX} ${tipLeY}
    L ${rightX} ${hingeY}
    L ${leftX} ${hingeY}
    Z
  `;

  // Left Elevator Polygon
  const leftElevatorPath = `
    M ${leftX} ${hingeY}
    L ${cx - sCutoutW / 2} ${hingeY}
    L ${cx - sCutoutW / 2} ${tipTeY}
    L ${leftX} ${tipTeY}
    Z
  `;

  // Right Elevator Polygon
  const rightElevatorPath = `
    M ${cx + sCutoutW / 2} ${hingeY}
    L ${rightX} ${hingeY}
    L ${rightX} ${tipTeY}
    L ${cx + sCutoutW / 2} ${tipTeY}
    Z
  `;

  return (
    <div className="space-y-6">
      {/* Top action bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-900/60 rounded-xl border border-slate-800">
        <div>
          <h3 className="font-bold text-sm text-sky-400">Horizontal Stabilizer & Elevator Engineering</h3>
          <p className="text-xs text-slate-400">
            Tail Volume Coefficient Vh: <span className="font-mono text-emerald-400 font-bold">{horizontalStabilizer.volumeCoefficientActual}</span> (Trainer range: 0.55 - 0.75)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-slate-800/90 px-3 py-1.5 rounded-lg border border-slate-700 text-xs">
            <span className="text-slate-400">Mode:</span>
            <select
              value={config.designModes.horizontalStabilizer}
              onChange={(e) =>
                onUpdateConfig((prev) => ({
                  ...prev,
                  designModes: { ...prev.designModes, horizontalStabilizer: e.target.value as 'auto' | 'reference' }
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
            {referenceImages['hStab'] ? 'Edit H-Stab Reference' : 'Upload H-Stab Reference'}
          </button>
        </div>
      </div>

      {/* SVG Technical Drawing */}
      <TechnicalSvgViewer
        title="Horizontal Stabilizer – Technical Top View"
        subtitle={`Span: ${formatDimension(span, unit)} | Root: ${formatDimension(cRoot, unit)} | Elevator: ${formatDimension(elevChord, unit)} (${horizontalStabilizer.elevatorAreaPct}% area)`}
        width={drawWidth}
        height={drawHeight}
        downloadFileName="horizontal-stabilizer-blueprint"
      >
        {({ primaryColor, controlSurfaceColor, sparColor, isBlueprint }) => (
          <g id="h-stab-drawing">
            {/* Centerline */}
            <line
              x1={cx}
              y1={rootLeY - 50}
              x2={cx}
              y2={rootTeY + 50}
              stroke={sparColor}
              strokeWidth="1"
              strokeDasharray="16,4,4,4"
              strokeOpacity="0.75"
            />
            <text
              x={cx + 6}
              y={rootLeY - 35}
              fill={sparColor}
              fontSize="9"
              fontFamily="monospace"
              fontWeight="bold"
            >
              CL (SYMMETRY)
            </text>

            {/* Fixed Stabilizer Section (Blue) */}
            <path
              d={fixedFinPath}
              fill={isBlueprint ? 'rgba(56, 189, 248, 0.08)' : 'rgba(37, 99, 235, 0.05)'}
              stroke={primaryColor}
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <text
              x={cx}
              y={rootLeY + sCRoot * 0.3}
              textAnchor="middle"
              fill={primaryColor}
              fontSize="10"
              fontFamily="monospace"
              fontWeight="bold"
            >
              FIXED HORIZONTAL STABILIZER
            </text>

            {/* Elevator Hinge Line */}
            <line
              x1={leftX}
              y1={hingeY}
              x2={rightX}
              y2={hingeY}
              stroke={controlSurfaceColor}
              strokeWidth="1.8"
              strokeDasharray="5,2"
            />

            {/* Left & Right Elevator Sections (Amber) */}
            <path
              d={leftElevatorPath}
              fill="url(#controlSurfaceHatch)"
              stroke={controlSurfaceColor}
              strokeWidth="2.2"
            />
            <text
              x={cx - sHalf * 0.55}
              y={hingeY + sElevChord * 0.55}
              textAnchor="middle"
              fill={controlSurfaceColor}
              fontSize="9"
              fontFamily="monospace"
              fontWeight="bold"
            >
              LEFT ELEVATOR
            </text>

            <path
              d={rightElevatorPath}
              fill="url(#controlSurfaceHatch)"
              stroke={controlSurfaceColor}
              strokeWidth="2.2"
            />
            <text
              x={cx + sHalf * 0.55}
              y={hingeY + sElevChord * 0.55}
              textAnchor="middle"
              fill={controlSurfaceColor}
              fontSize="9"
              fontFamily="monospace"
              fontWeight="bold"
            >
              RIGHT ELEVATOR
            </text>

            {/* Rudder Swing Cutout Label */}
            <text
              x={cx}
              y={hingeY + sElevChord * 0.65}
              textAnchor="middle"
              fill="#94a3b8"
              fontSize="8"
              fontFamily="monospace"
            >
              RUDDER CUTOUT
            </text>

            {/* DIMENSION LINES */}
            {/* Total Span */}
            <DimensionLine
              x1={leftX}
              y1={tipLeY}
              x2={rightX}
              y2={tipLeY}
              offset={-45}
              orientation="horizontal"
              measuredValueMm={span}
              unit={unit}
              labelPrefix="TOTAL SPAN: "
              color={primaryColor}
            />

            {/* Root Chord */}
            <DimensionLine
              x1={cx}
              y1={rootLeY}
              x2={cx}
              y2={rootTeY}
              offset={-35}
              orientation="vertical"
              measuredValueMm={cRoot}
              unit={unit}
              labelPrefix="ROOT: "
              color={primaryColor}
            />

            {/* Tip Chord */}
            <DimensionLine
              x1={rightX}
              y1={tipLeY}
              x2={rightX}
              y2={tipTeY}
              offset={35}
              orientation="vertical"
              measuredValueMm={cTip}
              unit={unit}
              labelPrefix="TIP: "
              color={primaryColor}
            />

            {/* Elevator Chord */}
            <DimensionLine
              x1={rightX}
              y1={hingeY}
              x2={rightX}
              y2={tipTeY}
              offset={70}
              orientation="vertical"
              measuredValueMm={elevChord}
              unit={unit}
              labelPrefix="ELEV CHORD: "
              color={controlSurfaceColor}
            />

            {/* Cutout width */}
            <DimensionLine
              x1={cx - sCutoutW / 2}
              y1={tipTeY}
              x2={cx + sCutoutW / 2}
              y2={tipTeY}
              offset={28}
              orientation="horizontal"
              measuredValueMm={cutoutW}
              unit={unit}
              labelPrefix="CUTOUT: "
              color="#94a3b8"
            />
          </g>
        )}
      </TechnicalSvgViewer>

      {/* Engineering Calculation Insights & Volume Coefficients */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold">Tail Volume Coefficient (Vh)</span>
            <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono font-bold">
              {horizontalStabilizer.volumeCoefficientActual}
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            Formula: <code className="text-sky-300 font-mono">Vh = (Sh × Ltail) / (Sw × MAC)</code>.
            Recommended value for RC trainers is 0.55 to 0.75 for positive pitch stability.
          </p>
        </div>

        <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
          <span className="text-xs text-slate-400 font-semibold">Stabilizer Area Fraction</span>
          <div className="text-base font-bold text-sky-400 font-mono">
            {formatArea(horizontalStabilizer.areaMm2, unit)}
          </div>
          <p className="text-[11px] text-slate-400">
            Represents {((horizontalStabilizer.areaMm2 / aircraft.wing.wingAreaMm2) * 100).toFixed(1)}% of main wing area (typical 20-25%).
          </p>
        </div>

        <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
          <span className="text-xs text-slate-400 font-semibold">Elevator Effectiveness</span>
          <div className="text-base font-bold text-amber-400 font-mono">
            {horizontalStabilizer.elevatorAreaPct}% of Tail Area
          </div>
          <p className="text-[11px] text-slate-400">
            Elevator chord ratio is {Math.round((elevChord / cRoot) * 100)}% of root chord, delivering solid pitch authority without excessive sensitivity.
          </p>
        </div>
      </div>

      {/* Reference Image Modal */}
      <ReferenceImageModal
        isOpen={isRefModalOpen}
        onClose={() => setIsRefModalOpen(false)}
        componentTitle="Horizontal Stabilizer"
        componentType="hStab"
        currentReference={referenceImages['hStab']}
        onSaveReference={onSaveReferenceImage}
        unit={unit}
        defaultKnownDimensionMm={span}
      />
    </div>
  );
};
