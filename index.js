require('dotenv').config();

const Telegraf = require('telegraf');
const Extra = require('telegraf/extra');
const fs = require('fs');
const fetch = require('node-fetch');
const { randomElement } = require('./utils');
const GREETING_FILENAME = './greeting.txt';


const CATS_URL = 'https://api.thecatapi.com/v1/images/search';
const CATS_TIMEOUT = Number(process.env.CAT_TIMEOUT_SECONDS) || 30;
const QUESTION_TIMEOUT = Number(process.env.QUESTION_TIMEOUT_SECONDS) || 30;
const funnyAnswers = [
    "Лучше бы уроки учил",
    "Сходи в душ, вонючка 🌚",
    "Не исключено🤫",
    "Сто процентов",
    "Да",
    "Нет",
    "Нет нет нет неееет!🤬",
    "Да, да, да и еще раз - да😬",
    "Ну конечно!",
    "Сомневаюсь",
    "Ой ну хватит",
    "Сам отвечай на такие вопросы 😤 бака",
    "Нит 😑",
    "Хз \uD83E\uDD37\uD83C\uDFFC\u200D♂️"
];


let greeting = fs.readFileSync(GREETING_FILENAME, { encoding: 'utf-8' });
let catsTimeoutID = null;
let questionTimeoutID = null;

const bot = new Telegraf(process.env.BOT_TOKEN);

function extractUsername(user) {
    return `${user.first_name || ''} ${user.last_name || ''}`;
}

bot.on('new_chat_members', (ctx) => {
    const user = ctx.message.new_chat_member;

    const text = greeting.replace('{kroshka}', `[${extractUsername(user)}](tg://user?id=${user.id})`);

    ctx.replyWithMarkdown(text);
});

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
});

bot.hears(/question (.*)/giu, (ctx) => {
    if (questionTimeoutID) {
        return;
    }

    const [, question] = ctx.match;

    if (question.trim() === "") {
        return;
    }

    const answer = randomElement(funnyAnswers);

    ctx.replyWithMarkdown(`
Отвечаю 🖕 тебе:

- ${answer}`,  Extra.inReplyTo(ctx.message.message_id));

    questionTimeoutID = setTimeout(() => {
        clearTimeout(questionTimeoutID);
        questionTimeoutID = null
    }, QUESTION_TIMEOUT * 1000);
});

async function fetchCatImage() {
    const res = await fetch(CATS_URL);
    const data = await res.json();

    return data[0].url;
}

bot.command('question', async (ctx) => {
   console.log(ctx.chat);
});

bot.command('cat', async (ctx) => {
    if (catsTimeoutID) {
        return
    }

    const image = await fetchCatImage();

    ctx.replyWithPhoto(
        { url: image },
        Extra.inReplyTo(ctx.message.message_id)
    );

    catsTimeoutID = setTimeout(() => {
        clearTimeout(catsTimeoutID);
        catsTimeoutID = null
    }, CATS_TIMEOUT * 1000);
});

bot.catch((err) => {
    console.error(err)
});

bot.launch();

/*
          HACK
    * ------------- *
    hack for heroku to keep app alive
 */
const http = require('http');
http.createServer((req, res) => {
    res.write('Hello World!');
    res.end();
}).listen(process.env.PORT || 8084);
