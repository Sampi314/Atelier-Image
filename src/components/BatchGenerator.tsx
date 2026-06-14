import React, { useState } from 'react';
import {
  Plus, Trash2, ChevronDown, ChevronUp, Image as ImageIcon, Play, AlertCircle,
  X, Download, Github, Maximize2, Archive, Wand2,
} from 'lucide-react';
import { enhancePrompt, generateImage } from '../services/geminiService';
import { useApiKey } from './ApiKeyGate';
import { GithubImportModal } from './GithubImportModal';
import { ImageModal } from './ImageModal';
import JSZip from 'jszip';

export type PromptItemType = {
  id: string;
  title: string;
  originalPrompt: string;
  enhancedPrompt: string;
  referenceImages: { id: string; data: string; mimeType: string; url: string }[];
  status: 'idle' | 'enhancing' | 'generating' | 'success' | 'error';
  resultImageUrl?: string;
  error?: string;
  isExpanded: boolean;
};

export type StoredImage = {
  id: string;
  title: string;
  prompt: string;
  imageUrl: string;
  createdAt: number;
};

const SUGGESTED_STYLES = [
  'Cinematic', 'Photorealistic', 'Anime', 'Watercolor',
  'Cyberpunk', 'Oil Painting', '3D Render', 'Pencil Sketch',
  'Studio Lighting', 'Vintage', 'Neon Noir', 'Fantasy Art',
];

