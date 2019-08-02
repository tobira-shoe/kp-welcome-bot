const Telegraf = require('telegraf');
const Extra = require('telegraf/extra');
require('dotenv').config();

const bot = new Telegraf(process.env.BOT_TOKEN);

const fs = require('fs');

let greeting = fs.readFileSync('./greeting.txt', { encoding: 'utf-8' });

bot.on('new_chat_members', (ctx) => {
    const userName = `${ctx.update.message.new_chat_member.first_name || ''} ${ctx.update.message.new_chat_member.last_name || ''}`;
    const text = greeting.replace('{kroshka}', `[${userName}](tg://user?id=${ctx.update.message.new_chat_member.id})`);
    ctx.replyWithMarkdown(text);
})

bot.hears(/^\/change_text (\S+) ([\s\S]*)$/gm, (ctx) => {
    const [, password, newText] = ctx.match;
    if (password === (process.env.PASS || 'apirol')) {
        try {
            fs.writeFileSync('./greeting.txt', newText, { encoding: 'utf-8'});
            greeting = newText;
            ctx.replyWithMarkdown('Текст изменен на \n~~~~~~~~~~~~~~~~~~~~~~~~~\n' + greeting);
        } catch (err) {
            console.error(err);
        }
    }
})

bot.command('cat', (ctx) => {
    var request = require('request');
    request('https://api.thecatapi.com/v1/images/search', (error, response, body) => {
    if (response.statusCode != 200) {
        console.error(error);
    } else {
        let imageUrl = JSON.parse(body)[0]['url']
        ctx.replyWithPhoto({url: imageUrl}, Extra.inReplyTo(ctx.message.message_id))
    }
});
})

bot.catch((err) => {
    console.error(err)
})

bot.launch()    



// hack
const http = require('http');
http.createServer((req, res) => {
    res.write('Hello World!');
    res.end();
}).listen(process.env.PORT || 8084);