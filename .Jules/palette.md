## 2026-04-26 - ARIA labels for icon-only buttons
**Learning:** Icon-only buttons without `aria-label` attributes are a common accessibility anti-pattern in the codebase, particularly in complex UI components like document viewers where visual space is constrained.
**Action:** Always verify that buttons lacking descriptive text content include an appropriate `aria-label` to ensure screen reader users can interact with the controls.

## 2024-05-29 - Dynamic ARIA labels in tables
**Learning:** When adding ARIA labels to repetitive structures like data tables, using static labels (e.g., "View document") creates an ambiguous experience for screen reader users who hear the same label repeatedly.
**Action:** Use dynamic template literals to include row-specific text in ARIA labels (e.g., `aria-label={"View document ${row.original.title}"}`) to provide necessary context.
