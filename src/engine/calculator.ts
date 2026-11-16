// AERO DESIGN STUDIO - RC TRAINER DESIGNER
// Aircraft Dimension Calculation Engine
// Based on established model aeronautical engineering sizing methods
// (Andy Lennon, Martin Simons, Raymer preliminary design principles)

import {
  AircraftConfig,
  CalculatedAircraft,
  ControlSurfacesGeometry,
  FuselageGeometry,
  HorizontalStabilizerGeometry,
  VerticalStabilizerGeometry,
  WingGeometry,
  AircraftPerformanceEstimates
} from '../types/aircraft';
import { getAirfoilCoordinates, getAirfoilInfo } from './airfoils';

export const DEFAULT_CONFIG: AircraftConfig = {
  wingspanMm: 1200, // 120 cm / ~47.2 inches
  unit: 'cm',
  aircraftCategory: 'RC Trainer',
  wingConfiguration: 'High wing',
  tailConfiguration: 'Conventional tail',
  airfoil: 'clark-y',
  customAirfoilThicknessPct: 12,
  customAirfoilCamberPct: 2,
  wingPlanform: 'rectangular',
  dihedralDeg: 3.5, // High wing trainer standard with ailerons
  landingGearType: 'tricycle',

  // Configurable Design Ratios (Standard Trainer Values)
  wingAspectRatio: 6.0, // b / c_mean (standard 5.5 - 6.5)
  wingTaperRatio: 1.0, // 1.0 for rectangular, 0.75 for tapered
  fuselageLengthRatio: 0.75, // L_fuse / b (0.70 - 0.80)
  tailMomentRatio: 0.60, // L_tail / L_fuse (0.55 - 0.65)
  horizontalTailVolumeCoeff: 0.60, // Vh (0.55 - 0.75 for stable trainer)
  horizontalTailAspectRatio: 4.0, // AR_h (3.5 - 4.5)
  horizontalTailTaperRatio: 0.80,
  verticalTailVolumeCoeff: 0.040, // Vv (0.035 - 0.050 for trainer)
  verticalTailAspectRatio: 1.5, // AR_v (1.3 - 1.8)
  verticalTailTaperRatio: 0.60,

  // Control surface ratios
  aileronSpanRatio: 0.45, // 45% of half-span
  aileronChordRatio: 0.22, // 22% of wing chord
  aileronOutboardOffsetRatio: 0.05, // 5% tip buffer
  elevatorChordRatio: 0.35, // 35% of h-stab chord
  rudderChordRatio: 0.40, // 40% of v-stab chord

  designModes: {
    wing: 'auto',
    fuselage: 'auto',
    horizontalStabilizer: 'auto',
    verticalStabilizer: 'auto',
    controlSurfaces: 'auto'
  },

  manualOverrides: {}
};

/**
 * Main Aircraft Dimension Calculator
 */
