const Telegraf = require('telegraf')
const Stage = require('telegraf/stage')
const Scene = require('telegraf/scenes/base')
const { TelegrafMongoSession } = require('telegraf-session-mongodb');
import * as Colorizer from '../colorize'

import User from '../models/user'
import DB from '../db'

let session;
const {leave} = Stage


// Greeter scene
const greeter = new Scene('greeter');
greeter.enter((ctx) => {
    ctx.reply(
    'Привет! Я бот Colorize, был создан что бы помочь ' +
    'задать цвет вашим старым чёрно-белым фотографиям и добавить им немного жизни');
    ctx.scene.enter('colorize');
});

const colorizeScene = new Scene('colorize');
colorizeScene.enter((ctx) => ctx.reply('Отправьте мне фотографию который хотите добавить цвет, я постараюсь дать им цвет'));
colorizeScene.on('message', async (ctx) => {

    // if(ctx.message.text === '/start') {
    //     return ctx.session.processing = false;
    // }

    // if(await User.isProcessing(ctx.from.id)) {
    //     ctx.reply('Подождите пока завершится предыдущий запрос');
    //     return
    // }

    // await User.setProcessing(ctx.from.id)

    if(ctx.message.photo) {
        ctx.reply('Выполняю, подождите пару минут...')
        const lastImage = ctx.message.photo.pop();
        console.log('before getFileLink', lastImage.file_id);
        const fileLink = await ctx.telegram.getFileLink(lastImage.file_id);
        console.log('fileLink', fileLink);
        const data = await Colorizer.start(fileLink);
        console.log('LINK!!!', data);
        ctx.replyWithPhoto(data)
        // await User.setFree(ctx.from.id)
    }
});



// Create scene manager
const stage = new Stage();

// Scene registration
stage.register(greeter);
stage.register(colorizeScene);

export const bot = new Telegraf(process.env.BOT_TOKEN);

bot.use((...args) => session.middleware(...args));
// bot.use(session());
bot.use(stage.middleware());
bot.command('start', async (ctx) => {
    ctx.session.processing = false;
    const {
        last_name,
        first_name,
        username,
    } = ctx.from;
    const userExists = await User.exists({telegram_id: ctx.from.id});
    if(!userExists) {
        await User.create({
            telegram_id: ctx.from.id,
            name: `${first_name} ${last_name}`,
            username,
            created_at: new Date()
        });
        ctx.scene.enter('greeter');
        // setTimeout(() => {ctx.scene.leave('greeter');}, 1000)
    } else {
        ctx.scene.enter('colorize');
    }
});

export const init = () => {
    session = new TelegrafMongoSession(DB.mongo, {
        collectionName: 'sessions',
        sessionName: 'session'
    });
    bot.startPolling();
};

