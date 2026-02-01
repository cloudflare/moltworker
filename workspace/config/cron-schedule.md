# Jig Automation Schedule

All times are in UTC. Mountain Time (MT) equivalents shown for reference.

```cron
# ┌───────────── minute (0-59)
# │ ┌───────────── hour (0-23)
# │ │ ┌───────────── day of month (1-31)
# │ │ │ ┌───────────── month (1-12)
# │ │ │ │ ┌───────────── day of week (0-6, Sunday=0)
# │ │ │ │ │
# │ │ │ │ │
  0 6 * * * remote-state-sync      # 23:00 MT → post to #remote-state
  5 7 * * * gitmap-nightly         # 00:05 MT → post to #gitmap
 10 7 * * * knowflow-nightly       # 00:10 MT → post to #knowflow
  0 11 * * * daily-channel-recap   # 04:00 MT → post to #max_jig
  0 16 * * * skill-evolution       # 09:00 MT → post to #skill-evolution
  0 17 * * * memory-curation       # 10:00 MT → post to #max_jig
```

## Job Descriptions

| Job | Time (MT) | Spec | Output Channel |
|-----|-----------|------|----------------|
| remote-state-sync | 23:00 | remote-state.md | #remote-state |
| gitmap-nightly | 00:05 | gitmap-nightly.md | #gitmap |
| knowflow-nightly | 00:10 | knowflow-nightly.md | #knowflow |
| daily-channel-recap | 04:00 | daily-channel-recap.md | #max_jig |
| skill-evolution | 09:00 | nightly-skill-evolution.md | #skill-evolution |
| memory-curation | 10:00 | (internal) | #max_jig |

## Notes

- All jobs run daily
- Jobs are staggered to avoid resource contention
- If a job fails, it should report the failure to its designated channel
- Jobs should complete within their allocated time window before the next job starts
