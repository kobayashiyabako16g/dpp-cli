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
      console.log(blue("debug: "), ...args);
    }
  }

  info(...args: unknown[]) {
    if (this.level <= LogLevel.INFO) {
      console.log(blue("info: "), ...args);
    }
  }

  warn(...args: unknown[]) {
    if (this.level <= LogLevel.WARN) {
      console.warn(yellow("warn: "), ...args);
    }
  }

  error(...args: unknown[]) {
    if (this.level <= LogLevel.ERROR) {
      console.error(red("error: "), ...args);
    }
  }

  success(...args: unknown[]) {
    if (this.level <= LogLevel.INFO) {
      console.log(green("success: "), ...args);
    }
  }
}

export const logger = new Logger();
