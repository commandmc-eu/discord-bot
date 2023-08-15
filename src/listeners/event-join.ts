import { Client, Events, GuildScheduledEvent, User } from "discord.js";
import { VALORANT_EVENT_ID, VALORANT_ROLE_ID } from "../constants";

export const registerListener = (client: Client) => {
  client.on(Events.GuildScheduledEventUserAdd, handleInteractionWith(client));
};

const handleInteractionWith =
  (client: Client) => async (event: GuildScheduledEvent, user: User) => {
    if (event.id !== VALORANT_EVENT_ID) return;
    try {
      console.log(`Adding ${user.username} to ${event.guild?.name}`);
      await event.guild?.members.cache
        .get(user.id)
        ?.roles.add(VALORANT_ROLE_ID);
    } catch (error) {
      console.error(error);
    }
  };
