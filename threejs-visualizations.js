let isInitialized = false;
// threejs-visualizations.js - Three.js Visualizations
console.log("🎨 Three.js visualizations loaded");

window.addEventListener('three-loaded', () => {
    console.log("Global THREE detected, ready to initialize.");

    if (data && data.length > 0) {
        initializeVisualization(data);
    }
});

// Global variables
let camera, scene, renderer, controls;
let objects = [];
let currentLayout = 'table';
let data = [];

// Main initialization function
function initializeVisualization(loadedData) {
    console.log(`🎯 Initializing visualization with ${loadedData.length} items`);

    // Store data
    data = loadedData;

    // Setup Three.js
    if (!initThreeJS()) {
        console.warn("Delaying initialization: Three.js components not ready.");
        return;
    }
    isInitialized = true;

    // Create initial table layout (Assignment Requirement #7: 20x10)
    createTableLayout();

    // Start animation loop
    animate();

    console.log("✅ Visualization initialized successfully!");

    if (window.setStatus) {
        setStatus(`Visualization ready with ${data.length} items`);
    }
}

// Initialize Three.js
function initThreeJS() {
    console.log("Setting up Three.js...");

    // Check if THREE exists
    if (typeof THREE === 'undefined' || typeof CSS3DRenderer === 'undefined') {
        console.warn("THREE/CSS3DRenderer not found.");
        return false;
    }

    // Create camera
    camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.z = 3000;

    // Create scene
    scene = new THREE.Scene();

    // 4. Create Renderer (Using the global class directly)
    try {
        renderer = new CSS3DRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);

        // CRITICAL: Style the renderer's DOM element to ensure visibility
        renderer.domElement.style.position = 'absolute';
        renderer.domElement.style.top = '0';
        renderer.domElement.style.left = '0';
        renderer.domElement.style.width = '100%';
        renderer.domElement.style.height = '100%';
        renderer.domElement.style.pointerEvents = 'none'; // Allow clicks to pass through to tiles

        const container = document.getElementById('visualization-container');
        // CSS3DRenderer uses a div, so we append its domElement
        if (container) {
            // Clear any existing renderer
            const existingRenderer = container.querySelector('div');
            if (existingRenderer && existingRenderer !== renderer.domElement) {
                existingRenderer.remove();
            }

            container.appendChild(renderer.domElement);

            // Optional: Remove the placeholder canvas if it exists
            const oldCanvas = document.getElementById('canvas');
            if (oldCanvas) oldCanvas.remove();

            console.log('✅ Renderer domElement appended to container');
        }
    } catch (e) {
        console.error("❌ Failed to create CSS3DRenderer:", e);
        return false;
    }

    window.addEventListener('resize', onWindowResize);

    // 5. Initialize TrackballControls
    if (typeof TrackballControls !== 'undefined') {
        controls = new TrackballControls(camera, renderer.domElement);
        controls.rotateSpeed = 2.0;
        controls.zoomSpeed = 5.0;
        controls.panSpeed = 1.0;
        controls.minDistance = 500;
        controls.maxDistance = 6000;
        controls.staticMoving = true; // Set to true for constant speed (no damping)
        controls.dynamicDampingFactor = 0.3;

        // Update status or dispatch event if needed
        controls.addEventListener('change', () => {
            if (renderer && scene && camera) {
                renderer.render(scene, camera);
            }
        });
        console.log("✅ TrackballControls initialized");
    }

    console.log("✅ Three.js setup complete");
    return true;
}

// Assignment Requirement #7: Table layout (20x10)
function createTableLayout() {
    console.log("Creating table layout (20x10)...");
    currentLayout = 'table';
    clearObjects();

    const tableWidth = 20;  // 20 columns
    const tableHeight = 10; // 10 rows
    const spacing = 160;

    // Use first 200 items or available items
    const itemCount = Math.min(data.length, 200);

    for (let i = 0; i < itemCount; i++) {
        const person = data[i];
        if (!person) continue;

        // Create tile element
        const element = createDataTile(person);

        // Create Three.js object
        const object = new CSS3DObject(element);

        // Position in 20x10 grid (from top-left)
        const col = i % tableWidth;
        const row = Math.floor(i / tableWidth);

        object.position.x = (col - tableWidth / 2 + 0.5) * spacing;
        object.position.y = (tableHeight / 2 - row - 0.5) * spacing;
        object.position.z = 0;

        // Ensure tiles face camera normally (not mirrored)
        object.rotation.set(0, 0, 0);

        // Add to scene
        scene.add(object);
        objects.push(object);
    }

    console.log(`✅ Created ${objects.length} tiles in 20x10 table layout`);

    // Update camera and controls
    camera.position.set(0, 0, 3000);
    camera.lookAt(scene.position);
    if (controls) {
        controls.target.set(0, 0, 0);
        controls.reset();
    }
}

