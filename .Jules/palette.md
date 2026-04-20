## 2024-04-20 - Keyboard Accessibility for Visually Hidden Interactive Elements
**Learning:** Visually hiding interactive elements (like close buttons or checkboxes) via `opacity-0 group-hover:opacity-100` makes them inaccessible to keyboard users unless explicitly handled, as they remain invisible when focused.
**Action:** Always pair `opacity-0 group-hover:opacity-100` with `focus-visible:opacity-100 focus-visible:ring-2` on buttons, and use `group-focus-within:opacity-100` for inner elements to ensure keyboard focus visibility and support keyboard navigation.
