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
        // Scene setup - transparent to show HTML background
        this.scene = new THREE.Scene();
        this.scene.background = null; // Transparent to show city background
        this.scene.fog = new THREE.Fog(0x060b17, 150, 900); // Matching city palette

        // Camera setup
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            2000
        );
        this.camera.position.set(0, 100, 400);

        // Renderer setup
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true, 
            preserveDrawingBuffer: true,
            alpha: true // Enable transparency
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); // Cap DPI for performance
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.container.appendChild(this.renderer.domElement);

        // Controls - Enhanced for better interactivity
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.maxDistance = 800;
        this.controls.minDistance = 50;
        this.controls.target.set(0, 50, 0);
        this.controls.enablePan = true;
        this.controls.panSpeed = 0.8;
        this.controls.rotateSpeed = 0.8;
        this.controls.zoomSpeed = 1.2;
        
        // Smooth zoom with mouse wheel
        this.controls.mouseButtons = {
            LEFT: THREE.MOUSE.ROTATE,
            MIDDLE: THREE.MOUSE.DOLLY,
            RIGHT: THREE.MOUSE.PAN
        };

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
        const langToggle = document.getElementById('lang-toggle');
        const luckyBtn = document.getElementById('lucky-btn');

        // Saudi sayings for the lucky button
        this.saudiSayingsAr = [
            'يا حلو ديرتنا والله',
            'الوطن بقلوبنا دايم',
            'من الديرة وأفتخر',
            'سعودي وأرفع راسي فوق',
            'الدار دارنا والعز عزنا',
            'نفداك يا وطن',
            'الله لا يغير علينا',
            'السعودية بقلبي قبل اسمي',
            'كبرنا وكبرت عزتنا معها',
            'الوطن غالي وما له بديل'
        ];
        
        this.saudiSayingsEn = [
            'SAUDI ARABIA',
            'VISION 2030',
            'SAUDI NATIONAL DAY',
            'KINGDOM OF SAUDI ARABIA',
            'SAUDI PRIDE',
            'ONE NATION',
            'SAUDI STRONG',
            'FUTURE SAUDI',
            'SAUDI FOREVER',
            'PROUD SAUDI'
        ];

        // Initialize language from localStorage or default to Arabic
        this.currentLang = localStorage.getItem('language') || 'ar';
        this.updateLanguage();

        // Character counter
        const charCounter = document.getElementById('char-counter');
        const charCount = document.getElementById('char-count');
        
        textInput.addEventListener('input', () => {
            const length = textInput.value.length;
            charCount.textContent = length;
            
            // Update counter color based on length
            charCounter.classList.remove('warning', 'danger');
            if (length > 30) {
                charCounter.classList.add('danger');
            } else if (length > 25) {
                charCounter.classList.add('warning');
            }
        });

        generateBtn.addEventListener('click', () => {
            const text = textInput.value.trim();
            if (!text) {
                textInput.value = 'دام عزك يا وطن';
            }
            
            if (text.length > 35) {
                // Flash the input to show it's too long
                textInput.style.borderColor = '#FF4444';
                setTimeout(() => {
                    textInput.style.borderColor = 'rgba(0, 165, 80, 0.3)';
                }, 1000);
                return;
            }
            
            this.generateShow(textInput.value || 'دام عزك يا وطن');
        });

        exportBtn.addEventListener('click', () => {
            this.exportVideo();
        });

        luckyBtn.addEventListener('click', () => {
            // Pick a random saying based on current language
            const sayingsArray = this.currentLang === 'ar' ? this.saudiSayingsAr : this.saudiSayingsEn;
            const randomSaying = sayingsArray[Math.floor(Math.random() * sayingsArray.length)];
            textInput.value = randomSaying;
            
            // Update text direction based on content
            textInput.style.direction = this.currentLang === 'ar' ? 'rtl' : 'ltr';
            
            // Update character counter
            charCount.textContent = randomSaying.length;
            charCounter.classList.remove('warning', 'danger');
            if (randomSaying.length > 30) {
                charCounter.classList.add('danger');
            } else if (randomSaying.length > 25) {
                charCounter.classList.add('warning');
            }
            
            // Add a fun animation to the input
            textInput.style.transform = 'scale(1.05)';
            textInput.style.background = 'rgba(255, 215, 0, 0.1)';
            
            setTimeout(() => {
                textInput.style.transform = 'scale(1)';
                textInput.style.background = 'rgba(255, 255, 255, 0.05)';
                // Auto-generate the show
                this.generateShow(randomSaying);
            }, 200);
        });

        langToggle.addEventListener('click', () => {
            this.currentLang = this.currentLang === 'ar' ? 'en' : 'ar';
            localStorage.setItem('language', this.currentLang);
            this.updateLanguage();
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
        
        // Icon buttons
        const kingBtn = document.getElementById('king-btn');
        const mbsBtn = document.getElementById('mbs-btn');
        const mapBtn = document.getElementById('map-btn');
        const kaabaBtn = document.getElementById('kaaba-btn');
        
        kingBtn.addEventListener('click', () => {
            this.droneShowManager.transitionToIcon('king');
        });
        
        mbsBtn.addEventListener('click', () => {
            this.droneShowManager.transitionToIcon('mbs');
        });
        
        mapBtn.addEventListener('click', () => {
            this.droneShowManager.transitionToIcon('map');
        });
        
        kaabaBtn.addEventListener('click', () => {
            this.droneShowManager.transitionToIcon('kaaba');
        });
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
            <div>Drones: <span>${droneCount}</span></div>
            <div>FPS: <span>${Math.round(1000 / this.deltaTime)}</span></div>
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

    createGround() {
        // Simple dark ground plane
        const groundGeometry = new THREE.PlaneGeometry(2000, 2000);
        const groundMaterial = new THREE.MeshBasicMaterial({
            color: 0x0a0a0a,
            transparent: true,
            opacity: 0.5
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -10;
        this.scene.add(ground);
        
        // Add subtle grid
        const gridHelper = new THREE.GridHelper(1000, 50, 0x00A550, 0x001a0d);
        gridHelper.position.y = -9;
        gridHelper.material.opacity = 0.2;
        gridHelper.material.transparent = true;
        this.scene.add(gridHelper);
    }

    updateLanguage() {
        // Update all elements with language data attributes
        const elements = document.querySelectorAll('[data-ar][data-en]');
        elements.forEach(element => {
            element.textContent = element.getAttribute(`data-${this.currentLang}`);
        });
        
        // Update text direction for buttons
        const buttons = document.querySelectorAll('.button');
        buttons.forEach(button => {
            button.style.direction = this.currentLang === 'ar' ? 'rtl' : 'ltr';
        });
        
        // Update lang toggle icon
        const langToggle = document.getElementById('lang-toggle');
        langToggle.innerHTML = this.currentLang === 'ar' ? '<span class="lang-icon">EN</span>' : '<span class="lang-icon">عر</span>';
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