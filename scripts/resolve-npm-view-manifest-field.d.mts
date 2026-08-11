/** Resolve a string field from one npm view manifest object or array entry. */
export declare const resolveNpmViewManifestField: (
    viewOutput: unknown,
    field: string
) => string;

/** Parse serialized npm view output and resolve a string manifest field. */
export declare const parseNpmViewManifestField: (
    jsonText: string,
    field: string
) => string;
