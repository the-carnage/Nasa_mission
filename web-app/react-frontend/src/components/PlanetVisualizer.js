import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import './PlanetVisualizer.css';

const PlanetVisualizer = () => {
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const raycasterRef = useRef(null);
  const mouseRef = useRef(new THREE.Vector2());
  const planets3DRef = useRef({});
  const orbitSpeedsRef = useRef({});
  const animationIdRef = useRef(null);
  
  const [activeTab, setActiveTab] = useState('solar-system');
  const [animationSpeed, setAnimationSpeed] = useState(1);
  const [selectedPlanet, setSelectedPlanet] = useState('sun');
  const [customPlanets, setCustomPlanets] = useState([]);

  const solarSystemData = {
    sun: {
      name: 'The Sun',
      type: 'G-type Main-Sequence Star',
      diameter: '1,391,000 km',
      distance: 'Center of Solar System',
      period: 'N/A',
      day: '~27 Earth days',
      moons: '0',
      temp: '5,778 K (surface)',
      atmosphere: '0',
      description: 'The Sun is the star at the center of our Solar System. It is a nearly perfect sphere of hot plasma, accounting for about 99.86% of the total mass of the Solar System.',
      color: '#ffd700',
      habitability: 0
    },
    earth: {
      name: 'Earth',
      type: 'Terrestrial Planet',
      diameter: '12,742 km',
      distance: '149.6 million km',
      period: '365.25 days',
      day: '24 hours',
      moons: '1 (The Moon)',
      temp: '15°C (avg)',
      atmosphere: '1.0',
      description: 'Earth is the third planet from the Sun and the only astronomical object known to harbor life. About 71% of Earth\'s surface is covered with water.',
      color: '#4a90e2',
      habitability: 100
    },
    mars: {
      name: 'Mars',
      type: 'Terrestrial Planet',
      diameter: '6,779 km',
      distance: '227.9 million km',
      period: '687 Earth days',
      day: '24.6 hours',
      moons: '2 (Phobos, Deimos)',
      temp: '-65°C (avg)',
      atmosphere: '0.006',
      description: 'Mars is often called the "Red Planet." It has surface features reminiscent of both the impact craters of the Moon and the valleys, deserts, and polar ice caps of Earth.',
      color: '#e27b58',
      habitability: 35
    }
  };

  const exoplanetData = {
    'proxima-b': {
      name: 'Proxima Centauri b',
      type: 'Super-Earth',
      diameter: '14,700 km (est.)',
      distance: '7.5 million km (from Proxima Centauri)',
      period: '11.2 Earth days',
      day: 'Tidally locked',
      moons: 'Unknown',
      temp: '-39°C (est.)',
      atmosphere: 'Unknown',
      description: 'Proxima Centauri b is the closest known exoplanet to our Solar System, orbiting the nearest star to the Sun.',
      color: '#c45',
      habitability: 45,
      discoveryYear: 2016,
      distanceFromEarth: '4.24 light-years',
      star: 'Proxima Centauri (M-dwarf)'
    },
    'trappist-1e': {
      name: 'TRAPPIST-1e',
      type: 'Terrestrial',
      diameter: '11,580 km',
      distance: '4.7 million km (from TRAPPIST-1)',
      period: '6.1 Earth days',
      day: 'Tidally locked',
      moons: 'Unknown',
      temp: '-22°C (est.)',
      atmosphere: 'Possible',
      description: 'TRAPPIST-1e is one of seven Earth-sized planets orbiting the ultracool dwarf star TRAPPIST-1.',
      color: '#6a8caf',
      habitability: 70,
      discoveryYear: 2017,
      distanceFromEarth: '40 light-years',
      star: 'TRAPPIST-1 (M-dwarf)'
    }
  };

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const container = canvas.parentElement;

    // Initialize Three.js
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 10000);
    camera.position.set(0, 150, 300);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;

    const raycaster = new THREE.Raycaster();

    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;
    raycasterRef.current = raycaster;

    // Add lights
    const ambientLight = new THREE.AmbientLight(0x333333);
    scene.add(ambientLight);

    const sunLight = new THREE.PointLight(0xffffff, 2, 5000);
    sunLight.position.set(0, 0, 0);
    sunLight.castShadow = true;
    scene.add(sunLight);

    // Create Sun
    const sunGeometry = new THREE.SphereGeometry(30, 32, 32);
    const sunMaterial = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      emissive: 0xffa500,
      emissiveIntensity: 1
    });
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    sun.userData = { planetKey: 'sun', isPlanet: true };
    scene.add(sun);
    planets3DRef.current['sun'] = sun;

    // Create planets
    const planetConfigs = [
      { key: 'mercury', size: 3, distance: 50, color: 0xb8b8b8, speed: 0.04 },
      { key: 'venus', size: 5, distance: 70, color: 0xffd89b, speed: 0.03 },
      { key: 'earth', size: 5.5, distance: 95, color: 0x4a90e2, speed: 0.025, hasMoon: true },
      { key: 'mars', size: 4, distance: 120, color: 0xe27b58, speed: 0.02 },
      { key: 'jupiter', size: 15, distance: 180, color: 0xd4a574, speed: 0.013 },
      { key: 'saturn', size: 12, distance: 230, color: 0xf4e7c3, speed: 0.01, hasRings: true },
      { key: 'uranus', size: 8, distance: 270, color: 0x7dd3c0, speed: 0.008 },
      { key: 'neptune', size: 7.5, distance: 310, color: 0x5b5fff, speed: 0.006 }
    ];

    planetConfigs.forEach(config => {
      const planetGroup = new THREE.Group();
      planetGroup.userData = { distance: config.distance, angle: Math.random() * Math.PI * 2 };

      const geometry = new THREE.SphereGeometry(config.size, 32, 32);
      const material = new THREE.MeshStandardMaterial({
        color: config.color,
        roughness: 0.7,
        metalness: 0.3
      });
      const planet = new THREE.Mesh(geometry, material);
      planet.castShadow = true;
      planet.receiveShadow = true;
      planet.userData = { planetKey: config.key, isPlanet: true };
      planet.position.set(config.distance, 0, 0);
      planetGroup.add(planet);

      if (config.hasMoon) {
        const moonGeometry = new THREE.SphereGeometry(1.5, 16, 16);
        const moonMaterial = new THREE.MeshStandardMaterial({ color: 0xcccccc });
        const moon = new THREE.Mesh(moonGeometry, moonMaterial);
        moon.position.set(config.size + 8, 0, 0);
        moon.userData = { isMoon: true, orbitRadius: config.size + 8 };
        planet.add(moon);
      }

      if (config.hasRings) {
        const ringGeometry = new THREE.RingGeometry(config.size + 5, config.size + 12, 64);
        const ringMaterial = new THREE.MeshBasicMaterial({
          color: 0xd2b48c,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.7
        });
        const rings = new THREE.Mesh(ringGeometry, ringMaterial);
        rings.rotation.x = Math.PI / 2;
        planet.add(rings);
      }

      // Create orbit line
      const orbitGeometry = new THREE.BufferGeometry();
      const orbitPoints = [];
      for (let i = 0; i <= 64; i++) {
        const angle = (i / 64) * Math.PI * 2;
        orbitPoints.push(new THREE.Vector3(
          Math.cos(angle) * config.distance,
          0,
          Math.sin(angle) * config.distance
        ));
      }
      orbitGeometry.setFromPoints(orbitPoints);
      const orbitMaterial = new THREE.LineBasicMaterial({ color: 0x444444, transparent: true, opacity: 0.3 });
      const orbitLine = new THREE.Line(orbitGeometry, orbitMaterial);
      scene.add(orbitLine);

      scene.add(planetGroup);
      planets3DRef.current[config.key] = planetGroup;
      orbitSpeedsRef.current[config.key] = config.speed;
    });

    // Animation loop
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);

      Object.keys(orbitSpeedsRef.current).forEach(key => {
        const planetGroup = planets3DRef.current[key];
        if (planetGroup && planetGroup.userData) {
          planetGroup.userData.angle += orbitSpeedsRef.current[key] * animationSpeed;
          planetGroup.rotation.y = planetGroup.userData.angle;

          const planet = planetGroup.children[0];
          if (planet) {
            planet.rotation.y += 0.01;

            planet.children.forEach(child => {
              if (child.userData.isMoon) {
                const moonAngle = Date.now() * 0.001;
                child.position.x = Math.cos(moonAngle) * child.userData.orbitRadius;
                child.position.z = Math.sin(moonAngle) * child.userData.orbitRadius;
              }
            });
          }
        }
      });

      if (planets3DRef.current['sun']) {
        planets3DRef.current['sun'].rotation.y += 0.002;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      const container = renderer.domElement.parentElement;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      renderer.dispose();
    };
  }, [animationSpeed]);

  const handleCanvasClick = (event) => {
    if (!canvasRef.current || !raycasterRef.current || !cameraRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);

    const allObjects = [];
    sceneRef.current.traverse((object) => {
      if (object.userData && object.userData.isPlanet) {
        allObjects.push(object);
      }
    });

    const intersects = raycasterRef.current.intersectObjects(allObjects);

    if (intersects.length > 0) {
      const clickedObject = intersects[0].object;
      if (clickedObject.userData.planetKey) {
        setSelectedPlanet(clickedObject.userData.planetKey);
        clickedObject.scale.set(1.3, 1.3, 1.3);
        setTimeout(() => {
          clickedObject.scale.set(1, 1, 1);
        }, 300);
      }
    }
  };

  const handleZoomIn = () => {
    if (cameraRef.current) {
      cameraRef.current.position.multiplyScalar(0.8);
    }
  };

  const handleZoomOut = () => {
    if (cameraRef.current) {
      cameraRef.current.position.multiplyScalar(1.2);
    }
  };

  const handleReset = () => {
    if (cameraRef.current) {
      cameraRef.current.position.set(0, 150, 300);
      cameraRef.current.lookAt(0, 0, 0);
    }
  };

  const calculateHabitability = (planet) => {
    if (planet.habitability !== undefined) return planet.habitability;
    return 0;
  };

  const adjustColor = (color, percent) => {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255))
      .toString(16).slice(1);
  };

  const renderPlanetInfo = () => {
    const data = solarSystemData[selectedPlanet];
    if (!data) return null;

    const habitability = calculateHabitability(data);

    return (
      <div className="info-panel">
        <div 
          className="planet-preview" 
          style={{
            background: `radial-gradient(circle at 30% 30%, ${data.color}, ${adjustColor(data.color, -40)})`,
            boxShadow: `0 0 40px ${data.color}`
          }}
        />
        <h2 id="planetName">{data.name}</h2>
        <div className="planet-details">
          <div className="detail-item"><span className="label">Type:</span><span className="value">{data.type}</span></div>
          <div className="detail-item"><span className="label">Diameter:</span><span className="value">{data.diameter}</span></div>
          <div className="detail-item"><span className="label">Distance:</span><span className="value">{data.distance}</span></div>
          <div className="detail-item"><span className="label">Orbital Period:</span><span className="value">{data.period}</span></div>
          <div className="detail-item"><span className="label">Day Length:</span><span className="value">{data.day}</span></div>
          <div className="detail-item"><span className="label">Moons:</span><span className="value">{data.moons}</span></div>
          <div className="detail-item"><span className="label">Temperature:</span><span className="value">{data.temp}</span></div>
        </div>
        <p className="planet-description">{data.description}</p>
        <div className="habitability-score">
          <h3>Habitability Score</h3>
          <div className="score-bar">
            <div className="score-fill" style={{ width: `${habitability}%` }} />
          </div>
          <p id="scoreText">{habitability}% Habitable</p>
        </div>
      </div>
    );
  };

  const renderExoplanets = () => {
    return (
      <div className="exoplanet-grid">
        {Object.entries(exoplanetData).map(([key, planet]) => (
          <div key={key} className="exoplanet-card">
            <div 
              className="exoplanet-visual" 
              style={{
                background: `radial-gradient(circle at 30% 30%, ${planet.color}, ${adjustColor(planet.color, -40)})`,
                boxShadow: `0 0 30px ${planet.color}`
              }}
            />
            <h3>{planet.name}</h3>
            <div className="planet-details">
              <div className="detail-item"><span className="label">Type:</span><span className="value">{planet.type}</span></div>
              <div className="detail-item"><span className="label">Distance:</span><span className="value">{planet.distanceFromEarth}</span></div>
              <div className="detail-item"><span className="label">Discovered:</span><span className="value">{planet.discoveryYear}</span></div>
              <div className="detail-item"><span className="label">Habitability:</span><span className="value">{calculateHabitability(planet)}%</span></div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="planet-visualizer-wrapper">
      <div className="planet-container">
        <nav className="tab-nav">
          <button 
            className={`tab-btn ${activeTab === 'solar-system' ? 'active' : ''}`}
            onClick={() => setActiveTab('solar-system')}
          >
            Solar System
          </button>
          <button 
            className={`tab-btn ${activeTab === 'exoplanets' ? 'active' : ''}`}
            onClick={() => setActiveTab('exoplanets')}
          >
            Exoplanet Explorer
          </button>
        </nav>

        <div className={`tab-content ${activeTab === 'solar-system' ? 'active' : ''}`}>
          <div className="controls">
            <button className="control-btn" onClick={handleZoomIn}>Zoom In</button>
            <button className="control-btn" onClick={handleZoomOut}>Zoom Out</button>
            <button className="control-btn" onClick={handleReset}>Reset View</button>
            <label className="speed-control">
              <span>Speed:</span>
              <input 
                type="range" 
                min="0.1" 
                max="3" 
                step="0.1" 
                value={animationSpeed}
                onChange={(e) => setAnimationSpeed(parseFloat(e.target.value))}
              />
              <span id="speedValue">{animationSpeed}x</span>
            </label>
          </div>

          <div className="main-content">
            <div className="solar-system-view">
              <canvas ref={canvasRef} onClick={handleCanvasClick} />
            </div>
            {renderPlanetInfo()}
          </div>
        </div>

        <div className={`tab-content ${activeTab === 'exoplanets' ? 'active' : ''}`}>
          {renderExoplanets()}
        </div>

        <footer className="planet-footer">
          <p>Explore the cosmos and discover the universe</p>
        </footer>
      </div>
    </div>
  );
};

export default PlanetVisualizer;
