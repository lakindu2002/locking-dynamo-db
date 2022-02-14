const AWS = require("aws-sdk");
const dynamoDb = new AWS.DynamoDB({ region: "us-east-1" });
const documentClient = new AWS.DynamoDB.DocumentClient({ region: "us-east-1" });


const createSampleTable = async () => {
  const table = await dynamoDb
    .createTable({
      TableName: "notes",
      BillingMode: "PAY_PER_REQUEST",
      KeySchema: [
        {
          AttributeName: "note-id",
          KeyType: "HASH",
        },
      ],
      AttributeDefinitions: [
        {
          AttributeName: "note-id",
          AttributeType: "S",
        },
      ],
    })
    .promise();
  console.log("TABLE CREATED");
};

const insertRecordToNotesTable = async () => {
  const tableName = "notes";
  const randomUUID =
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);

  const item = {
    "note-id": randomUUID,
    text: "This is a sample note",
    status: "active",
    updatedAt: Date.now(), // version number
  };
  await documentClient.put({ TableName: tableName, Item: item }).promise();
};

const triggerWriteError = async () => {
  try {
    const tableName = "notes";
    const noteId = "jkooi6r776ar7h5y3j45za";
    const { Item } = await documentClient
      .get({
        TableName: tableName,
        Key: { "note-id": noteId },
      })
      .promise();

    const { updatedAt } = Item;
    await documentClient
      .update({
        TableName: tableName,
        Key: { "note-id": noteId },
        Item: { ...Item, status: "inactive" },
        UpdateExpression: "set #updatedAt = :newChangeMadeAt",
        // define the condition expression to implement optimistic concurrency
        ConditionExpression: "#updatedAt = :updatedAtHand",
        ExpressionAttributeNames: { "#updatedAt": "updatedAt" },
        ExpressionAttributeValues: {
          ":newChangeMadeAt": Date.now(),
          ":updatedAtHand": updatedAt,
        },
      })
      .promise();
    console.log("Updated the item");
  } catch (err) {
    console.log(`Error updating the item because of error - ${err.code}`);
  }
};

triggerWriteError();
