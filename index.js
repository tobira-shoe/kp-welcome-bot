let WELCOME_MESSAGE = '';

const TelegramBot = require('node-telegram-bot-api');

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true, timeout: 500 });

bot.on('message', (message) =>{
    if (message.new_chat_members !== undefined) {
        console.log(message.new_chat_member.username);
        console.log(message.new_chat_member.id);

        bot.sendMessage(message.chat.id, WELCOME_MESSAGE);
    }
});

bot.onText(/\/change_text (.+)/, function onEchoText(msg, match) {
    let cmd = match[1].split(' ');

    if (cmd[0] === (process.env.PASS || 'legezza_')) {
        WELCOME_MESSAGE = cmd.slice(1).join(' ');
        bot.sendMessage(msg.chat.id, "Текст изменем");
    }
});

bot.on('polling_error', console.error);
