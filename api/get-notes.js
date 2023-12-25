/**
 * Route: GET /notes
 */

const region = process.env.AWS_REGION || 'eu-west-1'

const AWS = require('aws-sdk');
AWS.config.update({ region });

const util = require('./util.js');

const dynamodb = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.NOTES_TABLE;
console.log("tableName", tableName);

exports.handler = async (event) => {
    try {
        let query = event.queryStringParameters;
        let limit = query && query.limit ? parseInt(query.limit) : 5;
        let user_id = util.getUserId(event.headers);
        console.log("user_id", user_id);

        let params = {
            TableName: tableName,
            KeyConditionExpression: "user_id = :uid",
            ExpressionAttributeValues: {
                ":uid": user_id
            },
            Limit: limit,
            ScanIndexForward: false
        };

        console.log('params', JSON.stringify(params))

        let startTimestamp = query && query.start ? parseInt(query.start) : 0;
        console.log('startTimestamp', startTimestamp)

        if(startTimestamp > 0) {
            params.ExclusiveStartKey = {
                user_id: user_id,
                timestamp: startTimestamp
            }
        }

        let data = await dynamodb.query(params).promise();

        return {
            statusCode: 200,
            headers: util.getResponseHeaders(),
            body: JSON.stringify(data)
        };
    } catch (err) {
        console.log("Error", err);
        return {
            statusCode: err.statusCode ? err.statusCode : 500,
            headers: util.getResponseHeaders(),
            body: JSON.stringify({
                error: err.name ? err.name : "Exception",
                message: err.message ? err.message : "Unknown error"
            })
        };
    }
}