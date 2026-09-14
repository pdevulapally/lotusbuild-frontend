struct Params {
  resolution: vec2f,
  pointer: vec2f,
  time: f32,
  influence: f32,
  background: vec3f,
  nebula: vec3f,
  starCool: vec3f,
  starWarm: vec3f,
  starRed: vec3f,
}
@group(0) @binding(0) var<uniform> params: Params;

const QUAD = array<vec2f, 6>(vec2f(-1.0, -1.0), vec2f(1.0, -1.0), vec2f(-1.0, 1.0), vec2f(-1.0, 1.0), vec2f(1.0, -1.0), vec2f(1.0, 1.0));

fn random(seed: u32) -> f32 {
  var value = seed;
  value = (value ^ (value >> 16u)) * 2246822519u;
  value = (value ^ (value >> 13u)) * 3266489917u;
  return f32(value ^ (value >> 16u)) / 4294967295.0;
}

fn rotate(p: vec2f, angle: f32) -> vec2f {
  return vec2f(cos(angle) * p.x - sin(angle) * p.y, sin(angle) * p.x + cos(angle) * p.y);
}

fn galaxyCenter() -> vec2f { return params.resolution * vec2f(0.73, 0.37); }
fn galaxyScale() -> f32 { return max(params.resolution.x, params.resolution.y) * 0.72; }

