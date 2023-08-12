import { exec } from "child_process";
import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { Command } from "src/types/command";

const servers = ["minigame", "spightwars"];

export default {
  data: new SlashCommandBuilder()
    .setName("start")
    .setDescription("Startet den Server.")
    .addStringOption((option) =>
      option
        .setName("server")
        .setDescription("Der Server, der gestartet werden soll.")
        .setRequired(true)
        .setAutocomplete(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction) {
    const server = interaction.options.get("server")?.value as string;
    if (!servers.includes(server)) {
      return await interaction.reply({
        content: "Dieser Rang existiert nicht.",
        ephemeral: true,
      });
    }

    if (await isServerRunning(server)) {
      return await interaction.reply({
        content: "Der Server läuft bereits.",
        ephemeral: true,
      });
    }

    exec(`cd /home/${server}; sh start.sh`);

    return await interaction.reply({
      content: "Der Server wird gestartet.",
      ephemeral: true,
    });
  },
  async autocomplete(interaction) {
    const focusedValue = interaction.options.getFocused();

    const filtered = servers
      .filter((server) =>
        server.toLowerCase().includes(focusedValue.toLowerCase())
      )
      .sort(
        (a, b) =>
          a.toLowerCase().indexOf(focusedValue.toLowerCase()) -
          b.toLowerCase().indexOf(focusedValue.toLowerCase())
      );

    await interaction.respond(
      filtered.map((choice) => ({
        name: choice,
        value: choice,
      }))
    );
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
