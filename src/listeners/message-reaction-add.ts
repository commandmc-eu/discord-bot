import { Client, Events, MessageReaction, PartialMessageReaction, PartialUser, User } from "discord.js";
import { BEDWARS_IDEAS_CHANNEL_ID } from "../constants";
import { createLogger, messageFromCatch } from "../log";

const logger = createLogger("listeners/message-reaction-add.ts", "handleInteractionWith");

export const registerListener = (client: Client) => {
  client.on(Events.MessageReactionAdd, handleInteractionWith(client));
};

const handleInteractionWith = (client: Client) => async (reaction: MessageReaction | PartialMessageReaction, user: User | PartialUser) => {
  if (user.bot) return;
  if (reaction.message.channelId !== BEDWARS_IDEAS_CHANNEL_ID) return;

  try {
    const member = await reaction.message.guild?.members.fetch(user.id);
    if (!member || !reaction.emoji.name) return;

    if (reaction.message.reactions.cache.some((x) => x.emoji.name === "❌" && x.count > 1) && reaction.emoji.name === "❌") {
      logger.info(`Removed ❌-reaction from message in bedwars-ideas channel by ${user.username}`);
      reaction.message.reactions.cache.get(reaction.emoji.name)?.users?.remove(user.id);
      return;
    }

    if (reaction.emoji.name === "❌" && member.permissions.has("ManageMessages")) {
      logger.info(`${user.username} declined idea in bedwars-ideas channel`);
      reaction.message.reactions.removeAll();
      reaction.message.react("❌");
    }

    if (reaction.emoji.name !== "🔼" && reaction.emoji.name !== "🔽") {
      logger.info(`Removed ${reaction.emoji.name}-reaction from message in bedwars-ideas channel by ${user.username}`);
      reaction.message.reactions.cache.get(reaction.emoji.name)?.users?.remove(user.id);
      return;
    }
  } catch (error) {
    logger.error(messageFromCatch(error));
  }
};
