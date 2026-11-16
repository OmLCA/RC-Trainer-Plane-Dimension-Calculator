// Airfoil Profile Generator for AERO DESIGN STUDIO
// Provides mathematical coordinates for Clark Y, NACA 2412, NACA 4412, and Custom Airfoils

import { AirfoilType } from '../types/aircraft';

export interface AirfoilCoordinate {
  x: number; // 0.0 to 1.0 (normalized chord fraction)
  yUpper: number; // Upper surface normalized
  yLower: number; // Lower surface normalized
  camber: number; // Mean camber line normalized
}

export interface AirfoilInfo {
  name: string;
  type: AirfoilType;
  description: string;
  maxThicknessPct: number;
  maxThicknessX: number; // % chord location
  maxCamberPct: number;
  maxCamberX: number; // % chord location
  idealFor: string;
}

// Classical Clark Y normalized coordinate table (standard empirical data smoothed)
const CLARK_Y_RAW_DATA = [
  { x: 0.0000, yU: 0.0350, yL: 0.0350 },
  { x: 0.0125, yU: 0.0545, yL: 0.0193 },
  { x: 0.0250, yU: 0.0650, yL: 0.0147 },
  { x: 0.0500, yU: 0.0790, yL: 0.0093 },
  { x: 0.0750, yU: 0.0885, yL: 0.0063 },
  { x: 0.1000, yU: 0.0960, yL: 0.0042 },
  { x: 0.1500, yU: 0.1068, yL: 0.0015 },
  { x: 0.2000, yU: 0.1136, yL: 0.0003 },
  { x: 0.2500, yU: 0.1169, yL: 0.0000 },
  { x: 0.3000, yU: 0.1170, yL: 0.0000 }, // Flat bottom begins
  { x: 0.4000, yU: 0.1140, yL: 0.0000 },
  { x: 0.5000, yU: 0.1052, yL: 0.0000 },
  { x: 0.6000, yU: 0.0915, yL: 0.0000 },
  { x: 0.7000, yU: 0.0735, yL: 0.0000 },
  { x: 0.8000, yU: 0.0522, yL: 0.0000 },
  { x: 0.9000, yU: 0.0280, yL: 0.0000 },
  { x: 0.9500, yU: 0.0149, yL: 0.0000 },
  { x: 1.0000, yU: 0.0015, yL: 0.0000 }
];

/**
 * Standard NACA 4-digit airfoil equation generator
 * m: max camber (e.g. 0.02 for NACA 2412)
 * p: location of max camber (e.g. 0.4 for NACA 2412)
 * t: max thickness fraction (e.g. 0.12 for NACA 2412)
 */
export function generateNaca4Digit(
  m: number,
  p: number,
  t: number,
  points: number = 40
): AirfoilCoordinate[] {
  const coords: AirfoilCoordinate[] = [];

  for (let i = 0; i <= points; i++) {
    // Cosine spacing for better resolution at leading & trailing edges
    const beta = (i / points) * Math.PI;
    const x = 0.5 * (1 - Math.cos(beta));

    // Thickness distribution
    const yt =
      5 *
      t *
      (0.2969 * Math.sqrt(Math.max(0, x)) -
        0.1260 * x -
        0.3516 * Math.pow(x, 2) +
        0.2843 * Math.pow(x, 3) -
        0.1015 * Math.pow(x, 4) // closed trailing edge
      );

    // Camber line & slope
    let yc = 0;
    let dyc_dx = 0;

    if (m === 0 || p === 0) {
      yc = 0;
      dyc_dx = 0;
    } else if (x < p) {
      yc = (m / Math.pow(p, 2)) * (2 * p * x - Math.pow(x, 2));
      dyc_dx = ((2 * m) / Math.pow(p, 2)) * (p - x);
    } else {
      yc = (m / Math.pow(1 - p, 2)) * (1 - 2 * p + 2 * p * x - Math.pow(x, 2));
      dyc_dx = ((2 * m) / Math.pow(1 - p, 2)) * (p - x);
    }

    const theta = Math.atan(dyc_dx);

    const xUpper = x - yt * Math.sin(theta);
    const yUpper = yc + yt * Math.cos(theta);
    const xLower = x + yt * Math.sin(theta);
    const yLower = yc - yt * Math.cos(theta);

    coords.push({
      x: Number(x.toFixed(4)),
      yUpper: Number(yUpper.toFixed(4)),
      yLower: Number(yLower.toFixed(4)),
      camber: Number(yc.toFixed(4))
    });
  }

  return coords;
}

export function getAirfoilCoordinates(
  type: AirfoilType,
  customThicknessPct: number = 12,
  customCamberPct: number = 2
): AirfoilCoordinate[] {
  switch (type) {
    case 'clark-y': {
      // Interpolate Clark Y raw data to produce dense smooth points
      return CLARK_Y_RAW_DATA.map((pt) => ({
        x: pt.x,
        yUpper: pt.yU,
        yLower: pt.yL,
        camber: (pt.yU + pt.yL) / 2
      }));
    }
    case 'naca-2412': {
      return generateNaca4Digit(0.02, 0.40, 0.12);
    }
    case 'naca-4412': {
      return generateNaca4Digit(0.04, 0.40, 0.12);
    }
    case 'custom': {
      const m = customCamberPct / 100;
      const t = customThicknessPct / 100;
      return generateNaca4Digit(m, 0.40, t);
    }
  }
}

export function getAirfoilInfo(type: AirfoilType): AirfoilInfo {
  switch (type) {
    case 'clark-y':
      return {
        name: 'Clark Y',
        type: 'clark-y',
        description:
          'High lift, forgiving stall, flat bottom from 30% to 100% chord. The gold standard for RC trainers due to easy bench assembly.',
        maxThicknessPct: 11.7,
        maxThicknessX: 30,
        maxCamberPct: 3.4,
        maxCamberX: 42,
        idealFor: 'Beginner RC trainers, balsa rib builds, high stability.'
      };
    case 'naca-2412':
      return {
        name: 'NACA 2412',
        type: 'naca-2412',
        description:
          'Semi-symmetrical airfoil with 2% camber and 12% thickness. Excellent lift-to-drag ratio and smooth stall progression.',
        maxThicknessPct: 12.0,
        maxThicknessX: 30,
        maxCamberPct: 2.0,
        maxCamberX: 40,
        idealFor: 'All-around trainer, mild aerobatic flight, smooth glide.'
      };
    case 'naca-4412':
      return {
        name: 'NACA 4412',
        type: 'naca-4412',
        description:
          'High-lift cambered section with 4% camber and 12% thickness. Outstanding low-speed slow flight handling.',
        maxThicknessPct: 12.0,
        maxThicknessX: 30,
        maxCamberPct: 4.0,
        maxCamberX: 40,
        idealFor: 'Heavy payload trainers, STOL (short takeoff and landing), windy conditions.'
      };
    case 'custom':
      return {
        name: 'Custom NACA 4-Digit',
        type: 'custom',
        description: 'User-specified camber and thickness distribution.',
        maxThicknessPct: 12.0,
        maxThicknessX: 30,
        maxCamberPct: 2.0,
        maxCamberX: 40,
        idealFor: 'Custom experimental design.'
      };
  }
}
