# Soft Landing

This is a Vite + React version of your Soft Landing app, ready to upload to GitHub and deploy on Vercel.

## Upload to GitHub

1. Create a new GitHub repo.
2. Upload all files in this folder, not the folder itself.
3. GitHub should show `package.json`, `index.html`, `vercel.json`, and the `src` folder at the top level.

## Deploy on Vercel

Use these settings if Vercel asks:

- Framework Preset: Vite
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

## Stripe

Open `src/App.jsx` and find:

```js
const STRIPE_PAYMENT_LINK = "";
```

Paste your Stripe Payment Link inside the quotes when you are ready. Until then, the app uses preview mode so you can test premium screens.

## AI message generator

The `What Do I Say?` feature is launch-safe right now and uses built-in message templates. Do not call Claude/OpenAI directly from browser code because it can expose your API key. Later, connect AI through a Vercel serverless function.
