import * as THREE from 'three';
import gsap from 'gsap';

export class CityBackground {
    constructor(scene) {
        this.scene = scene;
        this.buildings = [];
        this.lights = [];
        this.createCity();
        this.createBridge();
        this.createHighway();
        this.addAtmosphericEffects();
    }
    
    createCity() {
        // Create city skyline with various building heights
        const buildingData = [
            // Background buildings (darker)
            { x: -400, width: 40, height: 80, depth: 40, emissive: 0x0a1628 },
            { x: -340, width: 35, height: 100, depth: 35, emissive: 0x0a1628 },
            { x: -280, width: 45, height: 120, depth: 45, emissive: 0x0a1628 },
            { x: -200, width: 30, height: 90, depth: 30, emissive: 0x0a1628 },
            { x: -140, width: 50, height: 140, depth: 50, emissive: 0x0a1628 },
            
            // KAFD-style towers (lit up)
            { x: -50, width: 35, height: 180, depth: 35, emissive: 0x00ff9a, glow: true },
            { x: 10, width: 40, height: 220, depth: 40, emissive: 0x00ff9a, glow: true },
            { x: 70, width: 35, height: 200, depth: 35, emissive: 0x00ff9a, glow: true },
            { x: 120, width: 30, height: 160, depth: 30, emissive: 0x00ff9a, glow: true },
            
            // Right side buildings
            { x: 200, width: 40, height: 110, depth: 40, emissive: 0x0a1628 },
            { x: 260, width: 35, height: 95, depth: 35, emissive: 0x0a1628 },
            { x: 320, width: 45, height: 130, depth: 45, emissive: 0x0a1628 },
            { x: 380, width: 30, height: 85, depth: 30, emissive: 0x0a1628 },
        ];
        
        // Create buildings
        buildingData.forEach(data => {
            const geometry = new THREE.BoxGeometry(data.width, data.height, data.depth);
            const material = new THREE.MeshPhongMaterial({
                color: 0x0a1628,
                emissive: data.emissive,
                emissiveIntensity: data.glow ? 0.05 : 0.02
            });
            
            const building = new THREE.Mesh(geometry, material);
            building.position.set(data.x, data.height/2 - 50, -300);
            this.scene.add(building);
            this.buildings.push(building);
            
            // Add window lights for glow buildings
            if (data.glow) {
                this.addBuildingLights(building, data);
            }
        });
        
        // Ground plane
        const groundGeometry = new THREE.PlaneGeometry(1500, 600);
        const groundMaterial = new THREE.MeshBasicMaterial({
            color: 0x0a1122,
            transparent: true,
            opacity: 0.8
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -50;
        ground.position.z = -300;
        this.scene.add(ground);
    }
    
    addBuildingLights(building, data) {
        // Create glowing edges
        const edgeGeometry = new THREE.EdgesGeometry(building.geometry);
        const edgeMaterial = new THREE.LineBasicMaterial({
            color: data.emissive,
            transparent: true,
            opacity: 0.6
        });
        const edges = new THREE.LineSegments(edgeGeometry, edgeMaterial);
        building.add(edges);
        
        // Add point light at top
        const light = new THREE.PointLight(data.emissive, 0.5, 100);
        light.position.copy(building.position);
        light.position.y = data.height - 45;
        this.scene.add(light);
        
        // Subtle pulsing
        gsap.to(light, {
            intensity: 0.8,
            duration: 2 + Math.random() * 2,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
        });
    }
    
    createBridge() {
        // Cable-stayed bridge with animated lights
        const curve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(-600, -40, -250),
            new THREE.Vector3(-200, -35, -240),
            new THREE.Vector3(200, -35, -240),
            new THREE.Vector3(600, -40, -250)
        ]);
        
        // Bridge deck
        const bridgeGeometry = new THREE.TubeGeometry(curve, 50, 8, 8, false);
        const bridgeMaterial = new THREE.MeshBasicMaterial({
            color: 0x1a1a2e,
            transparent: true,
            opacity: 0.8
        });
        const bridge = new THREE.Mesh(bridgeGeometry, bridgeMaterial);
        this.scene.add(bridge);
        
        // Bridge cables (simplified)
        const cablePoints = [];
        for (let i = -300; i <= 300; i += 100) {
            cablePoints.push(
                new THREE.Vector3(i, -35, -240),
                new THREE.Vector3(i, 50, -240),
                new THREE.Vector3(i, -35, -240)
            );
        }
        
        const cableGeometry = new THREE.BufferGeometry().setFromPoints(cablePoints);
        const cableMaterial = new THREE.LineBasicMaterial({
            color: 0x00ff9a,
            transparent: true,
            opacity: 0.3
        });
        const cables = new THREE.Line(cableGeometry, cableMaterial);
        this.scene.add(cables);
        
        // Animated bridge lights
        this.createBridgeLights(curve);
    }
    
