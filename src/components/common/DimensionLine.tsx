// High-Precision Technical SVG Dimension Line Component
// Conforms to engineering drawing standards (ISO / ANSI)
// Renders extension lines, dimension lines, precise arrowheads, and unit-aware text

import React from 'react';
import { UnitType } from '../../types/aircraft';
import { formatDimension } from '../../engine/units';

interface DimensionLineProps {
  // Start and end points of measured geometry (in drawing mm coordinates)
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  // Offset of dimension line from measured points (positive or negative)
  offset?: number;
  // Direction: 'horizontal' | 'vertical' | 'aligned'
  orientation?: 'horizontal' | 'vertical' | 'aligned';
  // Actual value to display in mm (if different from coordinate distance)
  measuredValueMm?: number;
  // Global unit system ('cm' | 'in')
  unit: UnitType;
  // Optional custom text label prefix or suffix (e.g. "SPAN: ", "ROOT: ")
  labelPrefix?: string;
  labelSuffix?: string;
  // Text position: 'center' | 'above' | 'outside'
  textPosition?: 'center' | 'above' | 'outside';
  // Color styling
  color?: string;
  // Drawing scale multiplier if SVG coordinates are scaled
  scaleMultiplier?: number;
  // Extra extension line gap
  extensionGap?: number;
  extensionOvershoot?: number;
  precision?: number;
}

