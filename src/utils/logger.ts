export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

class Logger {
  private level: LogLevel = LogLevel.INFO;

  setLevel(level: LogLevel) {
    this.level = level;
  }

  debug(...args: unknown[]) {
    if (this.level <= LogLevel.DEBUG) {
      console.log("🔍", ...args);
    }
  }

  info(...args: unknown[]) {
    if (this.level <= LogLevel.INFO) {
      console.log("ℹ️", ...args);
    }
  }

  warn(...args: unknown[]) {
    if (this.level <= LogLevel.WARN) {
      console.warn("⚠️", ...args);
    }
  }

  error(...args: unknown[]) {
    if (this.level <= LogLevel.ERROR) {
      console.error("❌", ...args);
    }
  }

  success(...args: unknown[]) {
    if (this.level <= LogLevel.INFO) {
      console.log("✅", ...args);
    }
  }
}

export const logger = new Logger();
