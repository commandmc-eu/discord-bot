import { exec } from "child_process";
import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { createLogger, messageFromCatch } from "../log";
import { Command } from "src/types/command";

const servers = ["minigame", "spightwars"];
const executeLogger = createLogger("commands/start.ts", "execute");
const autocompleteLogger = createLogger("commands/start.ts", "autocomplete");

export default {
  data: new SlashCommandBuilder()
    .setName("start")
    .setDescription("Startet den Server.")
    .addStringOption((option) => option.setName("server").setDescription("Der Server, der gestartet werden soll.").setRequired(true).setAutocomplete(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
  async execute(interaction) {
    try {
      const server = interaction.options.get("server")?.value as string;
      if (!servers.includes(server)) {
        executeLogger.info(`User ${interaction.user.username} tried to start server ${server}, but it doesn't exist.`);
        return await interaction.reply({
          content: "Dieser Server existiert nicht.",
          ephemeral: true,
        });
      }

      if (await isServerRunning(server)) {
        executeLogger.info(`User ${interaction.user.username} tried to start server ${server}, but it's already running.`);
        return await interaction.reply({
          content: "Der Server läuft bereits.",
          ephemeral: true,
        });
      }

      exec(`cd /home/${server}; sh start-silent.sh &`);

      executeLogger.info(`User ${interaction.user.username} started server ${server}.`);
      return await interaction.reply({
        content: "Der Server wird gestartet.",
        ephemeral: true,
      });
    } catch (error) {
      executeLogger.error(messageFromCatch(error));
    }
  },
  async autocomplete(interaction) {
    try {
      const focusedValue = interaction.options.getFocused();

      const filtered = servers
        .filter((server) => server.toLowerCase().includes(focusedValue.toLowerCase()))
        .sort((a, b) => a.toLowerCase().indexOf(focusedValue.toLowerCase()) - b.toLowerCase().indexOf(focusedValue.toLowerCase()));

      await interaction.respond(
        filtered.map((choice) => ({
          name: choice,
          value: choice,
        }))
      );
    } catch (error) {
      autocompleteLogger.error(messageFromCatch(error));
    }
  },
} satisfies Command;

const isServerRunning = (name: string) => {
  return new Promise((resolve) => {
    exec("screen -list", (error, stdout, stderr) => {
      if (error) {
        return resolve(false);
      }
      if (stderr) {
        return resolve(false);
      }
      return resolve(stdout.includes(name));
    });
  });
};
