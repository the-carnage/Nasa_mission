let scene, camera, renderer, raycaster, mouse;
let planets3D = {};
let orbitSpeeds = {};
let currentAnimationSpeed = 1;

function initThreeJS() {
    const canvas = document.getElementById('solarSystemCanvas');
    const container = canvas.parentElement;
    
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 10000);
    camera.position.set(0, 150, 300);
    camera.lookAt(0, 0, 0);
    
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();
    
    const ambientLight = new THREE.AmbientLight(0x333333);
    scene.add(ambientLight);
    
    const sunLight = new THREE.PointLight(0xffffff, 2, 5000);
    sunLight.position.set(0, 0, 0);
    sunLight.castShadow = true;
    scene.add(sunLight);
    
    createSun();
    createPlanets();
    
    canvas.addEventListener('click', onCanvasClick, false);
    window.addEventListener('resize', onWindowResize, false);
    
    animate();
}

function createSun() {
    const sunGeometry = new THREE.SphereGeometry(30, 32, 32);
    const sunMaterial = new THREE.MeshStandardMaterial({
        color: 0xffd700,
        emissive: 0xffa500,
        emissiveIntensity: 1
    });
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    sun.userData = { planetKey: 'sun', isPlanet: true };
    scene.add(sun);
    planets3D['sun'] = sun;
    
    const glowGeometry = new THREE.SphereGeometry(35, 32, 32);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0xffd700,
        transparent: true,
        opacity: 0.3
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    sun.add(glow);
}

function createPlanets() {
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
        planets3D[config.key] = planetGroup;
        orbitSpeeds[config.key] = config.speed;
    });
}

