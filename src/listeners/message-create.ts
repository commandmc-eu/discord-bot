import { Client, Events, Message } from "discord.js";
import { BEDWARS_IDEAS_CHANNEL_ID } from "../constants";
import { createLogger, messageFromCatch } from "../log";

const logger = createLogger("listeners/message-create.ts", "handleInteractionWith");

export const registerListener = (client: Client) => {
  client.on(Events.MessageCreate, handleInteractionWith(client));
};

const handleInteractionWith = (client: Client) => async (message: Message) => {
  if (message.author.bot) return;

  if (message.channelId === BEDWARS_IDEAS_CHANNEL_ID) {
    try {
      await message.react("🔼");
      await message.react("🔽");
      logger.info("Added reactions to message in bedwars-ideas channel");
    } catch (error) {
      logger.error(messageFromCatch(error));
    }
    return;
  }
};
