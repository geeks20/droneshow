import * as THREE from 'three';
import gsap from 'gsap';

export class WaveEffect {
    constructor() {
        this.time = 0;
    }
    
    // Ripple through formation
    applyWave(drones, options = {}) {
        const {
            amplitude = 20,
            frequency = 0.5,
            duration = 2,
            direction = 'horizontal' // 'horizontal', 'vertical', 'radial'
        } = options;
        
        drones.forEach((drone, i) => {
            if (!drone.targetPosition) return;
            
            const originalY = drone.targetPosition.y;
            let delay = 0;
            
            if (direction === 'horizontal') {
                delay = (drone.mesh.position.x + 200) / 400 * duration;
            } else if (direction === 'vertical') {
                delay = (drone.mesh.position.y + 100) / 200 * duration;
            } else if (direction === 'radial') {
                const dist = Math.sqrt(
                    drone.mesh.position.x ** 2 + 
                    drone.mesh.position.z ** 2
                );
                delay = dist / 200 * duration;
            }
            
            // Create wave motion
            gsap.timeline({ delay })
                .to(drone.mesh.position, {
                    y: originalY + amplitude,
                    duration: 0.5,
                    ease: "sine.inOut"
                })
                .to(drone.mesh.position, {
                    y: originalY,
                    duration: 0.5,
                    ease: "sine.inOut"
                });
                
            // Add a little rotation for effect
            gsap.to(drone.mesh.rotation, {
                z: Math.PI * 0.1,
                duration: 0.5,
                delay,
                yoyo: true,
                repeat: 1,
                ease: "sine.inOut"
            });
        });
    }
    
    // Continuous wave animation
    startContinuousWave(drones, options = {}) {
        const {
            amplitude = 10,
            speed = 1,
            wavelength = 100
        } = options;
        
        this.waveAnimation = gsap.ticker.add(() => {
            this.time += 0.016 * speed;
            
            drones.forEach(drone => {
                if (!drone.targetPosition || !drone.settled) return;
                
                const offset = drone.mesh.position.x / wavelength;
                const wave = Math.sin(this.time + offset) * amplitude;
                
                drone.mesh.position.y = drone.targetPosition.y + wave;
            });
        });
    }
    
    stopContinuousWave(drones) {
        if (this.waveAnimation) {
            gsap.ticker.remove(this.waveAnimation);
            
            // Return drones to original positions
            drones.forEach(drone => {
                if (drone.targetPosition) {
                    gsap.to(drone.mesh.position, {
                        y: drone.targetPosition.y,
                        duration: 0.5,
                        ease: "power2.out"
                    });
                }
            });
        }
    }
    
    // 3D rotation of entire formation
    rotate3D(drones, options = {}) {
        const {
            axis = 'y',
            angle = Math.PI * 2,
            duration = 3,
            ease = "power2.inOut"
        } = options;
        
        // Calculate center of formation
        let centerX = 0, centerY = 0, centerZ = 0;
        let count = 0;
        
        drones.forEach(drone => {
            if (drone.settled) {
                centerX += drone.mesh.position.x;
                centerY += drone.mesh.position.y;
                centerZ += drone.mesh.position.z;
                count++;
            }
        });
        
        if (count === 0) return;
        
        centerX /= count;
        centerY /= count;
        centerZ /= count;
        
        const center = new THREE.Vector3(centerX, centerY, centerZ);
        
        // Rotate each drone around center
        drones.forEach(drone => {
            if (!drone.settled) return;
            
            const relativePos = drone.mesh.position.clone().sub(center);
            const startAngle = 0;
            
            gsap.to({ angle: startAngle }, {
                angle: angle,
                duration: duration,
                ease: ease,
                onUpdate: function() {
                    const currentAngle = this.targets()[0].angle;
                    const rotatedPos = relativePos.clone();
                    
                    if (axis === 'y') {
                        rotatedPos.applyAxisAngle(new THREE.Vector3(0, 1, 0), currentAngle);
                    } else if (axis === 'x') {
                        rotatedPos.applyAxisAngle(new THREE.Vector3(1, 0, 0), currentAngle);
                    } else if (axis === 'z') {
                        rotatedPos.applyAxisAngle(new THREE.Vector3(0, 0, 1), currentAngle);
                    }
                    
                    drone.mesh.position.copy(rotatedPos.add(center));
                }
            });
        });
    }
    
    // Morph between formations
    morphToShape(drones, targetShape, duration = 2) {
        // This would work with predefined shape data
        // For now, let's create a simple heart shape as example
        if (targetShape === 'heart') {
            const heartPositions = this.generateHeartPositions(drones.length);
            
            drones.forEach((drone, i) => {
                if (i < heartPositions.length) {
                    drone.setTarget(heartPositions[i]);
                    drone.animateToTarget(duration, i * 0.01);
                }
            });
        } else if (targetShape === 'star') {
            const starPositions = this.generateStarPositions(drones.length);
            
            drones.forEach((drone, i) => {
                if (i < starPositions.length) {
                    drone.setTarget(starPositions[i]);
                    drone.animateToTarget(duration, i * 0.01);
                }
            });
        }
    }
    
    generateHeartPositions(count) {
        const positions = [];
        const scale = 5;
        
        for (let i = 0; i < count; i++) {
            const t = (i / count) * Math.PI * 2;
            const x = 16 * Math.pow(Math.sin(t), 3) * scale;
            const y = (13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t)) * scale;
            
            positions.push({
                x: x,
                y: y + 50,
                z: 0
            });
        }
        
        return positions;
    }
    
    generateStarPositions(count) {
        const positions = [];
        const points = 5;
        const outerRadius = 100;
        const innerRadius = 40;
        
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const radiusIndex = i % 2;
            const radius = radiusIndex === 0 ? outerRadius : innerRadius;
            
            positions.push({
                x: Math.cos(angle) * radius,
                y: Math.sin(angle) * radius + 50,
                z: 0
            });
        }
        
        return positions;
    }
}