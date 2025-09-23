import * as THREE from 'three';
import gsap from 'gsap';

export class Drone {
    constructor() {
        this.mesh = new THREE.Group();
        
        // Glowing core with emission
        const geometry = new THREE.SphereGeometry(0.4, 16, 16);
        const material = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            emissive: 0xffffff
        });
        this.core = new THREE.Mesh(geometry, material);
        this.mesh.add(this.core);
        
        // Inner glow
        const glowGeometry = new THREE.SphereGeometry(1.2, 16, 16);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.4,
            blending: THREE.AdditiveBlending
        });
        this.glow = new THREE.Mesh(glowGeometry, glowMaterial);
        this.mesh.add(this.glow);
        
        // Outer glow with Saudi green tint
        const outerGlowGeometry = new THREE.SphereGeometry(2, 12, 12);
        const outerGlowMaterial = new THREE.MeshBasicMaterial({
            color: 0x00A550, // Saudi green
            transparent: true,
            opacity: 0.1,
            blending: THREE.AdditiveBlending
        });
        this.outerGlow = new THREE.Mesh(outerGlowGeometry, outerGlowMaterial);
        this.mesh.add(this.outerGlow);
        
        // Trail effect
        this.createTrail();
        
        this.settled = false;
        this.targetPosition = null;
        this.trailPositions = [];
    }
    
    createTrail() {
        // Motion trail (will be added to scene later)
        const trailGeometry = new THREE.BufferGeometry();
        const trailMaterial = new THREE.LineBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.3,
            blending: THREE.AdditiveBlending
        });
        this.trail = new THREE.Line(trailGeometry, trailMaterial);
        // Trail will be added to mesh parent, not scene
    }

    setPosition(x, y, z) {
        this.mesh.position.set(x, y, z);
    }

    setTarget(target) {
        this.targetPosition = target;
        this.settled = false;
    }

    // Instant animation to target
    animateToTarget(duration = 0.8, delay = 0) {
        if (!this.targetPosition) return;
        
        // Kill any existing animations
        gsap.killTweensOf(this.mesh.position);
        gsap.killTweensOf(this.mesh.scale);
        gsap.killTweensOf(this.glow.material);
        
        // Scale down while moving
        gsap.to(this.mesh.scale, {
            x: 0.6,
            y: 0.6,
            z: 0.6,
            duration: 0.1,
            delay: delay
        });
        
        // Animate position with aggressive easing
        gsap.to(this.mesh.position, {
            x: this.targetPosition.x,
            y: this.targetPosition.y,
            z: this.targetPosition.z,
            duration: duration,
            delay: delay,
            ease: "power3.inOut",
            onUpdate: () => {
                // Add to trail
                this.updateTrail();
            },
            onComplete: () => {
                this.settled = true;
                // Scale back up when settled with bounce
                gsap.to(this.mesh.scale, {
                    x: 1.2,
                    y: 1.2,
                    z: 1.2,
                    duration: 0.2,
                    ease: "back.out(2)",
                    onComplete: () => {
                        gsap.to(this.mesh.scale, {
                            x: 1,
                            y: 1,
                            z: 1,
                            duration: 0.3
                        });
                    }
                });
                // Reduce glow
                gsap.to(this.glow.material, {
                    opacity: 0.25,
                    duration: 0.3
                });
                gsap.to(this.outerGlow.material, {
                    opacity: 0.1,
                    duration: 0.3
                });
                
                // Flash effect on arrival
                this.flash();
            }
        });
        
        // Brighten during movement
        gsap.to(this.glow.material, {
            opacity: 0.6,
            duration: 0.1,
            delay: delay
        });
        
        // Green glow during movement
        gsap.to(this.outerGlow.material, {
            opacity: 0.3,
            duration: 0.1,
            delay: delay
        });
    }

    setLightIntensity(intensity) {
        // Simple intensity control
    }

    updateTrail() {
        // Trail effect during movement
        if (this.trailPositions.length > 8) {
            this.trailPositions.shift();
        }
        this.trailPositions.push(this.mesh.position.clone());
    }
    
    flash() {
        // Saudi green flash on arrival
        const flashGeometry = new THREE.SphereGeometry(3, 16, 16);
        const flashMaterial = new THREE.MeshBasicMaterial({
            color: 0x00A550, // Saudi green
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending
        });
        const flash = new THREE.Mesh(flashGeometry, flashMaterial);
        flash.position.copy(this.mesh.position);
        
        if (this.mesh.parent) {
            this.mesh.parent.add(flash);
            
            gsap.to(flash.scale, {
                x: 5,
                y: 5,
                z: 5,
                duration: 0.3,
                ease: "power2.out"
            });
            
            gsap.to(flash.material, {
                opacity: 0,
                duration: 0.3,
                onComplete: () => {
                    if (flash.parent) flash.parent.remove(flash);
                    flash.geometry.dispose();
                    flash.material.dispose();
                }
            });
        }
    }
    
    update(time, camera, deltaTime) {
        // No physics - all handled by GSAP
        if (this.settled) {
            // Subtle idle animation
            const pulse = 0.95 + Math.sin(time * 0.003) * 0.05;
            this.glow.scale.setScalar(pulse * 1.2);
            this.outerGlow.scale.setScalar(pulse * 2);
            
            // Gentle rotation
            this.core.rotation.y += 0.02;
        } else {
            // Spinning during movement
            this.core.rotation.y += 0.1;
            this.core.rotation.x += 0.05;
        }
    }

    sparkle() {
        const hue = Math.random();
        this.core.material.color.setHSL(hue, 1, 0.8);
        this.glow.material.color.setHSL(hue, 0.8, 0.7);
    }

    dispose() {
        this.core.geometry.dispose();
        this.core.material.dispose();
        this.glow.geometry.dispose();
        this.glow.material.dispose();
        this.outerGlow.geometry.dispose();
        this.outerGlow.material.dispose();
        if (this.trail) {
            this.trail.geometry.dispose();
            this.trail.material.dispose();
        }
    }
}