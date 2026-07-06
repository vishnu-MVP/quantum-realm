/**
 * Main Application — ties all modules together
 */

(function() {
  let state, blochSphere, waveVis, entanglementDemo;

  // ===== Init =====
  function init() {
    // Hide loader
    const loader = document.getElementById('loader');
    setTimeout(() => {
      loader.classList.add('hidden');
    }, 1500);
    
    // Initialize hero scene
    if (window.THREE && window.Shaders) {
      new HeroScene();
    }
    
    // Initialize Bloch sphere
    const blochCanvas = document.getElementById('bloch-canvas');
    if (blochCanvas) {
      blochSphere = new BlochSphere(blochCanvas);
    }
    
    // Initialize wave visualizer
    const waveCanvas = document.getElementById('wave-canvas');
    if (waveCanvas) {
      waveVis = new WaveVisualizer(waveCanvas);
    }
    
    // Initialize entanglement demo
    entanglementDemo = new EntanglementDemo();
    
    // Set up qubit lab
    setupQubitLab();
    
    // Set up wave controls
    setupWaveControls();
    
    // Set up scroll reveal
    setupScrollReveal();
  }
  
  // ===== Qubit Lab =====
  let qubitState;
  
  function setupQubitLab() {
    qubitState = QuantumSim.createQubitState();
    updateQubitDisplay();
    
    // Gate buttons
    document.querySelectorAll('.gate-btn[data-gate]').forEach(btn => {
      btn.addEventListener('click', () => {
        const gate = btn.dataset.gate;
        qubitState = QuantumSim.applyGate(qubitState, gate);
        updateQubitDisplay();
        
        // Visual feedback
        btn.style.transform = 'scale(0.95)';
        setTimeout(() => { btn.style.transform = ''; }, 150);
      });
    });
    
    // Measure button
    const measureBtn = document.getElementById('measure-btn');
    if (measureBtn) {
      measureBtn.addEventListener('click', () => {
        const { result, collapsed } = QuantumSim.measure(qubitState);
        qubitState = collapsed;
        updateQubitDisplay();
        
        const resultEl = document.getElementById('measure-result');
        resultEl.textContent = `Measured: |${result}⟩`;
        resultEl.style.opacity = '0';
        resultEl.style.transform = 'scale(0.8)';
        setTimeout(() => {
          resultEl.style.transition = 'all 0.4s ease';
          resultEl.style.opacity = '1';
          resultEl.style.transform = 'scale(1)';
        }, 50);
      });
    }
    
    // Reset button
    const resetBtn = document.getElementById('reset-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        qubitState = QuantumSim.createQubitState();
        updateQubitDisplay();
        const resultEl = document.getElementById('measure-result');
        resultEl.textContent = '';
      });
    }
  }
  
  function updateQubitDisplay() {
    // Update state vector text
    const stateEl = document.getElementById('state-vector');
    if (stateEl) {
      stateEl.textContent = QuantumSim.formatState(qubitState);
    }
    
    // Update probability bars
    const probs = QuantumSim.getProbabilities(qubitState);
    const prob0 = document.getElementById('prob0');
    const prob1 = document.getElementById('prob1');
    const prob0Val = document.getElementById('prob0-val');
    const prob1Val = document.getElementById('prob1-val');
    
    if (prob0) prob0.style.width = (probs[0] * 100) + '%';
    if (prob1) prob1.style.width = (probs[1] * 100) + '%';
    if (prob0Val) prob0Val.textContent = (probs[0] * 100).toFixed(1) + '%';
    if (prob1Val) prob1Val.textContent = (probs[1] * 100).toFixed(1) + '%';
    
    // Update Bloch sphere
    if (blochSphere) {
      const bloch = QuantumSim.stateToBloch(qubitState);
      blochSphere.setState(bloch);
    }
  }
  
  // ===== Wave Controls =====
  function setupWaveControls() {
    const superposeBtn = document.getElementById('wave-superpose');
    const measureBtn = document.getElementById('wave-measure');
    const resetBtn = document.getElementById('wave-reset');
    
    if (superposeBtn) {
      superposeBtn.addEventListener('click', () => {
        if (waveVis) {
          let s = QuantumSim.createQubitState();
          s = QuantumSim.applyGate(s, 'H');
          waveVis.setState(s);
        }
      });
    }
    
    if (measureBtn) {
      measureBtn.addEventListener('click', () => {
        if (waveVis) {
          waveVis.measure();
        }
      });
    }
    
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (waveVis) {
          waveVis.reset();
        }
      });
    }
  }
  
  // ===== Scroll Reveal =====
  function setupScrollReveal() {
    const reveals = document.querySelectorAll('.reveal');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.15 });
    
    reveals.forEach(el => observer.observe(el));
  }
  
  // ===== Start =====
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();