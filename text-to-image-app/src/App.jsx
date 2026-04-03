import { useState } from "react";
import "./App.css";

const HF_TOKEN = import.meta.env.VITE_HF_TOKEN;
const IMAGE_URL = "https://router.huggingface.co/nscale/v1/images/generations";
const CHAT_URL = "https://router.huggingface.co/v1/chat/completions";

/* ── Text-to-Image ─────────────────────────────────────────── */
async function fetchImage(prompt) {
  const res = await fetch(IMAGE_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${HF_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt,
      model: "stabilityai/stable-diffusion-xl-base-1.0",
      n: 1,
      response_format: "b64_json",
    }),
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => res.statusText);
    throw new Error(`Image API error ${res.status}: ${msg}`);
  }
  const json = await res.json();
  const b64 = json?.data?.[0]?.b64_json;
  if (!b64) throw new Error("No image data in response.");
  return `data:image/png;base64,${b64}`;
}

/* ── Text-to-Text ──────────────────────────────────────────── */
async function fetchChat(prompt) {
  const res = await fetch(CHAT_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${HF_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "meta-llama/Llama-3.1-8B-Instruct:novita",
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => res.statusText);
    throw new Error(`Chat API error ${res.status}: ${msg}`);
  }
  const json = await res.json();
  const text = json?.choices?.[0]?.message?.content;
  if (!text) throw new Error("No text content in response.");
  return text;
}

/* ── Icons ─────────────────────────────────────────────────── */
const IconImage = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" />
    <path d="M21 15l-5-5L5 21" />
  </svg>
);
const IconChat = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
  </svg>
);
const IconPlay = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 3l14 9-14 9V3z" />
  </svg>
);
const IconDownload = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><path d="M7 10l5 5 5-5" /><path d="M12 15V3" />
  </svg>
);
const IconSparkles = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3l1.91 5.86h6.15l-4.97 3.62 1.9 5.85L12 14.71l-4.99 3.62 1.9-5.85-4.97-3.62h6.15L12 3z" />
  </svg>
);

