import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const engine = require('./paperlens-engine.js');
const pages = Array.from({ length: 15 }, (_, index) => ({
  number: index + 1,
  text: index === 0 ? '蜀道山水从两段引文提出问题。' : index === 1 ? '第二页继续讨论绘画材料。' : `第 ${index + 1} 页的正文。`
}));

const quoted = engine.normalizeAnalysis({
  section_guide: [
    { section: '第55页 导论', pages: [55], quote: '蜀道山水从两段引文提出问题。', quote_page: 55 },
    { section: '第56页 界定', pages: [56], quote: '第二页继续讨论绘画材料。', quote_page: 56 }
  ],
  arguments: [{ claim: '论点', pages: [56] }]
}, 'paper.pdf', pages);
assert.equal(quoted.page_mapping.method, 'quote');
assert.deepEqual(quoted.section_guide.map(item => item.pages), [[1], [2]]);
assert.deepEqual(quoted.section_guide.map(item => item.quote_page), [1, 2]);
assert.deepEqual(quoted.arguments[0].pages, [2]);
assert.match(quoted.section_guide[0].section, /PDF 第1页（原刊第55页）/);
assert.equal(engine.verifyEvidence(quoted, pages).score, 100);
assert.deepEqual(engine.normalizeAnalysis(quoted, 'paper.pdf', pages), quoted, '旧报告重复打开不得再次偏移');

const sequential = engine.normalizeAnalysis({
  section_guide: [{ section: '第55页 导论', pages: [55] }, { section: '第56页 方法', pages: [56] }],
  methods: [{ name: '方法', pages: [56] }]
}, 'paper.pdf', pages);
assert.equal(sequential.page_mapping.method, 'sequence');
assert.deepEqual(sequential.methods[0].pages, [2]);

const physical = engine.normalizeAnalysis({
  section_guide: [{ section: '第1页 导论', pages: [1], quote_page: 1 }]
}, 'paper.pdf', pages);
assert.equal(physical.page_mapping, null);
assert.deepEqual(physical.section_guide[0].pages, [1]);

const ambiguous = engine.normalizeAnalysis({
  section_guide: [{ section: '导论', pages: [55] }]
}, 'paper.pdf', pages);
assert.equal(ambiguous.page_mapping, null, '没有引文且只有一个越界页码时不能猜测');
assert.deepEqual(ambiguous.section_guide[0].pages, [55]);

console.log('PASS physical/printed PDF page mapping, verification, old-report reload, conservative fallback');
