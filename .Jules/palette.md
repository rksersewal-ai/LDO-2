
## 2024-05-15 - [Interactive element a11y]
**Learning:** Using `div` tags for interactive elements (like expand/collapse toggles) without `role="button"`, `tabIndex`, or proper ARIA attributes ignores screen-readers completely and drops keyboard support. Adding `focus-visible` styles makes a huge difference for keyboard navigation.
**Action:** Always prefer native `<button>` elements for interactive UI actions. Remember to attach `aria-expanded` attributes on collapsible menu controls and apply `focus-visible` rings on custom UI interactive components.
