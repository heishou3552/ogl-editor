export const defaultVertexShader = `attribute vec3 position;
attribute vec2 uv;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`

export const defaultFragmentShader = `precision mediump float;

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

export const defaultJavaScript = `// WebGL setup without OGL - Pure WebGL implementation
(function() {
  'use strict';
  
  // Stop any existing animation
  if (window.currentAnimationFrame) {
    cancelAnimationFrame(window.currentAnimationFrame);
  }
  
  const canvas = document.getElementById('glCanvas');
  if (!canvas) {
    console.error('Canvas element not found');
    return;
  }
  
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

  if (!gl) {
    console.error('WebGL not supported');
    return;
  }

  // Set canvas size
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
  gl.viewport(0, 0, canvas.width, canvas.height);

  // Vertex data for a full-screen quad
  const vertices = new Float32Array([
    -1, -1,  0, 1,
     1, -1,  1, 1,
    -1,  1,  0, 0,
     1,  1,  1, 0
  ]);

  // Create and bind vertex buffer
  const vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  // Shader compilation helper
  function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('Shader compilation error:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    
    return shader;
  }

  // Create shader program
  function createProgram(gl, vertexSource, fragmentSource) {
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
    
    if (!vertexShader || !fragmentShader) {
      return null;
    }
    
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program linking error:', gl.getProgramInfoLog(program));
      gl.deleteProgram(program);
      return null;
    }
    
    return program;
  }

  // Create the shader program
  const program = createProgram(gl, \`\${vertexShader}\`, \`\${fragmentShader}\`);

  if (!program) {
    console.error('Failed to create shader program');
    return;
  }

  // Get attribute and uniform locations
  const positionLocation = gl.getAttribLocation(program, 'position');
  const uvLocation = gl.getAttribLocation(program, 'uv');
  const timeLocation = gl.getUniformLocation(program, 'time');
  const resolutionLocation = gl.getUniformLocation(program, 'resolution');
  const mouseLocation = gl.getUniformLocation(program, 'mouse');
  const modelViewMatrixLocation = gl.getUniformLocation(program, 'modelViewMatrix');
  const projectionMatrixLocation = gl.getUniformLocation(program, 'projectionMatrix');

  // Mouse tracking
  let mouse = { x: 0, y: 0 };
  
  function handleMouseMove(e) {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = canvas.height - (e.clientY - rect.top);
  }
  
  canvas.addEventListener('mousemove', handleMouseMove);

  // Create identity matrix
  function createIdentityMatrix() {
    return [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    ];
  }

  // Render function
  function render(time) {
    // Resize canvas if needed
    if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
    }
    
    // Clear canvas
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    // Use program
    gl.useProgram(program);
    
    // Set up attributes
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    
    if (positionLocation >= 0) {
      gl.enableVertexAttribArray(positionLocation);
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 16, 0);
    }
    
    if (uvLocation >= 0) {
      gl.enableVertexAttribArray(uvLocation);
      gl.vertexAttribPointer(uvLocation, 2, gl.FLOAT, false, 16, 8);
    }
    
    // Set uniforms
    if (timeLocation) {
      gl.uniform1f(timeLocation, time * 0.001);
    }
    
    if (resolutionLocation) {
      gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
    }
    
    if (mouseLocation) {
      gl.uniform2f(mouseLocation, mouse.x, mouse.y);
    }
    
    if (modelViewMatrixLocation) {
      gl.uniformMatrix4fv(modelViewMatrixLocation, false, createIdentityMatrix());
    }
    
    if (projectionMatrixLocation) {
      gl.uniformMatrix4fv(projectionMatrixLocation, false, createIdentityMatrix());
    }
    
    // Draw
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    
    window.currentAnimationFrame = requestAnimationFrame(render);
  }

  // Start rendering
  window.currentAnimationFrame = requestAnimationFrame(render);
  
  // Cleanup function for when shader stops
  window.cleanupShader = function() {
    if (window.currentAnimationFrame) {
      cancelAnimationFrame(window.currentAnimationFrame);
      window.currentAnimationFrame = null;
    }
    canvas.removeEventListener('mousemove', handleMouseMove);
  };
})();`