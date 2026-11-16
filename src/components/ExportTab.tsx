// AERO DESIGN STUDIO - RC TRAINER DESIGNER
// Export Engine & Management: PDF, SVG, CSV, JSON Project Save & Load

import React, { useState } from 'react';
import { CalculatedAircraft } from '../types/aircraft';
import { jsPDF } from 'jspdf';
import { formatDimension, formatArea } from '../engine/units';
import { Download, FileText, FileSpreadsheet, Save, FolderOpen, CheckCircle, ShieldCheck } from 'lucide-react';

interface ExportTabProps {
  aircraft: CalculatedAircraft;
  onLoadProject: (config: any) => void;
}

export const ExportTab: React.FC<ExportTabProps> = ({ aircraft, onLoadProject }) => {
  const [exportingPdf, setExportingPdf] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { config, wing, fuselage, horizontalStabilizer, verticalStabilizer, controlSurfaces, performance } = aircraft;
  const unit = config.unit;

  // 1. PDF EXPORT
  const handleExportPdf = () => {
    setExportingPdf(true);
    try {
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const primaryColor = [15, 23, 42]; // Navy slate
      const accentColor = [2, 132, 199]; // Sky blue

      // Page 1: Engineering Title & Aircraft Specification Report
      doc.setFillColor(11, 25, 44);
      doc.rect(0, 0, 297, 210, 'F');

      // Title Block Header
      doc.setTextColor(56, 189, 248);
      doc.setFontSize(22);
      doc.text('AERO DESIGN STUDIO', 20, 25);

      doc.setFontSize(12);
      doc.setTextColor(255, 255, 255);
      doc.text('RC TRAINER AIRCRAFT – PRELIMINARY ENGINEERING REPORT', 20, 33);
      doc.setFontSize(9);
      doc.setTextColor(148, 163, 184);
      doc.text(`DRAWING NO: ADS-RCT-2026-001 | REVISION: 1.0 | UNITS: ${unit.toUpperCase()}`, 20, 39);

      // Spec Grid Box
      doc.setDrawColor(56, 189, 248);
      doc.setLineWidth(0.5);
      doc.rect(20, 48, 257, 142);

      // Section 1: Main Wing Specs
      doc.setFontSize(11);
      doc.setTextColor(56, 189, 248);
      doc.text('1. MAIN WING SPECIFICATIONS', 28, 58);
      doc.setFontSize(9);
      doc.setTextColor(255, 255, 255);
      doc.text(`Total Wingspan: ${formatDimension(wing.wingspanMm, unit)}`, 28, 66);
      doc.text(`Wing Planform: ${config.wingPlanform.toUpperCase()}`, 28, 72);
      doc.text(`Root Chord: ${formatDimension(wing.chordRootMm, unit)}`, 28, 78);
      doc.text(`Tip Chord: ${formatDimension(wing.chordTipMm, unit)}`, 28, 84);
      doc.text(`Mean Aerodynamic Chord (MAC): ${formatDimension(wing.meanAerodynamicChordMm, unit)}`, 28, 90);
      doc.text(`Wing Area: ${formatArea(wing.wingAreaMm2, unit)}`, 28, 96);
      doc.text(`Aspect Ratio (AR): ${wing.aspectRatio.toFixed(2)}`, 28, 102);
      doc.text(`Dihedral Angle: ${wing.dihedralDeg.toFixed(1)} deg (Tip Rise: ${formatDimension(wing.dihedralTipRiseMm, unit)})`, 28, 108);
      doc.text(`Airfoil Section: ${wing.airfoil.toUpperCase()} (Max Thick: ${wing.maxThicknessPct}%)`, 28, 114);

      // Section 2: Fuselage & Moments
      doc.setFontSize(11);
      doc.setTextColor(56, 189, 248);
      doc.text('2. FUSELAGE & MOMENT ARMS', 115, 58);
      doc.setFontSize(9);
      doc.setTextColor(255, 255, 255);
      doc.text(`Total Length: ${formatDimension(fuselage.totalLengthMm, unit)} (${Math.round(config.fuselageLengthRatio * 100)}% span)`, 115, 66);
      doc.text(`Cabin Max Width: ${formatDimension(fuselage.maxCabinWidthMm, unit)}`, 115, 72);
      doc.text(`Cabin Max Height: ${formatDimension(fuselage.maxCabinHeightMm, unit)}`, 115, 78);
      doc.text(`Nose Moment Arm: ${formatDimension(fuselage.noseMomentArmMm, unit)}`, 115, 84);
      doc.text(`Tail Moment Arm: ${formatDimension(fuselage.tailMomentArmMm, unit)}`, 115, 90);
      doc.text(`Wing Incidence: +${fuselage.wingIncidenceDeg} deg`, 115, 96);
      doc.text(`Thrust Angles: 2.0 deg down / 1.5 deg right`, 115, 102);
      doc.text(`Landing Gear: ${config.landingGearType.toUpperCase()}`, 115, 108);
      doc.text(`Main Track Width: ${formatDimension(fuselage.mainGearTrackWidthMm, unit)}`, 115, 114);

      // Section 3: Empennage & Stability
      doc.setFontSize(11);
      doc.setTextColor(56, 189, 248);
      doc.text('3. EMPENNAGE & TAIL COEFFICIENTS', 200, 58);
      doc.setFontSize(9);
      doc.setTextColor(255, 255, 255);
      doc.text(`H-Stab Span: ${formatDimension(horizontalStabilizer.spanMm, unit)}`, 200, 66);
      doc.text(`H-Stab Area: ${formatArea(horizontalStabilizer.areaMm2, unit)}`, 200, 72);
      doc.text(`Tail Volume Vh: ${horizontalStabilizer.volumeCoefficientActual} (Trainer target: 0.55-0.75)`, 200, 78);
      doc.text(`Elevator Chord: ${formatDimension(horizontalStabilizer.elevatorChordMm, unit)} (${horizontalStabilizer.elevatorAreaPct}%)`, 200, 84);
      doc.text(`V-Stab Height: ${formatDimension(verticalStabilizer.heightMm, unit)}`, 200, 90);
      doc.text(`V-Stab Area: ${formatArea(verticalStabilizer.areaMm2, unit)}`, 200, 96);
      doc.text(`Tail Volume Vv: ${verticalStabilizer.volumeCoefficientActual} (Trainer target: 0.035-0.050)`, 200, 102);
      doc.text(`Rudder Chord: ${formatDimension(verticalStabilizer.rudderChordRootMm, unit)} (${verticalStabilizer.rudderAreaPct}%)`, 200, 108);

      // Section 4: Performance & Power Estimates
      doc.setFontSize(11);
      doc.setTextColor(251, 191, 36); // Amber
      doc.text('4. ESTIMATED PERFORMANCE & FLIGHT METRICS', 28, 130);
      doc.setFontSize(9);
      doc.setTextColor(255, 255, 255);
      doc.text(`Estimated All-Up Weight (AUW): ${performance.estimatedWeightGrams} g (${(performance.estimatedWeightGrams / 28.35).toFixed(1)} oz)`, 28, 138);
      doc.text(`Target Wing Loading: ${performance.wingLoadingGramsPerDm2} g/dm² (${performance.wingLoadingOzPerSqFt} oz/sq ft)`, 28, 144);
      doc.text(`Stall Speed: ${performance.stallSpeedKmh} km/h (${performance.stallSpeedMph} mph)`, 28, 150);
      doc.text(`Recommended Motor Power: ${performance.recommendedMotorWatts} Watts (175 W/kg)`, 28, 156);
      doc.text(`Recommended Propeller: ${performance.recommendedPropeller}`, 28, 162);
      doc.text(`Recommended CG: 28% - 30% MAC from Wing LE`, 28, 168);

      // Engineering Sign-off & disclaimer
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text('* Generated by AERO DESIGN STUDIO. Preliminary sizing estimates based on standard RC trainer design ratios.', 28, 182);

      doc.save(`RC-Trainer-Design-${formatDimension(wing.wingspanMm, unit, 0).replace(/\s+/g, '')}.pdf`);
      setSuccessMessage('Technical PDF Blueprint exported successfully!');
    } catch (err) {
      console.error(err);
    } finally {
      setExportingPdf(false);
    }
  };

  // 2. CSV EXPORT
  const handleExportCsv = () => {
    const rows = [
      ['AERO DESIGN STUDIO - RC TRAINER DESIGNER', ''],
      ['Export Date', new Date().toISOString()],
      ['Display Unit', unit.toUpperCase()],
      ['Internal Base Unit', 'mm'],
      [''],
      ['PARAMETER', `VALUE (${unit.toUpperCase()})`, 'VALUE (MM / BASE)', 'PERCENTAGE / RATIO', 'NOTES'],
      ['Total Wingspan', formatDimension(wing.wingspanMm, unit, 1, false), wing.wingspanMm, '100%', 'Mandatory design input'],
      ['Wing Area', formatArea(wing.wingAreaMm2, unit), wing.wingAreaMm2, `AR = ${wing.aspectRatio.toFixed(2)}`, 'Wing area S = b² / AR'],
      ['Wing Root Chord', formatDimension(wing.chordRootMm, unit, 1, false), wing.chordRootMm, '-', 'At aircraft centerline'],
      ['Wing Tip Chord', formatDimension(wing.chordTipMm, unit, 1, false), wing.chordTipMm, `Taper = ${config.wingTaperRatio}`, 'Wingtip station'],
      ['Mean Aerodynamic Chord (MAC)', formatDimension(wing.meanAerodynamicChordMm, unit, 1, false), wing.meanAerodynamicChordMm, '-', 'Pitch reference chord'],
      ['Wing Dihedral Angle', `${wing.dihedralDeg.toFixed(1)} deg`, wing.dihedralDeg, '-', `Tip rise: ${formatDimension(wing.dihedralTipRiseMm, unit)}`],
      ['Wing Airfoil Section', wing.airfoil.toUpperCase(), '-', `${wing.maxThicknessPct}% thick`, 'High lift trainer section'],
      [''],
      ['Fuselage Total Length', formatDimension(fuselage.totalLengthMm, unit, 1, false), fuselage.totalLengthMm, `${Math.round(config.fuselageLengthRatio * 100)}% span`, 'Nose spinner to tail end'],
      ['Fuselage Max Cabin Width', formatDimension(fuselage.maxCabinWidthMm, unit, 1, false), fuselage.maxCabinWidthMm, '-', 'At wing saddle'],
      ['Fuselage Max Cabin Height', formatDimension(fuselage.maxCabinHeightMm, unit, 1, false), fuselage.maxCabinHeightMm, '-', 'At cabin windshield'],
      ['Fuselage Tail Moment Arm', formatDimension(fuselage.tailMomentArmMm, unit, 1, false), fuselage.tailMomentArmMm, `${Math.round(config.tailMomentRatio * 100)}% length`, '25% MAC to 25% tail MAC'],
      [''],
      ['Horizontal Stabilizer Span', formatDimension(horizontalStabilizer.spanMm, unit, 1, false), horizontalStabilizer.spanMm, '-', 'Tip to tip'],
      ['Horizontal Stabilizer Area', formatArea(horizontalStabilizer.areaMm2, unit), horizontalStabilizer.areaMm2, `${((horizontalStabilizer.areaMm2 / wing.wingAreaMm2) * 100).toFixed(1)}% wing`, 'Stabilizer total area'],
      ['Tail Volume Coefficient Vh', horizontalStabilizer.volumeCoefficientActual, '-', 'Target 0.55 - 0.75', 'Longitudinal stability'],
      ['Elevator Chord', formatDimension(horizontalStabilizer.elevatorChordMm, unit, 1, false), horizontalStabilizer.elevatorChordMm, `${horizontalStabilizer.elevatorAreaPct}% tail`, 'Elevator movable surface'],
      [''],
      ['Vertical Stabilizer Height', formatDimension(verticalStabilizer.heightMm, unit, 1, false), verticalStabilizer.heightMm, '-', 'Base deck to tip'],
      ['Vertical Stabilizer Area', formatArea(verticalStabilizer.areaMm2, unit), verticalStabilizer.areaMm2, `${((verticalStabilizer.areaMm2 / wing.wingAreaMm2) * 100).toFixed(1)}% wing`, 'Vertical fin total area'],
      ['Vertical Volume Coefficient Vv', verticalStabilizer.volumeCoefficientActual, '-', 'Target 0.035 - 0.050', 'Directional yaw damping'],
      ['Rudder Chord Root', formatDimension(verticalStabilizer.rudderChordRootMm, unit, 1, false), verticalStabilizer.rudderChordRootMm, `${verticalStabilizer.rudderAreaPct}% fin`, 'Rudder movable surface'],
      [''],
      ['Estimated All-Up Weight (AUW)', `${performance.estimatedWeightGrams} g`, performance.estimatedWeightGrams, '-', 'Target flying weight'],
      ['Wing Loading', `${performance.wingLoadingGramsPerDm2} g/dm²`, '-', `${performance.wingLoadingOzPerSqFt} oz/sq ft`, 'Gentle trainer landing'],
      ['Estimated Stall Speed', `${performance.stallSpeedKmh} km/h`, '-', `${performance.stallSpeedMph} mph`, 'CL_max = 1.25'],
      ['Recommended Motor Power', `${performance.recommendedMotorWatts} Watts`, '-', '175 W/kg', 'Brushless outrunner recommendation']
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `rc-trainer-dimensions-${unit}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setSuccessMessage('CSV Dimension Schedule downloaded successfully!');
  };

  // 3. PROJECT JSON SAVE & LOAD
  const handleSaveProjectJson = () => {
    const projectData = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      config,
      aircraft
    };
    const jsonStr = JSON.stringify(projectData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `aero-design-trainer-${config.wingspanMm}mm.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setSuccessMessage('Project JSON file saved!');
  };

  const handleLoadProjectJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.config) {
          onLoadProject(parsed.config);
          setSuccessMessage('Project loaded successfully from file!');
        }
      } catch (err) {
        alert('Invalid project JSON file');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Success Notification */}
      {successMessage && (
        <div className="p-4 bg-emerald-950/80 border border-emerald-600 rounded-xl text-emerald-200 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
          <button
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-400 hover:text-white"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Export Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: PDF Export */}
        <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800 space-y-4 flex flex-col justify-between hover:border-sky-700 transition">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-white">Dimensioned PDF Blueprint</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Generates a full engineering specification PDF report containing all dimensions, aerodynamic stability coefficients, control surface throws, and title block formatted in {unit.toUpperCase()}.
            </p>
          </div>

          <button
            onClick={handleExportPdf}
            disabled={exportingPdf}
            className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-sky-900/30 transition disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {exportingPdf ? 'Generating PDF...' : 'Download PDF Specification'}
          </button>
        </div>

        {/* Card 2: CSV Data Schedule */}
        <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800 space-y-4 flex flex-col justify-between hover:border-sky-700 transition">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-white">Engineering CSV Schedule</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Export all geometric dimensions, station coordinates, wing chords, and volume formulas as a structured spreadsheet for Excel, Google Sheets, or CAD import.
            </p>
          </div>

          <button
            onClick={handleExportCsv}
            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30 transition"
          >
            <Download className="w-4 h-4" />
            Download Dimensions CSV
          </button>
        </div>

        {/* Card 3: Project Save / Load */}
        <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800 space-y-4 flex flex-col justify-between hover:border-sky-700 transition">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Save className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-white">Save / Load Project</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Save your complete custom design parameters, design ratios, and overrides to a local JSON file. Reload anytime to continue editing.
            </p>
          </div>

          <div className="space-y-2">
            <button
              onClick={handleSaveProjectJson}
              className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition"
            >
              <Save className="w-4 h-4 text-amber-400" />
              Save Project JSON
            </button>

            <label className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition">
              <FolderOpen className="w-4 h-4 text-sky-400" />
              Load Project JSON
              <input
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleLoadProjectJson}
              />
            </label>
          </div>
        </div>
      </div>

      {/* SVG Vector Downloads for Individual Components */}
      <div className="p-6 bg-slate-900/60 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="font-bold text-sm text-white flex items-center gap-2">
          <Download className="w-4 h-4 text-sky-400" />
          Direct Vector SVG Component Downloads (Laser Cutting & CAD Ready)
        </h3>
        <p className="text-xs text-slate-400">
          All individual component drawings can be downloaded directly as clean SVG vector files from their respective tabs (Wing, Horizontal Stabilizer, Vertical Stabilizer, Fuselage, and Blueprint) using the top SVG button.
        </p>
      </div>
    </div>
  );
};
