'use strict';

const { DynamoDBClient, UpdateItemCommand, PutItemCommand, BatchWriteItemCommand } = require('@aws-sdk/client-dynamodb');
const ddbClient = new DynamoDBClient();

module.exports.handler = async (event) => {

  let events = [];
  event.Records.forEach(record => {
    const data = Buffer.from(record.kinesis.data, 'base64');
    const json = JSON.parse(data);
    events.push(json);
  });

  let promises = [];
  events.forEach(item => {
    promises.push(updateItem(item));
  });

  await Promise.all(promises);

  return 'OK';
};


function updateItem(item) {
  let params = {
    TableName: process.env.STATS_TABLE,
    Key: {
      PK: {
        S: `USER#${item.user}`
      },
      SK: {
        S: `EVENT#${item.event}`
      }
    },
    UpdateExpression: 'ADD #v :a',
    ExpressionAttributeNames: {
      '#v': 'value'
    },
    ExpressionAttributeValues: {
      ':a': {
        N: `${item.amount}`
      }
    }
  }

  return ddbClient.send(new UpdateItemCommand(params));
}