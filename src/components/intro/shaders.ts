/**
 * GLSL shaders for the Event Horizon cinematic intro.
 *
 * Four shaders drive the entire particle system:
 * - velocityShader: GPGPU — computes forces (gravity, spiral, flatten, collapse, brownian)
 * - positionShader: GPGPU — integrates velocity into position
 * - renderVertexShader: Reads GPGPU textures, outputs point size with depth attenuation
 * - renderFragmentShader: Soft circular points, color from temperature, speed-based brightness
 */

// ---------------------------------------------------------------------------
// GPGPU: Velocity computation
// ---------------------------------------------------------------------------
export const velocityShader = /* glsl */ `
  uniform float uDelta;
  uniform float uGravity;
  uniform float uDiskFlatten;
  uniform float uCollapseForce;
  uniform float uBrownian;
  uniform float uMaxSpeed;
  uniform float uTime;
  uniform float uRepulsion;
  uniform float uDrag;
  uniform float uSpiral;
  uniform float uCenterDampen;

  // Hash-based pseudo-random (deterministic per texel + time)
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  vec3 randomDir(vec2 seed) {
    float a = hash(seed) * 6.2831853;
    float b = hash(seed + 0.1) * 2.0 - 1.0;
    float r = sqrt(1.0 - b * b);
    return vec3(r * cos(a), b, r * sin(a));
  }

  // Curl noise — divergence-free swirl for organic bloom scatter
  vec3 curlNoise(vec3 p) {
    vec3 a = sin(p * 1.1 + vec3(0.0, 2.1, 4.2));
    vec3 b = sin(p.yzx * 0.9 + vec3(1.7, 3.8, 5.9));
    return cross(a, b);
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec4 pos = texture2D(texturePosition, uv);
    vec4 vel = texture2D(textureVelocity, uv);

    vec3 p = pos.xyz;
    vec3 v = vel.xyz;

    // --- Gravitational pull toward origin (drain model + center well) ---
    // Per-particle hash breaks the uniform shell — no perfect circle outline.
    vec3 toCenter = -p;
    float dist = length(toCenter);
    float gravHash = 0.7 + hash(uv * 1000.0) * 0.6;  // 0.7–1.3x gravity variation
    // Base gravity + center well: particles within r<3 feel 2x pull for dense core
    float centerBoost = 1.0 + smoothstep(3.0, 0.5, dist);
    v += normalize(toCenter + 0.001) * uGravity * gravHash * centerBoost * uDelta;

    // --- Cyclonic spiral component ---
    // uSpiral controls tangential intensity independently from gravity.
    // 1/r^0.7 profile: steeper falloff pulls particles inward faster,
    // forming a denser center ball instead of loose spiral arms.
    if (uSpiral > 0.001) {
      float tangentialMag = uSpiral / (pow(dist, 0.7) + 0.2);
      vec3 tangent = normalize(cross(toCenter, vec3(0.0, 0.0, 1.0)) + 0.001);
      v += tangent * tangentialMag * smoothstep(0.3, 6.0, dist) * uDelta;
    }

    // --- Center tangential damping ---
    // Kills orbital angular momentum near the core so particles actually
    // fall into the center instead of orbiting with a hollow void.
    if (uCenterDampen > 0.001 && dist < 5.0) {
      vec3 radial = normalize(toCenter + 0.001);
      vec3 tangential = v - radial * dot(v, radial); // velocity component perpendicular to radial
      float dampenStrength = uCenterDampen * smoothstep(5.0, 0.5, dist);
      v -= tangential * dampenStrength * uDelta;
    }

    // --- Disk flattening (push Z toward 0 — camera-facing plane) ---
    v.z -= p.z * uDiskFlatten * uDelta;

    // --- Collapse force (strong pull to exact center) ---
    if (uCollapseForce > 0.01) {
      v += toCenter * uCollapseForce * uDelta / (dist + 0.1);
    }

    // --- Brownian drift ---
    vec2 seed = uv * 1000.0 + uTime;
    v += randomDir(seed) * uBrownian;

    // --- Repulsion (post-collapse bloom with curl noise) ---
    if (uRepulsion > 0.01) {
      float particleHash = hash(uv * 1000.0);
      // Near center, use per-particle random direction (avoids directional bias)
      vec3 randOut = randomDir(uv * 500.0 + 0.7);
      vec3 posOut = normalize(p + 0.001);
      // Blend: random when near center, positional when spread out
      float blend = smoothstep(0.0, 3.0, dist);
      vec3 outward = normalize(mix(randOut, posOut, blend));
      float repelMag = uRepulsion * (0.5 + particleHash * 1.5);
      vec3 curl = curlNoise(p * 0.3 + uTime * 0.05);
      v += (outward * repelMag + curl * repelMag * 0.4) * uDelta;
    }

    // --- Clamp speed ---
    float speed = length(v);
    if (speed > uMaxSpeed) {
      v = v / speed * uMaxSpeed;
    }

    // --- Drag (bleeds orbital energy for spiral infall) ---
    v *= uDrag;

    gl_FragColor = vec4(v, 1.0);
  }
`;

