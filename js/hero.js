/**
 * Hero Scene — Three.js particle field with custom GLSL shaders
 */

class HeroScene {
  constructor() {
    this.canvas = document.getElementById('hero-canvas');
    if (!this.canvas) return;
    
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.z = 5;
    
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    this.mouseX = 0;
    this.mouseY = 0;
    this.targetMouseX = 0;
    this.targetMouseY = 0;
    
    this.clock = new THREE.Clock();
    
    this.createBackground();
    this.createParticles();
    
    window.addEventListener('resize', () => this.onResize());
    window.addEventListener('mousemove', (e) => {
      this.targetMouseX = (e.clientX / window.innerWidth - 0.5) * 0.5;
      this.targetMouseY = (e.clientY / window.innerHeight - 0.5) * 0.3;
    });
    
    this.animate = this.animate.bind(this);
    this.animate();
  }
  
  createBackground() {
    const geometry = new THREE.PlaneGeometry(20, 20);
    const material = new THREE.ShaderMaterial({
      vertexShader: window.Shaders.waveVertexShader,
      fragmentShader: window.Shaders.waveFragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
      },
      depthWrite: false
    });
    
    this.bgMesh = new THREE.Mesh(geometry, material);
    this.bgMesh.position.z = -5;
    this.scene.add(this.bgMesh);
  }
  
  createParticles() {
    const count = 3000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const phases = new Float32Array(count);
    
    for (let i = 0; i < count; i++) {
      // Distribute in a sphere shell
      const r = 2 + Math.random() * 3;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
      
      // Colors: cyan to purple gradient
      const t = Math.random();
      colors[i * 3] = 0.0 + t * 0.6;     // R: 0 → 0.6
      colors[i * 3 + 1] = 0.5 + t * 0.2;  // G: 0.5 → 0.7
      colors[i * 3 + 2] = 0.9 - t * 0.3;  // B: 0.9 → 0.6
      
      sizes[i] = Math.random() * 3 + 1;
      phases[i] = Math.random() * Math.PI * 2;
    }
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));
    
    const material = new THREE.ShaderMaterial({
      vertexShader: window.Shaders.particleVertexShader,
      fragmentShader: window.Shaders.particleFragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) }
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    
    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);
  }
  
  onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.bgMesh.material.uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
  }
  
  animate() {
    const elapsed = this.clock.getElapsedTime();
    
    // Smooth mouse follow
    this.mouseX += (this.targetMouseX - this.mouseX) * 0.05;
    this.mouseY += (this.targetMouseY - this.mouseY) * 0.05;
    
    this.camera.position.x = this.mouseX * 2;
    this.camera.position.y = -this.mouseY * 2;
    this.camera.lookAt(0, 0, 0);
    
    // Update uniforms
    this.bgMesh.material.uniforms.uTime.value = elapsed;
    this.particles.material.uniforms.uTime.value = elapsed;
    
    // Rotate particles slowly
    this.particles.rotation.y = elapsed * 0.05;
    this.particles.rotation.x = elapsed * 0.02;
    
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this.animate);
  }
}

window.HeroScene = HeroScene;