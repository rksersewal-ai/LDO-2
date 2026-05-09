## 2026-04-26 - ARIA labels for icon-only buttons
**Learning:** Icon-only buttons without `aria-label` attributes are a common accessibility anti-pattern in the codebase, particularly in complex UI components like document viewers where visual space is constrained.
**Action:** Always verify that buttons lacking descriptive text content include an appropriate `aria-label` to ensure screen reader users can interact with the controls.

## 2026-05-09 - Accessible interactive divs
**Learning:** Using `div` elements with `onClick` handlers for interactivity is an anti-pattern. While adding `role="button"`, `tabIndex={0}`, and `onKeyDown` handlers works, replacing the `div` with a native `button` is the preferred and more robust approach.
**Action:** When encountering interactive `div`s, strive to refactor them to native `<button>` elements whenever possible, rather than patching them with ARIA attributes.
