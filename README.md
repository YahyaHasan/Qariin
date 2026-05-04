# Qariin — Hyperlocal Disaster Mutual Aid

When disasters hit, neighbors don't know who needs help or who can give it. Qariin fixes that.

## What it does
When a disaster alert activates, households set their status (need help / can help), and Qariin matches them based on proximity, resources, and urgency. Helpers get an AI-generated action checklist. Cross-language chat auto-translates in real time.

## Stack
- React (Vite) + Tailwind CSS
- Mapbox GL JS — live neighborhood map with radius filtering
- Featherless API (Qwen2.5) — AI checklists + chat translation

## Run locally
1. Clone the repo
2. Create a `.env` file with the following:
```env
VITE_MAPBOX_TOKEN=your_token
VITE_FEATHERLESS_API_KEY=your_key
VITE_FEATHERLESS_MODEL=Qwen/Qwen2.5-3B-Instruct
```
3. Run `npm install && npm run dev`

## Demo
[qariin.vercel.app](https://qariin.vercel.app)
