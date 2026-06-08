## 2026-04-26 - ARIA labels for icon-only buttons
**Learning:** Icon-only buttons without `aria-label` attributes are a common accessibility anti-pattern in the codebase, particularly in complex UI components like document viewers where visual space is constrained.
**Action:** Always verify that buttons lacking descriptive text content include an appropriate `aria-label` to ensure screen reader users can interact with the controls.
## 2024-06-08 - Accessible tables in ldo-2-ui
**Learning:** Found an app-specific pattern where dynamic rows in `DataTable` instances containing icon-only Action buttons (View, Edit, Delete, Branch) consistently lack contextual `aria-label` attributes, which creates ambiguity for screen reader users trying to interpret generic Action cells across hundreds of document or BOM rows.
**Action:** When adding ARIA labels to repetitive structures, use dynamic template literals (e.g., `aria-label={"View document ${row.original.title}"}`) linked to the specific row's identifying property (e.g. `.title`, `.part_number`, or `.duplicate`) to guarantee distinct accessibility identities.