/* ── Component ─────────────────────────────────────────────── */
export default function App() {
  const [mode, setMode] = useState("image");
  const [prompt, setPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState(null);
  const [chatReply, setChatReply] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const switchMode = (m) => {
    if (m === mode) return;
    setMode(m);
    setError(null);
    setImageUrl(null);
    setChatReply(null);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    if (!HF_TOKEN || HF_TOKEN === "your_hf_token_here") {
      setError("Token missing. Update .env and restart dev server.");
      return;
    }
    setLoading(true);
    setError(null);
    setImageUrl(null);
    setChatReply(null);
    try {
      if (mode === "image") {
        setImageUrl(await fetchImage(prompt));
      } else {
        setChatReply(await fetchChat(prompt));
      }
    } catch (err) {
      setError(err.message || "Request failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !loading) handleGenerate();
  };

  const placeholder = mode === "image"
    ? "A synthwave sunset over a digital ocean..."
    : "What are the three laws of robotics?";

  return (
    <div className="page">
      <div className="glow-container">
        <div className="glow-sphere" />
      </div>

      <header className="header">
        <div className="header-brand">
          <div className="logo-dot" />
          <span className="logo-text">Imagine</span>
        </div>
        <div className="header-meta">
          <span className="header-badge">Pro Max v2.0</span>
          <div className="status-indicator active" title="System Online" />
        </div>
      </header>

      <main className="bento-grid">
        {/* Hero Section - Spans Full Width */}
        <section className="bento-item hero-card">
          <div className="hero-content">
            <span className="hero-eyebrow">
              <IconSparkles />
              Next-Gen Creative Suite
            </span>
            <h1 className="title">
              {mode === "image" ? (
                <>Manifest your <span className="gradient-text">visions</span></>
              ) : (
                <>Converse with <span className="gradient-text">intelligence</span></>
              )}
            </h1>
            <p className="subtitle">
              {mode === "image"
                ? "Generate high-fidelity artwork from simple text prompts using state-of-the-art diffusion models."
                : "Experience the depth of Llama 3.1 with contextual reasoning and precise instruction following."}
            </p>
          </div>
        </section>

        {/* Control Section - Sticky or Stacked */}
        <div className="bento-group controls-results">
          <section className="bento-item control-card">
            <div className="mode-toggle-container">
              <span className="label-sm">Select Engine</span>
              <div className="mode-toggle" role="group">
                <button
                  className={`mode-btn ${mode === "image" ? "active" : ""}`}
                  onClick={() => switchMode("image")}
                >
                  <IconImage />
                  <span>Text-to-Image</span>
                </button>
                <button
                  className={`mode-btn ${mode === "text" ? "active" : ""}`}
                  onClick={() => switchMode("text")}
                >
                  <IconChat />
                  <span>Text-to-Text</span>
                </button>
              </div>
            </div>

            <div className="input-area">
              <span className="label-sm">Input Prompt</span>
              <div className="input-card">
                <input
                  id="prompt-input"
                  className="prompt-input"
                  type="text"
                  placeholder={placeholder}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={loading}
                />
                <button
                  id="generate-btn"
                  className={`generate-btn ${loading ? "loading" : ""}`}
                  onClick={handleGenerate}
                  disabled={loading || !prompt.trim()}
                >
                  {loading
                    ? <span className="spinner" />
                    : <><IconPlay /> <span>{mode === "image" ? "Build" : "Send"}</span></>
                  }
                </button>
              </div>
              {error && <div className="error-alert">⚠ {error}</div>}
            </div>
          </section>

          {/* Results Section */}
          <section className="bento-item results-card">
            {mode === "image" ? (
              <div id="image-display" className={`output-container ${imageUrl ? 'has-content' : ''}`}>
                {loading ? (
                  <div className="skeleton-image-v2">
                    <div className="shimmer-block" />
                    <span className="status-text">Synthesizing image...</span>
                  </div>
                ) : imageUrl ? (
                  <div className="image-presentation">
                    <img src={imageUrl} alt="AI Generated" className="final-image" />
                    <div className="image-actions">
                      <div className="prompt-recall">
                        <IconSparkles /> {prompt}
                      </div>
                      <a href={imageUrl} download="imagine.png" className="action-btn download">
                        <IconDownload />
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="empty-state">
                    <div className="nebula-icon">🎨</div>
                    <h3>Waiting for prompt</h3>
                    <p>Describe what you want to see to begin.</p>
                  </div>
                )}
              </div>
            ) : (
              <div id="chat-display" className={`output-container ${chatReply ? 'has-content' : ''}`}>
                {loading ? (
                  <div className="skeleton-chat-v2">
                    <div className="line" />
                    <div className="line mid" />
                    <div className="line short" />
                    <span className="status-text">Reasoning...</span>
                  </div>
                ) : chatReply ? (
                  <div className="chat-presentation">
                    <div className="chat-header">
                      <div className="ai-avatar">AI</div>
                      <div className="ai-info">
                        <span className="ai-name">Llama 3.1</span>
                        <span className="ai-status">8B Instruct</span>
                      </div>
                    </div>
                    <div className="chat-body">
                      <p>{chatReply}</p>
                    </div>
                  </div>
                ) : (
                  <div className="empty-state">
                    <div className="nebula-icon">💬</div>
                    <h3>Curiosity awaits</h3>
                    <p>Ask a question or start a conversation.</p>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </main>

      <footer className="footer-v2">
        <div className="footer-links">
          <span>SDXL 1.0</span>
          <span className="sep">•</span>
          <span>Llama 3.1</span>
          <span className="sep">•</span>
          <span>Hugging Face</span>
        </div>
        <p>© 2024 Imagine AI. Professional Grade.</p>
      </footer>
    </div>
  );
}
