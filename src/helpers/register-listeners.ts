import { Client } from "discord.js";
import path from "path";
import fs from "fs";
import { createLogger } from "../log";

const logger = createLogger("helpers/register-listeners.ts", "registerListeners");

export const registerListeners = (client: Client, dir: string) => {
  const listenerFolderPath = path.join(__dirname, "..", dir);
  const listenerFiles = fs.readdirSync(listenerFolderPath);

  for (const file of listenerFiles) {
    const filePath = path.join(listenerFolderPath, file);
    const listener = require(filePath);
    if ("registerListener" in listener) {
      listener.registerListener(client);
      logger.info(`Registered listener at ${filePath}`);
    } else {
      logger.warning(`The listener at ${filePath} is missing a required "registerListener" function`);
    }
  }
};
