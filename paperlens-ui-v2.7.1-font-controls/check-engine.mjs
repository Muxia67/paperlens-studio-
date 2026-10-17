import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const engine = require('./paperlens-engine.js');

const minimal = engine.normalizeAnalysis({ title: '等待论文' }, '等待论文');
for (const field of ['methods', 'arguments', 'key_concepts', 'writing_moves', 'counterpoints', 'transfer_to_topic']) {
  if (!Array.isArray(minimal[field])) throw new Error(`normalizeAnalysis must provide ${field} as an array`);
}

const detailed = engine.normalizeAnalysis({
  section_guide: [{
    section: '难点段落',
    difficulty: '较难',
    hard_explanation: '先用日常语言说明概念。',
    hard_example: '再用文中的材料举例。',
    why_it_matters: '它支撑全文论证。'
  }]
}, '测试论文');
const section = detailed.section_guide[0];
if (section.hard_explanation !== '先用日常语言说明概念。' ||
    section.hard_example !== '再用文中的材料举例。' ||
    section.why_it_matters !== '它支撑全文论证。') {
  throw new Error('Hard-reading guidance fields were not preserved');
}

const table = engine.buildClaimTable(engine.normalizeAnalysis({
  arguments: [{ claim: '材料支持主张', evidence: '访谈记录', pages: [1] }]
}), [{ number: 1, text: '材料支持主张。访谈记录展示了相关现象。' }]);
if (!table.rows.length || table.rows[0].verdict.includes('证据可信')) {
  throw new Error('Textual similarity must not be presented as proof of evidential support');
}

console.log('PASS engine normalization and cautious source-matching verdicts');
