## 2024-05-27 - [Add ARIA labels to repetitive action buttons]
**Learning:** Icon-only action buttons inside dynamic tables (like DocumentTable) need unique, row-specific ARIA labels. Generic labels like "View" become ambiguous and repetitive for screen reader users parsing the table.
**Action:** Always use dynamic template literals (e.g. `aria-label={"View document ${row.original.title}"}`) to include row-specific text for action buttons inside repetitive lists or tables.
