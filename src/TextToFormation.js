export class TextToFormation {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 1200; // Increased width for longer text
        this.canvas.height = 250;
        this.spacing = 14; // Fixed spacing between points
    }

    async generateFormation(text) {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Configure text rendering
        this.ctx.fillStyle = 'white';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        // Check if text is English or Arabic
        const isEnglish = /^[A-Za-z0-9\s]+$/.test(text);
        
        // Dynamic font sizing to fit canvas
        let fontSize = isEnglish ? 120 : 180;
        const minFontSize = isEnglish ? 80 : 120; // Increased minimum to keep text readable
        const maxWidth = this.canvas.width * 0.9; // 90% of canvas width for better space usage
        
        let textWidth;
        do {
            this.ctx.font = `bold ${fontSize}px Arial, sans-serif`;
            textWidth = this.ctx.measureText(text).width;
            if (textWidth > maxWidth && fontSize > minFontSize) {
                fontSize -= 5;
            }
        } while (textWidth > maxWidth && fontSize > minFontSize);
        
        console.log(`Text: "${text}", Font size: ${fontSize}px, Width: ${textWidth}px`);
        
        // Adjust spacing based on font size for better density
        if (fontSize < 140) {
            this.spacing = 12; // Tighter spacing for smaller text
        } else {
            this.spacing = 14; // Normal spacing
        }
        
        if (isEnglish) {
            this.ctx.direction = 'ltr'; // Force left-to-right
            // Reset canvas for clean rendering
            this.ctx.save();
            this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        } else {
            this.ctx.direction = 'rtl';
        }
        
        // Draw text with padding from bottom
        this.ctx.fillText(text, this.canvas.width / 2, this.canvas.height * 0.6);
        
        if (isEnglish) {
            this.ctx.restore(); // Restore context
        }
        
        // Get pixel data
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const pixels = imageData.data;
        
        // Extract clean target points with fixed spacing
        const dronePositions = [];
        
        for (let y = 0; y < this.canvas.height; y += this.spacing) {
            for (let x = 0; x < this.canvas.width; x += this.spacing) {
                const index = (y * this.canvas.width + x) * 4;
                const alpha = pixels[index + 3]; // Alpha channel
                const brightness = pixels[index]; // Red channel for white text
                
                if (brightness > 128 && alpha > 128) {
                    // Normalize to center with proper scale
                    const worldX = (x - this.canvas.width / 2) * 0.5;
                    const worldY = (this.canvas.height / 2 - y) * 0.5;
                    
                    dronePositions.push({
                        target: { 
                            x: worldX, 
                            y: worldY + 120, // Lift text up
                            z: 0 
                        },
                        settled: false
                    });
                }
            }
        }
        
        return {
            positions: dronePositions,
            droneCount: dronePositions.length,
            text: text
        };
    }

    // Greedy assignment to avoid crossing paths
    assignDronesToTargets(dronePositions, targetPositions) {
        const assignments = [];
        const usedTargets = new Set();
        
        dronePositions.forEach((drone, droneIndex) => {
            let bestTarget = -1;
            let bestDistance = Infinity;
            
            targetPositions.forEach((target, targetIndex) => {
                if (usedTargets.has(targetIndex)) return;
                
                const dx = drone.x - target.target.x;
                const dy = drone.y - target.target.y;
                const dz = drone.z - target.target.z;
                const dist = dx * dx + dy * dy + dz * dz;
                
                if (dist < bestDistance) {
                    bestDistance = dist;
                    bestTarget = targetIndex;
                }
            });
            
            if (bestTarget !== -1) {
                usedTargets.add(bestTarget);
                assignments.push({
                    droneIndex,
                    targetIndex: bestTarget,
                    target: targetPositions[bestTarget].target
                });
            }
        });
        
        return assignments;
    }
}