function animate() {
    requestAnimationFrame(animate);
    
    Object.keys(orbitSpeeds).forEach(key => {
        const planetGroup = planets3D[key];
        if (planetGroup && planetGroup.userData) {
            planetGroup.userData.angle += orbitSpeeds[key] * currentAnimationSpeed;
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
    
    if (planets3D['sun']) {
        planets3D['sun'].rotation.y += 0.002;
    }
    
    renderer.render(scene, camera);
}

function onCanvasClick(event) {
    const canvas = event.target;
    const rect = canvas.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    
    const allObjects = [];
    scene.traverse((object) => {
        if (object.userData && object.userData.isPlanet) {
            allObjects.push(object);
        }
    });
    
    const intersects = raycaster.intersectObjects(allObjects);
    
    if (intersects.length > 0) {
        const clickedObject = intersects[0].object;
        if (clickedObject.userData.planetKey) {
            updatePlanetInfo(clickedObject.userData.planetKey);
            
            clickedObject.scale.set(1.3, 1.3, 1.3);
            setTimeout(() => {
                clickedObject.scale.set(1, 1, 1);
            }, 300);
        }
    }
}

function onWindowResize() {
    const container = renderer.domElement.parentElement;
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}

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
    mercury: {
        name: 'Mercury',
        type: 'Terrestrial Planet',
        diameter: '4,879 km',
        distance: '57.9 million km',
        period: '88 Earth days',
        day: '59 Earth days',
        moons: '0',
        temp: '167°C (avg)',
        atmosphere: '0.01',
        description: 'Mercury is the smallest planet in the Solar System and the closest to the Sun. It has no substantial atmosphere and extreme temperature variations.',
        color: '#b8b8b8',
        habitability: 5
    },
    venus: {
        name: 'Venus',
        type: 'Terrestrial Planet',
        diameter: '12,104 km',
        distance: '108.2 million km',
        period: '225 Earth days',
        day: '243 Earth days',
        moons: '0',
        temp: '464°C',
        atmosphere: '9.2',
        description: 'Venus has the densest atmosphere of the four terrestrial planets. Despite being farther from the Sun than Mercury, it is the hottest planet due to greenhouse effect.',
        color: '#ffd89b',
        habitability: 2
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
    },
    jupiter: {
        name: 'Jupiter',
        type: 'Gas Giant',
        diameter: '139,820 km',
        distance: '778.5 million km',
        period: '11.86 Earth years',
        day: '9.9 hours',
        moons: '95 (including Europa, Ganymede, Io, Callisto)',
        temp: '-108°C',
        atmosphere: '10+',
        description: 'Jupiter is the largest planet in the Solar System. It is primarily composed of hydrogen with a quarter of its mass being helium.',
        color: '#d4a574',
        habitability: 5
    },
    saturn: {
        name: 'Saturn',
        type: 'Gas Giant',
        diameter: '116,460 km',
        distance: '1.4 billion km',
        period: '29.46 Earth years',
        day: '10.7 hours',
        moons: '146 (including Titan, Enceladus)',
        temp: '-138°C',
        atmosphere: '10+',
        description: 'Saturn is famous for its prominent ring system, which is made mostly of ice particles with a smaller amount of rocky debris and dust.',
        color: '#f4e7c3',
        habitability: 3
    },
    uranus: {
        name: 'Uranus',
        type: 'Ice Giant',
        diameter: '50,724 km',
        distance: '2.9 billion km',
        period: '84 Earth years',
        day: '17.2 hours',
        moons: '27 (including Titania, Oberon)',
        temp: '-195°C',
        atmosphere: '8.5',
        description: 'Uranus is unique in that its axis of rotation is tilted sideways, nearly into the plane of its solar orbit, giving it extreme seasonal variations.',
        color: '#7dd3c0',
        habitability: 1
    },
    neptune: {
        name: 'Neptune',
        type: 'Ice Giant',
        diameter: '49,244 km',
        distance: '4.5 billion km',
        period: '165 Earth years',
        day: '16.1 hours',
        moons: '14 (including Triton)',
        temp: '-201°C',
        atmosphere: '8.7',
        description: 'Neptune has the strongest winds of any planet in the Solar System. It is 17 times the mass of Earth and is slightly more massive than Uranus.',
        color: '#5b5fff',
        habitability: 1
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
        description: 'Proxima Centauri b is the closest known exoplanet to our Solar System, orbiting the nearest star to the Sun. It resides in the habitable zone of its star.',
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
        description: 'TRAPPIST-1e is one of seven Earth-sized planets orbiting the ultracool dwarf star TRAPPIST-1. It is located in the habitable zone and may have liquid water.',
        color: '#6a8caf',
        habitability: 70,
        discoveryYear: 2017,
        distanceFromEarth: '40 light-years',
        star: 'TRAPPIST-1 (M-dwarf)'
    },
    'kepler-452b': {
        name: 'Kepler-452b',
        type: 'Super-Earth',
        diameter: '19,500 km (est.)',
        distance: '156 million km',
        period: '384.8 Earth days',
        day: 'Unknown',
        moons: 'Unknown',
        temp: '-8°C (est.)',
        atmosphere: 'Unknown',
        description: 'Nicknamed "Earth\'s cousin," Kepler-452b orbits in the habitable zone of a Sun-like star. It is 60% larger than Earth and has a similar orbital period.',
        color: '#5b9bd5',
        habitability: 60,
        discoveryYear: 2015,
        distanceFromEarth: '1,400 light-years',
        star: 'Kepler-452 (G-type)'
    },
    'k2-18b': {
        name: 'K2-18 b',
        type: 'Mini-Neptune',
        diameter: '27,000 km (est.)',
        distance: '22 million km',
        period: '33 Earth days',
        day: 'Unknown',
        moons: 'Unknown',
        temp: '-73°C to 47°C',
        atmosphere: 'H₂O, H₂, He detected',
        description: 'K2-18 b made headlines as the first exoplanet in the habitable zone where water vapor was detected in its atmosphere. It may be a "Hycean" world with a hydrogen atmosphere and water ocean.',
        color: '#4a7b9d',
        habitability: 55,
        discoveryYear: 2015,
        distanceFromEarth: '124 light-years',
        star: 'K2-18 (M-dwarf)'
    },
    '51-peg-b': {
        name: '51 Pegasi b',
        type: 'Hot Jupiter',
        diameter: '196,000 km (est.)',
        distance: '7.8 million km',
        period: '4.2 Earth days',
        day: 'Tidally locked',
        moons: '0',
        temp: '1,000°C',
        atmosphere: 'H, He',
        description: 'The first exoplanet discovered orbiting a Sun-like star in 1995. This discovery earned the 2019 Nobel Prize in Physics. It\'s a "hot Jupiter" with extreme temperatures.',
        color: '#ff9933',
        habitability: 0,
        discoveryYear: 1995,
        distanceFromEarth: '50.9 light-years',
        star: '51 Pegasi (G-type)'
    },
    'hd-209458b': {
        name: 'HD 209458 b (Osiris)',
        type: 'Hot Jupiter',
        diameter: '194,000 km',
        distance: '7 million km',
        period: '3.5 Earth days',
        day: 'Tidally locked',
        moons: '0',
        temp: '1,130°C',
        atmosphere: 'Evaporating (H, C, O detected)',
        description: 'The first exoplanet detected transiting its star and the first with an atmosphere detected. Nicknamed "Osiris," it\'s losing its atmosphere to space.',
        color: '#ffa500',
        habitability: 0,
        discoveryYear: 1999,
        distanceFromEarth: '159 light-years',
        star: 'HD 209458 (G-type)'
    },
    'gliese-581d': {
        name: 'Gliese 581 d',
        type: 'Super-Earth',
        diameter: '24,000 km (est.)',
        distance: '35 million km',
        period: '66.9 Earth days',
        day: 'Likely tidally locked',
        moons: 'Unknown',
        temp: '-30°C (est.)',
        atmosphere: 'Thick CO₂ possible',
        description: 'One of the first potentially habitable exoplanets discovered. Though its existence has been debated, it may orbit in the habitable zone of its red dwarf star.',
        color: '#8b7355',
        habitability: 40,
        discoveryYear: 2007,
        distanceFromEarth: '20.4 light-years',
        star: 'Gliese 581 (M-dwarf)'
    },
    'kepler-186f': {
        name: 'Kepler-186f',
        type: 'Terrestrial',
        diameter: '14,200 km',
        distance: '52.4 million km',
        period: '129.9 Earth days',
        day: 'Likely tidally locked',
        moons: 'Unknown',
        temp: '-85°C to -47°C (est.)',
        atmosphere: 'Unknown',
        description: 'The first Earth-sized planet discovered in the habitable zone of another star. It receives one-third the energy Earth gets from the Sun.',
        color: '#6b8e23',
        habitability: 50,
        discoveryYear: 2014,
        distanceFromEarth: '580 light-years',
        star: 'Kepler-186 (M-dwarf)'
    }
};

let customPlanets = [];
let currentZoom = 1;
let currentSpeed = 1;
let allPlanets = { ...solarSystemData, ...exoplanetData };

function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    document.getElementById(tabName).classList.add('active');
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
}

function calculateHabitability(planet) {
    if (planet.habitability !== undefined) return planet.habitability;
    
    let score = 0;
    const temp = planet.tempRaw !== undefined ? planet.tempRaw : parseFloat(String(planet.temp).replace(/[^\d.-]/g, '')) || 0;
    const atmosphere = planet.atmosphereRaw !== undefined ? planet.atmosphereRaw : parseFloat(String(planet.atmosphere).replace(/[^\d.]/g, '')) || 0;
    const diameter = planet.diameterRaw !== undefined ? planet.diameterRaw : parseFloat(String(planet.diameter).replace(/[^\d]/g, '')) || 0;
    
    if (temp >= -50 && temp <= 50) score += 40;
    else if (temp >= -100 && temp <= 100) score += 20;
    
    if (atmosphere >= 0.5 && atmosphere <= 2) score += 30;
    else if (atmosphere > 0) score += 10;
    
    if (diameter >= 8000 && diameter <= 20000) score += 30;
    else if (diameter >= 5000 && diameter <= 30000) score += 15;
    
    return Math.min(score, 100);
}

function updatePlanetInfo(planetKey, planetData = solarSystemData) {
    const data = planetData[planetKey];
    if (!data) return;

    const planetName = document.getElementById('planetName');
    const planetPreview = document.getElementById('planetPreview');
    const planetDetails = document.getElementById('planetDetails');
    const planetDescription = document.getElementById('planetDescription');
    const habitabilityScore = document.getElementById('habitabilityScore');
    const scoreFill = document.getElementById('scoreFill');
    const scoreText = document.getElementById('scoreText');

    planetName.textContent = data.name;
    planetPreview.style.background = `radial-gradient(circle at 30% 30%, ${data.color}, ${adjustColor(data.color, -40)})`;
    planetPreview.style.boxShadow = `0 0 40px ${data.color}`;
    planetDescription.textContent = data.description;

    let detailsHTML = `
        <div class="detail-item"><span class="label">Type:</span><span class="value">${data.type}</span></div>
        <div class="detail-item"><span class="label">Diameter:</span><span class="value">${data.diameter}</span></div>
        <div class="detail-item"><span class="label">Distance:</span><span class="value">${data.distance}</span></div>
        <div class="detail-item"><span class="label">Orbital Period:</span><span class="value">${data.period}</span></div>
        <div class="detail-item"><span class="label">Day Length:</span><span class="value">${data.day}</span></div>
        <div class="detail-item"><span class="label">Moons:</span><span class="value">${data.moons}</span></div>
        <div class="detail-item"><span class="label">Temperature:</span><span class="value">${data.temp}</span></div>
    `;
    
    if (data.star) {
        detailsHTML += `<div class="detail-item"><span class="label">Star:</span><span class="value">${data.star}</span></div>`;
    }
    if (data.distanceFromEarth) {
        detailsHTML += `<div class="detail-item"><span class="label">Distance from Earth:</span><span class="value">${data.distanceFromEarth}</span></div>`;
    }
    if (data.discoveryYear) {
        detailsHTML += `<div class="detail-item"><span class="label">Discovered:</span><span class="value">${data.discoveryYear}</span></div>`;
    }
    
    planetDetails.innerHTML = detailsHTML;

    const habitability = calculateHabitability(data);
    habitabilityScore.style.display = 'block';
    scoreFill.style.width = `${habitability}%`;
    scoreText.textContent = `${habitability}% Habitable`;
}

function adjustColor(color, percent) {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
        (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
        (B < 255 ? B < 1 ? 0 : B : 255))
        .toString(16).slice(1);
}

function renderExoplanets() {
    const grid = document.getElementById('exoplanetGrid');
    grid.innerHTML = '';
    
    Object.entries(exoplanetData).forEach(([key, planet]) => {
        const card = document.createElement('div');
        card.className = 'exoplanet-card';
        card.innerHTML = `
            <div class="exoplanet-visual" style="background: radial-gradient(circle at 30% 30%, ${planet.color}, ${adjustColor(planet.color, -40)}); box-shadow: 0 0 30px ${planet.color};"></div>
            <h3>${planet.name}</h3>
            <div class="planet-details">
                <div class="detail-item"><span class="label">Type:</span><span class="value">${planet.type}</span></div>
                <div class="detail-item"><span class="label">Distance:</span><span class="value">${planet.distanceFromEarth}</span></div>
                <div class="detail-item"><span class="label">Discovered:</span><span class="value">${planet.discoveryYear}</span></div>
                <div class="detail-item"><span class="label">Habitability:</span><span class="value">${calculateHabitability(planet)}%</span></div>
            </div>
        `;
        card.addEventListener('click', () => {
            updatePlanetInfo(key, exoplanetData);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        grid.appendChild(card);
    });
}

function updateCustomPlanetPreview() {
    const name = document.getElementById('customName').value || 'Custom Planet';
    const type = document.getElementById('customType').value;
    const diameter = parseFloat(document.getElementById('customDiameter').value);
    const distance = parseFloat(document.getElementById('customDistance').value);
    const temp = parseFloat(document.getElementById('customTemp').value);
    const atmosphere = parseFloat(document.getElementById('customAtmosphere').value);
    const color = document.getElementById('customColor').value;
    const moons = parseInt(document.getElementById('customMoons').value);

    document.getElementById('diameterValue').textContent = diameter.toLocaleString();
    document.getElementById('distanceValue').textContent = distance;
    document.getElementById('tempValue').textContent = temp;
    document.getElementById('atmosphereValue').textContent = atmosphere;
    document.getElementById('moonsValue').textContent = moons;

    const preview = document.getElementById('customPlanetPreview');
    preview.style.background = `radial-gradient(circle at 30% 30%, ${color}, ${adjustColor(color, -40)})`;
    preview.style.boxShadow = `0 0 40px ${color}`;

    const customData = {
        name: name,
        type: type,
        diameter: `${diameter.toLocaleString()} km`,
        distance: `${distance} million km`,
        temp: `${temp}°C`,
        atmosphere: atmosphere,
        moons: moons,
        color: color,
        diameterRaw: diameter,
        tempRaw: temp,
        atmosphereRaw: atmosphere
    };

    const habitability = calculateHabitability(customData);
    
    document.getElementById('customDetails').innerHTML = `
        <h3>${name}</h3>
        <div class="detail-item"><span class="label">Type:</span><span class="value">${type}</span></div>
        <div class="detail-item"><span class="label">Habitability Score:</span><span class="value">${habitability}%</span></div>
        <p style="margin-top: 15px; color: #aaa;">Adjust parameters to see how they affect habitability!</p>
    `;
}

function saveCustomPlanet() {
    const diameter = parseFloat(document.getElementById('customDiameter').value);
    const distance = parseFloat(document.getElementById('customDistance').value);
    const temp = parseFloat(document.getElementById('customTemp').value);
    const atmosphere = parseFloat(document.getElementById('customAtmosphere').value);
    const moons = parseInt(document.getElementById('customMoons').value);
    
    const planetData = {
        name: document.getElementById('customName').value || 'Custom Planet',
        type: document.getElementById('customType').value,
        diameter: `${diameter.toLocaleString()} km`,
        distance: `${distance} million km`,
        period: 'Custom',
        day: 'Unknown',
        moons: moons.toString(),
        temp: `${temp}°C`,
        atmosphere: atmosphere.toString(),
        description: `A custom ${document.getElementById('customType').value} planet created in the Exoplanetary Laboratory.`,
        color: document.getElementById('customColor').value,
        diameterRaw: diameter,
        tempRaw: temp,
        atmosphereRaw: atmosphere
    };
    
    planetData.habitability = calculateHabitability(planetData);

    customPlanets.push(planetData);
    renderGallery();
    alert(`${planetData.name} saved to your gallery!`);
}

function renderGallery() {
    const grid = document.getElementById('galleryGrid');
    grid.innerHTML = '';
    
    if (customPlanets.length === 0) {
        grid.innerHTML = '<p style="color: #aaa; grid-column: 1 / -1; text-align: center;">No custom planets yet. Create one above!</p>';
        return;
    }
    
    customPlanets.forEach((planet, index) => {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        item.innerHTML = `
            <div class="gallery-planet" style="background: radial-gradient(circle at 30% 30%, ${planet.color}, ${adjustColor(planet.color, -40)}); box-shadow: 0 0 20px ${planet.color};"></div>
            <h4 style="color: #ffd700; margin: 5px 0;">${planet.name}</h4>
            <p style="color: #aaa; font-size: 0.9em;">${planet.type}</p>
        `;
        item.addEventListener('click', () => {
            updatePlanetInfo(index, customPlanets);
        });
        grid.appendChild(item);
    });
}

function populateComparisonSelects() {
    const select1 = document.getElementById('comparePlanet1');
    const select2 = document.getElementById('comparePlanet2');
    
    allPlanets = { ...solarSystemData, ...exoplanetData };
    customPlanets.forEach((planet, i) => {
        allPlanets[`custom-${i}`] = planet;
    });
    
    const html = Object.entries(allPlanets).map(([key, planet]) => 
        `<option value="${key}">${planet.name}</option>`
    ).join('');
    
    select1.innerHTML = html;
    select2.innerHTML = html;
    select2.selectedIndex = 1;
}

function comparePlanets() {
    const key1 = document.getElementById('comparePlanet1').value;
    const key2 = document.getElementById('comparePlanet2').value;
    const planet1 = allPlanets[key1];
    const planet2 = allPlanets[key2];
    
    const resultsDiv = document.getElementById('comparisonResults');
    resultsDiv.innerHTML = `
        <div class="compare-card">
            <h3>${planet1.name}</h3>
            <div class="planet-preview" style="background: radial-gradient(circle at 30% 30%, ${planet1.color}, ${adjustColor(planet1.color, -40)}); box-shadow: 0 0 30px ${planet1.color}; margin: 15px auto;"></div>
            <div class="detail-item"><span class="label">Type:</span><span class="value">${planet1.type}</span></div>
            <div class="detail-item"><span class="label">Diameter:</span><span class="value">${planet1.diameter}</span></div>
            <div class="detail-item"><span class="label">Temperature:</span><span class="value">${planet1.temp}</span></div>
            <div class="detail-item"><span class="label">Habitability:</span><span class="value">${calculateHabitability(planet1)}%</span></div>
        </div>
        <div class="compare-card">
            <h3>${planet2.name}</h3>
            <div class="planet-preview" style="background: radial-gradient(circle at 30% 30%, ${planet2.color}, ${adjustColor(planet2.color, -40)}); box-shadow: 0 0 30px ${planet2.color}; margin: 15px auto;"></div>
            <div class="detail-item"><span class="label">Type:</span><span class="value">${planet2.type}</span></div>
            <div class="detail-item"><span class="label">Diameter:</span><span class="value">${planet2.diameter}</span></div>
            <div class="detail-item"><span class="label">Temperature:</span><span class="value">${planet2.temp}</span></div>
            <div class="detail-item"><span class="label">Habitability:</span><span class="value">${calculateHabitability(planet2)}%</span></div>
        </div>
    `;
    
    const sizeChart = document.getElementById('sizeChart');
    const d1 = parseFloat(planet1.diameter) || 10000;
    const d2 = parseFloat(planet2.diameter) || 10000;
    const maxSize = Math.max(d1, d2);
    
    sizeChart.innerHTML = `
        <div class="chart-bar" style="height: ${(d1 / maxSize) * 150}px; background: linear-gradient(180deg, ${planet1.color}, ${adjustColor(planet1.color, -30)});">
            <div class="chart-label">${planet1.name}<br>${planet1.diameter}</div>
        </div>
        <div class="chart-bar" style="height: ${(d2 / maxSize) * 150}px; background: linear-gradient(180deg, ${planet2.color}, ${adjustColor(planet2.color, -30)});">
            <div class="chart-label">${planet2.name}<br>${planet2.diameter}</div>
        </div>
    `;
    
    const distanceChart = document.getElementById('distanceChart');
    const dist1 = parseFloat(planet1.distance) || 100;
    const dist2 = parseFloat(planet2.distance) || 100;
    const maxDist = Math.max(dist1, dist2);
    
    distanceChart.innerHTML = `
        <div class="chart-bar" style="height: ${(dist1 / maxDist) * 150}px; background: linear-gradient(180deg, ${planet1.color}, ${adjustColor(planet1.color, -30)});">
            <div class="chart-label">${planet1.name}<br>${planet1.distance}</div>
        </div>
        <div class="chart-bar" style="height: ${(dist2 / maxDist) * 150}px; background: linear-gradient(180deg, ${planet2.color}, ${adjustColor(planet2.color, -30)});">
            <div class="chart-label">${planet2.name}<br>${planet2.distance}</div>
        </div>
    `;
}

document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        switchTab(btn.dataset.tab);
        if (btn.dataset.tab === 'compare') {
            populateComparisonSelects();
        }
    });
});

