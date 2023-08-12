import {
  Client,
  Events,
  MessageReaction,
  PartialMessageReaction,
  PartialUser,
  User,
} from "discord.js";
import { BEDWARS_IDEAS_CHANNEL_ID } from "../constants";

export const registerListener = (client: Client) => {
  client.on(Events.MessageReactionAdd, handleInteractionWith(client));
};

const handleInteractionWith =
  (client: Client) =>
  async (
    reaction: MessageReaction | PartialMessageReaction,
    user: User | PartialUser
  ) => {
    if (user.bot) return;
    if (reaction.message.channelId !== BEDWARS_IDEAS_CHANNEL_ID) return;

    const member = await reaction.message.guild?.members.fetch(user.id);
    if (!member || !reaction.emoji.name) return;

    if (
      reaction.message.reactions.cache.some(
        (x) => x.emoji.name === "❌" && x.count > 1
      ) &&
      reaction.emoji.name === "❌"
    ) {
      reaction.message.reactions.cache
        .get(reaction.emoji.name)
        ?.users?.remove(user.id);
      return;
    }

    if (
      reaction.emoji.name === "❌" &&
      member.permissions.has("ManageMessages")
    ) {
      reaction.message.reactions.removeAll();
      reaction.message.react("❌");
    }

    if (reaction.emoji.name !== "🔼" && reaction.emoji.name !== "🔽") {
      reaction.message.reactions.cache
        .get(reaction.emoji.name)
        ?.users?.remove(user.id);
      return;
    }
  };
