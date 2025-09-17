# Cross account setup

The Lambda function for htsget-rs can be set-up to be updated from a different account than the one containing the
CDK infrastructure.

To do this, the [aws-lambda-deploy] action can be used.

[aws-lambda-deploy]: https://github.com/aws-actions/aws-lambda-deploy

## Process

Deploy the htsget infrastructure code to the target account that should contain the infrastructure, using `npx cdk deploy`.

After deploying, verify that the server is reachable: `curl https://<domain>/reads/service-info`.

Then, create a policy in the target account with the following permissions, matching the [aws-lambda-deploy] action, and
allowing access to the bucket created by the infrastructure.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "LambdaDeployPermissions",
      "Effect": "Allow",
      "Action": [
        "lambda:GetFunctionConfiguration",
        "lambda:CreateFunction",
        "lambda:UpdateFunctionCode",
        "lambda:UpdateFunctionConfiguration",
        "lambda:PublishVersion"
      ],
      "Resource": "arn:aws:lambda:<region>:<account>:function:<function_name>"
    },
    {
      "Sid":"PassRolesDefinition",
      "Effect":"Allow",
      "Action":[
        "iam:PassRole"
      ],
      "Resource":[
        "arn:aws:iam::<account>:role/<function_execution_role_name>"
      ]
    },
    {
      "Sid":"S3Access",
      "Effect":"Allow",
      "Action":[
        "s3:ListBucket*",
        "s3:PutObject*",
        "s3:GetObject*"
      ],
      "Resource":[
        "arn:aws:s3:::<bucket_name>"
      ]
    }
  ]
}
```

Then, create a role that has a trust policy for the delegated account, and the permissions of the policy created above,
optionally add an external id:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": "sts:AssumeRole",
            "Principal": {
                "AWS": "<delegated_account>"
            },
            "Condition": {
                "StringEquals": {
                    "sts:ExternalId": "<external_id>"
                }
            }
        }
    ]
}
```

To test that the setup works, attempt to update the Lambda function from the delegated account:

```sh
aws lambda get-function-configuration --function-name <function_name>
```
