#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { z } from 'zod';

import { logger } from './logger';

const ESLintConfigSchema = z.object({
  plugins: z.array(z.string()).optional(),
  extends: z.array(z.string()).optional(),
  rules: z.record(z.unknown()).optional(),
});

async function validateESLintConfig() {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    const configPath = join(process.cwd(), '.eslintrc.json');
    const configContent = readFileSync(configPath, 'utf-8');
    const mainConfig = ESLintConfigSchema.parse(JSON.parse(configContent));

    // Validate required plugins
    const requiredPlugins = ['@typescript-eslint', 'react', 'jsx-a11y'];
    requiredPlugins.forEach((plugin) => {
      if (!mainConfig.plugins?.includes(plugin)) {
        errors.push(`Missing required ESLint plugin: ${plugin}`);
      }
    });

    // Validate required extends
    const requiredExtends = [
      'plugin:@typescript-eslint/recommended',
      'plugin:react/recommended',
      'plugin:jsx-a11y/recommended',
    ];
    requiredExtends.forEach((extend) => {
      if (!mainConfig.extends?.includes(extend)) {
        warnings.push(`Missing recommended ESLint extension: ${extend}`);
      }
    });

    // Validate critical rules
    const criticalRules = {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/explicit-function-return-type': 'error',
      'react/prop-types': 'error',
    };

    Object.entries(criticalRules).forEach(([rule, expectedLevel]) => {
      const currentLevel = mainConfig.rules?.[rule];
      if (!currentLevel) {
        errors.push(`Missing critical ESLint rule: ${rule}`);
      } else if (currentLevel !== expectedLevel) {
        warnings.push(
          `Rule ${rule} has level "${currentLevel}" but "${expectedLevel}" is recommended`
        );
      }
    });

    return { errors, warnings };
  } catch (error) {
    if (error instanceof Error) {
      logger.error('Failed to validate ESLint config', { error: error.message });
    } else {
      logger.error('Failed to validate ESLint config', { error: String(error) });
    }
    process.exit(1);
  }
}

async function main() {
  try {
    const { errors, warnings } = await validateESLintConfig();

    if (errors.length > 0) {
      logger.error('ESLint configuration validation failed', { errors });
      process.exit(1);
    }

    if (warnings.length > 0) {
      logger.warn('ESLint configuration has warnings', { warnings });
    }

    logger.info('ESLint configuration validation passed');
  } catch (error) {
    if (error instanceof Error) {
      logger.error('Validation failed', { error: error.message });
    } else {
      logger.error('Validation failed', { error: String(error) });
    }
    process.exit(1);
  }
}

main().catch((error) => {
  logger.error('Unhandled error', { error: error instanceof Error ? error.message : String(error) });
  process.exit(1);
});
