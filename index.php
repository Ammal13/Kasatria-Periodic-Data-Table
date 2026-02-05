<?php
// index.php - Main visualization page with authentication
require_once 'check_auth.php'; // This will redirect to login if not authenticated

$userInfo = getUserInfo();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Periodic Table Data Visualization</title>
    <style>
        body { 
            margin: 0; 
            font-family: Arial, sans-serif; 
            background: #1a1a1a;
            color: white;
        }
        #visualization-container {
            display: block;
            width: 100%;
            height: 100vh;
            position: relative;
            overflow: hidden;
        }
        #controls {
            position: absolute;
            top: 20px;
            left: 20px;
            z-index: 100;
            background: rgba(0,0,0,0.7);
            padding: 15px;
            border-radius: 10px;
            max-width: 300px;
        }
        #controls h3 {
            margin-top: 0;
            margin-bottom: 10px;
            color: #4285f4;
        }
        .layout-btn {
            margin: 5px;
            padding: 10px 15px;
            background: #4285f4;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            width: 100%;
            text-align: left;
            display: block;
        }
        .layout-btn:hover {
            background: #3367d6;
        }
        #sign-out-btn {
            background: #dc3545;
            margin-top: 10px;
        }
        #canvas {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
        }
        #status {
            position: absolute;
            bottom: 20px;
            left: 20px;
            background: rgba(0,0,0,0.7);
            padding: 10px;
            border-radius: 5px;
            font-size: 12px;
        }
        #user-info {
            position: absolute;
            top: 20px;
            right: 20px;
            background: rgba(0,0,0,0.7);
            padding: 10px 15px;
            border-radius: 10px;
            font-size: 14px;
            z-index: 100;
        }
    </style>
</head>
<body>
    <!-- Visualization Page -->
    <div id="visualization-container">
        <!-- User Info -->
        <div id="user-info">
            👤 <?php echo htmlspecialchars($userInfo['email']); ?>
        </div>
        
        <div id="controls">
            <h3>📊 Layout Controls</h3>
            <button class="layout-btn" onclick="switchLayout('table')">
                📋 Table Layout (20×10 Grid)
            </button>
            <button class="layout-btn" onclick="switchLayout('sphere')">
                🌐 Sphere Layout
            </button>
            <button class="layout-btn" onclick="switchLayout('helix')">
                🧬 Double Helix Layout
            </button>
            <button class="layout-btn" onclick="switchLayout('grid')">
                🔲 Grid Layout (5×4×10)
            </button>
            <button id="sign-out-btn" class="layout-btn" onclick="signOut()">
                🚪 Sign Out
            </button>
        </div>
        
        <div id="status">Loading...</div>
        
    </div>

    <!-- Load Three.js using ES6 modules (modern approach) -->
    <script type="importmap">
        {
            "imports": {
                "three": "https://unpkg.com/three@0.160.0/build/three.module.js"
            }
        }
    </script>
    <script type="module">
        import * as THREE from 'three';
        import { CSS3DRenderer, CSS3DObject } from 'https://unpkg.com/three@0.160.0/examples/jsm/renderers/CSS3DRenderer.js';
        import { TrackballControls } from 'https://unpkg.com/three@0.160.0/examples/jsm/controls/TrackballControls.js';

        // Export to global scope
        window.THREE = THREE;
        window.CSS3DRenderer = CSS3DRenderer;
        window.CSS3DObject = CSS3DObject;
        window.TrackballControls = TrackballControls;
        window.PerspectiveCamera = THREE.PerspectiveCamera;
        window.Scene = THREE.Scene;
        window.Vector3 = THREE.Vector3;
        
        // Signal that Three.js is ready
        window.dispatchEvent(new Event('three-ready'));
        window.dispatchEvent(new Event('three-loaded'));
    </script>
    
    <!-- Your scripts (in correct order) -->
    <script src="threejs-visualizations.js"></script>
    <script src="data-loader.js"></script>
    <script src="script.js"></script>
    
    <!-- Initialize page -->
    <script>
        // Set status message
        function setStatus(message) {
            const status = document.getElementById('status');
            if (status) status.textContent = message;
        }
        
        // Sign out function
        function signOut() {
            if (confirm('Are you sure you want to sign out?')) {
                window.location.href = 'logout.php';
            }
        }
        
        // Initialize on page load
        window.addEventListener('load', function() {
            console.log("Page loaded, user authenticated via PHP session");
            setStatus("Loading data from Google Sheets...");
            
            // Load data from Google Sheets
            setTimeout(() => {
                if (window.loadDataFromGoogleSheets) {
                    loadDataFromGoogleSheets();
                } else {
                    setStatus("Error: Data loader not found");
                }
            }, 500);
        });
    </script>
</body>
</html>
