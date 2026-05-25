## 2026-04-26 - ARIA labels for icon-only buttons
**Learning:** Icon-only buttons without `aria-label` attributes are a common accessibility anti-pattern in the codebase, particularly in complex UI components like document viewers where visual space is constrained.
**Action:** Always verify that buttons lacking descriptive text content include an appropriate `aria-label` to ensure screen reader users can interact with the controls.
## 2024-05-24 - Dynamic ARIA labels for Data Tables
**Learning:** Adding static ARIA labels to repetitive structures like data tables creates ambiguity for screen reader users (e.g., hearing 'View document' repeatedly without knowing which document).
**Action:** Always use dynamic template literals (e.g., `aria-label={"View document ${row.original.title}"}`) when adding ARIA labels to interactive elements inside list or table iterations to ensure full contextual clarity.
