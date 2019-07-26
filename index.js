const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');

let greeting = fs.readFileSync('./greeting.txt', { encoding: 'utf-8' });

const bot = new TelegramBot(process.env.BOT_TOKEN, {
    polling: true,
    timeout: 500
});

bot.on('message', msg =>{
    if (msg.new_chat_members) {
        const { username, id } = msg.new_chat_member;

        console.log(`message received from @${username} ${id}`);

        const text = greeting.replace('{kroshka}', `@${username}`);

        bot.sendMessage(msg.chat.id, text);
    }
});

bot.onText(/\/change_text (\S+) (.+)/, (msg, match) => {
    const [, password, newText] = match;

    if (password === (process.env.PASS || 'apirol')) {
        try {
            fs.writeFileSync('./greeting.txt', newText, { encoding: 'utf-8'});

            greeting = newText;

            bot.sendMessage(msg.chat.id, `Текст изменен на: *${newText}*`);
        } catch (err) {
            console.error(err)
        }
    }
});

bot.on('polling_error', console.error);

// hack
const http = require('http');
http.createServer((req, res) => {
    res.write('Hello World!');
    res.end();
}).listen(process.env.PORT || 8084);
