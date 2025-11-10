import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Calculator, Search, Zap, Brain, Globe, Atom, RotateCcw, Copy, Save } from 'lucide-react';

// Physical constants
const CONSTANTS = {
    G: 6.67430e-11,      // Gravitational constant (m³/kg/s²)
    c: 2.99792458e8,     // Speed of light (m/s)
    sigma: 5.670374419e-8, // Stefan-Boltzmann constant (W/m²/K⁴)
    AU: 1.495978707e11,  // Astronomical unit (m)
    R_sun: 6.96e8,       // Solar radius (m)
    M_sun: 1.989e30,     // Solar mass (kg)
    R_earth: 6.371e6,    // Earth radius (m)
    M_earth: 5.972e24,   // Earth mass (kg)
    L_sun: 3.828e26,     // Solar luminosity (W)
};

const InteractiveFormulas = () => {
    // Calculator history state
    const [calculationHistory, setCalculationHistory] = useState([]);
    const [savedCalculations, setSavedCalculations] = useState({});
    
    // Preset values for common exoplanets
    const presets = {
        earth: {
            name: "Earth",
            radialVelocity: 0.09,
            restWavelength: 550,
            planetRadius: 1.0,
            stellarRadius: 1.0,
            stellarMass: 1.0,
            planetMass: 0.003,
            orbitalPeriod: 365.25,
            stellarRadiusSB: 1.0,
            stellarTemperature: 5778,
            stellarLuminosity: 1.0
        },
        kepler452b: {
            name: "Kepler-452b",
            radialVelocity: 1.2,
            restWavelength: 550,
            planetRadius: 1.6,
            stellarRadius: 1.11,
            stellarMass: 1.04,
            planetMass: 0.015,
            orbitalPeriod: 384.8,
            stellarRadiusSB: 1.11,
            stellarTemperature: 5757,
            stellarLuminosity: 1.2
        },
        proxima: {
            name: "Proxima Centauri b",
            radialVelocity: 1.38,
            restWavelength: 550,
            planetRadius: 1.1,
            stellarRadius: 0.14,
            stellarMass: 0.12,
            planetMass: 0.004,
            orbitalPeriod: 11.2,
            stellarRadiusSB: 0.14,
            stellarTemperature: 3042,
            stellarLuminosity: 0.0017
        }
    };
    
    // State for all formula inputs
    const [inputs, setInputs] = useState({
        // Radial Velocity
        radialVelocity: 10.0,
        restWavelength: 550,
        
        // Transit Method
        planetRadius: 1.1,
        stellarRadius: 1.0,
        
        // Kepler's 3rd Law
        stellarMass: 1.0,
        planetMass: 0.001,
        orbitalPeriod: 365.25,
        orbitalDistance: null,
        
        // Stefan-Boltzmann
        stellarRadiusSB: 1.0,
        stellarTemperature: 5778,
        
        // Feedback Weight
        currentWeight: 1.0,
        prediction: 0.7,
        humanFeedback: true,
        learningRate: 0.1,
        
        // AI Aggregation
        predictions: [0.8, 0.6, 0.9, 0.7],
        weights: [1.2, 0.9, 1.1, 1.0],
        
        // Habitable Zone
        stellarLuminosity: 1.0,
        
        // Equilibrium Temperature
        stellarLuminosityEQ: 1.0,
        orbitalDistanceEQ: 1.0,
        albedo: 0.3,
    });

    // Calculator functions
    const handleInputChange = (key, value) => {
        // Add validation for realistic ranges
        const validatedValue = validateInput(key, value);
        setInputs(prev => ({
            ...prev,
            [key]: validatedValue
        }));
    };

    const validateInput = (key, value) => {
        const ranges = {
            radialVelocity: { min: 0.01, max: 1000 },
            restWavelength: { min: 300, max: 1000 },
            planetRadius: { min: 0.1, max: 20 },
            stellarRadius: { min: 0.1, max: 10 },
            stellarMass: { min: 0.08, max: 50 },
            planetMass: { min: 0.0001, max: 100 },
            orbitalPeriod: { min: 0.1, max: 10000 },
            stellarTemperature: { min: 1000, max: 50000 },
            currentWeight: { min: 0.1, max: 5.0 },
            prediction: { min: 0.0, max: 1.0 },
            learningRate: { min: 0.001, max: 1.0 }
        };

        if (ranges[key]) {
            return Math.max(ranges[key].min, Math.min(ranges[key].max, value || 0));
        }
        return value;
    };

    const loadPreset = (presetKey) => {
        const preset = presets[presetKey];
        setInputs(prev => ({
            ...prev,
            ...preset
        }));
        
        // Add to history
        setCalculationHistory(prev => [...prev, {
            timestamp: new Date().toLocaleTimeString(),
            action: `Loaded ${preset.name} preset`,
            values: preset
        }]);
    };

    const resetCalculator = () => {
        setInputs({
            radialVelocity: 10.0,
            restWavelength: 550,
            planetRadius: 1.1,
            stellarRadius: 1.0,
            stellarMass: 1.0,
            planetMass: 0.001,
            orbitalPeriod: 365.25,
            orbitalDistance: null,
            stellarRadiusSB: 1.0,
            stellarTemperature: 5778,
            currentWeight: 1.0,
            prediction: 0.7,
            humanFeedback: true,
            learningRate: 0.1,
            predictions: [0.8, 0.6, 0.9, 0.7],
            weights: [1.2, 0.9, 1.1, 1.0],
            stellarLuminosity: 1.0,
            stellarLuminosityEQ: 1.0,
            orbitalDistanceEQ: 1.0,
            albedo: 0.3,
        });
        
        setCalculationHistory(prev => [...prev, {
            timestamp: new Date().toLocaleTimeString(),
            action: "Calculator reset",
            values: {}
        }]);
    };

    const saveCalculation = (name) => {
        setSavedCalculations(prev => ({
            ...prev,
            [name]: {
                inputs: { ...inputs },
                timestamp: new Date().toLocaleString()
            }
        }));
        
        setCalculationHistory(prev => [...prev, {
            timestamp: new Date().toLocaleTimeString(),
            action: `Saved calculation: ${name}`,
            values: inputs
        }]);
    };

    const copyResults = (results) => {
        const text = JSON.stringify(results, null, 2);
        navigator.clipboard.writeText(text);
        
        setCalculationHistory(prev => [...prev, {
            timestamp: new Date().toLocaleTimeString(),
            action: "Results copied to clipboard",
            values: results
        }]);
    };

    // Calculate all formulas reactively
    const calculations = useMemo(() => {
        const results = {};
        
        try {
            // 1. Radial Velocity Doppler Shift: Δλ/λ = vᵣ/c
            const wavelengthShiftRatio = inputs.radialVelocity / CONSTANTS.c;
            const restWavelengthM = inputs.restWavelength * 1e-9;
            const wavelengthShift = wavelengthShiftRatio * restWavelengthM;
            const observedWavelength = restWavelengthM + wavelengthShift;
            
            results.dopplerShift = {
                wavelengthShiftRatio,
                wavelengthShiftNm: wavelengthShift * 1e9,
                observedWavelengthNm: observedWavelength * 1e9,
                formula: 'Δλ/λ = vᵣ/c'
            };
            
            // 2. Transit Method: ΔF/F = (Rₚ/Rₛ)²
            const radiusRatio = (inputs.planetRadius * CONSTANTS.R_earth) / (inputs.stellarRadius * CONSTANTS.R_sun);
            const transitDepth = radiusRatio ** 2;
            const transitDepthPpm = transitDepth * 1e6;
            
            results.transitMethod = {
                radiusRatio,
                transitDepth,
                transitDepthPpm,
                transitDepthPercent: transitDepth * 100,
                formula: 'ΔF/F = (Rₚ/Rₛ)²'
            };
            
            // 3. Kepler's 3rd Law: P² = 4π²a³/G(M* + Mₚ)
            const totalMass = (inputs.stellarMass * CONSTANTS.M_sun) + (inputs.planetMass * CONSTANTS.M_earth);
            const periodSeconds = inputs.orbitalPeriod * 24 * 3600;
            const orbitalDistanceM = ((CONSTANTS.G * totalMass * periodSeconds**2) / (4 * Math.PI**2))**(1/3);
            const orbitalDistanceAU = orbitalDistanceM / CONSTANTS.AU;
            
            results.keplersLaw = {
                orbitalDistanceAU,
                orbitalDistanceM,
                totalMass,
                formula: 'P² = 4π²a³/G(M* + Mₚ)'
            };
            
            // 4. Stefan-Boltzmann Law: L = 4πRₛ²σT⁴
            const stellarRadiusM = inputs.stellarRadiusSB * CONSTANTS.R_sun;
            const luminosityWatts = 4 * Math.PI * stellarRadiusM**2 * CONSTANTS.sigma * inputs.stellarTemperature**4;
            const luminositySolar = luminosityWatts / CONSTANTS.L_sun;
            
            results.stefanBoltzmann = {
                luminosityWatts,
                luminositySolar,
                surfaceArea: 4 * Math.PI * stellarRadiusM**2,
                formula: 'L = 4πRₛ²σT⁴'
            };
            
            // 5. Feedback-Based Knowledge Weight: wᵢ ← wᵢ - η∂L/∂wᵢ
            const h = inputs.humanFeedback ? 1.0 : 0.0;
            const P = Math.max(0.001, Math.min(0.999, inputs.prediction));
            const binaryCrossEntropyLoss = -h * Math.log(P) - (1 - h) * Math.log(1 - P);
            const lossGradient = -h / P + (1 - h) / (1 - P);
            const weightAdjustment = inputs.learningRate * lossGradient * (inputs.humanFeedback ? 0.01 : -0.01);
            const newWeight = Math.max(0.1, Math.min(2.0, inputs.currentWeight - weightAdjustment));
            
            results.feedbackWeight = {
                binaryCrossEntropyLoss,
                lossGradient,
                weightChange: newWeight - inputs.currentWeight,
                newWeight,
                formula: 'L = -h*log(P) - (1-h)*log(1-P)',
                updateFormula: 'wᵢ ← wᵢ - η∂L/∂wᵢ'
            };
            
            // 6. Aggregate Prediction: P = Σ(wᵢ * pᵢ) / Σ(wᵢ)
            const weightedSum = inputs.predictions.reduce((sum, pred, i) => sum + pred * inputs.weights[i], 0);
            const totalWeight = inputs.weights.reduce((sum, w) => sum + w, 0);
            const aggregatedPrediction = weightedSum / totalWeight;
            const predictionVariance = inputs.predictions.reduce((sum, pred) => sum + (pred - aggregatedPrediction)**2, 0) / inputs.predictions.length;
            const confidence = 1.0 - Math.min(1.0, 2 * predictionVariance);
            
            results.aggregatePrediction = {
                aggregatedPrediction,
                predictionVariance,
                confidence,
                totalWeight,
                formula: 'P = Σ(wᵢ * pᵢ) / Σ(wᵢ)'
            };
            
            // 7. Explanation Aggregation: E(t) = Σ(wᵢ * eᵢ(t)) / Σ(wᵢ)
            const explanations = ['Transit detected', 'RV signal strong', 'Imaging confirmed', 'Atmosphere analyzed'];
            const explanationWeights = inputs.weights;
            const weightedExplanations = explanations.map((exp, i) => ({
                explanation: exp,
                weight: explanationWeights[i],
                contribution: explanationWeights[i] / totalWeight
            }));
            
            results.explanationAggregation = {
                weightedExplanations,
                totalWeight,
                formula: 'E(t) = Σ(wᵢ * eᵢ(t)) / Σ(wᵢ)'
            };
            
            // 8. Aggregated Neural Knowledge: O = Σ(wᵢ * fᵢ(x))
            const neuralOutputs = inputs.predictions.map(p => Math.tanh(p * 2 - 1)); // Simulated neural outputs
            const aggregatedOutput = neuralOutputs.reduce((sum, output, i) => sum + output * inputs.weights[i], 0);
            const normalizedOutput = Math.tanh(aggregatedOutput / totalWeight);
            
            results.neuralKnowledge = {
                neuralOutputs,
                aggregatedOutput,
                normalizedOutput,
                totalWeight,
                formula: 'O = Σ(wᵢ * fᵢ(x))'
            };
            
            // 7. Habitable Zone Calculation
            const innerHZ = 0.95 * Math.sqrt(inputs.stellarLuminosity);
            const outerHZ = 1.37 * Math.sqrt(inputs.stellarLuminosity);
            const innerOptimistic = 0.75 * Math.sqrt(inputs.stellarLuminosity);
            const outerOptimistic = 1.77 * Math.sqrt(inputs.stellarLuminosity);
            
            results.habitableZone = {
                innerConservative: innerHZ,
                outerConservative: outerHZ,
                innerOptimistic,
                outerOptimistic,
                width: outerHZ - innerHZ,
                formula: 'HZ = sqrt(L*) * [0.95, 1.37] AU'
            };
            
            // 8. Equilibrium Temperature: T_eq = [(L*/(4πa²)) * (1-A) / (4σ)]^(1/4)
            const luminosityWattsEQ = inputs.stellarLuminosityEQ * CONSTANTS.L_sun;
            const flux = luminosityWattsEQ / (4 * Math.PI * (inputs.orbitalDistanceEQ * CONSTANTS.AU)**2);
            const equilibriumTempK = ((flux * (1 - inputs.albedo)) / (4 * CONSTANTS.sigma))**(1/4);
            const equilibriumTempC = equilibriumTempK - 273.15;
            
            results.equilibriumTemp = {
                temperatureK: equilibriumTempK,
                temperatureC: equilibriumTempC,
                flux,
                formula: 'T_eq = [(L*/(4πa²)) * (1-A) / (4σ)]^(1/4)'
            };
            
        } catch (error) {
            console.error('Calculation error:', error);
        }
        
        return results;
    }, [inputs]);

    const handleArrayInputChange = (field, index, value) => {
        setInputs(prev => ({
            ...prev,
            [field]: prev[field].map((item, i) => i === index ? parseFloat(value) || 0 : item)
        }));
    };

    // Generate visualization data
    const generateTransitCurve = () => {
        const timePoints = [];
        const fluxValues = [];
        const depth = calculations.transitMethod?.transitDepth || 0.01;
        const duration = 4.0; // hours
        
        for (let t = -duration; t <= duration; t += 0.1) {
            timePoints.push(t);
            const inTransit = Math.abs(t) < (duration / 2);
            const flux = inTransit ? 1 - depth : 1;
            const noise = (Math.random() - 0.5) * 0.001;
            fluxValues.push({ time: t, flux: flux + noise });
        }
        
        return fluxValues;
    };

    const generateRadialVelocityCurve = () => {
        const rvData = [];
        const period = inputs.orbitalPeriod;
        const amplitude = 10; // m/s
        
        for (let t = 0; t <= 2 * period; t += period / 50) {
            const phase = 2 * Math.PI * t / period;
            const rv = amplitude * Math.sin(phase);
            const noise = (Math.random() - 0.5) * 2;
            rvData.push({ time: t, velocity: rv + noise });
        }
        
        return rvData;
    };

    const FormulaCard = ({ title, icon: Icon, formula, result, color = "blue", children }) => (
        <Card className={`border-l-4 border-l-${color}-500`}>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Icon className={`h-5 w-5 text-${color}-500`} />
                        {title}
                    </div>
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyResults(result)}
                            className="text-xs"
                        >
                            <Copy className="w-3 h-3 mr-1" />
                            Copy
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                                const name = prompt("Enter calculation name:");
                                if (name) saveCalculation(name);
                            }}
                            className="text-xs"
                        >
                            <Save className="w-3 h-3 mr-1" />
                            Save
                        </Button>
                    </div>
                </CardTitle>
                <div className={`bg-${color}-50 p-2 rounded font-mono text-sm`}>
                    {formula}
                </div>
            </CardHeader>
            <CardContent>
                {children}
                <div className="mt-4 p-3 bg-gray-50 rounded">
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold">🧮 Calculator Results:</h4>
                        <Badge variant="secondary" className="text-xs">
                            Live Calculation
                        </Badge>
                    </div>
                    {result}
                </div>
            </CardContent>
        </Card>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">
                        🧮 Exoplanet Discovery Calculator
                    </h1>
                    <p className="text-purple-200 text-lg">
                        Interactive scientific calculator with real-time computations
                    </p>
                    <div className="flex justify-center gap-4 mt-4">
                        <Button 
                            onClick={() => loadPreset('earth')} 
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            🌍 Load Earth
                        </Button>
                        <Button 
                            onClick={() => loadPreset('kepler452b')} 
                            className="bg-green-600 hover:bg-green-700 text-white"
                        >
                            🪐 Load Kepler-452b
                        </Button>
                        <Button 
                            onClick={() => loadPreset('proxima')} 
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            ⭐ Load Proxima b
                        </Button>
                        <Button 
                            onClick={resetCalculator} 
                            className="bg-gray-600 hover:bg-gray-700 text-white"
                        >
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Reset
                        </Button>
                    </div>
                </div>

                <Tabs defaultValue="feedback" className="w-full">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-white mb-4 text-center">🧩 Core Scientific Methods</h2>
                        <TabsList className="grid w-full grid-cols-5 mb-4">
                            <TabsTrigger value="feedback" className="bg-purple-100 text-purple-800 font-bold">⚡ Novel Formula</TabsTrigger>
                            <TabsTrigger value="doppler">Radial Velocity</TabsTrigger>
                            <TabsTrigger value="transit">Transit Method</TabsTrigger>
                            <TabsTrigger value="kepler">Kepler's 3rd Law</TabsTrigger>
                            <TabsTrigger value="stefan">Stefan-Boltzmann</TabsTrigger>
                        </TabsList>
                        <h3 className="text-xl font-semibold text-white mb-2 text-center">🤖 AI Aggregation Methods</h3>
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="aggregate">Prediction</TabsTrigger>
                            <TabsTrigger value="explanation">Explanation</TabsTrigger>
                            <TabsTrigger value="neural">Neural Knowledge</TabsTrigger>
                            <TabsTrigger value="habitable">Habitable Zone</TabsTrigger>
                        </TabsList>
                    </div>

                    {/* Radial Velocity Doppler Shift */}
                    <TabsContent value="doppler">
                        <FormulaCard
                            title="Radial Velocity (Doppler Wobble)"
                            icon={Search}
                            formula="Δλ/λ = vᵣ/c"
                            color="red"
                            result={
                                calculations.dopplerShift && (
                                    <div className="space-y-2">
                                        <p><strong>Wavelength Shift:</strong> {calculations.dopplerShift.wavelengthShiftNm?.toFixed(4)} nm</p>
                                        <p><strong>Observed Wavelength:</strong> {calculations.dopplerShift.observedWavelengthNm?.toFixed(2)} nm</p>
                                        <p><strong>Shift Ratio:</strong> {(calculations.dopplerShift.wavelengthShiftRatio * 1e6)?.toFixed(2)} ppm</p>
                                    </div>
                                )
                            }
                        >
                            <div className="mb-4 p-3 bg-red-50 rounded-lg border-l-4 border-red-500">
                                <p className="text-sm text-red-700">
                                    <strong>Concept:</strong> Star's spectral shift reveals orbiting planet. 
                                    The gravitational pull of an orbiting planet causes the star to wobble, 
                                    creating Doppler shifts in the star's spectrum.
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="radialVelocity" className="flex justify-between">
                                        <span>Radial Velocity (m/s)</span>
                                        <Badge variant="outline">{inputs.radialVelocity}</Badge>
                                    </Label>
                                    <Input
                                        id="radialVelocity"
                                        type="range"
                                        min="0.1"
                                        max="100"
                                        step="0.1"
                                        value={inputs.radialVelocity}
                                        onChange={(e) => handleInputChange('radialVelocity', parseFloat(e.target.value))}
                                        className="mb-2"
                                    />
                                    <Input
                                        type="number"
                                        value={inputs.radialVelocity}
                                        onChange={(e) => handleInputChange('radialVelocity', parseFloat(e.target.value))}
                                        step="0.1"
                                        className="text-center"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="restWavelength">Rest Wavelength (nm)</Label>
                                    <Input
                                        id="restWavelength"
                                        type="number"
                                        value={inputs.restWavelength}
                                        onChange={(e) => handleInputChange('restWavelength', parseFloat(e.target.value))}
                                        step="0.1"
                                    />
                                </div>
                            </div>
                            
                            <div className="mt-4">
                                <ResponsiveContainer width="100%" height={200}>
                                    <LineChart data={generateRadialVelocityCurve()}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="time" />
                                        <YAxis />
                                        <Tooltip />
                                        <Line type="monotone" dataKey="velocity" stroke="#ef4444" strokeWidth={2} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </FormulaCard>
                    </TabsContent>

                    {/* Transit Method */}
                    <TabsContent value="transit">
                        <FormulaCard
                            title="Transit Method"
                            icon={Globe}
                            formula="ΔF/F = (Rₚ/Rₛ)²"
                            color="green"
                            result={
                                calculations.transitMethod && (
                                    <div className="space-y-2">
                                        <p><strong>Transit Depth:</strong> {calculations.transitMethod.transitDepthPpm?.toFixed(0)} ppm</p>
                                        <p><strong>Radius Ratio:</strong> {calculations.transitMethod.radiusRatio?.toFixed(4)}</p>
                                        <p><strong>Depth (%):</strong> {calculations.transitMethod.transitDepthPercent?.toFixed(3)}%</p>
                                    </div>
                                )
                            }
                        >
                            <div className="mb-4 p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
                                <p className="text-sm text-green-700">
                                    <strong>Concept:</strong> Planet blocks starlight during transit. 
                                    When a planet passes in front of its host star, it causes a small, 
                                    periodic dimming proportional to the planet's cross-sectional area.
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="planetRadius">Planet Radius (R⊕)</Label>
                                    <Input
                                        id="planetRadius"
                                        type="number"
                                        value={inputs.planetRadius}
                                        onChange={(e) => handleInputChange('planetRadius', parseFloat(e.target.value))}
                                        step="0.1"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="stellarRadius">Stellar Radius (R☉)</Label>
                                    <Input
                                        id="stellarRadius"
                                        type="number"
                                        value={inputs.stellarRadius}
                                        onChange={(e) => handleInputChange('stellarRadius', parseFloat(e.target.value))}
                                        step="0.1"
                                    />
                                </div>
                            </div>

                            <div className="mt-4">
                                <ResponsiveContainer width="100%" height={200}>
                                    <LineChart data={generateTransitCurve()}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="time" />
                                        <YAxis domain={['dataMin - 0.001', 'dataMax + 0.001']} />
                                        <Tooltip />
                                        <Line type="monotone" dataKey="flux" stroke="#10b981" strokeWidth={2} dot={false} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </FormulaCard>
                    </TabsContent>

                    {/* Kepler's 3rd Law */}
                    <TabsContent value="kepler">
                        <FormulaCard
                            title="Kepler's 3rd Law"
                            icon={Atom}
                            formula="P² = 4π²a³/G(M* + Mₚ)"
                            color="blue"
                            result={
                                calculations.keplersLaw && (
                                    <div className="space-y-2">
                                        <p><strong>Orbital Distance:</strong> {calculations.keplersLaw.orbitalDistanceAU?.toFixed(3)} AU</p>
                                        <p><strong>Total System Mass:</strong> {(calculations.keplersLaw.totalMass / CONSTANTS.M_sun)?.toFixed(3)} M☉</p>
                                        <p><strong>Distance (km):</strong> {(calculations.keplersLaw.orbitalDistanceM / 1000)?.toExponential(2)} km</p>
                                    </div>
                                )
                            }
                        >
                            <div className="mb-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                                <p className="text-sm text-blue-700">
                                    <strong>Concept:</strong> Orbital period ↔ distance relation. 
                                    The square of the orbital period is proportional to the cube of the 
                                    semi-major axis, fundamental for determining planetary orbits.
                                </p>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <Label htmlFor="stellarMass">Stellar Mass (M☉)</Label>
                                    <Input
                                        id="stellarMass"
                                        type="number"
                                        value={inputs.stellarMass}
                                        onChange={(e) => handleInputChange('stellarMass', parseFloat(e.target.value))}
                                        step="0.1"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="planetMass">Planet Mass (M⊕)</Label>
                                    <Input
                                        id="planetMass"
                                        type="number"
                                        value={inputs.planetMass}
                                        onChange={(e) => handleInputChange('planetMass', parseFloat(e.target.value))}
                                        step="0.001"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="orbitalPeriod">Orbital Period (days)</Label>
                                    <Input
                                        id="orbitalPeriod"
                                        type="number"
                                        value={inputs.orbitalPeriod}
                                        onChange={(e) => handleInputChange('orbitalPeriod', parseFloat(e.target.value))}
                                        step="1"
                                    />
                                </div>
                            </div>
                        </FormulaCard>
                    </TabsContent>

                    {/* Stefan-Boltzmann Law */}
                    <TabsContent value="stefan">
                        <FormulaCard
                            title="Stefan-Boltzmann Law"
                            icon={Zap}
                            formula="L = 4πRₛ²σT⁴"
                            color="yellow"
                            result={
                                calculations.stefanBoltzmann && (
                                    <div className="space-y-2">
                                        <p><strong>Luminosity:</strong> {calculations.stefanBoltzmann.luminositySolar?.toFixed(2)} L☉</p>
                                        <p><strong>Luminosity (Watts):</strong> {calculations.stefanBoltzmann.luminosityWatts?.toExponential(2)} W</p>
                                        <p><strong>Surface Area:</strong> {calculations.stefanBoltzmann.surfaceArea?.toExponential(2)} m²</p>
                                    </div>
                                )
                            }
                        >
                            <div className="mb-4 p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
                                <p className="text-sm text-yellow-700">
                                    <strong>Concept:</strong> Star's luminosity ↔ temperature. 
                                    The total energy radiated by a star is proportional to its surface area 
                                    and the fourth power of its effective temperature.
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="stellarRadiusSB">Stellar Radius (R☉)</Label>
                                    <Input
                                        id="stellarRadiusSB"
                                        type="number"
                                        value={inputs.stellarRadiusSB}
                                        onChange={(e) => handleInputChange('stellarRadiusSB', parseFloat(e.target.value))}
                                        step="0.1"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="stellarTemperature">Temperature (K)</Label>
                                    <Input
                                        id="stellarTemperature"
                                        type="number"
                                        value={inputs.stellarTemperature}
                                        onChange={(e) => handleInputChange('stellarTemperature', parseFloat(e.target.value))}
                                        step="50"
                                    />
                                </div>
                            </div>
                        </FormulaCard>
                    </TabsContent>

                    {/* Feedback-Based Knowledge Weight - NOVEL CONTRIBUTION */}
                    <TabsContent value="feedback">
                        <FormulaCard
                            title="⚡ Surprise Factor — Feedback-Based Knowledge Weight (NOVEL)"
                            icon={Brain}
                            formula="wᵢ ← wᵢ - η∂L/∂wᵢ where L = -h log P - (1-h) log(1-P)"
                            color="purple"
                            result={
                                calculations.feedbackWeight && (
                                    <div className="space-y-3">
                                        <div className="bg-purple-50 p-3 rounded-lg border-l-4 border-purple-500">
                                            <h4 className="font-bold text-purple-800 mb-2">⚡ Surprise Factor — Novel Reliability Formula</h4>
                                            <p className="text-sm text-purple-700 mb-2">
                                                <strong>Meaning:</strong> Each AI helper's reliability weight (wᵢ) is updated using gradient descent 
                                                on the binary cross-entropy loss between its prediction (P) and the true outcome (h).
                                            </p>
                                            <ul className="text-xs text-purple-600 space-y-1">
                                                <li>• <strong>Good performers</strong> gain higher weights</li>
                                                <li>• <strong>Poor performers</strong> are penalized</li>
                                                <li>👉 <strong>This dynamic weighting system</strong> boosts overall accuracy and builds trust in AI-driven space exploration</li>
                                            </ul>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p><strong>Binary Cross-Entropy Loss:</strong> {calculations.feedbackWeight.binaryCrossEntropyLoss?.toFixed(4)}</p>
                                                <p><strong>Loss Gradient:</strong> {calculations.feedbackWeight.lossGradient?.toFixed(4)}</p>
                                            </div>
                                            <div>
                                                <p><strong>Weight Change:</strong> {calculations.feedbackWeight.weightChange?.toFixed(4)}</p>
                                                <p><strong>New Reliability Weight:</strong> {calculations.feedbackWeight.newWeight?.toFixed(4)}</p>
                                            </div>
                                        </div>
                                        <div className="bg-gradient-to-r from-purple-100 to-blue-100 p-2 rounded text-sm">
                                            <strong>Impact:</strong> This formula enables AI helpers to learn from human feedback, 
                                            making planet hunting faster and more reliable through collaborative intelligence.
                                        </div>
                                    </div>
                                )
                            }
                        >
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="currentWeight">Current Weight</Label>
                                    <Input
                                        id="currentWeight"
                                        type="number"
                                        value={inputs.currentWeight}
                                        onChange={(e) => handleInputChange('currentWeight', parseFloat(e.target.value))}
                                        step="0.1"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="prediction">Prediction (0-1)</Label>
                                    <Input
                                        id="prediction"
                                        type="number"
                                        value={inputs.prediction}
                                        onChange={(e) => handleInputChange('prediction', parseFloat(e.target.value))}
                                        step="0.1"
                                        min="0"
                                        max="1"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="learningRate">Learning Rate η</Label>
                                    <Input
                                        id="learningRate"
                                        type="number"
                                        value={inputs.learningRate}
                                        onChange={(e) => handleInputChange('learningRate', parseFloat(e.target.value))}
                                        step="0.01"
                                    />
                                </div>
                                <div className="flex items-center space-x-2">
                                    <input
                                        id="humanFeedback"
                                        type="checkbox"
                                        checked={inputs.humanFeedback}
                                        onChange={(e) => handleInputChange('humanFeedback', e.target.checked)}
                                        className="h-4 w-4"
                                    />
                                    <Label htmlFor="humanFeedback">Correct Prediction</Label>
                                </div>
                            </div>
                        </FormulaCard>
                    </TabsContent>

                    {/* Aggregate Prediction */}
                    <TabsContent value="aggregate">
                        <FormulaCard
                            title="Aggregate Prediction"
                            icon={Calculator}
                            formula="P = Σ(wᵢ * pᵢ) / Σ(wᵢ)"
                            color="indigo"
                            result={
                                calculations.aggregatePrediction && (
                                    <div className="space-y-2">
                                        <p><strong>Aggregated Prediction:</strong> {calculations.aggregatePrediction.aggregatedPrediction?.toFixed(4)}</p>
                                        <p><strong>Confidence:</strong> {(calculations.aggregatePrediction.confidence * 100)?.toFixed(1)}%</p>
                                        <p><strong>Variance:</strong> {calculations.aggregatePrediction.predictionVariance?.toFixed(4)}</p>
                                        <p><strong>Total Weight:</strong> {calculations.aggregatePrediction.totalWeight?.toFixed(2)}</p>
                                    </div>
                                )
                            }
                        >
                            <div className="space-y-4">
                                <div>
                                    <Label>AI Helper Predictions:</Label>
                                    <div className="grid grid-cols-4 gap-2 mt-2">
                                        {inputs.predictions.map((pred, i) => (
                                            <Input
                                                key={i}
                                                type="number"
                                                value={pred}
                                                onChange={(e) => handleArrayInputChange('predictions', i, e.target.value)}
                                                step="0.1"
                                                min="0"
                                                max="1"
                                            />
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <Label>Reliability Weights:</Label>
                                    <div className="grid grid-cols-4 gap-2 mt-2">
                                        {inputs.weights.map((weight, i) => (
                                            <Input
                                                key={i}
                                                type="number"
                                                value={weight}
                                                onChange={(e) => handleArrayInputChange('weights', i, e.target.value)}
                                                step="0.1"
                                                min="0.1"
                                                max="2"
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4">
                                <ResponsiveContainer width="100%" height={200}>
                                    <BarChart data={inputs.predictions.map((pred, i) => ({
                                        helper: `AI ${i+1}`,
                                        prediction: pred,
                                        weight: inputs.weights[i]
                                    }))}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="helper" />
                                        <YAxis />
                                        <Tooltip />
                                        <Bar dataKey="prediction" fill="#6366f1" />
                                        <Bar dataKey="weight" fill="#8b5cf6" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </FormulaCard>
                    </TabsContent>

                    {/* Habitable Zone */}
                    <TabsContent value="habitable">
                        <FormulaCard
                            title="Habitable Zone Calculation"
                            icon={Globe}
                            formula="HZ = sqrt(L*) * [0.95, 1.37] AU"
                            color="green"
                            result={
                                calculations.habitableZone && (
                                    <div className="space-y-2">
                                        <p><strong>Conservative HZ:</strong> {calculations.habitableZone.innerConservative?.toFixed(2)} - {calculations.habitableZone.outerConservative?.toFixed(2)} AU</p>
                                        <p><strong>Optimistic HZ:</strong> {calculations.habitableZone.innerOptimistic?.toFixed(2)} - {calculations.habitableZone.outerOptimistic?.toFixed(2)} AU</p>
                                        <p><strong>HZ Width:</strong> {calculations.habitableZone.width?.toFixed(2)} AU</p>
                                    </div>
                                )
                            }
                        >
                            <div>
                                <Label htmlFor="stellarLuminosity">Stellar Luminosity (L☉)</Label>
                                <Input
                                    id="stellarLuminosity"
                                    type="number"
                                    value={inputs.stellarLuminosity}
                                    onChange={(e) => handleInputChange('stellarLuminosity', parseFloat(e.target.value))}
                                    step="0.1"
                                />
                            </div>

                            <div className="mt-4 p-4 bg-green-50 rounded">
                                <div className="relative h-8 bg-gradient-to-r from-red-500 via-green-500 to-blue-500 rounded">
                                    <div 
                                        className="absolute h-full bg-green-400 opacity-70 rounded"
                                        style={{
                                            left: `${(calculations.habitableZone?.innerConservative || 0) * 20}%`,
                                            width: `${(calculations.habitableZone?.width || 0) * 20}%`
                                        }}
                                    />
                                </div>
                                <div className="text-xs text-center mt-1 text-green-700">
                                    Conservative Habitable Zone
                                </div>
                            </div>
                        </FormulaCard>
                    </TabsContent>

                    {/* Equilibrium Temperature */}
                    <TabsContent value="temperature">
                        <FormulaCard
                            title="Equilibrium Temperature"
                            icon={Zap}
                            formula="T_eq = [(L*/(4πa²)) * (1-A) / (4σ)]^(1/4)"
                            color="orange"
                            result={
                                calculations.equilibriumTemp && (
                                    <div className="space-y-2">
                                        <p><strong>Temperature:</strong> {calculations.equilibriumTemp.temperatureK?.toFixed(0)} K ({calculations.equilibriumTemp.temperatureC?.toFixed(0)}°C)</p>
                                        <p><strong>Stellar Flux:</strong> {calculations.equilibriumTemp.flux?.toFixed(0)} W/m²</p>
                                        <p><strong>Habitability:</strong> 
                                            <Badge variant={calculations.equilibriumTemp.temperatureC > -20 && calculations.equilibriumTemp.temperatureC < 60 ? "default" : "destructive"}>
                                                {calculations.equilibriumTemp.temperatureC > -20 && calculations.equilibriumTemp.temperatureC < 60 ? "Potentially Habitable" : "Likely Uninhabitable"}
                                            </Badge>
                                        </p>
                                    </div>
                                )
                            }
                        >
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <Label htmlFor="stellarLuminosityEQ">Stellar Luminosity (L☉)</Label>
                                    <Input
                                        id="stellarLuminosityEQ"
                                        type="number"
                                        value={inputs.stellarLuminosityEQ}
                                        onChange={(e) => handleInputChange('stellarLuminosityEQ', parseFloat(e.target.value))}
                                        step="0.1"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="orbitalDistanceEQ">Orbital Distance (AU)</Label>
                                    <Input
                                        id="orbitalDistanceEQ"
                                        type="number"
                                        value={inputs.orbitalDistanceEQ}
                                        onChange={(e) => handleInputChange('orbitalDistanceEQ', parseFloat(e.target.value))}
                                        step="0.1"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="albedo">Albedo (0-1)</Label>
                                    <Input
                                        id="albedo"
                                        type="number"
                                        value={inputs.albedo}
                                        onChange={(e) => handleInputChange('albedo', parseFloat(e.target.value))}
                                        step="0.1"
                                        min="0"
                                        max="1"
                                    />
                                </div>
                            </div>

                            <div className="mt-4 p-4 rounded" style={{
                                background: `linear-gradient(90deg, 
                                    #3b82f6 0%, 
                                    #10b981 ${Math.max(0, Math.min(100, (calculations.equilibriumTemp?.temperatureC + 50) * 2))}%, 
                                    #ef4444 100%)`
                            }}>
                                <div className="text-center text-white font-bold">
                                    Temperature Scale: {calculations.equilibriumTemp?.temperatureC?.toFixed(0)}°C
                                </div>
                            </div>
                        </FormulaCard>
                    </TabsContent>

                    {/* Explanation Aggregation */}
                    <TabsContent value="explanation">
                        <FormulaCard
                            title="Explanation Aggregation"
                            icon={Brain}
                            formula="E(t) = Σ(wᵢ * eᵢ(t)) / Σ(wᵢ)"
                            color="indigo"
                            result={
                                calculations.explanationAggregation && (
                                    <div className="space-y-3">
                                        <div className="bg-indigo-50 p-3 rounded-lg">
                                            <h4 className="font-bold text-indigo-800 mb-2">🧠 Weighted Explanations</h4>
                                            {calculations.explanationAggregation.weightedExplanations.map((item, i) => (
                                                <div key={i} className="flex justify-between items-center py-1">
                                                    <span className="text-sm">{item.explanation}</span>
                                                    <div className="text-right">
                                                        <span className="text-xs text-indigo-600">Weight: {item.weight.toFixed(2)}</span>
                                                        <div className="text-xs text-indigo-500">({(item.contribution * 100).toFixed(1)}%)</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <p><strong>Total Weight:</strong> {calculations.explanationAggregation.totalWeight.toFixed(3)}</p>
                                        <div className="bg-gradient-to-r from-indigo-100 to-purple-100 p-2 rounded text-sm">
                                            <strong>Purpose:</strong> Combines multiple AI explanations weighted by their reliability scores
                                        </div>
                                    </div>
                                )
                            }
                        >
                            <div className="text-center text-gray-600">
                                <p className="mb-2">This formula aggregates explanations from multiple AI helpers,</p>
                                <p>weighting each explanation by the helper's reliability score.</p>
                            </div>
                        </FormulaCard>
                    </TabsContent>

                    {/* Neural Knowledge Aggregation */}
                    <TabsContent value="neural">
                        <FormulaCard
                            title="Aggregated Neural Knowledge"
                            icon={Brain}
                            formula="O = Σ(wᵢ * fᵢ(x))"
                            color="cyan"
                            result={
                                calculations.neuralKnowledge && (
                                    <div className="space-y-3">
                                        <div className="bg-cyan-50 p-3 rounded-lg">
                                            <h4 className="font-bold text-cyan-800 mb-2">🧮 Neural Network Outputs</h4>
                                            <div className="grid grid-cols-2 gap-2">
                                                {calculations.neuralKnowledge.neuralOutputs.map((output, i) => (
                                                    <div key={i} className="text-sm">
                                                        <span>Helper {i+1}: {output.toFixed(3)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p><strong>Raw Aggregated:</strong> {calculations.neuralKnowledge.aggregatedOutput.toFixed(4)}</p>
                                                <p><strong>Normalized Output:</strong> {calculations.neuralKnowledge.normalizedOutput.toFixed(4)}</p>
                                            </div>
                                            <div>
                                                <p><strong>Total Weight:</strong> {calculations.neuralKnowledge.totalWeight.toFixed(3)}</p>
                                                <p><strong>Confidence:</strong> {(Math.abs(calculations.neuralKnowledge.normalizedOutput) * 100).toFixed(1)}%</p>
                                            </div>
                                        </div>
                                        <div className="bg-gradient-to-r from-cyan-100 to-blue-100 p-2 rounded text-sm">
                                            <strong>Purpose:</strong> Combines neural network outputs from multiple AI helpers using weighted aggregation
                                        </div>
                                    </div>
                                )
                            }
                        >
                            <div className="text-center text-gray-600">
                                <p className="mb-2">This formula aggregates knowledge from multiple neural networks,</p>
                                <p>combining their outputs based on reliability weights.</p>
                            </div>
                        </FormulaCard>
                    </TabsContent>
                </Tabs>

                {/* Calculator History Panel */}
                {calculationHistory.length > 0 && (
                    <Card className="mt-8">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calculator className="h-5 w-5" />
                                Calculation History
                                <Badge variant="secondary">{calculationHistory.length}</Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="max-h-60 overflow-y-auto space-y-2">
                                {calculationHistory.slice(-10).reverse().map((entry, index) => (
                                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded text-sm">
                                        <span>{entry.action}</span>
                                        <span className="text-gray-500">{entry.timestamp}</span>
                                    </div>
                                ))}
                            </div>
                            <Button 
                                onClick={() => setCalculationHistory([])} 
                                variant="outline" 
                                size="sm" 
                                className="mt-2"
                            >
                                Clear History
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Saved Calculations Panel */}
                {Object.keys(savedCalculations).length > 0 && (
                    <Card className="mt-4">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Save className="h-5 w-5" />
                                Saved Calculations
                                <Badge variant="secondary">{Object.keys(savedCalculations).length}</Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {Object.entries(savedCalculations).map(([name, calc]) => (
                                    <div key={name} className="p-3 border rounded-lg">
                                        <h4 className="font-semibold text-sm mb-1">{name}</h4>
                                        <p className="text-xs text-gray-500 mb-2">{calc.timestamp}</p>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => setInputs(calc.inputs)}
                                            className="w-full text-xs"
                                        >
                                            Load Values
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default InteractiveFormulas;