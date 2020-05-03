const AWS = require("aws-sdk");

module.exports.handler = async (event) => {
  const docclient = new AWS.DynamoDB.DocumentClient({
    apiVersion: "2012-08-10",
  });
  const { CONNECTION_TABLE } = process.env;
  const { connectionId } = event.requestContext;

  await docclient
    .delete({
      TableName: CONNECTION_TABLE,
      Key: { connectionId },
    })
    .promise();

  return { statusCode: 200 };
};
