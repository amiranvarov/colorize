import * as Algorithmia from 'algorithmia'
import * as path from 'path'
import * as fs from 'fs'
import * as s3 from './s3'
import * as shortid from 'shortid'
import * as request from 'request'


const client =  Algorithmia.client("simUl1/DmYhaNlXNTH5Nh7fZbng1")

const ALGORITMIA_SOURCE = 'data://amiranvarov';
const uploadDirectory = client.dir(`${ALGORITMIA_SOURCE}/colorize`);



export async function start (imageURI) {

    const newFileName = `${shortid.generate()}.jpeg`;
    const FILE_URI = imageURI;
    const tempFilePath = path.resolve(`uploads/${newFileName}`);
    const buffer = await downloadFile(FILE_URI)
    fs.writeFileSync(tempFilePath, buffer);

    await crateBaseDirectoryIfNotExist();
    const filePath = tempFilePath;
    const originalPhotoS3Path = await s3.uploadToS3(filePath, newFileName, 'original');
    console.log('original file uploaded to amazon');
    const uploadedfilePath = await uploadFile(filePath);
    console.log('file uploaded to Algorithmia data storage');
    const colorizedFilePath = await colorize(uploadedfilePath);
    console.log('File coloreized');
    const data = await getColorizedFile(colorizedFilePath);
    await deleteFile(client.file(uploadedfilePath));
    console.log('Colorized file downloaded');
    const colorizedPhotoURL = await s3.uploadToS3(data, newFileName, 'colorized');
    console.log('Colorized file uploaded to S3');
    fs.unlinkSync(tempFilePath);
    // res.send('ok')
    return {
        colorized: colorizedPhotoURL,
        original: originalPhotoS3Path
    };
}


async function crateBaseDirectoryIfNotExist () {
    return new Promise (((resolve, reject) => {
        uploadDirectory.exists(function(exists) {
            if (!exists) {
                uploadDirectory.create(function(response) {
                    if (response.error) {
                        reject("Failed to create dir: " + response.error.message);
                    }
                    resolve();
                });
            } else {
                resolve();
            }
        });
    }))
}

async function uploadFile (filePath) {
    return new Promise((resolve,reject) => {
        uploadDirectory.putFile(filePath, function(response) {
            if(response.error) {
                return reject("Error: " + response.error.message);
            }
            resolve(response.result)
        });
    })
}

async function listDirectories () {
    return new Promise(((resolve, reject) => {
        const files = [];
        uploadDirectory.forEachFile(function(err, file) {
            if(err) {
                return reject("Error: " + JSON.stringify(err));
            }

            files.push(file.data_path);
        }).then(function() {
            resolve(files);
        });
    }))
}

async function colorize (pathToFile) {
    return new Promise(((resolve, reject) => {
        const input = {
            "image": pathToFile
        };
        client.algo("deeplearning/ColorfulImageColorization/1.1.13").pipe(input)
            .then(function(response) {
                if (response.error) {
                    reject("Failed to colorize: " + response.error.message);
                }
                const { output } = response.get();
                resolve(output)
            });
    }))
}

async function getColorizedFile (colorizedFilePath) {
    return new Promise(((resolve, reject) => {
        const directory = colorizedFilePath.substring(0, colorizedFilePath.lastIndexOf('/'));
        const fileName = colorizedFilePath.split('/').pop();
        client.dir(directory).file(fileName).get(function(err, data) {
            if (err) {
                return reject(err)
            }
            resolve(data);
        });
    }))
}

async function deleteFile (c3po) {
    return new Promise (((resolve, reject) => {
        c3po.delete(function(response) {
            if(response.error) {
                return reject("Failed to delete file: " + response.error.message);
            }
            resolve()
        });
    }))
}


async function downloadFile (url) {
    return new Promise(((resolve, reject) => {
        const options = {
            uri: url,
            encoding: null
        };
        request(options, function(error, response, body) {
            if (error || response.statusCode !== 200) {
                reject(error)
            } else {
                resolve(body);
            }
        });
    }))
}



