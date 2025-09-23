import * as THREE from 'three';
import gsap from 'gsap';
import { Drone } from './FastDrone.js';
import { SaudiFlag } from './SaudiFlag.js';

export class DroneShowManager {
    constructor(scene) {
        this.scene = scene;
        this.drones = [];
        this.masterTimeline = null;
        this.saudiFlag = new SaudiFlag();
        this.coolEffects = null; // Will be set from main
    }

    async createShow(formationData, textToFormation) {
        // Clear existing
        this.clearDrones();
        
        // Store reference
        this.textToFormation = textToFormation;
        
        // Create drones at random starting positions
        const droneCount = formationData.droneCount;
        console.log(`Creating ${droneCount} fast drones`);
        
        for (let i = 0; i < droneCount; i++) {
            const drone = new Drone();
            
            // Random start position in a sphere
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            const r = 100 + Math.random() * 50;
            
            drone.setPosition(
                r * Math.sin(phi) * Math.cos(theta),
                50 + Math.random() * 100,
                r * Math.sin(phi) * Math.sin(theta)
            );
            
            this.scene.add(drone.mesh);
            this.drones.push(drone);
        }
        
        // Create master timeline
        this.createMasterTimeline(formationData);
    }

    createMasterTimeline(formationData) {
        // Kill existing timeline
        if (this.masterTimeline) {
            this.masterTimeline.kill();
        }
        
        this.masterTimeline = gsap.timeline({
            onComplete: () => {
                console.log('Show complete');
            }
        });
        
        // Phase 1: Form text (0.8s total)
        this.drones.forEach((drone, i) => {
            if (i < formationData.positions.length) {
                drone.setTarget(formationData.positions[i].target);
                // Staggered start, but all complete within 0.8s
                const delay = i * 0.001; // Tiny stagger
                const duration = 0.6; // Fast movement
                drone.animateToTarget(duration, delay);
            }
        });
        
        // Phase 2: Hold formation
        this.masterTimeline.to({}, { duration: 2 }, "+=0.8");
        
        // Phase 3: Transition to flag
        this.masterTimeline.call(() => {
            this.transitionToFlag();
        }, null, "+=0");
        
        // Phase 4: Hold flag
        this.masterTimeline.to({}, { duration: 2.5 }, "+=1");
        
        // Phase 5: Fireworks
        this.masterTimeline.call(() => {
            this.startFireworks();
        }, null, "+=0");
        
        // Phase 6: Reset
        this.masterTimeline.to({}, { duration: 3 }, "+=0");
        this.masterTimeline.call(() => {
            this.resetShow();
        }, null, "+=0");
    }

    transitionToFlag() {
        console.log('Transitioning to flag');
        const flagData = this.saudiFlag.generateFlagFormation();
        
        // Quick assignment
        const currentPositions = this.drones.map(d => d.mesh.position);
        const assignments = this.textToFormation.assignDronesToTargets(
            currentPositions,
            flagData.positions
        );
        
        // Animate to flag positions
        assignments.forEach((assignment, idx) => {
            if (this.drones[assignment.droneIndex] && flagData.positions[assignment.targetIndex]) {
                const drone = this.drones[assignment.droneIndex];
                const target = flagData.positions[assignment.targetIndex];
                
                drone.setTarget(target.target);
                drone.animateToTarget(0.8, idx * 0.0005); // Even faster
                
                // Set color
                if (target.color) {
                    gsap.to(drone.core.material.color, {
                        r: target.color.r,
                        g: target.color.g,
                        b: target.color.b,
                        duration: 0.5,
                        delay: idx * 0.0005
                    });
                }
            }
        });
    }

    startFireworks() {
        console.log('Starting fireworks');
        this.drones.forEach((drone, i) => {
            // Saudi colors only - green and white
            const useSaudiGreen = Math.random() > 0.5;
            if (useSaudiGreen) {
                drone.core.material.color.setHex(0x00A550);
                drone.glow.material.color.setHex(0x00A550);
            } else {
                drone.core.material.color.setHex(0xFFFFFF);
                drone.glow.material.color.setHex(0xFFFFFF);
            }
            
            // Explode outward
            const angle = Math.random() * Math.PI * 2;
            const elevation = Math.random() * Math.PI * 0.5;
            const force = 100 + Math.random() * 100;
            
            gsap.to(drone.mesh.position, {
                x: drone.mesh.position.x + Math.cos(angle) * Math.sin(elevation) * force,
                y: drone.mesh.position.y + Math.cos(elevation) * force,
                z: drone.mesh.position.z + Math.sin(angle) * Math.sin(elevation) * force,
                duration: 2,
                delay: i * 0.005,
                ease: "power2.out"
            });
            
            // Fade out
            gsap.to(drone.core.material, {
                opacity: 0,
                duration: 1.5,
                delay: 0.5 + i * 0.005
            });
            
            gsap.to(drone.glow.material, {
                opacity: 0,
                duration: 1.5,
                delay: 0.5 + i * 0.005
            });
        });
    }

    resetShow() {
        console.log('Resetting show');
        // Start over
        if (this.masterTimeline) {
            this.masterTimeline.restart();
        }
    }

    clearDrones() {
        this.drones.forEach(drone => {
            gsap.killTweensOf(drone);
            gsap.killTweensOf(drone.mesh);
            gsap.killTweensOf(drone.mesh.position);
            gsap.killTweensOf(drone.mesh.scale);
            this.scene.remove(drone.mesh);
            drone.dispose();
        });
        this.drones = [];
        
        if (this.masterTimeline) {
            this.masterTimeline.kill();
            this.masterTimeline = null;
        }
    }

    update(time, camera) {
        // Simple update - no physics
        this.drones.forEach(drone => {
            drone.update(time, camera, 0.016);
        });
    }
}