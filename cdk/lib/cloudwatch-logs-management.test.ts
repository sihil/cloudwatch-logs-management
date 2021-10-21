// This file was autogenerated from template.ts using @guardian/cdk-cli
// It is a starting point for migration to CDK *only*. Please check the output carefully before deploying

import "@aws-cdk/assert/jest";
import { SynthUtils } from "@aws-cdk/assert";
import { App } from "@aws-cdk/core";
import { CloudwatchLogsManagement } from "./cloudwatch-logs-management";

describe("The CloudwatchLogsManagement stack", () => {
  it("matches the snapshot", () => {
    const app = new App();
    const stack = new CloudwatchLogsManagement(app, "Template", {
      stack: "cloudwatch-logs-management",
      migratedFromCloudFormation: true,
    });
    expect(SynthUtils.toCloudFormation(stack)).toMatchSnapshot();
  });
});
