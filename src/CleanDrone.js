import * as THREE from 'three';

export class Drone {
    constructor() {
        this.mesh = new THREE.Group();
        
        // Single clean LED light dot
        const dotGeometry = new THREE.CircleGeometry(0.5, 8);
        const dotMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            side: THREE.DoubleSide
        });
        this.dot = new THREE.Mesh(dotGeometry, dotMaterial);
        this.mesh.add(this.dot);
        
        // Minimal glow around the dot
        const glowGeometry = new THREE.CircleGeometry(1.5, 16);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.2,
            side: THREE.DoubleSide
        });
        this.glow = new THREE.Mesh(glowGeometry, glowMaterial);
        this.glow.position.z = -0.1; // Slightly behind
        this.mesh.add(this.glow);
        
        // No point light - just the visual
        
        // Movement properties
        this.isHovering = false;
        this.hoverOffset = Math.random() * Math.PI * 2;
        this.hoverSpeed = 0.002 + Math.random() * 0.001;
    }

    setPosition(x, y, z) {
        this.mesh.position.set(x, y, z);
    }

    setLightIntensity(intensity) {
        // Adjust visibility based on intensity
        this.dot.material.opacity = Math.min(intensity, 1);
        this.glow.material.opacity = Math.min(intensity * 0.1, 0.3);
        
        // Color change for intensity
        if (intensity > 1.5) {
            this.dot.material.color.setHex(0xffffaa); // Warm white when bright
        } else {
            this.dot.material.color.setHex(0xffffff); // Pure white
        }
    }

    startHover() {
        this.isHovering = true;
    }

    stopHover() {
        this.isHovering = false;
    }

    update(time, camera) {
        // Always face camera
        if (camera) {
            this.mesh.lookAt(camera.position);
        }
        
        if (this.isHovering) {
            // Gentle floating
            const hover = Math.sin(time * this.hoverSpeed + this.hoverOffset) * 0.5;
            this.mesh.position.y += hover * 0.02;
        }
    }

    sparkle() {
        // Simple color flash
        const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff];
        const color = colors[Math.floor(Math.random() * colors.length)];
        this.dot.material.color.setHex(color);
        this.glow.material.color.setHex(color);
        this.glow.material.opacity = 0.5;
    }

    dispose() {
        this.dot.geometry.dispose();
        this.dot.material.dispose();
        this.glow.geometry.dispose();
        this.glow.material.dispose();
    }
}