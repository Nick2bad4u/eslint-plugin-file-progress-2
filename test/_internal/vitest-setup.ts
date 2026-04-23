import { RuleTester } from "@typescript-eslint/rule-tester";
import * as vitest from "vitest";

RuleTester.afterAll = (callback): void => {
    vitest.afterAll(callback);
};
RuleTester.describe = (text, callback): void => {
    vitest.describe(text, callback);
};
RuleTester.describeSkip = (text, callback): void => {
    vitest.describe.skip(text, callback);
};
RuleTester.it = (text, callback): void => {
    vitest.it(text, callback);
};
RuleTester.itOnly = (text, callback): void => {
    vitest.it.only(text, callback);
};
RuleTester.itSkip = (text, callback): void => {
    vitest.it.skip(text, callback);
};
