// @ts-check
import { Logger } from "./utils/Logger.js";

export class ErrorHandler {
  /**
   * Initialize global error handlers
   * @param {import('./ToastManager.js').ToastManager} toastManager
   */
  static init(toastManager) {
    window.addEventListener("error", (event) => {
      Logger.error("Uncaught Exception", {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
      });
      if (toastManager) {
        toastManager.show(`Error: ${event.message}`, "error");
      }
    });

    window.addEventListener("unhandledrejection", (event) => {
      const reason =
        event.reason instanceof Error
          ? event.reason.message
          : String(event.reason);
      Logger.error("Unhandled Promise Rejection", { reason });
      if (toastManager) {
        toastManager.show(`Promise Rejected: ${reason}`, "error");
      }
    });
  }
}
