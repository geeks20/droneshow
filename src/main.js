import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { DroneShowManager } from './FastDroneShowManager.js';
import { TextToFormation } from './TextToFormation.js';
import { SkyEnvironment } from './SkyEnvironment.js';
import { SecurityManager } from './SecurityManager.js';
import { ConsoleProtection } from './ConsoleProtection.js';
import { ErrorBoundary } from './ErrorBoundary.js';

class DroneShowApp {
    constructor() {
        try {
            this.container = document.getElementById('canvas-container');
            this.stats = document.getElementById('stats');
            this.securityManager = new SecurityManager();
            // Temporarily disable console protection
            // this.consoleProtection = new ConsoleProtection();
            this.errorBoundary = new ErrorBoundary();
            this.init();
            this.setupEventListeners();
        } catch (error) {
            console.error('Error initializing app:', error);
            alert('خطأ في تشغيل التطبيق: ' + error.message);
        }
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
        const audioToggle = document.getElementById('audio-toggle');

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
            'الوطن غالي وما له بديل',
            'سعودي سكايز — ننّوّر السما',
            'عزّنا بطبعنا',
            'دام عزك يا وطن',
            'همة حتى القمة',
            'رؤية وطن طموح'
        ];
        
        this.saudiSayingsEn = [
            'SAUDI SKIES — LIGHT THE SKY',
            'SAUDI NATIONAL DAY 95',
            'VISION 2030',
            'KINGDOM OF SAUDI ARABIA',
            'SAUDI PRIDE',
            'ONE NATION ONE DREAM',
            'SAUDI STRONG',
            'FUTURE SAUDI',
            'SAUDI FOREVER',
            'PROUD TO BE SAUDI'
        ];

        // Initialize language from localStorage or default to Arabic
        this.currentLang = localStorage.getItem('language') || 'ar';
        this.updateLanguage();

        // Character counter
        const charCounter = document.getElementById('char-counter');
        const charCount = document.getElementById('char-count');
        
        textInput.addEventListener('input', () => {
            const text = textInput.value;
            const length = text.length;
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
            // Initialize audio on first interaction
            if (this.droneShowManager && this.droneShowManager.audioManager) {
                this.droneShowManager.audioManager.init();
            }
            
            // Check rate limiting
            const rateCheck = this.securityManager.checkRateLimit();
            if (!rateCheck.allowed) {
                this.showError(this.currentLang === 'ar' ? rateCheck.message : rateCheck.messageEn);
                return;
            }
            
            let text = textInput.value.trim();
            if (!text) {
                text = 'سعودي سكايز — ننّوّر السما';
                textInput.value = text;
            }
            
            // Validate and sanitize input
            const validation = this.securityManager.validateInput(text);
            if (!validation.valid) {
                this.showError(this.currentLang === 'ar' ? validation.message : validation.messageEn);
                return;
            }
            
            // Use sanitized text
            text = validation.sanitized;
            textInput.value = text; // Update input with sanitized version
            
            if (text.length > 35) {
                // Flash the input to show it's too long
                textInput.style.borderColor = '#FF4444';
                setTimeout(() => {
                    textInput.style.borderColor = 'rgba(0, 165, 80, 0.3)';
                }, 1000);
                return;
            }
            
            this.generateShow(text);
        });

        exportBtn.addEventListener('click', () => {
            this.exportVideo();
        });

