const mineflayer = require("mineflayer");
const { pathfinder, Movements, goals } = require("mineflayer-pathfinder");
const { GoalNear } = goals;
const express = require("express");
const app = express();
const vec3 = require("vec3");

// Aternos Server Config
const HOST = "Rohhh01.aternos.me";
const PORT = 32006;
const VERSION = "1.21.5";

// Store bots
let bots = {};

function startBot(name) {
  const bot = mineflayer.createBot({
    host: HOST,
    port: PORT,
    username: name,
    version: VERSION,
  });

  bot.loadPlugin(pathfinder);

  bot.once("spawn", () => {
    console.log(`✅ ${name} joined the server`);

    const mcData = require("minecraft-data")(bot.version);
    const defaultMove = new Movements(bot, mcData);
    bot.pathfinder.setMovements(defaultMove);

    // Wander movement
    setInterval(() => {
      const dx = Math.floor(Math.random() * 10) - 5;
      const dz = Math.floor(Math.random() * 10) - 5;
      const goal = new GoalNear(
        bot.entity.position.x + dx,
        bot.entity.position.y,
        bot.entity.position.z + dz,
        1
      );
      bot.pathfinder.setGoal(goal);
    }, 15000);
  });

  // Handle player join/leave
  bot.on("playerJoined", () => checkPlayers(bot));
  bot.on("playerLeft", () => checkPlayers(bot));

  bot.on("end", () => {
    console.log(`❌ ${name} disconnected.`);
    bots[name] = null;
  });

  bot.on("error", (err) => {
    console.log(`⚠️ ${name} error:`, err.message);
  });

  bots[name] = bot;
}

// Checks if both bots are needed
function checkPlayers(bot) {
  const online = Object.values(bot.players)
    .filter((p) => p && p.username && !["Ravikumar257", "DDsCraft001"].includes(p.username));

  if (online.length >= 1) {
    if (bots["DDsCraft001"]) {
      console.log("Real player joined, disconnecting second bot...");
      bots["DDsCraft001"].quit();
      bots["DDsCraft001"] = null;
    }
  } else {
    if (!bots["DDsCraft001"]) {
      console.log("No real players online, reconnecting second bot...");
      startBot("DDsCraft001");
    }
  }
}

// Start main bot
startBot("Ravikumar257");

// Web server for uptime
app.get("/", (req, res) => res.send("Bots active!"));
app.listen(3000, () => console.log("✅ Keep-alive web server running"));
