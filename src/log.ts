import fs from "fs";

const logLevels = ["error", "warning", "info", "debug"] as const;
type LogLevel = (typeof logLevels)[number];

let fileName = new Date().toISOString().replace(/:/g, "-");

const writeLogToFile = (message: string) => {
  fs.writeFileSync(`logs/${fileName}.log`, `${message}\n`, { flag: "a" });
};

const createLogMethod = (type: LogLevel, prefix: string) => (message: string) => {
  const timestamp = new Date().toISOString();
  const fullMessage = `${timestamp} - ${type}: ${prefix} ${message}`;
  console.log(fullMessage);
  writeLogToFile(fullMessage);
};

type LoggerObj = {
  [key in LogLevel]: (message: string) => void;
};

export const createLogger = (file: string, method: string) => {
  let prefix = `[${file}]:[${method}]`;
  const loggerObj: Partial<LoggerObj> = {};
  logLevels.forEach((level) => {
    loggerObj[level] = createLogMethod(level, prefix);
  });
  return loggerObj as LoggerObj;
};

export const messageFromCatch = (error: unknown) => {
  if (error instanceof Error) {
    return error.message;
  }
  return "An error occured";
};
