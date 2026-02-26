/**
 * @jest-environment node
 */

describe('Manual JSDOM Setup', () => {
  test('window should be defined even in node environment due to jest.dom.cjs polyfill', () => {
    expect(typeof window).not.toBe('undefined');
    expect(window.document).toBeDefined();
    expect(window.document.createElement).toBeDefined();
  });

  test('TextEncoder should be globally defined', () => {
    expect(global.TextEncoder).toBeDefined();
    expect(global.TextDecoder).toBeDefined();
  });
});
