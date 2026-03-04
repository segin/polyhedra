import { Logger } from '../src/frontend/utils/Logger.js';
import log from 'loglevel';

describe('Frontend Logger', () => {
  beforeEach(() => {
    jest.spyOn(console, 'info').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'debug').mockImplementation(() => {});
    log.setLevel('debug'); // Ensure we can see all logs
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('should format correctly with ISO timestamp', () => {
    Logger.info('Test Message', { some: 'data' });
    expect(console.info).toHaveBeenCalled();
    const output = console.info.mock.calls[0][0];
    expect(output).toMatch(/^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\] \[INFO\] Test Message {"some":"data"}$/);
  });

  test('should handle circular meta objects without throwing', () => {
    const obj = { a: 1 };
    obj.self = obj;
    Logger.error('Circular Message', obj);
    expect(console.error).toHaveBeenCalled();
    const output = console.error.mock.calls[0][0];
    expect(output).toContain('"[Circular]"');
  });

  test('should handle string meta', () => {
    Logger.warn('Warning', 'Simple String');
    expect(console.warn).toHaveBeenCalled();
    const output = console.warn.mock.calls[0][0];
    expect(output).toContain('[WARN] Warning Simple String');
  });
});
