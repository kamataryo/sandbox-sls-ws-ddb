const AWS = require("aws-sdk");

module.exports.handler = async (event) => {
  const docclient = new AWS.DynamoDB.DocumentClient({
    apiVersion: "2012-08-10",
  });
  const { CONNECTION_TABLE } = process.env;

  const { Items = [] } = await docclient
    .scan({ TableName: CONNECTION_TABLE })
    .promise();

  const apigatewaymanagementapi = new AWS.ApiGatewayManagementApi({
    apiVersion: "2018-11-29",
    endpoint,
  });

  const { domainName, stage } = event.requestContext;
  const endpoint = `https://${domainName}/${stage}`;

  await Promise.all(
    Items.map((Item) => {
      const { connectionId } = Item;
      return apigatewaymanagementapi
        .deleteConnection({ endpoint, connectionId })
        .promise();
    })
  );

  await Promise.all(
    Items.map((Item) => {
      const { connectionId } = Item;
      return docclient.delete({ connectionId }).promise();
    })
  );

  return { statusCode: 200 };
};
