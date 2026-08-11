/** Resolve the single package filename from parsed `npm pack --json` output. */
export declare const resolveNpmPackFilename: (packOutput: unknown) => string;

/** Parse `npm pack --json` output and resolve its single package filename. */
export declare const parseNpmPackFilename: (jsonText: string) => string;
