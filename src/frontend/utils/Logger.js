// @ts-check
import log from 'loglevel';

const isProduction = typeof window !== 'undefined' && window.location.hostname !== 'localhost';

export const Logger = {
  /**
   * Initialize logging level
   */
  init() {
    if (isProduction) {
      log.setLevel('info');
    } else {
      log.setLevel('debug');
    }
  },

  /**
   * Helper to format log messages with ISO timestamp
   */
  _format(levelName, message, meta) {
    const timestamp = new Date().toISOString();
    let metaStr = '';
    
    if (meta !== undefined) {
      try {
        metaStr = typeof meta === 'object' ? JSON.stringify(meta, this._getCircularReplacer()) : String(meta);
      } catch {
        metaStr = '[Unserializable Meta]';
      }
    }
    
    return `[${timestamp}] [${levelName}] ${message} ${metaStr}`.trim();
  },

  /**
   * Safely stringify objects with circular references
   */
  _getCircularReplacer() {
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
  },

  debug(message, meta) {
    if (log.getLevel() <= log.levels.DEBUG) {
      console.debug(this._format('DEBUG', message, meta));
    }
  },

  info(message, meta) {
    if (log.getLevel() <= log.levels.INFO) {
      console.info(this._format('INFO', message, meta));
    }
  },

  warn(message, meta) {
    if (log.getLevel() <= log.levels.WARN) {
      console.warn(this._format('WARN', message, meta));
    }
  },

  error(message, meta) {
    if (log.getLevel() <= log.levels.ERROR) {
      console.error(this._format('ERROR', message, meta));
    }
  }
};

Logger.init();
