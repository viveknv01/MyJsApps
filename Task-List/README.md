# Task List

Paste today's work summary, save it to Cloudflare KV, then copy WhatsApp or Google Sheet format on PC or phone.

Worker is already created in the Cloudflare dashboard:

- URL: `https://task-list.projectsbynv.workers.dev`
- KV binding: `TASKS`
- Secret: `AUTH_TOKEN`

Do not commit the real token.

## Deploy Worker code (dashboard)

1. Open [Cloudflare Dashboard](https://dash.cloudflare.com) → **Workers & Pages** → **task-list**.
2. Click **Edit code**.
3. Replace all code with the contents of `worker/worker.js`.
4. **Save and Deploy**.

Keep the existing KV binding (`TASKS`) and secret (`AUTH_TOKEN`).

## App settings (once per device)

1. Open `Task-List/index.html` from the hub (PC and phone must use the same hosted page, or each device can open the file if the Worker URL is set).
2. Open **Settings**.
3. Worker URL: `https://task-list.projectsbynv.workers.dev`
4. Token: the same value you set as `AUTH_TOKEN`.
5. Save settings.

## Daily use

- **PC before leaving:** paste Cursor Task List → **Save**.
- **Phone later:** **Today task list** → **WhatsApp** (paste into WhatsApp) → **Sheet** (paste into Google Sheets).

## Wrangler (optional)

Not required. Dashboard paste is enough. If you later use the CLI:

```bash
cd Task-List/worker
npx wrangler deploy
```

Put the KV namespace id in `wrangler.toml` first. Set the secret with `npx wrangler secret put AUTH_TOKEN`.
