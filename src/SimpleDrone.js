import * as THREE from 'three';

export class Drone {
    constructor() {
        this.mesh = new THREE.Group();
        
        // Tiny light core - just a point of light
        const geometry = new THREE.SphereGeometry(0.3, 6, 6);
        const material = new THREE.MeshBasicMaterial({
            color: 0xffffff
        });
        this.sphere = new THREE.Mesh(geometry, material);
        this.mesh.add(this.sphere);
        
        // Bright point light
        this.light = new THREE.PointLight(0xffffff, 3, 30);
        this.mesh.add(this.light);
        
        // Soft glow
        const glowGeometry = new THREE.SphereGeometry(1, 8, 8);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.4,
            blending: THREE.AdditiveBlending
        });
        this.glow = new THREE.Mesh(glowGeometry, glowMaterial);
        this.mesh.add(this.glow);
        
        this.isHovering = false;
        this.hoverOffset = Math.random() * Math.PI * 2;
    }

    setPosition(x, y, z) {
        this.mesh.position.set(x, y, z);
    }

    setLightIntensity(intensity) {
        this.light.intensity = intensity * 10;
        this.sphere.material.emissiveIntensity = intensity;
        this.glow.material.opacity = Math.min(intensity * 0.5, 1);
    }

    startHover() {
        this.isHovering = true;
    }

    stopHover() {
        this.isHovering = false;
    }

    update(time) {
        if (this.isHovering) {
            // Quick, light hovering motion
            const hoverY = Math.sin(time * 0.005 + this.hoverOffset) * 2;
            const hoverX = Math.sin(time * 0.003 + this.hoverOffset * 0.5) * 0.5;
            this.mesh.position.y += hoverY * 0.05;
            this.mesh.position.x += hoverX * 0.02;
        }
        
        // Fast spinning
        this.sphere.rotation.y += 0.1;
        this.sphere.rotation.x += 0.05;
        
        // Quick pulsing effect
        const scale = 1 + Math.sin(time * 0.01) * 0.2;
        this.glow.scale.setScalar(scale);
        
        // Flickering light effect
        this.light.intensity = 5 + Math.random() * 2;
    }

    sparkle() {
        // Simple sparkle effect
        this.glow.material.color.setHSL(Math.random(), 1, 0.5);
    }

    dispose() {
        this.sphere.geometry.dispose();
        this.sphere.material.dispose();
        this.glow.geometry.dispose();
        this.glow.material.dispose();
    }
}