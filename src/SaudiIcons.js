export class SaudiIcons {
    constructor() {
        this.iconSize = 150;
        this.spacing = 12;
    }
    
    // Generate Saudi Flag outline
    generateKingSalmanIcon() {
        const positions = [];
        
        // Flag rectangle outline
        const flag = [];
        
        // Flag border
        for (let x = -60; x <= 60; x += 4) {
            flag.push({ x, y: -25 }); // Bottom
            flag.push({ x, y: 25 });  // Top
        }
        for (let y = -25; y <= 25; y += 4) {
            flag.push({ x: -60, y }); // Left
            flag.push({ x: 60, y });  // Right
        }
        
        // Shahada text representation (simplified as horizontal lines)
        const shahada = [
            // First line of text
            { x: -40, y: 10 }, { x: -30, y: 10 }, { x: -20, y: 10 },
            { x: -10, y: 10 }, { x: 0, y: 10 }, { x: 10, y: 10 },
            { x: 20, y: 10 }, { x: 30, y: 10 }, { x: 40, y: 10 },
            
            // Second line of text
            { x: -35, y: 0 }, { x: -25, y: 0 }, { x: -15, y: 0 },
            { x: -5, y: 0 }, { x: 5, y: 0 }, { x: 15, y: 0 },
            { x: 25, y: 0 }, { x: 35, y: 0 },
        ];
        
        // Sword (simplified)
        for (let x = -40; x <= 40; x += 3) {
            flag.push({ x, y: -10 });
            if (x < -30) {
                flag.push({ x, y: -13 }); // Handle
            }
        }
        
        [...flag, ...shahada].forEach(point => {
            positions.push({
                x: point.x * 1.5,
                y: point.y * 1.5 + 50,
                z: 0
            });
        });
        
        return {
            positions: positions.map((pos, i) => ({
                target: pos,
                index: i
            })),
            droneCount: positions.length
        };
    }
    
    // Generate Vision 2030 logo (representing MBS's vision)
    generateMBSIcon() {
        const positions = [];
        
        // "2030" in stylized form
        const vision2030 = [];
        
        // Number 2
        for (let x = -80; x <= -50; x += 5) {
            vision2030.push({ x, y: 30 }); // Top
            vision2030.push({ x, y: -30 }); // Bottom
        }
        for (let y = 0; y <= 30; y += 5) {
            vision2030.push({ x: -50, y }); // Right vertical
        }
        for (let y = -30; y <= 0; y += 5) {
            vision2030.push({ x: -80, y }); // Left vertical
        }
        vision2030.push({ x: -65, y: 0 }); // Middle
        
        // Number 0
        for (let angle = 0; angle < Math.PI * 2; angle += 0.2) {
            const x = -25 + Math.cos(angle) * 15;
            const y = Math.sin(angle) * 30;
            vision2030.push({ x, y });
        }
        
        // Number 3
        for (let x = 5; x <= 35; x += 5) {
            vision2030.push({ x, y: 30 }); // Top
            vision2030.push({ x, y: 0 }); // Middle
            vision2030.push({ x, y: -30 }); // Bottom
        }
        for (let y = -30; y <= 30; y += 5) {
            vision2030.push({ x: 35, y }); // Right side
        }
        
        // Second 0
        for (let angle = 0; angle < Math.PI * 2; angle += 0.2) {
            const x = 60 + Math.cos(angle) * 15;
            const y = Math.sin(angle) * 30;
            vision2030.push({ x, y });
        }
        
        vision2030.forEach(point => {
            positions.push({
                x: point.x,
                y: point.y + 50,
                z: 0
            });
        });
        
        return {
            positions: positions.map((pos, i) => ({
                target: pos,
                index: i
            })),
            droneCount: positions.length
        };
    }
    
    // Generate crossed swords (Saudi emblem)
    generateSaudiMapIcon() {
        const positions = [];
        
        // Two crossed swords
        const swords = [];
        
        // First sword (left to right diagonal)
        for (let t = -50; t <= 50; t += 3) {
            // Blade
            swords.push({ x: t, y: t * 0.7 });
            swords.push({ x: t + 2, y: t * 0.7 + 2 });
            
            // Handle at bottom left
            if (t < -30) {
                swords.push({ x: t, y: t * 0.7 - 5 });
                swords.push({ x: t - 5, y: t * 0.7 });
            }
        }
        
        // Second sword (right to left diagonal)
        for (let t = -50; t <= 50; t += 3) {
            // Blade
            swords.push({ x: t, y: -t * 0.7 });
            swords.push({ x: t + 2, y: -t * 0.7 + 2 });
            
            // Handle at bottom right
            if (t > 30) {
                swords.push({ x: t, y: -t * 0.7 - 5 });
                swords.push({ x: t + 5, y: -t * 0.7 });
            }
        }
        
        // Palm tree in center (simplified)
        const palm = [];
        // Trunk
        for (let y = -30; y <= 10; y += 5) {
            palm.push({ x: 0, y });
            palm.push({ x: 3, y });
            palm.push({ x: -3, y });
        }
        
        // Fronds
        const fronds = [
            { x: -15, y: 20 }, { x: -10, y: 25 }, { x: -5, y: 28 },
            { x: 0, y: 30 },
            { x: 5, y: 28 }, { x: 10, y: 25 }, { x: 15, y: 20 }
        ];
        
        [...swords, ...palm, ...fronds].forEach(point => {
            positions.push({
                x: point.x * 1.5,
                y: point.y * 1.2 + 50,
                z: 0
            });
        });
        
        return {
            positions: positions.map((pos, i) => ({
                target: pos,
                index: i
            })),
            droneCount: positions.length
        };
    }
    
    // Generate Kaaba outline
    generateKaabaIcon() {
        const positions = [];
        
        // Simple 3D cube representation
        const kaaba = [];
        
        // Front face square
        for (let x = -30; x <= 30; x += 5) {
            kaaba.push({ x, y: -25 }); // Bottom
            kaaba.push({ x, y: 25 }); // Top
        }
        for (let y = -25; y <= 25; y += 5) {
            kaaba.push({ x: -30, y }); // Left
            kaaba.push({ x: 30, y }); // Right
        }
        
        // 3D perspective lines to back corner
        const perspectiveLines = [
            // From front corners to back
            [{ x: -30, y: 25 }, { x: -15, y: 40 }],
            [{ x: 30, y: 25 }, { x: 45, y: 40 }],
            [{ x: 30, y: -25 }, { x: 45, y: -10 }],
            
            // Back edges
            [{ x: -15, y: 40 }, { x: 45, y: 40 }],
            [{ x: 45, y: 40 }, { x: 45, y: -10 }]
        ];
        
        perspectiveLines.forEach(line => {
            for (let t = 0; t <= 1; t += 0.1) {
                const x = line[0].x + (line[1].x - line[0].x) * t;
                const y = line[0].y + (line[1].y - line[0].y) * t;
                kaaba.push({ x, y });
            }
        });
        
        // Kiswah band (golden band around Kaaba)
        for (let x = -25; x <= 25; x += 3) {
            kaaba.push({ x, y: 10 });
            kaaba.push({ x, y: 5 });
        }
        
        // Door area
        for (let y = -25; y <= -5; y += 3) {
            kaaba.push({ x: -10, y });
            kaaba.push({ x: -5, y });
        }
        
        kaaba.forEach(point => {
            positions.push({
                x: point.x * 1.8,
                y: point.y * 1.5 + 50,
                z: 0
            });
        });
        
        return {
            positions: positions.map((pos, i) => ({
                target: pos,
                index: i
            })),
            droneCount: positions.length
        };
    }
}