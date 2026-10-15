# Project Guidance

## User Preferences

- Mobile-first layout that works one-handed on a phone
- Speed and clarity prioritized over decorative animation
- Clean, high-contrast interface with large input fields for factory floors and job sites
- Every calculator and converter shows a preliminary-design disclaimer that results must be verified against official standards

## Verified Commands

- **typecheck**: `pnpm typecheck`
- **fix**: `pnpm fix`
- **build**: `pnpm build`

## Learnings

- The scaffold's src/frontend/src/index.css already ships the full OKLCH token set, font-faces and utilities (text-gradient-primary, bg-grain, transition-smooth), and tailwind.config.js already maps boxShadow subtle/elevated/glow plus fade-up/float-slow/pulse-soft keyframes; showcase pages only need to consume them.
- Verified frontend commands from src/frontend/: pnpm install --prefer-offline, pnpm typecheck, pnpm fix, pnpm build all pass; biome check --write reformats but does not break tsc.
- A Vitest 3 + jsdom + React Testing Library harness lives under src/frontend/src/__tests__/ with the root test script `pnpm --dir app test`; test files are tester-owned.
- Nav and footer anchor links must each have a matching section id in the rendered page; #solutions/#pricing/#company had no targets in this build.
- Decorative Tailwind animations should carry motion-safe:/motion-reduce: guards to honor prefers-reduced-motion.
- Verified frontend commands from src/frontend/: pnpm install --prefer-offline, pnpm typecheck, pnpm fix, pnpm build all pass; the root test script is `pnpm --dir app test` (Vitest 3 + jsdom + RTL).
- Verified backend commands: mops install && mops check --fix, then mops build, then pnpm bindgen from the project root.
- 'label' is a Motoko reserved keyword and cannot be a record field name; the ValueEntry field is named 'name'.
- Motoko rejects a backslash-newline line continuation inside a Text literal when the continued line begins with indentation (M0002 illegal escape); build multi-line Markdown as explicit \n escapes concatenated with #.
- OQL auto-derivation (.toEntity) does not support records with collection fields such as [ValueEntry]; use OQL.Entity.manual with .payload for those rows.
- A query func cannot seed state; seed persistent data in the migration chain entry instead, and keep the migration self-contained.
- The app uses TanStack Router with four routes (Converter, Calculators, Materials, History); typed Link search params require a matching validateSearch on the target route.
- The backend exposes saveCalculation, listCalculations, deleteCalculation, listMaterials and getApiDoc, with OQL exposure and Enhanced Migration under src/backend/migrations.
