import plugin from "../../src/index.js";
import type { FileProgressRuleName } from "../../src/types.js";
import { RuleTester } from "@typescript-eslint/rule-tester";

type CompatibleRuleModule = Parameters<RuleTester["run"]>[1];

export const getPluginRule = (
    ruleName: FileProgressRuleName
): CompatibleRuleModule => {
    const ruleModule = plugin.rules[ruleName];

    if (ruleModule === undefined) {
        throw new Error(`Missing plugin rule: ${ruleName}`);
    }

    return ruleModule as unknown as CompatibleRuleModule;
};
