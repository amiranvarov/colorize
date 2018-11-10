import DB from '../db'
import {ObjectID} from "bson";

const COLLECTION_NAME = 'conversions';


export default class Conversion {

    static async create (doc) {
        const count = await DB.mongo.collection(COLLECTION_NAME).insertOne(doc);
    }

}



