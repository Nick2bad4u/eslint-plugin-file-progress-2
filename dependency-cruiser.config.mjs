/** @type {import("dependency-cruiser").IConfiguration} */
const dependencyCruiserConfiguration = {
    forbidden: [
        {
            comment:
                "Keep production source modules free of dependency cycles.",
            from: {},
            name: "no-circular",
            severity: "error",
            to: {
                circular: true,
            },
        },
    ],
    options: {
        doNotFollow: {
            path: "node_modules",
        },
        exclude: {
            path: String.raw`(^|/)(?:dist|node_modules|cache|\.cache|coverage|build|eslint-inspector|temp|\.docusaurus)(?:/|$)|\.css$`,
        },
        tsConfig: {
            fileName: "tsconfig.json",
        },
    },
};

export default dependencyCruiserConfiguration;
