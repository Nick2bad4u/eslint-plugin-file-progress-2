/** Resolve a string field from one npm view manifest object or array entry. */
export declare const resolveNpmViewManifestField: (
    viewOutput: unknown,
    field: "gitHead" | "version"
) => string;

/** Parse serialized npm view output and resolve a string manifest field. */
export declare const parseNpmViewManifestField: (
    jsonText: string,
    field: "gitHead" | "version"
) => string;
