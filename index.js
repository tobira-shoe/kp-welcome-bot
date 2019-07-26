const TelegramBot = require('node-telegram-bot-api');

let WELCOME_MESSAGE = 'Привет {kroshka}! Прочитай гайды в закрепе. Это чат потока. Тут около 15+ 2-3 курсников и люди с твоего потока.  Мы тут только что ты помогать и травить байки)';

const bot = new TelegramBot(process.env.BOT_TOKEN, {
    polling: true,
    timeout: 500
});

bot.on('message', msg =>{
    if (msg.new_chat_members !== undefined) {
        console.log(msg.new_chat_member.username);
        console.log(msg.new_chat_member.id);

        const text = WELCOME_MESSAGE.replace('{kroshka}', `@${msg.new_chat_member.username}`);

        bot.sendMessage(msg.chat.id, text);
    }
});

bot.onText(/\/change_text (.+) (.+)/, function (msg, match) {
    const [, password, newText] = match;

    if (password === (process.env.PASS || 'legezza_')) {
        // WELCOME_MESSAGE = newText;

        bot.sendMessage(msg.chat.id, "Текст изменем");
    }
});

bot.on('polling_error', console.error);
