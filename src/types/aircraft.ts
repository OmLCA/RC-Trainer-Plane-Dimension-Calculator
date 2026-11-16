// AERO DESIGN STUDIO - RC TRAINER DESIGNER
// Central TypeScript Definitions

export type UnitType = 'cm' | 'in';
export type InternalUnit = 'mm';

export type AirfoilType = 'clark-y' | 'naca-2412' | 'naca-4412' | 'custom';
export type WingPlanformType = 'rectangular' | 'tapered';
export type LandingGearType = 'tricycle' | 'taildragger';
export type BlueprintTheme = 'blueprint' | 'cad-white';

export interface ReferenceImage {
  id: string;
  component: string;
  name: string;
  dataUrl: string;
  width: number;
  height: number;
  calibratedScale?: number; // pixels per mm
  referenceLengthMm?: number;
  pointA?: { x: number; y: number };
  pointB?: { x: number; y: number };
  opacity: number;
  rotation: number;
  offsetX: number;
  offsetY: number;
  notes?: string;
}

export interface AircraftConfig {
  // Global & Main Dimensions
  wingspanMm: number; // Stored in mm internally
  unit: UnitType; // Display unit: 'cm' | 'in'
  
  // Configuration options
  aircraftCategory: 'RC Trainer';
  wingConfiguration: 'High wing';
  tailConfiguration: 'Conventional tail';
  airfoil: AirfoilType;
  customAirfoilThicknessPct: number; // 8% - 16%
  customAirfoilCamberPct: number; // 0% - 6%
  wingPlanform: WingPlanformType;
  dihedralDeg: number; // 0 - 8 degrees (default 3.5 deg)
  landingGearType: LandingGearType;

  // Configurable Design Ratios
  wingAspectRatio: number; // Default 6.0 (range 5.0 - 8.0)
  wingTaperRatio: number; // Default 1.0 (rectangular) or 0.75 (tapered)
  fuselageLengthRatio: number; // L_fuse / b (default 0.75)
  tailMomentRatio: number; // L_tail / L_fuse (default 0.60)
  horizontalTailVolumeCoeff: number; // Vh (default 0.60, range 0.50 - 0.85)
  horizontalTailAspectRatio: number; // AR_h (default 4.0, range 3.0 - 5.0)
  horizontalTailTaperRatio: number; // Default 0.80
  verticalTailVolumeCoeff: number; // Vv (default 0.040, range 0.030 - 0.060)
  verticalTailAspectRatio: number; // AR_v (default 1.5, range 1.2 - 2.0)
  verticalTailTaperRatio: number; // Default 0.60
  
  // Control surface ratios
  aileronSpanRatio: number; // Fraction of half-span (default 0.45)
  aileronChordRatio: number; // Fraction of wing chord (default 0.22)
  aileronOutboardOffsetRatio: number; // Inset from tip (default 0.05)
  elevatorChordRatio: number; // Fraction of h-stab chord (default 0.35)
  rudderChordRatio: number; // Fraction of v-stab chord (default 0.40)
  
  // Component Design Modes: 'auto' (calculated) or 'reference' (user-assisted)
  designModes: {
    wing: 'auto' | 'reference';
    fuselage: 'auto' | 'reference';
    horizontalStabilizer: 'auto' | 'reference';
    verticalStabilizer: 'auto' | 'reference';
    controlSurfaces: 'auto' | 'reference';
  };

  // Manual Overrides (if user explicitly modified a dimension)
  manualOverrides: {
    wingChordRootMm?: number;
    wingChordTipMm?: number;
    fuselageLengthMm?: number;
    fuselageWidthMaxMm?: number;
    fuselageHeightMaxMm?: number;
    hStabSpanMm?: number;
    hStabChordRootMm?: number;
    vStabHeightMm?: number;
    vStabChordRootMm?: number;
    aileronSpanMm?: number;
    aileronChordMm?: number;
    elevatorChordMm?: number;
    rudderChordMm?: number;
  };
}

