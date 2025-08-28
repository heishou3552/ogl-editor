export const shaderExamples = {
  basic: {
    vertex: `attribute vec3 position;
attribute vec2 uv;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`,
    fragment: `precision mediump float;

uniform float time;
uniform vec2 resolution;
uniform vec2 mouse;

varying vec2 vUv;

void main() {
  vec2 st = vUv;
  
  // Animated gradient
  vec3 color = vec3(0.0);
  color.r = sin(time + st.x * 3.14159) * 0.5 + 0.5;
  color.g = cos(time + st.y * 3.14159) * 0.5 + 0.5;
  color.b = sin(time * 2.0 + st.x * st.y * 10.0) * 0.5 + 0.5;
  
  // Mouse interaction
  vec2 mousePos = mouse / resolution;
  float dist = distance(st, mousePos);
  color *= 1.0 - dist * 2.0;
  
  gl_FragColor = vec4(color, 1.0);
}`
  },
  
  raymarching: {
    vertex: `attribute vec3 position;
attribute vec2 uv;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`,
    fragment: `precision mediump float;

uniform float time;
uniform vec2 resolution;
uniform vec2 mouse;

varying vec2 vUv;

// Distance function for a sphere
float sdSphere(vec3 p, float r) {
  return length(p) - r;
}

// Distance function for a box
float sdBox(vec3 p, vec3 b) {
  vec3 q = abs(p) - b;
  return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
}

// Scene distance function
float map(vec3 p) {
  // Animate position
  p.y += sin(time + p.x) * 0.2;
  p.x += cos(time * 0.7 + p.z) * 0.3;
  
  // Create multiple spheres
  float sphere1 = sdSphere(p - vec3(0.0, 0.0, 0.0), 0.5);
  float sphere2 = sdSphere(p - vec3(sin(time) * 2.0, 0.0, cos(time) * 2.0), 0.3);
  float box = sdBox(p - vec3(0.0, sin(time * 1.3) * 0.5, 0.0), vec3(0.3));
  
  return min(min(sphere1, sphere2), box);
}

// Calculate normal
vec3 calcNormal(vec3 p) {
  const float h = 0.001;
  const vec2 k = vec2(1, -1);
  return normalize(k.xyy * map(p + k.xyy * h) +
                   k.yyx * map(p + k.yyx * h) +
                   k.yxy * map(p + k.yxy * h) +
                   k.xxx * map(p + k.xxx * h));
}

// Raymarching
float rayMarch(vec3 ro, vec3 rd) {
  float t = 0.0;
  for (int i = 0; i < 100; i++) {
    vec3 p = ro + rd * t;
    float d = map(p);
    if (d < 0.001) break;
    t += d;
    if (t > 100.0) break;
  }
  return t;
}

void main() {
  vec2 st = (vUv - 0.5) * 2.0;
  st.x *= resolution.x / resolution.y;
  
  // Camera
  vec3 ro = vec3(0.0, 0.0, 3.0);
  vec3 rd = normalize(vec3(st, -1.0));
  
  // Raymarching
  float t = rayMarch(ro, rd);
  
  vec3 color = vec3(0.0);
  
  if (t < 100.0) {
    vec3 p = ro + rd * t;
    vec3 n = calcNormal(p);
    
    // Lighting
    vec3 lightPos = vec3(2.0, 2.0, 4.0);
    vec3 lightDir = normalize(lightPos - p);
    float diff = max(dot(n, lightDir), 0.0);
    
    // Colors based on position and normal
    color = vec3(0.2 + 0.8 * diff);
    color *= vec3(0.5 + 0.5 * n.x, 0.5 + 0.5 * n.y, 0.5 + 0.5 * n.z);
  } else {
    // Background gradient
    color = vec3(0.1, 0.2, 0.4) + st.y * 0.1;
  }
  
  gl_FragColor = vec4(color, 1.0);
}`
  },
  
  fractal: {
    vertex: `attribute vec3 position;
attribute vec2 uv;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`,
    fragment: `precision mediump float;

uniform float time;
uniform vec2 resolution;
uniform vec2 mouse;

varying vec2 vUv;

vec2 complexMul(vec2 a, vec2 b) {
  return vec2(a.x * b.x - a.y * b.y, a.x * b.y + a.y * b.x);
}

float julia(vec2 z, vec2 c) {
  for (int i = 0; i < 100; i++) {
    if (length(z) > 2.0) {
      return float(i) / 100.0;
    }
    z = complexMul(z, z) + c;
  }
  return 0.0;
}

void main() {
  vec2 st = (vUv - 0.5) * 2.0;
  st.x *= resolution.x / resolution.y;
  
  // Zoom and pan
  st *= 1.5;
  st += vec2(sin(time * 0.1) * 0.3, cos(time * 0.13) * 0.3);
  
  // Julia set parameters
  vec2 c = vec2(
    sin(time * 0.2) * 0.7,
    cos(time * 0.3) * 0.7
  );
  
  float iter = julia(st, c);
  
  // Color based on iterations
  vec3 color = vec3(0.0);
  color.r = sin(iter * 3.14159 * 2.0) * 0.5 + 0.5;
  color.g = sin(iter * 3.14159 * 4.0 + 2.0) * 0.5 + 0.5;
  color.b = sin(iter * 3.14159 * 6.0 + 4.0) * 0.5 + 0.5;
  
  // Add some brightness variation
  color *= 0.5 + 0.5 * iter;
  
  gl_FragColor = vec4(color, 1.0);
}`
  },
  
  noise: {
    vertex: `attribute vec3 position;
attribute vec2 uv;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`,
    fragment: `precision mediump float;

uniform float time;
uniform vec2 resolution;
uniform vec2 mouse;

varying vec2 vUv;

// Noise functions
float random(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

float noise(vec2 st) {
  vec2 i = floor(st);
  vec2 f = fract(st);
  
  float a = random(i);
  float b = random(i + vec2(1.0, 0.0));
  float c = random(i + vec2(0.0, 1.0));
  float d = random(i + vec2(1.0, 1.0));
  
  vec2 u = f * f * (3.0 - 2.0 * f);
  
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

float fbm(vec2 st) {
  float value = 0.0;
  float amplitude = 0.5;
  float frequency = 0.0;
  
  for (int i = 0; i < 5; i++) {
    value += amplitude * noise(st);
    st *= 2.0;
    amplitude *= 0.5;
  }
  return value;
}

void main() {
  vec2 st = vUv;
  
  // Scale and move
  st *= 3.0;
  st += vec2(time * 0.1, time * 0.05);
  
  // Generate fractal noise
  float n = fbm(st);
  
  // Add some movement
  vec2 q = vec2(fbm(st + vec2(0.0, 0.0)),
                fbm(st + vec2(5.2, 1.3)));
  
  vec2 r = vec2(fbm(st + 4.0 * q + vec2(1.7, 9.2) + time * 0.15),
                fbm(st + 4.0 * q + vec2(8.3, 2.8) + time * 0.126));
  
  float f = fbm(st + r);
  
  // Color mapping
  vec3 color = vec3(0.0);
  color = mix(vec3(0.101961, 0.619608, 0.666667),
              vec3(0.666667, 0.666667, 0.498039),
              clamp((f * f) * 4.0, 0.0, 1.0));
              
  color = mix(color,
              vec3(0.0, 0.0, 0.164706),
              clamp(length(q), 0.0, 1.0));
              
  color = mix(color,
              vec3(0.666667, 1.0, 1.0),
              clamp(length(r.x), 0.0, 1.0));
  
  gl_FragColor = vec4(color, 1.0);
}`
  }
};