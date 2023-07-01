// Rote note: PATCH /note/::id
const AWS = require("aws-sdk");
const util = require("./util.js");
AWS.config.update({ region: "eu-west-1" });

const dynamodb = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.NOTES_TABLE;

exports.handler = async (event) => {
  try {
    let item = JSON.parse(event.body).Item;
    item.user_id = util.getUserId(event.headers);
    item.user_name = util.getUserName(event.headers);
    item.expires = moment().add(90, "days").unix();

    let data = awaitdynamodb
      .put({
        TableName: tableName,
        Item: item,
        ConditionExpression: "#t = :t",
        ExpressionAttributeNames: {
          "#t": "timestamp"
        },
        ExpressionAttributeValues: {
          ":t": item.timestamp
        }
      })
      .promise();

    return {
      statusCode: 200,
      headers: util.getResponseHeaders(),
      body: JSON.stringify(item)
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
