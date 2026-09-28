import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { playSwordClash } from '../../utils/audio';

interface HologramOrbProps {
  isSpeaking: boolean;
  isListening: boolean;
  audioIntensity?: number;
  mode?: 'crimson' | 'cyan' | 'glitch' | 'amber';
  size?: number;
  isFocusActive?: boolean;
  isBackgroundMode?: boolean;
  cognitiveState?: string;
  onClick?: () => void;
}

export const HologramOrb: React.FC<HologramOrbProps> = ({
  isSpeaking,
  isListening,
  audioIntensity = 0.5,
  mode = 'crimson',
  size = 320,
  isFocusActive = false,
  isBackgroundMode = false,
  cognitiveState = 'STANDBY',
  onClick,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);

  // Shader Uniforms Ref
  const uniformsRef = useRef<{
    uTime: { value: number };
    uAudioLevel: { value: number };
    uMode: { value: number };
    uWinkProgress: { value: number }; // 0 to 1 for Deadpool's wink
    uMouseWorldPos: { value: THREE.Vector3 };
    uMouseRadius: { value: number };
    uMouseStrength: { value: number };
    uPulseSpeed: { value: number };
  }>({
    uTime: { value: 0 },
    uAudioLevel: { value: 0 },
    uMode: { value: 0 },
    uWinkProgress: { value: 0 },
    uMouseWorldPos: { value: new THREE.Vector3(0, 0, 0) },
    uMouseRadius: { value: 0.55 },
    uMouseStrength: { value: 0.0 },
    uPulseSpeed: { value: 1.0 },
  });

  // Cursor tracking & inertia state
  const mouseTrackingRef = useRef({
    targetRotX: 0,
    targetRotY: 0,
    currentRotX: 0,
    currentRotY: 0,
    normalizedX: 0,
    normalizedY: 0,
    isHovering: false,
    winkTimer: 0,
  });

  // Keep state-based uniforms synchronized
  useEffect(() => {
    let modeVal = 0; // Crimson Deadpool
    if (isListening || mode === 'cyan') modeVal = 1;
    else if (isFocusActive || mode === 'amber') modeVal = 2;

    uniformsRef.current.uMode.value = modeVal;
    uniformsRef.current.uPulseSpeed.value = isFocusActive ? 2.2 : isSpeaking ? 1.9 : isListening ? 1.4 : 1.0;
  }, [isSpeaking, isListening, isFocusActive, mode]);

  useEffect(() => {
    const targetAudio = isSpeaking
      ? Math.max(0.35, audioIntensity * 1.4)
      : isListening
      ? Math.max(0.18, audioIntensity * 1.1)
      : isFocusActive
      ? 0.28
      : 0.05;

    uniformsRef.current.uAudioLevel.value = targetAudio;
  }, [audioIntensity, isSpeaking, isListening, isFocusActive]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // ----------------------------------------------------------------
    // 1. Scene, Camera, Renderer Setup
    // ----------------------------------------------------------------
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(46, 1, 0.1, 1000);
    camera.position.set(0, 0, 3.4);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(size, size);
    renderer.setClearColor(0x000000, 0);

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // ----------------------------------------------------------------
    // 2. Anatomical Procedural Geometry Generation (~15,000 particles)
    // ----------------------------------------------------------------
    // Generates human skull structure: defined jawline, cheekbones, brow ridge, and cranial curvature
    const targetTotal = 15000;
    const positions: number[] = [];
    const basePositions: number[] = [];
    const normals: number[] = [];
    const randoms: number[] = []; // phase, speed, size
    const regions: number[] = []; // 0: Mask (#D01012), 1: Patch (#101010), 2: Eye lens (#FFFFFF), 3: Seam (#1a1a1a)
    const eyeSides: number[] = []; // -1: Left Eye, 1: Right Eye (winks on click!), 0: None

    // Anatomical shaping function for a point on the head
    const sampleSkull = (u: number, v: number): { x: number; y: number; z: number; nx: number; ny: number; nz: number } => {
      // u: longitude (-PI to PI), v: latitude (-PI/2 to PI/2)
      const cosV = Math.cos(v);
      const sinV = Math.sin(v);
      const cosU = Math.cos(u);
      const sinU = Math.sin(u);

      // Base Cranium Proportion (Human Skull Proportions)
      let rx = 0.86;
      let ry = 1.14;
      let rz = 0.98;

      // 1. Defined Jawline & Chin Taper
      // Below the nose level (v < -0.15)
      if (sinV < -0.12) {
        const jawFactor = Math.pow(Math.max(0, -sinV - 0.12) / 0.88, 1.15);
        // Taper sides inwards sharply towards chin
        rx *= 1.0 - jawFactor * 0.42;
        rz *= 1.0 - jawFactor * 0.28;

        // Front chin protrusion
        if (cosU > 0.4) {
          rz *= 1.0 + jawFactor * 0.18;
        }
      }

      // 2. Zygomatic Arches / Cheekbones Prominence
      // Lateral sides around v in [-0.1, 0.15]
      const isCheekLat = Math.abs(sinU) > 0.35 && Math.abs(sinU) < 0.85;
      if (isCheekLat && sinV > -0.12 && sinV < 0.18 && cosU > 0.15) {
        const cheekBump = Math.sin((sinV + 0.12) / 0.3 * Math.PI) * Math.sin((Math.abs(sinU) - 0.35) / 0.5 * Math.PI);
        rx *= 1.0 + cheekBump * 0.14;
        rz *= 1.0 + cheekBump * 0.12;
      }

      // 3. Superciliary Brow Ridge (Forehead bone above eyes)
      if (cosU > 0.35 && sinV > 0.08 && sinV < 0.32) {
        const browBump = Math.sin((sinV - 0.08) / 0.24 * Math.PI) * (cosU - 0.35) * 1.5;
        rz *= 1.0 + browBump * 0.11;
        ry *= 1.0 + browBump * 0.04;
      }

      // 4. Orbital Socket Recess (Eye sockets dip inwards)
      const eyeSocketX = Math.abs(sinU);
      if (cosU > 0.45 && eyeSocketX > 0.15 && eyeSocketX < 0.58 && sinV > -0.05 && sinV < 0.18) {
        const socketDepth = Math.sin((sinV + 0.05) / 0.23 * Math.PI) * Math.sin((eyeSocketX - 0.15) / 0.43 * Math.PI);
        rz *= 1.0 - socketDepth * 0.09;
      }

      // 5. Nasal Bridge Ridge
      if (Math.abs(sinU) < 0.14 && sinV > -0.15 && sinV < 0.12 && cosU > 0.8) {
        const noseBump = (1.0 - Math.abs(sinU) / 0.14) * Math.sin((sinV + 0.15) / 0.27 * Math.PI);
        rz *= 1.0 + noseBump * 0.14;
      }

      // 6. Occipital Bone (Back of skull rounding)
      if (cosU < -0.2) {
        rz *= 1.04;
      }

      const x = rx * cosV * sinU;
      const y = ry * sinV;
      const z = rz * cosV * cosU;

      // Calculate approximate outward normal
      const len = Math.sqrt(x * x + y * y + z * z) || 1.0;
      return { x, y, z, nx: x / len, ny: y / len, nz: z / len };
    };

    // Helper: Determine Deadpool Region
    // Returns: 0 = Mask Red (#D01012), 1 = Eye Patch Black (#101010), 2 = Eye Lens White (#FFFFFF), 3 = Seams
    const classifyPoint = (x: number, y: number, z: number): { region: number; eyeSide: number } => {
      // Front face threshold
      if (z > 0.22) {
        // Teardrop / Oval Eye Patches: Left centered at x = -0.31, Right at x = 0.31
        const side = x >= 0 ? 1 : -1;
        const cx = side * 0.31;
        const cy = 0.06;
        const tilt = side * 0.18; // outward flare

        const dx = x - cx;
        const dy = y - cy;
        const rx = dx * Math.cos(tilt) - dy * Math.sin(tilt);
        const ry = dx * Math.sin(tilt) + dy * Math.cos(tilt);

        // Teardrop patch equation (oval with slight vertical bias)
        const patchVal = (rx * rx) / 0.038 + (ry * ry) / 0.064;

        if (patchVal <= 1.05) {
          // Inside Antifaz / Eye Patch!
          // Now check for the sharp slanted white eye lens
          const lensTilt = side * 0.24;
          const lx = dx * Math.cos(lensTilt) - dy * Math.sin(lensTilt);
          const ly = dx * Math.sin(lensTilt) + dy * Math.cos(lensTilt);

          // Slanted lens slit
          const lensVal = (lx * lx) / 0.0085 + (ly * ly) / 0.0155;
          if (lensVal <= 1.0) {
            return { region: 2, eyeSide: side }; // White Lens
          }

          return { region: 1, eyeSide: side }; // Black Patch
        }

        // Center cranial seam line running down mask
        if (Math.abs(x) < 0.024 && y > -0.65) {
          return { region: 3, eyeSide: 0 };
        }

        // Defined Jawline perimeter seam
        if (y < -0.25 && Math.abs(Math.abs(x) - 0.42 * (1 + y * 0.5)) < 0.035) {
          return { region: 3, eyeSide: 0 };
        }
      }

      // Back of head center seam
      if (z < -0.2 && Math.abs(x) < 0.024) {
        return { region: 3, eyeSide: 0 };
      }

      return { region: 0, eyeSide: 0 }; // Deadpool Red Mask
    };

    // 1. Generate Main Head Points (Fibonacci distribution for perfectly uniform density)
    const phi = Math.PI * (3 - Math.sqrt(5));
    const mainHeadCount = 11500;

    for (let i = 0; i < mainHeadCount; i++) {
      const v = Math.asin(1 - (i / (mainHeadCount - 1)) * 2);
      const u = phi * i;

      const skull = sampleSkull(u, v);
      // Slight surface jitter to avoid unnatural moiré patterns
      const jitter = 0.985 + Math.random() * 0.03;
      const x = skull.x * jitter;
      const y = skull.y * jitter;
      const z = skull.z * jitter;

      const { region, eyeSide } = classifyPoint(x, y, z);

      positions.push(x, y, z);
      basePositions.push(x, y, z);
      normals.push(skull.nx, skull.ny, skull.nz);

      // Random attributes: phase, oscillation speed, size variance
      randoms.push(
        Math.random() * Math.PI * 2,
        0.7 + Math.random() * 1.3,
        region === 2 ? 1.7 : region === 1 ? 1.1 : 1.0
      );

      regions.push(region);
      eyeSides.push(eyeSide);
    }

    // 2. High-Density Concentration for Deadpool's Eyes (Sharp piercing gaze)
    const eyeDetailPoints = 2200;
    for (let i = 0; i < eyeDetailPoints; i++) {
      const side = i % 2 === 0 ? 1 : -1;
      // Parametric slanted eye shape
      const u = (Math.random() - 0.5) * 2;
      const v = (Math.random() - 0.5) * 2;
      if (u * u + v * v > 1.0) continue;

      const tilt = side * 0.24;
      const lx = u * 0.088;
      const ly = v * 0.118;
      const dx = lx * Math.cos(-tilt) - ly * Math.sin(-tilt);
      const dy = lx * Math.sin(-tilt) + ly * Math.cos(-tilt);

      const ex = side * 0.31 + dx;
      const ey = 0.06 + dy;
      const ez = 0.84 + (Math.random() - 0.5) * 0.03;

      const nx = side * 0.3;
      const ny = 0.1;
      const nz = 0.95;

      positions.push(ex, ey, ez);
      basePositions.push(ex, ey, ez);
      normals.push(nx, ny, nz);
      randoms.push(Math.random() * Math.PI * 2, 1.2, 2.2);
      regions.push(2); // White Eye Lens
      eyeSides.push(side);
    }

    // 3. Dense Edge Outline Points for Black Patches (Crisp leather boundary)
    const patchOutlineCount = 1400;
    for (let i = 0; i < patchOutlineCount; i++) {
      const side = i % 2 === 0 ? 1 : -1;
      const theta = Math.random() * Math.PI * 2;
      const tilt = side * 0.18;
      const r = 0.96 + Math.random() * 0.12;

      const rx = Math.cos(theta) * Math.sqrt(0.038) * r;
      const ry = Math.sin(theta) * Math.sqrt(0.064) * r;

      const dx = rx * Math.cos(-tilt) - ry * Math.sin(-tilt);
      const dy = rx * Math.sin(-tilt) + ry * Math.cos(-tilt);

      const px = side * 0.31 + dx;
      const py = 0.06 + dy;
      const pz = 0.81 + (Math.random() - 0.5) * 0.03;

      positions.push(px, py, pz);
      basePositions.push(px, py, pz);
      normals.push(side * 0.3, 0.1, 0.94);
      randoms.push(Math.random() * Math.PI * 2, 0.9, 1.3);
      regions.push(1); // Black Patch
      eyeSides.push(side);
    }

    // 4. Subtle Distant Floating Dust Particles (~600 points)
    const dustCount = 650;
    const dustPositions = new Float32Array(dustCount * 3);
    const dustSpeeds = new Float32Array(dustCount);
    for (let i = 0; i < dustCount; i++) {
      dustPositions[i * 3] = (Math.random() - 0.5) * 6.5;
      dustPositions[i * 3 + 1] = (Math.random() - 0.5) * 6.5;
      dustPositions[i * 3 + 2] = -1.2 - Math.random() * 3.5;
      dustSpeeds[i] = 0.2 + Math.random() * 0.5;
    }
    const dustGeometry = new THREE.BufferGeometry();
    dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));

    const dustMaterial = new THREE.PointsMaterial({
      color: 0x888888,
      size: 0.025,
      transparent: true,
      opacity: 0.25,
      blending: THREE.AdditiveBlending,
    });
    const dustPointCloud = new THREE.Points(dustGeometry, dustMaterial);
    scene.add(dustPointCloud);

    // Create Main Head Buffer Geometry
    const headGeometry = new THREE.BufferGeometry();
    headGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    headGeometry.setAttribute('basePosition', new THREE.Float32BufferAttribute(basePositions, 3));
    headGeometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    headGeometry.setAttribute('aRandom', new THREE.Float32BufferAttribute(randoms, 3));
    headGeometry.setAttribute('aRegion', new THREE.Float32BufferAttribute(regions, 1));
    headGeometry.setAttribute('aEyeSide', new THREE.Float32BufferAttribute(eyeSides, 1));

    // ----------------------------------------------------------------
    // 3. Custom GLSL Shader (Soft Circular Particles + Perlin Oscillation + Cursor Repulsion)
    // ----------------------------------------------------------------
    const vertexShader = `
      uniform float uTime;
      uniform float uAudioLevel;
      uniform float uPulseSpeed;
      uniform float uWinkProgress;
      uniform vec3 uMouseWorldPos;
      uniform float uMouseRadius;
      uniform float uMouseStrength;

      attribute vec3 basePosition;
      attribute vec3 aRandom;
      attribute float aRegion;
      attribute float aEyeSide;

      varying vec3 vPosition;
      varying vec3 vNormal;
      varying float vRegion;
      varying float vDepth;
      varying float vAudio;

      // 3D Simplex-style noise for organic holographic shimmering
      vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
      vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

      float snoise(vec3 v) {
        const vec2 C = vec2(1.0/6.0, 1.0/3.0);
        const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
        vec3 i  = floor(v + dot(v, C.yyy));
        vec3 x0 = v - i + dot(i, C.xxx);
        vec3 g = step(x0.yzx, x0.xyz);
        vec3 l = 1.0 - g;
        vec3 i1 = min(g.xyz, l.zxy);
        vec3 i2 = max(g.xyz, l.zxy);
        vec3 x1 = x0 - i1 + C.xxx;
        vec3 x2 = x0 - i2 + C.yyy;
        vec3 x3 = x0 - D.yyy;
        i = mod289(i);
        vec4 p = permute(permute(permute(
                  i.z + vec4(0.0, i1.z, i2.z, 1.0))
                + i.y + vec4(0.0, i1.y, i2.y, 1.0))
                + i.x + vec4(0.0, i1.x, i2.x, 1.0));
        float n_ = 0.142857142857;
        vec3 ns = n_ * D.wyz - D.xzx;
        vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
        vec4 x_ = floor(j * ns.z);
        vec4 y_ = floor(j - 7.0 * x_);
        vec4 x = x_ *ns.x + ns.yyyy;
        vec4 y = y_ *ns.x + ns.yyyy;
        vec4 h = 1.0 - abs(x) - abs(y);
        vec4 b0 = vec4(x.xy, y.xy);
        vec4 b1 = vec4(x.zw, y.zw);
        vec4 s0 = floor(b0)*2.0 + 1.0;
        vec4 s1 = floor(b1)*2.0 + 1.0;
        vec4 sh = -step(h, vec4(0.0));
        vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
        vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
        vec3 p0 = vec3(a0.xy, h.x);
        vec3 p1 = vec3(a0.zw, h.y);
        vec3 p2 = vec3(a1.xy, h.z);
        vec3 p3 = vec3(a1.zw, h.w);
        vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
        p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
        vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
        m = m * m;
        return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
      }

      void main() {
        vRegion = aRegion;
        vNormal = normal;
        vAudio = uAudioLevel;

        float phase = aRandom.x;
        float speed = aRandom.y;
        float sizeScale = aRandom.z;

        vec3 pos = basePosition;

        // 1. Deadpool Comic Wink / Blink (Right Eye vertical compression)
        if (aEyeSide > 0.5 && uWinkProgress > 0.001) {
          // Compress right eye and patch vertically towards center y = 0.06
          float eyeCenterY = 0.06;
          float squash = 1.0 - uWinkProgress * 0.88;
          pos.y = eyeCenterY + (pos.y - eyeCenterY) * squash;
        }

        // 2. Subtle Perlin/Simplex Holographic Noise Oscillation
        float noise = snoise(pos * 2.8 + vec3(uTime * 0.35 * uPulseSpeed));
        pos += normal * (noise * 0.022);

        // 3. Audio Level Expansion (Pulsing living energy field)
        float audioBump = uAudioLevel * (0.08 + sin(uTime * 8.0 + phase * 3.0) * 0.04);
        pos += normal * audioBump;

        // 4. Cursor 3D Proximity Spring Repulsion
        if (uMouseStrength > 0.01) {
          vec3 toMouse = pos - uMouseWorldPos;
          float dist = length(toMouse);
          if (dist < uMouseRadius && dist > 0.001) {
            float repulse = (1.0 - dist / uMouseRadius) * uMouseStrength * 0.22;
            pos += normalize(toMouse) * repulse;
          }
        }

        vPosition = pos;

        // Perspective Projection
        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        gl_Position = projectionMatrix * mvPosition;

        // Depth cueing
        float distToCam = -mvPosition.z;
        vDepth = clamp((3.4 - distToCam) / 1.8, 0.0, 1.0);

        // Particle Size (Circular, larger for glowing eyes)
        float basePtSize = (11.0 * sizeScale + uAudioLevel * 14.0) / distToCam;
        if (aRegion > 1.5 && aRegion < 2.5) {
          basePtSize *= 1.7; // White eye lens glow
        } else if (aRegion > 0.5 && aRegion < 1.5) {
          basePtSize *= 1.15; // Black eye patch
        }

        gl_PointSize = clamp(basePtSize, 1.2, 34.0);
      }
    `;

    const fragmentShader = `
      uniform float uTime;
      uniform int uMode; // 0: Crimson, 1: Cyan, 2: Amber
      uniform float uAudioLevel;

      varying vec3 vPosition;
      varying vec3 vNormal;
      varying float vRegion;
      varying float vDepth;
      varying float vAudio;

      void main() {
        // Soft Circular Particles with Radial Falloff
        vec2 coord = gl_PointCoord - vec2(0.5);
        float distSq = dot(coord, coord);
        if (distSq > 0.25) discard;

        // Smooth gaussian-like radial alpha
        float alpha = clamp(1.0 - sqrt(distSq) * 2.0, 0.0, 1.0);
        alpha = pow(alpha, 1.35);

        vec3 color;

        // Region 0: Mask (Deadpool Red #D01012)
        // Region 1: Antifaz / Eye Patch (Matte Black #101010)
        // Region 2: Eye Lens (Bright White #FFFFFF with glow)
        // Region 3: Details / Seams (#1a1a1a)

        if (uMode == 1) {
          // Tactical Cyan Energy (Voice Active)
          vec3 cyan = vec3(0.04, 0.72, 0.85);
          vec3 darkCyan = vec3(0.01, 0.25, 0.35);
          if (vRegion > 1.5 && vRegion < 2.5) {
            color = vec3(0.85, 1.0, 1.0); // Bright eye
            alpha = clamp(alpha * 1.6, 0.0, 1.0);
          } else if (vRegion > 0.5 && vRegion < 1.5) {
            color = vec3(0.02, 0.08, 0.12);
          } else {
            color = mix(darkCyan, cyan, vDepth * 0.9);
          }
        } else if (uMode == 2) {
          // Amber Gold Energy (Continuous Focus)
          vec3 gold = vec3(0.96, 0.62, 0.04);
          vec3 darkGold = vec3(0.45, 0.22, 0.02);
          if (vRegion > 1.5 && vRegion < 2.5) {
            color = vec3(1.0, 0.98, 0.75);
            alpha = clamp(alpha * 1.6, 0.0, 1.0);
          } else if (vRegion > 0.5 && vRegion < 1.5) {
            color = vec3(0.08, 0.05, 0.01);
          } else {
            color = mix(darkGold, gold, vDepth * 0.9);
          }
        } else {
          // True Deadpool Signature Palette
          vec3 deadpoolRed = vec3(0.816, 0.063, 0.071); // #D01012
          vec3 deepShadowRed = vec3(0.42, 0.02, 0.035);
          vec3 matteBlack = vec3(0.063, 0.063, 0.063);  // #101010
          vec3 seamDark = vec3(0.10, 0.10, 0.10);      // #1a1a1a
          vec3 brightWhite = vec3(1.0, 1.0, 1.0);      // #FFFFFF

          if (vRegion > 1.5 && vRegion < 2.5) {
            // Ojos / Lentes: Blanco brillante con glow
            color = brightWhite;
            alpha = clamp(alpha * 1.8, 0.0, 1.0);
          } else if (vRegion > 0.5 && vRegion < 1.5) {
            // Antifaz / Secciones oculares: Negro mate
            color = matteBlack;
            alpha = clamp(alpha * 1.25, 0.0, 0.95);
          } else if (vRegion > 2.5) {
            // Costuras y líneas oscuras
            color = seamDark;
          } else {
            // Máscara: Rojo Deadpool con sombreado de profundidad
            color = mix(deepShadowRed, deadpoolRed, 0.45 + vDepth * 0.55);
          }
        }

        // Hot center glare on white lenses
        if (vRegion > 1.5 && vRegion < 2.5) {
          float coreHot = 1.0 - smoothstep(0.0, 0.12, distSq);
          color += vec3(0.35) * coreHot;
        }

        // Final depth-based opacity
        alpha *= (0.42 + vDepth * 0.58 + vAudio * 0.25);

        gl_FragColor = vec4(color, alpha);
      }
    `;

    const headMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: uniformsRef.current.uTime,
        uAudioLevel: uniformsRef.current.uAudioLevel,
        uMode: uniformsRef.current.uMode,
        uWinkProgress: uniformsRef.current.uWinkProgress,
        uMouseWorldPos: uniformsRef.current.uMouseWorldPos,
        uMouseRadius: uniformsRef.current.uMouseRadius,
        uMouseStrength: uniformsRef.current.uMouseStrength,
        uPulseSpeed: uniformsRef.current.uPulseSpeed,
      },
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const headPointsMesh = new THREE.Points(headGeometry, headMaterial);
    scene.add(headPointsMesh);

    // ----------------------------------------------------------------
    // 4. Responsive Resize Observer
    // ----------------------------------------------------------------
    const handleResize = () => {
      if (!container) return;
      const width = container.clientWidth || size;
      const height = container.clientHeight || size;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // ----------------------------------------------------------------
    // 5. 60 FPS Render Loop (Lerp Cursor Tracking + Spring Physics)
    // ----------------------------------------------------------------
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const time = clock.getElapsedTime();
      uniformsRef.current.uTime.value = time;

      const tracking = mouseTrackingRef.current;

      // Wink animation update (spring damping)
      if (tracking.winkTimer > 0) {
        tracking.winkTimer = Math.max(0, tracking.winkTimer - delta * 3.5);
        // Sinusoidal wink squash & spring back
        const winkVal = Math.sin((1.0 - tracking.winkTimer) * Math.PI);
        uniformsRef.current.uWinkProgress.value = Math.max(0, winkVal);
      } else {
        uniformsRef.current.uWinkProgress.value = 0;
      }

      // Cursor Tracking Limits:
      // Y-axis max 35 degrees = 0.61 rad
      // X-axis max 20 degrees = 0.35 rad
      const maxRotY = THREE.MathUtils.degToRad(35); // ~0.61 rad
      const maxRotX = THREE.MathUtils.degToRad(20); // ~0.35 rad

      tracking.targetRotY = tracking.normalizedX * maxRotY;
      tracking.targetRotX = -tracking.normalizedY * maxRotX;

      // Smooth Lerp with factor 0.05 for organic anatomical weight
      tracking.currentRotX = THREE.MathUtils.lerp(tracking.currentRotX, tracking.targetRotX, 0.05);
      tracking.currentRotY = THREE.MathUtils.lerp(tracking.currentRotY, tracking.targetRotY, 0.05);

      headPointsMesh.rotation.x = tracking.currentRotX;
      headPointsMesh.rotation.y = tracking.currentRotY;

      // Mouse repulsion strength decay when cursor leaves
      if (tracking.isHovering) {
        uniformsRef.current.uMouseStrength.value = THREE.MathUtils.lerp(
          uniformsRef.current.uMouseStrength.value,
          1.0,
          0.1
        );
      } else {
        uniformsRef.current.uMouseStrength.value = THREE.MathUtils.lerp(
          uniformsRef.current.uMouseStrength.value,
          0.0,
          0.1
        );
      }

      // Animate background dust particles
      const dPos = dustGeometry.attributes.position.array as Float32Array;
      for (let i = 0; i < dustCount; i++) {
        dPos[i * 3 + 1] += dustSpeeds[i] * delta * 0.15;
        // Wrap around
        if (dPos[i * 3 + 1] > 3.2) dPos[i * 3 + 1] = -3.2;
      }
      dustGeometry.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    // ----------------------------------------------------------------
    // 6. Cleanup
    // ----------------------------------------------------------------
    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      headGeometry.dispose();
      headMaterial.dispose();
      dustGeometry.dispose();
      dustMaterial.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [size]);

  // ----------------------------------------------------------------
  // Global Full-Screen Mouse Tracking (Tracks across entire screen)
  // ----------------------------------------------------------------
  useEffect(() => {
    const handleGlobalPointerMove = (e: PointerEvent) => {
      const container = mountRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Normalized relative to head center across entire browser viewport
      const halfWinW = Math.max(1, window.innerWidth / 2);
      const halfWinH = Math.max(1, window.innerHeight / 2);
      const normX = (e.clientX - centerX) / halfWinW;
      const normY = -(e.clientY - centerY) / halfWinH;

      const tracking = mouseTrackingRef.current;
      tracking.normalizedX = Math.max(-1, Math.min(1, normX));
      tracking.normalizedY = Math.max(-1, Math.min(1, normY));
      tracking.isHovering = true;

      // Approximate 3D world coordinates across full screen
      uniformsRef.current.uMouseWorldPos.value.set(normX * 1.5, normY * 1.5, 0.45);
    };

    const handleGlobalPointerLeave = () => {
      const tracking = mouseTrackingRef.current;
      tracking.normalizedX = 0;
      tracking.normalizedY = 0;
      tracking.isHovering = false;
    };

    window.addEventListener('pointermove', handleGlobalPointerMove, { passive: true });
    window.addEventListener('pointerleave', handleGlobalPointerLeave, { passive: true });

    return () => {
      window.removeEventListener('pointermove', handleGlobalPointerMove);
      window.removeEventListener('pointerleave', handleGlobalPointerLeave);
    };
  }, []);

  const handleClick = () => {
    playSwordClash();
    // Trigger Wade's iconic comic wink on right eye
    mouseTrackingRef.current.winkTimer = 1.0;
    if (onClick) onClick();
  };

  return (
    <div
      ref={mountRef}
      onClick={handleClick}
      style={{ width: size, height: size }}
      className="relative flex items-center justify-center select-none cursor-pointer touch-none drop-shadow-[0_0_54px_rgba(208,16,18,0.38)] transition-transform hover:scale-[1.02] active:scale-[0.98]"
      title="Deadpool 3D Point Cloud (Sigue al cursor por toda la pantalla con lerp 0.05, haz clic para que te guiñe el ojo)"
    />
  );
};
