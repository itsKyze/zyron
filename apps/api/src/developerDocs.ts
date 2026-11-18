// FILE: developerDocs.ts
// Purpose: Self-contained HTML developer documentation and interactive API reference.
// Layer: API web presentation

export function renderDeveloperDocsHtml(apiPublicUrl: string): string {
  const rootUrl = apiPublicUrl.replace(/\/api\/v1\/?$/, "");
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Zyron Developer API Reference</title>
  <style>
    :root {
      --bg: #0d0f12;
      --card-bg: #14171d;
      --card-border: #21262d;
      --text: #f0f6fc;
      --text-muted: #8b949e;
      --accent: #38bdf8;
      --accent-dim: rgba(56, 189, 248, 0.1);
      --emerald: #34d399;
      --emerald-dim: rgba(52, 211, 153, 0.1);
      --amber: #fbbf24;
      --amber-dim: rgba(251, 191, 36, 0.1);
      --code-bg: #161b22;
      --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      --font-sans: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: var(--bg);
      color: var(--text);
      font-family: var(--font-sans);
      line-height: 1.6;
      padding: 2rem 1rem;
    }
    .container {
      max-width: 960px;
      margin: 0 auto;
    }
    header {
      border-bottom: 1px solid var(--card-border);
      padding-bottom: 1.5rem;
      margin-bottom: 2rem;
    }
    .badge {
      display: inline-block;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      padding: 0.2rem 0.6rem;
      border-radius: 9999px;
      margin-left: 0.5rem;
    }
    .badge-cyan { background: var(--accent-dim); color: var(--accent); border: 1px solid rgba(56,189,248,0.25); }
    .badge-green { background: var(--emerald-dim); color: var(--emerald); border: 1px solid rgba(52,211,153,0.25); }
    .badge-method { font-family: var(--font-mono); font-size: 0.75rem; font-weight: 700; padding: 0.15rem 0.45rem; border-radius: 4px; }
    .method-get { background: var(--emerald-dim); color: var(--emerald); }
    .method-post { background: var(--accent-dim); color: var(--accent); }
    .method-put { background: var(--amber-dim); color: var(--amber); }
    .method-delete { background: rgba(239, 68, 68, 0.1); color: #f87171; }
    h1 { font-size: 2rem; font-weight: 700; display: flex; align-items: center; }
    p.lead { color: var(--text-muted); font-size: 1.05rem; margin-top: 0.5rem; }
    .section-title {
      font-size: 1.3rem;
      font-weight: 600;
      margin: 2rem 0 1rem;
      color: var(--text);
      border-left: 3px solid var(--accent);
      padding-left: 0.75rem;
    }
    .endpoint-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 8px;
      margin-bottom: 1rem;
      overflow: hidden;
    }
    .endpoint-header {
      padding: 0.85rem 1.25rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      border-bottom: 1px solid var(--card-border);
      background: rgba(255, 255, 255, 0.02);
    }
    .endpoint-path {
      font-family: var(--font-mono);
      font-size: 0.95rem;
      color: var(--text);
      font-weight: 600;
    }
    .endpoint-desc {
      color: var(--text-muted);
      font-size: 0.85rem;
      margin-left: auto;
    }
    .endpoint-body {
      padding: 1.25rem;
      font-size: 0.9rem;
    }
    pre {
      background: var(--code-bg);
      padding: 0.75rem 1rem;
      border-radius: 6px;
      font-family: var(--font-mono);
      font-size: 0.85rem;
      overflow-x: auto;
      margin-top: 0.5rem;
      border: 1px solid var(--card-border);
    }
    code { font-family: var(--font-mono); color: var(--accent); }
    .meta-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }
    .meta-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 8px;
      padding: 1rem 1.25rem;
    }
    .meta-label { font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; font-weight: 600; }
    .meta-val { font-family: var(--font-mono); font-size: 1rem; color: var(--text); margin-top: 0.25rem; }
    footer {
      margin-top: 3rem;
      padding-top: 1.5rem;
      border-top: 1px solid var(--card-border);
      text-align: center;
      font-size: 0.85rem;
      color: var(--text-muted);
    }
    footer a { color: var(--accent); text-decoration: none; }
    footer a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>Zyron Developer API <span class="badge badge-cyan">v1.6.2</span></h1>
      <p class="lead">Official documentation and protocol reference for the Zyron account, identity, and remote pairing infrastructure.</p>
    </header>

    <div class="meta-grid">
      <div class="meta-card">
        <div class="meta-label">Base API URL</div>
        <div class="meta-val">${rootUrl}/api/v1</div>
      </div>
      <div class="meta-card">
        <div class="meta-label">Protocol Architecture</div>
        <div class="meta-val">REST + JSON (Bearer / mTLS)</div>
      </div>
      <div class="meta-card">
        <div class="meta-label">Current Deployment Status</div>
        <div class="meta-val" style="color: var(--emerald);">Operational</div>
      </div>
    </div>

    <h2 class="section-title">Authentication & Identity</h2>

    <div class="endpoint-card">
      <div class="endpoint-header">
        <span class="badge-method method-post">POST</span>
        <span class="endpoint-path">/api/v1/auth/otp/send</span>
        <span class="endpoint-desc">Dispatch a verification code</span>
      </div>
      <div class="endpoint-body">
        <p>Sends a 6-digit OTP code to the specified email address using the tactical verification pipeline.</p>
        <pre><code>curl -X POST "${rootUrl}/api/v1/auth/otp/send" \\
  -H "Content-Type: application/json" \\
  -d '{"email": "developer@example.com"}'</code></pre>
      </div>
    </div>

    <div class="endpoint-card">
      <div class="endpoint-header">
        <span class="badge-method method-post">POST</span>
        <span class="endpoint-path">/api/v1/auth/otp/authenticate</span>
        <span class="endpoint-desc">Verify code and acquire token</span>
      </div>
      <div class="endpoint-body">
        <p>Exchanges the received 6-digit verification code for a session token pair.</p>
        <pre><code>curl -X POST "${rootUrl}/api/v1/auth/otp/authenticate" \\
  -H "Content-Type: application/json" \\
  -d '{"email": "developer@example.com", "code": "123456"}'</code></pre>
      </div>
    </div>

    <div class="endpoint-card">
      <div class="endpoint-header">
        <span class="badge-method method-post">POST</span>
        <span class="endpoint-path">/api/v1/auth/refresh</span>
        <span class="endpoint-desc">Rotate session credentials</span>
      </div>
      <div class="endpoint-body">
        <p>Rotates an existing refresh token for a newly issued access token.</p>
        <pre><code>curl -X POST "${rootUrl}/api/v1/auth/refresh" \\
  -H "Content-Type: application/json" \\
  -d '{"refreshToken": "&lt;refresh_token&gt;"}'</code></pre>
      </div>
    </div>

    <h2 class="section-title">Developer Profiles</h2>

    <div class="endpoint-card">
      <div class="endpoint-header">
        <span class="badge-method method-get">GET</span>
        <span class="endpoint-path">/api/v1/profiles/:handle</span>
        <span class="endpoint-desc">Fetch public developer profile</span>
      </div>
      <div class="endpoint-body">
        <p>Resolves public profile information, social links, and metadata for a verified handle.</p>
        <pre><code>curl -X GET "${rootUrl}/api/v1/profiles/kyze"</code></pre>
      </div>
    </div>

    <h2 class="section-title">Remote Workstations & Devices</h2>

    <div class="endpoint-card">
      <div class="endpoint-header">
        <span class="badge-method method-get">GET</span>
        <span class="endpoint-path">/api/v1/hosts</span>
        <span class="endpoint-desc">List registered workstations</span>
      </div>
      <div class="endpoint-body">
        <p>Lists active host machines and remote connectivity endpoints authorized for your account.</p>
        <pre><code>curl -X GET "${rootUrl}/api/v1/hosts" \\
  -H "Authorization: Bearer &lt;access_token&gt;"</code></pre>
      </div>
    </div>

    <div class="endpoint-card">
      <div class="endpoint-header">
        <span class="badge-method method-post">POST</span>
        <span class="endpoint-path">/api/v1/hosts/:id/pairing-codes</span>
        <span class="endpoint-desc">Generate pairing invitation</span>
      </div>
      <div class="endpoint-body">
        <p>Generates an ephemeral secure pairing code for connecting new desktop or mobile devices.</p>
        <pre><code>curl -X POST "${rootUrl}/api/v1/hosts/:host_id/pairing-codes" \\
  -H "Authorization: Bearer &lt;access_token&gt;"</code></pre>
      </div>
    </div>

    <h2 class="section-title">Infrastructure Discovery</h2>

    <div class="endpoint-card">
      <div class="endpoint-header">
        <span class="badge-method method-get">GET</span>
        <span class="endpoint-path">/api/v1/instance</span>
        <span class="endpoint-desc">Deployment capabilities</span>
      </div>
      <div class="endpoint-body">
        <p>Reports public deployment features, identity provider configuration, and version metadata.</p>
        <pre><code>curl -X GET "${rootUrl}/api/v1/instance"</code></pre>
      </div>
    </div>

    <div class="endpoint-card">
      <div class="endpoint-header">
        <span class="badge-method method-get">GET</span>
        <span class="endpoint-path">/api/v1/keys/jwks</span>
        <span class="endpoint-desc">Public signing keys</span>
      </div>
      <div class="endpoint-body">
        <p>Returns standard JSON Web Key Set (JWKS) for offline verification of signed tokens.</p>
        <pre><code>curl -X GET "${rootUrl}/api/v1/keys/jwks"</code></pre>
      </div>
    </div>

    <footer>
      <p>Zyron Open Source Project &bull; <a href="https://github.com/itsKyze/zyron" target="_blank" rel="noreferrer">GitHub Repository</a> &bull; <a href="https://ai.zyron.site" target="_blank" rel="noreferrer">Web App</a></p>
    </footer>
  </div>
</body>
</html>`;
}
