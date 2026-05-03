## 2026-04-26 - ARIA labels for icon-only buttons
**Learning:** Icon-only buttons without `aria-label` attributes are a common accessibility anti-pattern in the codebase, particularly in complex UI components like document viewers where visual space is constrained.
**Action:** Always verify that buttons lacking descriptive text content include an appropriate `aria-label` to ensure screen reader users can interact with the controls.

## 2026-10-25 - Focus visibility for visually hidden hover actions
**Learning:** Actions revealed only on hover (like `opacity-0 group-hover:opacity-100`) often become completely invisible to keyboard users because they lack focus states.
**Action:** When implementing visually hidden actions revealed on hover, always ensure they are accompanied by focus-visible classes (`focus-visible:opacity-100 focus-visible:ring-2`) and proper `aria-label`s to maintain keyboard accessibility.
