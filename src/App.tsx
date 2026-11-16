// AERO DESIGN STUDIO - RC TRAINER DESIGNER
// Main Application Component

import React, { useState, useMemo } from 'react';
import { AircraftConfig, BlueprintTheme, ReferenceImage, UnitType } from './types/aircraft';
import { DEFAULT_CONFIG, calculateAircraft } from './engine/calculator';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { DashboardTab } from './components/DashboardTab';
import { AircraftConfigTab } from './components/AircraftConfigTab';
import { WingDesignTab } from './components/WingDesignTab';
import { HorizontalStabilizerTab } from './components/HorizontalStabilizerTab';
import { VerticalStabilizerTab } from './components/VerticalStabilizerTab';
import { FuselageDesignTab } from './components/FuselageDesignTab';
import { ControlSurfacesTab } from './components/ControlSurfacesTab';
import { CompleteBlueprintTab } from './components/CompleteBlueprintTab';
import { ExportTab } from './components/ExportTab';

export const App: React.FC = () => {
  const [config, setConfig] = useState<AircraftConfig>(DEFAULT_CONFIG);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [theme, setTheme] = useState<BlueprintTheme>('blueprint');
  const [referenceImages, setReferenceImages] = useState<Record<string, ReferenceImage>>({});

  // Recalculate aircraft dimensions on any config change
  const aircraft = useMemo(() => {
    return calculateAircraft(config);
  }, [config]);

  // Unit switch without resetting design
  const handleUnitChange = (newUnit: UnitType) => {
    setConfig((prev) => ({
      ...prev,
      unit: newUnit
    }));
  };

  // Reset to standard defaults
  const handleResetDefaults = () => {
    if (window.confirm('Reset aircraft configuration to standard factory trainer defaults?')) {
      setConfig({
        ...DEFAULT_CONFIG,
        unit: config.unit // keep current selected unit
      });
      setReferenceImages({});
      setActiveTab(0);
    }
  };

  const handleGenerateAircraft = () => {
    // Jump straight to the complete blueprint view for instant satisfaction
    setActiveTab(7);
  };

  const handleSaveReferenceImage = (ref: ReferenceImage) => {
    setReferenceImages((prev) => ({
      ...prev,
      [ref.component]: ref
    }));
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans">
      {/* Top Navigation */}
      <Navbar
        unit={config.unit}
        onUnitChange={handleUnitChange}
        wingspanMm={config.wingspanMm}
        theme={theme}
        onThemeToggle={() => setTheme((prev) => (prev === 'blueprint' ? 'cad-white' : 'blueprint'))}
        onResetDefaults={handleResetDefaults}
        onNavigateToExport={() => setActiveTab(8)}
      />

      {/* Main Workspace: Sidebar + Workspace Panel */}
      <div className="flex flex-1 overflow-hidden">
        {/* Navy Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          hasCustomOverrides={Object.keys(config.manualOverrides).length > 0}
        />

        {/* Content Workspace Area */}
        <main className={`flex-1 overflow-y-auto p-4 md:p-6 transition-colors duration-200 ${
          theme === 'blueprint' ? 'bg-[#06101e]' : 'bg-slate-100 text-slate-900'
        }`}>
          {activeTab === 0 && (
            <DashboardTab
              aircraft={aircraft}
              onNavigateTab={setActiveTab}
            />
          )}

          {activeTab === 1 && (
            <AircraftConfigTab
              config={config}
              onUpdateConfig={setConfig}
              onGenerateAircraft={handleGenerateAircraft}
            />
          )}

          {activeTab === 2 && (
            <WingDesignTab
              aircraft={aircraft}
              onUpdateConfig={setConfig}
              referenceImages={referenceImages}
              onSaveReferenceImage={handleSaveReferenceImage}
            />
          )}

          {activeTab === 3 && (
            <HorizontalStabilizerTab
              aircraft={aircraft}
              onUpdateConfig={setConfig}
              referenceImages={referenceImages}
              onSaveReferenceImage={handleSaveReferenceImage}
            />
          )}

          {activeTab === 4 && (
            <VerticalStabilizerTab
              aircraft={aircraft}
              onUpdateConfig={setConfig}
              referenceImages={referenceImages}
              onSaveReferenceImage={handleSaveReferenceImage}
            />
          )}

          {activeTab === 5 && (
            <FuselageDesignTab
              aircraft={aircraft}
              onUpdateConfig={setConfig}
              referenceImages={referenceImages}
              onSaveReferenceImage={handleSaveReferenceImage}
            />
          )}

          {activeTab === 6 && (
            <ControlSurfacesTab
              aircraft={aircraft}
              onUpdateConfig={setConfig}
              referenceImages={referenceImages}
              onSaveReferenceImage={handleSaveReferenceImage}
            />
          )}

          {activeTab === 7 && (
            <CompleteBlueprintTab
              aircraft={aircraft}
              theme={theme}
              onThemeChange={setTheme}
              onNavigateToExport={() => setActiveTab(8)}
            />
          )}

          {activeTab === 8 && (
            <ExportTab
              aircraft={aircraft}
              onLoadProject={(loadedConfig) => setConfig(loadedConfig)}
            />
          )}
        </main>
      </div>
    </div>
  );
};
export default App;
