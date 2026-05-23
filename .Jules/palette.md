## 2026-04-26 - ARIA labels for icon-only buttons
**Learning:** Icon-only buttons without `aria-label` attributes are a common accessibility anti-pattern in the codebase, particularly in complex UI components like document viewers where visual space is constrained.
**Action:** Always verify that buttons lacking descriptive text content include an appropriate `aria-label` to ensure screen reader users can interact with the controls.

## 2026-05-23 - Dynamic ARIA labels in repetitive tables
**Learning:** When adding ARIA labels to buttons inside repetitive structures like tables or mapped lists, static labels (like 'View' or 'Delete') create ambiguous and duplicate announcements for screen reader users.
**Action:** Use dynamic template literals with row-specific context (e.g., `View document ${row.original.title}`) to ensure each label is uniquely identifiable.
