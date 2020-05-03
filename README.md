# SANDBOX Serverless WebSocket DynamoDB

Serverless WebSocket Sample.

## development

```shell
$ git clone git@github.com:kamataryo/sandbox-sls-ws-ddb.git
$ cd sandbox-sls-ws-ddb
$ cp .envrc.sample .envrc
$ vi .envrc # Edit with your AWS Account Access Infomation
$ yarn
```

## deploy

Caution: This create a CloudFormation Stack named `sandbox-sls-ws-ddb` with your AWS Account.

```shell
npm run deploy
```