const zoomInBtn = document.getElementById('zoomIn');
const zoomOutBtn = document.getElementById('zoomOut');
const resetBtn = document.getElementById('reset');
const speedControl = document.getElementById('speedControl');
const speedValue = document.getElementById('speedValue');

zoomInBtn.addEventListener('click', () => {
    if (camera) {
        camera.position.multiplyScalar(0.8);
    }
});

zoomOutBtn.addEventListener('click', () => {
    if (camera) {
        camera.position.multiplyScalar(1.2);
    }
});

resetBtn.addEventListener('click', () => {
    if (camera) {
        camera.position.set(0, 150, 300);
        camera.lookAt(0, 0, 0);
    }
});

speedControl.addEventListener('input', (e) => {
    currentAnimationSpeed = parseFloat(e.target.value);
    speedValue.textContent = `${currentAnimationSpeed}x`;
});

document.getElementById('customDiameter').addEventListener('input', updateCustomPlanetPreview);
document.getElementById('customDistance').addEventListener('input', updateCustomPlanetPreview);
document.getElementById('customTemp').addEventListener('input', updateCustomPlanetPreview);
document.getElementById('customAtmosphere').addEventListener('input', updateCustomPlanetPreview);
document.getElementById('customColor').addEventListener('input', updateCustomPlanetPreview);
document.getElementById('customMoons').addEventListener('input', updateCustomPlanetPreview);
document.getElementById('customName').addEventListener('input', updateCustomPlanetPreview);
document.getElementById('customType').addEventListener('change', updateCustomPlanetPreview);

document.getElementById('planetForm').addEventListener('submit', (e) => {
    e.preventDefault();
    updateCustomPlanetPreview();
});

document.getElementById('saveCustom').addEventListener('click', saveCustomPlanet);
document.getElementById('compareBtn').addEventListener('click', comparePlanets);

initThreeJS();
updatePlanetInfo('sun');
renderExoplanets();
updateCustomPlanetPreview();
renderGallery();

console.log('Exoplanetary Laboratory with Three.js initialized!');
console.log('Features: 3D Solar System, 8 Real Exoplanets, Custom Planet Creator, Research Tools');
