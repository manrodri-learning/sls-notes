// Rote note: DELETE /note/t/{timestamp}
const AWS = require("aws-sdk");
const util = require("./utils.js");
AWS.config.update({ region: "eu-west-1" });

const dynamodb = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.NOTES_TABLE;

exports.handler = async (event) => {
  try {

    let timestamp = parseInt(event.pathParameters.timestamp);
    let params = {
      TableName: tableName,
      Key: {
        user_id: util.getUserId(event.headers),
        timestamp: timestamp
      }
    }

    await dynamodb.delete(params).promise();

    return {
      statusCode: 200,
      headers: util.getResponseHeaders(),
    };
  } catch (err) {
    console.log("Error", err);

    return {
      statusCode: err.statusCode ? err.statusCode : 500,
      body: JSON.stringify({
        error: err.name ? err.name : "Exception",
        message: err.message ? err.message : "Unknown error"
      }),
      headers: util.getResponseHeaders()
    };
  }
};
