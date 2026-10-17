import fs from 'node:fs';
import vm from 'node:vm';

const html = fs.readFileSync(new URL('./paperlens-studio.html', import.meta.url), 'utf8');
const topic = html.match(/<textarea[^>]*id="topicInput"[^>]*>([\s\S]*?)<\/textarea>/);
if (!topic) throw new Error('Missing research topic field');
if (topic[1].trim()) throw new Error('Optional research topic must start empty');
if (!topic[0].includes('placeholder=')) throw new Error('Research topic needs a visual hint');

const order = ['id="dropzone"', 'id="analyzeBtn"', 'id="readingOptions"', 'id="comparisonOptions"'];
const positions = order.map(fragment => html.indexOf(fragment));
if (positions.some(position => position < 0) || positions.some((position, index) => index && position <= positions[index - 1])) {
  throw new Error('Single-paper flow must show upload, primary action, then optional settings');
}

for (const fragment of [
  'id="appMenuBtn"', 'id="comparisonOptions"', 'id="compareFilesBtn"', 'id="compareBtn"',
  'id="resultsMoreBtn"', 'id="resultsMenu"',
  'id="openResultsBtn"', 'id="closeResultsBtn"',
  '.workspace.results-open .inspector',
  'function selectPanel(panelId)', 'selectPanel("panelLiterature")'
]) {
  if (!html.includes(fragment)) throw new Error(`Missing UI path: ${fragment}`);
}
if (html.includes('id="jumpPage"') || html.includes('id="jumpBtn"')) throw new Error('Duplicate page navigation remains');
if (html.includes('id="compareOpenBtn"') || html.includes('id="compareModal"')) throw new Error('Comparison entry remains in the top menu');
if (!html.includes('data-panel="panelStructure">论证链</button>') || !html.includes('data-panel="panelEvidence">核验</button>')) {
  throw new Error('Primary results must distinguish argument chain from verification');
}
if (html.includes('data-panel="panelCompare"') || html.includes('id="panelCompare"')) throw new Error('Original-text comparison remains a separate tab');
const verificationPanel = html.match(/<section[^>]*id="panelEvidence"[^>]*>([\s\S]*?)<\/section>/);
if (!verificationPanel || !verificationPanel[1].includes('id="evidenceContent"') || !verificationPanel[1].includes('id="compareContent"')) {
  throw new Error('Verification panel must contain both source checks and original-text comparison');
}
if (!html.includes("step('01', '研究问题'") || !html.includes("step('04', '作者的写作动作'")) {
  throw new Error('Argument chain must show a four-stage reading line');
}
const comparison = html.match(/<details[^>]*id="comparisonOptions"[^>]*>([\s\S]*?)<\/details>/);
if (!comparison || !comparison[1].includes('id="compareFilesBtn"') || !comparison[1].includes('id="compareBtn"')) {
  throw new Error('Comparison controls must be inside the expandable sidebar card');
}
if (!html.includes('function zoomReaderTo(nextScale)') || html.includes('rerender();')) throw new Error('Zoom must not rebuild all PDF pages');
const resultHeader = html.match(/<div class="inspector-head">([\s\S]*?)<\/div>/);
if (!resultHeader || !resultHeader[1].includes('id="fontMinus"') || !resultHeader[1].includes('id="fontPlus"')) {
  throw new Error('Font controls must be visible in the results header');
}
const topMenu = html.match(/<div class="app-menu" id="appMenu" hidden>([\s\S]*?)<\/div>\s*<\/div>\s*<input id="importDataInput"/);
if (!topMenu || topMenu[1].includes('id="fontMinus"') || topMenu[1].includes('id="fontPlus"')) {
  throw new Error('Font controls should no longer be inside More');
}
if (!html.includes('.inspector-head { position:sticky;')) throw new Error('Results header must remain visible while scrolling');

for (const [, id] of html.matchAll(/:\s*\$\("#([A-Za-z][\w-]*)"\)/g)) {
  if (!html.includes(`id="${id}"`)) throw new Error(`Script references missing element #${id}`);
}

const scripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)];
for (const [, source] of scripts) if (source.trim()) new vm.Script(source);
console.log('PASS UI flow, optional topic, menus, narrow-screen results, and inline JavaScript syntax');
