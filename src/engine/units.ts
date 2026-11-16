// Centralized Unit Conversion System for AERO DESIGN STUDIO
// Base internal storage unit: Millimeters (mm)

import { UnitType } from '../types/aircraft';

export const MM_PER_INCH = 25.4;
export const MM_PER_CM = 10.0;

/**
 * Converts internal millimeters to user-selected unit value (cm or in)
 */
export function mmToUnit(mm: number, unit: UnitType): number {
  if (unit === 'cm') {
    return mm / MM_PER_CM;
  }
  return mm / MM_PER_INCH;
}

/**
 * Converts user input in cm or in to internal millimeters
 */
export function unitToMm(value: number, unit: UnitType): number {
  if (unit === 'cm') {
    return value * MM_PER_CM;
  }
  return value * MM_PER_INCH;
}

/**
 * Formats a linear millimeter value for display in the active unit
 * Example: formatDimension(1000, 'cm') => "100.0 cm"
 *          formatDimension(1000, 'in') => "39.4 in"
 */
export function formatDimension(
  mm: number,
  unit: UnitType,
  precision: number = 1,
  showUnit: boolean = true
): string {
  const val = mmToUnit(mm, unit);
  const rounded = val.toFixed(precision);
  return showUnit ? `${rounded} ${unit}` : rounded;
}

/**
 * Formats an area in mm² for display in cm² or sq in (and dm² for aerodynamics)
 */
export function formatArea(
  mm2: number,
  unit: UnitType,
  precision: number = 1
): string {
  if (unit === 'cm') {
    const cm2 = mm2 / 100; // 1 cm² = 100 mm²
    const dm2 = mm2 / 10000;
    return `${cm2.toFixed(precision)} cm² (${dm2.toFixed(2)} dm²)`;
  } else {
    const sqIn = mm2 / (MM_PER_INCH * MM_PER_INCH); // 1 in² = 645.16 mm²
    const sqFt = sqIn / 144;
    return `${sqIn.toFixed(precision)} sq in (${sqFt.toFixed(2)} sq ft)`;
  }
}

/**
 * Parses user input string or number from active unit into internal mm
 */
export function parseInputToMm(input: string | number, unit: UnitType): number {
  const num = typeof input === 'string' ? parseFloat(input) : input;
  if (isNaN(num) || num <= 0) return 0;
  return unitToMm(num, unit);
}

/**
 * Label for active unit
 */
export function getUnitLabel(unit: UnitType): string {
  return unit === 'cm' ? 'cm' : 'in';
}

/**
 * Label for area in active unit
 */
export function getAreaUnitLabel(unit: UnitType): string {
  return unit === 'cm' ? 'cm²' : 'sq in';
}
