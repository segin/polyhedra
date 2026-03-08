import { ToastManager } from "../src/frontend/ToastManager.js";

describe("ToastManager", () => {
  let toastManager;

  beforeEach(() => {
    document.body.innerHTML = "";
    toastManager = new ToastManager();
  });

  test("should create toast container on initialization", () => {
    const container = document.getElementById("toast-container");
    expect(container).toBeTruthy();
    expect(container.getAttribute("role")).toBe("status");
    expect(container.getAttribute("aria-live")).toBe("polite");
  });

  test("should show toast message", () => {
    toastManager.show("Test Message", "info");
    const toast = document.querySelector(".toast");
    expect(toast).toBeTruthy();
    expect(toast.textContent).toBe("Test Message");
    expect(toast.classList.contains("toast-info")).toBe(true);
  });

  test('should set role="alert" for error toasts', () => {
    toastManager.show("Error Message", "error");
    const toast = document.querySelector(".toast");
    expect(toast.getAttribute("role")).toBe("alert");
    expect(toast.getAttribute("aria-live")).toBe("assertive");
  });

  test("should remove toast after duration", () => {
    jest.useFakeTimers();
    toastManager.show("Auto dismiss", "info", 1000);

    expect(document.querySelectorAll(".toast").length).toBe(1);

    jest.advanceTimersByTime(1000); // Trigger remove class
    jest.advanceTimersByTime(300); // Trigger removal

    expect(document.querySelectorAll(".toast").length).toBe(0);
    jest.useRealTimers();
  });
});
