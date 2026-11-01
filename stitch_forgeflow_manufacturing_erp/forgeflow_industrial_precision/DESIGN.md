---
name: ForgeFlow Industrial Precision
colors:
  surface: '#f9f9ff'
  surface-dim: '#d7dae5'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f1f3ff'
  surface-container: '#ebedfa'
  surface-container-high: '#e5e8f4'
  surface-container-highest: '#dfe2ee'
  on-surface: '#181c24'
  on-surface-variant: '#434655'
  inverse-surface: '#2c3039'
  inverse-on-surface: '#eef0fc'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#00687a'
  on-secondary: '#ffffff'
  secondary-container: '#57dffe'
  on-secondary-container: '#006172'
  tertiary: '#006243'
  on-tertiary: '#ffffff'
  tertiary-container: '#007d57'
  on-tertiary-container: '#bdffdc'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#acedff'
  secondary-fixed-dim: '#4cd7f6'
  on-secondary-fixed: '#001f26'
  on-secondary-fixed-variant: '#004e5c'
  tertiary-fixed: '#85f8c4'
  tertiary-fixed-dim: '#68dba9'
  on-tertiary-fixed: '#002114'
  on-tertiary-fixed-variant: '#005137'
  background: '#f9f9ff'
  on-background: '#181c24'
  surface-variant: '#dfe2ee'
typography:
  display-lg:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.025em
  display-lg-mobile:
    fontFamily: Geist
    fontSize: 26px
    fontWeight: '600'
    lineHeight: 34px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Geist
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Geist
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 22px
    letterSpacing: -0.005em
  body-md:
    fontFamily: Geist
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0em
  body-sm:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0em
  metric-val:
    fontFamily: JetBrains Mono
    fontSize: 22px
    fontWeight: '500'
    lineHeight: 28px
    letterSpacing: -0.02em
  label-code:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.04em
  label-caps:
    fontFamily: Geist
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-mobile: 0.75rem
  margin: 1.5rem
  margin-mobile: 1rem
  space-2xs: 0.125rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.5rem
  space-2xl: 2rem
---

## Brand & Style

This design system embodies high-density, mission-critical operational clarity for modern automotive manufacturing and supply chain reconciliation. The aesthetic merges the clinical precision of Linear and Vercel with the structural confidence of Stripe's financial infrastructure tools.

The visual style is **Industrial Technical Modern**: razor-sharp 1px dividers, structured grid hierarchies, monospaced tabular data treatments, micro-badge status indicators, and zero decorative fluff. Surfaces balance an authoritative midnight charcoal control rail with an ultra-clean, high-legibility warm neutral operating canvas. The interface evokes unyielding reliability, real-time auditability, and executive command over high-throughput physical assembly lines.

## Colors

The system uses a calibrated dual-environment scheme: deep technical dark surfaces for system navigation, paired with ultra-crisp high-contrast daylight surfaces for data tables, operational ledgers, and BOM trees.

- **Primary (`#2563EB` / Active `#1D4ED8`):** Electric blue dedicated to primary actions, active states, progress indicators, and keyboard focus halos.
- **Secondary (`#06B6D4`):** Technical cyan for processing cycles, subcontracting batch transit, telemetry markers, and telemetry tooltips.
- **Operational Status Roles:**
  - **Stock Accepted / Reconciled (`#059669` / Surface `#ECFDF5`):** Balanced industrial emerald.
  - **Variance / Under Investigation (`#D97706` / Surface `#FFFBEB`):** Restrained amber alert for lot discrepancies and dimensional deviations.
  - **Rejection / Shortfall Alert (`#DC2626` / Surface `#FEF2F2`):** Direct crimson red for immediate QA quarantines, material exhaustion, and scrap spikes.
- **Neutral Rail & Canvas:**
  - **Dark Base (`#0B0F17` / Surface `#111827`):** High-density navigation, terminal panels, and system logs.
  - **Work Canvas (`#F8F9FA` / Surface Card `#FFFFFF`):** High-efficiency readable core.
  - **Borders (`#E2E8F0` Light / `#1E293B` Dark):** Crisp 1px structural hairpins throughout the interface.

## Typography

The type system prioritizes scanning velocity, optical density, and zero ambiguity between numerals and glyphs. 

- **Geist** governs headlines, executive summaries, interface buttons, and tabular labels. Font weights are confined to 400 (Body), 500 (Table Headers & Inputs), and 600 (Headlines & Metric Titles).
- **JetBrains Mono** is enforced across all quantitative data: lot numbers, component SKUs, tolerance percentages, scrap counts, timestamps, and ledger balance deltas.
- Numerical data everywhere must use CSS `font-feature-settings: "tnum" 1, "cv05" 1` to guarantee strict vertical alignment across multi-line reconciliation sheets.

## Layout & Spacing

Layouts follow a structured enterprise desktop-first model, optimized for 1440px and 1920px terminal displays with adaptive scaling down to rugged floor tablets (1024px) and mobile handlers (375px+).

