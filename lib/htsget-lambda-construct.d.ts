import { Duration, Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as apigwv2 from "@aws-cdk/aws-apigatewayv2-alpha";
/**
 * Configuration for HtsgetLambdaStack.
 */
export type Config = {
    environment: string;
    htsgetConfig: {
        [key: string]: any;
    };
    allowCredentials?: boolean;
    allowHeaders?: string[];
    allowMethods?: apigwv2.CorsHttpMethod[];
    allowOrigins?: string[];
    exposeHeaders?: string[];
    maxAge?: Duration;
    parameterStoreConfig: ParameterStoreConfig;
};
/**
 * Configuration values obtained from AWS System Manager Parameter Store.
 */
export type ParameterStoreConfig = {
    arnCert: string;
    hostedZoneId: string;
    hostedZoneName: string;
    htsgetDomain: string;
    cogUserPoolId: string;
    jwtAud: string[];
};
/**
 * Stack used to deploy htsget-lambda.
 */
export declare class HtsgetLambdaStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps);
    /**
     * Get config values from the Parameter Store.
     */
    getParameterStoreConfig(config: any): ParameterStoreConfig;
    /**
     * Convert JSON config to htsget-rs env representation.
     */
    static configToEnv(config: any): {
        [key: string]: string;
    };
    /**
     * Convert htsget-rs CORS option to CORS options for API Gateway.
     */
    static convertCors(configToml: any, corsValue: string): string[] | undefined;
    /**
     * Convert a string CORS allowMethod option to CorsHttpMethod.
     */
    static corsAllowMethodToHttpMethod(corsAllowMethod?: string[]): apigwv2.CorsHttpMethod[] | undefined;
    /**
     * Get the environment configuration from cdk.json. Pass `--context "env=dev"` or `--context "env=prod"` to
     * control the environment.
     */
    getConfig(): Config;
}
