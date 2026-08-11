import type { RuleTester } from "@typescript-eslint/rule-tester";

import type { FileProgressRuleName } from "../../src/types.js";

import plugin from "../../src/index.js";

type CompatibleRuleModule = Parameters<RuleTester["run"]>[1];

export const getPluginRule = (
    ruleName: FileProgressRuleName
): CompatibleRuleModule => {
    const ruleModule = plugin.rules[ruleName];

    return ruleModule as unknown as CompatibleRuleModule;
};
