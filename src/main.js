import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { DroneShowManager } from './FastDroneShowManager.js';
import { TextToFormation } from './TextToFormation.js';
import { SkyEnvironment } from './SkyEnvironment.js';

class DroneShowApp {
    constructor() {
        this.container = document.getElementById('canvas-container');
        this.stats = document.getElementById('stats');
        this.init();
        this.setupEventListeners();
    }

    init() {
        // Scene setup - darker for better contrast
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000511);
        this.scene.fog = new THREE.Fog(0x000511, 100, 1500);

        // Camera setup
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            2000
        );
        this.camera.position.set(0, 100, 400);

        // Renderer setup
        this.renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.container.appendChild(this.renderer.domElement);

        // Controls
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.maxDistance = 800;
        this.controls.minDistance = 50;
        this.controls.target.set(0, 100, 0);

        // Lighting - increased for better visibility
        const ambientLight = new THREE.AmbientLight(0x404040, 0.8);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.3);
        directionalLight.position.set(100, 200, 100);
        directionalLight.castShadow = false; // Disabled for performance
        this.scene.add(directionalLight);

        // Initialize managers
        this.skyEnvironment = new SkyEnvironment(this.scene);
        this.droneShowManager = new DroneShowManager(this.scene);
        this.textToFormation = new TextToFormation();

        // Start animation loop
        this.animate();
    }

    setupEventListeners() {
        const generateBtn = document.getElementById('generate-btn');
        const exportBtn = document.getElementById('export-btn');
        const textInput = document.getElementById('text-input');

        generateBtn.addEventListener('click', () => {
            const text = textInput.value || 'دام عزك يا وطن';
            this.generateShow(text);
        });

        exportBtn.addEventListener('click', () => {
            this.exportVideo();
        });

        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });

        // Auto-generate on load
        setTimeout(() => {
            this.generateShow(textInput.value);
        }, 1000);
    }

    async generateShow(text) {
        document.getElementById('loading').style.display = 'block';
        
        try {
            // Generate formation data
            const formationData = await this.textToFormation.generateFormation(text);
            
            // Create drone show with text formation reference
            await this.droneShowManager.createShow(formationData, this.textToFormation);
            
            // Update stats
            this.updateStats(formationData.droneCount);
        } catch (error) {
            console.error('Error generating show:', error);
        } finally {
            document.getElementById('loading').style.display = 'none';
        }
    }

    updateStats(droneCount) {
        this.stats.innerHTML = `
            <div>Drones: ${droneCount}</div>
            <div>FPS: ${Math.round(1000 / this.deltaTime)}</div>
        `;
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const time = performance.now();
        let deltaTime = (time - (this.lastTime || time)) / 1000; // Convert to seconds
        deltaTime = Math.min(deltaTime, 1/30); // Clamp to avoid huge slow frames
        this.lastTime = time;
        this.deltaTime = deltaTime * 1000; // Store in ms for FPS display

        // Update controls
        this.controls.update();

        // Update animations with clamped delta time
        this.droneShowManager.update(time, this.camera);
        this.skyEnvironment.update(time);

        // Render
        this.renderer.render(this.scene, this.camera);
    }

    async exportVideo() {
        // This would integrate with a library like CCapture.js
        // For now, we'll capture a screenshot
        const dataURL = this.renderer.domElement.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = 'drone-show-frame.png';
        link.href = dataURL;
        link.click();
        
        alert('Video export feature coming soon! Screenshot saved instead.');
    }
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    new DroneShowApp();
});