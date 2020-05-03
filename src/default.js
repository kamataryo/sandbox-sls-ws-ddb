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
  console.log(event.requestContext);

  let endpoint = `https://${domainName}/${stage}`;
  if (stage === "local") {
    endpoint = "http://localhost:3001";
  }

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

  try {
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
  } catch (error) {
    console.error({ error });
  }

  return {
    statusCode: 200,
  };
};
