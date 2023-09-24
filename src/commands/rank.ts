import { exec } from "child_process";
import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { players } from "../db/schema";
import { Command } from "../types/command";
import { createLogger, messageFromCatch } from "../log";

const ranks = ["player", "champion", "content"];

const executeLogger = createLogger("commands/rank.ts", "execute");
const autocompleteLogger = createLogger("commands/rank.ts", "autocomplete");

export default {
  data: new SlashCommandBuilder()
    .setName("rank")
    .setDescription("Vergebe einen Rang.")
    .addUserOption((option) => option.setName("user").setDescription("Der Spieler, dem du einen Rang geben möchtest.").setRequired(true))
    .addStringOption((option) => option.setName("rank").setDescription("Der Rang, den du vergeben möchtest.").setAutocomplete(true).setRequired(true))
    .addIntegerOption((option) => option.setName("duration").setDescription("Die Dauer, für die der Rang vergeben werden soll in Tagen."))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
  async autocomplete(interaction) {
    try {
      const focusedValue = interaction.options.getFocused();

      const filtered = ranks
        .filter((player) => player.toLowerCase().includes(focusedValue.toLowerCase()))
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
  async execute(interaction) {
    try {
      const user = interaction.options.getUser("user");
      if (!user) return;
      const rank = interaction.options.get("rank")?.value as string;
      if (!ranks.includes(rank)) {
        executeLogger.info(`User ${interaction.user.username} tried to set rank ${rank} for ${user.username}, but it doesn't exist.`);
        return await interaction.reply({
          content: "Dieser Rang existiert nicht.",
          ephemeral: true,
        });
      }

      const playerFromDb = await db.select().from(players).where(eq(players.discordId, user.id)).get();
      if (!playerFromDb) {
        executeLogger.info(`User ${interaction.user.username} tried to set rank ${rank} for ${user.username}, but they are not verified.`);
        return await interaction.reply({
          content: "Dieser Spieler ist nicht verifiziert.",
          ephemeral: true,
        });
      }

      const duration = interaction.options.get("duration")?.value as number;
      if (!duration) {
        executeMinecraftCommand(`interface rank set ${playerFromDb.minecraftUuid} ${rank}`);
        executeLogger.info(`User ${interaction.user.username} set rank ${rank} for ${user.username} for infinite days.`);
        return await interaction.reply({
          content: `Du hast den ${rank}-Rang für unendlich Tage vergeben.`,
          ephemeral: true,
        });
      }

      executeMinecraftCommand(`interface rank set ${playerFromDb.minecraftUuid} ${rank} ${duration}}`);
      executeLogger.info(`User ${interaction.user.username} set rank ${rank} for ${user.username} for ${duration} days.`);
      return await interaction.reply({
        content: `Du hast den ${rank}-Rang für ${duration} Tage vergeben.`,
        ephemeral: true,
      });
    } catch (error) {
      executeLogger.error(messageFromCatch(error));
    }
  },
} satisfies Command;

const executeMinecraftCommand = (minecraftCommand: string) => {
  executeLogger.info("Executing command: " + minecraftCommand);
  exec("screen -r minigame -X stuff '" + minecraftCommand + "'^M");
};
