import { sqliteTable, text, integer, unique } from "drizzle-orm/sqlite-core";

export const players = sqliteTable("players", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  discordId: text("discord_id").notNull().unique(),
  minecraftUuid: text("minecraft_uuid").unique(),
  verifyToken: text("verify_token").notNull().unique(),
});

export const championGiveaway = sqliteTable("giveaway", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  messageId: text("message_id").notNull().unique(),
  channelId: text("channel_id").notNull(),
  guildId: text("guild_id").notNull(),
  amount: integer("amount").notNull(),
  endTime: integer("end_time").notNull(),
  hasBeenDrawn: integer("status").notNull(),
});

export const championGiveawayEntries = sqliteTable(
  "giveaway_entries",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    giveawayId: integer("giveaway_id")
      .notNull()
      .references(() => championGiveaway.id),
    playerId: integer("player_id")
      .notNull()
      .references(() => players.id),
  },
  (t) => ({
    unq: unique().on(t.giveawayId, t.playerId),
  })
);
