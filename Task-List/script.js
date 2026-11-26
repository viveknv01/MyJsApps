const NAME = 'Vivek';
const DEFAULT_WORKER_URL = 'https://task-list.projectsbynv.workers.dev';
const LS_URL = 'task-list-worker-url';
const LS_TOKEN = 'task-list-auth-token';
const LS_THEME = 'task-list-theme';

const taskText = document.getElementById('taskText');
const statusEl = document.getElementById('status');
const workerUrlEl = document.getElementById('workerUrl');
const authTokenEl = document.getElementById('authToken');

function localYmd(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function ddmmyyyy(d = new Date()) {
  const [y, m, day] = localYmd(d).split('-');
  return `${day}/${m}/${y}`;
}

function localKey(date = localYmd()) {
  return 'task-list-' + date;
}

function setStatus(msg) {
  statusEl.textContent = msg;
}

function applyTheme(dark) {
  document.documentElement.classList.toggle('dark', dark);
  const themeBtn = document.getElementById('themeBtn');
  if (themeBtn) themeBtn.textContent = dark ? 'Light mode' : 'Dark mode';
}

function loadSettings() {
  workerUrlEl.value = localStorage.getItem(LS_URL) || DEFAULT_WORKER_URL;
  authTokenEl.value = localStorage.getItem(LS_TOKEN) || '';
  applyTheme(localStorage.getItem(LS_THEME) === 'dark');
}

function workerBase() {
  return (workerUrlEl.value || DEFAULT_WORKER_URL).trim().replace(/\/+$/, '');
}

function token() {
  return (authTokenEl.value || localStorage.getItem(LS_TOKEN) || '').trim();
}

function isHeaderLine(line) {
  return (
    /^today'?s work\s*:?$/i.test(line) ||
    /^\*?Task List\s*:/i.test(line) ||
    /^_+$/.test(line)
  );
}

function bullets(text) {
  const lines = String(text || '')
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .filter((l) => !isHeaderLine(l));
  const marked = lines.filter((l) => l.startsWith('◼️'));
  const source = marked.length ? marked : lines;
  return source.map((l) =>
    l.startsWith('◼️') ? l : '◼️ ' + l.replace(/^[-*•]\s*/, '')
  );
}

function whatsappText(text) {
  const body = bullets(text).join('\n');
  return `*Task List : ${NAME} ${ddmmyyyy()}*\n_____________________________\n${body}`;
}

function sheetTsv(text) {
  return bullets(text)
    .map((l) => l.replace(/^◼️\s*/, ''))
    .join('\n');
}

async function copyText(value) {
  try {
    await navigator.clipboard.writeText(value);
  } catch {
    const ta = document.createElement('textarea');
    ta.value = value;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
  }
}

async function api(method, date, text) {
  const url = `${workerBase()}/api/today?date=${encodeURIComponent(date)}`;
  const headers = {
    Authorization: 'Bearer ' + token(),
    'Content-Type': 'application/json',
  };
  const opts = { method, headers };
  if (method === 'POST') {
    opts.body = JSON.stringify({ date, text });
  }
  const res = await fetch(url, opts);
  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }
  return { res, data };
}

document.getElementById('themeBtn').addEventListener('click', () => {
  const dark = !document.documentElement.classList.contains('dark');
  localStorage.setItem(LS_THEME, dark ? 'dark' : 'light');
  applyTheme(dark);
});

document.getElementById('saveSettingsBtn').addEventListener('click', () => {
  localStorage.setItem(LS_URL, workerBase());
  localStorage.setItem(LS_TOKEN, token());
  setStatus('Settings saved');
});

document.getElementById('saveBtn').addEventListener('click', async () => {
  const text = taskText.value.trim();
  const date = localYmd();
  if (!text) {
    setStatus('Nothing saved for today');
    return;
  }
  localStorage.setItem(localKey(date), text);
  if (!token()) {
    setStatus('Saved locally. Add token in Settings to sync.');
    return;
  }
  try {
    const { res, data } = await api('POST', date, text);
    if (res.ok) {
      setStatus('Saved');
    } else {
      setStatus('Saved locally. Sync failed' + (data && data.error ? ': ' + data.error : ''));
    }
  } catch {
    setStatus('Saved locally. Sync failed');
  }
});

document.getElementById('todayBtn').addEventListener('click', async () => {
  const date = localYmd();
  const fallback = localStorage.getItem(localKey(date)) || '';

  if (token()) {
    try {
      const { res, data } = await api('GET', date);
      if (res.ok && data && data.text) {
        taskText.value = data.text;
        setStatus('Loaded today');
        return;
      }
      if (res.status === 404 || (data && !data.text)) {
        if (fallback) {
          taskText.value = fallback;
          setStatus('Loaded today (this device)');
        } else {
          taskText.value = '';
          setStatus('Nothing saved for today');
        }
        return;
      }
      if (fallback) {
        taskText.value = fallback;
        setStatus('Loaded today (this device)');
        return;
      }
      setStatus('Nothing saved for today');
      return;
    } catch {
      /* fall through to local */
    }
  }

  if (fallback) {
    taskText.value = fallback;
    setStatus('Loaded today (this device)');
  } else {
    setStatus('Nothing saved for today');
  }
});

document.getElementById('copyBtn').addEventListener('click', async () => {
  const text = taskText.value.trim();
  if (!text) {
    setStatus('Nothing saved for today');
    return;
  }
  await copyText(text);
  setStatus('Copied');
});

document.getElementById('whatsappBtn').addEventListener('click', async () => {
  const text = taskText.value.trim();
  if (!text) {
    setStatus('Nothing saved for today');
    return;
  }
  await copyText(whatsappText(text));
  setStatus('Copied');
});

document.getElementById('sheetBtn').addEventListener('click', async () => {
  const text = taskText.value.trim();
  if (!text) {
    setStatus('Nothing saved for today');
    return;
  }
  const tsv = sheetTsv(text);
  if (!tsv) {
    setStatus('Nothing saved for today');
    return;
  }
  await copyText(tsv);
  setStatus('Copied');
});

loadSettings();
const todayStored = localStorage.getItem(localKey());
if (todayStored) {
  taskText.value = todayStored;
  setStatus('Saved');
} else {
  setStatus('Nothing saved for today');
}