// Assignment Requirement #6: Sphere layout
function createSphereLayout() {
    console.log("Creating sphere layout...");
    currentLayout = 'sphere';
    clearObjects();

    const radius = 1000;
    const itemCount = Math.min(data.length, 200);

    for (let i = 0; i < itemCount; i++) {
        const person = data[i];
        if (!person) continue;

        const element = createDataTile(person);
        const object = new CSS3DObject(element);

        // Spherical coordinates
        const phi = Math.acos(-1 + (2 * i) / itemCount);
        const theta = Math.sqrt(itemCount * Math.PI) * phi;

        object.position.x = radius * Math.cos(theta) * Math.sin(phi);
        object.position.y = radius * Math.sin(theta) * Math.sin(phi);
        object.position.z = radius * Math.cos(phi);

        // Make tiles face outward from center
        object.lookAt(object.position.clone().multiplyScalar(2));

        scene.add(object);
        objects.push(object);
    }

    console.log(`✅ Created sphere layout with ${objects.length} tiles`);
}

// Assignment Requirement #8: Double Helix layout
function createHelixLayout() {
    console.log("Creating double helix layout...");
    currentLayout = 'helix';
    clearObjects();

    const radius = 600;
    const height = 1800;
    const turns = 3;
    const itemCount = Math.min(data.length, 200);

    for (let i = 0; i < itemCount; i++) {
        const person = data[i];
        if (!person) continue;

        const element = createDataTile(person);
        const object = new CSS3DObject(element);

        // Calculate position along helix
        const t = (i / itemCount) * Math.PI * 2 * turns;
        const y = (i / itemCount) * height - height / 2;

        // Double helix: alternate between two intertwined spirals
        if (i % 2 === 0) {
            // First strand
            object.position.x = radius * Math.cos(t);
            object.position.z = radius * Math.sin(t);
        } else {
            // Second strand (180 degrees out of phase)
            object.position.x = radius * Math.cos(t + Math.PI);
            object.position.z = radius * Math.sin(t + Math.PI);
        }

        object.position.y = y;

        // Make tiles face center axis
        const lookAtPoint = new THREE.Vector3(0, y, 0);
        object.lookAt(lookAtPoint);
        // Flip so they face outward
        object.rotation.y += Math.PI;

        scene.add(object);
        objects.push(object);
    }

    console.log(`✅ Created double helix layout with ${objects.length} tiles`);
}

// Assignment Requirement #9: Grid layout (5x4x10)
function createGridLayout() {
    console.log("Creating 3D grid layout (5x4x10)...");
    currentLayout = 'grid';
    clearObjects();

    const gridX = 5;   // 5 columns
    const gridY = 4;   // 4 rows
    const gridZ = 10;  // 10 layers
    const spacing = 200;

    const totalSlots = gridX * gridY * gridZ;
    const itemCount = Math.min(data.length, totalSlots);

    for (let i = 0; i < itemCount; i++) {
        const person = data[i];
        if (!person) continue;

        const element = createDataTile(person);
        const object = new CSS3DObject(element);

        // Calculate 3D grid position
        const x = (i % gridX) * spacing - ((gridX - 1) * spacing) / 2;
        const y = Math.floor((i % (gridX * gridY)) / gridX) * spacing - ((gridY - 1) * spacing) / 2;
        const z = Math.floor(i / (gridX * gridY)) * spacing - ((gridZ - 1) * spacing) / 2;

        object.position.set(x, y, z);

        // Standard orientation for grid
        object.rotation.set(0, 0, 0);

        scene.add(object);
        objects.push(object);
    }

    console.log(`✅ Created 3D grid layout (${gridX}x${gridY}x${gridZ}) with ${objects.length} tiles`);
}

