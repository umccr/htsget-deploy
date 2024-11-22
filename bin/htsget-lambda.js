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
exports.__esModule = true;
exports.HtsgetTestStack = void 0;
var cdk = require("aws-cdk-lib");
var htsget_lambda_construct_1 = require("../../deploy/lib/htsget-lambda-construct");
var settings_1 = require("../../deploy/bin/settings");
var HtsgetTestStack = /** @class */ (function (_super) {
    __extends(HtsgetTestStack, _super);
    function HtsgetTestStack(scope, id, settings, props) {
        var _this = _super.call(this, scope, id, props) || this;
        new htsget_lambda_construct_1.HtsgetLambdaConstruct(_this, 'Htsget-rs', settings_1.SETTINGS);
        return _this;
    }
    return HtsgetTestStack;
}(cdk.Stack));
exports.HtsgetTestStack = HtsgetTestStack;
var app = new cdk.App();
new HtsgetTestStack(app, "HtsgetTestStack", settings_1.SETTINGS, {
    stackName: "HtsgetTestStack",
    description: "HtsgetTestStack",
    tags: {
        Stack: "HtsgetTestStack"
    },
    env: {
        account: process.env.CDK_DEFAULT_ACCOUNT,
        region: process.env.CDK_DEFAULT_REGION
    }
});