export interface WingGeometry {
  wingspanMm: number;
  wingAreaMm2: number;
  aspectRatio: number;
  chordRootMm: number;
  chordTipMm: number;
  meanAerodynamicChordMm: number; // MAC
  macXPositionMm: number; // X station of MAC leading edge from root LE
  macYPositionMm: number; // Spanwise location of MAC
  halfSpanMm: number;
  dihedralDeg: number;
  dihedralTipRiseMm: number;
  airfoil: AirfoilType;
  maxThicknessMm: number;
  maxThicknessPct: number;
  maxCamberMm: number;
  maxCamberPct: number;
  airfoilCoordinates: { x: number; yUpper: number; yLower: number; camber: number }[];
  sparPositionRatio: number; // e.g. 0.30 (30% chord)
  centerOfGravityMinMm: number; // 25% MAC
  centerOfGravityMaxMm: number; // 30% MAC
}

export interface FuselageGeometry {
  totalLengthMm: number;
  maxCabinWidthMm: number;
  noseWidthMm: number;
  tailWidthMm: number;
  maxCabinHeightMm: number;
  noseHeightMm: number;
  tailBoomHeightMm: number;
  noseMomentArmMm: number; // Nose to wing LE
  tailMomentArmMm: number; // Wing 25% MAC to tail 25% MAC
  wingMountXStartMm: number;
  wingMountXEndMm: number;
  wingMountHeightMm: number;
  wingIncidenceDeg: number; // typically +1.5 to +2.0 deg
  thrustDownAngleDeg: number; // typically 2.0 deg
  thrustRightAngleDeg: number; // typically 1.5 deg
  horizontalStabMountXMm: number;
  verticalStabMountXMm: number;
  mainGearMountXMm: number;
  mainGearHeightMm: number;
  mainGearTrackWidthMm: number;
  wheelDiameterMm: number;
  topOutlinePoints: { x: number; y: number }[];
  sideOutlinePoints: { x: number; y: number }[];
}

export interface HorizontalStabilizerGeometry {
  spanMm: number;
  halfSpanMm: number;
  chordRootMm: number;
  chordTipMm: number;
  meanChordMm: number;
  areaMm2: number;
  aspectRatio: number;
  sweepLeDeg: number;
  elevatorSpanMm: number;
  elevatorChordMm: number;
  elevatorAreaMm2: number;
  elevatorAreaPct: number;
  centerCutoutWidthMm: number; // for rudder swing clearance
  volumeCoefficientActual: number;
}

export interface VerticalStabilizerGeometry {
  heightMm: number;
  chordRootMm: number;
  chordTipMm: number;
  meanChordMm: number;
  areaMm2: number;
  aspectRatio: number;
  sweepLeDeg: number;
  rudderHeightMm: number;
  rudderChordRootMm: number;
  rudderChordTipMm: number;
  rudderAreaMm2: number;
  rudderAreaPct: number;
  volumeCoefficientActual: number;
}

export interface ControlSurfacesGeometry {
  aileron: {
    leftSpanMm: number;
    rightSpanMm: number;
    chordMm: number;
    startFromTipMm: number;
    areaMm2Total: number;
    areaPctOfWing: number;
    recommendedDeflectionHighDeg: number;
    recommendedDeflectionLowDeg: number;
  };
  elevator: {
    spanMm: number;
    chordMm: number;
    areaMm2: number;
    areaPctOfHStab: number;
    recommendedDeflectionHighDeg: number;
    recommendedDeflectionLowDeg: number;
  };
  rudder: {
    heightMm: number;
    chordRootMm: number;
    chordTipMm: number;
    areaMm2: number;
    areaPctOfVStab: number;
    recommendedDeflectionHighDeg: number;
    recommendedDeflectionLowDeg: number;
  };
}

export interface AircraftPerformanceEstimates {
  estimatedWeightGrams: number;
  wingLoadingGramsPerDm2: number;
  wingLoadingOzPerSqFt: number;
  stallSpeedKmh: number;
  stallSpeedMph: number;
  recommendedMotorWatts: number;
  recommendedPropeller: string;
}

export interface CalculatedAircraft {
  config: AircraftConfig;
  wing: WingGeometry;
  fuselage: FuselageGeometry;
  horizontalStabilizer: HorizontalStabilizerGeometry;
  verticalStabilizer: VerticalStabilizerGeometry;
  controlSurfaces: ControlSurfacesGeometry;
  performance: AircraftPerformanceEstimates;
  warnings: string[];
  assumptions: string[];
}
