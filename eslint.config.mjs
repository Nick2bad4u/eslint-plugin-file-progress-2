// @ts-check

import { defineConfig } from "@eslint/config-helpers";

import { dataFormatConfigs } from "./eslint/config/data-formats.mjs";
import { foundationConfigs } from "./eslint/config/foundation.mjs";
import { jsToolingConfigs } from "./eslint/config/js-tooling.mjs";
import { overrideConfigs } from "./eslint/config/overrides.mjs";
import { eslintConfigPrettier } from "./eslint/config/shared.mjs";
import { sourceConfigs } from "./eslint/config/source.mjs";
import { testConfigs } from "./eslint/config/tests.mjs";

export default defineConfig([
    ...foundationConfigs,
    ...sourceConfigs,
    ...testConfigs,
    ...dataFormatConfigs,
    ...jsToolingConfigs,
    ...overrideConfigs,
    eslintConfigPrettier,
]);
