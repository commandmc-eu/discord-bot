import { Client, Collection } from "discord.js";
import path from "path";
import fs from "fs";
import { Command } from "src/types/command";

export const registerCommands = (client: Client, dir: string) => {
  client.commands = new Collection();
  const commandFolderPath = path.join(__dirname, "..", dir);
  const commandFiles = fs.readdirSync(commandFolderPath);

  for (const file of commandFiles) {
    const filePath = path.join(commandFolderPath, file);
    const imported = require(filePath);
    const command = imported.default as Command;
    if ("data" in command && "execute" in command) {
      client.commands.set(command.data.name, command);
    } else {
      console.log(
        `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
      );
    }
  }
};
