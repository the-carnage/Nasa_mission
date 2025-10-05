import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Calculator, Atom, Zap, Globe, Brain, Copy, BookOpen, Star, Target, Rocket } from 'lucide-react';
import SimpleCalculator from '../components/SimpleCalculator';
import './Formulas.css';

// Enhanced formula database with more scientific formulas
const FORMULAS_DATABASE = [
  {
    id: 1,
    title: "Novel AI Feedback Weight Formula",
    category: "machine-learning",
    difficulty: "advanced",
    formula: "w₍ᵢ₎ ← w₍ᵢ₎ - η∂L/∂w₍ᵢ₎ where L = -h log P - (1-h) log(1-P)",
    description: "Revolutionary formula for dynamically adjusting AI model weights based on human feedback and prediction accuracy in exoplanet discovery.",
    variables: [
      { symbol: "w₍ᵢ₎", name: "Reliability Weight", unit: "dimensionless" },
      { symbol: "η", name: "Learning Rate", unit: "dimensionless" },
      { symbol: "L", name: "Binary Cross-Entropy Loss", unit: "dimensionless" },
      { symbol: "h", name: "Human Feedback", unit: "binary (0/1)" },
      { symbol: "P", name: "Prediction Confidence", unit: "probability (0-1)" }
    ],
    explanation: "This novel formula enables AI systems to learn from human expert feedback, continuously improving their reliability in identifying exoplanets.",
    applications: ["Exoplanet Detection", "AI Training", "Expert Systems", "Machine Learning"]
  },
  {
    id: 2,
    title: "Radial Velocity (Doppler Shift)",
    category: "astronomy",
    difficulty: "intermediate",
    formula: "Δλ/λ = vᵣ/c",
    description: "Measures the wobbling motion of a star caused by the gravitational pull of orbiting planets.",
    variables: [
      { symbol: "Δλ", name: "Wavelength Shift", unit: "nm" },
      { symbol: "λ", name: "Rest Wavelength", unit: "nm" },
      { symbol: "vᵣ", name: "Radial Velocity", unit: "m/s" },
      { symbol: "c", name: "Speed of Light", unit: "m/s" }
    ],
    explanation: "When a planet orbits a star, it causes the star to wobble slightly. This motion creates Doppler shifts in the star's light spectrum.",
    applications: ["Exoplanet Detection", "Stellar Motion", "Spectroscopy"]
  },
  {
    id: 3,
    title: "Transit Method",
    category: "astronomy",
    difficulty: "beginner",
    formula: "ΔF/F = (Rₚ/Rₛ)²",
    description: "Calculates the dimming of starlight when a planet passes in front of its host star.",
    variables: [
      { symbol: "ΔF", name: "Flux Decrease", unit: "luminosity units" },
      { symbol: "F", name: "Total Flux", unit: "luminosity units" },
      { symbol: "Rₚ", name: "Planet Radius", unit: "R⊕" },
      { symbol: "Rₛ", name: "Stellar Radius", unit: "R☉" }
    ],
    explanation: "The transit method detects exoplanets by measuring the periodic dimming of a star as a planet crosses in front of it.",
    applications: ["Exoplanet Detection", "Planet Size Determination", "Photometry"]
  },
  {
    id: 4,
    title: "Kepler's Third Law",
    category: "physics",
    difficulty: "intermediate",
    formula: "P² = 4π²a³/G(M* + Mₚ)",
    description: "Relates orbital period to orbital distance and system mass for planetary orbits.",
    variables: [
      { symbol: "P", name: "Orbital Period", unit: "days" },
      { symbol: "a", name: "Semi-major Axis", unit: "AU" },
      { symbol: "G", name: "Gravitational Constant", unit: "m³/kg/s²" },
      { symbol: "M*", name: "Stellar Mass", unit: "M☉" },
      { symbol: "Mₚ", name: "Planet Mass", unit: "M⊕" }
    ],
    explanation: "This fundamental law of orbital mechanics allows us to determine orbital distances from observed periods.",
    applications: ["Orbital Mechanics", "Mass Determination", "System Architecture"]
  },
  {
    id: 5,
    title: "Stefan-Boltzmann Law",
    category: "physics",
    difficulty: "intermediate",
    formula: "L = 4πRₛ²σT⁴",
    description: "Calculates stellar luminosity based on surface temperature and radius.",
    variables: [
      { symbol: "L", name: "Luminosity", unit: "L☉" },
      { symbol: "Rₛ", name: "Stellar Radius", unit: "R☉" },
      { symbol: "σ", name: "Stefan-Boltzmann Constant", unit: "W/m²/K⁴" },
      { symbol: "T", name: "Effective Temperature", unit: "K" }
    ],
    explanation: "This law describes how the total energy radiated by a star depends on its size and temperature.",
    applications: ["Stellar Physics", "Temperature Measurement", "Energy Output"]
  },
  {
    id: 6,
    title: "Habitable Zone Calculation",
    category: "astrobiology",
    difficulty: "advanced",
    formula: "HZ = √(L*) × [0.95, 1.37] AU",
    description: "Determines the range of orbital distances where liquid water could exist on a planet's surface.",
    variables: [
      { symbol: "HZ", name: "Habitable Zone", unit: "AU" },
      { symbol: "L*", name: "Stellar Luminosity", unit: "L☉" }
    ],
    explanation: "The habitable zone is the orbital distance range where temperatures allow liquid water to exist.",
    applications: ["Astrobiology", "Planet Habitability", "Life Detection"]
  }
];

