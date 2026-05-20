## 2026-04-26 - ARIA labels for icon-only buttons
**Learning:** Icon-only buttons without `aria-label` attributes are a common accessibility anti-pattern in the codebase, particularly in complex UI components like document viewers where visual space is constrained.
**Action:** Always verify that buttons lacking descriptive text content include an appropriate `aria-label` to ensure screen reader users can interact with the controls.
## 2026-05-20 - Dynamic ARIA labels for repetitive lists and tables
**Learning:** Hardcoding static `aria-label` attributes in repeated rows or mapped elements creates ambiguous experiences for screen reader users, as every item is announced identically (e.g., "View document").
**Action:** When adding ARIA labels to interactive elements within repetitive structures like data tables or lists, always use dynamic template literals to include row-specific text (e.g., `aria-label={"View document ${row.original.title}"}`). This provides necessary context and prevents duplicate, ambiguous labels.
