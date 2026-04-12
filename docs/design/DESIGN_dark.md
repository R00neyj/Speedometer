# Design System Specification: Editorial Dark Mode
 
## 1. Overview & Creative North Star
The Creative North Star for this design system is **"The Luminous Obsidian."** It is an exercise in restraint, focusing on the interplay between deep, infinite shadows and precise, vibrant energy. 
 
We are moving away from the "boxy" nature of standard Material Design toward a high-end, editorial experience. By leveraging the **Plus Jakarta Sans** typeface and a **ROUND_FULL** geometry, the UI feels organic and fluid. We reject the rigidity of grids in favor of intentional asymmetry, where content breathes within expansive dark voids, punctuated by a signature primary blue that feels like a light source in the dark.
 
## 2. Color & Tonal Architecture
The palette is rooted in a spectrum of blacks and grays, designed to reduce ocular strain while maintaining high sophistication.
 
### Surface Hierarchy & The "No-Line" Rule
Traditional UI relies on lines to separate content; this system prohibits them. **1px solid borders for sectioning are strictly forbidden.**
- **Boundaries via Tonality:** To separate a sidebar from a main feed, transition from `surface` (`#0e0e0f`) to `surface_container_low` (`#131314`). 
- **Nesting Depth:** Treat the interface as physical layers of obsidian. A card should be `surface_container_high` (`#1f1f21`) resting on a `surface` background. This creates a natural, soft-edge distinction that feels premium and integrated.
 
### The Glass & Gradient Rule
To prevent the dark mode from feeling "flat" or "muddy," we use two signature techniques:
- **Glassmorphism:** For floating elements like navigation bars or tooltips, use `surface_container` colors at 70% opacity with a `24px` backdrop-blur. This allows the primary accents to bleed through the UI, creating depth.
- **Vibrant Polarity:** Main actions use a gradient transition from `primary` (`#85adff`) to `primary_container` (`#6d9fff`). This provides a "glow" effect that flat colors cannot replicate.
 
## 3. Typography: The Editorial Voice
**Plus Jakarta Sans** is our sole typographic voice. It is chosen for its modern geometric clarity and high x-height, which ensures legibility against dark backgrounds.
 
- **Display (lg/md/sm):** Used for "hero" moments. Use these with generous letter-spacing (-0.02em) to create an authoritative, editorial feel.
- **Headline & Title:** These are the structural anchors. Use `headline-lg` (`2rem`) for page titles to establish a clear hierarchy against the `body-lg` (`1rem`) content.
- **Labels:** Reserved for functional metadata. `label-sm` (`0.6875rem`) should be used in `on_surface_variant` (`#adaaab`) to ensure they stay subordinate to the primary content.
 
The hierarchy is intentionally steep. A large display heading next to a small, high-contrast body block creates the "asymmetry" that defines high-end digital experiences.
 
## 4. Elevation & Depth: Tonal Layering
We replace traditional drop shadows with **Ambient Tonal Layering**.
 
- **The Layering Principle:** 
    - Level 0 (Background): `surface` (`#0e0e0f`)
    - Level 1 (Sections): `surface_container_low` (`#131314`)
    - Level 2 (Cards/Interactions): `surface_container_highest` (`#262627`)
- **Ambient Shadows:** If an element must float (e.g., a Modal), use a shadow color derived from `on_primary_container` at 8% opacity. Blur values must be high (32px to 64px) to mimic a soft, atmospheric glow rather than a harsh shadow.
- **The Ghost Border:** If accessibility requires a stroke, use `outline_variant` (`#484849`) at 15% opacity. It should be felt, not seen.
 
## 5. Components
All components follow the **ROUND_FULL** (`9999px`) philosophy to maintain a soft, approachable aesthetic.
 
### Buttons & Chips
- **Primary Button:** Background: Gradient (`primary` to `primary_container`). Text: `on_primary` (`#002c65`). Shape: `full`.
- **Secondary/Filter Chips:** Background: `surface_container_high`. Text: `on_surface`. On selection, transition to `secondary_container` with `on_secondary_container` text.
- **Forbid:** Do not use rectangular buttons. Everything must be pill-shaped.
 
### Input Fields
- **Container:** `surface_container_highest` with a `full` corner radius.
- **Interaction:** On focus, the container should not get a border; instead, the background should shift to `surface_bright` (`#2c2c2d`) or gain a subtle `primary` outer glow.
 
### Cards & Lists
- **The Divider Ban:** Never use a horizontal line to separate list items. Use `16px` of vertical whitespace or a subtle background hover state shift to `surface_variant`.
- **Card Styling:** Cards should have no border. Use the Tonal Layering principle to lift them from the background.
 
### Suggestion: The "Aura" Progress Loader
For loading states, instead of a standard spinner, use a blurred `primary` gradient "aura" that pulses behind the content container, reinforcing the "Luminous Obsidian" theme.
 
## 6. Do's and Don'ts
 
### Do
- **DO** use white space as a structural tool. Let the dark background provide "breathing room."
- **DO** use `on_surface_variant` for secondary text to create a clear visual importance scale.
- **DO** apply `backdrop-blur` to any floating pill or navigation element.
 
### Don't
- **DON'T** use pure `#000000` for everything. Use the `surface` and `surface_container` tokens to create sophisticated variety.
- **DON'T** use 100% opaque borders. They break the fluid, editorial feel of the system.
- **DON'T** crowd the UI. If a screen feels busy, increase the padding and move to a more vertical, asymmetrical layout.