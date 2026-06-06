## 2026-04-26 - ARIA labels for icon-only buttons
**Learning:** Icon-only buttons without `aria-label` attributes are a common accessibility anti-pattern in the codebase, particularly in complex UI components like document viewers where visual space is constrained.
**Action:** Always verify that buttons lacking descriptive text content include an appropriate `aria-label` to ensure screen reader users can interact with the controls.
## 2024-06-06 - Dynamic ARIA labels in tables
**Learning:** Reusable data tables and repetitive structures with row-specific actions must construct `aria-label`s dynamically (e.g., using `row.original.title` or `item.duplicate`) to prevent identical, ambiguous labels for screen reader users traversing the list.
**Action:** Always interpolate unique row identifiers (titles, part numbers, IDs) into the `aria-label` of action buttons within iterative map structures or table cells.
