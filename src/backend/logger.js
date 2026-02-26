import log from "loglevel";

const getCircularReplacer = () => {
  const seen = new WeakSet();
  return (key, value) => {
    if (typeof value === "object" && value !== null) {
      if (seen.has(value)) {
        return "[Circular]";
      }
      seen.add(value);
    }
    return value;
  };
};

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

    let json;
    try {
      json = JSON.stringify(logObject);
    } catch (error) {
      // Fallback to safe stringify if circular reference is detected
      if (error instanceof TypeError) {
        try {
          json = JSON.stringify(logObject, getCircularReplacer());
        } catch (fallbackError) {
          // If it still fails (e.g. BigInt), rethrow original or fallback error
          throw fallbackError;
        }
      } else {
        throw error;
      }
    }

    rawMethod(json);
  };
};

log.setLevel("info"); // Set the default log level

export default log;
