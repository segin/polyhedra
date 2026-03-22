## 2026-02-05 - Accessibility in Scene Graph
**Learning:** Scene graph list items need `role="button"` and `tabindex="0"` for keyboard accessibility, plus `keydown` handlers. Icon-only buttons (visibility/delete) need dynamic `aria-label` updates.
**Action:** Always verify keyboard navigation for interactive list items.

## 2026-02-06 - User Feedback & Notifications
**Learning:** System alerts (`alert()`) are blocking and disruptive. `console.log` is invisible to end-users.
**Action:** Replaced critical user feedback (save/load status) with a non-blocking `ToastManager` system.
**Accessibility:** Implemented `role="status"` for info/success and `role="alert"` with `aria-live="assertive"` for errors to ensure screen readers announce critical issues immediately.

## 2026-03-20 - Keyboard Accessible CSS Dropdowns
**Learning:** In applications using CSS-only hover dropdowns (`display: none` to `display: block`), keyboard users are completely blocked from accessing the dropdown links. This happens because `display: none` removes the children from the tab order, and without a way to focus the parent to reveal them, the links remain inaccessible.
**Action:** Always pair `:hover` with `:focus-within` and `:focus` on the parent container, and ensure the parent container has `tabIndex={0}` and appropriate ARIA roles (`role="button"`, `aria-haspopup="true"`, `aria-expanded="false"`) so it can receive focus and correctly announce itself to screen readers, allowing it to reveal its children to the tab order.