// Create individual data tile (Assignment Requirement #4 & #5)
function createDataTile(person) {
    // Wrapper element for Three.js CSS3DObject
    const element = document.createElement('div');
    element.className = 'data-tile-wrapper';
    element.style.width = '140px';
    element.style.height = '200px';
    element.style.pointerEvents = 'auto'; // Allow interaction

    // Inner element for visual content and CSS hover effects
    const inner = document.createElement('div');
    inner.className = 'data-tile element-like';

    // Assignment Requirement #5: Color coding based on Net Worth
    let backgroundColor, borderColor, textColor;
    if (person.netWorthValue < 100000) {
        // Red for < $100K
        backgroundColor = 'rgba(255, 68, 68, 0.35)';
        borderColor = 'rgba(255, 68, 68, 0.6)';
        textColor = '#fff';
    } else if (person.netWorthValue < 200000) {
        // Orange for $100K - $200K
        backgroundColor = 'rgba(255, 165, 0, 0.35)';
        borderColor = 'rgba(255, 165, 0, 0.6)';
        textColor = '#fff';
    } else {
        // Green for > $200K
        backgroundColor = 'rgba(68, 255, 68, 0.35)';
        borderColor = 'rgba(68, 255, 68, 0.6)';
        textColor = '#fff';
    }

    // Inner container styles
    inner.style.width = '100%';
    inner.style.height = '100%';
    inner.style.background = backgroundColor;
    inner.style.border = `2px solid ${borderColor}`;
    inner.style.boxShadow = `0 4px 15px ${borderColor}`;
    inner.style.borderRadius = '8px';
    inner.style.display = 'flex';
    inner.style.flexDirection = 'column';
    inner.style.alignItems = 'center';
    inner.style.justifyContent = 'flex-start';
    inner.style.color = textColor;
    inner.style.fontFamily = 'Arial, Helvetica, sans-serif';
    inner.style.cursor = 'pointer';
    inner.style.padding = '8px';
    inner.style.overflow = 'hidden';
    inner.style.transition = 'transform 0.3s ease, box-shadow 0.3s ease';
    inner.style.boxSizing = 'border-box';

    // IMPORTANT: Reset rotation/transform to ensure it's not inherited or conflicting
    inner.style.transform = 'translateZ(0)';

    // Hover effects on the inner element to avoid conflicting with renderer
    inner.onmouseenter = function () {
        this.style.transform = 'translateY(-10px) scale(1.1)';
        this.style.boxShadow = `0 15px 35px ${borderColor}`;
        this.style.zIndex = '1000';
    };
    inner.onmouseleave = function () {
        this.style.transform = 'translateY(0) scale(1)';
        this.style.boxShadow = `0 4px 15px ${borderColor}`;
        this.style.zIndex = 'auto';
    };

    // Click to show full details
    inner.onclick = function (event) {
        event.stopPropagation();
        event.preventDefault();
        const details = `Name: ${person.name}\nAge: ${person.age}\nCountry: ${person.country}\nInterest: ${person.interest}\nNet Worth: ${person.netWorth}`;
        alert(details);
        return false;
    };

    // Index number (top right corner)
    const number = document.createElement('div');
    number.style.position = 'absolute';
    number.style.top = '6px';
    number.style.right = '8px';
    number.style.fontSize = '10px';
    number.style.fontWeight = 'bold';
    number.style.opacity = '0.8';
    number.textContent = (person.index !== undefined) ? (person.index + 1) : '';
    inner.appendChild(number);

    // Photo/Avatar (circular, at top)
    const photoContainer = document.createElement('div');
    photoContainer.style.width = '60px';
    photoContainer.style.height = '60px';
    photoContainer.style.borderRadius = '50%';
    photoContainer.style.overflow = 'hidden';
    photoContainer.style.border = `2px solid ${borderColor}`;
    photoContainer.style.marginTop = '4px';
    photoContainer.style.marginBottom = '6px';
    photoContainer.style.backgroundColor = 'rgba(255,255,255,0.1)';

    const photo = document.createElement('img');
    photo.src = person.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(person.name)}&size=60&background=random`;
    photo.style.width = '100%';
    photo.style.height = '100%';
    photo.style.objectFit = 'cover';
    photo.onerror = function () {
        this.style.display = 'none';
        photoContainer.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;font-size:24px;font-weight:bold;">${person.name.substring(0, 2).toUpperCase()}</div>`;
    };
    photoContainer.appendChild(photo);
    inner.appendChild(photoContainer);

    // Name (bold, prominent)
    const name = document.createElement('div');
    name.style.fontSize = '11px';
    name.style.fontWeight = 'bold';
    name.style.textAlign = 'center';
    name.style.marginBottom = '4px';
    name.style.lineHeight = '1.2';
    name.style.maxWidth = '100%';
    name.style.overflow = 'hidden';
    name.style.textOverflow = 'ellipsis';
    name.style.whiteSpace = 'nowrap';
    name.textContent = person.name;
    name.title = person.name;
    inner.appendChild(name);

    // Data fields container
    const dataContainer = document.createElement('div');
    dataContainer.style.fontSize = '11px';
    dataContainer.style.textAlign = 'center';
    dataContainer.style.lineHeight = '1.4';
    dataContainer.style.width = '100%';

    // Age
    const ageDiv = document.createElement('div');
    ageDiv.style.marginBottom = '2px';
    ageDiv.innerHTML = `<span style="opacity:0.8">Age:</span> <strong>${person.age}</strong>`;
    dataContainer.appendChild(ageDiv);

    // Country
    const countryDiv = document.createElement('div');
    countryDiv.style.marginBottom = '2px';
    countryDiv.innerHTML = `<span style="opacity:0.8">Country:</span> <strong>${person.country}</strong>`;
    dataContainer.appendChild(countryDiv);

    // Interest
    const interestDiv = document.createElement('div');
    interestDiv.style.marginBottom = '4px';
    interestDiv.style.overflow = 'hidden';
    interestDiv.style.textOverflow = 'ellipsis';
    interestDiv.style.whiteSpace = 'nowrap';
    interestDiv.innerHTML = `<span style="opacity:0.8">Interest:</span> <strong>${person.interest}</strong>`;
    dataContainer.appendChild(interestDiv);

    inner.appendChild(dataContainer);

    // Net Worth (prominent, at bottom)
    const netWorth = document.createElement('div');
    netWorth.style.position = 'absolute';
    netWorth.style.bottom = '8px';
    netWorth.style.left = '8px';
    netWorth.style.right = '8px';
    netWorth.style.fontSize = '14px';
    netWorth.style.fontWeight = 'bold';
    netWorth.style.textAlign = 'center';
    netWorth.style.padding = '4px';
    netWorth.style.backgroundColor = 'rgba(0,0,0,0.3)';
    netWorth.style.borderRadius = '4px';
    netWorth.textContent = person.netWorth;
    inner.appendChild(netWorth);

    element.appendChild(inner);
    return element;
}