        luckyBtn.addEventListener('click', () => {
            // Initialize audio on first interaction
            if (this.droneShowManager && this.droneShowManager.audioManager) {
                this.droneShowManager.audioManager.init();
            }
            
            // Check rate limiting
            const rateCheck = this.securityManager.checkRateLimit();
            if (!rateCheck.allowed) {
                this.showError(this.currentLang === 'ar' ? rateCheck.message : rateCheck.messageEn);
                return;
            }
            
            // Pick a random saying based on current language
            const sayingsArray = this.currentLang === 'ar' ? this.saudiSayingsAr : this.saudiSayingsEn;
            const randomSaying = sayingsArray[Math.floor(Math.random() * sayingsArray.length)];
            textInput.value = randomSaying;
            
            // Update text direction based on language
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

        // Don't auto-generate on load to avoid unwanted audio
        
        // Icon buttons
        const mbsBtn = document.getElementById('mbs-btn');
        const mapBtn = document.getElementById('map-btn');
        
        mbsBtn.addEventListener('click', () => {
            this.droneShowManager.transitionToIcon('mbs');
        });
        
        mapBtn.addEventListener('click', () => {
            this.droneShowManager.transitionToIcon('map');
        });
        
        // Audio toggle
        let audioEnabled = true;
        audioToggle.addEventListener('click', () => {
            audioEnabled = !audioEnabled;
            const audioIcon = audioToggle.querySelector('.audio-icon');
            audioIcon.textContent = audioEnabled ? '🔊' : '🔇';
            
            // Update audio manager
            if (this.droneShowManager && this.droneShowManager.audioManager) {
                this.droneShowManager.audioManager.masterGain.gain.value = audioEnabled ? 0.3 : 0;
            }
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
            // Error generating show
        } finally {
            document.getElementById('loading').style.display = 'none';
        }
    }

    updateStats(droneCount) {
        if (this.currentLang === 'ar') {
            this.stats.innerHTML = `
                <div>الطائرات: <span>${droneCount}</span></div>
                <div>الإطارات: <span>${Math.round(1000 / this.deltaTime)}</span></div>
            `;
        } else {
            this.stats.innerHTML = `
                <div>Drones: <span>${droneCount}</span></div>
                <div>FPS: <span>${Math.round(1000 / this.deltaTime)}</span></div>
            `;
        }
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
        
        // Update tooltips for elements with data-title attributes
        const tooltipElements = document.querySelectorAll('[data-title-ar][data-title-en]');
        tooltipElements.forEach(element => {
            element.title = element.getAttribute(`data-title-${this.currentLang}`);
        });
        
        // Update text direction for buttons
        const buttons = document.querySelectorAll('.button');
        buttons.forEach(button => {
            button.style.direction = this.currentLang === 'ar' ? 'rtl' : 'ltr';
        });
        
        // Update text input direction
        const textInput = document.getElementById('text-input');
        textInput.style.direction = this.currentLang === 'ar' ? 'rtl' : 'ltr';
        textInput.placeholder = this.currentLang === 'ar' ? 'أدخل النص هنا...' : 'Enter text here...';
        
        // Update lang toggle icon
        const langToggle = document.getElementById('lang-toggle');
        langToggle.innerHTML = this.currentLang === 'ar' ? '<span class="lang-icon">EN</span>' : '<span class="lang-icon">عر</span>';
        
        // Update stats labels
        this.updateStats(this.droneShowManager?.drones?.length || 0);
    }

    showError(message) {
        // Create error notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(255, 68, 68, 0.9);
            color: white;
            padding: 20px 40px;
            border-radius: 12px;
            font-size: 16px;
            font-weight: 600;
            z-index: 10000;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
            text-align: center;
            direction: ${this.currentLang === 'ar' ? 'rtl' : 'ltr'};
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transition = 'opacity 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    async exportVideo() {
        if (this.isRecording) {
            // Stop recording
            this.stopRecording();
            return;
        }
        
        // Start recording
        this.startRecording();
    }
    
    startRecording() {
        try {
            // Update button text
            const exportBtn = document.getElementById('export-btn');
            exportBtn.textContent = this.currentLang === 'ar' ? 'إيقاف التسجيل ⏹️' : 'Stop Recording ⏹️';
            exportBtn.style.background = 'rgba(255, 68, 68, 0.8)';
            
            // Set up MediaRecorder
            const canvas = this.renderer.domElement;
            const stream = canvas.captureStream(30); // 30 FPS
            
            this.mediaRecorder = new MediaRecorder(stream, {
                mimeType: 'video/webm;codecs=vp9'
            });
            
            this.recordedChunks = [];
            
            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.recordedChunks.push(event.data);
                }
            };
            
            this.mediaRecorder.onstop = () => {
                this.downloadRecording();
            };
            
            this.mediaRecorder.start();
            this.isRecording = true;
            
            // Show recording indicator
            this.showRecordingIndicator();
            
        } catch (error) {
            this.showError(this.currentLang === 'ar' ? 
                'خطأ في بدء التسجيل' : 
                'Error starting recording');
        }
    }
    
    stopRecording() {
        if (this.mediaRecorder && this.isRecording) {
            this.mediaRecorder.stop();
            this.isRecording = false;
            
            // Reset button
            const exportBtn = document.getElementById('export-btn');
            exportBtn.textContent = this.currentLang === 'ar' ? 'تحميل الفيديو' : 'Export Video';
            exportBtn.style.background = 'rgba(0, 165, 80, 0.8)';
            
            // Hide recording indicator
            this.hideRecordingIndicator();
        }
    }
    
    downloadRecording() {
        const blob = new Blob(this.recordedChunks, {
            type: 'video/webm'
        });
        
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `saudi-skies-drone-show-${Date.now()}.webm`;
        link.click();
        
        // Clean up
        URL.revokeObjectURL(url);
        this.recordedChunks = [];
        
        this.showError(this.currentLang === 'ar' ? 
            'تم تحميل الفيديو بنجاح!' : 
            'Video downloaded successfully!');
    }
    
    showRecordingIndicator() {
        // Create recording indicator
        const indicator = document.createElement('div');
        indicator.id = 'recording-indicator';
        indicator.style.cssText = `
            position: fixed;
            top: 20px;
            left: 20px;
            background: rgba(255, 68, 68, 0.9);
            color: white;
            padding: 10px 20px;
            border-radius: 25px;
            font-size: 14px;
            font-weight: 600;
            z-index: 10000;
            backdrop-filter: blur(10px);
            animation: pulse 1.5s infinite;
        `;
        indicator.innerHTML = `🔴 ${this.currentLang === 'ar' ? 'جاري التسجيل' : 'Recording'}`;
        
        // Add pulsing animation
        if (!document.getElementById('pulse-style')) {
            const style = document.createElement('style');
            style.id = 'pulse-style';
            style.textContent = `
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.7; }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(indicator);
    }
    
    hideRecordingIndicator() {
        const indicator = document.getElementById('recording-indicator');
        if (indicator) {
            indicator.remove();
        }
    }
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    new DroneShowApp();
});