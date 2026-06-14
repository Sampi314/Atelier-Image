import React, { useEffect, useRef, useState } from 'react';
import { HeroCarousel } from './HeroCarousel';

type Theme = 'dark' | 'light';

function getInitialTheme(): Theme {
  if (typeof document === 'undefined') return 'dark';
  const attr = document.documentElement.getAttribute('data-theme');
  if (attr === 'light' || attr === 'dark') return attr;
  return 'dark';
}

export function BrandMark({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect
        x="0.5"
        y="0.5"
        width="31"
        height="31"
        rx="6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.4"
      />
      <text
        x="16"
        y="24"
        textAnchor="middle"
        fontFamily="'Songti TC', 'Songti SC', 'Noto Serif TC', 'Noto Serif CJK TC', 'PingFang TC', 'Microsoft JhengHei', serif"
        fontSize="22"
        fontWeight="700"
        fill="currentColor"
      >
        吳
      </text>
    </svg>
  );
}

export function BrandMarkLarge({ size = 140 }: { size?: number }) {
  const id = React.useId();
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`accent-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF6B00" />
          <stop offset="60%" stopColor="#FF8C42" />
          <stop offset="100%" stopColor="#FF6B00" />
        </linearGradient>
        <filter id={`glow-${id}`}>
          <feGaussianBlur stdDeviation="0.3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <rect width="32" height="32" rx="4" fill="#000000" />
      <rect
        x="0.5"
        y="0.5"
        width="31"
        height="31"
        rx="3.5"
        fill="none"
        stroke="#FF6B00"
        strokeWidth="0.5"
        opacity="0.4"
      />
      <circle cx="3.2" cy="3.2" r="0.5" fill="#FF6B00" opacity="0.5" />
      <circle cx="28.8" cy="3.2" r="0.5" fill="#FF6B00" opacity="0.5" />
      <circle cx="3.2" cy="28.8" r="0.5" fill="#FF6B00" opacity="0.5" />
      <circle cx="28.8" cy="28.8" r="0.5" fill="#FF6B00" opacity="0.5" />
      <text
        x="16"
        y="19"
        textAnchor="middle"
        fontFamily="'Songti TC', 'Songti SC', 'Noto Serif TC', 'Noto Serif CJK TC', 'PingFang TC', 'Microsoft JhengHei', serif"
        fontSize="18"
        fontWeight="700"
        fill={`url(#accent-${id})`}
        filter={`url(#glow-${id})`}
      >
        吳
      </text>
      <line x1="12" y1="22.5" x2="20" y2="22.5" stroke="#FF6B00" strokeWidth="0.3" opacity="0.5" />
      <text
        x="16"
        y="28.5"
        textAnchor="middle"
        fontFamily="'Space Mono', 'SF Mono', 'Consolas', monospace"
        fontSize="5"
        fontWeight="700"
        letterSpacing="1"
        fill="#FF6B00"
        opacity="0.9"
      >
        IMG
      </text>
    </svg>
  );
}

