import { randomBytes } from "crypto";
import { SlashCommandBuilder } from "discord.js";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { players } from "../db/schema";
import { Command } from "../types/command";

export default {
  data: new SlashCommandBuilder()
    .setName("verify")
    .setDescription("Verbinde dein Minecraft Konto mit deinem Discord Konto."),
  async execute(interaction) {
    const user = interaction.user;
    const playerFromDb = await db
      .select()
      .from(players)
      .where(eq(players.discordId, user.id))
      .get();

    if (playerFromDb) {
      return await interaction.reply({
        content: `Du kannst dein Konto mit dem Befehl \`/verify ${user.id} ${playerFromDb.verifyToken}\` auf dem Minecraft Server verbinden.`,
        ephemeral: true,
      });
    }

    const token = randomBytes(16).toString("hex");

    await db
      .insert(players)
      .values({
        discordId: user.id,
        verifyToken: token,
      })
      .run();

    await interaction.reply({
      content: `Du kannst dein Konto mit dem Befehl \`/verify ${user.id} ${token}\` auf dem Minecraft Server verbinden.`,
      ephemeral: true,
    });
  },
} satisfies Command;
