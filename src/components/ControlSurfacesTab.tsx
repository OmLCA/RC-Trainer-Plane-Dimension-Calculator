// AERO DESIGN STUDIO - RC TRAINER DESIGNER
// Control Surfaces Dedicated Technical Drawings (Ailerons, Elevator, Rudder)

import React, { useState } from 'react';
import { CalculatedAircraft, ReferenceImage } from '../types/aircraft';
import { TechnicalSvgViewer } from './common/TechnicalSvgViewer';
import { DimensionLine } from './common/DimensionLine';
import { formatDimension, formatArea } from '../engine/units';
import { Compass, Info, CheckCircle2 } from 'lucide-react';

interface ControlSurfacesTabProps {
  aircraft: CalculatedAircraft;
  onUpdateConfig: (updater: (prev: any) => any) => void;
  referenceImages: Record<string, ReferenceImage>;
  onSaveReferenceImage: (ref: ReferenceImage) => void;
}

export const ControlSurfacesTab: React.FC<ControlSurfacesTabProps> = ({
  aircraft,
  onUpdateConfig
}) => {
  const [selectedSurface, setSelectedSurface] = useState<'aileron' | 'elevator' | 'rudder'>('aileron');

  const { controlSurfaces, wing, horizontalStabilizer, verticalStabilizer, config } = aircraft;
  const unit = config.unit;

  const ail = controlSurfaces.aileron;
  const elev = controlSurfaces.elevator;
  const rud = controlSurfaces.rudder;

  return (
    <div className="space-y-6">
      {/* Top selector bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-900/60 rounded-xl border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex rounded-lg border border-slate-700 bg-slate-800/80 p-1 text-xs">
            <button
              onClick={() => setSelectedSurface('aileron')}
              className={`px-3 py-1.5 rounded-md font-medium transition ${
                selectedSurface === 'aileron' ? 'bg-amber-500 text-slate-950 font-bold shadow' : 'text-slate-300 hover:text-white'
              }`}
            >
              1. Ailerons (Roll Control)
            </button>
            <button
              onClick={() => setSelectedSurface('elevator')}
              className={`px-3 py-1.5 rounded-md font-medium transition ${
                selectedSurface === 'elevator' ? 'bg-amber-500 text-slate-950 font-bold shadow' : 'text-slate-300 hover:text-white'
              }`}
            >
              2. Elevator (Pitch Control)
            </button>
            <button
              onClick={() => setSelectedSurface('rudder')}
              className={`px-3 py-1.5 rounded-md font-medium transition ${
                selectedSurface === 'rudder' ? 'bg-amber-500 text-slate-950 font-bold shadow' : 'text-slate-300 hover:text-white'
              }`}
            >
              3. Rudder (Yaw Control)
            </button>
          </div>
        </div>

        <div className="text-xs text-amber-400 font-mono font-semibold flex items-center gap-1.5">
          <Compass className="w-4 h-4" />
          Color Coded: Movable Control Surfaces in Amber
        </div>
      </div>

      {/* 1. AILERONS DRAWING */}
      {selectedSurface === 'aileron' && (
        <div className="space-y-4">
          <TechnicalSvgViewer
            title="Aileron Technical Drawing – Port & Starboard Set"
            subtitle={`Span: ${formatDimension(ail.leftSpanMm, unit)} | Chord: ${formatDimension(ail.chordMm, unit)} | Total Area: ${formatArea(ail.areaMm2Total, unit)} (${ail.areaPctOfWing}% of wing)`}
            width={950}
            height={500}
            downloadFileName="ailerons-technical-blueprint"
          >
            {({ controlSurfaceColor, primaryColor, isBlueprint }) => {
              const aSpan = ail.leftSpanMm;
              const aChord = ail.chordMm;
              const scale = 360 / aSpan;

              const sSpan = aSpan * scale;
              const sChord = aChord * scale;

              const ox1 = 120;
              const oy1 = 200;
              const ox2 = 540;
              const oy2 = 200;

              return (
                <g id="ailerons-detail-drawing">
                  {/* Left Aileron */}
                  <rect
                    x={ox1}
                    y={oy1}
                    width={sSpan}
                    height={sChord}
                    fill="url(#controlSurfaceHatch)"
                    stroke={controlSurfaceColor}
                    strokeWidth="2.5"
                  />
                  {/* Hinge Line (beveled top) */}
                  <line
                    x1={ox1}
                    y1={oy1}
                    x2={ox1 + sSpan}
                    y2={oy1}
                    stroke="#ef4444"
                    strokeWidth="1.8"
                    strokeDasharray="4,2"
                  />
                  <text
                    x={ox1 + sSpan / 2}
                    y={oy1 + sChord / 2}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill={controlSurfaceColor}
                    fontSize="11"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    PORT (LEFT) AILERON
                  </text>
                  <text
                    x={ox1 + sSpan / 2}
                    y={oy1 - 10}
                    textAnchor="middle"
                    fill="#ef4444"
                    fontSize="9"
                    fontFamily="monospace"
                  >
                    45° BEVEL HINGE LINE
                  </text>

                  {/* Dimensions for Left */}
                  <DimensionLine
                    x1={ox1}
                    y1={oy1 + sChord}
                    x2={ox1 + sSpan}
                    y2={oy1 + sChord}
                    offset={30}
                    orientation="horizontal"
                    measuredValueMm={aSpan}
                    unit={unit}
                    labelPrefix="SPAN: "
                    color={controlSurfaceColor}
                  />
                  <DimensionLine
                    x1={ox1}
                    y1={oy1}
                    x2={ox1}
                    y2={oy1 + sChord}
                    offset={-30}
                    orientation="vertical"
                    measuredValueMm={aChord}
                    unit={unit}
                    labelPrefix="CHORD: "
                    color={controlSurfaceColor}
                  />

                  {/* Right Aileron */}
                  <rect
                    x={ox2}
                    y={oy2}
                    width={sSpan}
                    height={sChord}
                    fill="url(#controlSurfaceHatch)"
                    stroke={controlSurfaceColor}
                    strokeWidth="2.5"
                  />
                  <line
                    x1={ox2}
                    y1={oy2}
                    x2={ox2 + sSpan}
                    y2={oy2}
                    stroke="#ef4444"
                    strokeWidth="1.8"
                    strokeDasharray="4,2"
                  />
                  <text
                    x={ox2 + sSpan / 2}
                    y={oy2 + sChord / 2}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill={controlSurfaceColor}
                    fontSize="11"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    STARBOARD (RIGHT) AILERON
                  </text>

                  {/* Dimensions for Right */}
                  <DimensionLine
                    x1={ox2}
                    y1={oy2 + sChord}
                    x2={ox2 + sSpan}
                    y2={oy2 + sChord}
                    offset={30}
                    orientation="horizontal"
                    measuredValueMm={aSpan}
                    unit={unit}
                    labelPrefix="SPAN: "
                    color={controlSurfaceColor}
                  />
                  <DimensionLine
                    x1={ox2 + sSpan}
                    y1={oy2}
                    x2={ox2 + sSpan}
                    y2={oy2 + sChord}
                    offset={30}
                    orientation="vertical"
                    measuredValueMm={aChord}
                    unit={unit}
                    labelPrefix="CHORD: "
                    color={controlSurfaceColor}
                  />
                </g>
              );
            }}
          </TechnicalSvgViewer>

          {/* Guidelines Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2 text-xs">
              <span className="font-semibold text-sky-400">Recommended Trainer Deflection Angles</span>
              <ul className="space-y-1 text-slate-300 list-disc list-inside">
                <li>Low Rates (Beginner First Flights): ±{ail.recommendedDeflectionLowDeg}° (approx 12-14mm throw)</li>
                <li>High Rates (Standard Flying): ±{ail.recommendedDeflectionHighDeg}° (approx 18-22mm throw)</li>
                <li>Differential: 15% more Up deflection than Down to counteract adverse yaw.</li>
              </ul>
            </div>
            <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2 text-xs">
              <span className="font-semibold text-emerald-400">Wing Placement & Buffer</span>
              <p className="text-slate-300">
                Ailerons are positioned {formatDimension(ail.startFromTipMm, unit)} inboard from the wingtips.
                This creates an aerodynamic buffer that prevents tip stalls during hard banked turns.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 2. ELEVATOR DRAWING */}
      {selectedSurface === 'elevator' && (
        <div className="space-y-4">
          <TechnicalSvgViewer
            title="Elevator Technical Drawing – Dual Surface with Rudder Clearance"
            subtitle={`Total Span: ${formatDimension(elev.spanMm, unit)} | Chord: ${formatDimension(elev.chordMm, unit)} | Area: ${formatArea(elev.areaMm2, unit)}`}
            width={950}
            height={460}
            downloadFileName="elevator-technical-blueprint"
          >
            {({ controlSurfaceColor, primaryColor }) => {
              const eSpan = elev.spanMm;
              const eChord = elev.chordMm;
              const cutoutW = horizontalStabilizer.centerCutoutWidthMm;
              const scale = 620 / eSpan;

              const sSpan = eSpan * scale;
              const sChord = eChord * scale;
              const sCutoutW = cutoutW * scale;

              const cx = 475;
              const cy = 200;
              const halfS = sSpan / 2;

              return (
                <g id="elevator-detail-drawing">
                  {/* Left Elevator Section */}
                  <rect
                    x={cx - halfS}
                    y={cy}
                    width={halfS - sCutoutW / 2}
                    height={sChord}
                    fill="url(#controlSurfaceHatch)"
                    stroke={controlSurfaceColor}
                    strokeWidth="2.5"
                  />
                  <text
                    x={cx - halfS + (halfS - sCutoutW / 2) / 2}
                    y={cy + sChord / 2}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill={controlSurfaceColor}
                    fontSize="11"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    PORT ELEVATOR
                  </text>

                  {/* Right Elevator Section */}
                  <rect
                    x={cx + sCutoutW / 2}
                    y={cy}
                    width={halfS - sCutoutW / 2}
                    height={sChord}
                    fill="url(#controlSurfaceHatch)"
                    stroke={controlSurfaceColor}
                    strokeWidth="2.5"
                  />
                  <text
                    x={cx + sCutoutW / 2 + (halfS - sCutoutW / 2) / 2}
                    y={cy + sChord / 2}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill={controlSurfaceColor}
                    fontSize="11"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    STARBOARD ELEVATOR
                  </text>

                  {/* Joiner Wire (Music wire torque joiner) */}
                  <line
                    x1={cx - sCutoutW / 2}
                    y1={cy + 8}
                    x2={cx + sCutoutW / 2}
                    y2={cy + 8}
                    stroke="#94a3b8"
                    strokeWidth="3.5"
                  />
                  <text
                    x={cx}
                    y={cy + 22}
                    textAnchor="middle"
                    fill="#94a3b8"
                    fontSize="8"
                    fontFamily="monospace"
                  >
                    STEEL JOINER WIRE (2.0mm)
                  </text>

                  {/* Dimensions */}
                  <DimensionLine
                    x1={cx - halfS}
                    y1={cy + sChord}
                    x2={cx + halfS}
                    y2={cy + sChord}
                    offset={35}
                    orientation="horizontal"
                    measuredValueMm={eSpan}
                    unit={unit}
                    labelPrefix="TOTAL ELEVATOR SPAN: "
                    color={controlSurfaceColor}
                  />

                  <DimensionLine
                    x1={cx + halfS}
                    y1={cy}
                    x2={cx + halfS}
                    y2={cy + sChord}
                    offset={30}
                    orientation="vertical"
                    measuredValueMm={eChord}
                    unit={unit}
                    labelPrefix="CHORD: "
                    color={controlSurfaceColor}
                  />

                  <DimensionLine
                    x1={cx - sCutoutW / 2}
                    y1={cy}
                    x2={cx + sCutoutW / 2}
                    y2={cy}
                    offset={-25}
                    orientation="horizontal"
                    measuredValueMm={cutoutW}
                    unit={unit}
                    labelPrefix="RUDDER SWING CUTOUT: "
                    color="#94a3b8"
                  />
                </g>
              );
            }}
          </TechnicalSvgViewer>

          <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 text-xs text-slate-300">
            <span className="font-semibold text-amber-400 block mb-1">Recommended Elevator Control Deflection:</span>
            Low Rates: ±{elev.recommendedDeflectionLowDeg}° (Smooth gentle flare on landing) | High Rates: ±{elev.recommendedDeflectionHighDeg}°
          </div>
        </div>
      )}

      {/* 3. RUDDER DRAWING */}
      {selectedSurface === 'rudder' && (
        <div className="space-y-4">
          <TechnicalSvgViewer
            title="Rudder Technical Drawing – Side View Planform"
            subtitle={`Height: ${formatDimension(rud.heightMm, unit)} | Root Chord: ${formatDimension(rud.chordRootMm, unit)} | Area: ${formatArea(rud.areaMm2, unit)}`}
            width={850}
            height={520}
            downloadFileName="rudder-technical-blueprint"
          >
            {({ controlSurfaceColor, sparColor }) => {
              const rHeight = rud.heightMm;
              const rCRoot = rud.chordRootMm;
              const rCTip = rud.chordTipMm;
              const scale = 360 / rHeight;

              const sH = rHeight * scale;
              const sCRoot = rCRoot * scale;
              const sCTip = rCTip * scale;

              const ox = 360;
              const oy = 420;

              return (
                <g id="rudder-detail-drawing">
                  {/* Hinge Line */}
                  <line
                    x1={ox}
                    y1={oy}
                    x2={ox}
                    y2={oy - sH}
                    stroke="#ef4444"
                    strokeWidth="2.5"
                    strokeDasharray="5,2"
                  />
                  <text
                    x={ox - 10}
                    y={oy - sH / 2}
                    textAnchor="end"
                    fill="#ef4444"
                    fontSize="9"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    HINGE LINE (VERT STAB REAR SPAR)
                  </text>

                  {/* Rudder Outline Polygon */}
                  <polygon
                    points={`${ox},${oy} ${ox},${oy - sH} ${ox + sCTip},${oy - sH} ${ox + sCRoot},${oy}`}
                    fill="url(#controlSurfaceHatch)"
                    stroke={controlSurfaceColor}
                    strokeWidth="2.5"
                  />
                  <text
                    x={ox + sCRoot * 0.45}
                    y={oy - sH / 2}
                    textAnchor="middle"
                    fill={controlSurfaceColor}
                    fontSize="11"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    RUDDER
                  </text>

                  {/* Control Horn Location Marker */}
                  <circle
                    cx={ox + 20}
                    cy={oy - 35}
                    r="4"
                    fill="#ef4444"
                  />
                  <text
                    x={ox + 30}
                    y={oy - 32}
                    fill="#ef4444"
                    fontSize="8"
                    fontFamily="monospace"
                  >
                    CONTROL HORN HOLE
                  </text>

                  {/* Dimensions */}
                  <DimensionLine
                    x1={ox}
                    y1={oy}
                    x2={ox}
                    y2={oy - sH}
                    offset={-40}
                    orientation="vertical"
                    measuredValueMm={rHeight}
                    unit={unit}
                    labelPrefix="HEIGHT: "
                    color={controlSurfaceColor}
                  />
                  <DimensionLine
                    x1={ox}
                    y1={oy}
                    x2={ox + sCRoot}
                    y2={oy}
                    offset={35}
                    orientation="horizontal"
                    measuredValueMm={rCRoot}
                    unit={unit}
                    labelPrefix="ROOT CHORD: "
                    color={controlSurfaceColor}
                  />
                  <DimensionLine
                    x1={ox}
                    y1={oy - sH}
                    x2={ox + sCTip}
                    y2={oy - sH}
                    offset={-30}
                    orientation="horizontal"
                    measuredValueMm={rCTip}
                    unit={unit}
                    labelPrefix="TIP CHORD: "
                    color={controlSurfaceColor}
                  />
                </g>
              );
            }}
          </TechnicalSvgViewer>

          <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 text-xs text-slate-300">
            <span className="font-semibold text-amber-400 block mb-1">Recommended Rudder Deflections:</span>
            Low Rates: ±{rud.recommendedDeflectionLowDeg}° | High Rates: ±{rud.recommendedDeflectionHighDeg}° (For spin entry and stall recovery training)
          </div>
        </div>
      )}
    </div>
  );
};
