import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const engine = require('./paperlens-engine.js');
const current = { id: 'current', title: '当前论文', analysis: { thesis: '共同观点', arguments: [{ claim: '新的论点', pages: [2] }] } };
const prior = { id: 'prior', title: '已读论文', analysis: { thesis: '共同观点', arguments: [{ claim: '其他观点', pages: [4] }] } };
const unselected = { id: 'secret', title: '未选择论文', analysis: { thesis: '不应进入请求' } };
const prompt = engine.buildReadMemoryPrompt(current, [prior]);
assert.match(prompt.system, /不表示学术上首次提出/);
assert.match(prompt.user, /不包含 PDF 全文/);
assert.ok(!prompt.user.includes(unselected.title), '未选择的论文不得进入模型请求');
assert.equal(prompt.payload.selected_read_papers.length, 1);
const normalized = engine.normalizeReadMemory({
  seen: [
    { current_claim_index: null, why: '缺失下标不可默认为零', sources: [{ id: 'prior', claim_index: 0 }] },
    { current_claim_index: 0, why: '确实相同', sources: [{ id: 'secret', claim_index: 0 }, { id: 'prior', claim_index: null }, { id: 'prior', claim_index: 0 }] }
  ],
  related: [{ current_claim_index: 0, why: '不能重复分类', sources: [{ id: 'prior', claim_index: 1 }] }],
  not_seen: [{ current_claim_index: 1, why: '在本次选择的报告中未见' }]
}, prompt.payload);
assert.equal(normalized.seen.length, 1);
assert.deepEqual(normalized.seen[0].sources.map(source => source.title), ['已读论文']);
assert.equal(normalized.related.length, 0);
assert.equal(normalized.not_seen.length, 1);
console.log('PASS selected-only report payload, source validation and cautious novelty wording');
