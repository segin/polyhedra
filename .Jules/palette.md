## 2026-02-05 - Accessibility in Scene Graph
**Learning:** Scene graph list items need `role="button"` and `tabindex="0"` for keyboard accessibility, plus `keydown` handlers. Icon-only buttons (visibility/delete) need dynamic `aria-label` updates.
**Action:** Always verify keyboard navigation for interactive list items.

## 2026-02-06 - User Feedback & Notifications
**Learning:** System alerts (`alert()`) are blocking and disruptive. `console.log` is invisible to end-users.
**Action:** Replaced critical user feedback (save/load status) with a non-blocking `ToastManager` system.
**Accessibility:** Implemented `role="status"` for info/success and `role="alert"` with `aria-live="assertive"` for errors to ensure screen readers announce critical issues immediately.
## 2026-03-04 - Accessibility for Scene Graph Empty State and Delete Buttons
**Learning:** The Scene Graph list items empty state and delete buttons lack proper ARIA labels and focus states, making them difficult to interact with via keyboard or screen reader.
**Action:** Add `role="listitem"`, `role="button"`, `tabindex="0"`, and `aria-label` attributes to dynamically generated DOM elements. Also add a keydown listener for Space/Enter.
