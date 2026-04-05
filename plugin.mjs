import builtPlugin from "./dist/index.js";

/** @type {import("eslint").ESLint.Plugin} */
const plugin = {
    ...builtPlugin,
};

export default plugin;
