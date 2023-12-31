import {
  AutocompleteInteraction,
  CommandInteraction,
  InteractionResponse,
  SlashCommandBuilder,
} from "discord.js";

export type Command = {
  data:
    | SlashCommandBuilder
    | Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;
  execute: (
    interaction: CommandInteraction
  ) => Promise<InteractionResponse<boolean> | undefined | void>;
  autocomplete?: (interaction: AutocompleteInteraction) => Promise<void>;
};
