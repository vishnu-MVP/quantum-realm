/**
 * Custom GLSL Shaders for quantum visualizations
 */

// Wave function shader — animated quantum field background
const waveVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const waveFragmentShader = `
  uniform float uTime;
  uniform vec2 uResolution;
  varying vec2 vUv;

  // Simplex noise approximation
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 5; i++) {
      v += a * noise(p);
      p *= 2.0;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 uv = vUv;
    vec2 p = uv * 3.0;
    
    // Animated wave layers
    float wave1 = sin(p.x * 2.0 + uTime * 0.3) * cos(p.y * 2.0 + uTime * 0.2);
    float wave2 = sin(length(p - vec2(0.5)) * 4.0 - uTime * 0.5);
    float n = fbm(p + uTime * 0.05);
    
    // Quantum interference pattern
    float interference = sin(wave1 * 3.0 + wave2 * 2.0 + n * 5.0);
    
    // Color gradient: deep purple to cyan
    vec3 colorDeep = vec3(0.02, 0.02, 0.06);
    vec3 colorPurple = vec3(0.35, 0.15, 0.55);
    vec3 colorCyan = vec3(0.0, 0.6, 0.85);
    vec3 colorElectric = vec3(0.2, 0.05, 0.5);
    
    vec3 col = mix(colorDeep, colorElectric, n * 0.5);
    col = mix(col, colorPurple, interference * 0.3 + 0.3);
    col = mix(col, colorCyan, pow(interference, 2.0) * 0.4);
    
    // Vignette
    float vig = 1.0 - length(uv - 0.5) * 0.8;
    col *= vig;
    
    // Subtle glow at center
    float centerGlow = 1.0 - smoothstep(0.0, 0.5, length(uv - 0.5));
    col += colorCyan * centerGlow * 0.08 * (sin(uTime * 0.5) * 0.5 + 0.5);
    
    gl_FragColor = vec4(col, 1.0);
  }
`;

// Particle vertex shader
const particleVertexShader = `
  attribute float aSize;
  attribute vec3 aColor;
  attribute float aPhase;
  uniform float uTime;
  uniform float uPixelRatio;
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vColor = aColor;
    
    vec3 pos = position;
    // Gentle floating motion
    pos.y += sin(uTime * 0.5 + aPhase) * 0.3;
    pos.x += cos(uTime * 0.3 + aPhase * 1.3) * 0.2;
    pos.z += sin(uTime * 0.4 + aPhase * 0.7) * 0.2;
    
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    
    // Size attenuation
    gl_PointSize = aSize * uPixelRatio * (300.0 / -mvPosition.z);
    
    vAlpha = 0.5 + 0.5 * sin(uTime + aPhase * 2.0);
  }
`;

// Particle fragment shader
const particleFragmentShader = `
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    // Circular particle with soft edge
    vec2 center = gl_PointCoord - 0.5;
    float dist = length(center);
    if (dist > 0.5) discard;
    
    float alpha = (1.0 - smoothstep(0.2, 0.5, dist)) * vAlpha;
    gl_FragColor = vec4(vColor, alpha * 0.8);
  }
`;

// Export
window.Shaders = {
  waveVertexShader,
  waveFragmentShader,
  particleVertexShader,
  particleFragmentShader
};