import { eq } from "drizzle-orm";
import express from "express";
import { db } from "../db";
import { players } from "../db/schema";
import { z } from "zod";

const app = express();
app.use(express.json());
const port = 8080;

const verifySchema = z.object({
  token: z.string(),
  discordId: z.string(),
  minecraftUuid: z.string(),
});

app.post("/api/verify", async (req, res) => {
  try {
    const { token, discordId, minecraftUuid } = verifySchema.parse(req.body);

    const playerFromDb = await db
      .select()
      .from(players)
      .where(eq(players.discordId, discordId))
      .get();

    if (!playerFromDb) {
      console.log(
        `[Verify]: The discord user ${discordId} tried to verify but is not in the database.`
      );
      return res.status(400).send("Invalid");
    }

    if (playerFromDb.verifyToken !== token) {
      console.log(
        `[Verify]: The discord user ${discordId} tried to verify but the token was invalid.`
      );
      return res.status(400).send("Invalid");
    }

    await db
      .update(players)
      .set({
        minecraftUuid,
      })
      .where(eq(players.discordId, discordId))
      .run();
    console.log(
      `[Verify]: The discord user ${discordId} has been verified with the minecraftUuid ${minecraftUuid}.`
    );

    res.send("Successfull verification");
  } catch (e) {
    console.log(e);
    res.status(500).send("Internal server error");
  }
});

app.listen(port, () => {
  console.log(`API app listening at http://localhost:${port}`);
});
