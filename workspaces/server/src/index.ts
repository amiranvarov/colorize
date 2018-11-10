import * as dotenv from 'dotenv'
import * as Server from './http'
import * as Bot from './bot'
import DB from './db'

(async () => {
    await dotenv.config();
    await DB.init()
    await Server.start();
    await Bot.init();
})();






