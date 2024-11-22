"use strict";
exports.__esModule = true;
exports.SETTINGS = void 0;
/**
 * Settings to use for the htsget deployment.
 */
exports.SETTINGS = {
    config: "config/example_deploy.toml",
    domain: "dev.umccr.org",
    subDomain: "htsget-c4gh",
    s3BucketResources: [],
    lookupHostedZone: true,
    createS3Bucket: true,
    copyTestData: true,
    copyExampleKeys: true,
    // Override the bucket name.
    // bucketName: "bucket",
    jwtAuthorizer: {
        // Set this to false if you want a private instance.
        public: false,
        cogUserPoolId: "",
        jwtAudience: [""]
    },
    // Enable additional features for compiling htsget-rs. `s3-storage` is always enabled.
    features: ["experimental"]
};
