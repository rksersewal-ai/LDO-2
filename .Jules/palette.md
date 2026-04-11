## 2026-04-11 - Add keyboard accessibility to Sidebar
**Learning:** Found that custom interactive UI elements (like user profile blocks) were built using generic `div` elements without keyboard navigation support or accessible roles.
**Action:** Always convert generic interactive elements into native `<button>` tags, and ensure they have appropriate `aria-label`, `aria-expanded`, and focus indicators like `focus-visible:ring-2` for proper keyboard accessibility.
