const AWS = require("aws-sdk");

/**
 * Broadcast to repeat
 * @param {string} url API Gateway URL
 * @param {string} connectionId connectionId
 * @param {string} payload message body
 */
const sendMessageToClient = (endpoint, connectionId, payload) => {
  return new Promise((resolve, reject) => {
    const apigatewaymanagementapi = new AWS.ApiGatewayManagementApi({
      apiVersion: "2018-11-29",
      endpoint,
    });
    apigatewaymanagementapi.postToConnection(
      {
        ConnectionId: connectionId,
        Data: payload,
      },
      (error, data) => {
        if (error) {
          console.error({ error });
          reject(error);
        }
        resolve(data);
      }
    );
  });
};

module.exports.handler = async (event) => {
  const { domainName, stage } = event.requestContext;
  const sender = event.requestContext.connectionId;
  const endpoint = `https://${domainName}/${stage}`;

  const docclient = new AWS.DynamoDB.DocumentClient({
    apiVersion: "2012-08-10",
  });

  const { CONNECTION_TABLE } = process.env;

  const param = {
    TableName: CONNECTION_TABLE,
    IndexName: "liveId-index",
    KeyConditionExpression: "#l = :l",
    ExpressionAttributeNames: {
      "#l": "liveId",
    },
    ExpressionAttributeValues: {
      ":l": "the-live-id",
    },
  };

  const { Items = [] } = await docclient.query(param).promise();
  await Promise.all(
    Items.map((item) => {
      const { connectionId } = item;
      return sendMessageToClient(
        endpoint,
        connectionId,
        JSON.stringify({
          sender,
          payload: event.body,
        })
      );
    })
  );

  return {
    statusCode: 200,
  };
};
