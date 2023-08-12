import { Command } from "./command";

declare module "discord.js" {
  export interface Client {
    commands: Collection<unknown, Command>;
  }
}

export {};
