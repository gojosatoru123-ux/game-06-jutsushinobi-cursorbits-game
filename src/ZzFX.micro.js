// Modularized ZzFX for Vite/React
export let zzfx_v = 0.5;

// Shared AudioContext
export const zzfx_x = new (window.AudioContext || window.webkitAudioContext)();

export const zzfx = (e, f, a, b = 1, d = .1, g = 0, h = 0, k = 0, l = 0) => {
  let S = 44100, P = Math.PI;
  a *= 2 * P / S;
  a *= 1 + f * (2 * Math.random() - 1);
  g *= 1E3 * P / (S ** 2);
  b = 0 < b ? S * (10 < b ? 10 : b) | 0 : 1;
  d *= b | 0;
  k *= 2 * P / S;
  l *= P;
  let frames = [];
  for (var m = 0, n = 0, c = 0; c < b; ++c) {
    frames[c] = e * zzfx_v * Math.cos(m * a * Math.cos(n * k + l)) * (c < d ? c / d : 1 - (c - d) / (b - d)), 
    m += 1 + h * (2 * Math.random() - 1), 
    n += 1 + h * (2 * Math.random() - 1), 
    a += g;
  }
  let buffer = zzfx_x.createBuffer(1, b, S);
  let source = zzfx_x.createBufferSource();
  buffer.getChannelData(0).set(frames);
  source.buffer = buffer;
  source.connect(zzfx_x.destination);
  source.start();
  return source;
};