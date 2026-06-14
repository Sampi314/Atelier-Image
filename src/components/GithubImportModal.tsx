import React, { useEffect, useState } from 'react';
import { Github, X, Download } from 'lucide-react';

export function GithubImportModal({
  isOpen,
  onClose,
  onImport,
}: {
  isOpen: boolean;
  onClose: () => void;
  onImport: (files: { title: string; content: string }[]) => void;
}) {
  const [url, setUrl] = useState('');
  const [owner, setOwner] = useState('');
  const [repo, setRepo] = useState('');
  const [branch, setBranch] = useState('');
  const [path, setPath] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  const handleUrlPaste = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pastedUrl = e.target.value;
    setUrl(pastedUrl);
    try {
      const urlObj = new URL(pastedUrl);
      const parts = urlObj.pathname.split('/').filter(Boolean);
      if (parts.length >= 5 && parts[2] === 'tree') {
        setOwner(parts[0]);
        setRepo(parts[1]);
        let branchName = parts[3];
        let pathIndex = 4;
        if (parts.length > 5 && ['feature', 'bugfix', 'hotfix', 'release'].includes(parts[3])) {
          branchName = parts[3] + '/' + parts[4];
          pathIndex = 5;
        }
        setBranch(branchName);
        setPath(decodeURIComponent(parts.slice(pathIndex).join('/')));
      }
    } catch {
      /* ignore parse errors */
    }
  };

  const handleImport = async () => {
    setLoading(true);
    setError('');
    try {
      const encodedPath = path.split('/').map(p => encodeURIComponent(p)).join('/');
      const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${encodedPath}?ref=${branch}`;
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`GitHub API Error: ${response.statusText} (${response.status})`);
      }
      const files = await response.json();
      if (!Array.isArray(files)) {
        throw new Error('Path is not a directory');
      }
      const mdFiles = files.filter((f: any) => f.name.endsWith('.md') && f.type === 'file');
      if (mdFiles.length === 0) {
        throw new Error('No .md files found in this directory');
      }
      const results: { title: string; content: string }[] = [];
      for (const file of mdFiles) {
        const fileRes = await fetch(file.download_url);
        if (fileRes.ok) {
          const content = await fileRes.text();
          results.push({ title: file.name.replace(/\.md$/, ''), content });
        }
      }
      onImport(results);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to import files');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-label="Import from GitHub">
      <div className="modal-panel" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
        <header className="modal-header">
          <h3>
            <Github size={16} /> Import from GitHub
          </h3>
          <button type="button" onClick={onClose} className="modal-close" aria-label="Close">
            <X size={18} />
          </button>
        </header>

        <div className="modal-body">
          <div className="form-group">
            <label className="form-label" htmlFor="gh-url">Folder URL</label>
            <input
              id="gh-url"
              type="text"
              value={url}
              onChange={handleUrlPaste}
              placeholder="https://github.com/owner/repo/tree/branch/path"
              className="form-input"
              autoComplete="off"
              spellCheck={false}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label" htmlFor="gh-owner">Owner</label>
              <input
                id="gh-owner"
                type="text"
                value={owner}
                onChange={e => setOwner(e.target.value)}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="gh-repo">Repo</label>
              <input
                id="gh-repo"
                type="text"
                value={repo}
                onChange={e => setRepo(e.target.value)}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="gh-branch">Branch</label>
              <input
                id="gh-branch"
                type="text"
                value={branch}
                onChange={e => setBranch(e.target.value)}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="gh-path">Path</label>
              <input
                id="gh-path"
                type="text"
                value={path}
                onChange={e => setPath(e.target.value)}
                className="form-input"
              />
            </div>
          </div>

          {error && (
            <div
              style={{
                background: 'var(--danger-bg)',
                color: 'var(--danger)',
                border: '1px solid var(--danger)',
                borderRadius: 2,
                padding: '10px 14px',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.78rem',
              }}
              role="alert"
            >
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={handleImport}
            disabled={loading || !owner || !repo || !branch || !path}
            className="btn btn-primary btn-block"
          >
            {loading ? <span className="spinner" /> : <Download size={14} />}
            {loading ? 'Importing…' : 'Import .md files'}
          </button>
        </div>
      </div>
    </div>
  );
}