export const DimensionLine: React.FC<DimensionLineProps> = ({
  x1,
  y1,
  x2,
  y2,
  offset = 25,
  orientation = 'horizontal',
  measuredValueMm,
  unit,
  labelPrefix = '',
  labelSuffix = '',
  color = 'currentColor',
  scaleMultiplier = 1,
  extensionGap = 4,
  extensionOvershoot = 5,
  precision = 1
}) => {
  let dimX1 = x1;
  let dimY1 = y1;
  let dimX2 = x2;
  let dimY2 = y2;

  let ext1_x1 = x1;
  let ext1_y1 = y1;
  let ext1_x2 = x1;
  let ext1_y2 = y1;

  let ext2_x1 = x2;
  let ext2_y1 = y2;
  let ext2_x2 = x2;
  let ext2_y2 = y2;

  let textX = 0;
  let textY = 0;
  let textAngle = 0;

  const arrowSize = 6;
  const valMm = measuredValueMm !== undefined ? measuredValueMm : (
    orientation === 'horizontal' ? Math.abs(x2 - x1) :
    orientation === 'vertical' ? Math.abs(y2 - y1) :
    Math.hypot(x2 - x1, y2 - y1)
  ) / scaleMultiplier;

  const labelText = `${labelPrefix}${formatDimension(valMm, unit, precision)}${labelSuffix}`;

  if (orientation === 'horizontal') {
    const yDim = (y1 + y2) / 2 + offset;
    dimX1 = x1;
    dimY1 = yDim;
    dimX2 = x2;
    dimY2 = yDim;

    // Extension lines
    const dir = offset >= 0 ? 1 : -1;
    ext1_x1 = x1;
    ext1_y1 = y1 + dir * extensionGap;
    ext1_x2 = x1;
    ext1_y2 = yDim + dir * extensionOvershoot;

    ext2_x1 = x2;
    ext2_y1 = y2 + dir * extensionGap;
    ext2_x2 = x2;
    ext2_y2 = yDim + dir * extensionOvershoot;

    textX = (dimX1 + dimX2) / 2;
    textY = yDim - (offset >= 0 ? 5 : 7);
  } else if (orientation === 'vertical') {
    const xDim = (x1 + x2) / 2 + offset;
    dimX1 = xDim;
    dimY1 = y1;
    dimX2 = xDim;
    dimY2 = y2;

    const dir = offset >= 0 ? 1 : -1;
    ext1_x1 = x1 + dir * extensionGap;
    ext1_y1 = y1;
    ext1_x2 = xDim + dir * extensionOvershoot;
    ext1_y2 = y1;

    ext2_x1 = x2 + dir * extensionGap;
    ext2_y1 = y2;
    ext2_x2 = xDim + dir * extensionOvershoot;
    ext2_y2 = y2;

    textX = xDim + (offset >= 0 ? 14 : -14);
    textY = (dimY1 + dimY2) / 2;
    textAngle = -90;
  } else {
    // Aligned dimension
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len;
    const ny = dx / len;

    dimX1 = x1 + nx * offset;
    dimY1 = y1 + ny * offset;
    dimX2 = x2 + nx * offset;
    dimY2 = y2 + ny * offset;

    const dir = offset >= 0 ? 1 : -1;
    ext1_x1 = x1 + nx * dir * extensionGap;
    ext1_y1 = y1 + ny * dir * extensionGap;
    ext1_x2 = dimX1 + nx * dir * extensionOvershoot;
    ext1_y2 = dimY1 + ny * dir * extensionOvershoot;

    ext2_x1 = x2 + nx * dir * extensionGap;
    ext2_y1 = y2 + ny * dir * extensionGap;
    ext2_x2 = dimX2 + nx * dir * extensionOvershoot;
    ext2_y2 = dimY2 + ny * dir * extensionOvershoot;

    textX = (dimX1 + dimX2) / 2 + nx * 8;
    textY = (dimY1 + dimY2) / 2 + ny * 8;
    textAngle = (Math.atan2(dy, dx) * 180) / Math.PI;
    if (textAngle > 90 || textAngle < -90) textAngle += 180;
  }

  // Draw arrowheads as closed polygons
  const drawArrow = (fromX: number, fromY: number, toX: number, toY: number) => {
    const angle = Math.atan2(toY - fromY, toX - fromX);
    const p1X = toX - arrowSize * Math.cos(angle - Math.PI / 6);
    const p1Y = toY - arrowSize * Math.sin(angle - Math.PI / 6);
    const p2X = toX - arrowSize * Math.cos(angle + Math.PI / 6);
    const p2Y = toY - arrowSize * Math.sin(angle + Math.PI / 6);
    return `M ${toX} ${toY} L ${p1X} ${p1Y} L ${p2X} ${p2Y} Z`;
  };

  return (
    <g className="dimension-group select-none" style={{ color }}>
      {/* Extension lines */}
      <line
        x1={ext1_x1}
        y1={ext1_y1}
        x2={ext1_x2}
        y2={ext1_y2}
        stroke={color}
        strokeWidth="1"
        strokeOpacity="0.6"
      />
      <line
        x1={ext2_x1}
        y1={ext2_y1}
        x2={ext2_x2}
        y2={ext2_y2}
        stroke={color}
        strokeWidth="1"
        strokeOpacity="0.6"
      />

      {/* Main dimension line */}
      <line
        x1={dimX1}
        y1={dimY1}
        x2={dimX2}
        y2={dimY2}
        stroke={color}
        strokeWidth="1.2"
      />

      {/* Arrows pointing outward to inward ends */}
      <path
        d={drawArrow(dimX2, dimY2, dimX1, dimY1)}
        fill={color}
      />
      <path
        d={drawArrow(dimX1, dimY1, dimX2, dimY2)}
        fill={color}
      />

      {/* Dimension Label Text with clear background badge */}
      <g transform={`translate(${textX}, ${textY}) rotate(${textAngle})`}>
        {/* Background halo for crisp readability */}
        <text
          x="0"
          y="0"
          textAnchor="middle"
          dominantBaseline="central"
          stroke="var(--dim-bg, #0f172a)"
          strokeWidth="3.5"
          strokeLinejoin="round"
          fontSize="10"
          fontFamily="monospace, ui-monospace, sans-serif"
          fontWeight="bold"
        >
          {labelText}
        </text>
        <text
          x="0"
          y="0"
          textAnchor="middle"
          dominantBaseline="central"
          fill={color}
          fontSize="10"
          fontFamily="monospace, ui-monospace, sans-serif"
          fontWeight="bold"
          letterSpacing="0.03em"
        >
          {labelText}
        </text>
      </g>
    </g>
  );
};
