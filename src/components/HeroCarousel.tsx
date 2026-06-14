import React, { useEffect, useState } from 'react';

/**
 * Three brand-coherent SVG art compositions used in the hero card.
 * They echo the design system's motifs (orbit rings, particle constellation,
 * radial burst) rather than impersonating Gemini output — these are
 * illustrative, not real generations.
 */

function ArtOrbits() {
  return (
    <svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <radialGradient id="orb-bg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#13131a" />
          <stop offset="100%" stopColor="#000000" />
        </radialGradient>
        <linearGradient id="orb-accent" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF6B00" />
          <stop offset="100%" stopColor="#FF8C42" />
        </linearGradient>
        <filter id="orb-glow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <rect width="400" height="400" fill="url(#orb-bg)" />
      {/* Concentric orbit rings */}
      {[60, 110, 160, 210, 260, 310].map((r, i) => (
        <circle
          key={r}
          cx="200"
          cy="200"
          r={r}
          fill="none"
          stroke="#FF6B00"
          strokeWidth={i % 2 === 0 ? '0.6' : '0.3'}
          opacity={0.7 - i * 0.1}
        />
      ))}
      {/* Orbiting bodies */}
      <circle cx="200" cy="80" r="8" fill="url(#orb-accent)" filter="url(#orb-glow)" />
      <circle cx="290" cy="290" r="5" fill="#FF6B00" filter="url(#orb-glow)" opacity="0.9" />
      <circle cx="90" cy="220" r="3" fill="#FF8C42" opacity="0.8" />
      <circle cx="320" cy="140" r="2" fill="#FF6B00" opacity="0.7" />
      <circle cx="130" cy="320" r="2" fill="#FF8C42" opacity="0.6" />
      <circle cx="200" cy="200" r="4" fill="url(#orb-accent)" filter="url(#orb-glow)" />
      {/* Axis crosshair */}
      <line x1="200" y1="40" x2="200" y2="360" stroke="#FF6B00" strokeWidth="0.3" opacity="0.2" />
      <line x1="40" y1="200" x2="360" y2="200" stroke="#FF6B00" strokeWidth="0.3" opacity="0.2" />
    </svg>
  );
}

function ArtConstellation() {
  // Deterministic pseudo-random — same nodes every render
  const seed = [
    [55, 78], [128, 45], [212, 90], [290, 60], [340, 130],
    [80, 160], [165, 175], [240, 200], [310, 220], [365, 280],
    [50, 240], [120, 280], [200, 310], [280, 340], [180, 130],
  ];
  const lines: [number, number][] = [];
  for (let i = 0; i < seed.length; i++) {
    for (let j = i + 1; j < seed.length; j++) {
      const dx = seed[i][0] - seed[j][0];
      const dy = seed[i][1] - seed[j][1];
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < 130) lines.push([i, j]);
    }
  }
  return (
    <svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <radialGradient id="con-bg" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="#1a1a24" />
          <stop offset="100%" stopColor="#000000" />
        </radialGradient>
        <filter id="con-glow">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <rect width="400" height="400" fill="url(#con-bg)" />
      {lines.map(([i, j], idx) => {
        const dx = seed[i][0] - seed[j][0];
        const dy = seed[i][1] - seed[j][1];
        const d = Math.sqrt(dx * dx + dy * dy);
        const opacity = (1 - d / 130) * 0.4;
        return (
          <line
            key={idx}
            x1={seed[i][0]}
            y1={seed[i][1]}
            x2={seed[j][0]}
            y2={seed[j][1]}
            stroke="#FF6B00"
            strokeWidth="0.5"
            opacity={opacity}
          />
        );
      })}
      {seed.map(([x, y], idx) => {
        const r = 1.5 + (idx % 4);
        const opacity = 0.6 + (idx % 3) * 0.13;
        return (
          <circle
            key={idx}
            cx={x}
            cy={y}
            r={r}
            fill="#FF6B00"
            opacity={opacity}
            filter={r > 2.5 ? 'url(#con-glow)' : undefined}
          />
        );
      })}
    </svg>
  );
}

function ArtBurst() {
  // Radial spokes + central pulse
  const spokes = Array.from({ length: 36 }, (_, i) => (i / 36) * Math.PI * 2);
  return (
    <svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <radialGradient id="bst-bg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1a1a24" />
          <stop offset="60%" stopColor="#0a0a10" />
          <stop offset="100%" stopColor="#000000" />
        </radialGradient>
        <radialGradient id="bst-core" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FF8C42" stopOpacity="1" />
          <stop offset="40%" stopColor="#FF6B00" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#FF6B00" stopOpacity="0" />
        </radialGradient>
        <filter id="bst-glow">
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>
      <rect width="400" height="400" fill="url(#bst-bg)" />
      {/* Outer halo */}
      <circle cx="200" cy="200" r="120" fill="url(#bst-core)" filter="url(#bst-glow)" opacity="0.6" />
      {/* Radial spokes */}
      {spokes.map((angle, i) => {
        const r1 = 60 + (i % 3) * 8;
        const r2 = 180 + (i % 4) * 20;
        const x1 = 200 + Math.cos(angle) * r1;
        const y1 = 200 + Math.sin(angle) * r1;
        const x2 = 200 + Math.cos(angle) * r2;
        const y2 = 200 + Math.sin(angle) * r2;
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="#FF6B00"
            strokeWidth={i % 3 === 0 ? '0.8' : '0.3'}
            opacity={0.4 + (i % 4) * 0.1}
          />
        );
      })}
      {/* Inner core */}
      <circle cx="200" cy="200" r="40" fill="url(#bst-core)" />
      <circle cx="200" cy="200" r="14" fill="#FF8C42" opacity="0.95" />
      <circle cx="200" cy="200" r="6" fill="#fff5e6" opacity="0.85" />
      {/* Ring */}
      <circle cx="200" cy="200" r="90" fill="none" stroke="#FF6B00" strokeWidth="0.4" opacity="0.5" />
      <circle cx="200" cy="200" r="140" fill="none" stroke="#FF6B00" strokeWidth="0.3" opacity="0.3" />
    </svg>
  );
}

const SLIDES = [
  { id: 'orbits', label: 'Concentric orbit', render: () => <ArtOrbits /> },
  { id: 'constellation', label: 'Particle constellation', render: () => <ArtConstellation /> },
  { id: 'burst', label: 'Radial burst', render: () => <ArtBurst /> },
];

export function HeroCarousel() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) return;
    const id = window.setInterval(() => {
      setIndex(i => (i + 1) % SLIDES.length);
    }, 5000);
    return () => window.clearInterval(id);
  }, [paused]);

  return (
    <div
      className="hero-carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="hero-carousel-stack">
        {SLIDES.map((slide, i) => (
          <div
            key={slide.id}
            className={`hero-carousel-slide${i === index ? ' active' : ''}`}
            aria-hidden={i !== index}
          >
            {slide.render()}
          </div>
        ))}
        <div className="hero-carousel-tag">Sample composition</div>
      </div>
      <div className="hero-carousel-dots" role="tablist" aria-label="Sample compositions">
        {SLIDES.map((slide, i) => (
          <button
            key={slide.id}
            type="button"
            role="tab"
            aria-selected={i === index}
            aria-label={slide.label}
            className={`hero-carousel-dot${i === index ? ' active' : ''}`}
            onClick={() => setIndex(i)}
          />
        ))}
      </div>
    </div>
  );
}
