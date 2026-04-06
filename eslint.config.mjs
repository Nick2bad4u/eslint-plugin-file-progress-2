// @ts-check

import { defineConfig } from "@eslint/config-helpers";

import { dataFormatConfigs } from "./scripts/eslint/config/data-formats.mjs";
import { foundationConfigs } from "./scripts/eslint/config/foundation.mjs";
import { jsToolingConfigs } from "./scripts/eslint/config/js-tooling.mjs";
import { overrideConfigs } from "./scripts/eslint/config/overrides.mjs";
import { eslintConfigPrettier } from "./scripts/eslint/config/shared.mjs";
import { sourceConfigs } from "./scripts/eslint/config/source.mjs";
import { testConfigs } from "./scripts/eslint/config/tests.mjs";

export default defineConfig([
    ...foundationConfigs,
    ...sourceConfigs,
    ...testConfigs,
    ...dataFormatConfigs,
    ...jsToolingConfigs,
    ...overrideConfigs,
    eslintConfigPrettier,
]);
