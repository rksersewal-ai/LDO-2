## 2026-04-26 - ARIA labels for icon-only buttons
**Learning:** Icon-only buttons without `aria-label` attributes are a common accessibility anti-pattern in the codebase, particularly in complex UI components like document viewers where visual space is constrained.
**Action:** Always verify that buttons lacking descriptive text content include an appropriate `aria-label` to ensure screen reader users can interact with the controls.
## 2024-05-18 - ARIA labels for dynamic table action buttons
**Learning:** Repetitive UI structures like data tables often use icon-only buttons (View, Edit, Delete) where identical visible structure masks poor screen-reader context. The lack of distinct descriptive context causes ambiguity.
**Action:** Always use dynamic template literals (e.g., ``aria-label={`View document ${row.original.title}`}``) for action buttons within repeating lists or tables to explicitly link the action to the relevant item identifier.
