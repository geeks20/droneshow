import * as THREE from 'three';
import gsap from 'gsap';
import { Drone } from './CleanLightDrone.js';
import { SaudiFlag } from './SaudiFlag.js';

export class DroneShowManager {
    constructor(scene) {
        this.scene = scene;
        this.drones = [];
        this.timeline = null;
        this.showPhase = 'idle'; // idle, scatter, travel, hold, flag, sparkle
        this.saudiFlag = new SaudiFlag();
        this.originalFormationData = null;
        this.textToFormation = null; // Will be set from main
        this.phaseTimer = 0;
        this.settledCount = 0;
    }

    async createShow(formationData, textToFormation) {
        // Clear existing drones
        this.clearDrones();
        
        // Store references
        this.originalFormationData = formationData;
        this.textToFormation = textToFormation;
        
        // Get flag formation data
        const flagData = this.saudiFlag.generateFlagFormation();
        
        // Create exact number of drones needed
        const droneCount = formationData.droneCount;
        
        console.log(`Creating ${droneCount} drones for text formation`);
        
        // Create drones near their eventual targets for faster formation
        const scatterPositions = [];
        for (let i = 0; i < droneCount; i++) {
            const drone = new Drone();
            
            // Get the target position for this drone
            const targetPos = i < formationData.positions.length ? 
                formationData.positions[i].target : null;
            
            // Start near target
            const startPos = this.generateScatterPosition(targetPos);
            drone.setPosition(startPos.x, startPos.y, startPos.z);
            drone.setLightIntensity(1);
            this.scene.add(drone.mesh);
            this.drones.push(drone);
            
            scatterPositions.push({
                x: startPos.x,
                y: startPos.y,
                z: startPos.z
            });
        }
        
        // Assign drones to targets using greedy algorithm
        this.assignments = this.textToFormation.assignDronesToTargets(
            scatterPositions,
            formationData.positions
        );
        
        // Set initial targets and give initial velocity boost
        this.assignments.forEach(assignment => {
            if (this.drones[assignment.droneIndex]) {
                const drone = this.drones[assignment.droneIndex];
                drone.setTarget(assignment.target);
                
                // Calculate direction to target
                const dx = assignment.target.x - drone.mesh.position.x;
                const dy = assignment.target.y - drone.mesh.position.y;
                const dz = assignment.target.z - drone.mesh.position.z;
                const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
                
                // Give initial velocity push toward target
                if (dist > 0) {
                    drone.velocity.x = (dx / dist) * 50;
                    drone.velocity.y = (dy / dist) * 50;
                    drone.velocity.z = (dz / dist) * 50;
                }
            }
        });
        
        // Start the show sequence
        this.showPhase = 'scatter';
        this.phaseTimer = 0;
        this.settledCount = 0;
    }

    generateScatterPosition(targetPos = null) {
        if (targetPos) {
            // Start VERY close to target
            return {
                x: targetPos.x + (Math.random() - 0.5) * 15,
                y: targetPos.y + (Math.random() - 0.5) * 15 + 20, // Just slightly above
                z: targetPos.z + (Math.random() - 0.5) * 10
            };
        }
        
        // Default scatter - also closer
        const radius = 50;
        const theta = Math.random() * Math.PI * 2;
        
        return {
            x: radius * Math.cos(theta),
            y: 120 + Math.random() * 20,
            z: radius * Math.sin(theta)
        };
    }

    updatePhaseTransitions(deltaTime) {
        this.phaseTimer += deltaTime;
        
        switch(this.showPhase) {
            case 'scatter':
                if (this.phaseTimer > 0.1) { // Nearly instant
                    this.showPhase = 'travel';
                    this.phaseTimer = 0;
                    console.log('Phase: TRAVEL');
                }
                break;
                
            case 'travel':
                // Count settled drones
                this.settledCount = this.drones.filter(d => d.settled).length;
                
                // Transition when 95% settled or timeout
                if (this.settledCount > this.drones.length * 0.95 || this.phaseTimer > 2.0) {
                    this.showPhase = 'hold';
                    this.phaseTimer = 0;
                    console.log('Phase: HOLD - Settled:', this.settledCount);
                }
                break;
                
            case 'hold':
                if (this.phaseTimer > 1.5) { // Shorter hold
                    this.transitionToFlag();
                }
                break;
                
            case 'flag':
                if (this.phaseTimer > 3.0) {
                    this.showPhase = 'sparkle';
                    this.phaseTimer = 0;
                    this.startSparklePhase();
                }
                break;
                
            case 'sparkle':
                if (this.phaseTimer > 3.0) {
                    this.resetShow();
                }
                break;
        }
    }

    transitionToFlag() {
        this.showPhase = 'flag';
        this.phaseTimer = 0;
        console.log('Phase: FLAG');
        
        const flagData = this.saudiFlag.generateFlagFormation();
        
        // Create new assignments for flag
        const currentPositions = this.drones.map(d => ({
            x: d.mesh.position.x,
            y: d.mesh.position.y,
            z: d.mesh.position.z
        }));
        
        const flagAssignments = this.textToFormation.assignDronesToTargets(
            currentPositions,
            flagData.positions
        );
        
        // Update targets with flag colors
        flagAssignments.forEach((assignment, idx) => {
            if (this.drones[assignment.droneIndex] && flagData.positions[assignment.targetIndex]) {
                const target = flagData.positions[assignment.targetIndex];
                this.drones[assignment.droneIndex].setTarget(target.target);
                
                // Set flag colors
                if (target.color) {
                    gsap.to(this.drones[assignment.droneIndex].core.material.color, {
                        r: target.color.r,
                        g: target.color.g,
                        b: target.color.b,
                        duration: 1
                    });
                }
            }
        });
        
        // Reset settled state
        this.drones.forEach(d => d.settled = false);
    }

    startSparklePhase() {
        console.log('Phase: SPARKLE');
        
        this.drones.forEach((drone, index) => {
            const delay = index * 0.01;
            
            setTimeout(() => {
                drone.sparkle();
                
                // Explosive movement
                const angle = Math.random() * Math.PI * 2;
                const force = 50 + Math.random() * 50;
                
                drone.velocity.x = Math.cos(angle) * force;
                drone.velocity.y = Math.random() * force + 20;
                drone.velocity.z = Math.sin(angle) * force;
                
                // Fade out
                gsap.to(drone.glow.material, {
                    opacity: 0,
                    duration: 2,
                    delay: 0.5
                });
                
                gsap.to(drone.core.material, {
                    opacity: 0,
                    duration: 2,
                    delay: 0.5
                });
            }, delay * 1000);
        });
    }

    resetShow() {
        this.showPhase = 'idle';
        this.phaseTimer = 0;
        
        // Reset drones
        this.drones.forEach(drone => {
            const startPos = this.generateScatterPosition();
            drone.setPosition(startPos.x, startPos.y, startPos.z);
            drone.velocity.set(0, 0, 0);
            drone.settled = false;
            drone.core.material.color.setHex(0xffffff);
            drone.glow.material.color.setHex(0xffffff);
            drone.core.material.opacity = 0.9;
            drone.glow.material.opacity = 0.35;
        });
    }

    clearDrones() {
        this.drones.forEach(drone => {
            this.scene.remove(drone.mesh);
            drone.dispose();
        });
        this.drones = [];
    }

    update(time, camera) {
        const deltaTime = 0.016; // 60fps
        
        // Update phase transitions
        if (this.showPhase !== 'idle') {
            this.updatePhaseTransitions(deltaTime);
        }
        
        // Update all drones
        this.drones.forEach(drone => {
            drone.update(time, camera, deltaTime);
        });
    }
}