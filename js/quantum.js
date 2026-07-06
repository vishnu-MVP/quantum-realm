/**
 * Quantum Simulator — Real 2x2 and 4x4 matrix math for quantum gates
 * Implements: H, X, Y, Z, S, T, CNOT
 */

// Complex number helpers
const Complex = {
  create(re, im) { return { re, im }; },
  add(a, b) { return { re: a.re + b.re, im: a.im + b.im }; },
  mul(a, b) { return { re: a.re * b.re - a.im * b.im, im: a.re * b.im + a.im * b.re }; },
  scale(a, s) { return { re: a.re * s, im: a.im * s }; },
  abs(a) { return Math.sqrt(a.re * a.re + a.im * a.im); },
  conj(a) { return { re: a.re, im: -a.im }; },
  zero() { return { re: 0, im: 0 }; },
  one() { return { re: 1, im: 0 }; }
};

// 2x2 complex matrix * 2x1 complex vector
function matVec2(M, v) {
  return {
    0: Complex.add(Complex.mul(M[0][0], v[0]), Complex.mul(M[0][1], v[1])),
    1: Complex.add(Complex.mul(M[1][0], v[0]), Complex.mul(M[1][1], v[1]))
  };
}

// 4x4 complex matrix * 4x1 complex vector (for two-qubit gates)
function matVec4(M, v) {
  const result = [Complex.zero(), Complex.zero(), Complex.zero(), Complex.zero()];
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      result[i] = Complex.add(result[i], Complex.mul(M[i][j], v[j]));
    }
  }
  return result;
}

// Kronecker product of two 2x2 matrices → 4x4
function kron2(A, B) {
  const M = [[null,null,null,null],[null,null,null,null],[null,null,null,null],[null,null,null,null]];
  for (let i = 0; i < 2; i++) {
    for (let j = 0; j < 2; j++) {
      for (let k = 0; k < 2; k++) {
        for (let l = 0; l < 2; l++) {
          M[i*2+k][j*2+l] = Complex.mul(A[i][j], B[k][l]);
        }
      }
    }
  }
  return M;
}

// Quantum gate matrices (complex)
const Gates = {
  H: [
    [Complex.create(1/Math.SQRT2, 0), Complex.create(1/Math.SQRT2, 0)],
    [Complex.create(1/Math.SQRT2, 0), Complex.create(-1/Math.SQRT2, 0)]
  ],
  X: [
    [Complex.zero(), Complex.one()],
    [Complex.one(), Complex.zero()]
  ],
  Y: [
    [Complex.zero(), Complex.create(0, -1)],
    [Complex.create(0, 1), Complex.zero()]
  ],
  Z: [
    [Complex.one(), Complex.zero()],
    [Complex.zero(), Complex.create(-1, 0)]
  ],
  S: [
    [Complex.one(), Complex.zero()],
    [Complex.zero(), Complex.create(0, 1)]
  ],
  T: [
    [Complex.one(), Complex.zero()],
    [Complex.zero(), Complex.create(Math.cos(Math.PI/4), Math.sin(Math.PI/4))]
  ]
};

// CNOT gate (4x4) — control is qubit 0, target is qubit 1
const CNOT = [
  [Complex.one(), Complex.zero(), Complex.zero(), Complex.zero()],
  [Complex.zero(), Complex.one(), Complex.zero(), Complex.zero()],
  [Complex.zero(), Complex.zero(), Complex.zero(), Complex.one()],
  [Complex.zero(), Complex.zero(), Complex.one(), Complex.zero()]
];

// Single-qubit state: { 0: Complex, 1: Complex }
function createQubitState() {
  return { 0: Complex.one(), 1: Complex.zero() }; // |0⟩
}

// Apply a single-qubit gate
function applyGate(state, gateName) {
  const M = Gates[gateName];
  if (!M) return state;
  return matVec2(M, state);
}

// Two-qubit state: [Complex, Complex, Complex, Complex] for |00⟩, |01⟩, |10⟩, |11⟩
function createTwoQubitState() {
  return [Complex.one(), Complex.zero(), Complex.zero(), Complex.zero()];
}

// Apply CNOT to two-qubit state
function applyCNOT(state) {
  return matVec4(CNOT, state);
}

