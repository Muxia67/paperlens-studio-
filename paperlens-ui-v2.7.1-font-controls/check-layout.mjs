import fs from 'node:fs';

const html = fs.readFileSync(new URL('./paperlens-studio.html', import.meta.url), 'utf8');
const required = [
  ['document-load progress separation', 'const isDocumentLoad = Boolean(label'],
  ['analysis card hidden during document load', 'els.analysisProgress.classList.toggle("show", !isDocumentLoad)'],
  ['resizer anchored to inspector width', 'right:calc(var(--inspector-width) - 6px)'],
  ['responsive inspector width keeps shared variable', '@media (max-width: 1280px) { .workspace { --sidebar-width:248px; }'],
  ['tablet resizer hidden with inspector', '.inspector, .inspector-resizer { display:none; }'],
  ['mobile sidebar toggle hidden', '.sidebar-toggle { display:none; }']
];

for (const [label, fragment] of required) {
  if (!html.includes(fragment)) throw new Error(`Missing layout safeguard: ${label}`);
}
if (html.includes('grid-template-columns: 248px minmax(380px, 1fr) 380px')) {
  throw new Error('Responsive grid must not override the saved inspector width');
}

console.log('PASS layout safeguards: progress separation, resizer alignment, and responsive fallbacks');
