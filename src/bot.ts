import { Client, GatewayIntentBits, Partials } from "discord.js";
import dotenv from "dotenv";
import { registerCommands } from "./helpers/register-commands";
import { registerListeners } from "./helpers/register-listeners";
import { createLogger } from "./log";
import { createApi } from "./api/express";

const logger = createLogger("bot.ts", "main");

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
logger.info("Logging in to discord");

registerCommands(client, "commands");
logger.info("Registered commands");

client.once("ready", () => {
  logger.info("The discord bot is ready!");
});

registerListeners(client, "listeners");
logger.info("Registered listeners");

createApi(client);
