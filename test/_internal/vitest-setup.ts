/* eslint-disable @eslint-community/eslint-comments/disable-enable-pair, no-only-tests/no-only-tests, sonarjs/no-exclusive-tests, vitest/consistent-test-it, vitest/no-disabled-tests, vitest/no-focused-tests, vitest/no-hooks, vitest/valid-describe-callback -- assigning Vitest framework hooks to RuleTester.itOnly/describeSkip is required test-framework wiring, not focused tests. */
import { RuleTester } from "@typescript-eslint/rule-tester";
import { afterAll, describe, it } from "vitest";

RuleTester.afterAll = (callback): void => {
    afterAll(callback);
};
RuleTester.describe = (text, callback): void => {
    describe(text, callback);
};
RuleTester.describeSkip = (text, callback): void => {
    describe.skip(text, callback);
};
RuleTester.it = (text, callback): void => {
    it(text, callback);
};
RuleTester.itOnly = (text, callback): void => {
    it.only(text, callback);
};
RuleTester.itSkip = (text, callback): void => {
    it.skip(text, callback);
};
