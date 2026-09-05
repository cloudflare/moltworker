import { useCallback, useEffect, useState } from 'react';
import {
  AuthError,
  getSessionModel,
  getUsageSnapshot,
  listAdminModels,
  setSessionModel,
  type AdminModelRecord,
  type SessionModelResponse,
  type UsageSnapshotResponse,
} from '../api';

function formatReset(iso: string | null) {
  if (!iso) return 'n/a';
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export default function ModelUsagePanel() {
  const [models, setModels] = useState<AdminModelRecord[]>([]);
  const [session, setSession] = useState<SessionModelResponse | null>(null);
  const [usage, setUsage] = useState<UsageSnapshotResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      setError(null);
      const [modelList, sessionModel, usageSnapshot] = await Promise.all([
        listAdminModels(),
        getSessionModel(),
        getUsageSnapshot(),
      ]);
      setModels(modelList.data);
      setSession(sessionModel);
      setUsage(usageSnapshot);
    } catch (err) {
      if (err instanceof AuthError) {
        setError('Authentication required. Please log in via Cloudflare Access.');
      } else {
        setError(err instanceof Error ? err.message : 'Failed to load model usage');
      }
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSelect = async (model: string) => {
    setSaving(true);
    try {
      const next = await setSessionModel(model);
      setSession(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update session model');
    } finally {
      setSaving(false);
    }
  };

  const limited = usage?.windows.some((window) => window.state === 'limited');
  const near = usage?.windows.some((window) => window.state === 'near');

  return (
    <section className="devices-section">
      <div className="section-header">
        <h2>Models and usage</h2>
        <button className="btn btn-secondary" onClick={() => void load()} disabled={saving}>
          Refresh
        </button>
      </div>
      {error && <p className="hint">{error}</p>}
      {limited && (
        <div className="error-banner">
          <span>Rate or spend limit reached. Automatic fallback is disabled. Retry the same model later.</span>
        </div>
      )}
      {!limited && near && (
        <div className="warning-banner">
          <div className="warning-content">
            <strong>Approaching budget</strong>
            <p>A 24h or 30d window is at or above 80% of its configured cap.</p>
          </div>
        </div>
      )}
      <p className="hint">
        Selected session model: {session?.model ?? 'loading'} ({session?.source ?? 'n/a'}). Manual-only
        models are never chosen automatically.
      </p>
      <div className="devices-grid">
        {models.map((model) => (
          <div key={model.id} className={`device-card ${model.primary ? 'paired' : 'pending'}`}>
            <div className="device-header">
              <span className="device-name">{model.name}</span>
              <span className={`device-badge ${model.primary ? 'paired' : 'pending'}`}>
                {model.primary ? 'Primary' : 'Manual only'}
              </span>
            </div>
            <div className="device-details">
              <div className="detail-row">
                <span className="label">ID</span>
                <span className="value">{model.id}</span>
              </div>
              <div className="detail-row">
                <span className="label">Context</span>
                <span className="value">{model.context_window.toLocaleString()}</span>
              </div>
              <div className="detail-row">
                <span className="label">Tools</span>
                <span className="value">{model.supports_tools ? 'yes' : 'no'}</span>
              </div>
            </div>
            <div className="device-actions">
              <button
                className="btn btn-primary"
                disabled={saving || session?.model === model.id}
                onClick={() => void handleSelect(model.id)}
              >
                {session?.model === model.id ? 'Selected' : 'Use this model'}
              </button>
            </div>
          </div>
        ))}
      </div>
      {usage && (
        <div className="device-details" style={{ marginTop: '1rem' }}>
          <p className="hint">{usage.message}</p>
          {usage.windows.map((window) => (
            <div key={window.window} className="detail-row">
              <span className="label">{window.window}</span>
              <span className="value">
                state={window.state}; cost {window.usedCostUsd ?? '—'}/{window.limitCostUsd ?? '—'} USD;
                tokens {window.usedTokens ?? '—'}/{window.limitTokens ?? '—'}; reset{' '}
                {formatReset(window.resetAt)}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
