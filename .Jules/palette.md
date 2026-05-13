## 2026-04-26 - ARIA labels for icon-only buttons
**Learning:** Icon-only buttons without `aria-label` attributes are a common accessibility anti-pattern in the codebase, particularly in complex UI components like document viewers where visual space is constrained.
**Action:** Always verify that buttons lacking descriptive text content include an appropriate `aria-label` to ensure screen reader users can interact with the controls.

## 2024-05-13 - Dynamic ARIA labels in repetitive structures
**Learning:** Hardcoding static `aria-label`s on actions inside data tables (like "Edit" or "Delete") creates ambiguous and confusing experiences for screen reader users, as all rows will announce identical text.
**Action:** Always use dynamic template literals to include row-specific context in `aria-label`s (e.g., ``aria-label={`Delete document ${row.original.title}`}``) to ensure each interactive element is uniquely identifiable.
