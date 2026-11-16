// Reference Image Calibration & Alignment Modal
// Allows uploading reference drawings, picking 2 points, setting physical dimension, and synthesizing parameters

import React, { useState, useRef } from 'react';
import { Upload, X, Ruler, CheckCircle, Sliders, RefreshCw, Eye } from 'lucide-react';
import { ReferenceImage, UnitType } from '../../types/aircraft';
import { calculateImageScale } from '../../engine/referenceProcessor';
import { mmToUnit, unitToMm } from '../../engine/units';

interface ReferenceImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  componentTitle: string;
  componentType: string;
  currentReference?: ReferenceImage;
  onSaveReference: (ref: ReferenceImage) => void;
  onSynthesize?: (ref: ReferenceImage) => void;
  unit: UnitType;
  defaultKnownDimensionMm?: number;
}

export const ReferenceImageModal: React.FC<ReferenceImageModalProps> = ({
  isOpen,
  onClose,
  componentTitle,
  componentType,
  currentReference,
  onSaveReference,
  onSynthesize,
  unit,
  defaultKnownDimensionMm = 900
}) => {
  const [imageSrc, setImageSrc] = useState<string | null>(currentReference?.dataUrl || null);
  const [imgDimensions, setImgDimensions] = useState<{ width: number; height: number }>({
    width: currentReference?.width || 800,
    height: currentReference?.height || 500
  });

  const [pointA, setPointA] = useState<{ x: number; y: number } | null>(currentReference?.pointA || null);
  const [pointB, setPointB] = useState<{ x: number; y: number } | null>(currentReference?.pointB || null);
  const [isCalibrating, setIsCalibrating] = useState<boolean>(false);

  const initialKnownUnitVal = currentReference?.referenceLengthMm
    ? mmToUnit(currentReference.referenceLengthMm, unit)
    : mmToUnit(defaultKnownDimensionMm, unit);

  const [knownDistance, setKnownDistance] = useState<string>(initialKnownUnitVal.toFixed(1));
  const [opacity, setOpacity] = useState<number>(currentReference?.opacity ?? 0.6);
  const [rotation, setRotation] = useState<number>(currentReference?.rotation ?? 0);
  const [notes, setNotes] = useState<string>(currentReference?.notes || '');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setImageSrc(result);

      // Extract image size
      const img = new Image();
      img.onload = () => {
        setImgDimensions({ width: img.naturalWidth, height: img.naturalHeight });
        // Set default calibration points across 80% of width
        setPointA({ x: Math.round(img.naturalWidth * 0.1), y: Math.round(img.naturalHeight * 0.5) });
        setPointB({ x: Math.round(img.naturalWidth * 0.9), y: Math.round(img.naturalHeight * 0.5) });
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  };

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isCalibrating || !imageContainerRef.current) return;
    const rect = imageContainerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Convert display pixels to natural image coordinates
    const scaleX = imgDimensions.width / rect.width;
    const scaleY = imgDimensions.height / rect.height;

    const natX = Math.round(clickX * scaleX);
    const natY = Math.round(clickY * scaleY);

    if (!pointA || (pointA && pointB)) {
      setPointA({ x: natX, y: natY });
      setPointB(null);
    } else {
      setPointB({ x: natX, y: natY });
      setIsCalibrating(false);
    }
  };

  const calculateCalibration = () => {
    if (!pointA || !pointB) return null;
    const distVal = parseFloat(knownDistance);
    if (isNaN(distVal) || distVal <= 0) return null;
    return calculateImageScale(pointA, pointB, distVal, unit);
  };

  const calibration = calculateCalibration();

  const handleSave = () => {
    if (!imageSrc) return;
    const distVal = parseFloat(knownDistance);
    const realMm = isNaN(distVal) ? defaultKnownDimensionMm : unitToMm(distVal, unit);

    const refData: ReferenceImage = {
      id: currentReference?.id || `ref-${Date.now()}`,
      component: componentType,
      name: `${componentTitle} Reference`,
      dataUrl: imageSrc,
      width: imgDimensions.width,
      height: imgDimensions.height,
      pointA: pointA || undefined,
      pointB: pointB || undefined,
      referenceLengthMm: realMm,
      calibratedScale: calibration?.scalePxPerMm,
      opacity,
      rotation,
      offsetX: 0,
      offsetY: 0,
      notes
    };

    onSaveReference(refData);
    if (onSynthesize) {
      onSynthesize(refData);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-700 text-slate-100 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
          <div>
            <h2 className="text-lg font-bold text-sky-400">
              {componentTitle} – Reference Image Calibration
            </h2>
            <p className="text-xs text-slate-400">
              Upload reference drawings to establish proportions and synthesize original engineering geometry
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Upload Button or Image Viewer */}
          {!imageSrc ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-700 hover:border-sky-500 rounded-xl p-12 text-center cursor-pointer transition bg-slate-800/40 hover:bg-slate-800/60"
            >
              <Upload className="w-12 h-12 text-sky-400 mx-auto mb-3" />
              <h4 className="font-semibold text-base mb-1">Click to Upload Reference Image</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Supports PNG, JPG, technical plan sketches, or photograph of {componentTitle.toLowerCase()}.
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/webp"
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Image Preview Canvas with interactive calibration markers */}
              <div className="relative border border-slate-700 rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center min-h-[340px]">
                <div
                  ref={imageContainerRef}
                  onClick={handleImageClick}
                  className={`relative max-w-full max-h-[420px] select-none ${
                    isCalibrating ? 'cursor-crosshair' : 'cursor-default'
                  }`}
                  style={{
                    transform: `rotate(${rotation}deg)`,
                    opacity
                  }}
                >
                  <img
                    src={imageSrc}
                    alt="Reference"
                    className="max-h-[420px] object-contain rounded"
                  />

                  {/* Calibration overlay line and points */}
                  {pointA && pointB && imageContainerRef.current && (
                    <svg className="absolute inset-0 w-full h-full pointer-events-none">
                      {/* Scaled coordinates for SVG overlay */}
                      <line
                        x1={`${(pointA.x / imgDimensions.width) * 100}%`}
                        y1={`${(pointA.y / imgDimensions.height) * 100}%`}
                        x2={`${(pointB.x / imgDimensions.width) * 100}%`}
                        y2={`${(pointB.y / imgDimensions.height) * 100}%`}
                        stroke="#38bdf8"
                        strokeWidth="3"
                        strokeDasharray="6,3"
                      />
                      <circle
                        cx={`${(pointA.x / imgDimensions.width) * 100}%`}
                        cy={`${(pointA.y / imgDimensions.height) * 100}%`}
                        r="6"
                        fill="#0284c7"
                        stroke="#ffffff"
                        strokeWidth="2"
                      />
                      <circle
                        cx={`${(pointB.x / imgDimensions.width) * 100}%`}
                        cy={`${(pointB.y / imgDimensions.height) * 100}%`}
                        r="6"
                        fill="#0284c7"
                        stroke="#ffffff"
                        strokeWidth="2"
                      />
                    </svg>
                  )}
                </div>

                {/* Replace image button */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute top-3 right-3 px-3 py-1.5 bg-slate-900/80 hover:bg-slate-800 text-xs border border-slate-700 rounded-lg backdrop-blur flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Replace Image
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </div>

              {/* Calibration Controls */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950/70 p-4 rounded-xl border border-slate-800">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
                      <Ruler className="w-4 h-4" />
                      1. Calibration Scale
                    </span>
                    <button
                      onClick={() => {
                        setIsCalibrating(true);
                        setPointA(null);
                        setPointB(null);
                      }}
                      className={`text-xs px-2.5 py-1 rounded border transition ${
                        isCalibrating
                          ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                          : 'bg-slate-800 hover:bg-slate-700 border-slate-600 text-slate-200'
                      }`}
                    >
                      {isCalibrating ? 'Click 2 Points on Image' : 'Pick Points on Image'}
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="text-xs text-slate-300 whitespace-nowrap">
                      Known Distance ({unit}):
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={knownDistance}
                      onChange={(e) => setKnownDistance(e.target.value)}
                      className="w-28 px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded text-sky-300 font-mono focus:border-sky-500 outline-none"
                    />
                    <span className="text-xs text-slate-400">{unit}</span>
                  </div>

                  {calibration && (
                    <div className="text-[11px] text-emerald-400 flex items-center gap-1.5 font-mono">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Scale: {calibration.scalePxPerMm.toFixed(3)} px/mm ({calibration.realDistanceMm.toFixed(0)} mm)
                    </div>
                  )}
                </div>

                {/* Visual Adjustments */}
                <div className="space-y-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Sliders className="w-4 h-4" />
                    2. Display & Alignment
                  </span>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <div className="flex justify-between text-slate-400 mb-1">
                        <span>Opacity</span>
                        <span>{Math.round(opacity * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0.1"
                        max="1.0"
                        step="0.05"
                        value={opacity}
                        onChange={(e) => setOpacity(parseFloat(e.target.value))}
                        className="w-full accent-sky-400"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-slate-400 mb-1">
                        <span>Rotation</span>
                        <span>{rotation}°</span>
                      </div>
                      <input
                        type="range"
                        min="-180"
                        max="180"
                        step="1"
                        value={rotation}
                        onChange={(e) => setRotation(parseInt(e.target.value))}
                        className="w-full accent-sky-400"
                      />
                    </div>
                  </div>

                  <div>
                    <input
                      type="text"
                      placeholder="Notes on reference design (e.g. cabin taper, dihedral shape)..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full px-2.5 py-1 text-xs bg-slate-900 border border-slate-700 rounded text-slate-300 placeholder-slate-500 focus:border-sky-500 outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950">
          <div className="text-xs text-slate-400">
            * Generated designs are original CAD dimensions synthesized from reference proportions.
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-300"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!imageSrc}
              className="px-5 py-2 text-xs rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-sky-900/40"
            >
              <CheckCircle className="w-4 h-4" />
              Apply & Synthesize Geometry
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
