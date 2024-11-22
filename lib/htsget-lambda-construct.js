"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
exports.HtsgetLambdaConstruct = void 0;
var TOML = require("@iarna/toml");
var fs_1 = require("fs");
var aws_cdk_lib_1 = require("aws-cdk-lib");
var constructs_1 = require("constructs");
var aws_cognito_1 = require("aws-cdk-lib/aws-cognito");
var aws_iam_1 = require("aws-cdk-lib/aws-iam");
var aws_lambda_1 = require("aws-cdk-lib/aws-lambda");
var aws_certificatemanager_1 = require("aws-cdk-lib/aws-certificatemanager");
var aws_route53_1 = require("aws-cdk-lib/aws-route53");
var aws_route53_targets_1 = require("aws-cdk-lib/aws-route53-targets");
var cargo_lambda_cdk_1 = require("cargo-lambda-cdk");
var path_1 = require("path");
var aws_apigatewayv2_integrations_1 = require("aws-cdk-lib/aws-apigatewayv2-integrations");
var aws_apigatewayv2_1 = require("aws-cdk-lib/aws-apigatewayv2");
var aws_apigatewayv2_authorizers_1 = require("aws-cdk-lib/aws-apigatewayv2-authorizers");
var aws_s3_1 = require("aws-cdk-lib/aws-s3");
var aws_s3_deployment_1 = require("aws-cdk-lib/aws-s3-deployment");
var aws_secretsmanager_1 = require("aws-cdk-lib/aws-secretsmanager");
// export class HtsgetStatelessConstruct extends Construct {
//   constructor(
//     scope: Construct,
//     id: string,
//     settings: HtsgetStatelessSettings
//   ) {
//     super(scope, id);
//     const config = this.getConfig(settings.config);
//     const lambdaRole = new Role(this, id + "Role", {
//       assumedBy: new ServicePrincipal("lambda.amazonaws.com"),
//       description: "Lambda execution role for " + id,
//     });
//     const s3BucketPolicy = new PolicyStatement({
//       actions: ["s3:List*", "s3:Get*"],
//       resources: settings.s3BucketResources ?? [],
//     });
//     const secretPolicy = new PolicyStatement({
//       actions: ["secretsmanager:GetSecretValue"],
//       resources: settings.secretArns ?? [],
//     });
//   }
//   /**
//    * Get the environment from config.toml
//    */
//   getConfig(config: string): Config {
//     const configToml = TOML.parse(readFileSync(config).toString());
//     return {
//       htsgetConfig: HtsgetLambdaConstruct.configToEnv(configToml),
//       allowCredentials:
//         configToml.ticket_server_cors_allow_credentials as boolean,
//       allowHeaders: HtsgetLambdaConstruct.convertCors(
//         configToml,
//         "ticket_server_cors_allow_headers",
//       ),
//       allowMethods: HtsgetLambdaConstruct.corsAllowMethodToHttpMethod(
//         HtsgetLambdaConstruct.convertCors(
//           configToml,
//           "ticket_server_cors_allow_methods",
//         ),
//       ),
//       allowOrigins: HtsgetLambdaConstruct.convertCors(
//         configToml,
//         "ticket_server_cors_allow_origins",
//       ),
//       exposeHeaders: HtsgetLambdaConstruct.convertCors(
//         configToml,
//         "ticket_server_cors_expose_headers",
//       ),
//       maxAge:
//         configToml.ticket_server_cors_max_age !== undefined
//           ? Duration.seconds(configToml.ticket_server_cors_max_age as number)
//           : undefined,
//     };
//   }
// }
/**
 * Construct used to deploy htsget-lambda.
 */