// Apply single gate to qubit A (first qubit) in two-qubit system
function applyGateToQubitA(state, gateName) {
  const M = kron2(Gates[gateName], [[Complex.one(), Complex.zero()], [Complex.zero(), Complex.one()]]);
  return matVec4(M, state);
}

// Apply single gate to qubit B (second qubit) in two-qubit system
function applyGateToQubitB(state, gateName) {
  const M = kron2([[Complex.one(), Complex.zero()], [Complex.zero(), Complex.one()]], Gates[gateName]);
  return matVec4(M, state);
}

// Get probabilities from single-qubit state
function getProbabilities(state) {
  const p0 = Complex.abs(state[0]);
  const p1 = Complex.abs(state[1]);
  const total = p0 + p1;
  return { 0: p0 * p0, 1: p1 * p1 };
}

// Get probabilities from two-qubit state
function getTwoQubitProbabilities(state) {
  return state.map(c => {
    const a = Complex.abs(c);
    return a * a;
  });
}

// Measure a single qubit — collapses to 0 or 1
function measure(state) {
  const probs = getProbabilities(state);
  const r = Math.random();
  const result = r < probs[0] ? 0 : 1;
  // Collapse
  const collapsed = { 0: Complex.zero(), 1: Complex.zero() };
  collapsed[result] = Complex.one();
  return { result, collapsed };
}

// Measure a two-qubit system
function measureTwoQubit(state) {
  const probs = getTwoQubitProbabilities(state);
  const r = Math.random();
  let cumulative = 0;
  let result = 0;
  for (let i = 0; i < 4; i++) {
    cumulative += probs[i];
    if (r < cumulative) { result = i; break; }
  }
  // Collapse
  const collapsed = [Complex.zero(), Complex.zero(), Complex.zero(), Complex.zero()];
  collapsed[result] = Complex.one();
  return { result, collapsed };
}

// Convert state to Bloch sphere coordinates (theta, phi)
function stateToBloch(state) {
  // |ψ⟩ = cos(θ/2)|0⟩ + e^(iφ)sin(θ/2)|1⟩
  const a = state[0];
  const b = state[1];
  const magA = Complex.abs(a);
  const magB = Complex.abs(b);
  
  let theta, phi;
  
  if (magB < 1e-10) {
    theta = 0;
    phi = 0;
  } else if (magA < 1e-10) {
    theta = Math.PI;
    phi = 0;
  } else {
    theta = 2 * Math.atan2(magB, magA);
    // φ = arg(b) - arg(a)
    const argA = Math.atan2(a.im, a.re);
    const argB = Math.atan2(b.im, b.re);
    phi = argB - argA;
  }
  
  // Bloch vector
  const x = Math.sin(theta) * Math.cos(phi);
  const y = Math.sin(theta) * Math.sin(phi);
  const z = Math.cos(theta);
  
  return { theta, phi, x, y, z };
}

// Format state vector for display
function formatState(state) {
  const a = state[0];
  const b = state[1];
  const magA = Complex.abs(a);
  const magB = Complex.abs(b);
  
  let parts = [];
  if (magA > 0.001) {
    parts.push(`${magA.toFixed(3)}|0⟩`);
  }
  if (magB > 0.001) {
    const phase = Math.atan2(b.im, b.re) - Math.atan2(a.im, a.re);
    let coeff = magB.toFixed(3);
    if (Math.abs(phase) > 0.01) {
      const sign = phase > 0 ? '+' : '-';
      parts.push(`${sign} ${magB.toFixed(3)}e^(i${phase.toFixed(2)})|1⟩`);
    } else {
      parts.push(`+ ${magB.toFixed(3)}|1⟩`);
    }
  }
  
  if (parts.length === 0) parts.push('0');
  return parts.join(' ');
}

// Prepare Bell state |Φ+⟩ = (|00⟩ + |11⟩) / √2
function prepareBellState() {
  let state = createTwoQubitState();
  state = applyGateToQubitA(state, 'H');
  state = applyCNOT(state);
  return state;
}

// Export for use in other modules
window.QuantumSim = {
  Complex,
  createQubitState,
  applyGate,
  createTwoQubitState,
  applyCNOT,
  applyGateToQubitA,
  applyGateToQubitB,
  getProbabilities,
  getTwoQubitProbabilities,
  measure,
  measureTwoQubit,
  stateToBloch,
  formatState,
  prepareBellState,
  Gates
};