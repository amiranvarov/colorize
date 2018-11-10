import DB from '../db'
import {ObjectID} from "bson";

const COLLECTION_NAME = 'users';


export default class User {

    static async exists (filter: any) {
        const count = await DB.mongo.collection(COLLECTION_NAME).countDocuments(filter);
        return count > 0
    }

    static async getOne(filter = {}) {
        return await DB.mongo.collection(COLLECTION_NAME).findOne(filter);
    }

    static async create(user) {
        return await DB.mongo.collection(COLLECTION_NAME).insertOne(user);
    }

    static async getAll (filter = {}) {
        return await DB.mongo.collection(COLLECTION_NAME).find(filter).sort({create_time: -1}).toArray();
    }

    static async replace (documentId, update) {
        if (!documentId) {
            throw "update filter must be passed"
        }
        await DB.mongo.collection(COLLECTION_NAME).replaceOne({_id: new ObjectID(documentId)}, update);

        return await DB.mongo.collection(COLLECTION_NAME).findOne({_id: new ObjectID(documentId)});
    }

    static async setProcessing (telegramId) {
        await DB.mongo.collection(COLLECTION_NAME).updateOne({telegram_id: telegramId}, {$set: { processing: true }});

    }

    static async setFree (telegramId) {
        await DB.mongo.collection(COLLECTION_NAME).updateOne({telegram_id: telegramId}, {$set: { processing: false }});

    }

    static async isProcessing (telegramId) {
        const {processing} = await DB.mongo.collection(COLLECTION_NAME).findOne({telegram_id: telegramId});
        return processing;
    }
}



