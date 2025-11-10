import React from 'react';
import './Visualizer.css';

const Visualizer = () => {
  return (
    <div className="visualizer-page">
      <div className="visualizer-hero">
        <h1 className="visualizer-title">
          <span className="gradient-text">Exoplanetary Laboratory</span>
        </h1>
        <p className="visualizer-subtitle">
          Explore, Create & Analyze Planets Across the Universe
        </p>
        <div className="visualizer-badges">
          <div className="info-badge">
            <span className="badge-icon">🌍</span>
            <span className="badge-text">3D Solar System</span>
          </div>
          <div className="info-badge">
            <span className="badge-icon">🔭</span>
            <span className="badge-text">Exoplanet Explorer</span>
          </div>
          <div className="info-badge">
            <span className="badge-icon">🎨</span>
            <span className="badge-text">Custom Planet Creator</span>
          </div>
          <div className="info-badge">
            <span className="badge-icon">📊</span>
            <span className="badge-text">Research Tools</span>
          </div>
        </div>
      </div>

      <div className="visualizer-iframe-wrapper">
        <iframe
          src="/planetVisualizer.html"
          title="Planet Visualizer - Interactive 3D Solar System and Exoplanet Explorer"
          className="visualizer-iframe"
          allowFullScreen
        />
      </div>

      <div className="visualizer-footer">
        <div className="footer-grid">
          <div className="footer-section">
            <h3>About This Visualizer</h3>
            <p>
              This interactive 3D tool allows you to explore our Solar System, 
              discover exoplanets, create custom planets, and compare celestial bodies 
              using real data from NASA missions like Kepler, TESS, and others.
            </p>
          </div>
          <div className="footer-section">
            <h3>Features</h3>
            <ul>
              <li>🌌 Interactive 3D Solar System with all 8 planets</li>
              <li>🪐 Explore real exoplanets (Proxima b, TRAPPIST-1e, etc.)</li>
              <li>🎨 Create and customize your own planets</li>
              <li>📊 Compare planets with research tools</li>
              <li>🎮 Control orbital speed and zoom levels</li>
            </ul>
          </div>
          <div className="footer-section">
            <h3>Data Sources</h3>
            <ul>
              <li>NASA Exoplanet Archive</li>
              <li>Kepler Space Telescope</li>
              <li>TESS Mission</li>
              <li>ESA Gaia Mission</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Visualizer;
