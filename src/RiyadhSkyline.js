import * as THREE from 'three';
import gsap from 'gsap';

export class RiyadhSkyline {
    constructor(scene) {
        this.scene = scene;
        this.buildings = [];
        this.createSkyline();
        this.createHighway();
        this.createBridges();
    }
    
    createSkyline() {
        // KAFD towers and Riyadh skyline
        const buildingConfigs = [
            // KAFD iconic towers
            { x: -150, width: 30, depth: 30, height: 120, color: 0x1a237e, glow: true },
            { x: -100, width: 25, depth: 25, height: 150, color: 0x283593, glow: true },
            { x: -50, width: 35, depth: 35, height: 180, color: 0x303f9f, glow: true },
            { x: 0, width: 40, depth: 40, height: 200, color: 0x3f51b5, glow: true }, // Tallest
            { x: 60, width: 30, depth: 30, height: 160, color: 0x5c6bc0, glow: true },
            { x: 110, width: 25, depth: 25, height: 140, color: 0x7986cb, glow: true },
            { x: 160, width: 35, depth: 35, height: 110, color: 0x9fa8da, glow: true },
            
            // Background buildings
            { x: -250, width: 20, depth: 20, height: 80, color: 0x1a1a2e },
            { x: -200, width: 25, depth: 25, height: 60, color: 0x16213e },
            { x: 200, width: 20, depth: 20, height: 70, color: 0x0f3460 },
            { x: 250, width: 30, depth: 30, height: 90, color: 0x1a1a2e },
        ];
        
        buildingConfigs.forEach(config => {
            // Building base
            const geometry = new THREE.BoxGeometry(config.width, config.height, config.depth);
            const material = new THREE.MeshPhongMaterial({
                color: config.color,
                emissive: config.color,
                emissiveIntensity: 0.2
            });
            
            const building = new THREE.Mesh(geometry, material);
            building.position.set(config.x, config.height / 2 - 10, -200);
            this.scene.add(building);
            this.buildings.push(building);
            
            // Window lights
            this.addWindowLights(building, config);
            
            // Glow effect for main towers
            if (config.glow) {
                this.addBuildingGlow(building, config);
            }
        });
        
        // Add Kingdom Tower silhouette in far background
        const kingdomGeometry = new THREE.ConeGeometry(15, 100, 4);
        const kingdomMaterial = new THREE.MeshPhongMaterial({
            color: 0x0a0a0a,
            emissive: 0x1a237e,
            emissiveIntensity: 0.1
        });
        const kingdom = new THREE.Mesh(kingdomGeometry, kingdomMaterial);
        kingdom.position.set(-300, 40, -350);
        kingdom.rotation.y = Math.PI / 4;
        this.scene.add(kingdom);
    }
    
    addWindowLights(building, config) {
        const windowRows = Math.floor(config.height / 10);
        const windowCols = Math.floor(config.width / 5);
        
        for (let row = 0; row < windowRows; row++) {
            for (let col = 0; col < windowCols; col++) {
                if (Math.random() > 0.3) { // 70% windows lit
                    const light = new THREE.PointLight(0xffeb3b, 0.1, 10);
                    light.position.set(
                        config.x + (col - windowCols/2) * 5,
                        row * 10 - 5,
                        -195
                    );
                    this.scene.add(light);
                    
                    // Flicker some windows
                    if (Math.random() > 0.9) {
                        gsap.to(light, {
                            intensity: 0,
                            duration: 0.1 + Math.random() * 0.2,
                            repeat: -1,
                            yoyo: true,
                            repeatDelay: Math.random() * 5
                        });
                    }
                }
            }
        }
    }
    
