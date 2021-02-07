'use strict';

const { SQSClient, SendMessageCommand } = require('@aws-sdk/client-sqs');
const { DynamoDBClient, GetItemCommand } = require('@aws-sdk/client-dynamodb');

const ddbClient = new DynamoDBClient();
const sqsClient = new SQSClient();

module.exports.handler = async (event) => {

  let promises = [];

  console.log(JSON.stringify(event));

  for (let record of event.Records) {
    const item = record.dynamodb.NewImage;
    //ignore if not event from user
    if (!item.PK.S.startsWith('USER#')) continue;

    const user = item.PK.S.split('#')[1];

    const params = {
      TableName: process.env.STATS_TABLE,
      Key: {
        PK: {
          S: item.SK.S
        },
        SK: {
          S: `REWARD#${item.value.N}`
        }
      }
    }

    const response = await ddbClient.send(new GetItemCommand(params));

    if (response.Item !== undefined) {
      const reward = {
        user,
        event: response.Item.PK.S.split('#')[1],
        reward: response.Item.SK.S.split('#')[1],
        description: response.Item.description.S
      }
      promises.push(sendReward(reward));
    }

  }

  await Promise.all(promises);

  return 'OK';
};

function sendReward(reward) {
  const params = {
    QueueUrl: process.env.REW_QUEUE,
    MessageBody: JSON.stringify(reward)
  }
  console.log(params);

  return sqsClient.send(new SendMessageCommand(params));
}