## 2025-04-12 - Added ARIA Labels to Document Viewer Toolbar Buttons
**Learning:** Found multiple icon-only buttons in the DocumentDetail component lacking aria-labels, making the PDF viewer inaccessible to screen readers.
**Action:** Always add `aria-label` to icon-only action buttons (e.g., zoom, rotate, fullscreen, pagination) specifically within complex embedded viewers where visual context is lost to screen readers.
