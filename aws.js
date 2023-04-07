const AWS = require("aws-sdk");
const s3 = new AWS.S3()
const dataset = require("./dataset.json");

(async() => {

    await s3.putObject({
        Body: JSON.stringify(dataset),
        Bucket: process.env.BUCKET_NAME,
        Key: "datanew.json",
    }).promise()

})();




