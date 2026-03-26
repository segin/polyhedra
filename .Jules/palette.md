## 2025-02-09 - Accessible Delete Actions in Scene Graph
**Learning:** Dynamically generated lists with repeated actions (like "Delete") are confusing for screen reader users without context. In this app's scene graph (UIRenderer.js), adding an `aria-label` like `Delete ${object.name}` clarifies the target of the destructive action.
**Action:** When generating list items with action buttons, always ensure the button's `aria-label` includes the name or context of the item it affects, especially for destructive actions.
