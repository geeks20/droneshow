import * as THREE from 'three';
import gsap from 'gsap';

export class CoolEffects {
    constructor(scene) {
        this.scene = scene;
        this.effects = [];
        
        // Add ground spotlight effect
        this.createGroundSpotlights();
        
        // Add laser beams
        this.laserBeams = [];
        
        // Add particle systems
        this.createAmbientParticles();
    }
    
    createGroundSpotlights() {
        // Create 4 rotating spotlights from ground
        const colors = [0x00ffff, 0xff00ff, 0xffff00, 0x00ff00];
        this.spotlights = [];
        
        for (let i = 0; i < 4; i++) {
            const spotlight = new THREE.SpotLight(colors[i], 2, 1000, Math.PI / 6, 0.5);
            const angle = (i / 4) * Math.PI * 2;
            spotlight.position.set(
                Math.cos(angle) * 200,
                -50,
                Math.sin(angle) * 200
            );
            spotlight.target.position.set(0, 200, 0);
            this.scene.add(spotlight);
            this.scene.add(spotlight.target);
            this.spotlights.push(spotlight);
            
            // Add volumetric cone
            const geometry = new THREE.ConeGeometry(50, 300, 32, 1, true);
            const material = new THREE.MeshBasicMaterial({
                color: colors[i],
                transparent: true,
                opacity: 0.1,
                side: THREE.DoubleSide,
                blending: THREE.AdditiveBlending
            });
            const cone = new THREE.Mesh(geometry, material);
            cone.position.copy(spotlight.position);
            cone.position.y += 150;
            cone.rotation.x = Math.PI;
            this.scene.add(cone);
            
            // Animate rotation
            gsap.to(spotlight.position, {
                x: Math.cos(angle + Math.PI) * 200,
                z: Math.sin(angle + Math.PI) * 200,
                duration: 20,
                repeat: -1,
                ease: "none",
                onUpdate: () => {
                    cone.position.x = spotlight.position.x;
                    cone.position.z = spotlight.position.z;
                }
            });
        }
    }
    
    createAmbientParticles() {
        // Floating dust particles
        const particleCount = 500;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const velocities = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount * 3; i += 3) {
            positions[i] = (Math.random() - 0.5) * 500;
            positions[i + 1] = Math.random() * 300;
            positions[i + 2] = (Math.random() - 0.5) * 500;
            
            velocities[i] = (Math.random() - 0.5) * 0.1;
            velocities[i + 1] = Math.random() * 0.1;
            velocities[i + 2] = (Math.random() - 0.5) * 0.1;
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
        
        const material = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 1,
            transparent: true,
            opacity: 0.3,
            blending: THREE.AdditiveBlending
        });
        
        this.particles = new THREE.Points(geometry, material);
        this.scene.add(this.particles);
    }
    
    createLaserBeam(from, to, color = 0x00ff00) {
        const direction = new THREE.Vector3().subVectors(to, from);
        const distance = direction.length();
        
        // Main beam
        const geometry = new THREE.CylinderGeometry(0.2, 0.2, distance, 8);
        const material = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });
        const beam = new THREE.Mesh(geometry, material);
        
        // Position and orient
        beam.position.copy(from).add(direction.multiplyScalar(0.5));
        beam.lookAt(to);
        beam.rotateX(Math.PI / 2);
        
        this.scene.add(beam);
        this.laserBeams.push(beam);
        
        // Fade in/out animation
        gsap.fromTo(beam.material, 
            { opacity: 0 },
            { 
                opacity: 0.8,
                duration: 0.2,
                ease: "power2.in",
                onComplete: () => {
                    gsap.to(beam.material, {
                        opacity: 0,
                        duration: 0.5,
                        delay: 0.3,
                        onComplete: () => {
                            this.scene.remove(beam);
                            beam.geometry.dispose();
                            beam.material.dispose();
                        }
                    });
                }
            }
        );
    }
    
    createRippleEffect(position, color = 0xffffff) {
        // Expanding ring effect
        const geometry = new THREE.RingGeometry(0.1, 2, 32);
        const material = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.8,
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending
        });
        const ring = new THREE.Mesh(geometry, material);
        ring.position.copy(position);
        ring.rotation.x = -Math.PI / 2;
        
        this.scene.add(ring);
        
        // Animate expansion
        gsap.to(ring.scale, {
            x: 20,
            y: 20,
            z: 20,
            duration: 1,
            ease: "power2.out"
        });
        
        gsap.to(ring.material, {
            opacity: 0,
            duration: 1,
            onComplete: () => {
                this.scene.remove(ring);
                ring.geometry.dispose();
                ring.material.dispose();
            }
        });
    }
    
    createTextGlow(positions, color = 0xffffff) {
        // Add glowing backdrop for text
        const geometry = new THREE.PlaneGeometry(400, 200);
        const material = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0,
            blending: THREE.AdditiveBlending
        });
        const glow = new THREE.Mesh(geometry, material);
        glow.position.set(0, 120, -50);
        
        this.scene.add(glow);
        
        // Pulse animation
        gsap.to(material, {
            opacity: 0.2,
            duration: 0.5,
            yoyo: true,
            repeat: 3,
            onComplete: () => {
                this.scene.remove(glow);
                glow.geometry.dispose();
                glow.material.dispose();
            }
        });
    }
    
    update(time) {
        // Update floating particles
        if (this.particles) {
            const positions = this.particles.geometry.attributes.position;
            const velocities = this.particles.geometry.attributes.velocity;
            
            for (let i = 0; i < positions.count * 3; i += 3) {
                positions.array[i] += velocities.array[i];
                positions.array[i + 1] += velocities.array[i + 1];
                positions.array[i + 2] += velocities.array[i + 2];
                
                // Wrap around
                if (positions.array[i + 1] > 300) {
                    positions.array[i + 1] = 0;
                }
            }
            positions.needsUpdate = true;
            
            // Rotate particle system slowly
            this.particles.rotation.y = time * 0.00005;
        }
    }
    
    dispose() {
        // Clean up all effects
        this.spotlights.forEach(light => {
            this.scene.remove(light);
            this.scene.remove(light.target);
        });
        
        if (this.particles) {
            this.scene.remove(this.particles);
            this.particles.geometry.dispose();
            this.particles.material.dispose();
        }
    }
}