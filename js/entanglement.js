/**
 * Entanglement Demo Controller
 */

class EntanglementDemo {
  constructor() {
    this.state = QuantumSim.createTwoQubitState();
    this.isEntangled = false;
    this.measuredA = null;
    this.measuredB = null;
    
    this.orbA = document.getElementById('orb-a');
    this.orbB = document.getElementById('orb-b');
    this.orbInnerA = document.getElementById('orb-inner-a');
    this.orbInnerB = document.getElementById('orb-inner-b');
    this.statusEl = document.getElementById('entangle-status');
    this.btnMeasureA = document.getElementById('measure-a');
    this.btnMeasureB = document.getElementById('measure-b');
    this.btnPrepareBell = document.getElementById('prepare-bell');
    this.btnReset = document.getElementById('reset-entangle');
    
    if (!this.orbA) return;
    
    this.btnPrepareBell.addEventListener('click', () => this.prepareBell());
    this.btnMeasureA.addEventListener('click', () => this.measureQubit('A'));
    this.btnMeasureB.addEventListener('click', () => this.measureQubit('B'));
    this.btnReset.addEventListener('click', () => this.reset());
  }
  
  prepareBell() {
    this.state = QuantumSim.prepareBellState();
    this.isEntangled = true;
    this.measuredA = null;
    this.measuredB = null;
    
    this.orbA.classList.remove('collapsed-0', 'collapsed-1');
    this.orbB.classList.remove('collapsed-0', 'collapsed-1');
    this.orbA.classList.add('entangled');
    this.orbB.classList.add('entangled');
    
    this.orbInnerA.textContent = '?';
    this.orbInnerB.textContent = '?';
    this.orbInnerA.style.color = '';
    this.orbInnerB.style.color = '';
    
    this.statusEl.textContent = 'Bell state |Φ+⟩ prepared. Qubits are entangled — measure one to collapse both.';
    this.statusEl.style.color = 'var(--accent-cyan)';
  }
  
  measureQubit(which) {
    if (!this.isEntangled) {
      this.statusEl.textContent = 'Prepare the Bell state first to entangle the qubits.';
      this.statusEl.style.color = 'var(--text-muted)';
      return;
    }
    
    if (which === 'A' && this.measuredA !== null) return;
    if (which === 'B' && this.measuredB !== null) return;
    
    // Measure the two-qubit system
    const { result, collapsed } = QuantumSim.measureTwoQubit(this.state);
    this.state = collapsed;
    
    // Extract individual qubit values: result is 0-3 for |00⟩, |01⟩, |10⟩, |11⟩
    const qubitA = (result >> 1) & 1; // first qubit (high bit)
    const qubitB = result & 1;        // second qubit (low bit)
    
    // In Bell state |Φ+⟩, both qubits are always the same
    this.measuredA = qubitA;
    this.measuredB = qubitB;
    
    // Collapse both visually
    this.collapseOrb(this.orbA, this.orbInnerA, qubitA);
    this.collapseOrb(this.orbB, this.orbInnerB, qubitB);
    
    this.orbA.classList.remove('entangled');
    this.orbB.classList.remove('entangled');
    
    const measurer = which === 'A' ? 'A' : 'B';
    const other = which === 'A' ? 'B' : 'A';
    this.statusEl.textContent = `Measured Qubit ${measurer} = |${qubitA}⟩. Qubit ${other} instantly collapsed to |${qubitB}⟩ — entanglement confirmed!`;
    this.statusEl.style.color = 'var(--accent-cyan)';
  }
  
  collapseOrb(orb, inner, value) {
    orb.classList.remove('entangled');
    orb.classList.add(value === 0 ? 'collapsed-0' : 'collapsed-1');
    inner.textContent = value;
    inner.style.color = value === 0 ? 'var(--accent-cyan)' : 'var(--accent-purple)';
  }
  
  reset() {
    this.state = QuantumSim.createTwoQubitState();
    this.isEntangled = false;
    this.measuredA = null;
    this.measuredB = null;
    
    this.orbA.classList.remove('collapsed-0', 'collapsed-1', 'entangled');
    this.orbB.classList.remove('collapsed-0', 'collapsed-1', 'entangled');
    this.orbInnerA.textContent = '?';
    this.orbInnerB.textContent = '?';
    this.orbInnerA.style.color = '';
    this.orbInnerB.style.color = '';
    
    this.statusEl.textContent = 'Click "Prepare Bell State" to entangle the qubits.';
    this.statusEl.style.color = 'var(--text-secondary)';
  }
}

window.EntanglementDemo = EntanglementDemo;