import * as express from 'express'
import * as bodyParser from 'body-parser'
import * as Colorize from '../colorize'


const PORT = process.env.PORT || 4001;

export async function start () {

    express()
        .use(bodyParser.json())
        .get('/test', (req, res) => res.send('hello world  sss'))
        // .get('/upload', Colorize.start)


        .listen(PORT, () => console.log(`HTTP Server listenning on ${ PORT }`));


}
