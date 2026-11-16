// AERO DESIGN STUDIO - RC TRAINER DESIGNER
// Wing Design & Technical Drawing Generator

import React, { useState } from 'react';
import { CalculatedAircraft, ReferenceImage, UnitType } from '../types/aircraft';
import { TechnicalSvgViewer } from './common/TechnicalSvgViewer';
import { DimensionLine } from './common/DimensionLine';
import { ReferenceImageModal } from './common/ReferenceImageModal';
import { formatDimension, formatArea } from '../engine/units';
import { getAirfoilInfo } from '../engine/airfoils';
import { Image as ImageIcon, Sliders, Info, CheckCircle } from 'lucide-react';

interface WingDesignTabProps {
  aircraft: CalculatedAircraft;
  onUpdateConfig: (updater: (prev: any) => any) => void;
  referenceImages: Record<string, ReferenceImage>;
  onSaveReferenceImage: (ref: ReferenceImage) => void;
}

export const WingDesignTab: React.FC<WingDesignTabProps> = ({
  aircraft,
  onUpdateConfig,
  referenceImages,
  onSaveReferenceImage
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'top' | 'airfoil' | 'front'>('top');
  const [isRefModalOpen, setIsRefModalOpen] = useState<boolean>(false);

  const { wing, config, controlSurfaces } = aircraft;
  const unit = config.unit;
  const airfoilInfo = getAirfoilInfo(wing.airfoil);

  // Geometry calculations for Top View SVG
  const span = wing.wingspanMm;
  const halfSpan = wing.halfSpanMm;
  const cRoot = wing.chordRootMm;
  const cTip = wing.chordTipMm;
  const isTapered = config.wingPlanform === 'tapered';

  // SVG Drawing Coordinate Mapping:
  // Center of wing at X = 500, Y = 280
  const drawWidth = 1000;
  const drawHeight = 620;
  // Fit wingspan into ~780px
  const scale = 780 / span;

  const cx = 500;
  const cy = 270;

  const scaledSpan = span * scale;
  const scaledHalfSpan = halfSpan * scale;
  const scaledCRoot = cRoot * scale;
  const scaledCTip = cTip * scale;

  // Leading edge coordinates
  // Root LE at (cx, cy - scaledCRoot/2), TE at (cx, cy + scaledCRoot/2)
  const rootLeY = cy - scaledCRoot / 2;
  const rootTeY = cy + scaledCRoot / 2;

  // For tapered wing with straight trailing edge (common trainer)
  const tipTeY = rootTeY;
  const tipLeY = tipTeY - scaledCTip;

  const leftTipX = cx - scaledHalfSpan;
  const rightTipX = cx + scaledHalfSpan;

  // Wing outline polygon points
  const wingOutlinePath = isTapered
    ? `M ${leftTipX} ${tipLeY} L ${cx} ${rootLeY} L ${rightTipX} ${tipLeY} L ${rightTipX} ${tipTeY} L ${cx} ${rootTeY} L ${leftTipX} ${tipTeY} Z`
    : `M ${leftTipX} ${rootLeY} L ${rightTipX} ${rootLeY} L ${rightTipX} ${rootTeY} L ${leftTipX} ${rootTeY} Z`;

  // Spar line (at 30% chord from LE)
  const sparRatio = wing.sparPositionRatio;
  const rootSparY = rootLeY + scaledCRoot * sparRatio;
  const tipSparY = tipLeY + scaledCTip * sparRatio;

  // Ailerons
  const ailSpan = controlSurfaces.aileron.leftSpanMm * scale;
  const ailChord = controlSurfaces.aileron.chordMm * scale;
  const ailOffset = controlSurfaces.aileron.startFromTipMm * scale;

  // Right aileron
  const rAilStartX = rightTipX - ailOffset - ailSpan;
  const rAilEndX = rightTipX - ailOffset;
  const rAilTeY = tipTeY;
  const rAilLeY = tipTeY - ailChord;

  // Left aileron
  const lAilStartX = leftTipX + ailOffset;
  const lAilEndX = leftTipX + ailOffset + ailSpan;
  const lAilTeY = tipTeY;
  const lAilLeY = tipTeY - ailChord;

  return (
    <div className="space-y-6">
      {/* Top action card */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-900/60 rounded-xl border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex rounded-lg border border-slate-700 bg-slate-800/80 p-1 text-xs">
            <button
              onClick={() => setActiveSubTab('top')}
              className={`px-3 py-1.5 rounded-md font-medium transition ${
                activeSubTab === 'top' ? 'bg-sky-500 text-slate-950 font-bold shadow' : 'text-slate-300 hover:text-white'
              }`}
            >
              1. Top View (Planform)
            </button>
            <button
              onClick={() => setActiveSubTab('airfoil')}
              className={`px-3 py-1.5 rounded-md font-medium transition ${
                activeSubTab === 'airfoil' ? 'bg-sky-500 text-slate-950 font-bold shadow' : 'text-slate-300 hover:text-white'
              }`}
            >
              2. Airfoil Profile
            </button>
            <button
              onClick={() => setActiveSubTab('front')}
              className={`px-3 py-1.5 rounded-md font-medium transition ${
                activeSubTab === 'front' ? 'bg-sky-500 text-slate-950 font-bold shadow' : 'text-slate-300 hover:text-white'
              }`}
            >
              3. Front Dihedral View
            </button>
          </div>
        </div>

        {/* Design Mode: Automatic vs Reference-Assisted */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-slate-800/90 px-3 py-1.5 rounded-lg border border-slate-700 text-xs">
            <span className="text-slate-400">Mode:</span>
            <select
              value={config.designModes.wing}
              onChange={(e) =>
                onUpdateConfig((prev) => ({
                  ...prev,
                  designModes: { ...prev.designModes, wing: e.target.value as 'auto' | 'reference' }
                }))
              }
              className="bg-transparent font-semibold text-sky-400 outline-none cursor-pointer"
            >
              <option value="auto" className="bg-slate-900 text-white">OPTION A: Automatic Design</option>
              <option value="reference" className="bg-slate-900 text-white">OPTION B: Reference-Assisted</option>
            </select>
          </div>

          <button
            onClick={() => setIsRefModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-600 transition"
          >
            <ImageIcon className="w-3.5 h-3.5 text-sky-400" />
            {referenceImages['wing'] ? 'Edit Reference Image' : 'Upload Wing Reference'}
          </button>
        </div>
      </div>

      {/* SUB-VIEW 1: WING PLANFORM TOP VIEW */}
      {activeSubTab === 'top' && (
        <div className="space-y-4">
          <TechnicalSvgViewer
            title="Main Wing – Technical Top View Planform"
            subtitle={`Planform: ${config.wingPlanform.toUpperCase()} | Airfoil: ${airfoilInfo.name} | Span: ${formatDimension(span, unit)}`}
            width={drawWidth}
            height={drawHeight}
            downloadFileName="wing-top-view-blueprint"
          >
            {({ primaryColor, controlSurfaceColor, sparColor, textColor, isBlueprint }) => (
              <g id="wing-top-drawing">
                {/* Centerline (long dash - short dash) */}
                <line
                  x1={cx}
                  y1={rootLeY - 60}
                  x2={cx}
                  y2={rootTeY + 70}
                  stroke={sparColor}
                  strokeWidth="1"
                  strokeDasharray="16,4,4,4"
                  strokeOpacity="0.75"
                />
                <text
                  x={cx + 6}
                  y={rootLeY - 45}
                  fill={sparColor}
                  fontSize="9"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  CL (CENTERLINE)
                </text>

                {/* Main Wing Outline */}
                <path
                  d={wingOutlinePath}
                  fill={isBlueprint ? 'rgba(56, 189, 248, 0.05)' : 'rgba(15, 23, 42, 0.02)'}
                  stroke={primaryColor}
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                />

                {/* Main Spar Line (at 30% chord) */}
                <line
                  x1={leftTipX}
                  y1={tipSparY}
                  x2={rightTipX}
                  y2={tipSparY}
                  stroke={sparColor}
                  strokeWidth="1.8"
                  strokeDasharray="6,3"
                />
                <text
                  x={cx + 15}
                  y={rootSparY - 5}
                  fill={sparColor}
                  fontSize="9"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  MAIN SPAR (30% CHORD)
                </text>

                {/* Mean Aerodynamic Chord (MAC) Station on Right Wing */}
                <line
                  x1={cx + wing.macYPositionMm * scale}
                  y1={rootTeY - scaledCRoot}
                  x2={cx + wing.macYPositionMm * scale}
                  y2={rootTeY}
                  stroke="#10b981"
                  strokeWidth="1.2"
                  strokeDasharray="3,3"
                />
                <circle
                  cx={cx + wing.macYPositionMm * scale}
                  cy={rootLeY + (wing.centerOfGravityMinMm - wing.macXPositionMm) * scale}
                  r="4"
                  fill="#10b981"
                />
                <text
                  x={cx + wing.macYPositionMm * scale + 8}
                  y={rootLeY + (wing.centerOfGravityMinMm - wing.macXPositionMm) * scale + 3}
                  fill="#10b981"
                  fontSize="9"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  CG RANGE (25-30% MAC)
                </text>

                {/* Control Surfaces: Left & Right Ailerons */}
                {/* Left Aileron */}
                <rect
                  x={lAilStartX}
                  y={lAilLeY}
                  width={ailSpan}
                  height={ailChord}
                  fill="url(#controlSurfaceHatch)"
                  stroke={controlSurfaceColor}
                  strokeWidth="2"
                  strokeDasharray="4,2"
                />
                <text
                  x={lAilStartX + ailSpan / 2}
                  y={lAilLeY + ailChord / 2 + 3}
                  textAnchor="middle"
                  fill={controlSurfaceColor}
                  fontSize="9"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  LEFT AILERON
                </text>

                {/* Right Aileron */}
                <rect
                  x={rAilStartX}
                  y={rAilLeY}
                  width={ailSpan}
                  height={ailChord}
                  fill="url(#controlSurfaceHatch)"
                  stroke={controlSurfaceColor}
                  strokeWidth="2"
                  strokeDasharray="4,2"
                />
                <text
                  x={rAilStartX + ailSpan / 2}
                  y={rAilLeY + ailChord / 2 + 3}
                  textAnchor="middle"
                  fill={controlSurfaceColor}
                  fontSize="9"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  RIGHT AILERON
                </text>

                {/* DIMENSION LINES */}
                {/* 1. Total Wingspan dimension */}
                <DimensionLine
                  x1={leftTipX}
                  y1={rootLeY}
                  x2={rightTipX}
                  y2={rootLeY}
                  offset={-55}
                  orientation="horizontal"
                  measuredValueMm={span}
                  unit={unit}
                  labelPrefix="TOTAL WINGSPAN: "
                  color={primaryColor}
                />

                {/* 2. Half-span Left & Right */}
                <DimensionLine
                  x1={leftTipX}
                  y1={rootLeY}
                  x2={cx}
                  y2={rootLeY}
                  offset={-25}
                  orientation="horizontal"
                  measuredValueMm={halfSpan}
                  unit={unit}
                  labelPrefix="SEMI-SPAN: "
                  color={primaryColor}
                />

                {/* 3. Root Chord */}
                <DimensionLine
                  x1={cx}
                  y1={rootLeY}
                  x2={cx}
                  y2={rootTeY}
                  offset={-35}
                  orientation="vertical"
                  measuredValueMm={cRoot}
                  unit={unit}
                  labelPrefix="ROOT CHORD: "
                  color={primaryColor}
                />

                {/* 4. Tip Chord */}
                <DimensionLine
                  x1={rightTipX}
                  y1={tipLeY}
                  x2={rightTipX}
                  y2={tipTeY}
                  offset={35}
                  orientation="vertical"
                  measuredValueMm={cTip}
                  unit={unit}
                  labelPrefix="TIP CHORD: "
                  color={primaryColor}
                />

                {/* 5. Aileron Span & Chord */}
                <DimensionLine
                  x1={rAilStartX}
                  y1={rAilTeY}
                  x2={rAilEndX}
                  y2={rAilTeY}
                  offset={35}
                  orientation="horizontal"
                  measuredValueMm={controlSurfaces.aileron.rightSpanMm}
                  unit={unit}
                  labelPrefix="AIL SPAN: "
                  color={controlSurfaceColor}
                />
                <DimensionLine
                  x1={rAilEndX}
                  y1={rAilLeY}
                  x2={rAilEndX}
                  y2={rAilTeY}
                  offset={25}
                  orientation="vertical"
                  measuredValueMm={controlSurfaces.aileron.chordMm}
                  unit={unit}
                  labelPrefix="AIL CHORD: "
                  color={controlSurfaceColor}
                />
              </g>
            )}
          </TechnicalSvgViewer>

          {/* Quick specs table */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
            <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
              <span className="text-slate-400 block mb-0.5">Wing Area:</span>
              <span className="text-sky-400 font-bold">{formatArea(wing.wingAreaMm2, unit)}</span>
            </div>
            <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
              <span className="text-slate-400 block mb-0.5">Aspect Ratio (AR):</span>
              <span className="text-sky-400 font-bold">{wing.aspectRatio.toFixed(2)}</span>
            </div>
            <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
              <span className="text-slate-400 block mb-0.5">Mean Aerodynamic Chord:</span>
              <span className="text-sky-400 font-bold">{formatDimension(wing.meanAerodynamicChordMm, unit)}</span>
            </div>
            <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
              <span className="text-slate-400 block mb-0.5">Aileron Area (% Wing):</span>
              <span className="text-amber-400 font-bold">{controlSurfaces.aileron.areaPctOfWing}%</span>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 2: AIRFOIL PROFILE DRAWING */}
      {activeSubTab === 'airfoil' && (
        <div className="space-y-4">
          <TechnicalSvgViewer
            title={`Airfoil Profile Section – ${airfoilInfo.name}`}
            subtitle={`Max Thickness: ${wing.maxThicknessPct}% at 30% chord | Max Camber: ${wing.maxCamberPct}% at 40% chord`}
            width={1000}
            height={500}
            downloadFileName={`${wing.airfoil}-profile-drawing`}
          >
            {({ primaryColor, sparColor, isBlueprint }) => {
              const chordMm = wing.chordRootMm;
              const afScale = 680 / chordMm;
              const ox = 160;
              const oy = 250;
              const scaledChord = chordMm * afScale;

              // Build Upper and Lower surface SVG paths
              const coords = wing.airfoilCoordinates;
              const upperPts = coords
                .map((pt) => `${ox + pt.x * scaledChord},${oy - pt.yUpper * scaledChord}`)
                .join(' L ');
              const lowerPts = [...coords]
                .reverse()
                .map((pt) => `${ox + pt.x * scaledChord},${oy - pt.yLower * scaledChord}`)
                .join(' L ');
              const camberPts = coords
                .map((pt) => `${ox + pt.x * scaledChord},${oy - pt.camber * scaledChord}`)
                .join(' L ');

              // Max thickness location (30% chord)
              const maxThickX = ox + 0.30 * scaledChord;
              const maxThickMm = wing.maxThicknessMm;
              const maxThickUpperY = oy - (maxThickMm * 0.75 * afScale);
              const maxThickLowerY = oy + (maxThickMm * 0.25 * afScale);

              return (
                <g id="airfoil-drawing">
                  {/* Chord Datum Line */}
                  <line
                    x1={ox - 30}
                    y1={oy}
                    x2={ox + scaledChord + 40}
                    y2={oy}
                    stroke={primaryColor}
                    strokeWidth="1"
                    strokeDasharray="8,4"
                    strokeOpacity="0.5"
                  />
                  <text
                    x={ox + scaledChord + 10}
                    y={oy - 8}
                    fill={primaryColor}
                    fontSize="9"
                    fontFamily="monospace"
                  >
                    CHORD DATUM
                  </text>

                  {/* Mean Camber Line */}
                  <path
                    d={`M ${camberPts}`}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="1.5"
                    strokeDasharray="4,2"
                  />
                  <text
                    x={ox + 0.45 * scaledChord}
                    y={oy - wing.maxCamberMm * afScale - 12}
                    fill="#10b981"
                    fontSize="9"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    MEAN CAMBER LINE
                  </text>

                  {/* Airfoil Solid Profile */}
                  <path
                    d={`M ${upperPts} L ${lowerPts} Z`}
                    fill={isBlueprint ? 'rgba(56, 189, 248, 0.12)' : 'rgba(37, 99, 235, 0.08)'}
                    stroke={primaryColor}
                    strokeWidth="2.5"
                  />

                  {/* Spar Box Location at 30% Chord */}
                  <rect
                    x={ox + 0.28 * scaledChord}
                    y={oy - 0.08 * scaledChord}
                    width={0.04 * scaledChord}
                    height={0.08 * scaledChord}
                    fill="none"
                    stroke={sparColor}
                    strokeWidth="1.5"
                    strokeDasharray="2,2"
                  />
                  <text
                    x={ox + 0.30 * scaledChord}
                    y={oy - 0.10 * scaledChord}
                    textAnchor="middle"
                    fill={sparColor}
                    fontSize="8"
                    fontFamily="monospace"
                  >
                    SPAR CUTOUT
                  </text>

                  {/* Dimension Lines */}
                  {/* Total Chord Dimension */}
                  <DimensionLine
                    x1={ox}
                    y1={oy}
                    x2={ox + scaledChord}
                    y2={oy}
                    offset={65}
                    orientation="horizontal"
                    measuredValueMm={chordMm}
                    unit={unit}
                    labelPrefix="CHORD LENGTH: "
                    color={primaryColor}
                  />

                  {/* Max Thickness Dimension */}
                  <DimensionLine
                    x1={maxThickX}
                    y1={maxThickUpperY}
                    x2={maxThickX}
                    y2={maxThickLowerY}
                    offset={30}
                    orientation="vertical"
                    measuredValueMm={maxThickMm}
                    unit={unit}
                    labelPrefix="MAX THICKNESS (11.7%): "
                    color="#f59e0b"
                  />
                </g>
              );
            }}
          </TechnicalSvgViewer>

          <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-2">
            <h4 className="font-semibold text-sky-400 flex items-center gap-1.5">
              <Info className="w-4 h-4" />
              Airfoil Profile Engineering Characteristics
            </h4>
            <p>{airfoilInfo.description}</p>
            <p className="text-slate-400">
              <span className="font-bold text-slate-200">Ideal For:</span> {airfoilInfo.idealFor}
            </p>
          </div>
        </div>
      )}

      {/* SUB-VIEW 3: FRONT DIHEDRAL VIEW */}
      {activeSubTab === 'front' && (
        <div className="space-y-4">
          <TechnicalSvgViewer
            title="Wing Front View – Dihedral Angle & Tip Rise"
            subtitle={`Dihedral Angle: ${wing.dihedralDeg.toFixed(1)}° | Tip Rise: ${formatDimension(wing.dihedralTipRiseMm, unit)}`}
            width={1000}
            height={500}
            downloadFileName="wing-front-dihedral-blueprint"
          >
            {({ primaryColor, isBlueprint }) => {
              const cx = 500;
              const cy = 320;
              const fScale = 750 / span;
              const scaledH = halfSpan * fScale;
              const rise = wing.dihedralTipRiseMm * fScale;
              const thick = wing.maxThicknessMm * fScale;

              const cabinW = aircraft.fuselage.maxCabinWidthMm * fScale;
              const cabinH = aircraft.fuselage.maxCabinHeightMm * fScale;

              return (
                <g id="wing-front-drawing">
                  {/* Horizontal Datum Line */}
                  <line
                    x1={cx - scaledH - 30}
                    y1={cy}
                    x2={cx + scaledH + 30}
                    y2={cy}
                    stroke={primaryColor}
                    strokeWidth="1"
                    strokeDasharray="6,4"
                    strokeOpacity="0.4"
                  />

                  {/* Fuselage Cabin Box in Front View */}
                  <rect
                    x={cx - cabinW / 2}
                    y={cy}
                    width={cabinW}
                    height={cabinH * 0.7}
                    fill={isBlueprint ? '#0a2540' : '#e2e8f0'}
                    stroke={primaryColor}
                    strokeWidth="1.8"
                  />
                  <text
                    x={cx}
                    y={cy + cabinH * 0.35}
                    textAnchor="middle"
                    fill={primaryColor}
                    fontSize="9"
                    fontFamily="monospace"
                  >
                    FUSELAGE CABIN
                  </text>

                  {/* Right Wing Panel (angled up) */}
                  <polygon
                    points={`${cx},${cy} ${cx + scaledH},${cy - rise} ${cx + scaledH},${cy - rise - thick} ${cx},${cy - thick}`}
                    fill={isBlueprint ? 'rgba(56, 189, 248, 0.15)' : 'rgba(37, 99, 235, 0.1)'}
                    stroke={primaryColor}
                    strokeWidth="2.2"
                  />

                  {/* Left Wing Panel (angled up) */}
                  <polygon
                    points={`${cx},${cy} ${cx - scaledH},${cy - rise} ${cx - scaledH},${cy - rise - thick} ${cx},${cy - thick}`}
                    fill={isBlueprint ? 'rgba(56, 189, 248, 0.15)' : 'rgba(37, 99, 235, 0.1)'}
                    stroke={primaryColor}
                    strokeWidth="2.2"
                  />

                  {/* Dihedral angle arc */}
                  <path
                    d={`M ${cx + 120} ${cy} A 120 120 0 0 0 ${cx + 120 * Math.cos((wing.dihedralDeg * Math.PI) / 180)} ${cy - 120 * Math.sin((wing.dihedralDeg * Math.PI) / 180)}`}
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="2"
                  />
                  <text
                    x={cx + 135}
                    y={cy - 15}
                    fill="#f59e0b"
                    fontSize="11"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    Γ = {wing.dihedralDeg.toFixed(1)}° DIHEDRAL
                  </text>

                  {/* Tip Rise Dimension Line */}
                  <DimensionLine
                    x1={cx + scaledH}
                    y1={cy}
                    x2={cx + scaledH}
                    y2={cy - rise}
                    offset={35}
                    orientation="vertical"
                    measuredValueMm={wing.dihedralTipRiseMm}
                    unit={unit}
                    labelPrefix="TIP RISE: "
                    color="#f59e0b"
                  />
                </g>
              );
            }}
          </TechnicalSvgViewer>
        </div>
      )}

      {/* Reference Image Modal */}
      <ReferenceImageModal
        isOpen={isRefModalOpen}
        onClose={() => setIsRefModalOpen(false)}
        componentTitle="Main Wing"
        componentType="wing"
        currentReference={referenceImages['wing']}
        onSaveReference={onSaveReferenceImage}
        unit={unit}
        defaultKnownDimensionMm={span}
      />
    </div>
  );
};
