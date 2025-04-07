const mineflayer = require("mineflayer");
const express = require("express");
const app = express();

const SERVER_HOST = "Rohhh01.aternos.me";
const SERVER_PORT = 32006;
const VERSION = "1.21.5";

const bots = {
  Rohit3695: null,
  Manoj345690: null,
};

function createBot(username) {
  const bot = mineflayer.createBot({
    host: SERVER_HOST,
    port: SERVER_PORT,
    username,
    version: VERSION,
  });

  bots[username] = bot;

  bot.on("spawn", () => {
    console.log(`✅ ${username} joined the server`);

    // Movement loop
    const moveInterval = setInterval(() => {
      const directions = ["forward", "back", "left", "right"];
      const direction = directions[Math.floor(Math.random() * directions.length)];

      bot.setControlState(direction, true);
      bot.setControlState("jump", true);

      setTimeout(() => {
        bot.setControlState(direction, false);
        bot.setControlState("jump", false);
      }, 1500);
    }, 10000);

    bot._moveInterval = moveInterval;
  });

  bot.on("end", () => {
    console.log(`❌ ${username} disconnected`);
    clearInterval(bot._moveInterval);
    bots[username] = null;
  });

  bot.on("error", (err) => {
    console.log(`⚠️ ${username} error:`, err.message);
  });
}

function removeBot(username) {
  const bot = bots[username];
  if (bot) {
    console.log(`🚪 Kicking ${username} from the server`);
    bot.quit();
    bots[username] = null;
  }
}

function checkPlayerCount() {
  const checkBot = mineflayer.createBot({
    host: SERVER_HOST,
    port: SERVER_PORT,
    username: "CheckerBot" + Math.floor(Math.random() * 1000),
    version: VERSION,
  });

  checkBot.once("spawn", () => {
    const playerCount = Object.keys(checkBot.players).length;
    console.log(`👥 Players online: ${playerCount}`);

    if (playerCount <= 1) {
      if (!bots.Rohit3695) createBot("Rohit3695");
      if (!bots.Manoj345690) createBot("Manoj345690");
    } else {
      removeBot("Rohit3695");
      removeBot("Manoj345690");
    }

    setTimeout(() => checkBot.quit(), 3000); // Disconnect checker bot
  });

  checkBot.on("error", (err) => {
    console.log("⚠️ Checker bot error:", err.message);
  });
}

// Repeat player check every 30 seconds
setInterval(checkPlayerCount, 30000);

// Initial check
checkPlayerCount();

// Keep-alive server
app.get("/", (req, res) => res.send("🤖 Smart bot manager running"));
app.listen(3000, () => console.log("✅ Keep-alive web server running"));
