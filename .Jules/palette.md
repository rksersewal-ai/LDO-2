## 2026-04-26 - ARIA labels for icon-only buttons
**Learning:** Icon-only buttons without `aria-label` attributes are a common accessibility anti-pattern in the codebase, particularly in complex UI components like document viewers where visual space is constrained.
**Action:** Always verify that buttons lacking descriptive text content include an appropriate `aria-label` to ensure screen reader users can interact with the controls.
## 2024-05-14 - Dynamic ARIA Labels in Tables
**Learning:** Repetitive table structures with action buttons (View, Edit, Delete) often result in ambiguous "View", "Edit" ARIA labels that are confusing for screen reader users because they lack row context.
**Action:** Always use dynamic template literals (e.g., `aria-label={"View ${row.original.title}"}`) when adding ARIA labels to interactive elements within lists or tables.
