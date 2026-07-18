---
version: alpha
name: "Whimsical"
website: "https://whimsical.com"
description: >-
  A collaborative diagramming app whose marketing site treats deep purple as the entire above-fold canvas — the hero is a violet-to-magenta gradient field carrying a 96px Agrandir display headline in white ("Where great ideas take shape"), a dark plum CTA pill, and a tilted laptop mockup showing the editor surface with rainbow-colored sticky-note nodes. Below the fold the page inverts to a warm off-white #f5f4f5 canvas, with section headings in 48px Agrandir bold and rounded illustrated cards in lavender, mint, and aqua tints. Manrope at 13–16px in weights 500–700 carries every chrome label and body paragraph; Agrandir is the display voice running from 48px up to a 96px hero. The radius scale jumps from 12px utility rounding straight to 80–160px super-rounded illustrative cards.

seo:
  title: "Whimsical Design System for React — purple gradient hero, Agrandir display, Manrope body"
  metaDescription: "Whimsical's marketing site uses a violet-to-magenta gradient as the entire above-fold canvas, with 96px Agrandir display in white. Tokens for React, Next.js, and AI coding tools."
  highlights:
    - "Violet-to-magenta gradient hero — the above-fold is a purple gradient field rather than a flat surface, with a grain texture overlay riding on top"
    - "Two-face display + body — Agrandir at 48–96px for every display moment, Manrope at 13–16px in weights 500–700 for every chrome label"
    - "Deep plum base #250835 — the darkest tone in the system, used as the primary CTA fill and as the shadow ink across every cream-card lift"
    - "Super-rounded illustrative cards — radii jump from 12px utility rounding to 80–160px on the rainbow-colored feature cards below the fold"
    - "Rainbow product palette — sticky-note nodes in mint, aqua, blue, purple, hot-pink, and yellow render the editor canvas inside the laptop mockup"
  tags:
    - "Productivity & SaaS"
    - "Design & Creative Tools"
  lastUpdated: "2026-05-19"
  author:
    name: "Dov Azencot"
    url: "https://x.com/dovazencot"
  opening: |
    Whimsical's marketing site does something most diagramming brands avoid: it gives the hero a saturated gradient instead of a flat surface. The above-fold is a violet-to-magenta gradient field (deep plum at the corners, lavender toward the center, with a grain texture overlay riding on top), carrying a 96px Agrandir display headline in white ("Where great ideas take shape"), a dark plum CTA pill, and a tilted laptop mockup showing the Whimsical editor surface with rainbow-colored sticky-note nodes — mint, aqua, blue, purple, hot-pink, yellow — laid out across a flow diagram. Where Figma and Miro keep their hero canvases on white or near-white, and Notion sits on a warm cream surface, Whimsical paints the entire above-fold with the brand's purple territory and lets the editor mockup carry the chromatic variety.

    The DESIGN.md file packages the system into a machine-readable spec for React tooling. Inside: 9 color tokens organized around a deep plum base (#250835), a near-white off-canvas (#ffffff at 96.8% lightness), a soft lilac surface tier (#efe3ed), and a brand purple ladder spanning lavender to magenta. 14 typography tokens cover Agrandir display in five sizes (24px / 48px / 64px / 72px / 96px at weight 700 with tight negative letter-spacing) and Manrope in seven sizes (9px / 12px / 13px / 14px / 16px in weights 500–700, plus an uppercase kicker tier at 9px with 1.35px tracking). A radius scale split into utility tier (8–16px) and illustrative tier (80–160px). 16 components covering the gradient hero, the dark plum CTA pill, the lavender illustrated card, the laptop mockup frame, the section-header kicker, and the top-nav.

    Feed this file to Claude or Cursor and it reproduces Whimsical's specific moves: violet-to-magenta gradient hero instead of a flat surface, deep plum as the load-bearing CTA fill, Agrandir display at weight 700 with tight negative tracking, Manrope chrome at 13–16px with the uppercase 9px kicker tier, and the binary radius split between 12px utility rounding and 80–160px illustrative rounding. The one move worth borrowing only if your product surface is itself visually rich: the willingness to let the editor mockup do all the chromatic variety while the marketing chrome stays inside the purple gradient.
  related:
    - href: "/design"
      title: "Browse all design systems"
      description: "The full directory of DESIGN.md files on shadcn.io, with live mockups for each."
    - href: "https://whimsical.com"
      title: "Whimsical — official site"
      description: "Whimsical's public marketing site — the source of truth for the live tokens captured in this file."
    - href: "https://github.com/google-labs-code/design.md"
      title: "The DESIGN.md specification"
      description: "Google Labs' open spec for machine-readable design system files — the format this page is built on."
  questions:
    - id: "primary-color"
      title: "What is Whimsical's primary brand color?"
      answer: "Whimsical's brand voltage is a deep plum at #250835 — wired in CSS as --purple-800 and --base-800, and used as the primary CTA fill, the body-shadow ink under every cream card, and the lower-stop on every brand gradient. It appears 19 times across the captured page: 10 as shadow ink, 8 inside gradients, and 1 as a flat background fill. The hero gradient itself runs from this plum at the bottom-left through a mid-violet around 50% to a lavender pink (#ba59ff) at the top-right. The purple is held against off-white surfaces below the fold and against rainbow product nodes inside the laptop mockup."
    - id: "typography"
      title: "What typeface does Whimsical use, and what should I use as a substitute?"
      answer: "Whimsical pairs Agrandir for display and Manrope for chrome. Agrandir runs at 24px / 48px / 64px / 72px / 96px in weight 700 with tight negative letter-spacing (-0.24px on h3, -0.64px on h1, -0.96px on the 96px hero); it carries the hero headline and every section header. Manrope runs at 9px / 12px / 13px / 14px / 16px in weights 500–700; it carries the nav links, the CTA pill labels, body paragraphs, and an uppercase kicker tier (9px / 700 / 1.35px tracking). For Agrandir, the closest open-source substitute is Avenir or Inter at the same sizes; for Manrope, Manrope is itself open-source and can be used directly."
    - id: "gradient-hero"
      title: "Why does Whimsical use a gradient hero instead of a flat surface?"
      answer: "Whimsical's hero is a violet-to-magenta gradient field that runs the deep plum #250835 at the corners through a mid-violet around 50% to a lavender pink #ba59ff toward the top-right, with a 15-percent grain texture riding on top (wired as --gradient-primary-vertical in the CSS). A flat purple would conflict with the editor mockup's rainbow sticky-note nodes — the gradient absorbs them into a single chromatic mood. Below the fold the gradient gives way to a warm off-white canvas and the rainbow product palette returns inside lavender / mint / aqua illustrated cards. The hero is the only gradient surface; everything below is flat."
    - id: "rounded-style"
      title: "What is Whimsical's corner-radius philosophy?"
      answer: "The radius scale is binary: utility tier and illustrative tier. The utility tier runs 8px (9 occurrences, used on dropdowns and small chips), 12px (13 occurrences, the dominant rounding — used on the CTA pill, the nav-link hover pills, and most cards), and 16px (7 occurrences, used on the larger illustrated cards). The illustrative tier jumps straight to 80px / 120px / 160px — used on the rainbow-colored super-rounded feature cards below the fold (the lavender flow-chart card, the mint wireframes card, the aqua diagrams card). There is no 24 / 32 / 48px middle tier. The jump is intentional: the small radii read as utility chrome; the giant radii read as illustrative shapes that belong with the laptop mockup."
    - id: "use-in-project"
      title: "Can I use this DESIGN.md to build my own diagramming or visual-thinking app?"
      answer: "Yes — the file is designed to be fed into Claude, Cursor, or any AI tool that reads structured design tokens. The agent will reproduce Whimsical's specific moves: violet-to-magenta gradient hero with grain texture, deep plum CTA fill against white text, Agrandir at weight 700 with tight negative tracking for every display, Manrope chrome at 13–16px with an uppercase 9px kicker tier, and the binary radius split between 12px utility and 80–160px illustrative rounding. The token references resolve cleanly: every hex, font name, radius, and spacing value is a quoted scalar you can paste into Tailwind config or CSS variables. The gradient-hero move only works if your product surface itself carries enough rainbow color to need absorbing into a single chromatic mood."

mockups:
  - "marketing-hero"
  - "dashboard-card-grid"

colors:
  primary: "#250835"
  primary-light: "#ba59ff"
  primary-pale: "#e9bded"
  surface-lilac: "#efe3ed"
  accent-magenta: "#ff59f1"
  accent-aqua: "#3ca1ff"
  accent-blue-pale: "#bbcfe4"
  canvas: "#ffffff"
  ink-black: "#000000"

typography:
  display-xl:
    fontFamily: "Agrandir, Avenir, Montserrat, Corbel, \"URW Gothic\", source-sans-pro, sans-serif"
    fontSize: 96px
    fontWeight: 700
    lineHeight: 96px
    letterSpacing: "-0.96px"
  display-lg:
    fontFamily: "Agrandir, Avenir, Montserrat, Corbel, \"URW Gothic\", source-sans-pro, sans-serif"
    fontSize: 72px
    fontWeight: 700
    lineHeight: 72px
    letterSpacing: "-0.96px"
  display-md:
    fontFamily: "Agrandir, Avenir, Montserrat, Corbel, \"URW Gothic\", source-sans-pro, sans-serif"
    fontSize: 64px
    fontWeight: 700
    lineHeight: 70.4px
    letterSpacing: "-0.64px"
  display-sm:
    fontFamily: "Agrandir, Avenir, Montserrat, Corbel, \"URW Gothic\", source-sans-pro, sans-serif"
    fontSize: 48px
    fontWeight: 700
    lineHeight: 52.8px
    letterSpacing: 0
  heading-md:
    fontFamily: "Agrandir, Avenir, Montserrat, Corbel, \"URW Gothic\", source-sans-pro, sans-serif"
    fontSize: 24px
    fontWeight: 700
    lineHeight: 26.4px
    letterSpacing: "-0.24px"
  body-lg:
    fontFamily: "Manrope, \"Helvetica Neue\", Helvetica, Arial, sans-serif"
    fontSize: 16px
    fontWeight: 500
    lineHeight: 22.4px
    letterSpacing: 0
  body-md:
    fontFamily: "Manrope, \"Helvetica Neue\", Helvetica, Arial, sans-serif"
    fontSize: 16px
    fontWeight: 600
    lineHeight: 22.4px
    letterSpacing: 0
  body-bold:
    fontFamily: "Manrope, \"Helvetica Neue\", Helvetica, Arial, sans-serif"
    fontSize: 16px
    fontWeight: 700
    lineHeight: 16px
    letterSpacing: 0
  body-sm:
    fontFamily: "Manrope, \"Helvetica Neue\", Helvetica, Arial, sans-serif"
    fontSize: 14px
    fontWeight: 600
    lineHeight: 19.6px
    letterSpacing: "0.14px"
  button-md:
    fontFamily: "Manrope, \"Helvetica Neue\", Helvetica, Arial, sans-serif"
    fontSize: 13px
    fontWeight: 700
    lineHeight: 13px
    letterSpacing: "0.12px"
  caption:
    fontFamily: "Manrope, \"Helvetica Neue\", Helvetica, Arial, sans-serif"
    fontSize: 12px
    fontWeight: 700
    lineHeight: 16.8px
    letterSpacing: "0.24px"
  kicker:
    fontFamily: "Manrope, \"Helvetica Neue\", Helvetica, Arial, sans-serif"
    fontSize: 9px
    fontWeight: 700
    lineHeight: 10.8px
    letterSpacing: "1.35px"
  tiny:
    fontFamily: "Manrope, \"Helvetica Neue\", Helvetica, Arial, sans-serif"
    fontSize: 10px
    fontWeight: 600
    lineHeight: 14px
    letterSpacing: "0.3px"

rounded:
  none: "0px"
  sm: "8px"
  md: "9px"
  lg: "12px"
  xl: "16px"
  illustrative-sm: "80px"
  illustrative-md: "120px"
  illustrative-lg: "160px"
  full: "9999px"

spacing:
  xs: "2px"
  sm: "4px"
  base: "8px"
  md: "11px"
  lg: "16px"
  xl: "20px"
  2xl: "24px"
  3xl: "32px"
  4xl: "40px"
  5xl: "60px"

components:
  hero-section:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.canvas}"
    typography: "{typography.display-xl}"
    rounded: "{rounded.none}"
    padding: "60px"
  hero-heading:
    backgroundColor: "transparent"
    textColor: "{colors.canvas}"
    typography: "{typography.display-xl}"
    padding: "0"
  section-heading:
    backgroundColor: "transparent"
    textColor: "{colors.primary}"
    typography: "{typography.display-sm}"
    padding: "0"
  body-paragraph:
    backgroundColor: "transparent"
    textColor: "{colors.primary}"
    typography: "{typography.body-lg}"
    padding: "0"
  body-paragraph-on-purple:
    backgroundColor: "transparent"
    textColor: "{colors.canvas}"
    typography: "{typography.body-lg}"
    padding: "0"
  kicker-label:
    backgroundColor: "transparent"
    textColor: "{colors.primary}"
    typography: "{typography.kicker}"
    padding: "0"
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.canvas}"
    typography: "{typography.button-md}"
    rounded: "{rounded.lg}"
    padding: "4px 0"
    height: "40px"
  button-primary-on-light:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.canvas}"
    typography: "{typography.button-md}"
    rounded: "{rounded.lg}"
    padding: "4px 18px"
    height: "40px"
  button-secondary:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.primary}"
    typography: "{typography.button-md}"
    rounded: "{rounded.lg}"
    padding: "0 18px"
    height: "40px"
  top-nav:
    backgroundColor: "transparent"
    textColor: "{colors.canvas}"
    typography: "{typography.button-md}"
    rounded: "{rounded.none}"
    padding: "0"
    height: "64px"
  nav-link:
    backgroundColor: "transparent"
    textColor: "{colors.canvas}"
    typography: "{typography.button-md}"
    rounded: "{rounded.lg}"
    padding: "0 18px"
    height: "40px"
  card-illustrative:
    backgroundColor: "{colors.surface-lilac}"
    textColor: "{colors.primary}"
    typography: "{typography.body-lg}"
    rounded: "{rounded.illustrative-md}"
    padding: "40px"
  card-flat:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.primary}"
    typography: "{typography.body-lg}"
    rounded: "{rounded.xl}"
    padding: "24px"
  laptop-frame:
    backgroundColor: "{colors.ink-black}"
    textColor: "{colors.canvas}"
    typography: "{typography.tiny}"
    rounded: "{rounded.xl}"
    padding: "0"
  badge:
    backgroundColor: "{colors.primary-pale}"
    textColor: "{colors.primary}"
    typography: "{typography.kicker}"
    rounded: "{rounded.full}"
    padding: "2px 8px"
    height: "20px"
  text-input:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.primary}"
    typography: "{typography.body-lg}"
    rounded: "{rounded.lg}"
    padding: "12px 16px"
    height: "44px"
    borderColor: "{colors.primary-pale}"
