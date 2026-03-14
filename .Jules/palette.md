## 2026-03-12 - Keyboard Accessibility Learnings
**Learning:** For custom UI menus built with non-standard elements (like `<div>`), providing a `tabindex="0"` and `role="button"` makes them focusable, but CSS rules like `:focus-visible` or `:focus-within` are essential to display visual feedback (like dropdowns or outlines) without relying purely on hover states.
**Action:** When creating interactive UI components, ensure that both focusability (`tabindex`) and visual focus states are implemented for keyboard users.
