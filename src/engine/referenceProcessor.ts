// AERO DESIGN STUDIO - RC TRAINER DESIGNER
// Reference Image Calibration & Geometric Synthesis Engine

import { ReferenceImage, AircraftConfig } from '../types/aircraft';
import { unitToMm } from './units';

export interface CalibratedMeasurements {
  scalePxPerMm: number;
  measuredDistancePx: number;
  realDistanceMm: number;
}

export interface ExtractedProportions {
  aspectRatio: number;
  taperRatio: number;
  sweepAngleDeg: number;
  noseFraction: number;
  tailFraction: number;
  controlSurfaceChordFraction: number;
  notes: string[];
}

/**
 * Calculates calibration scale in pixels per mm
 */
export function calculateImageScale(
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  knownDimension: number,
  unit: 'cm' | 'in'
): CalibratedMeasurements {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const distPx = Math.sqrt(dx * dx + dy * dy);
  const knownMm = unitToMm(knownDimension, unit);
  const scale = distPx / Math.max(1, knownMm);

  return {
    scalePxPerMm: scale,
    measuredDistancePx: distPx,
    realDistanceMm: knownMm
  };
}

/**
 * Synthesizes new original fuselage parameters inspired by user's reference images
 */
export function synthesizeFuselageFromReference(
  currentConfig: AircraftConfig,
  referenceTop?: ReferenceImage,
  referenceSide?: ReferenceImage,
  userSpecifiedTotalLengthMm?: number
): Partial<AircraftConfig> {
  const wingspan = currentConfig.wingspanMm;
  const targetLength = userSpecifiedTotalLengthMm || wingspan * currentConfig.fuselageLengthRatio;

  // Derive proportions
  let fuselageLengthRatio = currentConfig.fuselageLengthRatio;
  if (userSpecifiedTotalLengthMm && wingspan > 0) {
    fuselageLengthRatio = Number((userSpecifiedTotalLengthMm / wingspan).toFixed(3));
  }

  // Adjust cabin and tail ratios if calibrated reference exists
  let cabinWidthMm: number | undefined = undefined;
  let cabinHeightMm: number | undefined = undefined;

  if (referenceTop && referenceTop.calibratedScale && referenceTop.referenceLengthMm) {
    // Top view provides width proportions
    const refAspect = referenceTop.width / Math.max(1, referenceTop.height);
    const estimatedWidth = targetLength / Math.max(5, Math.min(14, refAspect));
    cabinWidthMm = Math.round(estimatedWidth);
  }

  if (referenceSide && referenceSide.calibratedScale && referenceSide.referenceLengthMm) {
    // Side view provides height and fineness proportions
    const refSideAspect = referenceSide.width / Math.max(1, referenceSide.height);
    const estimatedHeight = targetLength / Math.max(4, Math.min(10, refSideAspect));
    cabinHeightMm = Math.round(estimatedHeight);
  }

  return {
    fuselageLengthRatio,
    manualOverrides: {
      ...currentConfig.manualOverrides,
      ...(cabinWidthMm ? { fuselageWidthMaxMm: cabinWidthMm } : {}),
      ...(cabinHeightMm ? { fuselageHeightMaxMm: cabinHeightMm } : {}),
      ...(userSpecifiedTotalLengthMm ? { fuselageLengthMm: userSpecifiedTotalLengthMm } : {})
    }
  };
}

/**
 * Synthesizes an original wing or stabilizer geometry from a reference image
 */
export function synthesizePlanformFromReference(
  componentType: 'wing' | 'horizontalStabilizer' | 'verticalStabilizer',
  currentConfig: AircraftConfig,
  reference: ReferenceImage,
  knownSpanMm?: number
): Partial<AircraftConfig> {
  const imgAspect = reference.width / Math.max(1, reference.height);

  if (componentType === 'wing') {
    // Aspect ratio estimation clamped to safe trainer values (5.0 - 7.5)
    const safeAR = Math.max(5.0, Math.min(7.5, Number(imgAspect.toFixed(1))));
    return {
      wingAspectRatio: safeAR,
      wingPlanform: imgAspect > 6.5 ? 'tapered' : 'rectangular'
    };
  }

  if (componentType === 'horizontalStabilizer') {
    const safeH_AR = Math.max(3.2, Math.min(4.8, Number(imgAspect.toFixed(1))));
    return {
      horizontalTailAspectRatio: safeH_AR
    };
  }

  if (componentType === 'verticalStabilizer') {
    // Height to root chord aspect ratio
    const vAspect = Math.max(1.2, Math.min(1.9, Number((reference.height / Math.max(1, reference.width)).toFixed(1))));
    return {
      verticalTailAspectRatio: vAspect
    };
  }

  return {};
}
