import React, { useState, useEffect, createContext, useContext } from 'react';

declare global {
  interface Window {
    aistudio?: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

const ApiKeyContext = createContext<string | null>(null);

export function useApiKey() {
  return useContext(ApiKeyContext);
}

export function ApiKeyGate({ children }: { children: React.ReactNode }) {
  const [hasKey, setHasKey] = useState<boolean | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [inputKey, setInputKey] = useState('');

  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio) {
        const selected = await window.aistudio.hasSelectedApiKey();
        setHasKey(selected);
        if (selected) setApiKey('aistudio');
      } else {
        const savedKey = localStorage.getItem('gemini_api_key');
        if (savedKey) {
          setApiKey(savedKey);
          setHasKey(true);
        } else {
          setHasKey(false);
        }
      }
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    if (window.aistudio) {
      try {
        await window.aistudio.openSelectKey();
        setHasKey(true);
        setApiKey('aistudio');
      } catch (e: any) {
        console.error(e);
        if (e?.message?.includes('Requested entity was not found.')) {
          setHasKey(false);
        }
      }
    }
  };

  const handleSubmitKey = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputKey.trim();
    if (trimmed) {
      localStorage.setItem('gemini_api_key', trimmed);
      setApiKey(trimmed);
      setHasKey(true);
    }
  };

  if (hasKey === null) {
    return (
      <div className="system-main narrow">
        <section className="section fade-in visible" aria-busy="true">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--text-secondary)' }}>
            <span className="spinner" />
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.78rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Connecting to Gemini…
            </span>
          </div>
        </section>
      </div>
    );
  }

  if (!hasKey) {
    return (
      <div className="system-main narrow">
        <section className="section fade-in visible">
          <h2>API Key</h2>
          {window.aistudio ? (
            <>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
                Atelier Image runs on <strong style={{ color: 'var(--text-primary)' }}>Gemini 3.1 Flash Image Preview</strong>,
                which requires a paid Google Cloud project key. Select an existing key to continue.
              </p>
              <button onClick={handleSelectKey} className="btn btn-primary btn-block">
                Select API key
              </button>
            </>
          ) : (
            <>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
                Paste a Gemini API key to begin. Get one from{' '}
                <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer">Google AI Studio</a>.
                The key is stored only in this browser&apos;s localStorage and sent directly to Google.
              </p>
              <form onSubmit={handleSubmitKey} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="form-group">
                  <label htmlFor="api-key-input" className="form-label">Gemini API key</label>
                  <input
                    id="api-key-input"
                    type="password"
                    value={inputKey}
                    onChange={(e) => setInputKey(e.target.value)}
                    placeholder="AIza…"
                    className="form-input"
                    autoComplete="off"
                    spellCheck={false}
                  />
                </div>
                <button type="submit" disabled={!inputKey.trim()} className="btn btn-primary btn-block">
                  Save &amp; continue
                </button>
              </form>
            </>
          )}
          <div
            style={{
              marginTop: 24,
              paddingTop: 20,
              borderTop: '1px solid var(--border)',
              display: 'flex',
              gap: 18,
              flexWrap: 'wrap',
            }}
          >
            <a
              href="https://ai.google.dev/gemini-api/docs/billing"
              target="_blank"
              rel="noreferrer"
              style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}
            >
              Billing
            </a>
            <a
              href="https://aistudio.google.com/apikey"
              target="_blank"
              rel="noreferrer"
              style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}
            >
              Get a key
            </a>
          </div>
        </section>
      </div>
    );
  }

  return <ApiKeyContext.Provider value={apiKey}>{children}</ApiKeyContext.Provider>;
}
