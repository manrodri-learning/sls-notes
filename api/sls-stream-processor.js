const region = process.env.REGION || 'eu-west-1'

const AWS = require('aws-sdk');
AWS.config.update({ region });

const docClient = new AWS.DynamoDB.DocumentClient();

const tableName = process.env.NOTES_TABLE || 'sls-notes-backend-prod';


exports.handler = async (event) => {
    try {
        let items = event.Records.map(record => {
            let jsonData = Buffer.from(record.kinesis.data, 'base64').toString('ascii');
            console.log("Processing record:", jsonData)

            let item = JSON.parse(jsonData);
            let putRequest = {
                PutRequest: {
                    Item: item
                }
            }
            return putRequest;
        })
        let params = {
            RequestItems: {
                [tableName]: items
            }
        }
        return await docClient.batchWrite(params).promise();
    } catch (err) {
        console.log(err);
        throw err;
    }
}