export function calculateAircraft(config: AircraftConfig): CalculatedAircraft {
  const warnings: string[] = [];
  const assumptions: string[] = [];

  const b = Math.max(300, config.wingspanMm); // Wingspan mm
  const halfSpan = b / 2;

  // 1. WING SIZING
  const ar = config.wingAspectRatio;
  if (ar < 5.0) {
    warnings.push(`Wing aspect ratio (${ar.toFixed(1)}) is unusually low; induced drag will be high.`);
  } else if (ar > 8.0) {
    warnings.push(`Wing aspect ratio (${ar.toFixed(1)}) is high for an RC trainer; increases tip-stall vulnerability.`);
  }

  // Wing Area S = b² / AR
  const wingAreaMm2 = Math.round((b * b) / ar);
  const meanChordMm = Math.round(b / ar);

  let chordRootMm = meanChordMm;
  let chordTipMm = meanChordMm;
  const isTapered = config.wingPlanform === 'tapered';
  const taper = isTapered ? Math.max(0.5, Math.min(1.0, config.wingTaperRatio || 0.75)) : 1.0;

  if (isTapered) {
    // S = (c_root + c_tip)/2 * b => c_root = 2*S / (b * (1 + lambda))
    chordRootMm = Math.round((2 * wingAreaMm2) / (b * (1 + taper)));
    chordTipMm = Math.round(chordRootMm * taper);
  }

  // Manual override checks
  if (config.manualOverrides.wingChordRootMm) {
    chordRootMm = config.manualOverrides.wingChordRootMm;
  }
  if (config.manualOverrides.wingChordTipMm) {
    chordTipMm = config.manualOverrides.wingChordTipMm;
  }

  // Mean Aerodynamic Chord (MAC)
  // For trapezoidal wing: MAC = (2/3) * c_root * ((1 + lambda + lambda^2) / (1 + lambda))
  const macMm = isTapered
    ? Math.round((2 / 3) * chordRootMm * ((1 + taper + taper * taper) / (1 + taper)))
    : chordRootMm;

  // Spanwise position of MAC: y_mac = (b/6) * ((1 + 2*lambda)/(1 + lambda))
  const macYMm = isTapered
    ? Math.round((b / 6) * ((1 + 2 * taper) / (1 + taper)))
    : Math.round(b / 4);

  // X position of MAC leading edge assuming straight trailing edge or quarter-chord
  const sweepLeDeg = isTapered ? Math.atan2((chordRootMm - chordTipMm) * 0.75, halfSpan) * (180 / Math.PI) : 0;
  const macXMm = Math.round(macYMm * Math.tan((sweepLeDeg * Math.PI) / 180));

  // Dihedral tip rise: h_tip = (b/2) * tan(dihedral)
  const dihedralRad = (config.dihedralDeg * Math.PI) / 180;
  const dihedralTipRiseMm = Math.round(halfSpan * Math.tan(dihedralRad));

  // Airfoil
  const airfoilInfo = getAirfoilInfo(config.airfoil);
  const maxThicknessPct = config.airfoil === 'custom' ? config.customAirfoilThicknessPct : airfoilInfo.maxThicknessPct;
  const maxCamberPct = config.airfoil === 'custom' ? config.customAirfoilCamberPct : airfoilInfo.maxCamberPct;
  const maxThicknessMm = Math.round(chordRootMm * (maxThicknessPct / 100));
  const maxCamberMm = Math.round(chordRootMm * (maxCamberPct / 100));
  const airfoilCoordinates = getAirfoilCoordinates(config.airfoil, maxThicknessPct, maxCamberPct);

  // Center of Gravity range (25% to 30% MAC from wing LE)
  const cgMinMm = Math.round(macXMm + 0.25 * macMm);
  const cgMaxMm = Math.round(macXMm + 0.30 * macMm);

  assumptions.push(`Wing aspect ratio AR = ${ar.toFixed(1)} chosen for benign stall characteristics and trainer stability.`);
  assumptions.push(`Neutral point estimated at ~25% MAC. Target CG is set to 28-30% MAC for positive static stability margin.`);

  const wing: WingGeometry = {
    wingspanMm: b,
    wingAreaMm2,
    aspectRatio: ar,
    chordRootMm,
    chordTipMm,
    meanAerodynamicChordMm: macMm,
    macXPositionMm: macXMm,
    macYPositionMm: macYMm,
    halfSpanMm: halfSpan,
    dihedralDeg: config.dihedralDeg,
    dihedralTipRiseMm,
    airfoil: config.airfoil,
    maxThicknessMm,
    maxThicknessPct,
    maxCamberMm,
    maxCamberPct,
    airfoilCoordinates,
    sparPositionRatio: 0.30, // Main spar at 30% chord
    centerOfGravityMinMm: cgMinMm,
    centerOfGravityMaxMm: cgMaxMm
  };

  // 2. FUSELAGE SIZING
  const lFuseRatio = config.fuselageLengthRatio;
  let totalLengthMm = Math.round(b * lFuseRatio);
  if (config.manualOverrides.fuselageLengthMm) {
    totalLengthMm = config.manualOverrides.fuselageLengthMm;
  }

  // Nose and tail moments
  const noseMomentArmMm = Math.round(totalLengthMm * 0.24); // 24% of fuselage length
  const wingMountXStartMm = noseMomentArmMm;
  const wingMountXEndMm = wingMountXStartMm + chordRootMm;

  const tailMomentArmMm = Math.round(totalLengthMm * config.tailMomentRatio);

  let maxCabinWidthMm = Math.round(b * 0.085); // 8.5% of span
  let maxCabinHeightMm = Math.round(totalLengthMm * 0.14); // 14% of fuselage length
  if (config.manualOverrides.fuselageWidthMaxMm) maxCabinWidthMm = config.manualOverrides.fuselageWidthMaxMm;
  if (config.manualOverrides.fuselageHeightMaxMm) maxCabinHeightMm = config.manualOverrides.fuselageHeightMaxMm;

  const noseWidthMm = Math.round(maxCabinWidthMm * 0.70);
  const tailWidthMm = Math.round(maxCabinWidthMm * 0.25);
  const noseHeightMm = Math.round(maxCabinHeightMm * 0.65);
  const tailBoomHeightMm = Math.round(maxCabinHeightMm * 0.28);

  const horizontalStabMountXMm = Math.round(totalLengthMm - 0.12 * totalLengthMm);
  const verticalStabMountXMm = Math.round(totalLengthMm - 0.14 * totalLengthMm);

  // Landing gear positions
  const mainGearMountXMm = config.landingGearType === 'taildragger'
    ? Math.round(wingMountXStartMm + 0.10 * chordRootMm) // ahead of CG for taildragger
    : Math.round(wingMountXStartMm + 0.45 * chordRootMm); // behind CG for tricycle

  const mainGearHeightMm = Math.round(maxCabinHeightMm * 0.95);
  const mainGearTrackWidthMm = Math.round(b * 0.22); // 22% of span for tip-over stability
  const wheelDiameterMm = Math.round(b * 0.055); // 5.5% of span (~60-70mm for 1200mm span)

  // Fuselage outline coordinates for technical drawings
  const topOutlinePoints = [
    { x: 0, y: noseWidthMm / 2 },
    { x: noseMomentArmMm * 0.5, y: maxCabinWidthMm * 0.45 },
    { x: wingMountXStartMm, y: maxCabinWidthMm / 2 },
    { x: wingMountXEndMm, y: maxCabinWidthMm / 2 },
    { x: wingMountXEndMm + totalLengthMm * 0.15, y: maxCabinWidthMm * 0.45 },
    { x: totalLengthMm - 20, y: tailWidthMm / 2 },
    { x: totalLengthMm, y: tailWidthMm / 3 }
  ];

  const sideOutlinePoints = [
    // Top deck
    { x: 0, y: noseHeightMm * 0.6 },
    { x: noseMomentArmMm * 0.6, y: maxCabinHeightMm * 0.85 },
    { x: wingMountXStartMm, y: maxCabinHeightMm },
    { x: wingMountXEndMm, y: maxCabinHeightMm * 0.98 },
    { x: wingMountXEndMm + totalLengthMm * 0.15, y: maxCabinHeightMm * 0.70 },
    { x: totalLengthMm, y: tailBoomHeightMm },
    // Bottom deck
    { x: totalLengthMm, y: 0 },
    { x: wingMountXEndMm + totalLengthMm * 0.2, y: maxCabinHeightMm * 0.15 },
    { x: wingMountXStartMm, y: maxCabinHeightMm * 0.05 },
    { x: noseMomentArmMm * 0.4, y: maxCabinHeightMm * 0.10 },
    { x: 0, y: noseHeightMm * 0.1 }
  ];

  assumptions.push(`Fuselage length ratio L_fuse / b = ${lFuseRatio.toFixed(2)} provides sufficient lever arm for pitch and yaw damping.`);
  assumptions.push(`Engine thrust line built with 2.0° down-thrust and 1.5° right-thrust to counteract motor torque and P-factor.`);

  const fuselage: FuselageGeometry = {
    totalLengthMm,
    maxCabinWidthMm,
    noseWidthMm,
    tailWidthMm,
    maxCabinHeightMm,
    noseHeightMm,
    tailBoomHeightMm,
    noseMomentArmMm,
    tailMomentArmMm,
    wingMountXStartMm,
    wingMountXEndMm,
    wingMountHeightMm: maxCabinHeightMm,
    wingIncidenceDeg: 1.5, // Standard +1.5 deg incidence relative to fuselage datum
    thrustDownAngleDeg: 2.0,
    thrustRightAngleDeg: 1.5,
    horizontalStabMountXMm,
    verticalStabMountXMm,
    mainGearMountXMm,
    mainGearHeightMm,
    mainGearTrackWidthMm,
    wheelDiameterMm,
    topOutlinePoints,
    sideOutlinePoints
  };

  // 3. HORIZONTAL STABILIZER SIZING
  // Formula: Vh = (S_h * L_tail) / (S_w * c_mac)
  // Therefore: S_h = (Vh * S_w * c_mac) / L_tail
  const vhTarget = config.horizontalTailVolumeCoeff;
  if (vhTarget < 0.50) {
    warnings.push(`Horizontal tail volume coefficient Vh (${vhTarget.toFixed(2)}) is below recommended 0.55; pitch stability may be nervous.`);
  } else if (vhTarget > 0.85) {
    warnings.push(`Horizontal tail volume coefficient Vh (${vhTarget.toFixed(2)}) is heavy; could make aircraft sluggish in elevator response.`);
  }

  const effectiveTailArm = Math.max(100, tailMomentArmMm);
  const calcHStabAreaMm2 = Math.round((vhTarget * wingAreaMm2 * macMm) / effectiveTailArm);
  const arH = config.horizontalTailAspectRatio;
  let hStabSpanMm = Math.round(Math.sqrt(calcHStabAreaMm2 * arH));
  const hStabMeanChordMm = Math.round(calcHStabAreaMm2 / hStabSpanMm);

  const hTaper = config.horizontalTailTaperRatio || 0.80;
  let hChordRootMm = Math.round((2 * calcHStabAreaMm2) / (hStabSpanMm * (1 + hTaper)));
  let hChordTipMm = Math.round(hChordRootMm * hTaper);

  if (config.manualOverrides.hStabSpanMm) hStabSpanMm = config.manualOverrides.hStabSpanMm;
  if (config.manualOverrides.hStabChordRootMm) {
    hChordRootMm = config.manualOverrides.hStabChordRootMm;
    hChordTipMm = Math.round(hChordRootMm * hTaper);
  }

  const actualHStabAreaMm2 = Math.round(((hChordRootMm + hChordTipMm) / 2) * hStabSpanMm);
  const actualVh = (actualHStabAreaMm2 * effectiveTailArm) / (wingAreaMm2 * macMm);

  // Elevator
  const elevChordRatio = config.elevatorChordRatio; // default 0.35
  let elevChordMm = Math.round(hChordRootMm * elevChordRatio);
  if (config.manualOverrides.elevatorChordMm) elevChordMm = config.manualOverrides.elevatorChordMm;

  const elevSpanMm = hStabSpanMm;
  const centerCutoutWidthMm = Math.round(tailWidthMm * 1.5); // cut out for rudder swing
  const elevAreaMm2 = Math.round(elevSpanMm * elevChordMm - centerCutoutWidthMm * elevChordMm);
  const elevAreaPct = Math.round((elevAreaMm2 / actualHStabAreaMm2) * 100);

  const horizontalStabilizer: HorizontalStabilizerGeometry = {
    spanMm: hStabSpanMm,
    halfSpanMm: hStabSpanMm / 2,
    chordRootMm: hChordRootMm,
    chordTipMm: hChordTipMm,
    meanChordMm: hStabMeanChordMm,
    areaMm2: actualHStabAreaMm2,
    aspectRatio: arH,
    sweepLeDeg: 8.0,
    elevatorSpanMm: elevSpanMm,
    elevatorChordMm: elevChordMm,
    elevatorAreaMm2: elevAreaMm2,
    elevatorAreaPct: elevAreaPct,
    centerCutoutWidthMm,
    volumeCoefficientActual: Number(actualVh.toFixed(3))
  };

  assumptions.push(`Horizontal tail area S_h = ${(actualHStabAreaMm2 / wingAreaMm2 * 100).toFixed(1)}% of wing area, yielding Vh = ${actualVh.toFixed(2)}.`);

  // 4. VERTICAL STABILIZER SIZING
  // Formula: Vv = (S_v * L_tail) / (S_w * b)
  // Therefore: S_v = (Vv * S_w * b) / L_tail
  const vvTarget = config.verticalTailVolumeCoeff;
  if (vvTarget < 0.030) {
    warnings.push(`Vertical tail volume coefficient Vv (${vvTarget.toFixed(3)}) is below 0.035; potential Dutch roll or directional instability.`);
  }

  const calcVStabAreaMm2 = Math.round((vvTarget * wingAreaMm2 * b) / effectiveTailArm);
  const arV = config.verticalTailAspectRatio;
  let vStabHeightMm = Math.round(Math.sqrt(calcVStabAreaMm2 * arV));
  const vStabMeanChordMm = Math.round(calcVStabAreaMm2 / vStabHeightMm);

  const vTaper = config.verticalTailTaperRatio || 0.60;
  let vChordRootMm = Math.round((2 * calcVStabAreaMm2) / (vStabHeightMm * (1 + vTaper)));
  let vChordTipMm = Math.round(vChordRootMm * vTaper);

  if (config.manualOverrides.vStabHeightMm) vStabHeightMm = config.manualOverrides.vStabHeightMm;
  if (config.manualOverrides.vStabChordRootMm) {
    vChordRootMm = config.manualOverrides.vStabChordRootMm;
    vChordTipMm = Math.round(vChordRootMm * vTaper);
  }

  const actualVStabAreaMm2 = Math.round(((vChordRootMm + vChordTipMm) / 2) * vStabHeightMm);
  const actualVv = (actualVStabAreaMm2 * effectiveTailArm) / (wingAreaMm2 * b);

  // Rudder
  const rudChordRatio = config.rudderChordRatio; // default 0.40
  let rudChordRootMm = Math.round(vChordRootMm * rudChordRatio);
  let rudChordTipMm = Math.round(vChordTipMm * rudChordRatio);
  if (config.manualOverrides.rudderChordMm) {
    rudChordRootMm = config.manualOverrides.rudderChordMm;
    rudChordTipMm = Math.round(rudChordRootMm * vTaper);
  }

  const rudHeightMm = vStabHeightMm;
  const rudAreaMm2 = Math.round(((rudChordRootMm + rudChordTipMm) / 2) * rudHeightMm);
  const rudAreaPct = Math.round((rudAreaMm2 / actualVStabAreaMm2) * 100);

  const verticalStabilizer: VerticalStabilizerGeometry = {
    heightMm: vStabHeightMm,
    chordRootMm: vChordRootMm,
    chordTipMm: vChordTipMm,
    meanChordMm: vStabMeanChordMm,
    areaMm2: actualVStabAreaMm2,
    aspectRatio: arV,
    sweepLeDeg: 25.0,
    rudderHeightMm: rudHeightMm,
    rudderChordRootMm: rudChordRootMm,
    rudderChordTipMm: rudChordTipMm,
    rudderAreaMm2: rudAreaMm2,
    rudderAreaPct: rudAreaPct,
    volumeCoefficientActual: Number(actualVv.toFixed(3))
  };

  assumptions.push(`Vertical tail area S_v = ${(actualVStabAreaMm2 / wingAreaMm2 * 100).toFixed(1)}% of wing area, yielding Vv = ${actualVv.toFixed(3)}.`);

  // 5. CONTROL SURFACES (Ailerons, Elevator, Rudder)
  // Aileron span: typically 40% - 50% of half-span, starting 5% inset from tip
  const ailSpanRatio = config.aileronSpanRatio; // default 0.45
  let aileronSpanMm = Math.round(halfSpan * ailSpanRatio);
  let aileronChordMm = Math.round(chordRootMm * config.aileronChordRatio);
  const aileronStartFromTipMm = Math.round(halfSpan * config.aileronOutboardOffsetRatio);

  if (config.manualOverrides.aileronSpanMm) aileronSpanMm = config.manualOverrides.aileronSpanMm;
  if (config.manualOverrides.aileronChordMm) aileronChordMm = config.manualOverrides.aileronChordMm;

  const aileronTotalAreaMm2 = Math.round(aileronSpanMm * aileronChordMm * 2);
  const aileronAreaPctOfWing = Number(((aileronTotalAreaMm2 / wingAreaMm2) * 100).toFixed(1));

  if (aileronAreaPctOfWing < 6.0) {
    warnings.push(`Aileron area (${aileronAreaPctOfWing}%) is on the low side; roll response may be sluggish at slow trainer speeds.`);
  } else if (aileronAreaPctOfWing > 16.0) {
    warnings.push(`Aileron area (${aileronAreaPctOfWing}%) is large for a beginner trainer; may cause over-controlling.`);
  }

  const controlSurfaces: ControlSurfacesGeometry = {
    aileron: {
      leftSpanMm: aileronSpanMm,
      rightSpanMm: aileronSpanMm,
      chordMm: aileronChordMm,
      startFromTipMm: aileronStartFromTipMm,
      areaMm2Total: aileronTotalAreaMm2,
      areaPctOfWing: aileronAreaPctOfWing,
      recommendedDeflectionHighDeg: 20,
      recommendedDeflectionLowDeg: 12
    },
    elevator: {
      spanMm: elevSpanMm,
      chordMm: elevChordMm,
      areaMm2: elevAreaMm2,
      areaPctOfHStab: elevAreaPct,
      recommendedDeflectionHighDeg: 25,
      recommendedDeflectionLowDeg: 15
    },
    rudder: {
      heightMm: rudHeightMm,
      chordRootMm: rudChordRootMm,
      chordTipMm: rudChordTipMm,
      areaMm2: rudAreaMm2,
      areaPctOfVStab: rudAreaPct,
      recommendedDeflectionHighDeg: 30,
      recommendedDeflectionLowDeg: 18
    }
  };

  // 6. PERFORMANCE & WEIGHT ESTIMATES
  // Trainer target wing loading: ~36 g/dm² (approx 12 oz/sq ft)
  const wingAreaDm2 = wingAreaMm2 / 10000;
  const targetWingLoadingGramsPerDm2 = 36.0;
  const estimatedWeightGrams = Math.round(wingAreaDm2 * targetWingLoadingGramsPerDm2);
  const wingLoadingOzPerSqFt = Number((targetWingLoadingGramsPerDm2 * 0.3277).toFixed(1));

  // Stall speed: V_stall = sqrt( (2 * W) / (rho * S * CL_max) )
  // rho = 1.225 kg/m³, CL_max approx 1.25 for Clark Y with mild Reynolds number
  const massKg = estimatedWeightGrams / 1000;
  const areaM2 = wingAreaMm2 / 1000000;
  const clMax = 1.25;
  const rho = 1.225;
  const stallSpeedMs = Math.sqrt((2 * massKg * 9.81) / (rho * areaM2 * clMax));
  const stallSpeedKmh = Math.round(stallSpeedMs * 3.6);
  const stallSpeedMph = Math.round(stallSpeedMs * 2.237);

  // Recommended Motor power: 175 Watts / kg for easy trainer hand-launch or grass takeoff
  const recommendedMotorWatts = Math.round(massKg * 175);

  let recommendedProp = '9x5 to 10x4.7';
  if (b < 800) recommendedProp = '6x4 to 7x5';
  else if (b < 1100) recommendedProp = '8x4 to 9x5';
  else if (b < 1400) recommendedProp = '10x5 to 11x5.5';
  else recommendedProp = '11x5.5 to 12x6';

  const performance: AircraftPerformanceEstimates = {
    estimatedWeightGrams,
    wingLoadingGramsPerDm2: targetWingLoadingGramsPerDm2,
    wingLoadingOzPerSqFt,
    stallSpeedKmh,
    stallSpeedMph,
    recommendedMotorWatts,
    recommendedPropeller: recommendedProp
  };

  return {
    config,
    wing,
    fuselage,
    horizontalStabilizer,
    verticalStabilizer,
    controlSurfaces,
    performance,
    warnings,
    assumptions
  };
}
