import { blue, green, red, yellow } from "@std/fmt/colors";

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
      console.log(blue("[DEBUG]"), ...args);
    }
  }

  info(...args: unknown[]) {
    if (this.level <= LogLevel.INFO) {
      console.log(blue("[INFO]"), ...args);
    }
  }

  warn(...args: unknown[]) {
    if (this.level <= LogLevel.WARN) {
      console.warn(yellow("[WARN]"), ...args);
    }
  }

  error(...args: unknown[]) {
    if (this.level <= LogLevel.ERROR) {
      console.error(red("[ERROR]"), ...args);
    }
  }

  success(...args: unknown[]) {
    if (this.level <= LogLevel.INFO) {
      console.log(green("[SUCCESS]"), ...args);
    }
  }
}

export const logger = new Logger();
