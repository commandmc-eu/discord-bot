import { Client, GatewayIntentBits, Partials } from "discord.js";
import dotenv from "dotenv";
import { registerCommands } from "./helpers/register-commands";
import { registerListeners } from "./helpers/register-listeners";

dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildScheduledEvents,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.DirectMessages,
  ],
  partials: [Partials.Channel],
});

client.login(process.env.DISCORD_TOKEN);

registerCommands(client, "commands");

client.once("ready", () => {
  console.log("The discord bot is ready!");
});

registerListeners(client, "listeners");

import("./api/express");
