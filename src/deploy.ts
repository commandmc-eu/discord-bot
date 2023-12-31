import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { REST, Routes } from "discord.js";
import { Command } from "./types/command";
dotenv.config();

const commands = [];
// Grab all the command files from the commands directory you created earlier
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file: string) => file.endsWith(".ts"));

(async () => {
  // Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
  for (const file of commandFiles) {
    const imported = await import(`./commands/${file}`);
    const command = imported.default as Command;
    commands.push(command.data.toJSON());
  }

  // Construct and prepare an instance of the REST module
  const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN!);

  // and deploy your commands
  try {
    console.log(
      `Started refreshing ${commands.length} application (/) commands.`
    );

    // The put method is used to fully refresh all commands in the guild with the current set
    const data = (await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID!),
      { body: commands }
    )) as unknown[];

    console.log(
      `Successfully reloaded ${data.length} application (/) commands.`
    );
  } catch (error) {
    // And of course, make sure you catch and log any errors!
    console.error(error);
  }
})();
