// The azure liquid behind the page: a domain-warped noise field drawn with WebGL.
// It brightens and flows faster over the projects, and settles back elsewhere.
// Without WebGL (or with reduced motion) the CSS gradient on the canvas stays as a still fallback.
(() => {
  const canvas = document.querySelector(".liquid");
  if (!canvas) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const gl = canvas.getContext("webgl", { antialias: false, alpha: false, powerPreference: "low-power" });
  if (!gl) return;

  const vert = `attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }`;
  const frag = `
precision mediump float;
uniform vec2 res; uniform float t; uniform float energy; uniform vec2 mouse;
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f*f*(3.0-2.0*f);
  return mix(mix(hash(i), hash(i+vec2(1,0)), u.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), u.x), u.y); }
float fbm(vec2 p){ float v = 0.0, a = 0.5; mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 3; i++){ v += a * noise(p); p = m * p; a *= 0.5; } return v / 0.875; }
void main(){
  vec2 uv = gl_FragCoord.xy / res; vec2 p = (gl_FragCoord.xy - 0.5*res) / min(res.x, res.y);
  p += (mouse - 0.5) * 0.08;
  float s = t * (0.035 + 0.05*energy);
  vec2 q = vec2(fbm(p*0.75 + vec2(0.0, s)), fbm(p*0.75 + vec2(5.2, 1.3) - s));
  vec2 r = vec2(fbm(p*0.8 + 1.8*q + vec2(1.7, 9.2) + s*1.3), fbm(p*0.8 + 1.8*q + vec2(8.3, 2.8) - s));
  float f = fbm(p*0.7 + 1.6*r);
  vec3 base  = vec3(0.012, 0.024, 0.051);
  vec3 deep  = vec3(0.0, 0.16, 0.42);
  vec3 azure = vec3(0.04, 0.52, 1.0);
  vec3 cyan  = vec3(0.44, 0.83, 1.0);
  vec3 teal  = vec3(0.0, 0.62, 0.66);
  vec3 col = mix(base, deep, smoothstep(0.15, 0.6, f));
  col = mix(col, azure, smoothstep(0.38, 0.8, f + 0.3*length(q)) * (0.6 + 0.4*energy));
  col = mix(col, cyan, smoothstep(0.55, 0.85, r.y) * 0.55 * energy);
  col = mix(col, teal, smoothstep(0.6, 0.9, q.x) * 0.35 * energy);
  float vig = smoothstep(1.35, 0.2, length(p * vec2(0.85, 1.1)));
  col *= mix(0.25, 1.0, vig) * mix(0.75, 1.0, energy);
  gl_FragColor = vec4(col, 1.0);
}`;
  const compile = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null; };
  const vs = compile(gl.VERTEX_SHADER, vert), fs = compile(gl.FRAGMENT_SHADER, frag);
  if (!vs || !fs) return;
  const prog = gl.createProgram();
  gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
  gl.useProgram(prog);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, "p");
  gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const u = (n) => gl.getUniformLocation(prog, n);
  const uRes = u("res"), uT = u("t"), uE = u("energy"), uM = u("mouse");

  // Render at reduced resolution: the field is soft, so this costs nothing visible.
  const lowEnd = (navigator.hardwareConcurrency || 8) <= 4 || (navigator.deviceMemory || 8) <= 4;
  const scale = innerWidth < 768 || lowEnd ? 0.3 : 0.5;
  const resize = () => {
    canvas.width = Math.max(1, Math.round(innerWidth * scale));
    canvas.height = Math.max(1, Math.round(innerHeight * scale));
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(uRes, canvas.width, canvas.height);
  };
  resize();
  addEventListener("resize", resize);

  // Energy follows the section in view: calm on the hero, full over the projects.
  const zones = [...document.querySelectorAll("[data-energy]")];
  let energy = 0.35, target = 0.35;
  const readTarget = () => {
    const mid = innerHeight * 0.5;
    const z = zones.find((el) => { const r = el.getBoundingClientRect(); return r.top <= mid && r.bottom >= mid; });
    target = z ? Number(z.dataset.energy) : 0.3;
  };
  addEventListener("scroll", readTarget, { passive: true });
  readTarget();

  let mx = 0.5, my = 0.5, smx = 0.5, smy = 0.5;
  addEventListener("pointermove", (e) => { mx = e.clientX / innerWidth; my = 1 - e.clientY / innerHeight; }, { passive: true });

  const start = performance.now();
  const minFrame = innerWidth < 768 || lowEnd ? 1000 / 30 : 0;
  let last = 0, raf = 0;
  const frame = (now) => {
    raf = requestAnimationFrame(frame);
    if (now - last < minFrame) return;
    last = now;
    energy += (target - energy) * 0.04;
    smx += (mx - smx) * 0.05; smy += (my - smy) * 0.05;
    gl.uniform1f(uT, (now - start) / 1000);
    gl.uniform1f(uE, energy);
    gl.uniform2f(uM, smx, smy);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };
  if (reduce) {
    energy = target;
    gl.uniform1f(uT, 12.0); gl.uniform1f(uE, 0.6); gl.uniform2f(uM, 0.5, 0.5);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    return;
  }
  // One still frame now (cheap), then the flow starts after the page has painted and settled.
  gl.uniform1f(uT, 0); gl.uniform1f(uE, energy); gl.uniform2f(uM, 0.5, 0.5);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
  // Start after the page has painted and settled, so the liquid never delays the first view.
  const start2 = () => { raf = requestAnimationFrame(frame); };
  if (document.readyState === "complete") (window.requestIdleCallback || setTimeout)(start2, { timeout: 600 });
  else addEventListener("load", () => (window.requestIdleCallback || setTimeout)(start2, { timeout: 600 }));
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) cancelAnimationFrame(raf);
    else raf = requestAnimationFrame(frame);
  });
})();
