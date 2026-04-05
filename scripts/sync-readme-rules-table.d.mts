export interface ReadmePluginShape {
    readonly configs: Readonly<Record<string, unknown>>;
    readonly rules: Readonly<Record<string, unknown>>;
}

export function generateReadmeRulesSectionFromPlugin(
    plugin: ReadmePluginShape
): string;

export function syncReadmeRulesTable(input: {
    readonly writeChanges: boolean;
}): Promise<Readonly<{ changed: boolean }>>;
