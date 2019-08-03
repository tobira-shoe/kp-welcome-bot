const Telegraf = require('telegraf');
const Extra = require('telegraf/extra');
require('dotenv').config();

const bot = new Telegraf(process.env.BOT_TOKEN);

const fs = require('fs');
let greeting = fs.readFileSync('./greeting.txt', { encoding: 'utf-8' });

let catTimeOutSeconds = Number(process.env.CAT_TIMEOUT_SECONDS) || 50
let isCatAllowed = true
let lastCatTime = new Date(Date.now())


bot.on('new_chat_members', (ctx) => {
    const userName = `${ctx.update.message.new_chat_member.first_name || ''} ${ctx.update.message.new_chat_member.last_name || ''}`;
    const text = greeting.replace('{kroshka}', `[${userName}](tg://user?id=${ctx.update.message.new_chat_member.id})`);
    ctx.replyWithMarkdown(text);
})

bot.hears(/^\/set_text (\S+) ([\s\S]*)$/gm, (ctx) => {
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

bot.hears(/^\/set_timeout (\S+) (\d+)$/gm, (ctx) => {
    let [, password, newSeconds] = ctx.match;
    newSeconds = Number(newSeconds)
    console.log(ctx.match)
    if (password === (process.env.PASS || 'apirol')) {
        try {
            let newTimeText = getTextForLeftTime(getDayHourMinSecFromSeconds(newSeconds))
            ctx.replyWithMarkdown(`Время изменено на ${newTimeText}`);
            catTimeOutSeconds = newSeconds;
            isCatAllowed = true;
        } catch (err) {
            console.error(err);
        }
    }
})

function getDayHourMinSecFromSeconds(_seconds) {
    let [days, hours, minutes, seconds] = [0, 0, 0, _seconds]
    if (seconds > 60) {
        minutes = Math.floor(seconds / 60)
        seconds %= 60
    }
    if (minutes > 60) {
        hours = Math.floor(minutes / 60)
        minutes %= 60
    }
    if (hours > 24) {
        days = Math.floor(hours / 60)
        hours %= 24
    }
    return {
        days: days, 
        hours: hours, 
        minutes: minutes, 
        seconds: seconds
    }
}

/*
    Да, да - хардкод еще тот
*/
function getTextForLeftTime(obj) {
    let text = '';
    // @todo сделать какие то красивые функции для вывода время, но всем похуй
    // и никто все равно не будет почти этим пользоватся
    text += obj.days    == 0 ? '' : obj.days + (obj.days < 5 ? ' дня ' : ' дней ');
    text += obj.hours   == 0 ? '' : obj.hours + ' часа(ов) ';
    text += obj.minutes == 0 ? '' : obj.minutes + ' минут '
    text += obj.seconds + ' секунд(ы) '
    return text;
}


bot.command('cat', (ctx) => {
    if (!isCatAllowed) {
        // можно как то переделать, команду какую то сделать и тд
        let secondsLeft = lastCatTime.getUTCSeconds() - new Date(Date.now()).getUTCSeconds() + catTimeOutSeconds;
        let timeLeftText = getTextForLeftTime(getDayHourMinSecFromSeconds(secondsLeft))
        let waitingTimeText = getTextForLeftTime(getDayHourMinSecFromSeconds(catTimeOutSeconds));
        let text = `Подождите ${waitingTimeText} с момента прошлой команды. \nОсталось ${timeLeftText}`;
        ctx.reply(text, Extra.inReplyTo(ctx.message.message_id));
        return
    }
    let request = require('request');
    request('https://api.thecatapi.com/v1/images/search', (error, response, body) => {
    if (response.statusCode != 200) {
        console.error(error);
    } else {
        let imageUrl = JSON.parse(body)[0]['url'];
        ctx.replyWithPhoto({url: imageUrl}, Extra.inReplyTo(ctx.message.message_id));
        isCatAllowed = false;
        lastCatTime = new Date(Date.now());
        setTimeout(() => isCatAllowed = true, catTimeOutSeconds * 1000);
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