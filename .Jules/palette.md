## 2026-04-26 - ARIA labels for icon-only buttons
**Learning:** Icon-only buttons without `aria-label` attributes are a common accessibility anti-pattern in the codebase, particularly in complex UI components like document viewers where visual space is constrained.
**Action:** Always verify that buttons lacking descriptive text content include an appropriate `aria-label` to ensure screen reader users can interact with the controls.

## 2024-05-18 - Missing ARIA Labels on Optional Icon-Only Component States
**Learning:** When creating reusable UI components with an optional `iconOnly` prop (e.g., `DocumentPreviewButton`, `DocumentDetailsButton`), hiding the text label often inadvertently removes the accessible name for the button. Screen reader users lose context entirely because the `aria-label` fallback is not provided for the icon-only state.
**Action:** Always ensure that when a button text label is visually hidden (such as when `iconOnly=true`), the original label string is still passed to the `aria-label` prop of the button element to prevent accessibility regressions.