    addBuildingGlow(building, config) {
        // Top glow
        const glowGeometry = new THREE.BoxGeometry(
            config.width * 1.1, 
            5, 
            config.depth * 1.1
        );
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.5,
            blending: THREE.AdditiveBlending
        });
        const topGlow = new THREE.Mesh(glowGeometry, glowMaterial);
        topGlow.position.copy(building.position);
        topGlow.position.y = config.height - 12;
        this.scene.add(topGlow);
        
        // Edge lighting
        const edgeLight = new THREE.PointLight(0x00ffff, 1, 50);
        edgeLight.position.copy(topGlow.position);
        this.scene.add(edgeLight);
    }
    
    createHighway() {
        // Main highway with light trails
        const roadGeometry = new THREE.PlaneGeometry(600, 20);
        const roadMaterial = new THREE.MeshBasicMaterial({
            color: 0x222222,
            transparent: true,
            opacity: 0.8
        });
        const road = new THREE.Mesh(roadGeometry, roadMaterial);
        road.rotation.x = -Math.PI / 2;
        road.position.set(0, -9.5, -100);
        this.scene.add(road);
        
        // Orange light trail (like in the image)
        this.createLightTrail(0xff9800, -5);
        this.createLightTrail(0xffffff, 5);
    }
    
    createLightTrail(color, offset) {
        const trailGeometry = new THREE.PlaneGeometry(400, 2);
        const trailMaterial = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });
        const trail = new THREE.Mesh(trailGeometry, trailMaterial);
        trail.rotation.x = -Math.PI / 2;
        trail.position.set(0, -8.5, -100 + offset);
        this.scene.add(trail);
        
        // Animate the trail
        const glowTrail = trail.clone();
        glowTrail.material = trailMaterial.clone();
        glowTrail.material.opacity = 0;
        glowTrail.scale.x = 1.2;
        this.scene.add(glowTrail);
        
        gsap.to(glowTrail.material, {
            opacity: 0.6,
            duration: 2,
            repeat: -1,
            yoyo: true,
            ease: "power2.inOut"
        });
        
        // Moving lights
        for (let i = 0; i < 3; i++) {
            const lightDot = new THREE.Mesh(
                new THREE.SphereGeometry(1, 8, 8),
                new THREE.MeshBasicMaterial({
                    color: color,
                    emissive: color,
                    emissiveIntensity: 1
                })
            );
            lightDot.position.set(-200 + i * 50, -7, -100 + offset);
            this.scene.add(lightDot);
            
            gsap.to(lightDot.position, {
                x: 300,
                duration: 3 + i * 0.5,
                repeat: -1,
                ease: "none",
                onRepeat: function() {
                    this.targets()[0].position.x = -300;
                }
            });
        }
    }
    
    createBridges() {
        // Cable-stayed bridge
        const pylonGeometry = new THREE.BoxGeometry(5, 80, 5);
        const pylonMaterial = new THREE.MeshPhongMaterial({
            color: 0x37474f,
            emissive: 0x455a64,
            emissiveIntensity: 0.3
        });
        
        // Two pylons
        const pylon1 = new THREE.Mesh(pylonGeometry, pylonMaterial);
        pylon1.position.set(-80, 30, -100);
        this.scene.add(pylon1);
        
        const pylon2 = new THREE.Mesh(pylonGeometry, pylonMaterial);
        pylon2.position.set(80, 30, -100);
        this.scene.add(pylon2);
        
        // Cables
        const cableCount = 8;
        for (let i = 0; i < cableCount; i++) {
            const progress = i / (cableCount - 1);
            const cableGeometry = new THREE.CylinderGeometry(0.2, 0.2, 70);
            const cableMaterial = new THREE.MeshBasicMaterial({
                color: 0xeceff1,
                emissive: 0xffffff,
                emissiveIntensity: 0.1
            });
            
            // Left cables
            const leftCable = new THREE.Mesh(cableGeometry, cableMaterial);
            leftCable.position.set(-80 + progress * 60, 30, -100);
            leftCable.rotation.z = -progress * 0.8;
            this.scene.add(leftCable);
            
            // Right cables
            const rightCable = new THREE.Mesh(cableGeometry, cableMaterial);
            rightCable.position.set(80 - progress * 60, 30, -100);
            rightCable.rotation.z = progress * 0.8;
            this.scene.add(rightCable);
        }
    }
    
    update(time) {
        // Subtle building sway for tall towers
        this.buildings.forEach((building, index) => {
            if (building.geometry.parameters.height > 150) {
                const sway = Math.sin(time * 0.0005 + index) * 0.002;
                building.rotation.z = sway;
            }
        });
    }
}