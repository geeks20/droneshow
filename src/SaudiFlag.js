import * as THREE from 'three';

export class SaudiFlag {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 900;
        this.canvas.height = 600;
        this.droneSpacing = 14;
    }

    generateFlagFormation() {
        // Clear canvas
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw Saudi flag
        const flagWidth = 1000;
        const flagHeight = 600;
        const flagX = (this.canvas.width - flagWidth) / 2;
        const flagY = (this.canvas.height - flagHeight) / 2;
        
        // Green background
        this.ctx.fillStyle = '#00A550';
        this.ctx.fillRect(flagX, flagY, flagWidth, flagHeight);
        
        // Shahada (Islamic creed) - simplified representation
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 80px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('لا إله إلا الله محمد رسول الله', this.canvas.width / 2, this.canvas.height / 2 - 50);
        
        // Sword - simplified geometric representation
        this.ctx.strokeStyle = 'white';
        this.ctx.lineWidth = 20;
        this.ctx.beginPath();
        this.ctx.moveTo(flagX + 200, flagY + 400);
        this.ctx.lineTo(flagX + 800, flagY + 400);
        this.ctx.stroke();
        
        // Sword handle
        this.ctx.beginPath();
        this.ctx.arc(flagX + 180, flagY + 400, 20, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Extract drone positions
        const positions = this.extractDronePositions();
        
        return {
            positions: positions,
            droneCount: positions.length,
            type: 'saudi_flag'
        };
    }

    extractDronePositions() {
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const pixels = imageData.data;
        const positions = [];
        
        // Create a more dense formation for the flag
        for (let y = 0; y < this.canvas.height; y += this.droneSpacing) {
            for (let x = 0; x < this.canvas.width; x += this.droneSpacing) {
                const index = (y * this.canvas.width + x) * 4;
                const r = pixels[index];
                const g = pixels[index + 1];
                const b = pixels[index + 2];
                
                let color = null;
                let delay = 0;
                
                // Check if it's green (flag background)
                if (g > 100 && r < 50 && b < 100) {
                    color = new THREE.Color(0x00A550); // Saudi green
                    delay = Math.random() * 0.2;
                }
                // Check if it's white (text/sword)
                else if (r > 200 && g > 200 && b > 200) {
                    color = new THREE.Color(0xFFFFFF);
                    delay = 0.2 + Math.random() * 0.2;
                }
                
                if (color) {
                    const worldX = (x - this.canvas.width / 2) * 0.3;
                    const worldY = (this.canvas.height / 2 - y) * 0.3;
                    
                    positions.push({
                        target: { x: worldX, y: worldY + 100, z: 0 },
                        color: color,
                        delay: delay,
                        isFlag: true
                    });
                }
            }
        }
        
        return positions;
    }

    generateWaveEffect(basePositions) {
        return basePositions.map((pos, index) => {
            const wavePhase = (pos.target.x / 100) * Math.PI;
            const waveAmplitude = 15;
            
            return {
                ...pos,
                wavePhase: wavePhase,
                waveAmplitude: waveAmplitude,
                originalZ: pos.target.z
            };
        });
    }
}