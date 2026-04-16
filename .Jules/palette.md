## 2024-05-24 - Missing Focus and Aria States in Banner Management
**Learning:** Found that custom switch toggles built with `button` tags and internal state lacked standard `role="switch"`, `aria-checked` attributes, and `focus-visible:ring-2` for keyboard navigation, specifically in . Similarly, icon-only action buttons lacked `aria-label` attributes.
**Action:** Next time, ensure all custom interactive components (like toggles) implement standard ARIA roles and all icon-only buttons include descriptive `aria-label`s and visible focus states using `focus-visible:ring-2`.
## 2024-05-24 - Missing Focus and Aria States in Banner Management
**Learning:** Found that custom switch toggles built with `button` tags and internal state lacked standard `role="switch"`, `aria-checked` attributes, and `focus-visible:ring-2` for keyboard navigation, specifically in BannerManagement.tsx. Similarly, icon-only action buttons lacked `aria-label` attributes.
**Action:** Next time, ensure all custom interactive components (like toggles) implement standard ARIA roles and all icon-only buttons include descriptive `aria-label`s and visible focus states using `focus-visible:ring-2`.
