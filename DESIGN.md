# Design Brief

## Direction

Torque — a dark, high-contrast mechanical engineering toolkit that reads like a precision instrument panel: dense numeric readouts, sharp-edged inputs, and a single safety-amber accent that signals every actionable control.

## Tone

Industrial/utilitarian executed with conviction — a machined instrument, not a marketing page; deliberately rejecting the warm editorial serif and ambient-glow clichés in favor of engineering-drawing clarity.

## Differentiation

Monospace tabular readouts (`readout` utility) paired with oversized gloved-hand touch targets and a hazard-tape hairline divider — every result looks like a calibrated gauge reading, not a web form.

## Color Palette

| Token      | OKLCH          | Role                                      |
| ---------- | -------------- | ----------------------------------------- |
| background | 0.16 0.012 250 | Deep machined-steel canvas                |
| foreground | 0.96 0.006 250 | Near-white high-contrast text             |
| card       | 0.205 0.015 250 | Raised instrument-panel surface           |
| primary    | 0.82 0.17 82   | Safety amber — CTAs, active controls      |
| accent     | 0.78 0.13 205  | Signal cyan — SI/imperial toggle, data    |
| muted      | 0.26 0.018 250 | Recessed wells, inactive tabs             |

## Typography

- Display: Space Grotesk — headings, calculator titles, nav wordmark (technical geometric)
- Body: General Sans — labels, help text, paragraphs, buttons
- Mono: Geist Mono — all numeric readouts, units, formulas, timestamps (`readout` utility, tabular-nums)
- Scale: page title `text-2xl md:text-4xl font-bold tracking-tight`, card title `text-lg font-semibold`, label `text-xs font-semibold tracking-[0.15em] uppercase`, readout `text-3xl md:text-4xl font-semibold readout`, body `text-base text-muted-foreground`

## Elevation & Depth

Flat instrument panel: background → card → popover separated by crisp hairline borders; depth from `shadow-subtle` only — no glow orbs, no ambient blur, no grain decoration (speed over decoration).

## Structural Zones

| Zone    | Background                    | Border   | Notes                                                   |
| ------- | ----------------------------- | -------- | ------------------------------------------------------- |
| Header  | `bg-card` + backdrop-blur     | `border-b` | Sticky; wordmark left, SI/imperial toggle right        |
| Content | `bg-background`               | —        | Cards on `bg-card`; `bg-muted/40` wells for inputs     |
| Nav     | `bg-card` (fixed bottom, mobile) | `border-t` | Bottom tab bar, 4 targets ≥56px, thumb-reachable     |
| Footer  | `bg-muted/40`                 | `border-t` | Compact: disclaimer left, meta right                    |

## Spacing & Rhythm

Compact and scannable: section gaps `py-6 md:py-10`, container `max-w-3xl` (mobile-first, single column), card padding `p-4 md:p-6`, field grouping `gap-4`, micro `gap-2`; inputs min-height `h-12` with `text-lg`.

## Component Patterns

- Buttons: `rounded-md` (sharp), primary = solid amber with dark text, `h-12` min touch target; secondary = `bg-secondary` with hairline border; ghost for nav
- Cards: `rounded-lg`, `bg-card`, `border-border`, `shadow-subtle`; result cards get a `border-l-2 border-primary` accent edge
- Inputs: `rounded-md`, `bg-muted/40`, `border-input`, `h-12 text-lg`, focus `ring-2 ring-ring`; numeric fields use `readout` tabular figures
- Badges: `rounded` chips, `bg-muted`, uppercase mono micro-label for units and categories
- Disclaimer: `bg-warning/10 border border-warning/30 text-warning-foreground` strip on every calculator/converter

## Motion

- Entrance: `animate-fade-up` (0.7s) on page mount only, `motion-safe:` guarded
- Hover: `transition-smooth` on buttons/tabs — color and border only, no transform lift
- Decorative: none — no float, pulse, or ambient animation (factory-floor clarity)

## Constraints

- Dark mode only — the machined-steel canvas is the identity; no light theme
- Never use raw hex/rgb or arbitrary color classes; semantic tokens only
- Every calculator/converter surface shows the preliminary-design disclaimer
- Touch targets ≥48px; input text ≥16px to prevent mobile zoom
- Decorative animation must carry `motion-safe:`/`motion-reduce:` guards
- Do NOT design for fastener reference, GD&T reference, checklist builder, or accounts — out of scope

## Signature Detail

The readout treatment: every computed value renders in large tabular Geist Mono with an amber accent edge on its card — results read like a calibrated instrument gauge, the one memorable move that separates this from a generic form UI.
