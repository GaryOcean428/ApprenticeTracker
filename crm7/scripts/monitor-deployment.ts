#!/usr/bin/env node

import axios from 'axios';
import chalk from 'chalk';
import { program } from 'commander';
import ora from 'ora';
import { z } from 'zod';

import logger from './logger';

const VERCEL_API = 'https://api.vercel.com/v1';
const DEPLOYMENT_HOOK = 'prj_ZcvIEwYIBFQBfbJafOjGuc2THSbA/MRewLE6RLO';

const EnvSchema = z.object({
  VERCEL_TOKEN: z.string().min(1),
});

const DeploymentResponseSchema = z.object({
  job: z.object({
    id: z.string(),
    state: z.string(),
    createdAt: z.number(),
  }),
});

const DeploymentStatusSchema = z.object({
  id: z.string(),
  url: z.string().optional(),
  name: z.string(),
  state: z.string(),
  type: z.string(),
  created: z.number(),
  ready: z.number().optional(),
  error: z
    .object({
      code: z.string(),
      message: z.string(),
    })
    .optional(),
});

interface DeploymentOptions {
  token?: string;
  timeout?: number;
  interval?: number;
}

async function triggerDeployment() {
  const spinner = ora('Triggering deployment...').start();

  try {
    const response = await axios.post(`${VERCEL_API}/integrations/deploy/${DEPLOYMENT_HOOK}`);
    const data = DeploymentResponseSchema.parse(response.data);
    spinner.succeed('Deployment triggered successfully');
    logger.info('Deployment triggered successfully', { jobId: data.job.id });
    return data.job.id;
  } catch (error) {
    spinner.fail('Failed to trigger deployment');
    if (axios.isAxiosError(error)) {
      logger.error('Failed to trigger deployment', {
        message: error.response?.data?.message || error.message,
        status: error.response?.status,
        url: error.config?.url,
      });
    } else if (error instanceof Error) {
      logger.error('Failed to trigger deployment', { message: error.message });
    } else {
      logger.error('Failed to trigger deployment', { message: String(error) });
    }
    process.exit(1);
  }
}

async function monitorDeployment(jobId: string, options: DeploymentOptions) {
  const { token, timeout = 300, interval = 10 } = options;
  const maxAttempts = Math.floor(timeout / interval);
  let attempt = 0;

  if (typeof token !== "undefined" && token !== null) {
    try {
      EnvSchema.parse({ VERCEL_TOKEN: token });
    } catch (error) {
      logger.error('Invalid Vercel token', {
        error: error instanceof Error ? error.message : String(error),
      });
      process.exit(1);
    }
  }

  const spinner = ora('Monitoring deployment status...').start();

  while (attempt < maxAttempts) {
    try {
      const response = await axios.get(
        `${VERCEL_API}/deployments/${jobId}`,
        token
          ? { headers: { Authorization: `Bearer ${token}` } }
          : undefined
      );
      const deployment = DeploymentStatusSchema.parse(response.data);

      switch (deployment.state) {
        case 'READY':
          spinner.succeed(chalk.green('Deployment successful 🚀'));
          logger.info('Deployment completed successfully', {
            url: deployment.url,
            id: deployment.id,
            created: new Date(deployment.created).toLocaleString(),
            ready: deployment.ready ? new Date(deployment.ready).toLocaleString() : 'N/A',
          });
          return;
        case 'ERROR':
          spinner.fail(chalk.red('Deployment failed ❌'));
          logger.error('Deployment failed', {
            error: deployment.error?.message,
            code: deployment.error?.code,
          });
          process.exit(1);
        case 'PENDING':
          await handlePendingDeployment(deployment);
          break;
        case 'IN_PROGRESS':
          await handleInProgressDeployment(deployment);
          break;
        case 'COMPLETED':
          await handleCompletedDeployment(deployment);
          break;
        case 'FAILED':
          await handleFailedDeployment(deployment);
          break;
        default:
          logger.warn(`Unknown deployment status: ${deployment.state}`);
          break;
      }
    } catch (error) {
      spinner.fail('Failed to check deployment status');
      if (axios.isAxiosError(error)) {
        logger.error('Error monitoring deployment', {
          message: error.response?.data?.message || error.message,
          status: error.response?.status,
          url: error.config?.url,
        });
      } else if (error instanceof Error) {
        logger.error('Error monitoring deployment', { message: error.message });
      } else {
        logger.error('Error monitoring deployment', { message: String(error) });
      }
      process.exit(1);
    }
    attempt++;
    await new Promise(resolve => setTimeout(resolve, interval * 1000));
  }

  spinner.fail(chalk.yellow(`Deployment monitoring timed out after ${timeout} seconds`));
  logger.error('Deployment monitoring timed out', { timeout });
  process.exit(1);
}

program.name('monitor-deployment').description('Monitor Vercel deployments').version('1.0.0');

program
  .command('trigger')
  .description('Trigger a new deployment')
  .action(async () => {
    const jobId = await triggerDeployment();
    logger.info('Deployment triggered', { jobId });
  });

program
  .command('monitor')
  .description('Monitor an existing deployment')
  .argument('<jobId>', 'Deployment job ID')
  .option('-t, --token <token>', 'Vercel API token')
  .option('--timeout <seconds>', 'Monitoring timeout in seconds', '300')
  .option('--interval <seconds>', 'Check interval in seconds', '10')
  .action(async (jobId, options) => {
    await monitorDeployment(jobId, {
      token: options.token,
      timeout: parseInt(options.timeout),
      interval: parseInt(options.interval),
    });
  });

program
  .command('deploy')
  .description('Trigger and monitor a deployment')
  .option('-t, --token <token>', 'Vercel API token')
  .option('--timeout <seconds>', 'Monitoring timeout in seconds', '300')
  .option('--interval <seconds>', 'Check interval in seconds', '10')
  .action(async (options) => {
    const jobId = await triggerDeployment();
    logger.info('Deployment triggered', { jobId });
    await monitorDeployment(jobId, {
      token: options.token,
      timeout: parseInt(options.timeout),
      interval: parseInt(options.interval),
    });
  });

program.parse();
