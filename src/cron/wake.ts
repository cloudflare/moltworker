import { Cron } from 'croner';

/**
 * Cron job schedule types matching OpenClaw's CronSchedule type.
 */
type CronSchedule =
  | { kind: 'at'; atMs: number }
  | { kind: 'every'; everyMs: number; anchorMs?: number }
  | { kind: 'cron'; expr: string; tz?: string };

/**
 * Minimal cron job shape we need from OpenClaw's jobs.json
 */
interface CronJob {
  id: string;
  enabled: boolean;
  schedule: CronSchedule;
  state: {
    nextRunAtMs?: number;
    runningAtMs?: number;
  };
}

interface CronStoreFile {
  version: 1;
  jobs: CronJob[];
}

/**
 * Compute the next run time for a given schedule (mirrors OpenClaw's computeNextRunAtMs).
 */
function computeNextRunAtMs(schedule: CronSchedule, nowMs: number): number | undefined {
  if (schedule.kind === 'at') {
    return schedule.atMs > nowMs ? schedule.atMs : undefined;
  }

  if (schedule.kind === 'every') {
    const everyMs = Math.max(1, Math.floor(schedule.everyMs));
    const anchor = Math.max(0, Math.floor(schedule.anchorMs ?? nowMs));
    if (nowMs < anchor) return anchor;
    const elapsed = nowMs - anchor;
    const steps = Math.max(1, Math.floor((elapsed + everyMs - 1) / everyMs));
    return anchor + steps * everyMs;
  }

  // kind === 'cron'
  const expr = schedule.expr.trim();
  if (!expr) return undefined;
  const cron = new Cron(expr, {
    timezone: schedule.tz?.trim() || undefined,
  });
  const next = cron.nextRun(new Date(nowMs));
  return next ? next.getTime() : undefined;
}

/**
 * Parse the cron store JSON from R2 and return enabled jobs with their next run times.
 */
function parseEnabledJobs(raw: string): CronJob[] {
  const parsed = JSON.parse(raw) as Partial<CronStoreFile>;
  const jobs = Array.isArray(parsed?.jobs) ? parsed.jobs : [];
  return jobs.filter((j): j is CronJob => j != null && j.enabled === true);
}

/**
 * Determine whether the container should be woken up because an OpenClaw cron
 * job is scheduled to fire within `leadTimeMs` from now.
 *
 * Returns the earliest upcoming run time if a wake is needed, or null otherwise.
 */
export function shouldWakeContainer(
  cronStoreJson: string,
  nowMs: number,
  leadTimeMs: number,
): number | null {
  const jobs = parseEnabledJobs(cronStoreJson);
  let earliest: number | null = null;

  for (const job of jobs) {
    // Skip jobs that are currently running
    if (typeof job.state.runningAtMs === 'number') continue;

    // Use stored nextRunAtMs if available, otherwise compute it
    let nextRun = job.state.nextRunAtMs;
    if (typeof nextRun !== 'number') {
      nextRun = computeNextRunAtMs(job.schedule, nowMs);
    }
    if (typeof nextRun !== 'number') continue;

    // Check if this job fires within the lead time window
    if (nextRun > nowMs && nextRun <= nowMs + leadTimeMs) {
      if (earliest === null || nextRun < earliest) {
        earliest = nextRun;
      }
    }
  }

  return earliest;
}

/** Default lead time: 10 minutes */
export const DEFAULT_LEAD_TIME_MS = 10 * 60 * 1000;

/** R2 key where the cron store is synced */
export const CRON_STORE_R2_KEY = 'openclaw/cron/jobs.json';
