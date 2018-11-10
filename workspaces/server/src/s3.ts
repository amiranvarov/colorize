const AWS = require('aws-sdk');
import * as fs from 'fs'
const BUCKET_NAME = 'amir-colorize';
const IAM_USER_KEY = 'AKIAJLF7Q3E2D7IE33IQ';
const IAM_USER_SECRET = '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';




export async function uploadToS3(file, name, dirname) {
    try {
        let s3bucket = new AWS.S3({
            accessKeyId: IAM_USER_KEY,
            secretAccessKey: IAM_USER_SECRET,
            Bucket: dirname ? `${BUCKET_NAME}/${dirname}` : BUCKET_NAME,
        });

        const { Location } = await s3bucket.upload({
            Bucket: dirname ? `${BUCKET_NAME}/${dirname}` : BUCKET_NAME,
            Key: name,
            Body: file.constructor === String ? fs.readFileSync(file) : file,
            ACL:'public-read',
            ContentType : 'image/jpeg'
        }).promise();
        return Location;
    } catch (error) {
        console.log('Error while uploading file to S3',error);
    }


}
