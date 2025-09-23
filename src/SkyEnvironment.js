import * as THREE from 'three';

export class SkyEnvironment {
    constructor(scene) {
        this.scene = scene;
        this.createSky();
        this.createStars();
        this.createGround();
        this.createClouds();
    }

    createSky() {
        // Gradient sky using shader
        const skyGeometry = new THREE.SphereGeometry(1000, 32, 32);
        const skyMaterial = new THREE.ShaderMaterial({
            uniforms: {
                topColor: { value: new THREE.Color(0x000033) },
                bottomColor: { value: new THREE.Color(0x000066) },
                offset: { value: 33 },
                exponent: { value: 0.6 }
            },
            vertexShader: `
                varying vec3 vWorldPosition;
                void main() {
                    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
                    vWorldPosition = worldPosition.xyz;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 topColor;
                uniform vec3 bottomColor;
                uniform float offset;
                uniform float exponent;
                varying vec3 vWorldPosition;
                void main() {
                    float h = normalize(vWorldPosition + offset).y;
                    gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);
                }
            `,
            side: THREE.BackSide
        });
        
        this.sky = new THREE.Mesh(skyGeometry, skyMaterial);
        this.scene.add(this.sky);
    }

    createStars() {
        const starCount = 2000;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(starCount * 3);
        const colors = new Float32Array(starCount * 3);
        const sizes = new Float32Array(starCount);
        
        for (let i = 0; i < starCount; i++) {
            const i3 = i * 3;
            
            // Random position on sphere
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI * 0.5; // Only upper hemisphere
            const radius = 800 + Math.random() * 100;
            
            positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta) + 200;
            positions[i3 + 2] = radius * Math.cos(phi);
            
            // Star color (white to slightly blue/yellow)
            const color = new THREE.Color();
            color.setHSL(Math.random() * 0.1 + 0.55, 0.2, 0.8 + Math.random() * 0.2);
            colors[i3] = color.r;
            colors[i3 + 1] = color.g;
            colors[i3 + 2] = color.b;
            
            // Star size
            sizes[i] = Math.random() * 2;
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        const material = new THREE.PointsMaterial({
            size: 1,
            sizeAttenuation: true,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });
        
        this.stars = new THREE.Points(geometry, material);
        this.scene.add(this.stars);
        
        // Twinkling effect
        this.starTwinkle = { sizes, originalSizes: [...sizes] };
    }

    createGround() {
        // Simple ground plane
        const groundGeometry = new THREE.PlaneGeometry(2000, 2000);
        const groundMaterial = new THREE.MeshLambertMaterial({
            color: 0x111122,
            emissive: 0x000011,
            emissiveIntensity: 0.2
        });
        
        this.ground = new THREE.Mesh(groundGeometry, groundMaterial);
        this.ground.rotation.x = -Math.PI / 2;
        this.ground.position.y = -10;
        this.ground.receiveShadow = true;
        this.scene.add(this.ground);
        
        // Add grid for visual reference
        const gridHelper = new THREE.GridHelper(1000, 50, 0x222244, 0x111122);
        gridHelper.position.y = -9;
        this.scene.add(gridHelper);
    }

    createClouds() {
        this.clouds = [];
        const cloudCount = 5;
        
        for (let i = 0; i < cloudCount; i++) {
            const cloudGroup = new THREE.Group();
            
            // Create cloud using multiple spheres
            const sphereCount = 8;
            for (let j = 0; j < sphereCount; j++) {
                const radius = 30 + Math.random() * 20;
                const geometry = new THREE.SphereGeometry(radius, 8, 6);
                const material = new THREE.MeshPhongMaterial({
                    color: 0x444466,
                    transparent: true,
                    opacity: 0.3,
                    emissive: 0x111133,
                    emissiveIntensity: 0.1
                });
                
                const sphere = new THREE.Mesh(geometry, material);
                sphere.position.set(
                    Math.random() * 60 - 30,
                    Math.random() * 20 - 10,
                    Math.random() * 40 - 20
                );
                
                cloudGroup.add(sphere);
            }
            
            // Position cloud
            cloudGroup.position.set(
                Math.random() * 800 - 400,
                200 + Math.random() * 100,
                Math.random() * 400 - 200
            );
            
            cloudGroup.userData = {
                speed: 0.01 + Math.random() * 0.02,
                initialX: cloudGroup.position.x
            };
            
            this.clouds.push(cloudGroup);
            this.scene.add(cloudGroup);
        }
    }

    update(time) {
        // Rotate stars slowly
        this.stars.rotation.y = time * 0.00001;
        
        // Twinkle stars
        const sizes = this.stars.geometry.attributes.size;
        for (let i = 0; i < sizes.count; i++) {
            const twinkleSpeed = 0.001 + (i % 10) * 0.0001;
            const twinkle = Math.sin(time * twinkleSpeed + i) * 0.3 + 0.7;
            sizes.array[i] = this.starTwinkle.originalSizes[i] * twinkle;
        }
        sizes.needsUpdate = true;
        
        // Animate clouds
        this.clouds.forEach((cloud) => {
            cloud.position.x = cloud.userData.initialX + Math.sin(time * cloud.userData.speed) * 50;
            cloud.rotation.y = time * 0.0001;
        });
        
        // Subtle sky color animation
        const skyUniforms = this.sky.material.uniforms;
        const colorShift = Math.sin(time * 0.0002) * 0.05;
        skyUniforms.topColor.value.setHSL(0.6, 0.8, 0.05 + colorShift);
    }
}