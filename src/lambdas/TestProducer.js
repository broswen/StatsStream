const { KinesisClient, PutRecordCommand } = require('@aws-sdk/client-kinesis');

const client = new KinesisClient();

const params = {
    PartitionKey: 'test',
    Data: Buffer.from(JSON.stringify({ event: 'login', user: '2', amount: 1 })),
    StreamName: ''
};

const command = new PutRecordCommand(params);

const putRecord = async () => {
    const response = await client.send(command);
    console.log(response);
}

let i = 0;
while (i++ < 1) {
    putRecord();
}