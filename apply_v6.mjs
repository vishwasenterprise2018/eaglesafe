import fs from 'node:fs/promises';
import path from 'node:path';

// Idempotent integration for every generated model page and both main pages.
const root = import.meta.dirname;
async function integrate(directory) {
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory() && entry.name !== 'node_modules') await integrate(file);
    else if (entry.name.endsWith('.html')) {
      let html = await fs.readFile(file, 'utf8');
      const prefix = path.relative(path.dirname(file), root).split(path.sep).join('/');
      const assets = (prefix ? prefix + '/' : '') + 'assets/';
      if (!html.includes('assets/liquid-glass.css')) {
      html = html.replace('</head>', `  <link rel="stylesheet" href="${assets}liquid-glass.css" />\n  </head>`);
      html = html.replace('<body>', '<body class="ui-v6">');
      html = html.replace('</body>', `  <script src="${assets}lucide.min.js"></script>\n    <script src="${assets}liquid-glass.js"></script>\n  </body>`);
      }
      // Restore the saved theme before styles or visible content can paint.
      if (!html.includes('id="theme-bootstrap"')) {
        html = html.replace('<head>', `<head>\n    <script id="theme-bootstrap">\n      try { document.documentElement.dataset.theme = localStorage.getItem('eagleSafeTheme') === 'night' ? 'night' : 'day'; } catch (_) { document.documentElement.dataset.theme = 'day'; }\n    </script>\n    <style>html { background: #edf1f3; } html[data-theme="night"] { background: #081c34; color-scheme: dark; }</style>`);
        html = html.replace('<body class="ui-v6">', `<body class="ui-v6">\n    <script>document.body.classList.toggle('night-theme', document.documentElement.dataset.theme === 'night');</script>`);
      }
      await fs.writeFile(file, html);
    }
  }
}
await integrate(root);
console.log('Liquid Glass applied to all HTML pages.');
