const TelegramBot = require("node-telegram-bot-api");
require("dotenv").config({ path: "../.env" });

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

bot.on("message", (msg) => {
    const chatId = msg.chat.id;

    bot.sendMessage(chatId, "Добро пожаловать в CryptoCats!", {
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: "Играть 🎮",
                        web_app: { url: process.env.WEBAPP_URL } 
                    }
                ]
            ]
        }
    });
});