// ---------------------------------------------------------------------------
// GPGPU: Position integration
// ---------------------------------------------------------------------------
export const positionShader = /* glsl */ `
  uniform float uDelta;

  void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec4 pos = texture2D(texturePosition, uv);
    vec4 vel = texture2D(textureVelocity, uv);

    vec3 newPos = pos.xyz + vel.xyz * uDelta;

    gl_FragColor = vec4(newPos, pos.w);
  }
`;

// ---------------------------------------------------------------------------
// Render: Vertex shader — reads GPGPU textures, outputs point with depth attenuation
// ---------------------------------------------------------------------------
export const renderVertexShader = /* glsl */ `
  uniform sampler2D uPositionTexture;
  uniform sampler2D uVelocityTexture;
  uniform float uPointSize;

  attribute vec2 reference;

  varying float vSpeed;
  varying float vDepth;

  // Per-particle hash for stable random size
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  void main() {
    vec4 posData = texture2D(uPositionTexture, reference);
    vec4 velData = texture2D(uVelocityTexture, reference);

    vec3 pos = posData.xyz;
    vSpeed = length(velData.xyz);

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    vDepth = -mvPosition.z;

    // Per-particle size class — creates galaxy-like depth variation.
    // ~5% are "bright stars" (2.5-4x), ~20% medium (1.2-2.5x), rest are dust (0.4-1.2x)
    float sizeHash = hash(reference * 1000.0);
    float sizeClass = sizeHash > 0.95 ? mix(2.5, 4.0, (sizeHash - 0.95) * 20.0)
                    : sizeHash > 0.75 ? mix(1.2, 2.5, (sizeHash - 0.75) * 5.0)
                    : mix(0.4, 1.2, sizeHash / 0.75);

    // Speed scaling — high floor so ambient (slow) particles stay full size
    float speedScale = 0.7 + 0.3 * smoothstep(0.0, 0.5, vSpeed);

    // Point size with depth attenuation + per-particle variation
    gl_PointSize = uPointSize * sizeClass * speedScale * (80.0 / max(vDepth, 1.0));
    gl_Position = projectionMatrix * mvPosition;
  }
`;

// ---------------------------------------------------------------------------
// Render: Fragment shader — circular soft-edge points, temperature-based color
// ---------------------------------------------------------------------------
export const renderFragmentShader = /* glsl */ `
  uniform float uColorTemp;
  uniform float uOpacity;

  varying float vSpeed;
  varying float vDepth;

  // Attempt a basic blackbody color from temperature (simplified Planckian locus)
  vec3 temperatureToColor(float temp) {
    // Normalize to 1000-15000K range
    float t = clamp(temp, 1000.0, 15000.0) / 100.0;
    vec3 color;

    // Red channel
    if (t <= 66.0) {
      color.r = 1.0;
    } else {
      color.r = clamp(1.292936186 * pow(t - 60.0, -0.1332047592), 0.0, 1.0);
    }

    // Green channel
    if (t <= 66.0) {
      color.g = clamp(0.3900815788 * log(t) - 0.6318414438, 0.0, 1.0);
    } else {
      color.g = clamp(1.129890861 * pow(t - 60.0, -0.0755148492), 0.0, 1.0);
    }

    // Blue channel
    if (t >= 66.0) {
      color.b = 1.0;
    } else if (t <= 19.0) {
      color.b = 0.0;
    } else {
      color.b = clamp(0.5432067891 * log(t - 10.0) - 1.19625408914, 0.0, 1.0);
    }

    return color;
  }

  void main() {
    vec2 coord = gl_PointCoord - vec2(0.5);
    float dist = length(coord);
    if (dist > 0.5) discard;
    // Wider falloff eliminates hard circle edges on mobile (small point sizes)
    float alpha = smoothstep(0.5, 0.15, dist);

    vec3 baseColor = temperatureToColor(uColorTemp);

    float brightness = 1.0 + vSpeed * 0.08;
    brightness = min(brightness, 1.5);

    float depthFade = clamp(1.0 - vDepth / 80.0, 0.1, 1.0);

    vec3 finalColor = baseColor * brightness * depthFade * 0.25;

    gl_FragColor = vec4(finalColor, alpha * uOpacity);
  }
`;
