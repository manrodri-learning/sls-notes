/**
 * Route: POST /note
 */

 const AWS = require('aws-sdk');
 AWS.config.update({ region: 'us-west-2' });
 
 const moment = require('moment');
 const uuidv4 = require('uuid/v4');
 const util = require('./util.js');
 
 const dynamodb = new AWS.DynamoDB.DocumentClient();
 const tableName = process.env.NOTES_TABLE;
 
 exports.handler = async (event) => {
    console.log(`event headers: ${JSON.stringify(event.headers, null, 2)}`)
    console.log(`event body: ${JSON.stringify(event.body, null, 2)}`)

     try {
         let item = JSON.parse(event.body).Item;
         console.log(`item: ${JSON.stringify(item, null, 2)}`)

         console.log(`user_id: ${util.getUserId(event.headers)}`)
         console.log(`user_name: ${util.getUserName(event.headers)}`)

         item.user_id = util.getUserId(event.headers);
         item.user_name = util.getUserName(event.headers);
         item.note_id = item.user_id + ':' + uuidv4()
         item.timestamp = moment().unix();
         item.expires = moment().add(90, 'days').unix();

         console.log(`item: ${JSON.stringify(item, null, 2)}`)
         console.log(`adding item to ${tableName} table`)
 
         let data = await dynamodb.put({
             TableName: tableName,
             Item: item
         }).promise();
 
         return {
             statusCode: 200,
             headers: util.getResponseHeaders(),
             body: JSON.stringify(item)
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