export function BatchGenerator() {
  const apiKey = useApiKey();
  const [items, setItems] = useState<PromptItemType[]>([
    {
      id: crypto.randomUUID(),
      title: 'Prompt 1',
      originalPrompt: '',
      enhancedPrompt: '',
      referenceImages: [],
      status: 'idle',
      isExpanded: true,
    },
  ]);
  const [isBatchGenerating, setIsBatchGenerating] = useState(false);
  const [isGithubModalOpen, setIsGithubModalOpen] = useState(false);
  const [globalSelectedStyles, setGlobalSelectedStyles] = useState<string[]>([]);
  const [isGlobalStylesExpanded, setIsGlobalStylesExpanded] = useState(true);
  const [selectedImage, setSelectedImage] = useState<{ url: string; title: string } | null>(null);
  const [storedImages, setStoredImages] = useState<StoredImage[]>([]);
  const [activeTab, setActiveTab] = useState<'batch' | 'storage'>('batch');
  const [availableStyles, setAvailableStyles] = useState<string[]>(SUGGESTED_STYLES);
  const [newStyleInput, setNewStyleInput] = useState('');

  const handleAddStyle = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newStyleInput.trim();
    if (trimmed && !availableStyles.includes(trimmed)) {
      setAvailableStyles(prev => [...prev, trimmed]);
      setGlobalSelectedStyles(prev => [...prev, trimmed]);
      setNewStyleInput('');
      setItems(prev => prev.map(item => ({ ...item, enhancedPrompt: '' })));
    }
  };

  const removeStyle = (e: React.MouseEvent, styleToRemove: string) => {
    e.stopPropagation();
    setAvailableStyles(prev => prev.filter(s => s !== styleToRemove));
    setGlobalSelectedStyles(prev => prev.filter(s => s !== styleToRemove));
    setItems(prev => prev.map(item => ({ ...item, enhancedPrompt: '' })));
  };

  const addItem = () => {
    setItems(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        title: `Prompt ${prev.length + 1}`,
        originalPrompt: '',
        enhancedPrompt: '',
        referenceImages: [],
        status: 'idle',
        isExpanded: true,
      },
    ]);
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const updateItem = (id: string, updates: Partial<PromptItemType>) => {
    setItems(prev => prev.map(item => (item.id === id ? { ...item, ...updates } : item)));
  };

  const toggleExpand = (id: string) => {
    setItems(prev => prev.map(item => (item.id === id ? { ...item, isExpanded: !item.isExpanded } : item)));
  };

  const toggleStyle = (style: string) => {
    setGlobalSelectedStyles(prev =>
      prev.includes(style) ? prev.filter(s => s !== style) : [...prev, style],
    );
    setItems(prev => prev.map(item => ({ ...item, enhancedPrompt: '' })));
  };

  const handleImageUpload = (id: string, files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = e => {
        const dataUrl = e.target?.result as string;
        const [mimePrefix, base64Data] = dataUrl.split(',');
        const mimeType = mimePrefix.split(':')[1].split(';')[0];
        setItems(prev => prev.map(item => {
          if (item.id === id) {
            return {
              ...item,
              referenceImages: [
                ...item.referenceImages,
                { id: crypto.randomUUID(), data: base64Data, mimeType, url: dataUrl },
              ],
            };
          }
          return item;
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeReferenceImage = (itemId: string, imageId: string) => {
    setItems(prev => prev.map(item => {
      if (item.id === itemId) {
        return { ...item, referenceImages: item.referenceImages.filter(img => img.id !== imageId) };
      }
      return item;
    }));
  };

  const processItem = async (id: string) => {
    const item = items.find(i => i.id === id);
    if (!item) return;
    if (!item.originalPrompt.trim()) {
      updateItem(id, { error: 'Prompt cannot be empty', status: 'error' });
      return;
    }
    try {
      const combinedPrompt = `${item.originalPrompt}${
        globalSelectedStyles.length ? `\n\nStyles: ${globalSelectedStyles.join(', ')}` : ''
      }`;
      let finalPrompt = item.enhancedPrompt;
      if (!finalPrompt || item.status === 'error') {
        updateItem(id, { status: 'enhancing', error: undefined });
        finalPrompt = await enhancePrompt(combinedPrompt, apiKey);
        updateItem(id, { enhancedPrompt: finalPrompt });
      }
      updateItem(id, { status: 'generating', error: undefined });
      const imageUrl = await generateImage(finalPrompt, item.referenceImages, apiKey);
      updateItem(id, { status: 'success', resultImageUrl: imageUrl });
      setStoredImages(prev => [
        {
          id: crypto.randomUUID(),
          title: item.title,
          prompt: finalPrompt,
          imageUrl,
          createdAt: Date.now(),
        },
        ...prev,
      ]);
    } catch (error: any) {
      console.error(error);
      updateItem(id, { status: 'error', error: error.message || 'Failed to generate image' });
    }
  };

  const handleBatchGenerate = async () => {
    setIsBatchGenerating(true);
    const promises = items
      .filter(item => item.status === 'idle' || item.status === 'error' || (!item.resultImageUrl && item.status !== 'success'))
      .map(item => processItem(item.id));
    await Promise.all(promises);
    setIsBatchGenerating(false);
  };

  const downloadImage = (url: string, filename: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownloadAll = async () => {
    const zip = new JSZip();
    const folder = zip.folder('generated_images');
    if (!folder) return;
    const promises = items
      .filter(item => item.resultImageUrl)
      .map(async item => {
        if (!item.resultImageUrl) return;
        const response = await fetch(item.resultImageUrl);
        const blob = await response.blob();
        folder.file(`${item.title || 'generated'}.png`, blob);
      });
    await Promise.all(promises);
    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'atelier_batch.zip';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleGithubImport = (importedFiles: { title: string; content: string }[]) => {
    const newItems: PromptItemType[] = importedFiles.map(file => ({
      id: crypto.randomUUID(),
      title: file.title,
      originalPrompt: file.content,
      enhancedPrompt: '',
      referenceImages: [],
      status: 'idle',
      isExpanded: false,
    }));
    setItems(prev => {
      if (prev.length === 1 && !prev[0].originalPrompt && prev[0].title === 'Prompt 1') {
        return newItems;
      }
      return [...prev, ...newItems];
    });
  };

  const removeResultImage = (id: string) => {
    updateItem(id, { resultImageUrl: undefined, status: 'idle' });
  };

  const hasAnyResult = items.some(item => !!item.resultImageUrl);

  return (
    <div className="atelier-workspace">
      {/* Sidebar — prompt composition */}
      <aside className="atelier-sidebar">
        <div className="atelier-sidebar-header">
          <div>
            <h2 className="atelier-sidebar-title">Atelier</h2>
            <p className="atelier-sidebar-meta">Prompt queue · {items.length}</p>
          </div>
          <div className="atelier-action-row">
            <button
              type="button"
              onClick={() => setIsGithubModalOpen(true)}
              className="btn btn-ghost btn-sm"
              title="Import .md files from GitHub"
            >
              <Github size={14} /> Import
            </button>
            <button type="button" onClick={addItem} className="btn btn-ghost btn-sm">
              <Plus size={14} /> Add
            </button>
            <button
              type="button"
              onClick={handleBatchGenerate}
              disabled={isBatchGenerating || items.length === 0}
              className="btn btn-primary btn-sm"
            >
              {isBatchGenerating ? <span className="spinner" /> : <Play size={14} />}
              Run batch
            </button>
          </div>
        </div>

        <div className="atelier-sidebar-body atelier-scroll">
          {/* Global style anchors */}
          <div className="prompt-panel">
            <div
              className="prompt-panel-header"
              onClick={() => setIsGlobalStylesExpanded(v => !v)}
              role="button"
              tabIndex={0}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setIsGlobalStylesExpanded(v => !v); } }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Wand2 size={14} style={{ color: 'var(--accent)' }} />
                <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: '0.88rem', fontWeight: 600 }}>
                  Global style anchors
                </span>
                {globalSelectedStyles.length > 0 && (
                  <span className="tag-counter">{globalSelectedStyles.length}</span>
                )}
              </div>
              <span style={{ color: 'var(--text-muted)', display: 'inline-flex' }}>
                {isGlobalStylesExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </span>
            </div>
            {isGlobalStylesExpanded && (
              <div className="prompt-panel-body">
                <div className="form-group">
                  <label className="form-label">Style anchors</label>
                  <div className="style-anchor-list">
                    {availableStyles.map(style => {
                      const isSelected = globalSelectedStyles.includes(style);
                      return (
                        <span
                          key={style}
                          className={`style-anchor${isSelected ? ' active' : ''}`}
                          onClick={() => toggleStyle(style)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleStyle(style); } }}
                        >
                          {style}
                          <button
                            type="button"
                            onClick={e => removeStyle(e, style)}
                            aria-label={`Remove ${style}`}
                          >
                            <X size={10} />
                          </button>
                        </span>
                      );
                    })}
                  </div>
                </div>
                <form onSubmit={handleAddStyle} style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="text"
                    value={newStyleInput}
                    onChange={e => setNewStyleInput(e.target.value)}
                    placeholder="Add anchor (e.g. '8-bit')"
                    className="form-input"
                    style={{ flex: 1 }}
                  />
                  <button type="submit" disabled={!newStyleInput.trim()} className="btn btn-ghost btn-sm">
                    <Plus size={14} />
                  </button>
                </form>
              </div>
            )}
          </div>

          {items.map((item, index) => (
            <div key={item.id} className={`prompt-panel${item.isExpanded ? ' active' : ''}`}>
              <div
                className="prompt-panel-header"
                onClick={() => toggleExpand(item.id)}
                role="button"
                tabIndex={0}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleExpand(item.id); } }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                  <span className="prompt-panel-index">{String(index + 1).padStart(2, '0')}</span>
                  <input
                    type="text"
                    value={item.title}
                    onChange={e => updateItem(item.id, { title: e.target.value })}
                    onClick={e => e.stopPropagation()}
                    className="form-input-flush"
                    placeholder="Prompt title"
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <button
                    type="button"
                    onClick={e => { e.stopPropagation(); removeItem(item.id); }}
                    className="icon-btn icon-btn-danger"
                    aria-label="Remove prompt"
                  >
                    <Trash2 size={14} />
                  </button>
                  <span style={{ color: 'var(--text-muted)', display: 'inline-flex' }}>
                    {item.isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </span>
                </div>
              </div>

              {item.isExpanded && (
                <div className="prompt-panel-body">
                  <div className="form-group">
                    <label className="form-label">Base prompt</label>
                    <textarea
                      value={item.originalPrompt}
                      onChange={e => updateItem(item.id, { originalPrompt: e.target.value, enhancedPrompt: '' })}
                      placeholder="Describe the scene…"
                      className="form-textarea"
                      rows={4}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Reference images</label>
                    <div className="reference-grid">
                      {item.referenceImages.map(img => (
                        <div key={img.id} className="reference-thumb">
                          <img src={img.url} alt="Reference" />
                          <button
                            type="button"
                            className="reference-thumb-remove"
                            onClick={() => removeReferenceImage(item.id, img.id)}
                            aria-label="Remove reference"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                      <label className="reference-uploader">
                        <Plus size={16} />
                        <span>Upload</span>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={e => handleImageUpload(item.id, e.target.files)}
                        />
                      </label>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => processItem(item.id)}
                    disabled={item.status === 'enhancing' || item.status === 'generating'}
                    className="btn btn-ghost btn-block"
                  >
                    {item.status === 'enhancing' || item.status === 'generating' ? (
                      <>
                        <span className="spinner" />
                        {item.status === 'enhancing' ? 'Enhancing…' : 'Generating…'}
                      </>
                    ) : (
                      <>
                        <ImageIcon size={14} /> Generate
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          ))}

          {items.length === 0 && (
            <div className="empty-state">
              <ImageIcon size={28} style={{ opacity: 0.4 }} />
              <span className="label">Queue is empty</span>
              <span className="hint">Click <strong style={{ color: 'var(--text-primary)' }}>Add</strong> to create a prompt.</span>
            </div>
          )}
        </div>
      </aside>

      {/* Canvas — generated output */}
      <section className="atelier-canvas">
        <div className="atelier-canvas-header">
          <div className="atelier-tabs">
            <button
              type="button"
              onClick={() => setActiveTab('batch')}
              className={`atelier-tab${activeTab === 'batch' ? ' active' : ''}`}
            >
              Current batch
              <span className="tag-counter">{items.length}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('storage')}
              className={`atelier-tab${activeTab === 'storage' ? ' active' : ''}`}
            >
              Storage
              <span className="tag-counter">{storedImages.length}</span>
            </button>
          </div>
          {activeTab === 'batch' && (
            <button
              type="button"
              onClick={handleDownloadAll}
              disabled={!hasAnyResult}
              className="btn btn-ghost btn-sm"
            >
              <Archive size={14} /> Download zip
            </button>
          )}
        </div>

        <div className="atelier-canvas-body atelier-scroll">
          {activeTab === 'batch' ? (
            <div className="result-grid">
              {items.map(item => (
                <article key={item.id} className="result-card">
                  <header className="result-card-meta">
                    <h3 className="result-card-title" title={item.title}>{item.title}</h3>
                    <p className="result-card-prompt" title={item.enhancedPrompt || item.originalPrompt}>
                      {item.enhancedPrompt || item.originalPrompt || 'No prompt yet.'}
                    </p>
                  </header>
                  <div className="result-card-image">
                    {item.resultImageUrl ? (
                      <>
                        <img
                          src={item.resultImageUrl}
                          alt={item.title}
                          onClick={() => setSelectedImage({ url: item.resultImageUrl!, title: item.title })}
                        />
                        <div className="result-card-overlay">
                          <button
                            type="button"
                            className="btn btn-outline btn-sm"
                            onClick={() => setSelectedImage({ url: item.resultImageUrl!, title: item.title })}
                          >
                            <Maximize2 size={14} /> View
                          </button>
                          <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            onClick={() => downloadImage(item.resultImageUrl!, `${item.title}.png`)}
                          >
                            <Download size={14} /> Download
                          </button>
                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            onClick={() => removeResultImage(item.id)}
                            aria-label="Remove result"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </>
                    ) : item.status === 'enhancing' || item.status === 'generating' ? (
                      <div className="result-card-empty">
                        <span className="spinner spinner-lg" />
                        <span className="label">{item.status === 'enhancing' ? 'Enhancing prompt' : 'Generating image'}</span>
                      </div>
                    ) : item.status === 'error' ? (
                      <div className="result-card-empty error">
                        <AlertCircle size={24} />
                        <span className="label">Error</span>
                        <span className="detail">{item.error}</span>
                      </div>
                    ) : (
                      <div className="result-card-empty">
                        <ImageIcon size={24} style={{ opacity: 0.4 }} />
                        <span className="label">Not generated</span>
                      </div>
                    )}
                  </div>
                </article>
              ))}
              {items.length === 0 && (
                <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
                  <ImageIcon size={40} style={{ opacity: 0.3 }} />
                  <span className="label">No images yet</span>
                  <span className="hint">Compose a prompt on the left, then run the batch.</span>
                </div>
              )}
            </div>
          ) : (
            <div className="result-grid">
              {storedImages.map(stored => (
                <article key={stored.id} className="result-card">
                  <header className="result-card-meta">
                    <h3 className="result-card-title" title={stored.title}>{stored.title}</h3>
                    <p className="result-card-prompt" title={stored.prompt}>{stored.prompt}</p>
                  </header>
                  <div className="result-card-image">
                    <img
                      src={stored.imageUrl}
                      alt={stored.title}
                      onClick={() => setSelectedImage({ url: stored.imageUrl, title: stored.title })}
                    />
                    <div className="result-card-overlay">
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => setSelectedImage({ url: stored.imageUrl, title: stored.title })}
                      >
                        <Maximize2 size={14} /> View
                      </button>
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => downloadImage(stored.imageUrl, `${stored.title}.png`)}
                      >
                        <Download size={14} /> Download
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={() => setStoredImages(prev => prev.filter(i => i.id !== stored.id))}
                        aria-label="Delete from storage"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
              {storedImages.length === 0 && (
                <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
                  <Archive size={40} style={{ opacity: 0.3 }} />
                  <span className="label">Storage is empty</span>
                  <span className="hint">Successful generations are archived here automatically.</span>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <GithubImportModal
        isOpen={isGithubModalOpen}
        onClose={() => setIsGithubModalOpen(false)}
        onImport={handleGithubImport}
      />

      {selectedImage && (
        <ImageModal
          imageUrl={selectedImage.url}
          title={selectedImage.title}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </div>
  );
}
