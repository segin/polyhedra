## 2026-02-05 - Accessibility in Scene Graph
**Learning:** Scene graph list items need `role="button"` and `tabindex="0"` for keyboard accessibility, plus `keydown` handlers. Icon-only buttons (visibility/delete) need dynamic `aria-label` updates.
**Action:** Always verify keyboard navigation for interactive list items.

## 2026-02-06 - User Feedback & Notifications
**Learning:** System alerts (`alert()`) are blocking and disruptive. `console.log` is invisible to end-users.
**Action:** Replaced critical user feedback (save/load status) with a non-blocking `ToastManager` system.
**Accessibility:** Implemented `role="status"` for info/success and `role="alert"` with `aria-live="assertive"` for errors to ensure screen readers announce critical issues immediately.

## 2026-02-12 - Interactive DOM Elements A11y
**Learning:** When using dynamic <span> tags as buttons in UIRenderer for lists, it's missing vital a11y properties resulting in poor screen reader and keyboard UX.
**Action:** Always verify `role="button"`, `tabindex="0"`, dynamic `aria-label`s, and `keydown` support (Space/Enter) are properly added for keyboard-accessible interactable UI elements.