// Clear all objects from scene
function clearObjects() {
    objects.forEach(obj => {
        if (scene && obj.parent === scene) {
            scene.remove(obj);
        }
    });
    objects = [];
}

// Handle window resize
function onWindowResize() {
    if (camera && renderer) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    if (renderer && scene && camera) {
        // Update controls
        if (controls) {
            controls.update();
        }

        // Auto-rotate for non-table layouts only if not interacting
        // For simplicity with TrackballControls, we'll disable auto-rotation
        // to avoid conflicts with user camera movement.
        /*
        if (currentLayout !== 'table') {
            camera.position.x = 3000 * Math.sin(Date.now() * 0.0001);
            camera.position.z = 3000 * Math.cos(Date.now() * 0.0001);
            camera.lookAt(scene.position);
        }
        */

        renderer.render(scene, camera);
    }
}

// Layout switching function (Assignment Requirement #6)
function switchLayout(layout) {
    console.log(`🔄 Switching to ${layout} layout`);

    if (window.setStatus) {
        setStatus(`Switching to ${layout} layout...`);
    }

    switch (layout) {
        case 'table':
            createTableLayout();
            break;
        case 'sphere':
            createSphereLayout();
            break;
        case 'helix':
            createHelixLayout();
            break;
        case 'grid':
            createGridLayout();
            break;
        default:
            console.warn(`Unknown layout: ${layout}`);
            createTableLayout();
    }

    if (window.setStatus) {
        setStatus(`${layout.charAt(0).toUpperCase() + layout.slice(1)} layout loaded`);
    }
}

// Make functions globally accessible
window.initializeVisualization = initializeVisualization;
window.switchLayout = switchLayout;
window.clearObjects = clearObjects;