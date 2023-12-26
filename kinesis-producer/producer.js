const AWS = require('aws-sdk');
AWS.config.update({region:'eu-west-1'});

const kinesis = new AWS.Kinesis();
const { faker } = require('@faker-js/faker');
const moment = require('moment');

const streamName =  'sls-notes-stream';

setInterval(async () => {
    try{
        let data = await generateNotesItem();
        let params = {
            Data: Buffer.from(JSON.stringify(data)), 
            PartitionKey: "P1",
            StreamName: streamName
        }

        let response = await kinesis.putRecord(params).promise()
        console.log("data", data)
        console.log("response", response)
        console.log()
    } catch (e) {
        throw e;
    }
}, 1000)


const generateNotesItem = async () => {
    return {
        user_id:  faker.string.uuid(),
        title: faker.company.catchPhrase(),
        content: faker.hacker.phrase(),
        timestamp: moment().unix(),
        note_id: faker.string.uuid(),
        cat: faker.lorem.word(),
        user_name: faker.internet.userName(),
        expires: moment().unix()+ 600
    }
}