    createBridgeLights(curve) {
        const lightCount = 20;
        for (let i = 0; i < lightCount; i++) {
            const t = i / lightCount;
            const position = curve.getPointAt(t);
            
            const lightGeometry = new THREE.SphereGeometry(1.5, 8, 8);
            const lightMaterial = new THREE.MeshBasicMaterial({
                color: 0x00ff9a,
                emissive: 0x00ff9a,
                emissiveIntensity: 1
            });
            
            const light = new THREE.Mesh(lightGeometry, lightMaterial);
            light.position.copy(position);
            light.position.y += 2;
            this.scene.add(light);
            
            // Animated glow
            gsap.to(light.scale, {
                x: 1.5,
                y: 1.5,
                z: 1.5,
                duration: 1,
                repeat: -1,
                yoyo: true,
                delay: i * 0.1,
                ease: "power2.inOut"
            });
        }
    }
    
    createHighway() {
        // Curved highway with light trails
        const highwayPath = new THREE.CatmullRomCurve3([
            new THREE.Vector3(-500, -48, -200),
            new THREE.Vector3(-200, -47, -180),
            new THREE.Vector3(100, -46, -160),
            new THREE.Vector3(400, -48, -200),
            new THREE.Vector3(600, -49, -250)
        ]);
        
        // Highway surface
        const highwayGeometry = new THREE.TubeGeometry(highwayPath, 100, 20, 8, false);
        const highwayMaterial = new THREE.MeshBasicMaterial({
            color: 0x1a1a1a,
            transparent: true,
            opacity: 0.9
        });
        const highway = new THREE.Mesh(highwayGeometry, highwayMaterial);
        this.scene.add(highway);
        
        // Create light trails
        this.createLightTrails(highwayPath);
    }
    
    createLightTrails(path) {
        // Orange light trail (like in reference)
        const trailCount = 5;
        
        for (let i = 0; i < trailCount; i++) {
            const trailLight = new THREE.Mesh(
                new THREE.BoxGeometry(40, 0.5, 3),
                new THREE.MeshBasicMaterial({
                    color: 0xff9500,
                    emissive: 0xff9500,
                    emissiveIntensity: 1,
                    transparent: true,
                    opacity: 0.8
                })
            );
            
            // Animate along path
            const tl = gsap.timeline({ repeat: -1 });
            const duration = 8 + i * 0.5;
            
            tl.to(trailLight.position, {
                duration: duration,
                ease: "none",
                onUpdate: function() {
                    const progress = this.progress();
                    const point = path.getPointAt(progress);
                    trailLight.position.copy(point);
                    trailLight.position.y += 0.5;
                    
                    // Orient to path
                    const tangent = path.getTangentAt(progress);
                    trailLight.lookAt(
                        trailLight.position.x + tangent.x,
                        trailLight.position.y,
                        trailLight.position.z + tangent.z
                    );
                }
            });
        }
    }
    
    addAtmosphericEffects() {
        // Add fog to create depth
        this.scene.fog = new THREE.Fog(0x070e1d, 100, 800);
        
        // Subtle ambient light
        const ambientLight = new THREE.AmbientLight(0x0a1628, 0.5);
        this.scene.add(ambientLight);
        
        // City glow effect using hemisphere light
        const hemiLight = new THREE.HemisphereLight(0x1a2f4a, 0x000000, 0.3);
        this.scene.add(hemiLight);
    }
    
    update(time) {
        // Subtle building sway for tall towers
        this.buildings.forEach((building, i) => {
            if (building.geometry.parameters.height > 150) {
                building.rotation.z = Math.sin(time * 0.0003 + i) * 0.001;
            }
        });
    }
}