---

## Overview

Whimsical's marketing site does something most diagramming brands avoid. **Gradient hero, flat below.** The above-fold is not a near-white surface with a brand-accent CTA — it is a saturated violet-to-magenta gradient field carrying the entire hero composition. Deep plum `{colors.primary}` (#250835) sits at the corners; a mid-violet around `{colors.primary-light}` (#ba59ff) sits toward the center; a grain texture overlay rides on top to soften the gradient stops. A 96px Agrandir headline in white reads "Where great ideas take shape"; a dark plum CTA pill labeled "Get started" sits beneath; a tilted laptop mockup showing the editor surface with rainbow-colored sticky-note nodes (mint, aqua, blue, purple, hot-pink, yellow) floats in the lower-right. Where Figma and Miro keep their hero canvases on white, and Notion sits on a warm cream, Whimsical paints the entire above-fold with the brand's purple territory and lets the editor mockup carry the chromatic variety.

The chromatic restraint inverts as you scroll. Below the fold the page flips to a warm off-white canvas (`{colors.canvas}` — #ffffff) and the rainbow product palette returns inside super-rounded illustrative cards: a lavender `{colors.surface-lilac}` (#efe3ed) card carries the flow-chart diagram, a mint card carries the wireframes, an aqua card carries the diagrams; each card holds a tiny screenshot in the corner and a 48px Agrandir section heading. The deep plum `{colors.primary}` reappears as the body-text color on the off-white floor and as the shadow ink under every cream card. Unlike the convention of holding a single accent against a white surface for SaaS marketing pages, Whimsical splits the page into two chromatic acts: the purple-gradient hero, then the cream-and-rainbow editorial.

Typography pairs two faces with clearly divided labor. **Agrandir** carries every display moment — 96px for the hero h1, 64px for h2 mid-section displays, 48px for the section-heading tier, 24px for h3 sub-headings — all in weight 700 with tight negative letter-spacing (-0.96px on the hero, -0.64px on the 64px tier). **Manrope** carries every chrome label — nav links and CTA pills in `{typography.button-md}` (13px / 700), body paragraphs in `{typography.body-lg}` (16px / 500), captions in `{typography.caption}` (12px / 700), and an uppercase kicker tier at 9px / 700 / 1.35px tracking that sits above each section heading. There is no third tier and no serif moment anywhere on the page.

**Key Characteristics:**
- Violet-to-magenta gradient hero with grain texture overlay — runs from deep plum `{colors.primary}` (#250835) at the corners through `{colors.primary-light}` (#ba59ff) toward the top-right.
- Two-act page structure — purple-gradient above the fold, warm off-white below, with the rainbow product palette returning inside the cream-floor illustrated cards.
- Two-face display + body typography — Agrandir at 24–96px / 700 with tight negative tracking, Manrope at 9–16px / 500–700 for every chrome label.
- Binary radius scale — 8–16px utility rounding (CTA pills, dropdowns, dialog cards) plus 80–160px illustrative rounding (the super-rounded rainbow feature cards). No 24–48px middle tier.
- Deep plum CTA fills carry the primary action — `{colors.primary}` sits as the load-bearing button-fill against both the purple-gradient hero and the cream below-fold body.
- Uppercase kicker tier at 9px / 700 / 1.35px tracking — Manrope's smallest weight-700 sits above every section heading as the "The essentials, done right"-style section label.
- Rainbow product palette inside the editor mockup — mint, aqua, blue, purple, hot-pink, yellow sticky-note nodes laid out across a flow diagram in the laptop frame.
- Grain texture overlay — 5% / 10% / 15% / 50% grain PNGs ride on top of every gradient surface as a softening texture.

## Colors

### Brand

- **Deep Plum** (`{colors.primary}` — #250835): frequency 19. Used as bg (1), shadow (10), gradient (8). Wired in CSS as `--purple-800` and `--base-800`. The system's load-bearing voltage — primary CTA fill, body-shadow ink under every cream card, and the lower-stop on every brand gradient. The only color in the system that does the work of both "ink" and "accent".
- **Purple Light** (`{colors.primary-light}` — #ba59ff): frequency 3, all inside gradients. Wired as `--purple-400`. The mid-stop on the hero gradient and the upper-stop on the dark gradient feature cards.
- **Purple Pale** (`{colors.primary-pale}` — #e9bded): frequency 1, as a background fill. A soft lilac used inside the kicker-label pill and as a badge tint.

### Surface

- **Surface Lilac** (`{colors.surface-lilac}` — #efe3ed): frequency 2, both as background fills. Wired as `--base-100`, `--base-200`, `--base-300`. Carries the larger illustrated feature cards on the cream floor.
- **Canvas** (`{colors.canvas}` — #ffffff): frequency 61 (24 text, 13 bg, 24 border). The dominant surface color — the off-white floor below the fold, every cream card background, and the white text rendered on top of the purple-gradient hero.

### Accent

- **Magenta** (`{colors.accent-magenta}` — #ff59f1): frequency 2, both in gradients. Reserved for the brightest pink stop on the pink-gradient horizontal feature cards.
- **Aqua** (`{colors.accent-aqua}` — #3ca1ff): frequency 1, in a gradient. Wired as `--aqua-400` and `--teal-400`. The mid-blue stop on the teal-gradient horizontal card.
- **Blue Pale** (`{colors.accent-blue-pale}` — #bbcfe4): frequency 1, as a background fill. The lightest blue inside the rainbow product mockup.

### Ink

- **Ink Black** (`{colors.ink-black}` — #000000): frequency 3 (1 text, 1 border, 1 shadow). Used as the laptop-frame outline and as the corner-grain texture composite. The laptop mockup is the only place pure black appears on the page.

## Typography

### Font Families

The system runs two voices with clearly divided labor: **Agrandir** for every display moment (hero h1, section h2 / h3, feature-card titles) and **Manrope** for every chrome label (nav links, CTA pills, body paragraphs, captions, kickers). Agrandir falls back through `Avenir, Montserrat, Corbel, "URW Gothic", source-sans-pro, sans-serif`; Manrope falls back through `"Helvetica Neue", Helvetica, Arial, sans-serif`. There is no third tier and no serif moment anywhere on the page.

The pairing is the typographic signature. Agrandir is a friendly geometric grotesque with a tall x-height and rounded terminals — it carries the personality. Manrope is a neutral humanist sans — it carries the chrome. The split allows Agrandir to dominate every display tier without competing with the chrome labels.

### Hierarchy

| Token | Family | Size | Weight | Line Height | Letter Spacing | Use |
|---|---|---|---|---|---|---|
| `{typography.display-xl}` | Agrandir | 96px | 700 | 96px | -0.96px | Hero h1 ("Where great ideas take shape") |
| `{typography.display-lg}` | Agrandir | 72px | 700 | 72px | -0.96px | Larger section h2 displays |
| `{typography.display-md}` | Agrandir | 64px | 700 | 70.4px | -0.64px | h1 on secondary pages |
| `{typography.display-sm}` | Agrandir | 48px | 700 | 52.8px | 0 | Section h2 ("Capture and share your ideas...") |
| `{typography.heading-md}` | Agrandir | 24px | 700 | 26.4px | -0.24px | h3 sub-section titles ("Diagrams", "Wireframes") |
| `{typography.body-lg}` | Manrope | 16px | 500 | 22.4px | 0 | Default body paragraph |
| `{typography.body-md}` | Manrope | 16px | 600 | 22.4px | 0 | Mid-emphasis body lines |
| `{typography.body-bold}` | Manrope | 16px | 700 | 16px | 0 | Inline-bold body strings and chrome labels |
| `{typography.body-sm}` | Manrope | 14px | 600 | 19.6px | 0.14px | Caption rows |
| `{typography.button-md}` | Manrope | 13px | 700 | 13px | 0.12px | Every nav link and CTA pill label |
| `{typography.caption}` | Manrope | 12px | 700 | 16.8px | 0.24px | Footnote captions and small labels |
| `{typography.kicker}` | Manrope | 9px | 700 | 10.8px | 1.35px (uppercase) | Section-header kicker above every display |
| `{typography.tiny}` | Manrope | 10px | 600 | 14px | 0.3px | The smallest readable label — used inside the laptop-frame mockup |

### Principles

Display weight is always 700, never lighter. Whimsical commits to a heavy display tier with tight negative letter-spacing — the inverse of the editorial-magazine treatment that brands like Stripe and Cloudflare use. The confidence comes from weight and tracking together, not from size alone. The hero at 96px / 700 / -0.96px is the loudest moment in the system; the 48px section heading repeats the same weight and tracking philosophy at smaller scale.

The kicker tier — Manrope 9px / 700 / 1.35px tracking, uppercase — is the small-caps device that sits above every section heading ("The essentials, done right" style). There is no full-uppercase tier in Agrandir; small-caps duty falls entirely to Manrope kickers. The result reads as editorial signposting without ever shouting in display.

### Note on Font Substitutes

Agrandir is a licensed display family from Velvetyne. The closest open-source substitute is **Avenir** at the same weights (already in the fallback stack), or **Inter** at slightly tighter tracking. **General Sans** is closer in feel but not free. For Manrope, the family is itself open-source under the SIL Open Font License and can be used directly.

## Layout

### Spacing System

- **Base unit:** 8px (with 4px and 2px as the sub-base tier).
- **Tokens:** `{spacing.xs}` 2px · `{spacing.sm}` 4px · `{spacing.base}` 8px · `{spacing.md}` 11px · `{spacing.lg}` 16px · `{spacing.xl}` 20px · `{spacing.2xl}` 24px · `{spacing.3xl}` 32px · `{spacing.4xl}` 40px · `{spacing.5xl}` 60px.
- **Hero padding:** `{spacing.5xl}` (60px) horizontal — the only marketing surface with 60px breathing room on every side of the gradient block.
- **Illustrated card padding:** `{spacing.4xl}` (40px) — the super-rounded `{component.card-illustrative}` carries generous internal space to let the embedded screenshot sit centered.
- **CTA pill vertical padding:** `{spacing.sm}` 4px — the pills are tightly packed vertically to keep the chrome quiet.

### Grid & Container

- **Max content width:** ~1320px on the hero and the below-fold sections (wired as `--max-content-width`).
- **Hero block:** full-bleed gradient surface with the headline + CTA + laptop mockup arranged in a 60% / 40% horizontal split.
- **Below-fold sections:** centered displays at ~1080px with single-column body text.
- **Feature card grid:** 3-up on desktop showing the lavender / mint / aqua illustrated cards, collapsing to 1-up on tablet.

### Rhythm

The page alternates between **two chromatic acts**. Act 1 is the purple-gradient hero with the laptop mockup; the rhythm is generous (large display, large CTA, lots of breathing room). Act 2 is the cream-floor below-fold; the rhythm tightens to a 3-up card grid with smaller display sizes (48px instead of 96px) and the rainbow product palette returning inside the cards rather than overlaid on the surface. The transition between acts is abrupt — there is no atmospheric gradient between them.

## Elevation

The system has a soft, plum-tinted shadow tier centered on `{colors.primary}` (#250835) at low opacity:

- **Light low** (`--ds-light-low`): `0px 8px 16px -4px rgba(37, 8, 53, .04)` — the softest lift, used on the small illustrated cards.
- **Light medium** (`--ds-light-medium`): `0px 16px 32px -4px rgba(37, 8, 53, .06)` — used on the mid-tier illustrated cards.
- **Light high** (`--ds-light-high`): `0px 32px 64px -8px rgba(37, 8, 53, .08)` — used on the laptop-mockup frame inside the hero.
- **Dark low / medium / high**: same offset/blur scale at higher opacities (.20 / .24 / .32), reserved for the dark-mode product surfaces not exposed in the captured page.

The plum-tinted shadow ink is the brand's color-of-depth — gray shadows would feel borrowed from a neutral SaaS system; the plum ties every elevation back to the hero gradient.

## Shapes

The radius scale is **binary**: utility tier (8–16px) plus illustrative tier (80–160px).

- `{rounded.none}` 0px — only on body running text containers.
- `{rounded.sm}` 8px — small UI surfaces (dropdowns, popovers, dialog inputs — 9 occurrences).
- `{rounded.md}` 9px — declared as an off-grid intermediate; used on one product-surface accent (1 occurrence).
- `{rounded.lg}` 12px — the dominant utility tier (13 occurrences). Used on the CTA pills, the nav-link hover pills, the cream cards, the laptop-frame outer corners.
- `{rounded.xl}` 16px — larger utility cards (7 occurrences). Used on the embedded screenshot frames inside the illustrated cards.
- `{rounded.illustrative-sm}` 80px (1 occurrence), `{rounded.illustrative-md}` 120px (2 occurrences), `{rounded.illustrative-lg}` 160px (2 occurrences) — the super-rounded radii used on the rainbow-colored feature cards below the fold. The jump from 16px to 80px is deliberate: the small radii read as utility chrome; the giant radii read as illustrative shapes that belong with the laptop mockup.
- `{rounded.full}` 9999px — declared for completeness; used on circular badges at 50% radius (8 occurrences).

There is no 24 / 32 / 48px middle tier. The binary split keeps utility chrome visually distinct from illustrative content.

## Components

**`hero-section`** — Full-bleed violet-to-magenta gradient canvas, 60px padding on every side. Holds the hero h1 in white at `{typography.display-xl}`, the deep plum CTA pill centered, and the tilted laptop mockup floating in the lower-right.

**`hero-heading`** — White text on the gradient hero, 96px Agrandir weight 700 with -0.96px tracking. The loudest typographic moment in the system.

**`section-heading`** — Deep plum text on the cream floor, 48px Agrandir weight 700 with 0 letter-spacing. Used for "Capture and share your ideas at the speed of thought", "The essentials, done right", etc.

**`body-paragraph`** — Default deep plum running text on the cream floor at `{typography.body-lg}`.

**`body-paragraph-on-purple`** — White text on the gradient hero at `{typography.body-lg}` — the sub-headline beneath the 96px h1.

**`kicker-label`** — Manrope 9px / 700 / 1.35px tracking, uppercase. The small-caps section label that sits above every section heading.

**`button-primary`** — The deep plum CTA pill. `{colors.primary}` fill, white text, `{typography.button-md}` (13px / 700), `{rounded.lg}` 12px radius, 4x0 padding, 40px height. The "Get started" button is the canonical instance.

**`button-primary-on-light`** — Same plum fill with white text, used below the fold against the cream floor. 4x18 horizontal padding to compensate for the absence of the gradient background.

**`button-secondary`** — White fill, deep plum text, same `{rounded.lg}` and dimensions as the primary. Used for the "Log in" affordance in the top-nav.

**`top-nav`** — Transparent surface floating over the gradient hero, 64px height. The Whimsical wordmark sits flush left in white; product links (Why / Templates / Pricing / Company) center; the "Log in" white pill and the "Sign up" plum pill cluster flush right.

**`nav-link`** — White text on the gradient hero in `{typography.button-md}`, 0x18 padding, 40px height, `{rounded.lg}` hover pill on a transparent surface that lifts to a soft white wash on hover.

**`card-illustrative`** — Lavender `{colors.surface-lilac}` fill, deep plum text, super-rounded `{rounded.illustrative-md}` 120px radius, 40px padding. The flagship surface — holds an embedded screenshot in the upper portion and a 48px section heading + body paragraph beneath.

**`card-flat`** — White fill, deep plum text, `{rounded.xl}` 16px radius, 24px padding. The default content card on the cream floor — used for the 4-up "Mind maps / Whiteboards / Wireframes / Sticky notes" grid.

**`laptop-frame`** — Pure black outer shell with a rainbow-product-canvas interior, `{rounded.xl}` 16px outer radius, 0 padding. Houses the tilted Whimsical editor mockup that floats in the hero's lower-right.

**`badge`** — Lilac `{colors.primary-pale}` fill, deep plum text in `{typography.kicker}`, fully-rounded `{rounded.full}` pill, 2x8 padding, 20px height.

**`text-input`** — White fill, deep plum text, lilac border, `{rounded.lg}` 12px radius, 12x16 padding, 44px height.

## Do's and Don'ts

**Do** treat the violet-to-magenta gradient as the entire above-fold canvas. The single move that defines this system is the hero `{component.hero-section}` — a flat purple surface would lose the chromatic depth that absorbs the rainbow editor mockup into a single mood. Either commit to the gradient or move the mockup off the hero.

**Do** keep display weight at 700 with tight negative tracking. The hero at 96px / 700 / -0.96px and the section heading at 48px / 700 / 0 are the brand's typographic signature; dropping to weight 400 or 500 turns the editorial confidence into a generic sans hero.

**Do** use `{colors.primary}` (#250835) as the load-bearing CTA fill on both the purple-gradient hero and the cream below-fold. The plum carries the brand recognition across the two-act page structure; swapping to a brighter purple would break the cohesion.

**Do** pair Agrandir with Manrope — never use Agrandir for chrome labels or Manrope for display headings. Agrandir's personality belongs to display; Manrope's neutrality belongs to chrome. Crossing the line breaks the visual rhythm between display and chrome.

**Don't** use the brighter purples (`{colors.primary-light}` or `{colors.accent-magenta}`) outside of gradient stops. The brighter purples are reserved as gradient end-stops; using them as flat CTA fills would shout against the deep plum that carries every flat surface.

**Don't** introduce a 24 / 32 / 48px middle radius tier. The system is binary — small utility rounding (8–16px) plus illustrative giant rounding (80–160px). Adding a middle value softens the contrast between the chrome surfaces and the rainbow illustrative cards.

**Don't** swap the plum-tinted shadow ink for a neutral gray. Whimsical's shadow color is plum at low opacity, wired as `rgba(37, 8, 53, *)`. A gray shadow reads as borrowed from a neutral SaaS system and disconnects the elevation from the hero gradient.

**Don't** render the rainbow product nodes (mint, aqua, blue, hot-pink, yellow) outside of the laptop-frame mockup or the illustrated cards. The rainbow palette is a product surface; bringing it into the marketing chrome would compete with the brand's purple voltage and dissolve the two-act page structure.

## Known Gaps

- **Dark mode:** the captured marketing surface is the public marketing site only. Dark-mode product surfaces (the editor in dark theme) carry their own token system with the `--ds-dark-*` shadow tier, not exposed here.
- **Hover and focus states:** the CTA pills, nav links, and illustrated cards all hover-lift, but the captured surface only carries the resting state — the full hover matrix lives in component CSS not reflected in the page.
- **Form input error states:** `{component.text-input}` carries the resting state; error / validation styling lives inside the product editor and is not exposed on the marketing surface.
- **Motion:** the hero gradient subtly animates and the laptop mockup tilts on scroll, but the spec captures end-state values only.
- **Product editor surfaces:** the rainbow sticky-note palette, the connector strokes, the in-canvas formatting toolbar, and the multiplayer cursor surfaces all live inside the editor and are not represented here.
- **Pricing tier accents:** Whimsical's pricing page exposes additional accent ladders (mint, blue, hot-pink, yellow) wired as `--mint-100/800`, `--blue-100/800`, etc.; these are utility palettes not rendered on the marketing home and are not included as primary tokens.
- **Grain texture overlays:** the gradient surfaces ride a grain texture PNG at 5% / 10% / 15% / 50% opacity; the texture asset is not capturable as a CSS token and is referenced indirectly via the `--gradient-*` URL stack.
