// script.js - Main controller
console.log("🎮 Controller script loaded");

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log("✅ Page loaded");
    
    // Note: We're NOT adding Sign Out button here anymore
    // It's already in the HTML to prevent duplicates
    
    // Setup mouse controls
    setupMouseControls();
});

// Setup mouse controls for camera
function setupMouseControls() {
    let isMouseDown = false;
    let mouseX = 0, mouseY = 0;
    
    document.addEventListener('mousedown', function(e) {
        if (e.button !== 0) return; // Left click only
        isMouseDown = true;
        mouseX = e.clientX;
        mouseY = e.clientY;
        document.body.style.cursor = 'grabbing';
    });
    
    document.addEventListener('mouseup', function() {
        isMouseDown = false;
        document.body.style.cursor = '';
    });
    
    document.addEventListener('mousemove', function(e) {
        if (!isMouseDown || typeof camera === 'undefined' || !camera) return;
        
        const deltaX = e.clientX - mouseX;
        const deltaY = e.clientY - mouseY;
        
        camera.position.x += deltaX * 0.5;
        camera.position.y -= deltaY * 0.5;
        
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        if (typeof scene !== 'undefined' && scene) {
            camera.lookAt(scene.position);
        }
    });
    
    // Zoom with mouse wheel
    document.addEventListener('wheel', function(e) {
        if (typeof camera === 'undefined' || !camera) return;
        
        e.preventDefault();
        
        camera.position.z += e.deltaY * 0.1;
        camera.position.z = Math.max(500, Math.min(10000, camera.position.z));
        
        if (typeof scene !== 'undefined' && scene) {
            camera.lookAt(scene.position);
        }
    }, { passive: false });
}

// No duplicate signOut function - it's in auth.js