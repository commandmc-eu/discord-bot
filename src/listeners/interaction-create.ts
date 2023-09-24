import { AutocompleteInteraction, Client, CommandInteraction, Events, Interaction } from "discord.js";
import { createLogger, messageFromCatch } from "../log";

const commandLogger = createLogger("listeners/interaction-create.ts", "handleCommandInteraction");

export const registerListener = (client: Client) => {
  client.on(Events.InteractionCreate, handleInteractionWith(client));
};

const handleInteractionWith = (client: Client) => async (interaction: Interaction) => {
  if (interaction.isCommand()) {
    return await handleCommandInteraction(client, interaction);
  }
  if (interaction.isAutocomplete()) {
    return await handleAutocompleteInteraction(client, interaction);
  }
};

const handleCommandInteraction = async (client: Client, interaction: CommandInteraction) => {
  const command = client.commands.get(interaction.commandName);
  if (!command || !interaction.isChatInputCommand()) {
    commandLogger.error(`Command ${interaction.commandName} not found`);
    return;
  }

  try {
    await command.execute(interaction);
    commandLogger.info(`Executed command ${interaction.commandName}`);
  } catch (error) {
    commandLogger.error(messageFromCatch(error));
    try {
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: "There was an error while executing this command!",
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          content: "There was an error while executing this command!",
          ephemeral: true,
        });
      }
    } catch (error) {
      commandLogger.error(messageFromCatch(error));
    }
  }
};

const autocompleteLogger = createLogger("listeners/interaction-create.ts", "handleAutocompleteInteraction");

const handleAutocompleteInteraction = async (client: Client, interaction: AutocompleteInteraction) => {
  const command = client.commands.get(interaction.commandName);
  if (!command) {
    autocompleteLogger.error(`Command ${interaction.commandName} not found`);
    return;
  }

  try {
    await command.autocomplete(interaction);
  } catch (err) {
    autocompleteLogger.error(messageFromCatch(err));
  }
};
