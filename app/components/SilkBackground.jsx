'use client';

import { useEffect, useRef } from 'react';

export default function SilkBackground({ 
  speed = 5, 
  scale = 1, 
  color = '#7B7481', 
  noiseIntensity = 1.5, 
  rotation = 0,
  className = '',
  style = {}
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const resizeCanvas = () => {
      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;
      
      if (width > 0 && height > 0) {
        canvas.width = width * window.devicePixelRatio;
        canvas.height = height * window.devicePixelRatio;
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Improved Perlin noise
    const seedrandom = (seed) => {
      return function() {
        seed = (seed * 9301 + 49297) % 233280;
        return seed / 233280;
      };
    };

    const createNoise = () => {
      const p = Array(512);
      const permutation = Array(256);
      
      for (let i = 0; i < 256; i++) {
        permutation[i] = i;
      }

      for (let i = 255; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [permutation[i], permutation[j]] = [permutation[j], permutation[i]];
      }

      for (let i = 0; i < 512; i++) {
        p[i] = permutation[i % 256];
      }

      const fade = (t) => t * t * t * (t * (t * 6 - 15) + 10);
      const lerp = (a, b, t) => a + (b - a) * t;
      const grad = (hash, x, y) => {
        const h = hash & 15;
        const u = h < 8 ? x : y;
        const v = h < 8 ? y : x;
        return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
      };

      return (x, y) => {
        const xi = Math.floor(x) & 255;
        const yi = Math.floor(y) & 255;
        const xf = x - Math.floor(x);
        const yf = y - Math.floor(y);
        const u = fade(xf);
        const v = fade(yf);

        const aa = p[p[xi] + yi];
        const ba = p[p[xi + 1] + yi];
        const ab = p[p[xi] + yi + 1];
        const bb = p[p[xi + 1] + yi + 1];

        const x1 = lerp(grad(aa, xf, yf), grad(ba, xf - 1, yf), u);
        const x2 = lerp(grad(ab, xf, yf - 1), grad(bb, xf - 1, yf - 1), u);
        return lerp(x1, x2, v);
      };
    };

    const noise = createNoise();

    let animationFrameId;
    let time = 0;

    const hexToRgb = (hex) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : { r: 123, g: 116, b: 129 };
    };

    const baseColor = hexToRgb(color);

    const animate = () => {
      time += speed * 0.005;
      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;

      // Ensure canvas has valid dimensions
      if (width <= 0 || height <= 0) {
        animationFrameId = requestAnimationFrame(animate);
        return;
      }

      const imageData = ctx.createImageData(width, height);
      const data = imageData.data;

      const rotRad = (rotation * Math.PI) / 180;
      const cosR = Math.cos(rotRad);
      const sinR = Math.sin(rotRad);

      for (let i = 0; i < data.length; i += 4) {
        const pixelIndex = i / 4;
        const px = (pixelIndex % width) / width;
        const py = Math.floor(pixelIndex / width) / height;

        // Rotate coordinates
        const cx = (px - 0.5) * cosR - (py - 0.5) * sinR + 0.5;
        const cy = (px - 0.5) * sinR + (py - 0.5) * cosR + 0.5;

        // Multi-octave Perlin noise for silk effect
        let value = 0;
        let amplitude = 1;
        let frequency = 1;
        let maxValue = 0;

        for (let octave = 0; octave < 6; octave++) {
          const sampleX = cx * frequency * scale * 2 + time * (0.5 - octave * 0.05);
          const sampleY = cy * frequency * scale * 2 + rotation * 0.01;
          
          value += noise(sampleX, sampleY) * amplitude;
          maxValue += amplitude;
          
          amplitude *= 0.5;
          frequency *= 2;
        }

        value = (value / maxValue + 1) / 2;
        value = Math.pow(value, 1.2); // Increase contrast
        value = value * noiseIntensity;

        // Apply color with smooth gradation
        const darken = 1 - value * 0.7;
        data[i] = Math.max(0, Math.min(255, baseColor.r * darken));
        data[i + 1] = Math.max(0, Math.min(255, baseColor.g * darken));
        data[i + 2] = Math.max(0, Math.min(255, baseColor.b * darken));
        data[i + 3] = 255;
      }

      ctx.putImageData(imageData, 0, 0);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [speed, scale, color, noiseIntensity, rotation]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full ${className}`}
      style={{
        display: 'block',
        ...style
      }}
    />
  );
}
