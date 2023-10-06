import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {DockerImageFunction, DockerImageCode} from 'aws-cdk-lib/aws-lambda';
import { RestApi, LambdaIntegration } from 'aws-cdk-lib/aws-apigateway';

export class AlbAuthenticationClientStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // 从Dockerfile创建一个Lambda函数
    const lambdaFunction = new DockerImageFunction(this, 'MyFunction', {
      code: DockerImageCode.fromImageAsset('./dockerfile'),
      timeout: cdk.Duration.seconds(60),
    });

    // 创建API Gateway
    const api = new RestApi(this, 'TestAPI');

    const lambdaIntegration = new LambdaIntegration(lambdaFunction);

    // 创建资源和方法
    const resource = api.root.addResource('myresource');
    resource.addMethod('GET', lambdaIntegration);
  }
}
