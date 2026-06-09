## 2026-04-26 - ARIA labels for icon-only buttons
**Learning:** Icon-only buttons without `aria-label` attributes are a common accessibility anti-pattern in the codebase, particularly in complex UI components like document viewers where visual space is constrained.
**Action:** Always verify that buttons lacking descriptive text content include an appropriate `aria-label` to ensure screen reader users can interact with the controls.

## 2026-06-09 - Dynamic ARIA Labels in Tables
**Learning:** When adding ARIA labels to interactive elements within repetitive structures like data tables or lists, it is crucial to use dynamic template literals (e.g., `row.original.title` or `row.original.part_number`) instead of static labels. This ensures screen reader users have the necessary context for each action and avoids ambiguous, duplicate readouts.
**Action:** Always include specific identifying properties from row data when providing ARIA labels for icon-only actions in repeated list/table contexts.
