import DB from '../db'

const COLLECTION_NAME = 'logs';


export default class Log {

    static async create (doc) {
        await DB.mongo.collection(COLLECTION_NAME).insertOne(doc);
    }
}



