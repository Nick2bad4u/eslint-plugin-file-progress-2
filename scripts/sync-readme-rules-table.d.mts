export interface ReadmePluginShape {
    readonly configs: Readonly<Record<string, unknown>>;
    readonly rules: Readonly<Record<string, unknown>>;
}

export interface PresetCatalogEntryShape {
    readonly docsPath: string;
    readonly name: string;
}

export interface RuleCatalogEntryShape {
    readonly docsPath: string;
    readonly name: string;
}

export function generateReadmeRulesSectionFromPlugin(
    plugin: ReadmePluginShape,
    input?: Readonly<{
        presetCatalog?: readonly PresetCatalogEntryShape[];
        ruleCatalog?: readonly RuleCatalogEntryShape[];
    }>
): string;

export function syncReadmeRulesTable(input: {
    readonly writeChanges: boolean;
}): Promise<Readonly<{ changed: boolean }>>;
