## 2026-04-26 - ARIA labels for icon-only buttons
**Learning:** Icon-only buttons without `aria-label` attributes are a common accessibility anti-pattern in the codebase, particularly in complex UI components like document viewers where visual space is constrained.
**Action:** Always verify that buttons lacking descriptive text content include an appropriate `aria-label` to ensure screen reader users can interact with the controls.

## 2024-05-24 - Contextual ARIA labels for repetitive lists
**Learning:** Adding dynamic template literals to `aria-label`s inside data tables (e.g., `aria-label={"View document ${row.original.title}"}`) significantly improves screen reader navigation compared to generic "View" labels, preventing ambiguity when multiple similar action buttons exist on a single page.
**Action:** Always utilize row-specific contextual data (`id`, `title`, `name`, `part_number`) when applying ARIA labels to icon-only buttons within list or table components across the design system.
