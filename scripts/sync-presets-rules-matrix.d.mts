export interface PresetPluginShape {
    readonly configs: Readonly<Record<string, unknown>>;
}

export interface PresetCatalogEntryShape {
    readonly docsBadge: string;
    readonly docsPath: string;
    readonly name: string;
    readonly optionSummary: string;
    readonly purpose: string;
    readonly ruleName: string;
}

export function generatePresetMatrixSectionFromPlugin(
    plugin: PresetPluginShape,
    input?: Readonly<{
        getRuleCatalogEntry?: (ruleName: string) => { docsId: string };
        presetCatalog?: readonly PresetCatalogEntryShape[];
    }>
): string;

export function syncPresetsRulesMatrix(input: {
    readonly writeChanges: boolean;
}): Promise<Readonly<{ changed: boolean }>>;
