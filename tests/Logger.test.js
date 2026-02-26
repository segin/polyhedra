describe('Logger', () => {
  let logSpy;
  let log;

  beforeEach(async () => {
    jest.resetModules();
    logSpy = jest.spyOn(console, 'info').mockImplementation(() => {});
    // Import logger after mocking console so loglevel picks up the mock
    const module = await import('../src/backend/logger.js');
    log = module.default;
  });

  afterEach(() => {
    logSpy.mockRestore();
    jest.restoreAllMocks(); // Restore JSON spy
  });

  it('should log simple objects correctly', () => {
    const obj = { test: 'value' };
    log.info('message', obj);

    expect(logSpy).toHaveBeenCalled();
    const callArg = logSpy.mock.calls[0][0];
    const parsed = JSON.parse(callArg);

    expect(parsed.message).toBe('message');
    expect(parsed.extra[0]).toEqual(obj);
    expect(parsed.level).toBe('info');
    expect(parsed.timestamp).toBeDefined();
  });

  it('should handle circular references gracefully', () => {
    const obj = { name: 'circular' };
    obj.self = obj;

    log.info('circular message', obj);

    expect(logSpy).toHaveBeenCalled();
    const callArg = logSpy.mock.calls[0][0];
    const parsed = JSON.parse(callArg);

    expect(parsed.message).toBe('circular message');
    expect(parsed.extra[0].name).toBe('circular');
    expect(parsed.extra[0].self).toBe('[Circular]');
  });

  it('should handle complex circular structures', () => {
    const a = { name: 'a' };
    const b = { name: 'b', parent: a };
    a.child = b;

    log.info('complex circular', a);

    expect(logSpy).toHaveBeenCalled();
    const callArg = logSpy.mock.calls[0][0];
    const parsed = JSON.parse(callArg);

    expect(parsed.extra[0].name).toBe('a');
    expect(parsed.extra[0].child.name).toBe('b');
    expect(parsed.extra[0].child.parent).toBe('[Circular]');
  });

  it('should use optimistic strategy: try normal stringify first', () => {
    const stringifySpy = jest.spyOn(JSON, 'stringify');
    const obj = { simple: true };

    log.info('test', obj);

    // We expect at least 1 call to JSON.stringify from our code
    // Note: parsed = JSON.parse(callArg) in other tests also calls JSON.parse,
    // but here we are checking calls *during* log.info.

    expect(stringifySpy).toHaveBeenCalled();
    // Find the call that matches our log object structure
    // The first call should be the one from our logger
    const calls = stringifySpy.mock.calls.filter(call => call[0] && call[0].message === 'test');
    expect(calls.length).toBeGreaterThan(0);
    expect(calls[0][1]).toBeUndefined(); // First call should have no replacer
  });

  it('should fallback to safe stringify for circular objects', () => {
    const stringifySpy = jest.spyOn(JSON, 'stringify');
    const obj = { circular: true };
    obj.self = obj;

    log.info('test', obj);

    // Filter for calls related to our log object
    const calls = stringifySpy.mock.calls.filter(call => call[0] && call[0].message === 'test');

    expect(calls.length).toBeGreaterThanOrEqual(2);
    expect(calls[0][1]).toBeUndefined(); // First attempt: unsafe
    expect(calls[1][1]).toBeDefined();   // Second attempt: safe replacer
  });
});
