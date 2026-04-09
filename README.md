# Imagine AI — Unified Chatbot & Image Generator

A premium AI-native creative suite built with React + Vite, powered by Hugging Face.

## 🌐 Live Deployment

**[https://chatjpt-flax.vercel.app](https://chatjpt-flax.vercel.app)**

## ✨ Features

- 💬 **Chat Mode** — Conversational AI powered by Llama 3.1 8B
- 🎨 **Imagine Mode** — Text-to-image generation via Stable Diffusion XL
- 🖼️ **Image Lightbox** — Full-screen view of generated artwork
- ⚡ **Quick Actions** — One-click prompt chips to get started instantly
- 📂 **Workspace Sidebar** — Collapsible session manager
- 🌌 **Mesh Gradient UI** — Animated, immersive dark-mode design

## 🗂️ Project Structure

```
Chatbot/
├── text-to-image-app/   # Core React + Vite application
│   ├── src/
│   │   ├── App.jsx      # Main component & API logic
│   │   └── App.css      # Premium glassmorphism styles
│   └── .env.local       # Environment variables (VITE_HF_TOKEN)
└── vercel.json          # Root-level Vercel deployment config
```

## 🚀 Local Setup

1. Navigate to the app directory:
   ```bash
   cd text-to-image-app
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Add your Hugging Face token to `.env.local`:
   ```
   VITE_HF_TOKEN=your_token_here
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```

## 🛠️ Tech Stack

| Tool | Purpose |
|------|---------|
| React 19 | UI Framework |
| Vite | Build Tool |
| Hugging Face Router | AI API Gateway |
| Llama 3.1 8B | Text Generation |
| Stable Diffusion XL | Image Generation |
| Vercel | Hosting & Deployment |
