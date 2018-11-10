if(!process.env.MONGODB_URI) {
    require('dotenv').config()
}
import { MongoClient } from 'mongodb';


export default class DB {
    static mongo;

    static async init () {
        const client = await MongoClient.connect(process.env.MONGODB_URI, { useNewUrlParser: true } );
        const parts = process.env.MONGODB_URI.split('/')
        const dbName = parts[parts.length - 1]
        DB.mongo = client.db(dbName);
        console.log('MongoDB connected')
    }
}
