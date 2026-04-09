import { useState, useEffect, useRef } from "react";
import "./App.css";

const HF_TOKEN = import.meta.env.VITE_HF_TOKEN;
const IMAGE_URL = "https://router.huggingface.co/nscale/v1/images/generations";
const CHAT_MODELS = [
  "microsoft/Phi-3-mini-4k-instruct",
  "mistralai/Mistral-7B-Instruct-v0.3",
  "HuggingFaceH4/zephyr-7b-beta"
];

/* ── Icons ─────────────────────────────────────────────────── */
const IconImage = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" />
  </svg>
);
const IconChat = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
  </svg>
);
const IconPlay = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 3l14 9-14 9V3z" />
  </svg>
);
const IconDownload = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><path d="M7 10l5 5 5-5" /><path d="M12 15V3" />
  </svg>
);
const IconSparkles = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3l1.91 5.86h6.15l-4.97 3.62 1.9 5.85L12 14.71l-4.99 3.62 1.9-5.85-4.97-3.62h6.15L12 3z" />
  </svg>
);
const IconTrash = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18m-2 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
  </svg>
);
const IconMenu = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);
const IconPlus = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

/* ── API Helpers ───────────────────────────────────────────── */
async function fetchImage(prompt) {
  const res = await fetch(IMAGE_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${HF_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, model: "stabilityai/stable-diffusion-xl-base-1.0", n: 1, response_format: "b64_json" }),
  });
  if (!res.ok) throw new Error(`Image API error ${res.status}`);
  const json = await res.json();
  return `data:image/png;base64,${json?.data?.[0]?.b64_json}`;
}

async function fetchChat(prompt) {
  let lastError;
  for (const model of CHAT_MODELS) {
    const url = `https://api-inference.huggingface.co/models/${model}/v1/chat/completions`;
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { Authorization: `Bearer ${HF_TOKEN}`, "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [{ role: "user", content: prompt }], max_tokens: 512 }),
      });
      if (!res.ok) throw new Error(`Chat API error ${res.status}`);
      const json = await res.json();
      const text = json?.choices?.[0]?.message?.content;
      if (text) return text;
    } catch (err) {
      lastError = err;
      console.warn(`Model ${model} failed, trying next...`, err.message);
    }
  }
  throw lastError || new Error("All chat models failed.");
}

