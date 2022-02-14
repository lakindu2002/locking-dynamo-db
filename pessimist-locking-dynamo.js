const AWS = require("aws-sdk");
const documentClient = new AWS.DynamoDB.DocumentClient({ region: "us-east-1" });

const transactionWriteDynamo = async () => {
  const noteId = "jkooi6r776ar7h5y3j45za";
  const tableName = "notes";
  documentClient
    .transactWrite({
      TransactItems: [
        {
          Update: {
            TableName: tableName,
            Key: { "note-id": noteId },
            UpdateExpression:
              "set #updatedAt = :newChangeMadeAt, #status = :newStatus",
            ExpressionAttributeNames: {
              "#updatedAt": "updatedAt",
              "#status": "status",
            },
            ExpressionAttributeValues: {
              ":newChangeMadeAt": Date.now(),
              ":newStatus": "inactive",
            },
          },
        },
      ],
    })
    .promise();

  console.log("Updated Note - " + noteId);
};

transactionWriteDynamo();
