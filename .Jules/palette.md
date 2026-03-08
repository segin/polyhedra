## 2026-02-05 - Accessibility in Scene Graph
**Learning:** Scene graph list items need `role="button"` and `tabindex="0"` for keyboard accessibility, plus `keydown` handlers. Icon-only buttons (visibility/delete) need dynamic `aria-label` updates.
**Action:** Always verify keyboard navigation for interactive list items.

## 2026-02-06 - User Feedback & Notifications
**Learning:** System alerts (`alert()`) are blocking and disruptive. `console.log` is invisible to end-users.
**Action:** Replaced critical user feedback (save/load status) with a non-blocking `ToastManager` system.
**Accessibility:** Implemented `role="status"` for info/success and `role="alert"` with `aria-live="assertive"` for errors to ensure screen readers announce critical issues immediately.

## 2024-05-19 - Accessible CSS Dropdowns via :focus-within
**Learning:** Pure CSS dropdown menus built with `:hover` completely block keyboard users because they cannot hover over the menu to reveal the dropdown items.
**Action:** When building or fixing CSS dropdowns, add `tabindex="0"` to the trigger element and use `.menu-item:focus-within .menu-dropdown { display: block; }` alongside the hover state. This keeps the menu open while the user tabs through its children, elegantly enabling keyboard navigation without requiring JavaScript. Additionally, always provide a `:focus-visible` state.
