// Technical Engineering SVG Viewer Component
// Features: Pan & Zoom, Blueprint vs CAD Light theme, Grid toggle, Centerlines, SVG download

import React, { useState, useRef, useEffect } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Maximize2, Download, Grid, Layers } from 'lucide-react';
import { BlueprintTheme } from '../../types/aircraft';

interface TechnicalSvgViewerProps {
  title: string;
  subtitle?: string;
  theme?: BlueprintTheme;
  onThemeChange?: (theme: BlueprintTheme) => void;
  width?: number; // viewBox width
  height?: number; // viewBox height
  children: (props: {
    theme: BlueprintTheme;
    isBlueprint: boolean;
    primaryColor: string;
    accentColor: string;
    controlSurfaceColor: string;
    sparColor: string;
    gridColor: string;
    textColor: string;
  }) => React.ReactNode;
  allowDownloadSvg?: boolean;
  downloadFileName?: string;
}

export const TechnicalSvgViewer: React.FC<TechnicalSvgViewerProps> = ({
  title,
  subtitle,
  theme: controlledTheme,
  onThemeChange,
  width = 1000,
  height = 650,
  children,
  allowDownloadSvg = true,
  downloadFileName = 'technical-drawing'
}) => {
  const [internalTheme, setInternalTheme] = useState<BlueprintTheme>('blueprint');
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const theme = controlledTheme || internalTheme;
  const isBlueprint = theme === 'blueprint';

  const handleThemeToggle = () => {
    const nextTheme: BlueprintTheme = isBlueprint ? 'cad-white' : 'blueprint';
    if (onThemeChange) onThemeChange(nextTheme);
    else setInternalTheme(nextTheme);
  };

  const handleZoom = (factor: number) => {
    setZoom((prev) => Math.max(0.3, Math.min(5, prev * factor)));
  };

  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Left mouse only
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.1 : 0.9;
    handleZoom(factor);
  };

  const handleDownloadSvg = () => {
    if (!svgRef.current) return;
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svgRef.current);
    const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${downloadFileName}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Color schemes
  const colors = isBlueprint
    ? {
        primaryColor: '#38bdf8', // Cyan 400
        accentColor: '#60a5fa', // Blue 400
        controlSurfaceColor: '#fbbf24', // Amber 400
        sparColor: '#ec4899', // Pink 500
        gridColor: '#0369a1', // Sky 700
        textColor: '#f8fafc', // Slate 50
        bgClass: 'bg-[#0a192f] text-slate-100 border-sky-900',
        dimBg: '#0a192f'
      }
    : {
        primaryColor: '#0f172a', // Slate 900
        accentColor: '#2563eb', // Blue 600
        controlSurfaceColor: '#d97706', // Amber 600
        sparColor: '#be185d', // Pink 700
        gridColor: '#e2e8f0', // Slate 200
        textColor: '#0f172a', // Slate 900
        bgClass: 'bg-white text-slate-900 border-slate-300 shadow-sm',
        dimBg: '#ffffff'
      };

  return (
    <div className={`relative flex flex-col rounded-xl border overflow-hidden transition-colors duration-200 ${colors.bgClass}`}>
      {/* Header bar */}
      <div className={`flex flex-wrap items-center justify-between px-4 py-2.5 border-b ${
        isBlueprint ? 'border-sky-950/80 bg-slate-950/60' : 'border-slate-200 bg-slate-50/80'
      }`}>
        <div className="flex items-center gap-2">
          <Layers className={`w-4 h-4 ${isBlueprint ? 'text-sky-400' : 'text-blue-600'}`} />
          <div>
            <h3 className="font-semibold text-sm tracking-wide uppercase">{title}</h3>
            {subtitle && <p className="text-xs opacity-70">{subtitle}</p>}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 text-xs">
          {/* Zoom controls */}
          <div className={`flex items-center rounded-lg border p-0.5 ${
            isBlueprint ? 'border-sky-900/60 bg-sky-950/40' : 'border-slate-200 bg-white'
          }`}>
            <button
              onClick={() => handleZoom(1.15)}
              className="p-1.5 hover:opacity-80 rounded"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <span className="px-1.5 text-[11px] font-mono opacity-80 min-w-[42px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => handleZoom(0.85)}
              className="p-1.5 hover:opacity-80 rounded"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleReset}
              className="p-1.5 hover:opacity-80 rounded"
              title="Reset View"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Grid toggle */}
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border transition ${
              showGrid
                ? isBlueprint
                  ? 'bg-sky-500/20 border-sky-400/50 text-sky-200'
                  : 'bg-blue-50 border-blue-300 text-blue-700'
                : isBlueprint
                ? 'border-sky-900/60 opacity-60 hover:opacity-100'
                : 'border-slate-200 opacity-60 hover:opacity-100'
            }`}
            title="Toggle Engineering Grid"
          >
            <Grid className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Grid</span>
          </button>

          {/* Theme switcher */}
          <button
            onClick={handleThemeToggle}
            className={`px-2.5 py-1.5 rounded-lg border transition ${
              isBlueprint
                ? 'border-sky-800 bg-sky-950 text-sky-300 hover:bg-sky-900'
                : 'border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
            title="Switch Blueprint / CAD Light Theme"
          >
            {isBlueprint ? 'Blueprint' : 'CAD White'}
          </button>

          {/* SVG Download */}
          {allowDownloadSvg && (
            <button
              onClick={handleDownloadSvg}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border transition ${
                isBlueprint
                  ? 'border-sky-700 bg-sky-900/60 hover:bg-sky-800 text-sky-200'
                  : 'border-blue-200 bg-blue-600 hover:bg-blue-700 text-white'
              }`}
              title="Download SVG Drawing"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">SVG</span>
            </button>
          )}
        </div>
      </div>

      {/* SVG Canvas Area */}
      <div
        ref={containerRef}
        className={`w-full h-[520px] overflow-hidden cursor-grab active:cursor-grabbing select-none relative ${
          isBlueprint ? 'bg-[#071322]' : 'bg-[#fafafa]'
        }`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        style={{ '--dim-bg': colors.dimBg } as React.CSSProperties}
      >
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Grid Pattern */}
            <pattern
              id={`grid-minor-${title.replace(/\s+/g, '-')}`}
              width="20"
              height="20"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 20 0 L 0 0 0 20"
                fill="none"
                stroke={colors.gridColor}
                strokeWidth="0.5"
                strokeOpacity={isBlueprint ? '0.2' : '0.4'}
              />
            </pattern>
            <pattern
              id={`grid-major-${title.replace(/\s+/g, '-')}`}
              width="100"
              height="100"
              patternUnits="userSpaceOnUse"
            >
              <rect
                width="100"
                height="100"
                fill={`url(#grid-minor-${title.replace(/\s+/g, '-')})`}
              />
              <path
                d="M 100 0 L 0 0 0 100"
                fill="none"
                stroke={colors.gridColor}
                strokeWidth="1.0"
                strokeOpacity={isBlueprint ? '0.4' : '0.7'}
              />
            </pattern>

            {/* Linear Gradient for Control Surface Highlight */}
            <linearGradient id="controlSurfaceHatch" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={colors.controlSurfaceColor} stopOpacity="0.25" />
              <stop offset="100%" stopColor={colors.controlSurfaceColor} stopOpacity="0.08" />
            </linearGradient>
          </defs>

          {/* Background Grid */}
          {showGrid && (
            <rect
              width="100%"
              height="100%"
              fill={`url(#grid-major-${title.replace(/\s+/g, '-')})`}
            />
          )}

          {/* Interactive Transform Group */}
          <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
            {children({
              theme,
              isBlueprint,
              primaryColor: colors.primaryColor,
              accentColor: colors.accentColor,
              controlSurfaceColor: colors.controlSurfaceColor,
              sparColor: colors.sparColor,
              gridColor: colors.gridColor,
              textColor: colors.textColor
            })}
          </g>
        </svg>

        {/* Scale & Pan HUD indicator at bottom right */}
        <div className={`absolute bottom-3 right-3 text-[10px] font-mono px-2 py-1 rounded backdrop-blur border pointer-events-none ${
          isBlueprint
            ? 'bg-slate-900/80 border-sky-900 text-sky-300'
            : 'bg-white/90 border-slate-200 text-slate-600'
        }`}>
          Pan: [{Math.round(pan.x)}, {Math.round(pan.y)}] | Zoom: {Math.round(zoom * 100)}%
        </div>
      </div>
    </div>
  );
};
