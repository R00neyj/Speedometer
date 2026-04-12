# Design System Strategy: The Intelligent Canvas

## 1. Overview & Creative North Star
The Creative North Star for this design system is **"The Digital Curator."** 

We are not building a static interface; we are creating a living, breathing environment where information feels curated rather than displayed. This system breaks away from the "standard template" look by prioritizing intentional white space and architectural layering over rigid containment. 

While many interfaces rely on borders and heavy grids, this system uses **Tonal Fluidity**. We achieve a premium, editorial feel through asymmetric layouts, high-contrast typography scales, and a philosophy that "less is not just more—it is clarity." The goal is for the UI to recede into the background, allowing the user’s content and the AI’s intelligence to take center stage.

---

## 2. Color & Surface Architecture
Our palette is a sophisticated blend of "cool" utility and "warm" comfort. We avoid the clinical coldness of pure greys in favor of slightly blue-tinted neutrals (`surface: #f6faff`).

### The "No-Line" Rule
**Borders are a failure of hierarchy.** In this design system, 1px solid borders are strictly prohibited for sectioning. We define boundaries through background shifts.
*   **Example:** A sidebar (`surface-container-low`) sitting against a main workspace (`surface`) creates a natural edge without a line.

### Surface Hierarchy & Nesting
Depth is achieved through the physical metaphor of stacked sheets of "Vellum."
*   **Base Layer:** `surface` (#f6faff)
*   **Structural Containers:** `surface-container` (#e7eff6)
*   **Floating Elements:** `surface-container-lowest` (#ffffff)
*   **Input Regions:** `surface-container-highest` (#d9e4ed)

### The Glass & Gradient Rule
To provide "visual soul," primary actions should use a subtle linear gradient from `primary` (#0058cd) to `primary_container` (#2472f8). Floating dialogs or hover-states should utilize Glassmorphism: a `surface_variant` color at 70% opacity with a `20px` backdrop-blur.

---

## 3. Typography: Editorial Authority
We use a dual-font strategy to balance character with readability.

*   **The Voice (Display & Headlines):** *Plus Jakarta Sans*. This font brings a modern, geometric clarity. Use high-contrast sizing (e.g., `display-lg` at 3.5rem) to create clear entry points in the layout.
*   **The Utility (Body & Labels):** *Inter*. Chosen for its exceptional legibility at small sizes.

**Hierarchy as Identity:** 
By pairing a bold, large-scale `headline-lg` with a quiet, spacious `body-md`, we convey a brand that is both authoritative and approachable. Headlines should have tighter letter-spacing (-0.02em) to feel "tight" and professional.

---

## 4. Elevation & Depth: Tonal Layering
We move beyond Material Design's traditional shadows into **Ambient Depth.**

*   **Layering Principle:** Place a `surface-container-lowest` (pure white) card on a `surface-container-low` section. The slight delta in hex value creates a "soft lift" that is easier on the eyes than a shadow.
*   **Ambient Shadows:** For floating menus, use a "Ghost Shadow": `0px 12px 32px rgba(41, 52, 59, 0.06)`. Note the use of the `on-surface` color (#29343b) as the shadow base—never use pure black.
*   **The Ghost Border:** If a boundary is required for accessibility, use `outline-variant` (#a8b3bc) at **15% opacity**. It should feel like a suggestion of a line, not a wall.

---

## 5. Components

### Sidebar Navigation
*   **Layout:** Generous top padding (3rem). Icons use `primary` for active states and `on_surface_variant` for inactive.
*   **Interaction:** Active states should use a pill-shaped background (`primary_container` at 20% opacity) rather than a simple color change.

### Primary Buttons
*   **Shape:** Full roundedness (`9999px`).
*   **Style:** Gradient fill from `primary` to `primary_dim`. High-contrast text using `on_primary_fixed`.
*   **States:** On hover, increase the shadow spread rather than darkening the color.

### Input Fields & Search
*   **Shape:** `xl` (3rem) roundedness for the main prompt bar; `md` (1.5rem) for standard forms.
*   **Color:** Use `surface-container-highest` to differentiate the input area as a "well" or "vessel" for user data.

### Cards & Lists
*   **NO DIVIDERS.** Use `0.5rem` to `1.5rem` of vertical white space to separate items.
*   **Interaction:** On hover, a card should shift from `surface` to `surface-container-low` to provide tactile feedback.

### The "Prompt Vessel" (Specialty Component)
Specifically for AI interfaces, the main input should feel like a floating object. Use a `surface-container-lowest` background with a `1px` Ghost Border and an Ambient Shadow to make it the most prominent interactive element on the screen.

---

## 6. Do's and Don'ts

### Do
*   **DO** use asymmetric margins to create an editorial flow (e.g., a wider left margin for body text).
*   **DO** leverage `surface-tint` sparingly to highlight the most important user path.
*   **DO** allow elements to overlap (e.g., a floating button overlapping two surface containers) to break the "grid-box" feel.

### Don't
*   **DON'T** use 100% opaque borders or dividers. They create "visual noise" and clutter the minimalist aesthetic.
*   **DON'T** use traditional "Drop Shadows" with high opacity. They look dated and heavy.
*   **DON'T** crowd the typography. If a section feels "busy," increase the line height of `body-lg` to 1.6 or 1.8 before removing content.