- **Global Shell:** Fixed 240px dark navigation sidebar on desktop (collapsible to 56px icon rail), paired with a fluid main workspace bounded by a max-width container of `1760px` for high-density 12-column analytical dashboards.
- **Data Densities:** A compact 4px baseline grid maintains tight, information-rich interfaces without visual clutter. Standard table rows sit at `36px` default height (condensable to `28px` in audit mode).
- **Breakpoints:**
  - `Desktop XL (>= 1440px)`: 12-column grid, 16px gutter, 24px canvas margins.
  - `Desktop / Tablet Landscape (1024px - 1439px)`: 8-column grid, 16px gutter, 20px canvas margins.
  - `Tablet Portrait / Rugged Display (768px - 1023px)`: 6-column grid, 12px gutter, 16px margins; sidebar collapses into top operational bar.
  - `Mobile Floor View (< 768px)`: 4-column grid, 12px gutter, 12px margins; cards stack into full-width micro-ledgers.

## Elevation & Depth

This design system avoids heavy shadows, blur rings, or skeuomorphic depths, favoring **low-contrast outline architecture** and subtle tonal stacking:

- **Level 0 (App Canvas):** Flat `#F8F9FA`. No shadow.
- **Level 1 (Card / Grid Cell / Table Row):** `#FFFFFF` anchored by a razor-thin border `1px solid #E2E8F0`. Hovering over clickable items applies an ambient micro-lift: `0 1px 3px rgba(11, 15, 23, 0.05)`.
- **Level 2 (Popovers, Command Palette, Dropdowns):** `#FFFFFF` bordered with `1px solid #CBD5E1` with a controlled shadow: `0 4px 12px -2px rgba(11, 15, 23, 0.08), 0 2px 6px -1px rgba(11, 15, 23, 0.04)`.
- **Level 3 (Modal Dialogs & Part Isolation Drawers):** `#FFFFFF` paired with an administrative backdrop overlay (`rgba(11, 15, 23, 0.40)`) and structural depth: `0 20px 25px -5px rgba(11, 15, 23, 0.12), 0 8px 10px -6px rgba(11, 15, 23, 0.06)`.
- **Dark Surface Separation:** Dark panels (`#0B0F17`) sit adjacent to `#111827` separated exclusively by `1px solid #1E293B` lines, ensuring no optical muddiness.

## Shapes

The design uses a restrained **Soft (`1`)** shape language:

- **Inputs, Buttons, and Micro-badges:** `rounded` (4px / 0.25rem). This enforces crisp alignment across dense operational grids and multi-column inputs.
- **Data Cards, Panels, and Drawers:** `rounded-lg` (8px / 0.5rem) to subtly isolate high-level reporting zones while retaining structural edge discipline.
- **Modals and Flyouts:** `rounded-lg` (8px / 0.5rem).
- Fully circular shapes (`rounded-full`) are reserved exclusively for status ping dots, avatar initials, and step-progress nodes.

## Components

### Buttons
- **Primary:** Solid `#2563EB` fill, `#FFFFFF` Geist 13px weight 500 text, 4px radius, 32px height, padding `0 12px`. Hover: `#1D4ED8`. Active: `#1E40AF`. Focus: 2px offset with `#93C5FD`.
- **Secondary:** Surface `#FFFFFF`, border `1px solid #E2E8F0`, text `#0F172A`. Hover: `#F1F5F9`.
- **Ghost / Table Inline:** Zero border, zero background, `#475569` text. Hover: `#F8F9FA` text `#0B0F17`.
- **Destructive:** Surface `#FEF2F2`, border `1px solid #FCA5A5`, text `#DC2626`. Hover: `#FEE2E2`.

### Micro-Badges & Status Tags
- Height: 20px, font: `JetBrains Mono` 11px uppercase, padding: `2px 6px`, border-radius: 4px.
- **Reconciled:** Background `#ECFDF5`, text `#065F46`, border `1px solid #A7F3D0`.
- **Variance / Hold:** Background `#FFFBEB`, text `#92400E`, border `1px solid #FDE68A`.
- **Critical Scrap / Shortfall:** Background `#FEF2F2`, text `#991B1B`, border `1px solid #FECACA`.
- **In-Transit / Subcontractor:** Background `#F0FDF4`, text `#0E7490`, border `1px solid #A5F3FC`.

### Data Cards & Executive KPI Metrics
- Top-level cards feature a 1px `#E2E8F0` border, `#FFFFFF` background, and internal padding of 16px.
- Metric display:geist-label 11px uppercase tracked (`#64748B`), immediate numeric readout in `JetBrains Mono` 22px (`#0B0F17`), and a delta comparison chip positioned right-aligned.

### High-Density Tables & Ledger Grids
- **Header:** Height 32px, background `#F8F9FA`, border-bottom `1px solid #CBD5E1`, text `JetBrains Mono` 11px uppercase `#64748B`.
- **Rows:** Height 36px (compact: 28px), border-bottom `1px solid #F1F5F9`. Alternating row hover: `#F8FAFC`.
- **Numeric Cells:** Right-aligned, `JetBrains Mono`, fixed column widths to prevent layout shifts during live polling.

### Input Fields & Select Controls
- Height 32px, background `#FFFFFF`, border `1px solid #CBD5E1`, 4px radius, font 13px Geist.
- Placeholder text `#94A3B8`. Focus: border `#2563EB`, shadow `0 0 0 1px #2563EB`.

### Specialized Domain Components
- **Tolerance Diff Bar:** Inline 48px × 4px visual bar displaying positive (green) and negative (crimson) variance against subcontracting BOM specs.
- **Dispatch Lot Stepper:** Segmented pipeline indicator visualizing dispatch, gate entry, subcontractor QA, and receipt reconciliation with 1px connector rules.