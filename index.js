const mineflayer = require("mineflayer");
const { pathfinder, Movements, goals } = require("mineflayer-pathfinder");
const { GoalNear } = goals;
const mineflayerTool = require("mineflayer-tool").plugin;
const express = require("express");
const app = express();

function startBot(username, movementInterval) {
  const bot = mineflayer.createBot({
    host: "Rohhh01.aternos.me",
    port: 32006,
    username,
    version: "1.21.4",
  });

  bot.loadPlugin(pathfinder);
  bot.loadPlugin(mineflayerTool);

  bot.on("spawn", () => {
    console.log(`✅ ${username} joined the server`);

    const mcData = require("minecraft-data")(bot.version);
    const defaultMove = new Movements(bot, mcData);
    bot.pathfinder.setMovements(defaultMove);

    setInterval(async () => {
      const targetBlock = bot.findBlock({
        matching: block => block.name.includes("log") || block.name.includes("stone"),
        maxDistance: 16,
      });

      if (targetBlock) {
        console.log(`${username} found a target block: ${targetBlock.name}`);
        await bot.pathfinder.goto(new GoalNear(targetBlock.position.x, targetBlock.position.y, targetBlock.position.z, 1));
        try {
          await bot.tool.equipForBlock(targetBlock);
          await bot.dig(targetBlock);
        } catch (err) {
          console.log(`${username} failed to dig:`, err.message);
        }
      } else {
        // Wander randomly
        const dx = Math.floor(Math.random() * 10) - 5;
        const dz = Math.floor(Math.random() * 10) - 5;
        const goal = new GoalNear(bot.entity.position.x + dx, bot.entity.position.y, bot.entity.position.z + dz, 1);
        bot.pathfinder.setGoal(goal);
      }

      // Building example: place a dirt block under if holding one
      const dirt = bot.inventory.items().find(item => item.name.includes("dirt"));
      const below = bot.blockAt(bot.entity.position.offset(0, -1, 0));
      if (dirt && below && below.name === "air") {
        try {
          await bot.equip(dirt, "hand");
          await bot.placeBlock(bot.blockAt(bot.entity.position.offset(0, -2, 0)), vec3(0, 1, 0));
          console.log(`${username} placed a dirt block`);
        } catch (err) {
          // ignore if it fails
        }
      }
    }, movementInterval);
  });

  bot.on("end", () => {
    console.log(`❌ ${username} disconnected. Reconnecting...`);
    setTimeout(() => startBot(username, movementInterval), 5000);
  });

  bot.on("error", err => {
    console.log(`⚠️ ${username} error:`, err.message);
  });
}

// Start 2 bots
startBot("Rohit3695", 10000);
startBot("Manoj345690", 13000);

// Express keep-alive
app.get("/", (req, res) => res.send("🤖 Bots with mining, building, and chopping are online!"));
app.listen(3000, () => console.log("✅ Keep-alive web server running"));

// Required for placeBlock
const vec3 = require("vec3");