var HtsgetLambdaConstruct = /** @class */ (function (_super) {
    __extends(HtsgetLambdaConstruct, _super);
    function HtsgetLambdaConstruct(scope, id, settings) {
        var _this = this;
        var _a, _b, _c, _d, _e, _f, _g;
        _this = _super.call(this, scope, id) || this;
        var config = _this.getConfig(settings.config);
        var lambdaRole = new aws_iam_1.Role(_this, id + "Role", {
            assumedBy: new aws_iam_1.ServicePrincipal("lambda.amazonaws.com"),
            description: "Lambda execution role for " + id
        });
        var s3BucketPolicy = new aws_iam_1.PolicyStatement({
            actions: ["s3:List*", "s3:Get*"],
            resources: (_a = settings.s3BucketResources) !== null && _a !== void 0 ? _a : []
        });
        if (settings.createS3Bucket) {
            var bucket = new aws_s3_1.Bucket(_this, "Bucket", {
                blockPublicAccess: aws_s3_1.BlockPublicAccess.BLOCK_ALL,
                encryption: aws_s3_1.BucketEncryption.S3_MANAGED,
                enforceSSL: true,
                removalPolicy: aws_cdk_lib_1.RemovalPolicy.RETAIN,
                bucketName: settings.bucketName
            });
            if (settings.copyTestData) {
                var dataDir = path_1["default"].join(__dirname, "..", "..", "data");
                new aws_s3_deployment_1.BucketDeployment(_this, "DeployFiles", {
                    sources: [aws_s3_deployment_1.Source.asset(dataDir)],
                    destinationBucket: bucket
                });
            }
            s3BucketPolicy.addResources("arn:aws:s3:::".concat(bucket.bucketName, "/*"));
            new aws_cdk_lib_1.CfnOutput(_this, "HtsgetBucketName", { value: bucket.bucketName });
        }
        var secretPolicy = new aws_iam_1.PolicyStatement({
            actions: ["secretsmanager:GetSecretValue"],
            resources: (_b = settings.secretArns) !== null && _b !== void 0 ? _b : []
        });
        if (settings.copyExampleKeys) {
            var dataDir = path_1["default"].join(__dirname, "..", "..", "data", "c4gh", "keys");
            var private_key = new aws_secretsmanager_1.Secret(_this, "SecretPrivateKey-C4GH", {
                secretName: "htsget-rs/c4gh-private-key-c4gh",
                secretStringValue: aws_cdk_lib_1.SecretValue.unsafePlainText((0, fs_1.readFileSync)(path_1["default"].join(dataDir, "bob.sec")).toString()),
                removalPolicy: aws_cdk_lib_1.RemovalPolicy.RETAIN
            });
            var public_key = new aws_secretsmanager_1.Secret(_this, "SecretPublicKey-C4GH", {
                secretName: "htsget-rs/c4gh-recipient-public-key-c4gh",
                secretStringValue: aws_cdk_lib_1.SecretValue.unsafePlainText((0, fs_1.readFileSync)(path_1["default"].join(dataDir, "alice.pub")).toString()),
                removalPolicy: aws_cdk_lib_1.RemovalPolicy.RETAIN
            });
            secretPolicy.addResources(private_key.secretArn, public_key.secretArn);
        }
        lambdaRole.addManagedPolicy(aws_iam_1.ManagedPolicy.fromAwsManagedPolicyName("service-role/AWSLambdaBasicExecutionRole"));
        if (s3BucketPolicy.resources.length !== 0) {
            lambdaRole.addToPolicy(s3BucketPolicy);
        }
        if (secretPolicy.resources.length !== 0) {
            lambdaRole.addToPolicy(secretPolicy);
        }
        var features = (_c = settings.features) !== null && _c !== void 0 ? _c : [];
        features = features
            .filter(function (f) { return f !== "s3-storage"; })
            .concat(["s3-storage"]);
        var htsgetLambda = new cargo_lambda_cdk_1.RustFunction(_this, id + "Function", {
            manifestPath: path_1["default"].join(__dirname, "..", ".."),
            binaryName: "htsget-lambda",
            bundling: {
                environment: {
                    RUSTFLAGS: "-C target-cpu=neoverse-n1",
                    CARGO_PROFILE_RELEASE_LTO: "true",
                    CARGO_PROFILE_RELEASE_CODEGEN_UNITS: "1"
                },
                cargoLambdaFlags: ["--features", features.join(",")]
            },
            memorySize: 128,
            timeout: aws_cdk_lib_1.Duration.seconds(28),
            environment: __assign(__assign({}, config.htsgetConfig), { RUST_LOG: "info,htsget_http_lambda=trace,htsget_config=trace,htsget_http_core=trace,htsget_search=trace" }),
            architecture: aws_lambda_1.Architecture.ARM_64,
            role: lambdaRole
        });
        var httpIntegration = new aws_apigatewayv2_integrations_1.HttpLambdaIntegration(id + "HtsgetIntegration", htsgetLambda);
        // Add an authorizer if auth is required.
        var authorizer = undefined;
        if (!settings.jwtAuthorizer.public) {
            // If the cog user pool id is not specified, create a new one.
            if (settings.jwtAuthorizer.cogUserPoolId === undefined) {
                var pool = new aws_cognito_1.UserPool(_this, "userPool", {
                    userPoolName: "HtsgetRsUserPool"
                });
                settings.jwtAuthorizer.cogUserPoolId = pool.userPoolId;
            }
            authorizer = new aws_apigatewayv2_authorizers_1.HttpJwtAuthorizer(id + "HtsgetAuthorizer", "https://cognito-idp.".concat(aws_cdk_lib_1.Stack.of(_this).region, ".amazonaws.com/").concat(settings.jwtAuthorizer.cogUserPoolId), {
                identitySource: ["$request.header.Authorization"],
                jwtAudience: (_d = settings.jwtAuthorizer.jwtAudience) !== null && _d !== void 0 ? _d : []
            });
        }
        else {
            console.warn("This will create an instance of htsget-rs that is public! Anyone will be able to query the server without authorization.");
        }
        var hostedZone;
        if ((_e = settings.lookupHostedZone) !== null && _e !== void 0 ? _e : true) {
            hostedZone = aws_route53_1.HostedZone.fromLookup(_this, "HostedZone", {
                domainName: settings.domain
            });
        }
        else {
            hostedZone = new aws_route53_1.HostedZone(_this, id + "HtsgetHostedZone", {
                zoneName: settings.domain
            });
        }
        var url = "".concat((_f = settings.subDomain) !== null && _f !== void 0 ? _f : "htsget", ".").concat(settings.domain);
        var certificate = new aws_certificatemanager_1.Certificate(_this, id + "HtsgetCertificate", {
            domainName: url,
            validation: aws_certificatemanager_1.CertificateValidation.fromDns(hostedZone),
            certificateName: url
        });
        var domainName = new aws_apigatewayv2_1.DomainName(_this, id + "HtsgetDomainName", {
            certificate: certificate,
            domainName: url
        });
        new aws_route53_1.ARecord(_this, id + "HtsgetARecord", {
            zone: hostedZone,
            recordName: (_g = settings.subDomain) !== null && _g !== void 0 ? _g : "htsget",
            target: aws_route53_1.RecordTarget.fromAlias(new aws_route53_targets_1.ApiGatewayv2DomainProperties(domainName.regionalDomainName, domainName.regionalHostedZoneId))
        });
        var httpApi = new aws_apigatewayv2_1.HttpApi(_this, id + "ApiGw", {
            defaultAuthorizer: authorizer,
            defaultDomainMapping: {
                domainName: domainName
            },
            corsPreflight: {
                allowCredentials: config.allowCredentials,
                allowHeaders: config.allowHeaders,
                allowMethods: config.allowMethods,
                allowOrigins: config.allowOrigins,
                exposeHeaders: config.exposeHeaders,
                maxAge: config.maxAge
            }
        });
        httpApi.addRoutes({
            path: "/{proxy+}",
            methods: [aws_apigatewayv2_1.HttpMethod.GET, aws_apigatewayv2_1.HttpMethod.POST],
            integration: httpIntegration
        });
        return _this;
    }
    /**
     * Convert JSON config to htsget-rs env representation.
     */
    HtsgetLambdaConstruct.configToEnv = function (config) {
        var out = {};
        for (var key in config) {
            out["HTSGET_".concat(key.toUpperCase())] = TOML.stringify.value(config[key]);
        }
        return out;
    };
    /**
     * Convert htsget-rs CORS option to CORS options for API Gateway.
     */
    HtsgetLambdaConstruct.convertCors = function (configToml, corsValue) {
        var value = configToml[corsValue];
        if (value !== undefined &&
            (value.toString().toLowerCase() === "all" ||
                value.toString().toLowerCase() === "mirror")) {
            return ["*"];
        }
        else if (Array.isArray(value)) {
            return value;
        }
        return undefined;
    };
    /**
     * Convert a string CORS allowMethod option to CorsHttpMethod.
     */
    HtsgetLambdaConstruct.corsAllowMethodToHttpMethod = function (corsAllowMethod) {
        if ((corsAllowMethod === null || corsAllowMethod === void 0 ? void 0 : corsAllowMethod.length) === 1 && corsAllowMethod.includes("*")) {
            return [aws_apigatewayv2_1.CorsHttpMethod.ANY];
        }
        else {
            return corsAllowMethod === null || corsAllowMethod === void 0 ? void 0 : corsAllowMethod.map(function (element) { return aws_apigatewayv2_1.CorsHttpMethod[element]; });
        }
    };
    /**
     * Get the environment from config.toml
     */
    HtsgetLambdaConstruct.prototype.getConfig = function (config) {
        var configToml = TOML.parse((0, fs_1.readFileSync)(config).toString());
        return {
            htsgetConfig: HtsgetLambdaConstruct.configToEnv(configToml),
            allowCredentials: configToml.ticket_server_cors_allow_credentials,
            allowHeaders: HtsgetLambdaConstruct.convertCors(configToml, "ticket_server_cors_allow_headers"),
            allowMethods: HtsgetLambdaConstruct.corsAllowMethodToHttpMethod(HtsgetLambdaConstruct.convertCors(configToml, "ticket_server_cors_allow_methods")),
            allowOrigins: HtsgetLambdaConstruct.convertCors(configToml, "ticket_server_cors_allow_origins"),
            exposeHeaders: HtsgetLambdaConstruct.convertCors(configToml, "ticket_server_cors_expose_headers"),
            maxAge: configToml.ticket_server_cors_max_age !== undefined
                ? aws_cdk_lib_1.Duration.seconds(configToml.ticket_server_cors_max_age)
                : undefined
        };
    };
    return HtsgetLambdaConstruct;
}(constructs_1.Construct));
exports.HtsgetLambdaConstruct = HtsgetLambdaConstruct;
