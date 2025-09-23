import * as THREE from 'three';

export class Drone {
    constructor() {
        this.mesh = new THREE.Group();
        
        // Tiny drone body
        const geometry = new THREE.SphereGeometry(0.15, 6, 6);
        const material = new THREE.MeshBasicMaterial({
            color: 0x111111,
            transparent: true,
            opacity: 0.3
        });
        this.body = new THREE.Mesh(geometry, material);
        this.mesh.add(this.body);
        
        // Focused LED light
        this.light = new THREE.PointLight(0xffffff, 3, 25);
        this.light.position.set(0, 0, 0);
        this.mesh.add(this.light);
        
        // Small focused glow
        const glowGeometry = new THREE.SphereGeometry(0.8, 12, 12);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.9,
            blending: THREE.AdditiveBlending
        });
        this.glow = new THREE.Mesh(glowGeometry, glowMaterial);
        this.mesh.add(this.glow);
        
        // Outer soft glow
        const glowGeometry2 = new THREE.SphereGeometry(1.5, 12, 12);
        const glowMaterial2 = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.2,
            blending: THREE.AdditiveBlending
        });
        this.glow2 = new THREE.Mesh(glowGeometry2, glowMaterial2);
        this.mesh.add(this.glow2);
        
        // Trail effect (shorter, lighter)
        this.trailPoints = [];
        this.maxTrailLength = 5;
        this.createTrail();
        
        // Animation properties
        this.hoverOffset = Math.random() * Math.PI * 2;
        this.hoverSpeed = 0.001 + Math.random() * 0.001;
        this.hoverAmplitude = 0.5 + Math.random() * 0.5;
        this.isHovering = false;
        
        // Particle system for sparkle effect
        this.createParticleSystem();
    }

    createTrail() {
        const trailGeometry = new THREE.BufferGeometry();
        const trailMaterial = new THREE.LineBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.15,
            blending: THREE.AdditiveBlending,
            linewidth: 1
        });
        
        this.trail = new THREE.Line(trailGeometry, trailMaterial);
        this.mesh.add(this.trail);
    }

    createParticleSystem() {
        const particleCount = 20;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const velocities = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount * 3; i += 3) {
            positions[i] = 0;
            positions[i + 1] = 0;
            positions[i + 2] = 0;
            
            velocities[i] = (Math.random() - 0.5) * 0.1;
            velocities[i + 1] = Math.random() * 0.1;
            velocities[i + 2] = (Math.random() - 0.5) * 0.1;
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
        
        const material = new THREE.PointsMaterial({
            color: 0xffff00,
            size: 0.2,
            transparent: true,
            opacity: 0,
            blending: THREE.AdditiveBlending
        });
        
        this.particles = new THREE.Points(geometry, material);
        this.mesh.add(this.particles);
    }

    setPosition(x, y, z) {
        this.mesh.position.set(x, y, z);
    }

    setLightIntensity(intensity) {
        this.light.intensity = intensity;
        this.glow.material.opacity = Math.min(intensity * 0.4, 0.9);
        this.glow2.material.opacity = Math.min(intensity * 0.1, 0.3);
    }

    startHover() {
        this.isHovering = true;
    }

    stopHover() {
        this.isHovering = false;
    }

    updateTrail() {
        this.trailPoints.push(this.mesh.position.clone());
        
        if (this.trailPoints.length > this.maxTrailLength) {
            this.trailPoints.shift();
        }
        
        if (this.trailPoints.length > 1) {
            const positions = new Float32Array(this.trailPoints.length * 3);
            this.trailPoints.forEach((point, index) => {
                positions[index * 3] = point.x - this.mesh.position.x;
                positions[index * 3 + 1] = point.y - this.mesh.position.y;
                positions[index * 3 + 2] = point.z - this.mesh.position.z;
            });
            
            this.trail.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        }
    }

    update(time, camera) {
        // Hover animation
        if (this.isHovering) {
            const hoverY = Math.sin(time * this.hoverSpeed + this.hoverOffset) * this.hoverAmplitude;
            this.mesh.position.y += hoverY * 0.01;
        }
        
        // Rotate drone body
        this.body.rotation.y += 0.01;
        
        // Update glow pulse
        const pulse = 0.8 + Math.sin(time * 0.003) * 0.2;
        this.glow.scale.setScalar(pulse);
        this.glow2.scale.setScalar(pulse * 1.2);
        
        // Update trail
        this.updateTrail();
        
        // Update particles (if active)
        if (this.particles.material.opacity > 0) {
            const positions = this.particles.geometry.attributes.position;
            const velocities = this.particles.geometry.attributes.velocity;
            
            for (let i = 0; i < positions.count * 3; i += 3) {
                positions.array[i] += velocities.array[i];
                positions.array[i + 1] += velocities.array[i + 1];
                positions.array[i + 2] += velocities.array[i + 2];
                
                // Reset particles that drift too far
                const distance = Math.sqrt(
                    positions.array[i] ** 2 +
                    positions.array[i + 1] ** 2 +
                    positions.array[i + 2] ** 2
                );
                
                if (distance > 5) {
                    positions.array[i] = 0;
                    positions.array[i + 1] = 0;
                    positions.array[i + 2] = 0;
                }
            }
            
            positions.needsUpdate = true;
            this.particles.material.opacity *= 0.98;
        }
    }

    sparkle() {
        this.particles.material.opacity = 1;
        
        // Reset particle positions
        const positions = this.particles.geometry.attributes.position;
        for (let i = 0; i < positions.count * 3; i++) {
            positions.array[i] = 0;
        }
        positions.needsUpdate = true;
    }

    dispose() {
        this.body.geometry.dispose();
        this.body.material.dispose();
        this.glow.geometry.dispose();
        this.glow.material.dispose();
        this.glow2.geometry.dispose();
        this.glow2.material.dispose();
        this.trail.geometry.dispose();
        this.trail.material.dispose();
        this.particles.geometry.dispose();
        this.particles.material.dispose();
    }
}