const mineflayer = require("mineflayer");
const express = require("express");
const app = express();
const vec3 = require("vec3");

function startBot(username, movementInterval) {
  const bot = mineflayer.createBot({
    host: "Rohhh01.aternos.me",
    port: 32006,
    username,
    version: "1.21.4",
  });

  bot.on("spawn", () => {
    console.log(`✅ ${username} joined the server`);

    // Start random movement loop
    setInterval(() => {
      const directions = ["forward", "back", "left", "right"];
      const direction = directions[Math.floor(Math.random() * directions.length)];

      bot.setControlState(direction, true);
      bot.setControlState("jump", true);

      setTimeout(() => {
        bot.setControlState(direction, false);
        bot.setControlState("jump", false);
      }, 1500);
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

// Start two roaming bots
startBot("Rohit3695", 10000);     // Moves every 10 sec
startBot("Manoj345690", 12000);   // Moves every 12 sec

// Express server to keep instance alive
app.get("/", (req, res) => res.send("🤖 Roaming bots are online!"));
app.listen(3000, () => console.log("✅ Keep-alive web server running"));
