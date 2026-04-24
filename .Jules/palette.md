## 2024-05-18 - Keyboard accessibility for hidden UI elements
**Learning:** Visually hidden interactive elements (like close buttons on tabs using `opacity-0 group-hover:opacity-100`) become inaccessible to keyboard-only users unless explicitly styled for focus visibility.
**Action:** Always append `focus-visible:opacity-100` and `group-focus-within:opacity-100` to such elements so they correctly appear when navigated via keyboard.
