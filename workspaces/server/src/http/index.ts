import * as express from 'express'
import * as bodyParser from 'body-parser'


const PORT = process.env.PORT || 4001;

export async function start () {

    express()
        .use(bodyParser.json())
        .get('/test', (req, res) => res.send('hello world  sss'))


        .listen(PORT, () => console.log(`HTTP Server listenning on ${ PORT }`));


}
