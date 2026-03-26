# Cloudflare Deployment

This app is ready to be hosted publicly with Cloudflare Pages and Pages Functions.

## Before You Start

- Make sure your real Gemini key is only in `.env`, not committed to git.
- Keep `.env` local.
- Commit `.env.example` instead.

## 1. Create a Git Repo

Run these commands from this folder:

```powershell
cd C:\Users\jggor\WebAppTest
git init
git add .
git commit -m "Prepare FBPSW app for Gemini and Cloudflare Pages"
```

## 2. Push to GitHub

Create an empty GitHub repository, then run:

```powershell
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
git push -u origin main
```

## 3. Create the Cloudflare Pages Project

In Cloudflare:

1. Open `Workers & Pages`
2. Choose `Create application`
3. Choose `Pages`
4. Connect your GitHub repository
5. Use these settings:

- Framework preset: `None`
- Build command: leave blank
- Build output directory: `public`

## 4. Add Environment Variables

In the Cloudflare Pages project settings, add:

- `GEMINI_API_KEY` = your real Google AI Studio API key
- `GEMINI_MODEL` = `gemini-2.5-flash-lite`
- `GEMINI_BASE_URL` = `https://generativelanguage.googleapis.com/v1beta`

Add them for Production, and Preview too if you want preview deployments to work.

## 5. Deploy

After the first deployment, Cloudflare will give you a URL like:

`https://your-project.pages.dev`

The frontend will load from that URL, and the backend will run through:

- `/api/fbpsw/generate`
- `/health`

## 6. Update the Site

Any future `git push` to GitHub will trigger a new deployment if the repo stays connected to Cloudflare Pages.
