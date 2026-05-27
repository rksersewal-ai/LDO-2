## 2026-04-26 - ARIA labels for icon-only buttons
**Learning:** Icon-only buttons without `aria-label` attributes are a common accessibility anti-pattern in the codebase, particularly in complex UI components like document viewers where visual space is constrained.
**Action:** Always verify that buttons lacking descriptive text content include an appropriate `aria-label` to ensure screen reader users can interact with the controls.

## 2026-05-27 - Dynamic ARIA labels in Repetitive Structures
**Learning:** Icon buttons within repetitive structures (like data tables or map lists) lack context when rendered by screen readers if they don't have dynamic row/item specific information in their labels. Static aria-labels result in multiple identical buttons (e.g. 'View document', 'View document').
**Action:** Always use dynamic template literals (e.g. `aria-label={"View ${item.name}"}`) when adding ARIA labels to elements within repetitive arrays.