/* ── Component ─────────────────────────────────────────────── */
export default function App() {
  const [mode, setMode] = useState("text");
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [lightboxUrl, setLightboxUrl] = useState(null);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const quickActions = [
    { label: "Code Help", prompt: "Explain how to use React hooks", mode: "text" },
    { label: "Summarize", prompt: "Summarize this article: [link]", mode: "text" },
    { label: "Portrait", prompt: "Cinematic portrait of a warrior", mode: "image" },
    { label: "UI Design", prompt: "Glassmorphism UI layout for a dashboard", mode: "image" }
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleGenerate = async (overriddenPrompt, overriddenMode) => {
    const finalPrompt = (overriddenPrompt || prompt).trim();
    const finalMode = overriddenMode || mode;
    if (!finalPrompt) return;
    if (!HF_TOKEN) {
      setError("Hugging Face Token is missing.");
      return;
    }

    const userMsg = { id: Date.now(), role: "user", type: "text", content: finalPrompt, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setMessages(prev => [...prev, userMsg]);
    setPrompt("");
    setLoading(true);
    setError(null);

    try {
      const content = finalMode === "image" ? await fetchImage(finalPrompt) : await fetchChat(finalPrompt);
      const botMsg = { id: Date.now() + 1, role: "bot", type: finalMode, content: content, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      setError(err.message || "Failed to fetch response.");
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => { setMessages([]); setError(null); };

  const placeholder = mode === "image" ? "Describe your vision..." : "Ask me anything...";

  return (
    <div className={`app-container ${sidebarOpen ? "sidebar-expanded" : "sidebar-collapsed"}`}>
      <div className="mesh-bg" />
      
      {/* Lightbox */}
      {lightboxUrl && (
        <div className="lightbox-overlay" onClick={() => setLightboxUrl(null)}>
          <div className="lightbox-content">
            <img src={lightboxUrl} alt="Zoomed view" />
            <button className="close-lightbox" onClick={() => setLightboxUrl(null)}>×</button>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <button className="new-chat-btn" onClick={clearChat}>
            <IconPlus /> <span>New Session</span>
          </button>
        </div>
        <div className="sidebar-content">
          <div className="sidebar-section">
            <span className="section-title">Recent Generations</span>
            <div className="history-empty">No past sessions</div>
          </div>
        </div>
        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="avatar">U</div>
            <div className="info">
              <span className="name">User Session</span>
              <span className="plan">Standard Plan</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-viewport">
        <header className="main-header">
          <div className="header-left">
            <button className="icon-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <IconMenu />
            </button>
            <div className="brand">
              <div className="logo-sparkle"><IconSparkles /></div>
              <span className="logo-text">Imagine.ai</span>
            </div>
          </div>
          <div className="header-right">
            <button className="clear-btn-v3" onClick={clearChat}>
              <IconTrash />
            </button>
            <span className="badge">v3.0 Ultra</span>
          </div>
        </header>

        <section className="chat-arena">
          <div className="messages-scrollbox">
            {messages.length === 0 ? (
              <div className="hero-splash">
                <div className="splash-icon">🚀</div>
                <h1>How can I help you <span className="gradient-text">create</span> today?</h1>
                <p>Switch between Chat and Imagine modes to unlock your potential.</p>
                <div className="quick-start-grid">
                  <button onClick={() => {setMode("text"); handleGenerate("Write a poem about neon cities", "text")}}>Summarize a concept</button>
                  <button onClick={() => {setMode("image"); handleGenerate("Hyper-realistic futuristic car", "image")}}>Generate an artwork</button>
                </div>
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className={`msg-row ${msg.role}`}>
                  <div className="avatar-mini">{msg.role === 'user' ? 'U' : 'AI'}</div>
                  <div className="msg-bubble">
                    {msg.type === 'image' ? (
                      <div className="img-container" onClick={() => setLightboxUrl(msg.content)}>
                        <img src={msg.content} alt="AI output" draggable="false" />
                        <a href={msg.content} download className="dl-btn" onClick={(e) => e.stopPropagation()}><IconDownload /></a>
                      </div>
                    ) : (
                      <p>{msg.content}</p>
                    )}
                    <span className="time">{msg.timestamp}</span>
                  </div>
                </div>
              ))
            )}
            {loading && (
              <div className="msg-row bot">
                <div className="avatar-mini">AI</div>
                <div className="msg-bubble loading-glow">
                  <div className="typing-dots"><span></span><span></span><span></span></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="input-dock">
            <div className="dock-inner">
              <div className="quick-actions-bar">
                {quickActions.map((action, i) => (
                  <button key={i} className="action-chip" onClick={() => { setMode(action.mode); handleGenerate(action.prompt, action.mode); }}>
                    {action.label}
                  </button>
                ))}
              </div>
              <div className="control-row">
                <div className="mode-pill">
                  <button className={mode === 'text' ? 'active' : ''} onClick={() => setMode('text')}>Chat</button>
                  <button className={mode === 'image' ? 'active' : ''} onClick={() => setMode('image')}>Imagine</button>
                </div>
                <div className="input-pouch">
                  <input 
                    type="text" 
                    placeholder={placeholder} 
                    value={prompt} 
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                    disabled={loading}
                  />
                  <button className={`send-pwr ${loading ? 'spinning' : ''}`} onClick={() => handleGenerate()} disabled={loading || !prompt.trim()}>
                    {loading ? <div className="loader-mini" /> : <IconPlay />}
                  </button>
                </div>
              </div>
              {error && <div className="mini-error">{error}</div>}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
