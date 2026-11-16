// AERO DESIGN STUDIO - RC TRAINER DESIGNER
// Fuselage Design & Reference-Assisted Drawing Generator

import React, { useState } from 'react';
import { CalculatedAircraft, ReferenceImage } from '../types/aircraft';
import { TechnicalSvgViewer } from './common/TechnicalSvgViewer';
import { DimensionLine } from './common/DimensionLine';
import { ReferenceImageModal } from './common/ReferenceImageModal';
import { formatDimension } from '../engine/units';
import { synthesizeFuselageFromReference } from '../engine/referenceProcessor';
import { Upload, Sliders, Image as ImageIcon, CheckCircle, Info } from 'lucide-react';

interface FuselageDesignTabProps {
  aircraft: CalculatedAircraft;
  onUpdateConfig: (updater: (prev: any) => any) => void;
  referenceImages: Record<string, ReferenceImage>;
  onSaveReferenceImage: (ref: ReferenceImage) => void;
}

export const FuselageDesignTab: React.FC<FuselageDesignTabProps> = ({
  aircraft,
  onUpdateConfig,
  referenceImages,
  onSaveReferenceImage
}) => {
  const [activeView, setActiveView] = useState<'top' | 'side'>('side');
  const [modalTarget, setModalTarget] = useState<'fuseTop' | 'fuseSide' | null>(null);

  const { fuselage, wing, config } = aircraft;
  const unit = config.unit;

  const totalLen = fuselage.totalLengthMm;
  const maxW = fuselage.maxCabinWidthMm;
  const maxH = fuselage.maxCabinHeightMm;
  const noseW = fuselage.noseWidthMm;
  const tailW = fuselage.tailWidthMm;
  const noseH = fuselage.noseHeightMm;
  const tailH = fuselage.tailBoomHeightMm;

  // SVG Coordinate Mapping:
  const drawWidth = 1000;
  const drawHeight = 580;
  // Fit total fuselage length into ~780px
  const scale = 780 / totalLen;

  const ox = 110; // Nose firewall X origin
  const topOy = 280; // Centerline Y for Top View
  const sideOy = 390; // Bottom datum baseline Y for Side View

  const sTotalLen = totalLen * scale;
  const sMaxW = maxW * scale;
  const sMaxH = maxH * scale;
  const sNoseW = noseW * scale;
  const sTailW = tailW * scale;
  const sNoseH = noseH * scale;
  const sTailH = tailH * scale;

  const wingStart = ox + fuselage.wingMountXStartMm * scale;
  const wingEnd = ox + fuselage.wingMountXEndMm * scale;
  const hStabMountX = ox + fuselage.horizontalStabMountXMm * scale;
  const vStabMountX = ox + fuselage.verticalStabMountXMm * scale;
  const mainGearX = ox + fuselage.mainGearMountXMm * scale;

  // Top view outline
  const topHalfW = sMaxW / 2;
  const topHalfNoseW = sNoseW / 2;
  const topHalfTailW = sTailW / 2;

  const topUpperPts = [
    `${ox},${topOy - topHalfNoseW}`,
    `${ox + fuselage.noseMomentArmMm * 0.5 * scale},${topOy - topHalfW * 0.9}`,
    `${wingStart},${topOy - topHalfW}`,
    `${wingEnd},${topOy - topHalfW}`,
    `${wingEnd + 70 * scale},${topOy - topHalfW * 0.85}`,
    `${ox + sTotalLen - 30 * scale},${topOy - topHalfTailW}`,
    `${ox + sTotalLen},${topOy - topHalfTailW * 0.8}`
  ];

  const topLowerPts = [
    `${ox + sTotalLen},${topOy + topHalfTailW * 0.8}`,
    `${ox + sTotalLen - 30 * scale},${topOy + topHalfTailW}`,
    `${wingEnd + 70 * scale},${topOy + topHalfW * 0.85}`,
    `${wingEnd},${topOy + topHalfW}`,
    `${wingStart},${topOy + topHalfW}`,
    `${ox + fuselage.noseMomentArmMm * 0.5 * scale},${topOy + topHalfW * 0.9}`,
    `${ox},${topOy + topHalfNoseW}`
  ];

  const topFuselagePath = `M ${topUpperPts.join(' L ')} L ${topLowerPts.join(' L ')} Z`;

  // Side view profile points
  const sideTopPts = [
    `${ox},${sideOy - sNoseH * 0.7}`,
    `${ox + fuselage.noseMomentArmMm * 0.6 * scale},${sideOy - sMaxH * 0.82}`,
    `${wingStart},${sideOy - sMaxH}`,
    `${wingEnd},${sideOy - sMaxH * 0.96}`,
    `${wingEnd + 80 * scale},${sideOy - sMaxH * 0.72}`,
    `${ox + sTotalLen},${sideOy - sTailH}`
  ];

  const sideBottomPts = [
    `${ox + sTotalLen},${sideOy}`,
    `${wingEnd + 80 * scale},${sideOy - sMaxH * 0.15}`,
    `${wingStart},${sideOy - sMaxH * 0.05}`,
    `${ox + fuselage.noseMomentArmMm * 0.4 * scale},${sideOy - sMaxH * 0.1}`,
    `${ox},${sideOy - sNoseH * 0.15}`
  ];

  const sideFuselagePath = `M ${sideTopPts.join(' L ')} L ${sideBottomPts.join(' L ')} Z`;

  // Apply synthesis from reference images
  const handleApplyReferenceSynthesis = () => {
    const synthesized = synthesizeFuselageFromReference(
      config,
      referenceImages['fuseTop'],
      referenceImages['fuseSide']
    );
    onUpdateConfig((prev) => ({
      ...prev,
      ...synthesized
    }));
  };

  return (
    <div className="space-y-6">
      {/* Top Controls & Reference Image Uploader Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-900/60 rounded-xl border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex rounded-lg border border-slate-700 bg-slate-800/80 p-1 text-xs">
            <button
              onClick={() => setActiveView('side')}
              className={`px-3 py-1.5 rounded-md font-medium transition ${
                activeView === 'side' ? 'bg-sky-500 text-slate-950 font-bold shadow' : 'text-slate-300 hover:text-white'
              }`}
            >
              1. Side View Drawing
            </button>
            <button
              onClick={() => setActiveView('top')}
              className={`px-3 py-1.5 rounded-md font-medium transition ${
                activeView === 'top' ? 'bg-sky-500 text-slate-950 font-bold shadow' : 'text-slate-300 hover:text-white'
              }`}
            >
              2. Top View Drawing
            </button>
          </div>
        </div>

        {/* Reference Image Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setModalTarget('fuseSide')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border transition ${
              referenceImages['fuseSide']
                ? 'bg-emerald-950/40 border-emerald-700 text-emerald-300'
                : 'bg-slate-800 hover:bg-slate-700 border-slate-600 text-slate-200'
            }`}
          >
            <Upload className="w-3.5 h-3.5 text-sky-400" />
            {referenceImages['fuseSide'] ? 'Side Reference Active' : 'Upload Side View Ref'}
          </button>

          <button
            onClick={() => setModalTarget('fuseTop')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border transition ${
              referenceImages['fuseTop']
                ? 'bg-emerald-950/40 border-emerald-700 text-emerald-300'
                : 'bg-slate-800 hover:bg-slate-700 border-slate-600 text-slate-200'
            }`}
          >
            <Upload className="w-3.5 h-3.5 text-sky-400" />
            {referenceImages['fuseTop'] ? 'Top Reference Active' : 'Upload Top View Ref'}
          </button>

          {(referenceImages['fuseSide'] || referenceImages['fuseTop']) && (
            <button
              onClick={handleApplyReferenceSynthesis}
              className="px-3 py-1.5 text-xs bg-sky-600 hover:bg-sky-500 text-white rounded-lg font-semibold flex items-center gap-1.5 shadow"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              Synthesize Fuselage
            </button>
          )}
        </div>
      </div>

      {/* VIEW 1: FUSELAGE SIDE VIEW */}
      {activeView === 'side' && (
        <div className="space-y-4">
          <TechnicalSvgViewer
            title="Fuselage – Technical Side View Drawing"
            subtitle={`Overall Length: ${formatDimension(totalLen, unit)} | Max Cabin Height: ${formatDimension(maxH, unit)} | Wing Incidence: +${fuselage.wingIncidenceDeg}°`}
            width={drawWidth}
            height={drawHeight}
            downloadFileName="fuselage-side-view-blueprint"
          >
            {({ primaryColor, accentColor, sparColor, isBlueprint }) => (
              <g id="fuselage-side-drawing">
                {/* Reference Image Overlay (if uploaded & calibrated) */}
                {referenceImages['fuseSide'] && (
                  <image
                    href={referenceImages['fuseSide'].dataUrl}
                    x={ox}
                    y={sideOy - sMaxH}
                    width={sTotalLen}
                    height={sMaxH * 1.2}
                    opacity={referenceImages['fuseSide'].opacity * 0.35}
                    preserveAspectRatio="none"
                  />
                )}

                {/* Horizontal Baseline Datum */}
                <line
                  x1={ox - 40}
                  y1={sideOy}
                  x2={ox + sTotalLen + 40}
                  y2={sideOy}
                  stroke={primaryColor}
                  strokeWidth="1"
                  strokeDasharray="6,4"
                  strokeOpacity="0.4"
                />
                <text
                  x={ox - 35}
                  y={sideOy + 16}
                  fill={primaryColor}
                  fontSize="9"
                  fontFamily="monospace"
                >
                  FUSELAGE DATUM LINE (FDL)
                </text>

                {/* Main Fuselage Body Outline */}
                <path
                  d={sideFuselagePath}
                  fill={isBlueprint ? 'rgba(56, 189, 248, 0.08)' : 'rgba(37, 99, 235, 0.05)'}
                  stroke={primaryColor}
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                />

                {/* Cockpit / Windshield Profile */}
                <polygon
                  points={`${ox + fuselage.noseMomentArmMm * 0.7 * scale},${sideOy - sMaxH * 0.8} ${wingStart},${sideOy - sMaxH} ${wingStart},${sideOy - sMaxH * 0.6} ${ox + fuselage.noseMomentArmMm * 0.7 * scale},${sideOy - sMaxH * 0.6}`}
                  fill={isBlueprint ? 'rgba(56, 189, 248, 0.25)' : 'rgba(37, 99, 235, 0.2)'}
                  stroke={accentColor}
                  strokeWidth="1.5"
                />
                <text
                  x={ox + fuselage.noseMomentArmMm * 0.85 * scale}
                  y={sideOy - sMaxH * 0.68}
                  fill={accentColor}
                  fontSize="8"
                  fontFamily="monospace"
                  textAnchor="middle"
                  fontWeight="bold"
                >
                  CABIN / COCKPIT
                </text>

                {/* Wing Mounting Seat (High-wing position at +1.5 deg incidence) */}
                <line
                  x1={wingStart}
                  y1={sideOy - sMaxH}
                  x2={wingEnd}
                  y2={sideOy - sMaxH * 0.96}
                  stroke="#10b981"
                  strokeWidth="3.5"
                />
                <text
                  x={(wingStart + wingEnd) / 2}
                  y={sideOy - sMaxH - 8}
                  textAnchor="middle"
                  fill="#10b981"
                  fontSize="9"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  WING SADDLE (+{fuselage.wingIncidenceDeg}° INCIDENCE)
                </text>

                {/* Engine Firewall & Down-Thrust Vector */}
                <line
                  x1={ox}
                  y1={sideOy - sNoseH * 0.7}
                  x2={ox}
                  y2={sideOy - sNoseH * 0.15}
                  stroke={sparColor}
                  strokeWidth="3"
                />
                <line
                  x1={ox - 35}
                  y1={sideOy - sNoseH * 0.42 + 2}
                  x2={ox + 5}
                  y2={sideOy - sNoseH * 0.42 - 2}
                  stroke={sparColor}
                  strokeWidth="1.8"
                  strokeDasharray="4,2"
                />
                <text
                  x={ox - 5}
                  y={sideOy - sNoseH * 0.42 - 12}
                  fill={sparColor}
                  fontSize="8"
                  fontFamily="monospace"
                  textAnchor="end"
                  fontWeight="bold"
                >
                  MOTOR FIREWALL (2° DOWN-THRUST)
                </text>

                {/* Tail Mounting Stations */}
                {/* Horizontal Stabilizer Seat */}
                <line
                  x1={hStabMountX}
                  y1={sideOy - sTailH}
                  x2={ox + sTotalLen}
                  y2={sideOy - sTailH}
                  stroke="#f59e0b"
                  strokeWidth="3"
                />
                <text
                  x={hStabMountX + 20}
                  y={sideOy - sTailH - 6}
                  fill="#f59e0b"
                  fontSize="8"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  H-STAB SEAT
                </text>

                {/* Landing Gear Mount & Strut */}
                <line
                  x1={mainGearX}
                  y1={sideOy - sMaxH * 0.05}
                  x2={mainGearX}
                  y2={sideOy + fuselage.mainGearHeightMm * scale}
                  stroke={primaryColor}
                  strokeWidth="2.5"
                />
                {/* Wheel */}
                <circle
                  cx={mainGearX}
                  cy={sideOy + fuselage.mainGearHeightMm * scale}
                  r={(fuselage.wheelDiameterMm / 2) * scale}
                  fill={isBlueprint ? '#0f172a' : '#334155'}
                  stroke={primaryColor}
                  strokeWidth="2"
                />
                <text
                  x={mainGearX + 15}
                  y={sideOy + fuselage.mainGearHeightMm * scale + 4}
                  fill={primaryColor}
                  fontSize="8"
                  fontFamily="monospace"
                >
                  MAIN GEAR
                </text>

                {/* DIMENSION LINES */}
                {/* Total Length */}
                <DimensionLine
                  x1={ox}
                  y1={sideOy - sMaxH}
                  x2={ox + sTotalLen}
                  y2={sideOy - sMaxH}
                  offset={-40}
                  orientation="horizontal"
                  measuredValueMm={totalLen}
                  unit={unit}
                  labelPrefix="OVERALL LENGTH: "
                  color={primaryColor}
                />

                {/* Max Cabin Height */}
                <DimensionLine
                  x1={wingStart}
                  y1={sideOy}
                  x2={wingStart}
                  y2={sideOy - sMaxH}
                  offset={-55}
                  orientation="vertical"
                  measuredValueMm={maxH}
                  unit={unit}
                  labelPrefix="CABIN HEIGHT: "
                  color={primaryColor}
                />

                {/* Nose Firewall Height */}
                <DimensionLine
                  x1={ox}
                  y1={sideOy - sNoseH * 0.7}
                  x2={ox}
                  y2={sideOy - sNoseH * 0.15}
                  offset={-25}
                  orientation="vertical"
                  measuredValueMm={noseH}
                  unit={unit}
                  labelPrefix="NOSE HT: "
                  color={primaryColor}
                />

                {/* Tail Boom Height */}
                <DimensionLine
                  x1={ox + sTotalLen}
                  y1={sideOy}
                  x2={ox + sTotalLen}
                  y2={sideOy - sTailH}
                  offset={25}
                  orientation="vertical"
                  measuredValueMm={tailH}
                  unit={unit}
                  labelPrefix="TAIL HT: "
                  color={primaryColor}
                />

                {/* Nose Moment Arm */}
                <DimensionLine
                  x1={ox}
                  y1={sideOy}
                  x2={wingStart}
                  y2={sideOy}
                  offset={35}
                  orientation="horizontal"
                  measuredValueMm={fuselage.noseMomentArmMm}
                  unit={unit}
                  labelPrefix="NOSE ARM: "
                  color={primaryColor}
                />
              </g>
            )}
          </TechnicalSvgViewer>
        </div>
      )}

      {/* VIEW 2: FUSELAGE TOP VIEW */}
      {activeView === 'top' && (
        <div className="space-y-4">
          <TechnicalSvgViewer
            title="Fuselage – Technical Top View Drawing"
            subtitle={`Overall Length: ${formatDimension(totalLen, unit)} | Max Cabin Width: ${formatDimension(maxW, unit)} | Nose Width: ${formatDimension(noseW, unit)}`}
            width={drawWidth}
            height={drawHeight}
            downloadFileName="fuselage-top-view-blueprint"
          >
            {({ primaryColor, accentColor, sparColor, isBlueprint }) => (
              <g id="fuselage-top-drawing">
                {/* Centerline */}
                <line
                  x1={ox - 40}
                  y1={topOy}
                  x2={ox + sTotalLen + 40}
                  y2={topOy}
                  stroke={sparColor}
                  strokeWidth="1"
                  strokeDasharray="16,4,4,4"
                  strokeOpacity="0.75"
                />
                <text
                  x={ox - 35}
                  y={topOy - 8}
                  fill={sparColor}
                  fontSize="9"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  CL (THRUST LINE)
                </text>

                {/* Fuselage Top Outline */}
                <path
                  d={topFuselagePath}
                  fill={isBlueprint ? 'rgba(56, 189, 248, 0.08)' : 'rgba(37, 99, 235, 0.05)'}
                  stroke={primaryColor}
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                />

                {/* Wing Mounting Area Outline (Cabin Saddle) */}
                <rect
                  x={wingStart}
                  y={topOy - topHalfW}
                  width={wingEnd - wingStart}
                  height={sMaxW}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="1.8"
                  strokeDasharray="4,2"
                />
                <text
                  x={(wingStart + wingEnd) / 2}
                  y={topOy}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="#10b981"
                  fontSize="9"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  WING SADDLE ZONE
                </text>

                {/* Cockpit Hatch Outline */}
                <rect
                  x={ox + fuselage.noseMomentArmMm * 0.6 * scale}
                  y={topOy - topHalfW * 0.7}
                  width={fuselage.noseMomentArmMm * 0.35 * scale}
                  height={sMaxW * 0.7}
                  fill="none"
                  stroke={accentColor}
                  strokeWidth="1.2"
                />

                {/* DIMENSION LINES */}
                {/* Total Length */}
                <DimensionLine
                  x1={ox}
                  y1={topOy - topHalfW}
                  x2={ox + sTotalLen}
                  y2={topOy - topHalfW}
                  offset={-50}
                  orientation="horizontal"
                  measuredValueMm={totalLen}
                  unit={unit}
                  labelPrefix="TOTAL LENGTH: "
                  color={primaryColor}
                />

                {/* Maximum Cabin Width */}
                <DimensionLine
                  x1={wingStart}
                  y1={topOy - topHalfW}
                  x2={wingStart}
                  y2={topOy + topHalfW}
                  offset={-40}
                  orientation="vertical"
                  measuredValueMm={maxW}
                  unit={unit}
                  labelPrefix="MAX WIDTH: "
                  color={primaryColor}
                />

                {/* Nose Width */}
                <DimensionLine
                  x1={ox}
                  y1={topOy - topHalfNoseW}
                  x2={ox}
                  y2={topOy + topHalfNoseW}
                  offset={-25}
                  orientation="vertical"
                  measuredValueMm={noseW}
                  unit={unit}
                  labelPrefix="NOSE WIDTH: "
                  color={primaryColor}
                />

                {/* Tail Boom Width */}
                <DimensionLine
                  x1={ox + sTotalLen}
                  y1={topOy - topHalfTailW}
                  x2={ox + sTotalLen}
                  y2={topOy + topHalfTailW}
                  offset={35}
                  orientation="vertical"
                  measuredValueMm={tailW}
                  unit={unit}
                  labelPrefix="TAIL WIDTH: "
                  color={primaryColor}
                />
              </g>
            )}
          </TechnicalSvgViewer>
        </div>
      )}

      {/* Engineering Design Note */}
      <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-2">
        <h4 className="font-semibold text-sky-400 flex items-center gap-1.5">
          <Info className="w-4 h-4" />
          Fuselage Engineering & Proportions
        </h4>
        <p>
          The fuselage length ({formatDimension(totalLen, unit)}) is sized at {Math.round(config.fuselageLengthRatio * 100)}% of the wingspan.
          This ensures proper pitch stability and moment arms for standard RC trainer flight characteristics.
        </p>
      </div>

      {/* Reference Image Modals */}
      {modalTarget === 'fuseSide' && (
        <ReferenceImageModal
          isOpen={true}
          onClose={() => setModalTarget(null)}
          componentTitle="Fuselage Side View"
          componentType="fuseSide"
          currentReference={referenceImages['fuseSide']}
          onSaveReference={onSaveReferenceImage}
          unit={unit}
          defaultKnownDimensionMm={totalLen}
        />
      )}

      {modalTarget === 'fuseTop' && (
        <ReferenceImageModal
          isOpen={true}
          onClose={() => setModalTarget(null)}
          componentTitle="Fuselage Top View"
          componentType="fuseTop"
          currentReference={referenceImages['fuseTop']}
          onSaveReference={onSaveReferenceImage}
          unit={unit}
          defaultKnownDimensionMm={totalLen}
        />
      )}
    </div>
  );
};
