/**
 * Bloch Sphere Renderer — Canvas 2D
 * Draws a 3D-projected Bloch sphere with the qubit state vector
 */

class BlochSphere {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.dpr = window.devicePixelRatio || 1;
    this.size = 400;
    this.canvas.width = this.size * this.dpr;
    this.canvas.height = this.size * this.dpr;
    this.canvas.style.width = this.size + 'px';
    this.canvas.style.height = this.size + 'px';
    this.ctx.scale(this.dpr, this.dpr);
    
    this.cx = this.size / 2;
    this.cy = this.size / 2;
    this.radius = 150;
    
    // Rotation for 3D effect
    this.rotX = 0.3;
    this.rotY = 0;
    this.autoRotate = true;
    
    // Current state vector (Bloch coordinates)
    this.currentVec = { x: 0, y: 0, z: 1 }; // |0⟩ = north pole
    this.targetVec = { x: 0, y: 0, z: 1 };
    
    // Animation
    this.animProgress = 1;
    this.animStart = null;
    this.prevVec = { x: 0, y: 0, z: 1 };
    
    this.animate = this.animate.bind(this);
    this.animate();
  }
  
  // Project 3D point to 2D canvas
  project(x, y, z) {
    // Rotate around Y axis
    const cosY = Math.cos(this.rotY);
    const sinY = Math.sin(this.rotY);
    const x1 = x * cosY - z * sinY;
    const z1 = x * sinY + z * cosY;
    
    // Rotate around X axis
    const cosX = Math.cos(this.rotX);
    const sinX = Math.sin(this.rotX);
    const y1 = y * cosX - z1 * sinX;
    const z2 = y * sinX + z1 * cosX;
    
    return {
      x: this.cx + x1 * this.radius,
      y: this.cy - y1 * this.radius,
      depth: z2 // for depth sorting
    };
  }
  
  setState(blochVec) {
    this.prevVec = { ...this.currentVec };
    this.targetVec = { ...blochVec };
    this.animProgress = 0;
    this.animStart = performance.now();
  }
  
  // Smooth interpolation between vectors
  lerpVec(a, b, t) {
    // Spherical interpolation (slerp)
    const dot = a.x * b.x + a.y * b.y + a.z * b.z;
    const clampedDot = Math.max(-1, Math.min(1, dot));
    
    if (Math.abs(clampedDot) > 0.9995) {
      // Nearly parallel — linear interpolation
      return {
        x: a.x + (b.x - a.x) * t,
        y: a.y + (b.y - a.y) * t,
        z: a.z + (b.z - a.z) * t
      };
    }
    
    const theta = Math.acos(clampedDot);
    const sinTheta = Math.sin(theta);
    const w1 = Math.sin((1 - t) * theta) / sinTheta;
    const w2 = Math.sin(t * theta) / sinTheta;
    
    return {
      x: w1 * a.x + w2 * b.x,
      y: w1 * a.y + w2 * b.y,
      z: w1 * a.z + w2 * b.z
    };
  }
  
  normalize(v) {
    const len = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
    if (len < 1e-10) return { x: 0, y: 0, z: 1 };
    return { x: v.x / len, y: v.y / len, z: v.z / len };
  }
  
  drawSphere() {
    const ctx = this.ctx;
    
    // Sphere outline
    ctx.strokeStyle = 'rgba(120, 120, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(this.cx, this.cy, this.radius, 0, Math.PI * 2);
    ctx.stroke();
    
    // Equator (ellipse)
    ctx.strokeStyle = 'rgba(120, 120, 255, 0.15)';
    ctx.beginPath();
    ctx.ellipse(this.cx, this.cy, this.radius, this.radius * Math.abs(Math.sin(this.rotX)), 0, 0, Math.PI * 2);
    ctx.stroke();
    
    // Meridian (vertical ellipse)
    ctx.beginPath();
    ctx.ellipse(this.cx, this.cy, this.radius * Math.abs(Math.sin(this.rotY + Math.PI/2)), this.radius, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  
  drawAxes() {
    const ctx = this.ctx;
    const axes = [
      { dir: { x: 1, y: 0, z: 0 }, label: 'x', color: 'rgba(255, 100, 100, 0.6)' },
      { dir: { x: 0, y: 1, z: 0 }, label: 'y', color: 'rgba(100, 255, 100, 0.6)' },
      { dir: { x: 0, y: 0, z: 1 }, label: 'z', color: 'rgba(100, 200, 255, 0.6)' }
    ];
    
    axes.forEach(ax => {
      const p1 = this.project(-ax.dir.x * 1.3, -ax.dir.y * 1.3, -ax.dir.z * 1.3);
      const p2 = this.project(ax.dir.x * 1.3, ax.dir.y * 1.3, ax.dir.z * 1.3);
      
      ctx.strokeStyle = ax.color;
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
      ctx.setLineDash([]);
      
      // Label
      ctx.fillStyle = ax.color.replace('0.6', '0.8');
      ctx.font = '12px "Space Grotesk", sans-serif';
      ctx.fillText(ax.label, p2.x + 5, p2.y);
    });
    
    // |0⟩ and |1⟩ labels
    const p0 = this.project(0, 0, 1.15);
    const p1 = this.project(0, 0, -1.15);
    ctx.fillStyle = 'rgba(0, 217, 255, 0.8)';
    ctx.font = 'bold 14px "Space Grotesk", sans-serif';
    ctx.fillText('|0⟩', p0.x + 8, p0.y + 4);
    ctx.fillStyle = 'rgba(157, 78, 221, 0.8)';
    ctx.fillText('|1⟩', p1.x + 8, p1.y + 4);
  }
  
  drawStateVector() {
    const ctx = this.ctx;
    const v = this.normalize(this.currentVec);
    
    const origin = this.project(0, 0, 0);
    const tip = this.project(v.x, v.y, v.z);
    
    // Glow line
    ctx.strokeStyle = 'rgba(0, 217, 255, 0.15)';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(origin.x, origin.y);
    ctx.lineTo(tip.x, tip.y);
    ctx.stroke();
    
    // Main vector line
    const gradient = ctx.createLinearGradient(origin.x, origin.y, tip.x, tip.y);
    gradient.addColorStop(0, 'rgba(0, 217, 255, 0.8)');
    gradient.addColorStop(1, 'rgba(157, 78, 221, 1)');
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(origin.x, origin.y);
    ctx.lineTo(tip.x, tip.y);
    ctx.stroke();
    
    // Arrowhead (point at tip)
    ctx.fillStyle = 'rgba(157, 78, 221, 1)';
    ctx.shadowColor = 'rgba(157, 78, 221, 0.8)';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(tip.x, tip.y, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
  
  animate() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.size, this.size);
    
    // Auto-rotate
    if (this.autoRotate) {
      this.rotY += 0.003;
    }
    
    // Animate state vector transition
    if (this.animProgress < 1) {
      const elapsed = performance.now() - this.animStart;
      this.animProgress = Math.min(1, elapsed / 600); // 600ms animation
      const t = this.easeInOutCubic(this.animProgress);
      this.currentVec = this.lerpVec(this.prevVec, this.targetVec, t);
    } else {
      this.currentVec = { ...this.targetVec };
    }
    
    this.drawSphere();
    this.drawAxes();
    this.drawStateVector();
    
    requestAnimationFrame(this.animate);
  }
  
  easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }
}

window.BlochSphere = BlochSphere;