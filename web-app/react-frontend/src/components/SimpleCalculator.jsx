import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { Search, Globe, Atom, Zap, Thermometer, Rocket, Activity, Wind, Calculator, Info, CheckCircle, AlertCircle } from 'lucide-react';
import './SimpleCalculator.css';

const CONSTANTS = {
  G: 6.67430e-11, c: 2.99792458e8, sigma: 5.670374419e-8, AU: 1.495978707e11,
  R_sun: 6.96e8, M_sun: 1.989e30, R_earth: 6.371e6, M_earth: 5.972e24,
  L_sun: 3.828e26, k_B: 1.380649e-23, m_H: 1.6735575e-27,
};

const formulaToTabMap = { 2: 'doppler', 3: 'transit', 4: 'kepler', 5: 'stefan', 6: 'habitable' };

const SimpleCalculator = ({ selectedFormulaId }) => {
  const defaultTab = selectedFormulaId ? formulaToTabMap[selectedFormulaId] : 'doppler';

  const [inputs, setInputs] = useState({
    radialVelocity: 10.0, restWavelength: 550, planetRadius: 1.1, stellarRadius: 1.0,
    stellarMass: 1.0, planetMass: 1.0, orbitalPeriod: 365.25, stellarTemperature: 5778,
    currentWeight: 1.0, prediction: 0.7, humanFeedback: true, learningRate: 0.1,
    atmosphereTemp: 288, molecularMass: 29, stellarLuminosity: 1.0,
  });

  const handleInputChange = (key, value) => setInputs(prev => ({ ...prev, [key]: value }));


  const calculations = useMemo(() => {
    const results = {};
    try {
      // Radial Velocity
      const vrOverC = inputs.radialVelocity / CONSTANTS.c;
      const shiftInMeters = vrOverC * (inputs.restWavelength * 1e-9);
      results.dopplerShift = { wavelengthShiftNm: shiftInMeters * 1e9, shiftRatioPpm: vrOverC * 1e6 };

      // Transit Method
      const rr = (inputs.planetRadius * CONSTANTS.R_earth) / (inputs.stellarRadius * CONSTANTS.R_sun);
      results.transitMethod = { transitDepthPpm: (rr ** 2) * 1e6, radiusRatio: rr };

      // Kepler’s 3rd Law
      const totalMass = (inputs.stellarMass * CONSTANTS.M_sun) + (inputs.planetMass * CONSTANTS.M_earth);
      const a_cubed = CONSTANTS.G * totalMass * (inputs.orbitalPeriod * 86400) ** 2 / (4 * Math.PI ** 2);
      results.keplersLaw = { orbitalDistanceAU: (a_cubed ** (1 / 3)) / CONSTANTS.AU, totalMass };

      // Stefan-Boltzmann Law
      const sr = inputs.stellarRadius * CONSTANTS.R_sun;
      const lum = 4 * Math.PI * sr ** 2 * CONSTANTS.sigma * inputs.stellarTemperature ** 4;
      results.stefanBoltzmann = { luminositySolar: lum / CONSTANTS.L_sun, luminosityWatts: lum };

      // AI Model Feedback Formula
      const h = inputs.humanFeedback ? 1.0 : 0.0;
      const p = Math.max(0.001, Math.min(0.999, inputs.prediction));
      const loss = -h * Math.log(p) - (1 - h) * Math.log(1 - p);
      const grad = -h / p + (1 - h) / (1 - p);
      const newWeight = Math.max(0.1, Math.min(2.0, inputs.currentWeight - inputs.learningRate * grad));
      results.feedbackWeight = { loss, weightChange: newWeight - inputs.currentWeight, newWeight };

      // Habitable Zone
      const lumStar = inputs.stellarLuminosity * CONSTANTS.L_sun;
      const inner = Math.sqrt(lumStar / (1.1 * CONSTANTS.L_sun)) * 0.95;
      const outer = Math.sqrt(lumStar / (0.53 * CONSTANTS.L_sun)) * 1.37;
      const inHZ = results.keplersLaw?.orbitalDistanceAU >= inner && results.keplersLaw?.orbitalDistanceAU <= outer;
      results.habitableZone = { inner, outer, inHZ, width: outer - inner };

      // Escape Velocity
      const pr = inputs.planetRadius * CONSTANTS.R_earth;
      const pm = inputs.planetMass * CONSTANTS.M_earth;
      const escVel = Math.sqrt((2 * CONSTANTS.G * pm) / pr);
      results.escapeVelocity = { kmPerS: escVel / 1000, mach: escVel / 343 };

      // Surface Gravity
      const grav = (CONSTANTS.G * pm) / pr ** 2;
      results.surfaceGravity = { gMS: grav, relativeGEarth: grav / 9.81 };

      // Atmospheric Scale Height
      const molMass = inputs.molecularMass * CONSTANTS.m_H;
      const scaleHeight = (CONSTANTS.k_B * inputs.atmosphereTemp) / (molMass * grav);
      results.atmosphere = { scaleHeightKm: scaleHeight / 1000, pressure10km: Math.exp(-10000 / scaleHeight) };
    } catch (e) { console.error(e); }
    return results;
  }, [inputs]);

  const FormulaCard = ({ title, icon: Icon, formula, children, resultsBlock, description }) => (
    <Card className="professional-card bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-xl border border-cyan-500/20 shadow-2xl">
      <CardHeader className="border-b border-cyan-500/20 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-cyan-500/10 rounded-xl border border-cyan-500/20">
              <Icon className="text-cyan-400" size={24} />
            </div>
            <div>
              <CardTitle className="text-white text-xl font-semibold tracking-wide">{title}</CardTitle>
              {description && <p className="text-slate-400 text-sm mt-1">{description}</p>}
            </div>
          </div>
          <Info className="text-slate-500 hover:text-cyan-400 transition-colors cursor-help" size={20} />
        </div>
      </CardHeader>
      <CardContent className="space-y-8 p-6">
        <div className="formula-section">
          <div className="flex items-center space-x-2 mb-3">
            <Calculator className="text-cyan-400" size={16} />
            <h4 className="text-cyan-400 text-sm font-semibold uppercase tracking-wider">Formula</h4>
          </div>
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-700/50 text-cyan-100 font-mono text-lg backdrop-blur-sm">
            {formula}
          </div>
        </div>
        <div className="inputs-section">
          <div className="flex items-center space-x-2 mb-4">
            <Activity className="text-blue-400" size={16} />
            <h4 className="text-blue-400 text-sm font-semibold uppercase tracking-wider">Parameters</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">{children}</div>
        </div>
        <div className="results-section">
          <div className="flex items-center space-x-2 mb-4">
            <CheckCircle className="text-emerald-400" size={16} />
            <h4 className="text-emerald-400 text-sm font-semibold uppercase tracking-wider">Results</h4>
          </div>
          <div className="bg-gradient-to-r from-emerald-900/20 to-cyan-900/20 p-5 rounded-xl border border-emerald-500/20 backdrop-blur-sm">
            <div className="text-slate-100 font-mono text-sm leading-relaxed">{resultsBlock}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(6,182,212,0.1),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(16,185,129,0.08),transparent_50%)] pointer-events-none" />
      
      <div className="relative z-10 min-h-screen py-12 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Professional Header */}
          <header className="text-center mb-16">
            <div className="inline-flex items-center justify-center p-4 bg-gradient-to-r from-cyan-500/10 to-emerald-500/10 rounded-2xl border border-cyan-500/20 mb-6">
              <Calculator className="text-cyan-400 mr-3" size={32} />
              <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-emerald-400 bg-clip-text text-transparent">
                Exoplanet Calculator Suite
              </h1>
            </div>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
              Advanced computational tools for exoplanet research and analysis. 
              Perform precise calculations using established astronomical formulas.
            </p>
            <div className="flex items-center justify-center space-x-6 mt-6 text-sm text-slate-500">
              <span className="flex items-center space-x-2">
                <CheckCircle size={16} className="text-emerald-400" />
                <span>Real-time Calculations</span>
              </span>
              <span className="flex items-center space-x-2">
                <CheckCircle size={16} className="text-emerald-400" />
                <span>Scientific Accuracy</span>
              </span>
              <span className="flex items-center space-x-2">
                <CheckCircle size={16} className="text-emerald-400" />
                <span>Professional Grade</span>
              </span>
            </div>
          </header>
          {/* Professional Tab Navigation */}
          <Tabs defaultValue={defaultTab} className="w-full">
            <div className="mb-12">
              <TabsList className="flex flex-wrap justify-center gap-6 p-4 bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-x-auto">
                {[
                  { value: "doppler", label: "Radial Velocity", icon: Search, emoji: "📡" },
                  { value: "transit", label: "Transit Method", icon: Globe, emoji: "🌍" },
                  { value: "kepler", label: "Orbital Mechanics", icon: Atom, emoji: "⚛️" },
                  { value: "stefan", label: "Stellar Physics", icon: Zap, emoji: "⭐" },
                  { value: "habitable", label: "Habitable Zone", icon: Thermometer, emoji: "🌊" },
                  { value: "escape", label: "Escape Velocity", icon: Rocket, emoji: "🚀" },
                  { value: "gravity", label: "Surface Gravity", icon: Activity, emoji: "⚖️" },
                  { value: "atmosphere", label: "Atmosphere", icon: Wind, emoji: "💨" },
                ].map(({ value, label, icon: TabIcon, emoji }) => (
                  <TabsTrigger
                    key={value}
                    value={value}
                    className="group relative flex items-center space-x-3 px-6 py-4 rounded-xl transition-all duration-300 whitespace-nowrap
                             bg-slate-800/50 hover:bg-slate-700/70 border border-slate-600/30 hover:border-cyan-500/50
                             data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500/20 data-[state=active]:to-blue-500/20
                             data-[state=active]:border-cyan-400/60 data-[state=active]:shadow-lg data-[state=active]:shadow-cyan-500/25
                             hover:scale-105 data-[state=active]:scale-105"
                  >
                    <span className="text-xl group-data-[state=active]:scale-110 transition-transform">{emoji}</span>
                    <TabIcon className="text-slate-400 group-hover:text-cyan-400 group-data-[state=active]:text-cyan-300 transition-colors" size={18} />
                    <span className="text-base font-semibold text-slate-300 group-hover:text-white group-data-[state=active]:text-white">
                      {label}
                    </span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>




        

            <TabsContent value="doppler">
              <FormulaCard
                title="Radial Velocity Analysis"
                description="Measure stellar wobble caused by orbiting planets using Doppler spectroscopy"
                icon={Search}
                formula="Δλ/λ = vᵣ/c"
                resultsBlock={
                  calculations.dopplerShift ? (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                        <span className="text-slate-300">Wavelength Shift:</span>
                        <span className="font-semibold text-cyan-300">{calculations.dopplerShift.wavelengthShiftNm.toFixed(4)} nm</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                        <span className="text-slate-300">Shift Ratio:</span>
                        <span className="font-semibold text-emerald-300">{calculations.dopplerShift.shiftRatioPpm.toFixed(2)} ppm</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 text-amber-400">
                      <AlertCircle size={16} />
                      <span>Please check input values</span>
                    </div>
                  )
                }
              >
                <div className="input-group">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Radial Velocity (m/s)
                  </label>
                  <input 
                    type="number" 
                    className="professional-input w-full"
                    value={inputs.radialVelocity}
                    onChange={e => handleInputChange('radialVelocity', parseFloat(e.target.value))}
                    placeholder="Enter velocity..."
                  />
                </div>
                <div className="input-group">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Rest Wavelength (nm)
                  </label>
                  <input 
                    type="number" 
                    className="professional-input w-full"
                    value={inputs.restWavelength}
                    onChange={e => handleInputChange('restWavelength', parseFloat(e.target.value))}
                    placeholder="Enter wavelength..."
                  />
                </div>
              </FormulaCard>
            </TabsContent>

            <TabsContent value="transit">
              <FormulaCard
                title="Transit Photometry"
                description="Detect exoplanets by measuring the dimming of starlight during planetary transits"
                icon={Globe}
                formula="ΔF/F = (Rₚ/Rₛ)²"
                resultsBlock={
                  calculations.transitMethod ? (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                        <span className="text-slate-300">Transit Depth:</span>
                        <span className="font-semibold text-cyan-300">{calculations.transitMethod.transitDepthPpm.toFixed(0)} ppm</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                        <span className="text-slate-300">Radius Ratio:</span>
                        <span className="font-semibold text-emerald-300">{calculations.transitMethod.radiusRatio.toFixed(4)}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 text-amber-400">
                      <AlertCircle size={16} />
                      <span>Please check input values</span>
                    </div>
                  )
                }
              >
                <div className="input-group">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Planet Radius (R⊕)
                  </label>
                  <input 
                    type="number" 
                    className="professional-input w-full"
                    value={inputs.planetRadius}
                    onChange={e => handleInputChange('planetRadius', parseFloat(e.target.value))}
                    step="0.1"
                    placeholder="Enter planet radius..."
                  />
                </div>
                <div className="input-group">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Stellar Radius (R☉)
                  </label>
                  <input 
                    type="number" 
                    className="professional-input w-full"
                    value={inputs.stellarRadius}
                    onChange={e => handleInputChange('stellarRadius', parseFloat(e.target.value))}
                    step="0.1"
                    placeholder="Enter stellar radius..."
                  />
                </div>
              </FormulaCard>
            </TabsContent>

            <TabsContent value="kepler">
              <FormulaCard
                title="Orbital Mechanics"
                description="Calculate orbital parameters using Kepler's fundamental laws of planetary motion"
                icon={Atom}
                formula="P² = 4π²a³/G(M* + Mₚ)"
                resultsBlock={
                  calculations.keplersLaw ? (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                        <span className="text-slate-300">Orbital Distance:</span>
                        <span className="font-semibold text-cyan-300">{calculations.keplersLaw.orbitalDistanceAU.toFixed(3)} AU</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                        <span className="text-slate-300">Total System Mass:</span>
                        <span className="font-semibold text-emerald-300">{(calculations.keplersLaw.totalMass / CONSTANTS.M_sun).toFixed(3)} M☉</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 text-amber-400">
                      <AlertCircle size={16} />
                      <span>Please check input values</span>
                    </div>
                  )
                }
              >
                <div className="input-group">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Stellar Mass (M☉)
                  </label>
                  <input 
                    type="number" 
                    className="professional-input w-full"
                    value={inputs.stellarMass}
                    onChange={e => handleInputChange('stellarMass', parseFloat(e.target.value))}
                    step="0.1"
                    placeholder="Enter stellar mass..."
                  />
                </div>
                <div className="input-group">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Planet Mass (M⊕)
                  </label>
                  <input 
                    type="number" 
                    className="professional-input w-full"
                    value={inputs.planetMass}
                    onChange={e => handleInputChange('planetMass', parseFloat(e.target.value))}
                    step="0.001"
                    placeholder="Enter planet mass..."
                  />
                </div>
                <div className="input-group">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Orbital Period (days)
                  </label>
                  <input 
                    type="number" 
                    className="professional-input w-full"
                    value={inputs.orbitalPeriod}
                    onChange={e => handleInputChange('orbitalPeriod', parseFloat(e.target.value))}
                    step="1"
                    placeholder="Enter orbital period..."
                  />
                </div>
              </FormulaCard>
            </TabsContent>

            <TabsContent value="stefan">
              <FormulaCard
                title="Stellar Luminosity"
                description="Calculate stellar luminosity using the Stefan-Boltzmann law of blackbody radiation"
                icon={Zap}
                formula="L = 4πRₛ²σT⁴"
                resultsBlock={
                  calculations.stefanBoltzmann ? (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                        <span className="text-slate-300">Luminosity (Solar):</span>
                        <span className="font-semibold text-cyan-300">{calculations.stefanBoltzmann.luminositySolar.toFixed(2)} L☉</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                        <span className="text-slate-300">Luminosity (Watts):</span>
                        <span className="font-semibold text-emerald-300">{calculations.stefanBoltzmann.luminosityWatts.toExponential(2)} W</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 text-amber-400">
                      <AlertCircle size={16} />
                      <span>Please check input values</span>
                    </div>
                  )
                }
              >
                <div className="input-group">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Stellar Radius (R☉)
                  </label>
                  <input 
                    type="number" 
                    className="professional-input w-full"
                    value={inputs.stellarRadius}
                    onChange={e => handleInputChange('stellarRadius', parseFloat(e.target.value))}
                    step="0.1"
                    placeholder="Enter stellar radius..."
                  />
                </div>
                <div className="input-group">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Effective Temperature (K)
                  </label>
                  <input 
                    type="number" 
                    className="professional-input w-full"
                    value={inputs.stellarTemperature}
                    onChange={e => handleInputChange('stellarTemperature', parseFloat(e.target.value))}
                    step="50"
                    placeholder="Enter temperature..."
                  />
                </div>
              </FormulaCard>
            </TabsContent>

            <TabsContent value="habitable">
              <FormulaCard
                title="Habitable Zone Analysis"
                description="Determine the orbital range where liquid water can exist on planetary surfaces"
                icon={Thermometer}
                formula="r_inner = √(L/1.1L☉) × 0.95 AU, r_outer = √(L/0.53L☉) × 1.37 AU"
                resultsBlock={
                  calculations.habitableZone ? (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                        <span className="text-slate-300">Inner HZ Boundary:</span>
                        <span className="font-semibold text-cyan-300">{calculations.habitableZone.inner.toFixed(3)} AU</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                        <span className="text-slate-300">Outer HZ Boundary:</span>
                        <span className="font-semibold text-cyan-300">{calculations.habitableZone.outer.toFixed(3)} AU</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                        <span className="text-slate-300">HZ Width:</span>
                        <span className="font-semibold text-emerald-300">{calculations.habitableZone.width.toFixed(3)} AU</span>
                      </div>
                      <div className={`p-3 rounded-lg border-2 ${
                        calculations.habitableZone.inHZ 
                          ? 'bg-emerald-900/20 border-emerald-500/50 text-emerald-300' 
                          : 'bg-red-900/20 border-red-500/50 text-red-300'
                      }`}>
                        <div className="flex items-center space-x-2">
                          {calculations.habitableZone.inHZ ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                          <span className="font-semibold">
                            {calculations.habitableZone.inHZ ? 'Planet is in Habitable Zone' : 'Planet is outside Habitable Zone'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 text-amber-400">
                      <AlertCircle size={16} />
                      <span>Please check input values</span>
                    </div>
                  )
                }
              >
                <div className="input-group">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Stellar Luminosity (L☉)
                  </label>
                  <input 
                    type="number" 
                    className="professional-input w-full"
                    value={inputs.stellarLuminosity}
                    onChange={e => handleInputChange('stellarLuminosity', parseFloat(e.target.value))}
                    step="0.1"
                    placeholder="Enter stellar luminosity..."
                  />
                </div>
                <div className="input-group">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Orbital Period (days)
                  </label>
                  <input 
                    type="number" 
                    className="professional-input w-full"
                    value={inputs.orbitalPeriod}
                    onChange={e => handleInputChange('orbitalPeriod', parseFloat(e.target.value))}
                    step="1"
                    placeholder="Enter orbital period..."
                  />
                </div>
              </FormulaCard>
            </TabsContent>

            <TabsContent value="escape">
              <FormulaCard
                title="Escape Velocity Calculator"
                description="Calculate the minimum velocity needed to escape a planet's gravitational field"
                icon={Rocket}
                formula="v_esc = √(2GM/R)"
                resultsBlock={
                  calculations.escapeVelocity ? (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                        <span className="text-slate-300">Escape Velocity:</span>
                        <span className="font-semibold text-cyan-300">{calculations.escapeVelocity.kmPerS.toFixed(2)} km/s</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                        <span className="text-slate-300">Relative to Sound:</span>
                        <span className="font-semibold text-emerald-300">Mach {calculations.escapeVelocity.mach.toFixed(1)}</span>
                      </div>
                      <div className={`p-3 rounded-lg border-2 ${
                        calculations.escapeVelocity.kmPerS > 11.2 
                          ? 'bg-amber-900/20 border-amber-500/50 text-amber-300' 
                          : 'bg-emerald-900/20 border-emerald-500/50 text-emerald-300'
                      }`}>
                        <div className="flex items-center space-x-2">
                          {calculations.escapeVelocity.kmPerS > 11.2 ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
                          <span className="font-semibold">
                            {calculations.escapeVelocity.kmPerS > 11.2 
                              ? `Higher than Earth (11.2 km/s)` 
                              : 'Lower than Earth (11.2 km/s)'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 text-amber-400">
                      <AlertCircle size={16} />
                      <span>Please check input values</span>
                    </div>
                  )
                }
              >
                <div className="space-y-4">
                  <div className="input-group">
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Planet Mass (M⊕)
                    </label>
                    <input 
                      type="number" 
                      className="professional-input w-full"
                      value={inputs.planetMass}
                      onChange={e => handleInputChange('planetMass', parseFloat(e.target.value))}
                      step="0.1"
                      placeholder="Enter planet mass..."
                    />
                  </div>
                  <div className="input-group">
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Planet Radius (R⊕)
                    </label>
                    <input 
                      type="number" 
                      className="professional-input w-full"
                      value={inputs.planetRadius}
                      onChange={e => handleInputChange('planetRadius', parseFloat(e.target.value))}
                      step="0.1"
                      placeholder="Enter planet radius..."
                    />
                  </div>
                </div>
              </FormulaCard>
            </TabsContent>

            <TabsContent value="gravity">
              <FormulaCard
                title="Surface Gravity Analysis"
                description="Calculate gravitational acceleration at a planet's surface"
                icon={Activity}
                formula="g = GM/R²"
                resultsBlock={
                  calculations.surfaceGravity ? (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                        <span className="text-slate-300">Surface Gravity:</span>
                        <span className="font-semibold text-cyan-300">{calculations.surfaceGravity.gMS.toFixed(2)} m/s²</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                        <span className="text-slate-300">Relative to Earth:</span>
                        <span className="font-semibold text-emerald-300">{calculations.surfaceGravity.relativeGEarth.toFixed(2)} g</span>
                      </div>
                      <div className={`p-3 rounded-lg border-2 ${
                        calculations.surfaceGravity.relativeGEarth > 1.5 || calculations.surfaceGravity.relativeGEarth < 0.5
                          ? 'bg-amber-900/20 border-amber-500/50 text-amber-300' 
                          : 'bg-emerald-900/20 border-emerald-500/50 text-emerald-300'
                      }`}>
                        <div className="flex items-center space-x-2">
                          {calculations.surfaceGravity.relativeGEarth > 1.5 || calculations.surfaceGravity.relativeGEarth < 0.5 
                            ? <AlertCircle size={16} /> 
                            : <CheckCircle size={16} />}
                          <span className="font-semibold">
                            {calculations.surfaceGravity.relativeGEarth > 1.5 
                              ? 'High gravity environment' :
                              calculations.surfaceGravity.relativeGEarth < 0.5 ?
                              'Low gravity environment' :
                              'Earth-like gravity'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 text-amber-400">
                      <AlertCircle size={16} />
                      <span>Please check input values</span>
                    </div>
                  )
                }
              >
                <div className="input-group">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Planet Mass (M⊕)
                  </label>
                  <input 
                    type="number" 
                    className="professional-input w-full"
                    value={inputs.planetMass}
                    onChange={e => handleInputChange('planetMass', parseFloat(e.target.value))}
                    step="0.1"
                    placeholder="Enter planet mass..."
                  />
                </div>
                <div className="input-group">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Planet Radius (R⊕)
                  </label>
                  <input 
                    type="number" 
                    className="professional-input w-full"
                    value={inputs.planetRadius}
                    onChange={e => handleInputChange('planetRadius', parseFloat(e.target.value))}
                    step="0.1"
                    placeholder="Enter planet radius..."
                  />
                </div>
              </FormulaCard>
            </TabsContent>

            <TabsContent value="atmosphere">
              <FormulaCard
                title="Atmospheric Scale Height"
                description="Analyze atmospheric structure and pressure distribution with altitude"
                icon={Wind}
                formula="H = k_B T / (m g)"
                resultsBlock={
                  calculations.atmosphere ? (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                        <span className="text-slate-300">Scale Height:</span>
                        <span className="font-semibold text-cyan-300">{calculations.atmosphere.scaleHeightKm.toFixed(2)} km</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                        <span className="text-slate-300">Pressure at 10km:</span>
                        <span className="font-semibold text-emerald-300">{(calculations.atmosphere.pressure10km * 100).toFixed(1)}% of surface</span>
                      </div>
                      <div className={`p-3 rounded-lg border-2 ${
                        calculations.atmosphere.scaleHeightKm > 8.5 
                          ? 'bg-blue-900/20 border-blue-500/50 text-blue-300' 
                          : 'bg-purple-900/20 border-purple-500/50 text-purple-300'
                      }`}>
                        <div className="flex items-center space-x-2">
                          <Info size={16} />
                          <span className="font-semibold">
                            {calculations.atmosphere.scaleHeightKm > 8.5 
                              ? 'More extended than Earth (8.5 km)' 
                              : 'More compact than Earth (8.5 km)'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 text-amber-400">
                      <AlertCircle size={16} />
                      <span>Please check input values</span>
                    </div>
                  )
                }
              >
                <div className="input-group">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Atmospheric Temperature (K)
                  </label>
                  <input 
                    type="number" 
                    className="professional-input w-full"
                    value={inputs.atmosphereTemp}
                    onChange={e => handleInputChange('atmosphereTemp', parseFloat(e.target.value))}
                    step="10"
                    placeholder="Enter temperature..."
                  />
                </div>
                <div className="input-group">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Mean Molecular Mass (amu)
                  </label>
                  <input 
                    type="number" 
                    className="professional-input w-full"
                    value={inputs.molecularMass}
                    onChange={e => handleInputChange('molecularMass', parseFloat(e.target.value))}
                    step="1"
                    placeholder="Enter molecular mass..."
                  />
                  <div className="mt-2 p-2 bg-slate-800/30 rounded-lg">
                    <p className="text-xs text-slate-400 mb-1">Common atmospheric compositions:</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <span className="text-cyan-400">N₂: 28 amu</span>
                      <span className="text-cyan-400">O₂: 32 amu</span>
                      <span className="text-cyan-400">CO₂: 44 amu</span>
                      <span className="text-cyan-400">H₂: 2 amu</span>
                    </div>
                  </div>
                </div>
                <div className="input-group">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Planet Mass (M⊕)
                  </label>
                  <input 
                    type="number" 
                    className="professional-input w-full"
                    value={inputs.planetMass}
                    onChange={e => handleInputChange('planetMass', parseFloat(e.target.value))}
                    step="0.1"
                    placeholder="Enter planet mass..."
                  />
                </div>
              </FormulaCard>
            </TabsContent>

          </Tabs>
        </div>
      </div>
    </div>
  );
};

SimpleCalculator.propTypes = {
  selectedFormulaId: PropTypes.number,
};

export default SimpleCalculator;
