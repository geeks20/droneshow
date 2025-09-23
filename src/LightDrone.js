import * as THREE from 'three';

export class Drone {
    constructor() {
        this.mesh = new THREE.Group();
        
        // Just a tiny glowing point - no heavy sphere
        const glowGeometry = new THREE.PlaneGeometry(3, 3);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.9,
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending
        });
        this.glow = new THREE.Mesh(glowGeometry, glowMaterial);
        this.glow.lookAt(0, 0, 1); // Face camera
        this.mesh.add(this.glow);
        
        // Small point light for ambience
        this.light = new THREE.PointLight(0xffffff, 1, 20);
        this.mesh.add(this.light);
        
        // Movement properties
        this.velocity = new THREE.Vector3();
        this.acceleration = new THREE.Vector3();
        this.isHovering = false;
        this.hoverOffset = Math.random() * Math.PI * 2;
        this.jitter = Math.random() * 0.5 + 0.5;
    }

    setPosition(x, y, z) {
        this.mesh.position.set(x, y, z);
    }

    setLightIntensity(intensity) {
        this.light.intensity = intensity * 0.5;
        this.glow.material.opacity = Math.min(intensity * 0.6, 1);
        
        // Scale based on intensity
        const scale = 0.5 + intensity * 0.5;
        this.glow.scale.setScalar(scale);
    }

    startHover() {
        this.isHovering = true;
    }

    stopHover() {
        this.isHovering = false;
    }

    update(time, camera) {
        // Make glow always face camera
        if (camera) {
            this.glow.lookAt(camera.position);
        }
        
        if (this.isHovering) {
            // Natural floating motion
            const hoverY = Math.sin(time * 0.003 * this.jitter + this.hoverOffset) * 1.5;
            const hoverX = Math.sin(time * 0.002 * this.jitter + this.hoverOffset * 1.5) * 0.3;
            const hoverZ = Math.cos(time * 0.0025 * this.jitter + this.hoverOffset * 0.7) * 0.3;
            
            this.velocity.y = hoverY * 0.02;
            this.velocity.x = hoverX * 0.01;
            this.velocity.z = hoverZ * 0.01;
            
            this.mesh.position.add(this.velocity);
        }
        
        // Subtle brightness flicker
        const flicker = 0.9 + Math.sin(time * 0.02 * this.jitter) * 0.1;
        this.glow.material.opacity = this.glow.material.opacity * flicker;
    }

    sparkle() {
        // Burst of color
        const hue = Math.random();
        this.glow.material.color.setHSL(hue, 1, 0.8);
        this.light.color.setHSL(hue, 0.8, 0.6);
        
        // Expansion effect
        this.glow.scale.setScalar(3);
    }

    dispose() {
        this.glow.geometry.dispose();
        this.glow.material.dispose();
    }
}