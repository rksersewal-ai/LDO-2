## 2026-05-18 - Dynamic ARIA labels for Data Tables
**Learning:** Icon-only action buttons inside data tables lack screen reader context for which row they refer to. Using static aria-labels causes screen reader ambiguity across multiple rows.
**Action:** When adding ARIA labels to interactive elements within repetitive structures like data tables or lists, use dynamic template literals to include row-specific text (e.g., `aria-label={"View document ${row.original.title}"}`).