const Formulas = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeView, setActiveView] = useState('gallery'); // 'gallery' or 'calculator'

  const categories = [
    { id: 'all', name: 'All Formulas', icon: BookOpen, count: FORMULAS_DATABASE.length },
    { id: 'machine-learning', name: 'AI & ML', icon: Brain, count: FORMULAS_DATABASE.filter(f => f.category === 'machine-learning').length },
    { id: 'astronomy', name: 'Astronomy', icon: Star, count: FORMULAS_DATABASE.filter(f => f.category === 'astronomy').length },
    { id: 'physics', name: 'Physics', icon: Atom, count: FORMULAS_DATABASE.filter(f => f.category === 'physics').length },
    { id: 'astrobiology', name: 'Astrobiology', icon: Target, count: FORMULAS_DATABASE.filter(f => f.category === 'astrobiology').length }
  ];

  const filteredFormulas = useMemo(() => {
    return FORMULAS_DATABASE.filter(formula => {
      const matchesSearch = formula.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           formula.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           formula.formula.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || formula.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-500';
      case 'intermediate': return 'bg-yellow-500';
      case 'advanced': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const copyFormula = (formula) => {
    navigator.clipboard.writeText(formula.formula);
    // You could add a toast notification here
  };

  return (
    <div className="formulas-page-wrapper">
      {/* Hero Section */}
      <section className="formulas">
        <motion.div 
          className="formulas-header"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="page-title gradient-text">
            🧮 Scientific Formulas
          </h1>
          <p className="page-description">
            Comprehensive collection of mathematical formulas for exoplanet discovery, 
            astrophysics calculations, and cutting-edge AI methodologies.
          </p>
          
          {/* View Toggle */}
          <div className="view-toggle">
            <button 
              className={`toggle-btn ${activeView === 'gallery' ? 'active' : ''}`}
              onClick={() => setActiveView('gallery')}
            >
              <BookOpen className="w-4 h-4" />
              Formula Gallery
            </button>
            <button 
              className={`toggle-btn ${activeView === 'calculator' ? 'active' : ''}`}
              onClick={() => setActiveView('calculator')}
            >
              <Calculator className="w-4 h-4" />
              Interactive Calculator
            </button>
          </div>
        </motion.div>

        {activeView === 'gallery' && (
          <>
            {/* Controls */}
            <motion.div 
              className="formulas-controls"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              {/* Search */}
              <div className="search-container">
                <Search className="search-icon" size={20} />
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search formulas, descriptions, or equations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Category Filters */}
              <div className="category-filters">
                {categories.map((category) => {
                  const IconComponent = category.icon;
                  return (
                    <button
                      key={category.id}
                      className={`category-filter ${
                        selectedCategory === category.id ? 'active' : ''
                      }`}
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      <IconComponent size={16} />
                      {category.name}
                      <span className="category-count">({category.count})</span>
                    </button>
                  );
                })}
              </div>
            </motion.div>

            {/* Formulas Grid */}
            <motion.div 
              className="formulas-grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              {filteredFormulas.length > 0 ? (
                filteredFormulas.map((formula, index) => (
                  <motion.div
                    key={formula.id}
                    className="formula-card"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <div className="formula-header">
                      <div className="formula-title-section">
                        <h3 className="formula-title">{formula.title}</h3>
                        <div className="formula-meta">
                          <div className={`difficulty-badge ${getDifficultyColor(formula.difficulty)}`}>
                            {formula.difficulty}
                          </div>
                          <div className="category-badge">
                            {formula.category.replace('-', ' ')}
                          </div>
                        </div>
                      </div>
                      <button 
                        className="copy-button"
                        onClick={() => copyFormula(formula)}
                        title="Copy formula"
                      >
                        <Copy size={16} />
                      </button>
                    </div>

                    <p className="formula-description">{formula.description}</p>

                    <div className="formula-display">
                      <div className="formula-text">{formula.formula}</div>
                    </div>

                    <div className="formula-variables">
                      <h4>
                        <Atom size={16} />
                        Variables
                      </h4>
                      <div className="variables-list">
                        {formula.variables.map((variable, idx) => (
                          <div key={idx} className="variable-item">
                            <span className="variable-symbol">{variable.symbol}</span>
                            <span className="variable-name">{variable.name}</span>
                            <span className="variable-unit">{variable.unit}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="formula-explanation">
                      <h4>
                        <Brain size={16} />
                        Explanation
                      </h4>
                      <p>{formula.explanation}</p>
                    </div>

                    <div className="formula-applications">
                      <h4>
                        <Rocket size={16} />
                        Applications
                      </h4>
                      <div className="applications-list">
                        {formula.applications.map((app, idx) => (
                          <span key={idx} className="application-tag">{app}</span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <motion.div 
                  className="no-results"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6 }}
                >
                  <Search size={48} />
                  <h3>No formulas found</h3>
                  <p>Try adjusting your search terms or category filters</p>
                </motion.div>
              )}
            </motion.div>

            {/* Quick Reference Section */}
            <motion.div 
              className="quick-reference"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <h2>Quick Reference</h2>
              <div className="reference-grid">
                <div className="reference-card">
                  <Globe size={32} />
                  <h3>Exoplanet Constants</h3>
                  <ul>
                    <li>R⊕ = 6.371 × 10⁶ m</li>
                    <li>M⊕ = 5.972 × 10²⁴ kg</li>
                    <li>R☉ = 6.96 × 10⁸ m</li>
                    <li>M☉ = 1.989 × 10³⁰ kg</li>
                  </ul>
                </div>
                <div className="reference-card">
                  <Zap size={32} />
                  <h3>Physical Constants</h3>
                  <ul>
                    <li>c = 2.998 × 10⁸ m/s</li>
                    <li>G = 6.674 × 10⁻¹¹ m³/kg/s²</li>
                    <li>σ = 5.670 × 10⁻⁸ W/m²/K⁴</li>
                    <li>1 AU = 1.496 × 10¹¹ m</li>
                  </ul>
                </div>
                <div className="reference-card">
                  <Brain size={32} />
                  <h3>AI/ML Terms</h3>
                  <ul>
                    <li>η = Learning Rate</li>
                    <li>L = Loss Function</li>
                    <li>w = Weight Parameter</li>
                    <li>P = Prediction Confidence</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </>
        )}

        {activeView === 'calculator' && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <SimpleCalculator />
          </motion.div>
        )}
      </section>
    </div>
  );
};

export default Formulas;
