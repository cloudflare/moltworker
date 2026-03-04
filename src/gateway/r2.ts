import type { Sandbox } from '@cloudflare/sandbox';
import type { MoltbotEnv } from '../types';
import { getR2BucketName } from '../config';

const RCLONE_CONF_PATH = '/root/.config/rclone/rclone.conf';
const CONFIGURED_FLAG = '/tmp/.rclone-configured';

/**
 * Check if R2_BUCKET_NAME is explicitly configured in the environment.
 */
export function isBucketNameConfigured(env: MoltbotEnv): boolean {
  return !!env.R2_BUCKET_NAME;
}

/**
 * Ensure rclone is configured in the container for R2 access.
 * Idempotent — checks for a flag file to skip re-configuration.
 *
 * @returns true if rclone is configured, false if credentials are missing
 */
export async function ensureRcloneConfig(sandbox: Sandbox, env: MoltbotEnv): Promise<boolean> {
  if (!env.R2_ACCESS_KEY_ID || !env.R2_SECRET_ACCESS_KEY || !env.CF_ACCOUNT_ID) {
    console.log(
      'R2 storage not configured (missing R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, or CF_ACCOUNT_ID)',
    );
    return false;
  }

  const check = await sandbox.exec(`test -f ${CONFIGURED_FLAG} && echo yes || echo no`);
  if (check.stdout?.trim() === 'yes') {
    return true;
  }

  const bucketConfigured = isBucketNameConfigured(env);
  const configLines = [
    '[r2]',
    'type = s3',
    'provider = Cloudflare',
    `access_key_id = ${env.R2_ACCESS_KEY_ID}`,
    `secret_access_key = ${env.R2_SECRET_ACCESS_KEY}`,
    `endpoint = https://${env.CF_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  ];

  if (bucketConfigured) {
    configLines.push(`bucket = ${getR2BucketName(env)}`);
  } else {
    // Fallback: use no_check_bucket flag if bucket name not configured
    configLines.push('no_check_bucket = true');
  }

  configLines.push('acl = private');

  const rcloneConfig = configLines.join('\n');

  await sandbox.exec(`mkdir -p $(dirname ${RCLONE_CONF_PATH})`);
  await sandbox.writeFile(RCLONE_CONF_PATH, rcloneConfig);
  await sandbox.exec(`touch ${CONFIGURED_FLAG}`);

  const bucketStatus = bucketConfigured ? getR2BucketName(env) : 'default (using no_check_bucket)';
  console.log('Rclone configured for R2 bucket:', bucketStatus);
  return true;
}
