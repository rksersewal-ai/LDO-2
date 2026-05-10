## 2026-04-26 - ARIA labels for icon-only buttons
**Learning:** Icon-only buttons without `aria-label` attributes are a common accessibility anti-pattern in the codebase, particularly in complex UI components like document viewers where visual space is constrained.
**Action:** Always verify that buttons lacking descriptive text content include an appropriate `aria-label` to ensure screen reader users can interact with the controls.

## 2024-05-18 - Dynamic ARIA labels in Data Tables
**Learning:** When adding ARIA labels to interactive elements within repetitive structures like data tables or lists, static labels (like 'View document') are insufficient and can cause confusion for screen reader users since multiple identical labels exist on the same page. Providing row-specific text context is necessary for true accessibility.
**Action:** Use dynamic template literals to incorporate row-specific text context (e.g., `aria-label={"View document ${row.original.title}"}`) into ARIA labels for buttons in tables to ensure they are distinct and descriptive.
