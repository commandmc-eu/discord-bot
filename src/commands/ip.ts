import { SlashCommandBuilder } from "discord.js";
import { Command } from "src/types/command";

export default {
  data: new SlashCommandBuilder()
    .setName("ip")
    .setDescription("Erhalte die IP vom Minecraft Server."),
  async execute(interaction) {
    return await interaction.reply({
      content: "Die IP lautet: commandmc.eu",
      ephemeral: true,
    });
  },
} satisfies Command;
