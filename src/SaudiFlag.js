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
        const positions = [];
        const rows = 20;
        const cols = 35;
        const spacing = 5;
        
        // Flag dimensions
        const width = cols * spacing;
        const height = rows * spacing;
        const centerX = 0;
        const centerY = 50;
        
        // Create flag grid
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const x = (col - cols / 2) * spacing + centerX;
                const y = (row - rows / 2) * spacing + centerY;
                
                // Default to Saudi green
                let color = { r: 0, g: 0.647, b: 0.314 };
                
                // Create Shahada (Islamic testimony) - represented as horizontal lines
                // First line of Shahada
                if (row === 5 && col >= 8 && col <= 27) {
                    color = { r: 1, g: 1, b: 1 };
                }
                if (row === 6 && col >= 6 && col <= 29) {
                    color = { r: 1, g: 1, b: 1 };
                }
                if (row === 7 && col >= 7 && col <= 28) {
                    color = { r: 1, g: 1, b: 1 };
                }
                
                // Second line of Shahada
                if (row === 9 && col >= 9 && col <= 26) {
                    color = { r: 1, g: 1, b: 1 };
                }
                if (row === 10 && col >= 7 && col <= 28) {
                    color = { r: 1, g: 1, b: 1 };
                }
                if (row === 11 && col >= 8 && col <= 27) {
                    color = { r: 1, g: 1, b: 1 };
                }
                
                // Create sword shape
                // Blade (horizontal)
                if (row === 14 && col >= 6 && col <= 28) {
                    color = { r: 1, g: 1, b: 1 };
                }
                if (row === 15 && col >= 5 && col <= 29) {
                    color = { r: 1, g: 1, b: 1 };
                }
                
                // Handle (left side)
                if (col === 5 && row >= 13 && row <= 16) {
                    color = { r: 1, g: 1, b: 1 };
                }
                if (col === 6 && row >= 13 && row <= 14) {
                    color = { r: 1, g: 1, b: 1 };
                }
                
                // Guard
                if (col === 7 && row >= 12 && row <= 17) {
                    color = { r: 1, g: 1, b: 1 };
                }
                if (col === 8 && row >= 13 && row <= 16) {
                    color = { r: 1, g: 1, b: 1 };
                }
                
                // Tip (right side)
                if (col === 29 && row === 14) {
                    color = { r: 1, g: 1, b: 1 };
                }
                if (col === 28 && row === 15) {
                    color = { r: 1, g: 1, b: 1 };
                }
                
                positions.push({
                    target: { x, y, z: 0 },
                    index: positions.length,
                    color: color
                });
            }
        }
        
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