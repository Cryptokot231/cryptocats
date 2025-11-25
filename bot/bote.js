const TelegramBot = require("node-telegram-bot-api");
require("dotenv").config({ path: "../.env" });

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

// Команда /start
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;

    bot.sendMessage(chatId, "Добро пожаловать в CryptoCats!", {
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: "Играть 🎮",
                        url: process.env.WEBAPP_URL
                    }
                ]
            ]
        }
    });
});

console.log("Bot is running...");
