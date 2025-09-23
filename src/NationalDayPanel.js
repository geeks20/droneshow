import * as THREE from 'three';
import gsap from 'gsap';

export class NationalDayPanel {
    constructor(scene) {
        this.scene = scene;
        this.panel = null;
        this.createPanel();
    }
    
    createPanel() {
        // Create a plane for the logo
        const geometry = new THREE.PlaneGeometry(200, 100);
        
        // Load the National Day logo texture
        const textureLoader = new THREE.TextureLoader();
        
        // Create material with the logo
        const material = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0,
            side: THREE.DoubleSide,
            map: null // Will be set when texture loads
        });
        
        this.panel = new THREE.Mesh(geometry, material);
        this.panel.position.set(0, 250, -200);
        this.scene.add(this.panel);
        
        // Add green glow backdrop
        const glowGeometry = new THREE.PlaneGeometry(220, 120);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0x00A550,
            transparent: true,
            opacity: 0,
            blending: THREE.AdditiveBlending
        });
        this.glow = new THREE.Mesh(glowGeometry, glowMaterial);
        this.glow.position.z = -10;
        this.panel.add(this.glow);
    }
    
    show(duration = 3) {
        // Fade in animation
        gsap.to(this.panel.material, {
            opacity: 0.9,
            duration: 1,
            ease: "power2.inOut"
        });
        
        gsap.to(this.glow.material, {
            opacity: 0.3,
            duration: 1,
            ease: "power2.inOut"
        });
        
        // Gentle floating animation
        gsap.to(this.panel.position, {
            y: 260,
            duration: 2,
            yoyo: true,
            repeat: -1,
            ease: "sine.inOut"
        });
        
        // Scale entrance
        gsap.fromTo(this.panel.scale, 
            { x: 0.5, y: 0.5, z: 0.5 },
            { 
                x: 1, 
                y: 1, 
                z: 1, 
                duration: 0.8,
                ease: "back.out(1.5)"
            }
        );
        
        // Auto hide after duration
        if (duration > 0) {
            setTimeout(() => this.hide(), duration * 1000);
        }
    }
    
    hide() {
        gsap.to(this.panel.material, {
            opacity: 0,
            duration: 0.8,
            ease: "power2.inOut"
        });
        
        gsap.to(this.glow.material, {
            opacity: 0,
            duration: 0.8,
            ease: "power2.inOut"
        });
        
        gsap.to(this.panel.scale, {
            x: 0.5,
            y: 0.5,
            z: 0.5,
            duration: 0.8,
            ease: "power2.in"
        });
    }
    
    // Alternative: Show as ground projection
    showAsGroundProjection() {
        this.panel.rotation.x = -Math.PI / 2;
        this.panel.position.set(0, 0.1, 0);
        this.panel.scale.set(2, 2, 2);
        
        gsap.to(this.panel.material, {
            opacity: 0.5,
            duration: 1
        });
        
        // Rotating effect
        gsap.to(this.panel.rotation, {
            z: Math.PI * 2,
            duration: 20,
            repeat: -1,
            ease: "none"
        });
    }
}