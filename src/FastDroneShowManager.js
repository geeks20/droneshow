import * as THREE from 'three';
import gsap from 'gsap';
import { Drone } from './FastDrone.js';
import { SaudiFlag } from './SaudiFlag.js';
import { SaudiConfetti } from './SaudiConfetti.js';

export class DroneShowManager {
    constructor(scene) {
        this.scene = scene;
        this.drones = [];
        this.masterTimeline = null;
        this.saudiFlag = new SaudiFlag();
        this.saudiConfetti = new SaudiConfetti(scene);
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
        
        // Phase 1: Hidden reveal - start with random formation
        this.createHiddenReveal(formationData);
        
        // Phase 2: Hold text (Arabic or English)
        this.masterTimeline.to({}, { duration: 3 }, "+=1");
        
        // Phase 3: Pop-out stars effect
        this.masterTimeline.call(() => {
            this.createPopOutStars();
        }, null, "+=0");
        
        // Phase 4: Transition to Saudi flag with confetti
        this.masterTimeline.call(() => {
            this.transitionToFlag();
            // Show National Day badge
            this.showNationalDayBadge();
            // Start confetti
            setTimeout(() => {
                this.saudiConfetti.start();
            }, 500);
        }, null, "+=2");
        
        // Phase 5: Hold flag
        this.masterTimeline.to({}, { duration: 3 }, "+=1");
        
        // Phase 6: Fireworks
        this.masterTimeline.call(() => {
            this.startFireworks();
        }, null, "+=0");
        
        // Phase 7: Reset
        this.masterTimeline.to({}, { duration: 3 }, "+=0");
        this.masterTimeline.call(() => {
            this.resetShow();
        }, null, "+=0");
    }

    createHiddenReveal(formationData) {
        console.log('Hidden reveal effect');
        console.log(`Drones: ${this.drones.length}, Positions: ${formationData.positions.length}`);
        
        // Make sure we have the right assignments
        const currentPositions = this.drones.map(d => d.mesh.position);
        const assignments = this.textToFormation.assignDronesToTargets(
            currentPositions,
            formationData.positions
        );
        
        // First, move all drones to random positions
        this.drones.forEach((drone, i) => {
            const randomPosition = {
                x: (Math.random() - 0.5) * 300,
                y: 50 + Math.random() * 100,
                z: (Math.random() - 0.5) * 200
            };
            
            drone.setTarget(randomPosition);
            drone.animateToTarget(0.8, i * 0.002);
        });
        
        // Then assign drones to actual targets
        setTimeout(() => {
            assignments.forEach((assignment, idx) => {
                if (this.drones[assignment.droneIndex] && formationData.positions[assignment.targetIndex]) {
                    const drone = this.drones[assignment.droneIndex];
                    const target = formationData.positions[assignment.targetIndex].target;
                    
                    drone.setTarget(target);
                    drone.animateToTarget(0.3, 0); // Very fast snap
                    
                    // Flash on reveal
                    setTimeout(() => drone.flash(), 50);
                }
            });
        }, 1000);
    }
    
    createPopOutStars() {
        console.log('Pop-out stars effect');
        
        // Select random 20% of drones for pop-out
        const popCount = Math.floor(this.drones.length * 0.2);
        const selectedIndices = [];
        
        while (selectedIndices.length < popCount) {
            const idx = Math.floor(Math.random() * this.drones.length);
            if (!selectedIndices.includes(idx)) {
                selectedIndices.push(idx);
            }
        }
        
        // Animate selected drones
        selectedIndices.forEach((idx, i) => {
            const drone = this.drones[idx];
            const originalPos = {
                x: drone.mesh.position.x,
                y: drone.mesh.position.y,
                z: drone.mesh.position.z
            };
            
            // Shoot upward
            gsap.to(drone.mesh.position, {
                y: originalPos.y + 50 + Math.random() * 30,
                duration: 0.5,
                delay: i * 0.05,
                ease: "power2.out",
                onStart: () => {
                    // Bright flash
                    drone.sparkle();
                    gsap.to(drone.glow.material, {
                        opacity: 1,
                        duration: 0.2
                    });
                },
                onComplete: () => {
                    // Fall back with gravity effect
                    gsap.to(drone.mesh.position, {
                        y: originalPos.y,
                        duration: 0.8,
                        ease: "bounce.out",
                        onComplete: () => {
                            gsap.to(drone.glow.material, {
                                opacity: 0.25,
                                duration: 0.3
                            });
                        }
                    });
                }
            });
        });
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

    showNationalDayBadge() {
        const badge = document.getElementById('national-day-badge');
        if (badge) {
            badge.classList.add('show');
            
            // Hide after 5 seconds
            setTimeout(() => {
                badge.classList.remove('show');
            }, 5000);
        }
    }
    
    resetShow() {
        console.log('Resetting show');
        // Hide badge
        const badge = document.getElementById('national-day-badge');
        if (badge) {
            badge.classList.remove('show');
        }
        
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