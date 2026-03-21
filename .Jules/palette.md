## 2024-05-24 - Menu Dropdown Keyboard Navigation
**Learning:** CSS-only dropdown menus that rely on `:hover` to display `.menu-dropdown` are completely inaccessible to keyboard users unless explicitly updated.
**Action:** Always add `tabIndex={0}`, `role="button"`, and `aria-haspopup="true"` to the menu trigger `.menu-item`. Update CSS to show dropdowns on `:focus-within` and add `:focus-visible` styles to trigger items and dropdown links so keyboard users can navigate.
