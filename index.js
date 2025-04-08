const mineflayer = require("mineflayer");
const express = require("express");
const app = express();

let rohitBot = null;
let manojBot = null;

function createBot(username, movementInterval) {
  const bot = mineflayer.createBot({
    host: "Rohhh01.aternos.me",
    port: 32006,
    username,
    version: "1.21.5",
  });

  bot.on("spawn", () => {
    console.log(`✅ ${username} joined the server`);

    // Movement loop
    setInterval(() => {
      const directions = ["forward", "back", "left", "right"];
      const dir = directions[Math.floor(Math.random() * directions.length)];
      bot.setControlState(dir, true);
      bot.setControlState("jump", true);
      setTimeout(() => {
        bot.setControlState(dir, false);
        bot.setControlState("jump", false);
      }, 1500);
    }, movementInterval);

    // Monitor players
    setInterval(() => {
      const onlinePlayers = Object.keys(bot.players).filter(p => !p.toLowerCase().includes("bot"));
      const realPlayers = onlinePlayers.filter(p => p !== "" && !["rohit3695", "manoj345690"].includes(p.toLowerCase()));

      if (realPlayers.length === 0) {
        // No real players: ensure both bots online
        if (!manojBot) {
          console.log("👥 No players online, starting Manoj345690");
          manojBot = createBot("Manoj345690", 12000);
        }
      } else {
        // Real players present: keep only one bot
        if (manojBot) {
          console.log("👥 Real player(s) detected. Disconnecting Manoj345690");
          manojBot.quit();
          manojBot = null;
        }
      }
    }, 10000); // check every 10 sec
  });

  bot.on("end", () => {
    console.log(`❌ ${username} disconnected. Reconnecting...`);
    if (username === "Rohit3695") {
      setTimeout(() => {
        rohitBot = createBot("Rohit3695", movementInterval);
      }, 5000);
    } else if (username === "Manoj345690") {
      manojBot = null;
    }
  });

  bot.on("error", err => {
    console.log(`⚠️ ${username} error:`, err.message);
  });

  return bot;
}

// Start Rohit bot on startup
rohitBot = createBot("Rohit3695", 10000);

// Keep-alive web server
app.get("/", (req, res) => res.send("🤖 Bot manager running"));
app.listen(3000, () => console.log("✅ Keep-alive web server running"));
