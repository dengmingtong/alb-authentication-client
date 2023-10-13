import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {DockerImageFunction, DockerImageCode} from 'aws-cdk-lib/aws-lambda';
import {
  StackProps,
  CfnParameter,
} from 'aws-cdk-lib';
import {
  Role,
  PolicyStatement,
} from 'aws-cdk-lib/aws-iam';

export class AlbAuthenticationClientStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
    const serverUrlParam = new CfnParameter(
      this, 
      "ServerUrl", 
      {
        description: 'ALB Url',
        type: 'String',
      },
    );
    
    const userInfoSecretManagerNameParam = new CfnParameter(
      this, 
      "UserInfoSecretManagerName", 
      {
        description: 'Secret Manager Name for user name and password',
        type: 'String',
      },
    );

    const cookieSecretManagerNameParam = new CfnParameter(
      this, 
      "CookieSecretManagerName", 
      {
        description: 'Secret Manager Name for user name and password',
        type: 'String',
      },
    );     

    const lambdaFunction = new DockerImageFunction(this, 'MyFunction', {
      code: DockerImageCode.fromImageAsset('./dockerfile'),
      timeout: cdk.Duration.seconds(60),
      memorySize: 1024,
      environment: {
        "SERVER_URL": serverUrlParam.valueAsString,
        "USER_SECRET_MANAGER_NAME": userInfoSecretManagerNameParam.valueAsString,
        "COOKIE_SECRET_MANAGER_NAME": cookieSecretManagerNameParam.valueAsString,
      }
    });
    const lambdaRole = lambdaFunction.role as Role;
    lambdaRole.addToPolicy(
      new PolicyStatement({
        actions: [
          'secretsmanager:GetSecretValue',
          'secretsmanager:CreateSecret',
          'secretsmanager:PutSecretValue',
          'secretsmanager:DescribeSecret',
        ],
        resources: ['*'],
      })
    );
    new cdk.CfnOutput(this, 'LambdaFunctionNameOutput', {
      value: lambdaFunction.functionName,
      description: 'The name of the Lambda function',
      exportName: 'LambdaFunctionName'
    });    
  }
}
