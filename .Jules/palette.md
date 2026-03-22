## 2024-03-20 - Adding keyboard accessibility to list items
**Learning:** Found that custom `li` items in the scene graph acting as interactive elements need proper `tabindex` and `role` to be keyboard accessible.
**Action:** Always ensure custom list items functioning as buttons have `tabindex="0"` and handle `keydown` events (Enter/Space) in addition to `click` events.

## 2026-02-05 - Accessibility in Scene Graph
**Learning:** Scene graph list items need `role="button"` and `tabindex="0"` for keyboard accessibility, plus `keydown` handlers. Icon-only buttons (visibility/delete) need dynamic `aria-label` updates.
**Action:** Always verify keyboard navigation for interactive list items.

## 2026-02-06 - User Feedback & Notifications
**Learning:** System alerts (`alert()`) are blocking and disruptive. `console.log` is invisible to end-users.
**Action:** Replaced critical user feedback (save/load status) with a non-blocking `ToastManager` system.
**Accessibility:** Implemented `role="status"` for info/success and `role="alert"` with `aria-live="assertive"` for errors to ensure screen readers announce critical issues immediately.
