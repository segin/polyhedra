import { ServiceContainer } from "../src/frontend/utils/ServiceContainer.js";

describe("ServiceContainer", () => {
  let container;

  beforeEach(() => {
    container = new ServiceContainer();
  });

  test("should register and retrieve a service", () => {
    const mockService = { id: 1 };
    container.register("MockService", mockService);

    expect(container.get("MockService")).toBe(mockService);
  });

  test("should throw an error when registering a duplicate service name", () => {
    const mockService = { id: 1 };
    container.register("MockService", mockService);

    expect(() => {
      container.register("MockService", { id: 2 });
    }).toThrow("Service 'MockService' is already registered.");
  });

  test("should throw an error when getting a non-existent service", () => {
    expect(() => {
      container.get("NonExistentService");
    }).toThrow("Service 'NonExistentService' not found.");
  });
});
