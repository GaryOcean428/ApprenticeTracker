#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { logger } from '../lib/logger';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

interface ConfigValidation {
  name: string;
  files: string[];
  validate: (configs: unknown[]) => string[];
}

const validations: ConfigValidation[] = [
  {
    name: 'ESLint',
    files: ['.eslintrc.json'],
    validate: (configs) => {
      const [mainConfig] = configs;
      const errors: string[] = [];

      // Required plugins
      const requiredPlugins = ['@typescript-eslint', 'react', 'jsx-a11y'];
      requiredPlugins.forEach((plugin) => {
        if (!mainConfig.plugins?.includes(plugin)) {
          errors.push(`Missing required ESLint plugin: ${plugin}`);
        }
      });

      // Required extends
      const requiredExtends = [
        'plugin:@typescript-eslint/recommended',
        'plugin:react/recommended',
        'plugin:jsx-a11y/recommended',
      ];
      requiredExtends.forEach((extend) => {
        if (!mainConfig.extends?.includes(extend)) {
          errors.push(`Missing required ESLint extend: ${extend}`);
        }
      });

      return errors;
    },
  },
  {
    name: 'TypeScript',
    files: ['tsconfig.json'],
    validate: (configs) => {
      const [mainConfig] = configs;
      const errors: string[] = [];

      // Required compiler options
      const requiredConfigs = {
        strict: true,
        noImplicitAny: true,
        noUnusedLocals: true,
        noUnusedParameters: true,
      };

      Object.entries(requiredConfigs).forEach(([key, value]) => {
        if (mainConfig.compilerOptions?.[key] !== value) {
          errors.push(`TypeScript config must have ${key} set to ${value}`);
        }
      });

      return errors;
    },
  },
];

function loadConfig(filePath: string): unknown {
  try {
    const configContent = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(configContent);
  } catch (error) {
    logger.error(`Error loading config from ${filePath}`, new Error(String(error)));
    process.exit(1);
  }
}

function validateConfigs(): boolean {
  let hasErrors = false;

  validations.forEach((validation) => {
    logger.info(`Validating ${validation.name} configuration...`);

    const configs = validation.files.map((file) => loadConfig(path.join(rootDir, file)));
    const errors = validation.validate(configs);

    if (errors.length > 0) {
      hasErrors = true;
      logger.error(`${validation.name} validation errors:`, { errors });
    } else {
      logger.info(`${validation.name} validation passed`);
    }
  });

  if (typeof hasErrors !== "undefined" && hasErrors !== null) {
    logger.error('Configuration validation failed');
    process.exit(1);
  } else {
    logger.info('All configurations are valid');
  }

  return !hasErrors;
}

validateConfigs();
