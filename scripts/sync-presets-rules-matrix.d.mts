export interface PresetPluginShape {
    readonly configs: Readonly<Record<string, unknown>>;
}

export function generatePresetMatrixSectionFromPlugin(
    plugin: PresetPluginShape
): string;

export function syncPresetsRulesMatrix(input: {
    readonly writeChanges: boolean;
}): Promise<Readonly<{ changed: boolean }>>;
