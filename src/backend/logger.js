import log from 'loglevel';

const originalFactory = log.methodFactory;
log.methodFactory = (methodName, logLevel, loggerName) => {
  const rawMethod = originalFactory(methodName, logLevel, loggerName);

  return (message, ...args) => {
    const logObject = {
      timestamp: new Date().toISOString(),
      level: methodName,
      message,
      extra: args,
    };

    const circularReplacer = () => {
      const seen = new WeakSet();
      return (key, value) => {
        if (typeof value === 'object' && value !== null) {
          if (seen.has(value)) {
            return '[Circular]';
          }
          seen.add(value);
        }
        return value;
      };
    };

    rawMethod(JSON.stringify(logObject, circularReplacer()));
  };
};

log.setLevel('info'); // Set the default log level

export default log;