fn noise(p: vec2f) -> f32 {
  let cell = floor(p);
  let f = fract(p);
  let u = f * f * (3.0 - 2.0 * f);
  let a = fract(sin(dot(cell, vec2f(127.1, 311.7))) * 43758.5453);
  let b = fract(sin(dot(cell + vec2f(1.0, 0.0), vec2f(127.1, 311.7))) * 43758.5453);
  let c = fract(sin(dot(cell + vec2f(0.0, 1.0), vec2f(127.1, 311.7))) * 43758.5453);
  let d = fract(sin(dot(cell + vec2f(1.0), vec2f(127.1, 311.7))) * 43758.5453);
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

struct Sky { @builtin(position) position: vec4f, @location(0) uv: vec2f }
@vertex fn vs_sky(@builtin(vertex_index) vertex: u32) -> Sky {
  let corners = array<vec2f, 3>(vec2f(-1.0, -1.0), vec2f(3.0, -1.0), vec2f(-1.0, 3.0));
  var out: Sky;
  out.position = vec4f(corners[vertex], 0.0, 1.0);
  out.uv = corners[vertex] * vec2f(0.5, -0.5) + 0.5;
  return out;
}

@fragment fn fs_sky(sky: Sky) -> @location(0) vec4f {
  let parallax = (params.pointer - params.resolution * 0.5) * params.influence * 0.008;
  let rotated = rotate((sky.uv * params.resolution - galaxyCenter() - parallax) / galaxyScale(), 0.45);
  let p = rotated / vec2f(1.0, 0.43);
  let radius = length(p);
  let angle = atan2(p.y, p.x);
  let arms = pow(0.5 + 0.5 * cos(angle * 3.0 - radius * 10.0 - params.time * 0.005), 7.0);
  let texture = noise(p * 7.0) * 0.55 + noise(p * 19.0) * 0.3 + noise(p * 47.0) * 0.15;
  let dust = exp(-radius * 2.8) * (0.16 + arms * 0.84) * (0.3 + texture * 0.85);
  let core = exp(-radius * radius * 150.0);
  let glow = params.nebula * dust * 0.8 + params.starWarm * core * 0.065;
  return vec4f(params.background + glow, 1.0);
}

struct Star {
  @builtin(position) position: vec4f,
  @location(0) local: vec2f,
  @location(1) opacity: f32,
  @location(2) colour: vec3f,
  @location(3) glow: f32,
}

@vertex fn vs_stars(@builtin(vertex_index) vertex: u32, @builtin(instance_index) instance: u32) -> Star {
  let seed = instance * 7u + 19u;
  let depth = random(seed + 2u);
  let origin = vec2f(random(seed), random(seed + 1u));
  let extent = params.resolution + 60.0;
  let speed = mix(0.15, 0.8, depth);
  var center = fract(origin + vec2f(speed, -speed * 0.3) * params.time / extent) * extent - 30.0;
  // Half of the stars follow the same spiral geometry as the dust field.
  if (instance % 2u == 0u) {
    let radius = sqrt(origin.x) * 1.1;
    let arm = f32(instance % 3u) * 2.094395;
    let angle = arm + radius * 3.333333 + (origin.y - 0.5) * 0.55 + params.time * 0.001667;
    let disk = vec2f(cos(angle), sin(angle) * 0.43) * radius * galaxyScale();
    center = galaxyCenter() + rotate(disk, -0.45);
  }
  center += vec2f(sin(params.time * 0.09 + origin.y * 25.0), cos(params.time * 0.07 + origin.x * 25.0)) * (1.0 + depth * 3.0);
  let delta = center - params.pointer;
  let distance = length(delta);
  let proximity = 1.0 - smoothstep(0.0, 160.0, distance);
  let direction = delta / max(distance, 1.0);
  center += (direction * 24.0 + vec2f(-direction.y, direction.x) * 12.0) * proximity * params.influence;
  center += (params.pointer - params.resolution * 0.5) * depth * 0.025 * params.influence;

  let bright = step(0.965, random(seed + 3u));
  let radius = mix(2.4, 6.48, depth * depth) + bright * 9.9;
  let normalized = center / params.resolution;
  let readingSpace = mix(0.4, 1.0, smoothstep(0.08, 0.4, abs(normalized.x - 0.5)));
  var out: Star;
  out.position = vec4f((center + QUAD[vertex] * radius) / params.resolution * vec2f(2.0, -2.0) + vec2f(-1.0, 1.0), 0.0, 1.0);
  out.local = QUAD[vertex];
  out.opacity = mix(0.2, 0.85, depth) * readingSpace;
  let temperature = random(seed + 4u);
  let pale = mix(params.starCool, vec3f(1.0), smoothstep(0.0, 0.45, temperature));
  let warm = mix(params.starWarm, params.starRed, smoothstep(0.7, 1.0, temperature));
  out.colour = mix(pale, warm, smoothstep(0.45, 0.7, temperature));
  out.glow = bright;
  return out;
}

@fragment fn fs_stars(star: Star) -> @location(0) vec4f {
  let distance = length(star.local);
  let core = exp(-distance * distance * mix(9.0, 32.0, star.glow));
  let halo = exp(-distance * distance * 4.0) * mix(0.12, 0.25, star.glow);
  let colour = mix(star.colour, vec3f(1.0), core * 0.45);
  return vec4f(colour, (core + halo) * star.opacity * (1.0 - smoothstep(0.75, 1.0, distance)));
}

struct BlackHole {
  @builtin(position) position: vec4f,
  @location(0) local: vec2f,
  @location(1) phase: f32,
}

@vertex fn vs_black_holes(@builtin(vertex_index) vertex: u32, @builtin(instance_index) instance: u32) -> BlackHole {
  // Keep the three small silhouettes outside the central reading column.
  let positions = array<vec2f, 3>(vec2f(0.11, 0.27), vec2f(0.90, 0.61), vec2f(0.18, 0.86));
  let sizes = array<f32, 3>(55.0, 43.0, 36.0);
  let angles = array<f32, 3>(-0.32, 0.42, -0.15);
  let scale = clamp(params.resolution.x / 900.0, 0.65, 1.0);
  let parallax = (params.pointer - params.resolution * 0.5) * params.influence * 0.012;
  let center = positions[instance] * params.resolution + parallax;
  let offset = rotate(QUAD[vertex] * sizes[instance] * scale, angles[instance]);
  var out: BlackHole;
  out.position = vec4f((center + offset) / params.resolution * vec2f(2.0, -2.0) + vec2f(-1.0, 1.0), 0.0, 1.0);
  out.local = QUAD[vertex];
  out.phase = f32(instance) * 2.1;
  return out;
}

fn gaussian(value: f32) -> f32 { return exp(-value * value); }

@fragment fn fs_black_holes(hole: BlackHole) -> @location(0) vec4f {
  let p = hole.local;
  let radius = length(p);
  let disk = p / vec2f(1.0, 0.24);
  let diskRadius = length(disk);
  let angle = atan2(disk.y, disk.x);
  let bands = 0.75 + 0.25 * sin(diskRadius * 85.0 - angle * 3.0 + params.time * 0.45 + hole.phase);
  let ring = gaussian((diskRadius - 0.55) / 0.14) * bands;
  let corona = gaussian((diskRadius - 0.55) / 0.27) * 0.16;
  // A thin lensed arc curves over the shadow; the near disk crosses in front.
  let photonRing = gaussian((radius - 0.225) / 0.018);
  let arc = gaussian((length(p / vec2f(1.0, 1.1)) - 0.28) / 0.025) * (1.0 - smoothstep(-0.02, 0.07, p.y));
  let shadow = 1.0 - smoothstep(0.185, 0.205, radius);
  let front = smoothstep(-0.01, 0.045, p.y);
  let emission = (ring + corona) * (1.0 - shadow * (1.0 - front)) + photonRing * 0.5 + arc * 0.4;
  let brightness = mix(0.55, 1.0, smoothstep(-0.6, 0.6, p.x));
  let colour = mix(params.starRed, params.starWarm, clamp(emission, 0.0, 1.0));
  let alpha = clamp(shadow + emission, 0.0, 1.0);
  return vec4f(colour * emission * brightness / max(alpha, 0.001), alpha);
}
