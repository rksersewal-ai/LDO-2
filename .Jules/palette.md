## 2026-04-26 - ARIA labels for icon-only buttons
**Learning:** Icon-only buttons without `aria-label` attributes are a common accessibility anti-pattern in the codebase, particularly in complex UI components like document viewers where visual space is constrained.
**Action:** Always verify that buttons lacking descriptive text content include an appropriate `aria-label` to ensure screen reader users can interact with the controls.

## 2026-05-18 - The danger of `iconOnly` props in reusable components
**Learning:** Adding an `iconOnly` prop to shared UI components (like action buttons) often accidentally strips away the accessible name for screen readers, creating systemic accessibility failures across multiple views.
**Action:** When creating or modifying reusable components with an `iconOnly` state, ensure that the original label text is preserved as an `aria-label` fallback if the visual text is hidden.
