import { eq } from "drizzle-orm";
import express from "express";
import { db } from "../db";
import { players } from "../db/schema";
import { z } from "zod";
import { createLogger, messageFromCatch } from "../log";
import { Client } from "discord.js";
import { COMMANDMC_GUILD_ID } from "../constants";

const rankMapping = {
  player: { id: "612994990892646410", doRemove: false },
  champion: { id: "1155143712830148618", doRemove: true },
  content: { id: "753706545534992555", doRemove: true },
};

const logger = createLogger("api/express.ts", "createApi");
export const createApi = (bot: Client) => {
  const app = express();
  app.use(express.json());
  const port = 8080;

  const verifySchema = z.object({
    token: z.string(),
    discordId: z.string(),
    minecraftUuid: z.string(),
  });

  const verifyLogger = createLogger("api/express.ts", "api/verify");

  app.post("/api/verify", async (req, res) => {
    try {
      const { token, discordId, minecraftUuid } = verifySchema.parse(req.body);

      const playerFromDb = await db.select().from(players).where(eq(players.discordId, discordId)).get();

      if (!playerFromDb) {
        verifyLogger.info(`The discord user ${discordId} tried to verify but is not in the database.`);
        return res.status(400).send("Invalid");
      }

      if (playerFromDb.verifyToken !== token) {
        verifyLogger.info(`The discord user ${discordId} tried to verify but the token was invalid.`);
        return res.status(400).send("Invalid");
      }

      await db
        .update(players)
        .set({
          minecraftUuid,
        })
        .where(eq(players.discordId, discordId))
        .run();
      verifyLogger.info(` The discord user ${discordId} has been verified with the minecraftUuid ${minecraftUuid}.`);

      res.send("Successfull verification");
    } catch (e) {
      verifyLogger.error(messageFromCatch(e));
      res.status(500).send("Internal server error");
    }
  });

  const rankSchema = z.object({
    minecraftUuid: z.string(),
    rank: z.enum(["player", "champion", "content"]),
  });

  const rankLogger = createLogger("api/express.ts", "api/rank");

  const getRankIdByKey = (key: z.infer<typeof rankSchema>["rank"]) => {
    return rankMapping[key].id;
  };

  const getNameFromRankId = (id: string) => {
    return Object.entries(rankMapping).find(([key, rank]) => rank.id === id)?.[0];
  };

  app.post("/api/rank", async (req, res) => {
    try {
      const { minecraftUuid, rank } = rankSchema.parse(req.body);

      const playerFromDb = await db.select().from(players).where(eq(players.minecraftUuid, minecraftUuid)).get();

      if (!playerFromDb) {
        rankLogger.info(`The minecraft user ${minecraftUuid} tried to set rank ${rank} but is not in the database.`);
        return res.status(404).send("Not found");
      }

      const guild = await bot.guilds.fetch(COMMANDMC_GUILD_ID);
      const member = await guild.members.fetch(playerFromDb.discordId);
      const role = await guild.roles.fetch(getRankIdByKey(rank));
      if (!role) {
        rankLogger.info(`The minecraft user ${minecraftUuid} tried to set rank ${rank} but the role was not found.`);
        return res.status(404).send("Not found");
      }

      const ranksToRemove = Object.values(rankMapping);
      for (let i = 0; i < ranksToRemove.length; i++) {
        const rank = ranksToRemove[i];
        if (rank.doRemove && role.id !== rank.id) {
          if (member.roles.cache.has(rank.id)) {
            rankLogger.info(`Removed rank ${getNameFromRankId(rank.id)} from ${member.user.tag} because they were given ${getNameFromRankId(role.id)}.`);
            await member.roles.remove(rank.id);
          }
        }
      }

      await member.roles
        .add(role)
        .then((e) => {
          rankLogger.info(`Added rank ${getNameFromRankId(role.id)} to ${member.user.tag}.`);
          res.status(200).send("Successfull rank update");
        })
        .catch((e) => {
          rankLogger.error(messageFromCatch(e));
          return res.status(500).send("Internal server error");
        });
    } catch (e) {
      rankLogger.error(messageFromCatch(e));
      res.status(500).send("Internal server error");
    }
  });

  app.listen(port, () => {
    logger.info(`API app listening at http://localhost:${port}`);
  });
};
