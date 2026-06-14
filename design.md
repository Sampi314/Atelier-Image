# Sam Ngo — Universal Design System

A portable visual-identity spec. **Every website I build follows this document.** When this doc and the implementation disagree, the doc wins — update the doc first, then make the code conform.

> **For Claude in another repo:** treat values here as binding constraints, not suggestions. When a user request conflicts with these (e.g. "use a blue button"), surface the conflict and ask before deviating. When in doubt, mirror the patterns from this doc rather than improvising.

---

## Table of Contents

1. [Identity & Voice](#1-identity--voice)
2. [Color Palette](#2-color-palette)
3. [Typography](#3-typography)
4. [Spacing & Layout](#4-spacing--layout)
5. [Navbar](#5-navbar)
6. [Hero Section](#6-hero-section)
7. [Section Structure](#7-section-structure)
8. [Components](#8-components)
9. [Footer](#9-footer)
10. [Motion & Animation](#10-motion--animation)
11. [Decorative Patterns](#11-decorative-patterns)
12. [Theme System](#12-theme-system)
13. [Favicon / Icon Family](#13-favicon--icon-family)
14. [Page Metadata](#14-page-metadata)
15. [File Structure for New Repos](#15-file-structure-for-new-repos)
16. [Cache-Busting Workflow](#16-cache-busting-workflow)
17. [Accessibility Floor](#17-accessibility-floor)
18. [How to Apply This in Another Repo](#18-how-to-apply-this-in-another-repo)

---

## 1. Identity & Voice

- **Personality:** technical, precise, craft-focused. Reads as an engineer's portfolio, not a marketing site.
- **Voice:** outcome-first, jargon last. Headlines tell the reader what they get from clicking, not what's inside.
- **Visual register:** dark canvas, single warm accent, no decorative gradients beyond the accent itself. Negative space is the primary layout tool.
- **Cultural signal:** the brand mark is the Traditional Chinese surname **吳** rendered in Songti (serif CJK). This anchors the identity culturally without requiring any English text.

### Copy rules

- **Outcome before technique.** "Aggregate categorised data 8 ways" not "Matrix Manipulation: 8 Formula Approaches."
- **One sentence per hero/headline.** If the value statement can't fit in one sentence, it isn't sharp enough yet.
- **Proper case, not ALL CAPS.** The system used to uppercase nav links; it no longer does. Reserve uppercase for: tiny monospace tags (≤0.72rem) and acronyms (CV, VBA, SQL).
- **No emoji except where the user explicitly requests it.**

---

## 2. Color Palette

The palette is **monochromatic with one warm orange accent**. All interactive elements (links, buttons, focus rings, badges, chart highlights) use the accent. Never introduce a second hue without a documented reason.

### Accent triplet

The system uses a **three-variable triplet** for every accent application:

```css
--accent          /* base color — solid fills, text, borders */
--accent-hover    /* brighter sibling — hover, active states */
--accent-glow     /* rgba with low alpha — halos, soft backgrounds */
```

When you need an alpha-channel composition (shadow, gradient, soft background), use `--accent-glow` rather than re-deriving an rgba from `--accent`. This keeps the alpha consistent across the system.

### Dark theme (default)

```css
:root {
    --bg-primary:    #000000;
    --bg-card:       #13131a;
    --bg-card-alt:   #1a1a24;
    --text-primary:  #e8e8ed;
    --text-secondary:#9ca3af;
    --text-muted:    #6b7280;

    --accent:        #FF6B00;
    --accent-hover:  #FF8C42;
    --accent-glow:   rgba(255, 107, 0, 0.15);

    --border:        #1f1f2e;
    --border-strong: #2a2a3a;
    --tag-bg:        #1a1a24;
    --tag-text:      #FF6B00;

    --shadow:        0 1px 2px rgba(0, 0, 0, 0.2);
    --shadow-hover:  0 8px 30px rgba(0, 0, 0, 0.3);
}
```

### Light theme

Light theme uses a **darker shade** of the same hue for legibility on cream backgrounds. The dark-mode `--accent-hover` doubles as the light-mode `--accent`.

```css
[data-theme="light"] {
    --bg-primary:    #f5f5f0;        /* cream, NOT white */
    --bg-card:       #ffffff;
    --bg-card-alt:   #f0efe8;
    --text-primary:  #1a1a1f;
    --text-secondary:#4a4a55;
    --text-muted:    #8a8a95;

    --accent:        #D95A00;
    --accent-hover:  #FF6B00;
    --accent-glow:   rgba(217, 90, 0, 0.10);

    --border:        #e8e6e1;
    --border-strong: #d0cdc6;
    --tag-bg:        #f0ede6;
    --tag-text:      #8A3500;

    --shadow:        0 1px 2px rgba(0, 0, 0, 0.04);
    --shadow-hover:  0 8px 30px rgba(0, 0, 0, 0.08);
}
```

### Theme color (browser chrome / iOS status bar)

```html
<meta name="theme-color" content="#000000">
```

Always black, regardless of the user's selected theme — the browser chrome should always read as "this is a dark-canvas site."

### Forbidden colors

- **No yellow / amber** (`#f59e0b`, `#fbbf24`). The brand recolored from amber to orange — treat any yellow-amber in inherited code as a bug.
- **No pure white text on accent.** `#FFFFFF` on `#FF6B00` is ~2.8:1 contrast — fails WCAG. Use `#0a0a0f` (near-black) on accent buttons; passes ~9:1.
- **No multi-stop gradients except on the accent itself**, and even then only as a subtle triplet `accent → accent-hover → accent`.
- **No green/red/blue for status (success/error/info).** Use `--accent` for emphasis and `--text-muted` for de-emphasis. If a status hue is genuinely required, ask first.

---

## 3. Typography

Four font families, each with one job. The first three load via Google Fonts; the fourth is a system CJK serif stack.

```css
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Space+Mono:ital,wght@0,400;0,700;1,400&family=JetBrains+Mono:wght@400;500;600&family=Noto+Serif+TC:wght@700&display=swap');
```

| Family | Use for | Why |
|---|---|---|
| **Outfit** | Body copy, H3-H6, UI text, button labels | Modern geometric sans with strong number glyphs — analytical without clinical |
| **Space Mono** | H1, H2, brand text, nav, callouts | Adds technical texture; signals "this person codes" |
| **JetBrains Mono** | Code blocks, formulas, inline `<code>`, meta lines, dates | Designed for code; ligatures off |
| **Songti TC + Noto Serif TC fallback** | The 吳 brand mark only | Classical brush-serif CJK; signals heritage |

### Base scale

```css
html { font-size: 18px; }              /* base rem unit — do not change */
body { line-height: 1.65; }            /* generous for reading */

h1   { font-size: clamp(2.8rem, 6vw, 4.2rem); font-weight: 900; font-family: 'Space Mono', monospace; letter-spacing: -0.03em; line-height: 1.05; }
h2   { font-size: 1.3rem;  font-weight: 700; font-family: 'Space Mono', monospace; letter-spacing: -0.02em; }
h3   { font-size: 1.05rem; font-weight: 700; font-family: 'Outfit', sans-serif; letter-spacing: -0.01em; }
h4   { font-size: 1rem;    font-weight: 600; font-family: 'Outfit', sans-serif; }

.meta  { font-family: 'JetBrains Mono', monospace; font-size: 0.76rem; color: var(--text-muted); letter-spacing: 0.01em; }
.small { font-size: 0.75rem; color: var(--text-muted); }
```

### CJK brand stack

For the 吳 mark in icons and the inline brand element:

```css
font-family: 'Songti TC', 'Songti SC', 'Noto Serif TC', 'Noto Serif CJK TC',
             'PingFang TC', 'Microsoft JhengHei', serif;
```

Per-platform behavior:
- **macOS / iOS:** renders Songti TC (system) — brushstroke serif, peak quality
- **Windows / Android / Linux with Google Fonts loaded:** renders Noto Serif TC — close approximation
- **Anything else:** falls through to PingFang (sans-CJK) or system serif — graceful degradation

### Italic emphasis trick

H1 supports a one-word accent-italic via `<em>`. This is the system's signature heading pattern.

```html
<h1>Sam <em>Ngo</em></h1>
```

```css
header h1 em {
    font-style: italic;
    color: var(--accent);
}
```

Use it once per page, on the most-personal token (surname, product name, key noun).

---

## 4. Spacing & Layout

- **Container:** `main` is `max-width: 800px; margin: 0 auto; padding: 48px 24px`. The `.wide` modifier expands to `1000px` (use for project demos with charts).
- **Hero container:** `max-width: 1100px` — wider than `main` to accommodate text + photo grid.
- **Navbar container:** `max-width: 1100px` matches the hero.
- **Section padding:** `36px 40px` desktop, `28px 24px` mobile. Sections have `border-radius: 2px` (almost square — softens corners without rounding them).
- **Vertical rhythm:** multiples of `8px`. Never use arbitrary values like `7px` or `13px`.
- **Border radius scale:**
  - `2px` — sections, cards (deliberately understated)
  - `4px` — buttons, inputs, badges, favicon canvas
  - `8px` — back-to-top button, FAB
  - `12px` — profile photo, large card thumbs
  - `50%` — theme toggle, timeline dots, orbit rings
- **Shadow philosophy:** shadows on dark backgrounds use the accent at low alpha (`var(--accent-glow)`), not black. Black shadows on black backgrounds are invisible; orange-tinted shadows give cards a warm halo.
- **Breakpoints:** `768px` (tablet/mobile divider), `600px` (small phone). Don't introduce new breakpoints without a documented reason.

---

## 5. Navbar

**Required on every site.** Fixed to top, glass-blur background, brand mark + nav links + theme toggle.

### HTML scaffold

```html
<nav class="navbar">
    <div class="nav-inner">
        <a href="index.html" class="nav-brand">Sam Ngo</a>
        <button class="nav-hamburger" aria-label="Toggle menu">&#9776;</button>
        <ul class="nav-links">
            <li><a href="index.html" class="active">Home</a></li>
            <li><a href="blog.html">Blog</a></li>
            <li><a href="tools.html">Tools</a></li>
            <li><a href="contact.html">Contact</a></li>
            <li><button class="theme-toggle" onclick="toggleTheme()" aria-label="Toggle theme">&#9790;</button></li>
        </ul>
    </div>
</nav>
```

The "Sam Ngo" text in `.nav-brand` is **overwritten at runtime by JS** with an SVG monogram (see §13). The text is what shows if JS fails; the SVG is what users see.

### CSS recipe

```css
.navbar {
    position: fixed; top: 0; left: 0; right: 0;
    z-index: 1000;
    background: var(--nav-bg);
    backdrop-filter: blur(16px) saturate(180%);
    -webkit-backdrop-filter: blur(16px) saturate(180%);
    border-bottom: 1px solid transparent;
    padding: 0 32px;
    transition: border-color 0.3s, box-shadow 0.3s;
}

.navbar.scrolled {                    /* JS toggles .scrolled past 20px */
    border-bottom-color: var(--border);
    box-shadow: 0 1px 12px rgba(0, 0, 0, 0.06);
}

.nav-inner {
    max-width: 1100px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 60px;
}

.nav-brand {
    /* JS injects SVG; CSS styles the wrapper */
    color: var(--accent);
    text-decoration: none;
    display: inline-flex;
    align-items: center;
}
.nav-brand svg { color: var(--accent); flex-shrink: 0; }

.nav-links {
    display: flex; align-items: center; gap: 32px;
    list-style: none;
}
.nav-links a {
    color: var(--nav-text);
    font-size: 0.92rem;                /* proper case, not uppercase */
    font-weight: 500;
    letter-spacing: 0.01em;
    text-decoration: none;
    opacity: 0.65;
    transition: opacity 0.25s;
    position: relative;
}
.nav-links a:hover,
.nav-links a.active {
    opacity: 1;
    color: var(--nav-text);
}
.nav-links a.active::after {           /* 1.5px accent underline on active */
    content: '';
    position: absolute;
    bottom: -4px; left: 0; right: 0;
    height: 1.5px;
    background: var(--accent);
}

.theme-toggle {
    background: none;
    border: 1px solid var(--border);
    border-radius: 50%;                /* circular */
    width: 36px; height: 36px;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    color: var(--nav-text);
    font-size: 0.95rem;
    transition: background 0.2s, border-color 0.2s;
}
.theme-toggle:hover {
    background: var(--accent-glow);
    border-color: var(--accent);
}

.nav-hamburger {
    display: none;                     /* hidden on desktop */
    background: none; border: none;
    font-size: 1.3rem; padding: 4px;
    cursor: pointer;
    color: var(--nav-text);
}

@media (max-width: 768px) {
    .navbar { padding: 0 20px; }
    .nav-hamburger { display: block; }
    .nav-links {
        display: none;                 /* collapsed by default */
        position: absolute;
        top: 60px; left: 0; right: 0;
        background: var(--nav-bg);
        backdrop-filter: blur(16px);
        flex-direction: column;
    }
    .nav-links.open { display: flex; } /* JS toggles .open on hamburger click */
}
```

### Required variables

```css
:root {
    --nav-bg:   rgba(0, 0, 0, 0.92);
    --nav-text: #e8e8ed;
}
[data-theme="light"] {
    --nav-bg:   rgba(245, 245, 240, 0.92);
    --nav-text: #1a1a1f;
}
```

### Five rules the navbar must follow

1. **Fixed position with glass blur.** Don't replace with a `relative` static navbar — the glass blur is part of the identity.
2. **Brand on the left, links on the right.** Never center the brand.
3. **Nav links are proper case**, not uppercase. The exception is acronyms in link text (e.g. "CV", "API").
4. **The active link gets a 1.5px accent underline**, 4px below the text. Don't replace with a background pill or color swap.
5. **The theme toggle is a circular 36px button** with a Unicode crescent `&#9790;` or sun glyph. Don't use an SVG icon library here.

---

## 6. Hero Section

**Required on every site.** Four stacked z-layers create the signature depth.

### Anatomy

```
z: 0   <header> background — solid theme color
z: 0   ::before / ::after — two animated orbit rings (decorative)
z: 0   <canvas> — particle layer (JS-driven)
z: 1   .hero-inner — content grid (text + photo)
```

Skipping the orbits or the particle layer flattens the look and the hero stops feeling like *this* identity. Keep all four.

### HTML scaffold

```html
<header>
    <canvas id="hero-particles" class="hero-canvas"></canvas>
    <div class="hero-inner">
        <div class="hero-text">
            <div class="hero-label hero-reveal">Senior Analyst</div>
            <h1 class="hero-reveal">Sam <em>Ngo</em></h1>
            <p class="headline hero-reveal">One-sentence value statement, max 25 words.</p>
            <p class="location hero-reveal">Sydney, NSW — Australia</p>
            <div class="header-actions hero-reveal">
                <a class="btn btn-primary">Primary CTA</a>
                <a class="btn btn-outline">Secondary</a>
                <a class="btn btn-outline">Tertiary</a>
            </div>
            <div class="contact-bar hero-reveal">
                <a href="mailto:...">email@domain.com</a>
            </div>
        </div>
        <div class="hero-photo hero-reveal">
            <img src="profile.jpg" class="profile-pic float-gentle" loading="eager">
        </div>
    </div>
</header>
```

### CSS recipe

```css
header {
    background: var(--hero-bg);
    color: var(--hero-text);
    padding: 140px 32px 80px;          /* 140px top accounts for fixed nav */
    position: relative;
    overflow: hidden;                  /* clip orbit rings */
}

/* Animated orbit rings */
header::before {
    content: '';
    position: absolute;
    top: -120px; right: -80px;
    width: 400px; height: 400px;
    border: 1px solid var(--hero-orbit);
    border-radius: 50%;
    animation: orbit-slow 25s linear infinite;
    pointer-events: none;
}
header::after {
    content: '';
    position: absolute;
    bottom: -200px; left: -100px;
    width: 500px; height: 500px;
    border: 1px solid var(--hero-orbit-lg);
    border-radius: 50%;
    animation: orbit-slow 35s linear infinite reverse;
    pointer-events: none;
}
@keyframes orbit-slow {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
}

.hero-canvas {
    position: fixed; top: 0; left: 0;
    width: 100vw; height: 100vh;
    pointer-events: none;
    z-index: 0;
}

.hero-inner {
    max-width: 1100px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 48px;
    align-items: center;
    position: relative; z-index: 1;
}

/* Eyebrow label with 24px dash before it */
.hero-label {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.72rem;
    font-weight: 500;
    text-transform: uppercase;          /* allowed here — eyebrow convention */
    letter-spacing: 0.2em;
    color: var(--accent);
    margin-bottom: 16px;
    display: flex; align-items: center; gap: 10px;
}
.hero-label::before {                   /* the signature 24px dash */
    content: '';
    width: 24px; height: 1px;
    background: var(--accent);
}

header h1 em {
    font-style: italic;
    color: var(--accent);
}

header p.headline {
    font-size: 1.1rem;
    color: var(--hero-muted);
    max-width: 440px;
    line-height: 1.6;
}

header p.location {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.78rem;
    color: var(--hero-muted);
    margin-top: 8px;
    letter-spacing: 0.02em;
}

.profile-pic {
    width: 200px; height: 200px;
    border-radius: 12px;
    object-fit: cover;
    border: 2px solid rgba(255, 107, 0, 0.4);
    box-shadow: var(--hero-pic-shadow);
    transition: transform 0.4s ease, box-shadow 0.4s ease;
}
.profile-pic:hover {
    transform: scale(1.02);
    box-shadow: var(--hero-pic-shadow-hover);
}

@media (max-width: 768px) {
    header { padding: 110px 20px 60px; }
    .hero-inner { grid-template-columns: 1fr; gap: 32px; }
    .hero-photo { order: -1; }          /* photo above text on mobile */
    .profile-pic { width: 120px; height: 120px; }
}
```

### Required variables

```css
:root {
    --hero-bg:               #000000;
    --hero-text:             #e8e8ed;
    --hero-muted:            #6b7280;
    --hero-orbit:            rgba(255, 107, 0, 0.12);
    --hero-orbit-lg:         rgba(255, 107, 0, 0.06);
    --hero-btn-border:       rgba(255, 255, 255, 0.2);
    --hero-pic-shadow:       0 0 30px rgba(255, 107, 0, 0.15), 0 20px 60px rgba(0, 0, 0, 0.5);
    --hero-pic-shadow-hover: 0 0 40px rgba(255, 107, 0, 0.25), 0 20px 60px rgba(0, 0, 0, 0.5);
}
[data-theme="light"] {
    --hero-bg:               #f5f5f0;
    --hero-text:             #1a1a1f;
    --hero-muted:            #6b7280;
    --hero-orbit:            rgba(217, 90, 0, 0.10);
    --hero-orbit-lg:         rgba(217, 90, 0, 0.05);
    --hero-btn-border:       rgba(26, 26, 31, 0.18);
    --hero-pic-shadow:       0 0 30px rgba(217, 90, 0, 0.12), 0 12px 40px rgba(0, 0, 0, 0.1);
    --hero-pic-shadow-hover: 0 0 40px rgba(217, 90, 0, 0.2), 0 12px 40px rgba(0, 0, 0, 0.12);
}
```

### Five rules the hero must follow

1. **H1 uses split emphasis** — wrap the most personal token in `<em>` for accent-italic.
2. **Eyebrow has a 24px dash rule before it.** Not an icon, not a bullet. A horizontal accent line.
3. **Orbit rings are non-negotiable.** They define the layered depth.
4. **Photo on top on mobile**, not below — `order: -1` on `.hero-photo`.
5. **Headline is one sentence, max 25 words.** No exceptions.

### Variations for non-portfolio sites

| Site type | Eyebrow | H1 split | Photo slot | CTA |
|---|---|---|---|---|
| Personal portfolio | Job title | Name (surname italic) | Profile photo | Download CV |
| Product / tool | Tagline | Product name (key noun italic) | Product screenshot or icon | Try it / GitHub |
| Documentation | "Documentation" | Project name | Logo (or omit) | Get started |
| Blog | "Writing" | Author or blog name | Author photo (or omit) | Latest post |

---

## 7. Section Structure

The site is composed of stacked `<section>` blocks inside `<main>`. Each section is a card with a code-comment-style header.

### HTML scaffold

```html
<main>
    <section class="fade-in" id="about">
        <h2>About</h2>
        <p class="summary-text">...</p>
    </section>

    <section class="fade-in section-alt" id="experience">
        <h2>Experience</h2>
        ...
    </section>
</main>
```

### CSS recipe

```css
main {
    max-width: 800px;
    margin: 0 auto;
    padding: 48px 24px;
}
main.wide { max-width: 1000px; }       /* opt-in wider container */

section {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 2px;                /* almost square — deliberate */
    padding: 36px 40px;
    margin-bottom: 20px;
    transition: background 0.3s, border-color 0.3s;
    position: relative;
}

section h2 {
    font-family: 'Space Mono', monospace;
    font-size: 1.3rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 24px;
    margin-left: -40px;                /* extend H2 underline edge to edge */
    margin-right: -40px;
    padding: 0 40px 12px;
    border-bottom: 1px solid var(--border);
    letter-spacing: -0.02em;
}

section h2::before {
    content: '// ';                    /* code-comment marker */
    color: var(--accent);
    font-weight: 400;
}
```

### Three rules

1. **Every H2 starts with `// `** in the accent color. This is the system's signature. It declares "this is an engineering site."
2. **H2 underline goes edge-to-edge** of the section card via negative margins. It's a typographic divider, not a text underline.
3. **Section cards are nearly-square** (`border-radius: 2px`), not rounded. The squareness signals "structured" / "data."

---

## 8. Components

### Button — primary

```css
.btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 11px 24px;
    border-radius: 4px;
    font-family: 'Outfit', sans-serif;
    font-size: 0.85rem;
    font-weight: 600;
    text-decoration: none;
    transition: all 0.25s ease;
    border: none;
    cursor: pointer;
    letter-spacing: 0.01em;
}

.btn-primary {
    background: var(--accent);
    color: #0a0a0f;                    /* near-black on orange — passes AA */
}
.btn-primary:hover {
    background: var(--accent-hover);
    color: #0a0a0f;
    box-shadow: 0 4px 20px rgba(255, 107, 0, 0.3);
}

.btn-outline {
    background: transparent;
    color: var(--hero-text);
    border: 1px solid var(--hero-btn-border);
}
.btn-outline:hover {
    border-color: var(--accent);
    color: var(--accent);
    background: rgba(255, 107, 0, 0.06);
}
```

**Contrast rule:** primary button text is always `#0a0a0f` (near-black). White on orange fails WCAG. Don't switch to white because "it looks cleaner."

### Card

The `.card` is the project/blog tile. It uses a left-border-grow hover trick.

```css
.card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;
}

.card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 2px;
    padding: 28px 24px;
    transition: all 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    text-decoration: none;
    color: inherit;
    display: block;
    position: relative;
    overflow: hidden;
}

.card::before {                        /* left accent bar — grows on hover */
    content: '';
    position: absolute;
    top: 0; left: 0;
    width: 2px;
    height: 0;
    background: var(--accent);
    transition: height 0.35s ease;
}

.card:hover {
    border-color: var(--accent);
    box-shadow: 0 0 20px var(--accent-glow), var(--shadow-hover);
    transform: translateY(-4px);
    color: inherit;
}
.card:hover::before { height: 100%; }
```

### Tag / badge

```css
.card-tag {
    font-family: 'JetBrains Mono', monospace;
    background: var(--tag-bg);
    color: var(--tag-text);
    padding: 3px 10px;
    border-radius: 2px;
    font-size: 0.68rem;
    font-weight: 500;
    letter-spacing: 0.04em;
    text-transform: uppercase;         /* tiny mono tags ARE allowed uppercase */
}
```

### Form input

```css
.form-group input,
.form-group textarea {
    padding: 12px 16px;
    border: 1px solid var(--border);
    border-radius: 2px;
    font-size: 0.9rem;
    font-family: 'Outfit', sans-serif;
    background: var(--bg-card-alt);
    color: var(--text-primary);
    transition: border-color 0.2s, box-shadow 0.2s;
}
.form-group input:focus,
.form-group textarea:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px var(--accent-glow);
    outline: none;
}

.form-group label {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.72rem;
    font-weight: 600;
    color: var(--text-muted);
    text-transform: uppercase;         /* tiny mono label — allowed */
    letter-spacing: 0.1em;
}
```

### Skill bar

```css
.skill-bar-track {
    height: 4px;
    background: var(--bg-card-alt);
    border-radius: 2px;
    overflow: hidden;
}
.skill-bar-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--accent), var(--accent-hover));
    width: 0;
    transition: width 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
.fade-in.visible .skill-bar-fill { width: var(--target-width); }
```

JS sets `--target-width` from the `data-width` attribute when the parent enters the viewport.

### Timeline (experience / education list)

```css
.experience-item {
    margin-bottom: 28px;
    padding-left: 24px;
    position: relative;
}
.experience-item::before {              /* vertical line */
    content: '';
    position: absolute;
    left: 0; top: 8px; bottom: -28px;
    width: 1px;
    background: var(--timeline-line);
}
.experience-item::after {               /* accent dot at top */
    content: '';
    position: absolute;
    left: -3px; top: 8px;
    width: 7px; height: 7px;
    border-radius: 50%;
    background: var(--accent);
    border: 2px solid var(--bg-card);
    box-shadow: 0 0 0 2px var(--accent);
}
```

Use for any chronological list (work history, education, version history, changelog).

---

## 9. Footer

Minimal, centered, with a JS-injected brand mark above a tagline and link row.

### HTML scaffold

```html
<footer>
    <div class="footer-logo"></div>                             <!-- JS fills this -->
    <div class="footer-tagline">Finance · Data · Visualization</div>
    <div class="footer-links">
        <a href="mailto:...">Email</a>
        <a href="..." target="_blank">LinkedIn</a>
        <a href="..." target="_blank">GitHub</a>
    </div>
    &copy; 2026 Sam Ngo
</footer>
```

### CSS recipe

```css
footer {
    text-align: center;
    padding: 48px 24px 32px;
    color: var(--text-muted);
    font-size: 0.8rem;
    border-top: 1px solid var(--border);
}

.footer-logo { margin-bottom: 8px; }
.footer-logo svg {
    color: var(--accent);
    opacity: 0.6;                      /* footer logo is dimmer than nav */
}

.footer-tagline {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.68rem;
    color: var(--text-muted);
    letter-spacing: 0.08em;
    margin-bottom: 16px;
    opacity: 0.6;
}

.footer-links {
    display: flex;
    justify-content: center;
    gap: 28px;
    margin-bottom: 10px;
}
.footer-links a {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.72rem;
    text-transform: uppercase;         /* tiny mono — allowed */
    letter-spacing: 0.1em;
}
footer a {
    color: var(--text-muted);
    transition: color 0.2s;
}
footer a:hover { color: var(--accent); }
```

### Three rules

1. **Centered layout, never sidebar / multi-column.** The footer is a sign-off, not a sitemap.
2. **The brand mark goes above the tagline**, both dimmed (`opacity: 0.6`). Don't increase opacity — the footer should recede.
3. **Copyright is plain text, no styling.** Bottom of the stack, ©︎ year + name.

---

## 10. Motion & Animation

The system uses **two named keyframes** and a **scroll-revealed fade-in pattern**.

### Keyframes registry

```css
@keyframes orbit-slow {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
}

@keyframes skeleton-shimmer {           /* for loading states */
    0%   { background-position: -200% 0; }
    100% { background-position: 200% 0; }
}
```

### Scroll-revealed sections

```css
.fade-in {
    opacity: 0.15;
    transform: translateY(12px);
    transition: opacity 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94),
                transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
.fade-in.visible {
    opacity: 1;
    transform: translateY(0);
}

/* Staggered children — feels handcrafted */
.fade-in:nth-child(2) { transition-delay: 0.06s; }
.fade-in:nth-child(3) { transition-delay: 0.12s; }
.fade-in:nth-child(4) { transition-delay: 0.18s; }
.fade-in:nth-child(5) { transition-delay: 0.24s; }
```

JS uses `IntersectionObserver` to add `.visible` when elements enter the viewport (threshold: 0.1).

### Hero reveal sequence

Hero content cascades in via `.hero-reveal` class. Same observer pattern; staggered delays per element (0s, 0.1s, 0.2s, 0.3s, 0.4s).

### Motion rules

1. **Easing is always `cubic-bezier(0.25, 0.46, 0.45, 0.94)`** (ease-out-quart-like). Don't use `ease-in-out` — feels sluggish.
2. **Durations:** `0.2s` for hover/state changes, `0.35s` for cards/buttons, `0.5s` for fade-ins, `0.4s` for theme switches.
3. **Respect `prefers-reduced-motion`** — wrap orbit + canvas animations in:
   ```css
   @media (prefers-reduced-motion: reduce) {
       *, *::before, *::after {
           animation-duration: 0.01ms !important;
           transition-duration: 0.01ms !important;
       }
   }
   ```

---

## 11. Decorative Patterns

These are **system-level decorations** that should appear on every page.

### Grain overlay (subtle dot grid)

```css
body::after {
    content: '';
    position: fixed;
    top: 0; left: 0;
    width: 100%; height: 100%;
    pointer-events: none;
    z-index: 9999;
    opacity: var(--grain-opacity);     /* 0.04 dark / 0.03 light */
    background-image: radial-gradient(circle, var(--text-muted) 0.5px, transparent 0.5px);
    background-size: 24px 24px;
}
```

This is what gives the site its subtle "engineered paper" texture. Don't remove it.

### Canvas particle field

In `assets/js/shared.js`, a three-layer parallax particle system renders behind the hero. Particles use `color: '255, 107, 0'` (RGB triplet of the accent). Three layers:

| Layer | Speed | Size | Alpha | Parallax |
|---|---|---|---|---|
| Back | 0.12 | 0.5–1.2 | 0.15–0.3 | 0.02 |
| Mid | 0.25 | 1.0–2.2 | 0.35–0.6 | 0.05 |
| Front | 0.45 | 1.8–3.5 | 0.55–0.85 | 0.10 |

Layered particles connect to neighbors within `lineDist` pixels via translucent lines — a "constellation" effect.

### Section accent dividers

Between major sections, optional `<div class="section-accent-divider"></div>` provides a thin accent-colored centered rule. Use sparingly — one or two per page.

---

## 12. Theme System

Dual theme: dark (default) + light. Toggled via `data-theme="light"` on `<html>`.

### JS skeleton

```js
function toggleTheme() {
    const html = document.documentElement;
    const current = html.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    updateThemeIcon(next);
}

// On load
(function() {
    const saved = localStorage.getItem('theme')
        || (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
    document.documentElement.setAttribute('data-theme', saved);
})();
```

### Toggle icon

Crescent moon `&#9790;` (☾) in dark mode (indicates "switch to light"); sun `&#9728;` (☀) in light mode. Don't use SVG icons here — the Unicode glyphs are intentional.

### Theme transition

Add to body to soften the swap:

```css
body { transition: background 0.4s ease, color 0.4s ease; }
```

---

## 13. Favicon / Icon Family

The icon family lives at `assets/img/`:

- `favicon.svg` — primary, 32×32 viewBox, rendered in browser tabs
- `apple-touch-icon.png` — 180×180 raster for iOS home screen
- `icon-192.png`, `icon-512.png` — PWA install icons declared in `manifest.json`

### Design pattern

- Black rounded square (`rx="4"`)
- Thin orange border at 0.3 opacity
- Four corner accent dots at 0.4 opacity
- **吳** (Traditional Chinese surname) in Songti TC serif, accent gradient, subtle glow
- A thin divider line and **"CV"** label below the character in monospace

### Required SVG (canonical favicon source)

```html
<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="accent-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FF6B00"/>
      <stop offset="60%" stop-color="#FF8C42"/>
      <stop offset="100%" stop-color="#FF6B00"/>
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="0.3" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <rect width="32" height="32" rx="4" fill="#000000"/>
  <rect x="0.5" y="0.5" width="31" height="31" rx="3.5" fill="none" stroke="#FF6B00" stroke-width="0.5" opacity="0.3"/>
  <circle cx="3.2" cy="3.2"  r="0.5" fill="#FF6B00" opacity="0.4"/>
  <circle cx="28.8" cy="3.2" r="0.5" fill="#FF6B00" opacity="0.4"/>
  <circle cx="3.2" cy="28.8" r="0.5" fill="#FF6B00" opacity="0.4"/>
  <circle cx="28.8" cy="28.8" r="0.5" fill="#FF6B00" opacity="0.4"/>
  <text x="16" y="19" text-anchor="middle"
        font-family="'Songti TC', 'Songti SC', 'Noto Serif TC', 'Noto Serif CJK TC', 'PingFang TC', 'Microsoft JhengHei', serif"
        font-size="18" font-weight="700"
        fill="url(#accent-grad)" filter="url(#glow)">吳</text>
  <line x1="12" y1="22.5" x2="20" y2="22.5" stroke="#FF6B00" stroke-width="0.3" opacity="0.5"/>
  <text x="16" y="28.5" text-anchor="middle"
        font-family="'Space Mono', 'SF Mono', 'Consolas', monospace"
        font-size="5" font-weight="700" letter-spacing="1"
        fill="#FF6B00" opacity="0.85">CV</text>
</svg>
```

### Raster generation (macOS)

```bash
cd assets/img/
mkdir -p .tmp
sed -E 's/width="32" height="32"/width="512" height="512"/' favicon.svg > .tmp/icon-512.svg
qlmanage -t -s 512 -o .tmp .tmp/icon-512.svg
cp .tmp/icon-512.svg.png icon-512.png
sips -z 192 192 .tmp/icon-512.svg.png --out icon-192.png
sips -z 180 180 .tmp/icon-512.svg.png --out apple-touch-icon.png
rm -rf .tmp
```

### Inline brand mark (nav + footer)

The `getBrandLogoSVG(size)` factory in `shared.js` produces a simplified inline SVG (just the character + rounded border, no CV label or corner dots). At 24–28px the decorations become noise; the inline version strips them.

### For new repos

Copy the favicon SVG above, replace `吳` with the new identity's character (a different surname, an initial, a glyph), and replace `CV` with that repo's tagline (`API`, `LAB`, `DEV`, omit entirely if the icon is busy).

---

## 14. Page Metadata

Every page needs this `<head>` block. Skip nothing.

```html
<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{Page Title} — Sam Ngo</title>
    <meta name="description" content="{One-sentence value statement, ~150 chars}">
    <meta name="theme-color" content="#000000">
    <link rel="icon" type="image/svg+xml" href="assets/img/favicon.svg?v=3">
    <link rel="apple-touch-icon" href="assets/img/apple-touch-icon.png?v=3">
    <link rel="manifest" href="manifest.json">
    <link rel="canonical" href="https://sampi314.github.io/.../">

    <!-- Open Graph -->
    <meta property="og:title" content="{Same as <title>}">
    <meta property="og:description" content="{Same as meta description}">
    <meta property="og:image" content="https://.../og-image.png">
    <meta property="og:url" content="https://.../">
    <meta property="og:type" content="website">

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="{...}">
    <meta name="twitter:description" content="{...}">
    <meta name="twitter:image" content="https://.../og-image.png">

    <!-- JSON-LD structured data -->
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "Person",
        "name": "Sam Ngo",
        "jobTitle": "Senior Analyst",
        "url": "https://sampi314.github.io/"
    }
    </script>

    <link rel="stylesheet" href="assets/css/style.css?v=7">
</head>
```

### Required PWA manifest (`manifest.json`)

```json
{
  "name": "Sam Ngo",
  "short_name": "吳",
  "description": "...",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#000000",
  "theme_color": "#000000",
  "icons": [
    { "src": "assets/img/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "assets/img/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

---

## 15. File Structure for New Repos

Every new website built under this system follows this directory layout:

```
repo-name/
├── index.html
├── 404.html
├── about.html / contact.html / ...
├── projects/
│   └── project-*.html
├── blog/
│   └── blog-*.html
├── assets/
│   ├── css/
│   │   └── style.css                  ← single stylesheet
│   ├── js/
│   │   └── shared.js                  ← single behavior script
│   └── img/
│       ├── favicon.svg
│       ├── apple-touch-icon.png
│       ├── icon-192.png
│       ├── icon-512.png
│       └── profile.jpg
├── manifest.json
├── robots.txt
├── sitemap.xml
├── design.md                          ← copy or link from main repo
├── CLAUDE.md                          ← references design.md
└── README.md
```

**Don't introduce build tooling** unless the project genuinely needs it. The system is plain HTML/CSS/JS so any contributor (including Claude in a fresh repo) can edit a file and reload. Bundlers, frameworks, and component libraries are explicit deviations that require justification.

---

## 16. Cache-Busting Workflow

Every visual change requires bumping the relevant `?v=N` query string so returning visitors fetch new assets. The system uses **per-asset version counters**, not a global one.

### Current versions (update these as you go)

| Asset | Version | Bump when… |
|---|---|---|
| `style.css` | `?v=7` | any CSS change |
| `shared.js` | `?v=3` | any JS change |
| `favicon.svg` | `?v=3` | favicon SVG changes |
| `apple-touch-icon.png` | `?v=3` | favicon family regenerated |

### Sweep command

When bumping `style.css` from `v=7` to `v=8` across all HTML:

```bash
find . -name "*.html" -type f -exec sed -i '' \
  -e 's|style\.css?v=7|style.css?v=8|g' \
  {} \;
```

(macOS sed uses `-i ''`; GNU sed on Linux uses `-i` with no argument.)

### Three rules

1. **Never ship a CSS/JS change without bumping the cache-bust.** Returning visitors will see stale styles for hours/days otherwise.
2. **Coordinate bumps in one commit.** If a change touches CSS, JS, and the favicon, bump all three together. Mixed-version states (new CSS, old JS) look broken.
3. **Keep this table in sync.** When you bump in code, update the version row in this doc.

---

## 17. Accessibility Floor

Every page should hit these baselines:

- **Contrast:** body text ≥ 4.5:1 vs background. Accent text ≥ 4.5:1 vs background. Accent on accent (button) ≥ 7:1 (we use near-black on orange — passes).
- **Focus rings:** every interactive element gets a visible focus state. Don't `outline: none` without a replacement.
   ```css
   :focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
   ```
- **ARIA labels:** icon-only buttons (theme toggle, hamburger, back-to-top) must have `aria-label`.
- **`alt` text:** every `<img>` either has descriptive `alt` or `alt=""` (decorative). Never omit.
- **Reduced motion:** respect `prefers-reduced-motion: reduce` (see §10).
- **Semantic HTML:** `<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`, `<article>`. Don't use `<div>` where a semantic element fits.
- **Skip link:** include `<a href="#main" class="skip-link">Skip to content</a>` as the first focusable element, visually hidden until focused.

---

## 18. How to Apply This in Another Repo

When starting a new repo that should match this identity:

1. **Copy `design.md`** to the new repo's root (or symlink it). Treat this doc as a dependency, not a template.

2. **Copy the variable triplet and theme variables** (§2, §5, §6, §12) into the new repo's `style.css`. This is the most-load-bearing 60 lines of the system.

3. **Import the same fonts** (§3). All four families, even if you only use one — consistent fallback chains matter, and webfont latency is amortized across pages.

4. **Add a CLAUDE.md** at the new repo's root with this content:
   ```md
   # Project Context

   ## Visual identity
   This project follows the Sam Ngo Universal Design System.
   See: design.md (in this repo) — or canonical at:
   https://github.com/Sampi314/Sam-Personal-Profile/blob/main/design.md

   When generating UI code, use the variable triplet from §2 and the
   component recipes from §5-§9. Do not introduce non-system colors,
   fonts, or component patterns without flagging the deviation.

   When implementing a page, follow the page metadata block from §14
   and the file structure from §15.
   ```

5. **Set up the canonical pages first**, in this order:
   1. `index.html` — navbar + hero + ≥3 sections + footer
   2. `404.html` — minimal navbar + centered error + footer
   3. `manifest.json` — fill in name/short_name/icon paths
   4. Page-specific files

6. **For favicons**, swap the `吳` character to that repo's identity (a different surname, an initial, a glyph) and update `manifest.json` `short_name` to match. Keep the same black/orange canvas + label pattern from §13.

7. **For non-portfolio sites**, see the variations table in §6.

When in doubt, look at how `index.html` and `style.css` in `Sam-Personal-Profile` use a variable, and mirror that pattern. The system optimizes for *predictability across repos*, not novelty within one.

---

_Last meaningful update: 2026-06-13. When you change the visual system, update this doc first._
