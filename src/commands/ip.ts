import { SlashCommandBuilder } from "discord.js";
import { createLogger, messageFromCatch } from "../log";
import { Command } from "src/types/command";

const logger = createLogger("commands/ip.ts", "execute");

export default {
  data: new SlashCommandBuilder().setName("ip").setDescription("Erhalte die IP vom Minecraft Server."),
  async execute(interaction) {
    try {
      await interaction.reply({
        content: "Die IP lautet: commandmc.eu",
        ephemeral: true,
      });
      logger.info("Executed /ip command");
    } catch (error) {
      logger.error(messageFromCatch(error));
    }
  },
} satisfies Command;
