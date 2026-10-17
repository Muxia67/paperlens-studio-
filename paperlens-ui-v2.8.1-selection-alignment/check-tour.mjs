import fs from 'node:fs';

const html = fs.readFileSync(new URL('./paperlens-studio.html', import.meta.url), 'utf8');
const tour = html.match(/const tourSteps = \[([\s\S]*?)\n  \];/);
if (!tour) throw new Error('Missing tour steps');
const selectors = [...tour[1].matchAll(/selector: /g)];
if (selectors.length !== 7) throw new Error(`Expected 7 focused tour steps, found ${selectors.length}`);
for (const id of ['dropzone', 'analyzeBtn', 'annotateBtn', 'openResultsBtn', 'comparisonOptions', 'folderToolbar', 'appMenuBtn']) {
  if (!html.includes(`id="${id}"`)) throw new Error(`Missing tour target ${id}`);
}
for (const id of ['tourOverlay', 'tourSpotlight', 'tourCard', 'tourTitle', 'tourText', 'tourSkip', 'tourPrev', 'tourNext', 'helpTourBtn']) {
  if (!html.includes(`id="${id}"`)) throw new Error(`Missing tour control ${id}`);
}
if (!html.includes('paperlens.tourSeen.v7')) throw new Error('Missing current first-visit marker');
if (!tour[1].includes('按主题分类论文') || !tour[1].includes('更多工具集中在这里')) throw new Error('Missing folder and More introductions');
console.log('PASS seven-step tour and targets');