function HeroParticles() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) return;

    let animId = 0;
    let paused = false;

    type Particle = { x: number; y: number; vx: number; vy: number; r: number; alpha: number };
    type Layer = {
      particles: Particle[];
      speed: number;
      size: [number, number];
      alpha: [number, number];
      lineAlpha: number;
      lineDist: number;
      color: string;
    };

    const layers: Layer[] = [
      { particles: [], speed: 0.12, size: [0.5, 1.2], alpha: [0.15, 0.3],  lineAlpha: 0.08, lineDist: 100, color: '255, 107, 0' },
      { particles: [], speed: 0.25, size: [1.0, 2.2], alpha: [0.35, 0.6],  lineAlpha: 0.18, lineDist: 130, color: '255, 107, 0' },
      { particles: [], speed: 0.45, size: [1.8, 3.5], alpha: [0.55, 0.85], lineAlpha: 0.30, lineDist: 160, color: '255, 107, 0' },
    ];

    function resize() {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function createParticles() {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const area = rect.width * rect.height;
      const counts = [
        Math.min(Math.floor(area / 22000), 40),
        Math.min(Math.floor(area / 28000), 26),
        Math.min(Math.floor(area / 45000), 14),
      ];
      layers.forEach((layer, i) => {
        layer.particles = [];
        for (let n = 0; n < counts[i]; n++) {
          layer.particles.push({
            x: Math.random() * rect.width,
            y: Math.random() * rect.height,
            vx: (Math.random() - 0.5) * layer.speed,
            vy: (Math.random() - 0.5) * layer.speed,
            r: Math.random() * (layer.size[1] - layer.size[0]) + layer.size[0],
            alpha: Math.random() * (layer.alpha[1] - layer.alpha[0]) + layer.alpha[0],
          });
        }
      });
    }

    function draw() {
      if (paused || !canvas || !ctx) return;
      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);

      for (let li = 0; li < layers.length; li++) {
        const layer = layers[li];
        // Lines between neighbors
        for (let i = 0; i < layer.particles.length; i++) {
          for (let j = i + 1; j < layer.particles.length; j++) {
            const a = layer.particles[i];
            const b = layer.particles[j];
            const dx = a.x - b.x;
            const dy = a.y - b.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < layer.lineDist) {
              const opacity = (1 - dist / layer.lineDist) * layer.lineAlpha;
              ctx.strokeStyle = `rgba(${layer.color}, ${opacity})`;
              ctx.lineWidth = li === 2 ? 1.0 : li === 1 ? 0.7 : 0.4;
              ctx.beginPath();
              ctx.moveTo(a.x, a.y);
              ctx.lineTo(b.x, b.y);
              ctx.stroke();
            }
          }
        }
        // Particles
        for (const p of layer.particles) {
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < -10) p.x = rect.width + 10;
          if (p.x > rect.width + 10) p.x = -10;
          if (p.y < -10) p.y = rect.height + 10;
          if (p.y > rect.height + 10) p.y = -10;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${layer.color}, ${p.alpha})`;
          ctx.fill();
          if (li === 2 && p.r > 2.5) {
            const glow = ctx.createRadialGradient(p.x, p.y, p.r * 0.5, p.x, p.y, p.r * 2.5);
            glow.addColorStop(0, `rgba(${layer.color}, ${p.alpha * 0.3})`);
            glow.addColorStop(1, `rgba(${layer.color}, 0)`);
            ctx.fillStyle = glow;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r * 2.5, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      animId = requestAnimationFrame(draw);
    }

    function onVisibility() {
      if (document.hidden) {
        paused = true;
        cancelAnimationFrame(animId);
      } else {
        paused = false;
        draw();
      }
    }

    let resizeTimer: number | undefined;
    function onResize() {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        resize();
        createParticles();
      }, 120);
    }

    resize();
    createParticles();
    draw();

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animId);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('resize', onResize);
      window.clearTimeout(resizeTimer);
    };
  }, []);

  return <canvas ref={canvasRef} className="hero-canvas" aria-hidden="true" />;
}

export function SiteChrome({
  children,
  showHero = true,
}: {
  children: React.ReactNode;
  showHero?: boolean;
}) {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [navOpen, setNavOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('theme', theme);
    } catch {
      /* ignore quota / privacy mode */
    }
  }, [theme]);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 20);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Reveal hero text once mounted
  useEffect(() => {
    const els = document.querySelectorAll('.hero-reveal');
    requestAnimationFrame(() => {
      els.forEach((el) => el.classList.add('visible'));
    });
  }, [showHero]);

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  return (
    <>
      <nav className={`navbar${scrolled ? ' scrolled' : ''}`}>
        <div className="nav-inner">
          <a href="#" className="nav-brand" aria-label="Atelier Image — home">
            <BrandMark size={28} />
          </a>
          <button
            className="nav-hamburger"
            aria-label="Toggle menu"
            aria-expanded={navOpen}
            onClick={() => setNavOpen((o) => !o)}
          >
            ☰
          </button>
          <ul className={`nav-links${navOpen ? ' open' : ''}`}>
            <li><a href="#main" className="active" onClick={() => setNavOpen(false)}>Atelier</a></li>
            <li>
              <a
                href="https://aistudio.google.com/apikey"
                target="_blank"
                rel="noreferrer"
                onClick={() => setNavOpen(false)}
              >
                API Key
              </a>
            </li>
            <li>
              <a
                href="https://github.com/Sampi314/Atelier-Image"
                target="_blank"
                rel="noreferrer"
                onClick={() => setNavOpen(false)}
              >
                GitHub
              </a>
            </li>
            <li>
              <button
                className="theme-toggle"
                onClick={toggleTheme}
                aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
              >
                {theme === 'dark' ? '☾' : '☀'}
              </button>
            </li>
          </ul>
        </div>
      </nav>

      {showHero && (
        <header className="hero">
          <HeroParticles />
          <div className="hero-inner">
            <div className="hero-text">
              <div className="hero-label hero-reveal">Batch Image Generator</div>
              <h1 className="hero-reveal">Atelier <em>Image</em></h1>
              <p className="headline hero-reveal">
                Compose a queue of prompts, anchor a shared style, and run a batch through Gemini 3 Flash Image.
              </p>
              <p className="location hero-reveal">Gemini 3.1 Pro · Flash Image Preview</p>
              <div className="header-actions hero-reveal">
                <a href="#main" className="btn btn-primary">Open atelier</a>
                <a
                  href="https://github.com/Sampi314/Atelier-Image"
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-outline"
                >
                  GitHub
                </a>
                <a
                  href="https://aistudio.google.com/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-outline"
                >
                  Get API Key
                </a>
              </div>
            </div>
            <div className="hero-reveal">
              <HeroCarousel />
            </div>
          </div>
        </header>
      )}

      <main id="main">{children}</main>

      <footer className="footer">
        <div className="footer-logo"><BrandMark size={24} /></div>
        <div className="footer-tagline">Atelier · Image · Gemini</div>
        <div className="footer-links">
          <a href="https://github.com/Sampi314/Atelier-Image" target="_blank" rel="noreferrer">GitHub</a>
          <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer">Billing</a>
          <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer">API Key</a>
        </div>
        <div className="footer-copy">&copy; {new Date().getFullYear()} Sam Ngo</div>
      </footer>
    </>
  );
}
