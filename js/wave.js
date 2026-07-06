/**
 * Wave Function Visualization — Canvas 2D
 * Shows amplitude bars and animated wave function
 */

class WaveVisualizer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.dpr = window.devicePixelRatio || 1;
    this.w = 800;
    this.h = 300;
    this.canvas.width = this.w * this.dpr;
    this.canvas.height = this.h * this.dpr;
    this.canvas.style.width = this.w + 'px';
    this.canvas.style.height = this.h + 'px';
    this.ctx.scale(this.dpr, this.dpr);
    
    this.state = QuantumSim.createQubitState();
    this.time = 0;
    this.collapsed = false;
    this.collapseAnim = 0;
    
    this.animate = this.animate.bind(this);
    this.animate();
  }
  
  setState(state) {
    this.state = state;
    this.collapsed = false;
    this.collapseAnim = 0;
  }
  
  measure() {
    const { result, collapsed } = QuantumSim.measure(this.state);
    this.state = collapsed;
    this.collapsed = true;
    this.collapseAnim = 0;
    return result;
  }
  
  reset() {
    this.state = QuantumSim.createQubitState();
    this.collapsed = false;
    this.collapseAnim = 0;
  }
  
  animate() {
    const ctx = this.ctx;
    this.time += 0.016;
    
    if (this.collapsed) {
      this.collapseAnim = Math.min(1, this.collapseAnim + 0.05);
    }
    
    ctx.clearRect(0, 0, this.w, this.h);
    
    // Background grid
    ctx.strokeStyle = 'rgba(120, 120, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 10; i++) {
      const x = (i / 10) * this.w;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.h);
      ctx.stroke();
    }
    for (let i = 0; i <= 6; i++) {
      const y = (i / 6) * this.h;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.w, y);
      ctx.stroke();
    }
    
    // Center line
    ctx.strokeStyle = 'rgba(120, 120, 255, 0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, this.h / 2);
    ctx.lineTo(this.w, this.h / 2);
    ctx.stroke();
    
    const probs = QuantumSim.getProbabilities(this.state);
    const a = this.state[0];
    const b = this.state[1];
    
    // Draw wave function (real part of amplitude * oscillation)
    const points = 200;
    
    // |0⟩ component wave
    ctx.strokeStyle = 'rgba(0, 217, 255, 0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i <= points; i++) {
      const x = (i / points) * this.w;
      const phase = (i / points) * Math.PI * 4;
      const amp = Math.sqrt(probs[0]) * Math.cos(phase + this.time * 2) * (this.h / 3);
      const y = this.h / 2 - amp;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    
    // |1⟩ component wave
    ctx.strokeStyle = 'rgba(157, 78, 221, 0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i <= points; i++) {
      const x = (i / points) * this.w;
      const phase = (i / points) * Math.PI * 4 + Math.PI / 2;
      const amp = Math.sqrt(probs[1]) * Math.cos(phase + this.time * 2) * (this.h / 3);
      const y = this.h / 2 - amp;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    
    // Combined wave (interference)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let i = 0; i <= points; i++) {
      const x = (i / points) * this.w;
      const phase = (i / points) * Math.PI * 4;
      const amp0 = Math.sqrt(probs[0]) * Math.cos(phase + this.time * 2);
      const amp1 = Math.sqrt(probs[1]) * Math.cos(phase + Math.PI / 2 + this.time * 2);
      const combined = (amp0 + amp1) * (this.h / 3);
      const y = this.h / 2 - combined;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    
    // Amplitude bars on right side
    const barX = this.w - 120;
    const barW = 40;
    const barGap = 20;
    const maxBarH = this.h - 80;
    
    // |0⟩ bar
    const h0 = probs[0] * maxBarH;
    const grad0 = ctx.createLinearGradient(0, this.h / 2 - h0 / 2, 0, this.h / 2 + h0 / 2);
    grad0.addColorStop(0, 'rgba(0, 217, 255, 0.8)');
    grad0.addColorStop(1, 'rgba(67, 97, 238, 0.4)');
    ctx.fillStyle = grad0;
    ctx.fillRect(barX, this.h / 2 - h0 / 2, barW, h0);
    
    // Glow for |0⟩
    ctx.shadowColor = 'rgba(0, 217, 255, 0.5)';
    ctx.shadowBlur = 20;
    ctx.fillRect(barX, this.h / 2 - h0 / 2, barW, h0);
    ctx.shadowBlur = 0;
    
    // |1⟩ bar
    const h1 = probs[1] * maxBarH;
    const grad1 = ctx.createLinearGradient(0, this.h / 2 - h1 / 2, 0, this.h / 2 + h1 / 2);
    grad1.addColorStop(0, 'rgba(157, 78, 221, 0.8)');
    grad1.addColorStop(1, 'rgba(199, 125, 255, 0.4)');
    ctx.fillStyle = grad1;
    ctx.fillRect(barX + barW + barGap, this.h / 2 - h1 / 2, barW, h1);
    
    ctx.shadowColor = 'rgba(157, 78, 221, 0.5)';
    ctx.shadowBlur = 20;
    ctx.fillRect(barX + barW + barGap, this.h / 2 - h1 / 2, barW, h1);
    ctx.shadowBlur = 0;
    
    // Labels
    ctx.fillStyle = 'rgba(0, 217, 255, 0.9)';
    ctx.font = 'bold 14px "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('|0⟩', barX + barW / 2, this.h - 15);
    
    ctx.fillStyle = 'rgba(157, 78, 221, 0.9)';
    ctx.fillText('|1⟩', barX + barW + barGap + barW / 2, this.h - 15);
    
    // Probability values
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = '11px "Courier New", monospace';
    ctx.fillText((probs[0] * 100).toFixed(1) + '%', barX + barW / 2, this.h / 2 - h0 / 2 - 8);
    ctx.fillText((probs[1] * 100).toFixed(1) + '%', barX + barW + barGap + barW / 2, this.h / 2 - h1 / 2 - 8);
    
    // Collapse flash
    if (this.collapsed && this.collapseAnim < 1) {
      ctx.fillStyle = `rgba(255, 255, 255, ${0.3 * (1 - this.collapseAnim)})`;
      ctx.fillRect(0, 0, this.w, this.h);
    }
    
    // Legend
    ctx.fillStyle = 'rgba(0, 217, 255, 0.7)';
    ctx.font = '10px "Inter", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('— |0⟩ amplitude', 10, 20);
    ctx.fillStyle = 'rgba(157, 78, 221, 0.7)';
    ctx.fillText('— |1⟩ amplitude', 10, 35);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.fillText('— interference', 10, 50);
    
    requestAnimationFrame(this.animate);
  }
}

window.WaveVisualizer = WaveVisualizer;