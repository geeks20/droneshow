import * as THREE from 'three';

export class Drone {
    constructor() {
        this.mesh = new THREE.Group();
        
        // Tiny core - just a dot
        const geometry = new THREE.SphereGeometry(0.3, 8, 8);
        const material = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.9
        });
        this.core = new THREE.Mesh(geometry, material);
        this.mesh.add(this.core);
        
        // Small glow - tamed down
        const glowGeometry = new THREE.SphereGeometry(1, 12, 12);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.35, // Lower base opacity
            blending: THREE.AdditiveBlending
        });
        this.glow = new THREE.Mesh(glowGeometry, glowMaterial);
        this.mesh.add(this.glow);
        
        // Minimal point light
        this.light = new THREE.PointLight(0xffffff, 0.5, 15);
        this.mesh.add(this.light);
        
        // Physics properties for smooth motion
        this.velocity = new THREE.Vector3(0, 0, 0);
        this.targetPosition = null;
        this.settled = false;
        this.speed = 0;
        
        // Animation properties
        this.hoverOffset = Math.random() * Math.PI * 2;
    }

    setPosition(x, y, z) {
        this.mesh.position.set(x, y, z);
    }

    setTarget(target) {
        this.targetPosition = target;
        this.settled = false;
    }

    updatePhysics(deltaTime) {
        if (!this.targetPosition) return;
        
        const k = 35;           // VERY strong pull
        const damp = 0.65;      // Much less friction
        
        // Calculate distance
        const dx = this.targetPosition.x - this.mesh.position.x;
        const dy = this.targetPosition.y - this.mesh.position.y;
        const dz = this.targetPosition.z - this.mesh.position.z;
        const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
        
        // Aggressive distance-based boost
        const boost = Math.min(1 + dist * 0.03, 5.0);
        
        // Strong forces with boost
        this.velocity.x += (dx * k * deltaTime) * boost;
        this.velocity.y += (dy * k * deltaTime) * boost;
        this.velocity.z += (dz * k * deltaTime) * boost;
        
        // Higher speed cap
        const maxV = 300; // px/sec - much faster
        const vm = Math.sqrt(this.velocity.x*this.velocity.x + 
                           this.velocity.y*this.velocity.y + 
                           this.velocity.z*this.velocity.z);
        if (vm > maxV) {
            const s = maxV / vm;
            this.velocity.x *= s;
            this.velocity.y *= s;
            this.velocity.z *= s;
        }
        
        // Apply damping
        this.velocity.x *= damp;
        this.velocity.y *= damp;
        this.velocity.z *= damp;
        
        // Update position
        this.mesh.position.x += this.velocity.x * deltaTime;
        this.mesh.position.y += this.velocity.y * deltaTime;
        this.mesh.position.z += this.velocity.z * deltaTime;
        
        // Calculate speed for opacity
        this.speed = vm;
        
        // Snap when close (epsilon = 1.5) - bigger snap radius
        if (dist < 1.5) {
            this.mesh.position.copy(this.targetPosition);
            this.velocity.set(0, 0, 0);
            this.settled = true;
            this.speed = 0;
        }
    }

    setLightIntensity(intensity) {
        this.light.intensity = intensity * 0.3;
        
        // Dynamic size and opacity based on speed and settled state
        const scale = this.settled ? 1.0 : 0.6;
        this.core.scale.setScalar(scale);
        
        // Bright while moving, crisp when settled
        if (!this.settled && this.speed > 0) {
            const speedAlpha = Math.min(0.55 + this.speed / 200, 0.85);
            this.glow.material.opacity = speedAlpha;
            this.core.material.opacity = 1.0;
            this.glow.scale.setScalar(1.2); // Bigger glow when moving
        } else {
            // Crisp and dim when settled
            this.glow.material.opacity = 0.2;
            this.core.material.opacity = 0.8;
            this.glow.scale.setScalar(0.8); // Smaller glow when settled
        }
    }

    startHover() {
        // Minimal hover when settled
    }

    update(time, camera, deltaTime = 0.016) {
        // Physics update
        this.updatePhysics(deltaTime);
        
        // Update visual based on state
        this.setLightIntensity(1);
        
        // Very subtle pulse when settled
        if (this.settled) {
            const pulse = 0.9 + Math.sin(time * 0.002 + this.hoverOffset) * 0.1;
            this.glow.scale.setScalar(pulse);
        }
    }

    sparkle() {
        // Quick color flash
        const hue = Math.random();
        this.core.material.color.setHSL(hue, 1, 0.8);
        this.glow.material.color.setHSL(hue, 0.8, 0.7);
        this.glow.material.opacity = 0.6;
    }

    dispose() {
        this.core.geometry.dispose();
        this.core.material.dispose();
        this.glow.geometry.dispose();
        this.glow.material.dispose();
    }
}