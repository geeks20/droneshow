import * as THREE from 'three';
import gsap from 'gsap';

export class SaudiConfetti {
    constructor(scene) {
        this.scene = scene;
        this.confettiPieces = [];
        this.flagTexture = this.createFlagTexture();
    }
    
    createFlagTexture() {
        // Create Saudi flag texture using canvas
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        
        // Green background
        ctx.fillStyle = '#00A550';
        ctx.fillRect(0, 0, 128, 64);
        
        // White sword (simplified)
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(10, 32);
        ctx.lineTo(80, 32);
        ctx.stroke();
        
        // Shahada text (simplified as white rectangle)
        ctx.fillStyle = 'white';
        ctx.font = 'bold 12px Arial';
        ctx.fillText('لا إله إلا الله', 85, 25);
        ctx.fillText('محمد رسول الله', 85, 40);
        
        return new THREE.CanvasTexture(canvas);
    }
    
    start() {
        // Create confetti pieces
        const count = 150;
        
        for (let i = 0; i < count; i++) {
            const geometry = new THREE.PlaneGeometry(8, 4);
            const material = new THREE.MeshBasicMaterial({
                map: this.flagTexture,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0
            });
            
            const confetti = new THREE.Mesh(geometry, material);
            
            // Random starting position above the scene
            confetti.position.set(
                (Math.random() - 0.5) * 600,
                300 + Math.random() * 200,
                (Math.random() - 0.5) * 400
            );
            
            // Random rotation
            confetti.rotation.x = Math.random() * Math.PI;
            confetti.rotation.y = Math.random() * Math.PI;
            confetti.rotation.z = Math.random() * Math.PI;
            
            // Store physics properties
            confetti.userData = {
                velocity: {
                    x: (Math.random() - 0.5) * 2,
                    y: -Math.random() * 2 - 3,
                    z: (Math.random() - 0.5) * 2
                },
                rotationSpeed: {
                    x: (Math.random() - 0.5) * 0.1,
                    y: (Math.random() - 0.5) * 0.1,
                    z: (Math.random() - 0.5) * 0.1
                }
            };
            
            this.scene.add(confetti);
            this.confettiPieces.push(confetti);
            
            // Fade in
            gsap.to(material, {
                opacity: 0.8,
                duration: 0.5,
                delay: i * 0.01
            });
        }
        
        // Animate confetti falling
        this.animateConfetti();
        
        // Remove after 8 seconds
        setTimeout(() => this.cleanup(), 8000);
    }
    
    animateConfetti() {
        const animate = () => {
            if (this.confettiPieces.length === 0) return;
            
            this.confettiPieces.forEach(piece => {
                // Update position
                piece.position.x += piece.userData.velocity.x;
                piece.position.y += piece.userData.velocity.y;
                piece.position.z += piece.userData.velocity.z;
                
                // Update rotation for flutter effect
                piece.rotation.x += piece.userData.rotationSpeed.x;
                piece.rotation.y += piece.userData.rotationSpeed.y;
                piece.rotation.z += piece.userData.rotationSpeed.z;
                
                // Add some air resistance
                piece.userData.velocity.y *= 0.99;
                
                // Fade out when reaching ground
                if (piece.position.y < -50) {
                    gsap.to(piece.material, {
                        opacity: 0,
                        duration: 0.5
                    });
                }
            });
            
            requestAnimationFrame(animate);
        };
        
        animate();
    }
    
    cleanup() {
        this.confettiPieces.forEach(piece => {
            gsap.to(piece.material, {
                opacity: 0,
                duration: 0.5,
                onComplete: () => {
                    this.scene.remove(piece);
                    piece.geometry.dispose();
                    piece.material.dispose();
                }
            });
        });
        
        setTimeout(() => {
            this.confettiPieces = [];
        }, 600);
    }
}