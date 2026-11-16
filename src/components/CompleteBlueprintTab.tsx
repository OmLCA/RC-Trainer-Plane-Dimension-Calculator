// AERO DESIGN STUDIO - RC TRAINER DESIGNER
// Master Engineering Drawing Sheet: COMPLETE AIRCRAFT BLUEPRINT
// Arranged like a professional aerospace manufacturing drawing (A1 / A2 style sheet)
// Contains all 7 technical drawings, Title Block, Revisions, General Notes, Zoom & Pan

import React, { useRef } from 'react';
import { CalculatedAircraft, BlueprintTheme } from '../types/aircraft';
import { TechnicalSvgViewer } from './common/TechnicalSvgViewer';
import { DimensionLine } from './common/DimensionLine';
import { formatDimension, formatArea } from '../engine/units';
import { getAirfoilInfo } from '../engine/airfoils';
import { Printer, Download, Sparkles } from 'lucide-react';

interface CompleteBlueprintTabProps {
  aircraft: CalculatedAircraft;
  theme: BlueprintTheme;
  onThemeChange: (theme: BlueprintTheme) => void;
  onNavigateToExport: () => void;
}

export const CompleteBlueprintTab: React.FC<CompleteBlueprintTabProps> = ({
  aircraft,
  theme,
  onThemeChange,
  onNavigateToExport
}) => {
  const { wing, fuselage, horizontalStabilizer, verticalStabilizer, controlSurfaces, performance, config } = aircraft;
  const unit = config.unit;
  const airfoilInfo = getAirfoilInfo(wing.airfoil);

  // Master Sheet dimensions (Standard 2400 x 1600 coordinate space)
  const sheetWidth = 2400;
  const sheetHeight = 1600;

  return (
    <div className="space-y-4">
      {/* Top Banner with Quick Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-900/70 rounded-xl border border-slate-800">
        <div>
          <h2 className="text-base font-bold text-sky-400 tracking-wide uppercase flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-sky-400" />
            Complete Aircraft Engineering Blueprint
          </h2>
          <p className="text-xs text-slate-400">
            Integrated multi-view manufacturing sheet with dimension arrows, extension lines, title block, and orthographic projections.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onNavigateToExport}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white rounded-lg shadow-lg shadow-sky-900/30 transition"
          >
            <Download className="w-4 h-4" />
            Export Blueprint (PDF / SVG)
          </button>
        </div>
      </div>

      {/* Master Blueprint Technical Canvas */}
      <TechnicalSvgViewer
        title="RC TRAINER AIRCRAFT – GENERAL ARRANGEMENT & MANUFACTURING BLUEPRINT"
        subtitle={`DRAWING NO: ADS-RCT-2026-001 | SHEET 1 OF 1 | SCALE 1:1 NOTED | UNITS: ${unit.toUpperCase()}`}
        width={sheetWidth}
        height={sheetHeight}
        theme={theme}
        onThemeChange={onThemeChange}
        downloadFileName="aero-design-studio-master-blueprint"
      >
        {({ primaryColor, accentColor, controlSurfaceColor, sparColor, isBlueprint }) => {
          // Geometry scaling for master sheet layout
          const b = wing.wingspanMm;
          const fuseL = fuselage.totalLengthMm;

          // VIEW 1: MAIN WING (TOP LEFT, ~X: 100 to 1400, Y: 120 to 540)
          const wingScale = 1100 / b;
          const wCX = 700;
          const wCY = 310;
          const wHalfS = wing.halfSpanMm * wingScale;
          const wCRoot = wing.chordRootMm * wingScale;
          const wCTip = wing.chordTipMm * wingScale;
          const wIsTaper = config.wingPlanform === 'tapered';

          const wRootLeY = wCY - wCRoot / 2;
          const wRootTeY = wCY + wCRoot / 2;
          const wTipTeY = wRootTeY;
          const wTipLeY = wTipTeY - wCTip;

          const wOutline = wIsTaper
            ? `M ${wCX - wHalfS} ${wTipLeY} L ${wCX} ${wRootLeY} L ${wCX + wHalfS} ${wTipLeY} L ${wCX + wHalfS} ${wTipTeY} L ${wCX} ${wRootTeY} L ${wCX - wHalfS} ${wTipTeY} Z`
            : `M ${wCX - wHalfS} ${wRootLeY} L ${wCX + wHalfS} ${wRootLeY} L ${wCX + wHalfS} ${wRootTeY} L ${wCX - wHalfS} ${wRootTeY} Z`;

          // Ailerons on master sheet
          const ailSpanS = controlSurfaces.aileron.leftSpanMm * wingScale;
          const ailChordS = controlSurfaces.aileron.chordMm * wingScale;
          const ailOffsetS = controlSurfaces.aileron.startFromTipMm * wingScale;

          // VIEW 2: WING FRONT DIHEDRAL (BELOW WING, X: 100 to 1400, Y: 560 to 760)
          const fCY = 660;
          const fRise = wing.dihedralTipRiseMm * wingScale;
          const fThick = wing.maxThicknessMm * wingScale;

          // VIEW 3: AIRFOIL SECTION (TOP RIGHT, X: 1480 to 2300, Y: 120 to 450)
          const afScale = 650 / wing.chordRootMm;
          const afOX = 1540;
          const afOY = 270;
          const afScaledChord = wing.chordRootMm * afScale;
          const coords = wing.airfoilCoordinates;
          const upperPts = coords.map((pt) => `${afOX + pt.x * afScaledChord},${afOY - pt.yUpper * afScaledChord}`).join(' L ');
          const lowerPts = [...coords].reverse().map((pt) => `${afOX + pt.x * afScaledChord},${afOY - pt.yLower * afScaledChord}`).join(' L ');

          // VIEW 4: FUSELAGE SIDE VIEW (MIDDLE, X: 100 to 1400, Y: 820 to 1250)
          const fuseScale = 1100 / fuseL;
          const fsOX = 160;
          const fsOY = 1140;
          const fsL = fuseL * fuseScale;
          const fsMaxH = fuselage.maxCabinHeightMm * fuseScale;
          const fsNoseH = fuselage.noseHeightMm * fuseScale;
          const fsTailH = fuselage.tailBoomHeightMm * fuseScale;

          const fsTopPts = [
            `${fsOX},${fsOY - fsNoseH * 0.7}`,
            `${fsOX + fuselage.noseMomentArmMm * 0.6 * fuseScale},${fsOY - fsMaxH * 0.82}`,
            `${fsOX + fuselage.wingMountXStartMm * fuseScale},${fsOY - fsMaxH}`,
            `${fsOX + fuselage.wingMountXEndMm * fuseScale},${fsOY - fsMaxH * 0.96}`,
            `${fsOX + (fuselage.wingMountXEndMm + 80) * fuseScale},${fsOY - fsMaxH * 0.72}`,
            `${fsOX + fsL},${fsOY - fsTailH}`
          ];
          const fsBottomPts = [
            `${fsOX + fsL},${fsOY}`,
            `${fsOX + (fuselage.wingMountXEndMm + 80) * fuseScale},${fsOY - fsMaxH * 0.15}`,
            `${fsOX + fuselage.wingMountXStartMm * fuseScale},${fsOY - fsMaxH * 0.05}`,
            `${fsOX + fuselage.noseMomentArmMm * 0.4 * fuseScale},${fsOY - fsMaxH * 0.1}`,
            `${fsOX},${fsOY - fsNoseH * 0.15}`
          ];
          const fsPath = `M ${fsTopPts.join(' L ')} L ${fsBottomPts.join(' L ')} Z`;

          // VIEW 5: FUSELAGE TOP VIEW (BOTTOM, X: 100 to 1400, Y: 1280 to 1540)
          const ftOY = 1410;
          const ftMaxW = fuselage.maxCabinWidthMm * fuseScale;
          const ftNoseW = fuselage.noseWidthMm * fuseScale;
          const ftTailW = fuselage.tailWidthMm * fuseScale;

          // VIEW 6: HORIZONTAL STABILIZER (RIGHT MIDDLE, X: 1480 to 2300, Y: 520 to 860)
          const hScale = 680 / horizontalStabilizer.spanMm;
          const hCX = 1890;
          const hCY = 670;
          const hHalfS = horizontalStabilizer.halfSpanMm * hScale;
          const hCRoot = horizontalStabilizer.chordRootMm * hScale;
          const hCTip = horizontalStabilizer.chordTipMm * hScale;
          const hElevChord = horizontalStabilizer.elevatorChordMm * hScale;
          const hSweep = (horizontalStabilizer.chordRootMm - horizontalStabilizer.chordTipMm) * 0.45 * hScale;

          // VIEW 7: VERTICAL STABILIZER (RIGHT BOTTOM, X: 1480 to 1950, Y: 920 to 1320)
          const vScale = 320 / verticalStabilizer.heightMm;
          const vOX = 1560;
          const vOY = 1260;
          const vH = verticalStabilizer.heightMm * vScale;
          const vCRoot = verticalStabilizer.chordRootMm * vScale;
          const vCTip = verticalStabilizer.chordTipMm * vScale;
          const vSweep = (verticalStabilizer.chordRootMm - verticalStabilizer.chordTipMm) * 0.7 * vScale;
          const vRudChord = verticalStabilizer.rudderChordRootMm * vScale;

          return (
            <g id="master-blueprint-sheet">
              {/* Outer Sheet Border (Engineering Drawing Margin) */}
              <rect
                x="40"
                y="40"
                width={sheetWidth - 80}
                height={sheetHeight - 80}
                fill="none"
                stroke={primaryColor}
                strokeWidth="4"
              />
              <rect
                x="55"
                y="55"
                width={sheetWidth - 110}
                height={sheetHeight - 110}
                fill="none"
                stroke={primaryColor}
                strokeWidth="1.2"
              />

              {/* Grid division lines dividing sheet zones */}
              <line x1="1450" y1="55" x2="1450" y2="1545" stroke={primaryColor} strokeWidth="1" strokeDasharray="6,6" strokeOpacity="0.4" />
              <line x1="55" y1="780" x2="1450" y2="780" stroke={primaryColor} strokeWidth="1" strokeDasharray="6,6" strokeOpacity="0.4" />
              <line x1="1450" y1="480" x2="2345" y2="480" stroke={primaryColor} strokeWidth="1" strokeDasharray="6,6" strokeOpacity="0.4" />
              <line x1="1450" y1="890" x2="2345" y2="890" stroke={primaryColor} strokeWidth="1" strokeDasharray="6,6" strokeOpacity="0.4" />

              {/* ==================================================== */}
              {/* 1. VIEW 1: WING PLANFORM TOP VIEW */}
              {/* ==================================================== */}
              <g id="sheet-view-wing">
                <text x="80" y="95" fill={primaryColor} fontSize="14" fontFamily="monospace" fontWeight="bold">
                  VIEW A-A: MAIN WING TOP PLANFORM
                </text>
                {/* Centerline */}
                <line x1={wCX} y1={wRootLeY - 40} x2={wCX} y2={wRootTeY + 40} stroke={sparColor} strokeWidth="1.2" strokeDasharray="14,4,4,4" />
                {/* Wing Outline */}
                <path d={wOutline} fill={isBlueprint ? 'rgba(56, 189, 248, 0.05)' : 'rgba(15, 23, 42, 0.02)'} stroke={primaryColor} strokeWidth="2.5" />
                {/* Spar */}
                <line x1={wCX - wHalfS} y1={wRootLeY + wCRoot * 0.3} x2={wCX + wHalfS} y2={wRootLeY + wCRoot * 0.3} stroke={sparColor} strokeWidth="1.8" strokeDasharray="6,3" />

                {/* Left & Right Ailerons */}
                <rect
                  x={wCX - wHalfS + ailOffsetS}
                  y={wTipTeY - ailChordS}
                  width={ailSpanS}
                  height={ailChordS}
                  fill="url(#controlSurfaceHatch)"
                  stroke={controlSurfaceColor}
                  strokeWidth="2"
                  strokeDasharray="4,2"
                />
                <rect
                  x={wCX + wHalfS - ailOffsetS - ailSpanS}
                  y={wTipTeY - ailChordS}
                  width={ailSpanS}
                  height={ailChordS}
                  fill="url(#controlSurfaceHatch)"
                  stroke={controlSurfaceColor}
                  strokeWidth="2"
                  strokeDasharray="4,2"
                />

                {/* Dimensions */}
                <DimensionLine
                  x1={wCX - wHalfS}
                  y1={wRootLeY}
                  x2={wCX + wHalfS}
                  y2={wRootLeY}
                  offset={-35}
                  orientation="horizontal"
                  measuredValueMm={b}
                  unit={unit}
                  labelPrefix="SPAN: "
                  color={primaryColor}
                />
                <DimensionLine
                  x1={wCX}
                  y1={wRootLeY}
                  x2={wCX}
                  y2={wRootTeY}
                  offset={-30}
                  orientation="vertical"
                  measuredValueMm={wing.chordRootMm}
                  unit={unit}
                  labelPrefix="ROOT: "
                  color={primaryColor}
                />
              </g>

              {/* ==================================================== */}
              {/* 2. VIEW 2: WING FRONT DIHEDRAL VIEW */}
              {/* ==================================================== */}
              <g id="sheet-view-dihedral">
                <text x="80" y="585" fill={primaryColor} fontSize="14" fontFamily="monospace" fontWeight="bold">
                  VIEW B-B: WING FRONT DIHEDRAL VIEW
                </text>
                {/* Horizontal Datum */}
                <line x1={wCX - wHalfS - 20} y1={fCY} x2={wCX + wHalfS + 20} y2={fCY} stroke={primaryColor} strokeWidth="1" strokeDasharray="6,4" strokeOpacity="0.4" />
                {/* Panels */}
                <polygon
                  points={`${wCX},${fCY} ${wCX + wHalfS},${fCY - fRise} ${wCX + wHalfS},${fCY - fRise - fThick} ${wCX},${fCY - fThick}`}
                  fill={isBlueprint ? 'rgba(56, 189, 248, 0.12)' : 'rgba(37, 99, 235, 0.08)'}
                  stroke={primaryColor}
                  strokeWidth="2"
                />
                <polygon
                  points={`${wCX},${fCY} ${wCX - wHalfS},${fCY - fRise} ${wCX - wHalfS},${fCY - fRise - fThick} ${wCX},${fCY - fThick}`}
                  fill={isBlueprint ? 'rgba(56, 189, 248, 0.12)' : 'rgba(37, 99, 235, 0.08)'}
                  stroke={primaryColor}
                  strokeWidth="2"
                />
                <DimensionLine
                  x1={wCX + wHalfS}
                  y1={fCY}
                  x2={wCX + wHalfS}
                  y2={fCY - fRise}
                  offset={25}
                  orientation="vertical"
                  measuredValueMm={wing.dihedralTipRiseMm}
                  unit={unit}
                  labelPrefix="TIP RISE: "
                  color="#f59e0b"
                />
              </g>

              {/* ==================================================== */}
              {/* 3. VIEW 3: AIRFOIL SECTION */}
              {/* ==================================================== */}
              <g id="sheet-view-airfoil">
                <text x="1480" y="95" fill={primaryColor} fontSize="14" fontFamily="monospace" fontWeight="bold">
                  VIEW C-C: AIRFOIL SECTION ({airfoilInfo.name.toUpperCase()})
                </text>
                <line x1={afOX - 20} y1={afOY} x2={afOX + afScaledChord + 20} y2={afOY} stroke={primaryColor} strokeWidth="1" strokeDasharray="6,4" strokeOpacity="0.5" />
                <path d={`M ${upperPts} L ${lowerPts} Z`} fill={isBlueprint ? 'rgba(56, 189, 248, 0.15)' : 'rgba(37, 99, 235, 0.1)'} stroke={primaryColor} strokeWidth="2.2" />
                <DimensionLine
                  x1={afOX}
                  y1={afOY}
                  x2={afOX + afScaledChord}
                  y2={afOY}
                  offset={50}
                  orientation="horizontal"
                  measuredValueMm={wing.chordRootMm}
                  unit={unit}
                  labelPrefix="CHORD: "
                  color={primaryColor}
                />
              </g>

              {/* ==================================================== */}
              {/* 4. VIEW 4: FUSELAGE SIDE VIEW */}
              {/* ==================================================== */}
              <g id="sheet-view-fuse-side">
                <text x="80" y="815" fill={primaryColor} fontSize="14" fontFamily="monospace" fontWeight="bold">
                  VIEW D-D: FUSELAGE TECHNICAL SIDE ELEVATION
                </text>
                <path d={fsPath} fill={isBlueprint ? 'rgba(56, 189, 248, 0.08)' : 'rgba(37, 99, 235, 0.05)'} stroke={primaryColor} strokeWidth="2.5" />
                {/* Wing saddle */}
                <line
                  x1={fsOX + fuselage.wingMountXStartMm * fuseScale}
                  y1={fsOY - fsMaxH}
                  x2={fsOX + fuselage.wingMountXEndMm * fuseScale}
                  y2={fsOY - fsMaxH * 0.96}
                  stroke="#10b981"
                  strokeWidth="3.5"
                />
                {/* Landing Gear Strut & Wheel */}
                <line
                  x1={fsOX + fuselage.mainGearMountXMm * fuseScale}
                  y1={fsOY - fsMaxH * 0.05}
                  x2={fsOX + fuselage.mainGearMountXMm * fuseScale}
                  y2={fsOY + fuselage.mainGearHeightMm * fuseScale}
                  stroke={primaryColor}
                  strokeWidth="2.5"
                />
                <circle
                  cx={fsOX + fuselage.mainGearMountXMm * fuseScale}
                  cy={fsOY + fuselage.mainGearHeightMm * fuseScale}
                  r={(fuselage.wheelDiameterMm / 2) * fuseScale}
                  fill={isBlueprint ? '#0f172a' : '#334155'}
                  stroke={primaryColor}
                  strokeWidth="2"
                />
                <DimensionLine
                  x1={fsOX}
                  y1={fsOY - fsMaxH}
                  x2={fsOX + fsL}
                  y2={fsOY - fsMaxH}
                  offset={-35}
                  orientation="horizontal"
                  measuredValueMm={fuseL}
                  unit={unit}
                  labelPrefix="FUSELAGE LENGTH: "
                  color={primaryColor}
                />
                <DimensionLine
                  x1={fsOX + fuselage.wingMountXStartMm * fuseScale}
                  y1={fsOY}
                  x2={fsOX + fuselage.wingMountXStartMm * fuseScale}
                  y2={fsOY - fsMaxH}
                  offset={-30}
                  orientation="vertical"
                  measuredValueMm={fuselage.maxCabinHeightMm}
                  unit={unit}
                  labelPrefix="HEIGHT: "
                  color={primaryColor}
                />
              </g>

              {/* ==================================================== */}
              {/* 5. VIEW 5: FUSELAGE TOP VIEW */}
              {/* ==================================================== */}
              <g id="sheet-view-fuse-top">
                <text x="80" y="1275" fill={primaryColor} fontSize="14" fontFamily="monospace" fontWeight="bold">
                  VIEW E-E: FUSELAGE PLANFORM (TOP VIEW)
                </text>
                <line x1={fsOX - 20} y1={ftOY} x2={fsOX + fsL + 20} y2={ftOY} stroke={sparColor} strokeWidth="1" strokeDasharray="14,4,4,4" />
                <rect
                  x={fsOX + fuselage.wingMountXStartMm * fuseScale}
                  y={ftOY - ftMaxW / 2}
                  width={wing.chordRootMm * fuseScale}
                  height={ftMaxW}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="1.8"
                  strokeDasharray="4,2"
                />
                <DimensionLine
                  x1={fsOX + fuselage.wingMountXStartMm * fuseScale}
                  y1={ftOY - ftMaxW / 2}
                  x2={fsOX + fuselage.wingMountXStartMm * fuseScale}
                  y2={ftOY + ftMaxW / 2}
                  offset={-30}
                  orientation="vertical"
                  measuredValueMm={fuselage.maxCabinWidthMm}
                  unit={unit}
                  labelPrefix="WIDTH: "
                  color={primaryColor}
                />
              </g>

              {/* ==================================================== */}
              {/* 6. VIEW 6: HORIZONTAL STABILIZER TOP VIEW */}
              {/* ==================================================== */}
              <g id="sheet-view-h-stab">
                <text x="1480" y="515" fill={primaryColor} fontSize="14" fontFamily="monospace" fontWeight="bold">
                  VIEW F-F: HORIZONTAL STABILIZER & ELEVATOR
                </text>
                <polygon
                  points={`${hCX - hHalfS},${hCY - hCRoot / 2 + hSweep} ${hCX},${hCY - hCRoot / 2} ${hCX + hHalfS},${hCY - hCRoot / 2 + hSweep} ${hCX + hHalfS},${hCY + hCRoot / 2} ${hCX - hHalfS},${hCY + hCRoot / 2}`}
                  fill={isBlueprint ? 'rgba(56, 189, 248, 0.08)' : 'rgba(37, 99, 235, 0.05)'}
                  stroke={primaryColor}
                  strokeWidth="2.2"
                />
                {/* Elevator highlight */}
                <rect
                  x={hCX - hHalfS}
                  y={hCY + hCRoot / 2 - hElevChord}
                  width={hHalfS * 2}
                  height={hElevChord}
                  fill="url(#controlSurfaceHatch)"
                  stroke={controlSurfaceColor}
                  strokeWidth="1.8"
                  strokeDasharray="4,2"
                />
                <DimensionLine
                  x1={hCX - hHalfS}
                  y1={hCY - hCRoot / 2}
                  x2={hCX + hHalfS}
                  y2={hCY - hCRoot / 2}
                  offset={-30}
                  orientation="horizontal"
                  measuredValueMm={horizontalStabilizer.spanMm}
                  unit={unit}
                  labelPrefix="STAB SPAN: "
                  color={primaryColor}
                />
              </g>

              {/* ==================================================== */}
              {/* 7. VIEW 7: VERTICAL STABILIZER & RUDDER */}
              {/* ==================================================== */}
              <g id="sheet-view-v-stab">
                <text x="1480" y="925" fill={primaryColor} fontSize="14" fontFamily="monospace" fontWeight="bold">
                  VIEW G-G: VERTICAL STABILIZER & RUDDER
                </text>
                <polygon
                  points={`${vOX},${vOY} ${vOX + vSweep},${vOY - vH} ${vOX + vSweep + vCTip},${vOY - vH} ${vOX + vCRoot},${vOY}`}
                  fill={isBlueprint ? 'rgba(56, 189, 248, 0.08)' : 'rgba(37, 99, 235, 0.05)'}
                  stroke={primaryColor}
                  strokeWidth="2.2"
                />
                {/* Rudder section */}
                <polygon
                  points={`${vOX + vCRoot - vRudChord},${vOY} ${vOX + vSweep + vCTip - vRudChord * 0.6},${vOY - vH} ${vOX + vSweep + vCTip},${vOY - vH} ${vOX + vCRoot},${vOY}`}
                  fill="url(#controlSurfaceHatch)"
                  stroke={controlSurfaceColor}
                  strokeWidth="1.8"
                />
                <DimensionLine
                  x1={vOX}
                  y1={vOY}
                  x2={vOX}
                  y2={vOY - vH}
                  offset={-30}
                  orientation="vertical"
                  measuredValueMm={verticalStabilizer.heightMm}
                  unit={unit}
                  labelPrefix="FIN HEIGHT: "
                  color={primaryColor}
                />
              </g>

              {/* ==================================================== */}
              {/* AEROSPACE TITLE BLOCK (BOTTOM RIGHT CORNER) */}
              {/* ==================================================== */}
              <g id="title-block" transform="translate(1820, 1260)">
                {/* Title Block Box */}
                <rect x="0" y="0" width="525" height="285" fill={isBlueprint ? '#091e3a' : '#f1f5f9'} stroke={primaryColor} strokeWidth="3" />
                <line x1="0" y1="55" x2="525" y2="55" stroke={primaryColor} strokeWidth="1.5" />
                <line x1="0" y1="110" x2="525" y2="110" stroke={primaryColor} strokeWidth="1.5" />
                <line x1="0" y1="180" x2="525" y2="180" stroke={primaryColor} strokeWidth="1.5" />
                <line x1="0" y1="230" x2="525" y2="230" stroke={primaryColor} strokeWidth="1.5" />

                <line x1="260" y1="55" x2="260" y2="180" stroke={primaryColor} strokeWidth="1.5" />
                <line x1="390" y1="110" x2="390" y2="180" stroke={primaryColor} strokeWidth="1.5" />
                <line x1="130" y1="180" x2="130" y2="230" stroke={primaryColor} strokeWidth="1.5" />
                <line x1="260" y1="180" x2="260" y2="230" stroke={primaryColor} strokeWidth="1.5" />
                <line x1="390" y1="180" x2="390" y2="230" stroke={primaryColor} strokeWidth="1.5" />

                {/* Company / App Name */}
                <text x="262" y="32" textAnchor="middle" fill={primaryColor} fontSize="17" fontFamily="sans-serif" fontWeight="900" letterSpacing="0.1em">
                  AERO DESIGN STUDIO
                </text>
                <text x="262" y="48" textAnchor="middle" fill={accentColor} fontSize="10" fontFamily="sans-serif">
                  PRELIMINARY RC TRAINER DESIGN SYSTEM
                </text>

                {/* Project Title */}
                <text x="12" y="75" fill={primaryColor} fontSize="8" fontFamily="monospace">PROJECT / MODEL:</text>
                <text x="12" y="96" fill={primaryColor} fontSize="13" fontFamily="sans-serif" fontWeight="bold">
                  RC TRAINER MK-1 ({formatDimension(b, unit, 0)})
                </text>

                <text x="272" y="75" fill={primaryColor} fontSize="8" fontFamily="monospace">DRAWING NO:</text>
                <text x="272" y="96" fill={primaryColor} fontSize="13" fontFamily="monospace" fontWeight="bold">
                  ADS-RCT-2026-001
                </text>

                {/* Engineering Sizing Row */}
                <text x="12" y="128" fill={primaryColor} fontSize="8" fontFamily="monospace">WING AREA / AR:</text>
                <text x="12" y="148" fill={primaryColor} fontSize="11" fontFamily="monospace" fontWeight="bold">
                  {formatArea(wing.wingAreaMm2, unit)} | AR {wing.aspectRatio.toFixed(1)}
                </text>

                <text x="272" y="128" fill={primaryColor} fontSize="8" fontFamily="monospace">TAIL VOLUMES:</text>
                <text x="272" y="148" fill={primaryColor} fontSize="11" fontFamily="monospace" fontWeight="bold">
                  Vh={horizontalStabilizer.volumeCoefficientActual} | Vv={verticalStabilizer.volumeCoefficientActual}
                </text>

                <text x="402" y="128" fill={primaryColor} fontSize="8" fontFamily="monospace">STALL SPEED:</text>
                <text x="402" y="148" fill={primaryColor} fontSize="11" fontFamily="monospace" fontWeight="bold">
                  {performance.stallSpeedKmh} km/h ({performance.stallSpeedMph} mph)
                </text>

                {/* Drawing metadata */}
                <text x="12" y="196" fill={primaryColor} fontSize="8" fontFamily="monospace">UNITS:</text>
                <text x="12" y="214" fill={primaryColor} fontSize="11" fontFamily="monospace" fontWeight="bold">
                  {unit.toUpperCase()} (mm BASE)
                </text>

                <text x="142" y="196" fill={primaryColor} fontSize="8" fontFamily="monospace">DATE:</text>
                <text x="142" y="214" fill={primaryColor} fontSize="11" fontFamily="monospace" fontWeight="bold">
                  2026-11-09
                </text>

                <text x="272" y="196" fill={primaryColor} fontSize="8" fontFamily="monospace">REVISION:</text>
                <text x="272" y="214" fill={primaryColor} fontSize="11" fontFamily="monospace" fontWeight="bold">
                  REV 1.0 (PROD)
                </text>

                <text x="402" y="196" fill={primaryColor} fontSize="8" fontFamily="monospace">DRAWN BY:</text>
                <text x="402" y="214" fill={primaryColor} fontSize="11" fontFamily="monospace" fontWeight="bold">
                  AERO CAD ENG
                </text>

                {/* Disclaimer banner */}
                <text x="262" y="255" textAnchor="middle" fill={primaryColor} fontSize="8" fontFamily="sans-serif">
                  * PRELIMINARY GEOMETRIC SIZING SPECIFICATION. VERIFY CG AND CONTROL DEFLECTIONS BEFORE MAIDEN FLIGHT.
                </text>
                <text x="262" y="270" textAnchor="middle" fill={accentColor} fontSize="8" fontFamily="sans-serif">
                  CONFIDENTIAL & PROPRIETARY – AERO DESIGN STUDIO
                </text>
              </g>
            </g>
          );
        }}
      </TechnicalSvgViewer>
    </div>
  );
};
