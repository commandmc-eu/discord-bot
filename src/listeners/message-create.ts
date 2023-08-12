import { Client, Events, Message } from "discord.js";
import { BEDWARS_IDEAS_CHANNEL_ID } from "../constants";

export const registerListener = (client: Client) => {
  client.on(Events.MessageCreate, handleInteractionWith(client));
};

const handleInteractionWith = (client: Client) => async (message: Message) => {
  if (message.author.bot) return;

  if (message.channelId === BEDWARS_IDEAS_CHANNEL_ID) {
    await message.react("🔼");
    await message.react("🔽");
    return;
  }
};
