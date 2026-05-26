## 2026-04-26 - ARIA labels for icon-only buttons
**Learning:** Icon-only buttons without `aria-label` attributes are a common accessibility anti-pattern in the codebase, particularly in complex UI components like document viewers where visual space is constrained.
**Action:** Always verify that buttons lacking descriptive text content include an appropriate `aria-label` to ensure screen reader users can interact with the controls.

## 2024-05-26 - Dynamic ARIA labels
**Learning:** Missing dynamic ARIA labels cause ambiguity for screen reader users in tables or lists with repeating actions.
**Action:** Use template literals for repetitive row actions (e.g. `aria-label={"View document ${row.original.title}"}`).
