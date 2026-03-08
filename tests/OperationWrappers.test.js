/* global Storage */
import {
  safeJSONParse,
  safeLocalStorageSet,
} from "../src/frontend/utils/OperationWrappers.js";
import { Logger } from "../src/frontend/utils/Logger.js";

jest.mock("../src/frontend/utils/Logger.js");

describe("OperationWrappers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("safeJSONParse", () => {
    test("should parse valid JSON", () => {
      const result = safeJSONParse('{"a": 1}');
      expect(result).toEqual({ a: 1 });
    });

    test("should return fallback and log error on invalid JSON", () => {
      const result = safeJSONParse("{invalid_json}", { fallback: true });
      expect(result).toEqual({ fallback: true });
      expect(Logger.error).toHaveBeenCalledWith(
        "Failed to parse JSON",
        expect.any(Object),
      );
    });

    test("should return null by default on invalid JSON if no fallback is provided", () => {
      const result = safeJSONParse("{invalid_json_2}");
      expect(result).toBeNull();
      expect(Logger.error).toHaveBeenCalled();
    });
  });

  describe("safeLocalStorageSet", () => {
    test("should return true on successful set", () => {
      const mockSetItem = jest
        .spyOn(Storage.prototype, "setItem")
        .mockImplementation(() => {});
      const result = safeLocalStorageSet("testKey", "testValue");
      expect(result).toBe(true);
      expect(mockSetItem).toHaveBeenCalledWith("testKey", "testValue");
      mockSetItem.mockRestore();
    });

    test("should return false and log error on set failure", () => {
      const mockSetItem = jest
        .spyOn(Storage.prototype, "setItem")
        .mockImplementation(() => {
          throw new Error("Quota exceeded");
        });
      const result = safeLocalStorageSet("testKey", "testValue");
      expect(result).toBe(false);
      expect(Logger.error).toHaveBeenCalledWith(
        "Failed to write to localStorage",
        expect.any(Object),
      );
      mockSetItem.mockRestore();
    });
  });
});
