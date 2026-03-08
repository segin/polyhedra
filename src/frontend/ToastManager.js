// @ts-check

export class ToastManager {
  constructor() {
    this.container = document.createElement("div");
    this.container.id = "toast-container";
    this.container.setAttribute("role", "status");
    this.container.setAttribute("aria-live", "polite");
    document.body.appendChild(this.container);
  }

  /**
   * Shows a toast notification.
   * @param {string} message - The message to display.
   * @param {'info'|'success'|'error'} type - The type of toast.
   * @param {number} duration - Duration in ms.
   */
  show(message, type = "info", duration = 3000) {
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.textContent = message;

    // Accessibility: Errors should be assertive
    if (type === "error") {
      toast.setAttribute("role", "alert");
      toast.setAttribute("aria-live", "assertive");
    }

    this.container.appendChild(toast);

    // Trigger reflow for animation
    // @ts-ignore
    toast.offsetHeight;
    toast.classList.add("show");

    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300); // Wait for transition
    }, duration);
  }
}
