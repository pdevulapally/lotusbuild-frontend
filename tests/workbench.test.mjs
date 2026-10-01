import test from 'node:test';
import assert from 'node:assert/strict';
import { validId, promptBody, modelChoices, sessionData, messageData } from '../src/lib/workbench/contracts.ts';
test('workspace paths reject traversal and URL injection', () => {
  for (const id of ['../me', 'a/b', 'x?token=y', 'x#fragment', '']) assert.throws(() => validId(id));
  assert.equal(validId('project_123-ABC'), 'project_123-ABC');
});
test('build prompts preserve multiline content and reject malformed or excessive requests', () => {
  assert.deepEqual(promptBody({prompt:'  Build\na page  ', model:'model-1'},true), {prompt:'Build\na page',model:'model-1'});
  for (const value of [{prompt:' '}, {prompt:'x'.repeat(8001)}, {prompt:'x\u0000'}, {prompt:'x',owner:'other'}]) assert.throws(() => promptBody(value));
  assert.throws(() => promptBody({prompt:'x',model:'../bad'},true));
});
test('model choices require authoritative account capabilities', () => {
  assert.deepEqual(modelChoices({capabilities:[{key:'ai.model.allowlist',kind:'stringList',value:['model-1']}]}),['model-1']);
  assert.throws(() => modelChoices({capabilities:[]}));
  assert.throws(() => modelChoices({capabilities:[{key:'ai.model.allowlist',kind:'stringList',value:[12]}]}));
});
test('session and transcript data reject malformed state and do not leak extra fields', () => {
  assert.deepEqual(sessionData({id:'s1',projectId:'p1',status:'IDLE',model:'model-1',secret:'not-rendered'}),{id:'s1',projectId:'p1',status:'IDLE',model:'model-1'});
  assert.throws(() => sessionData({id:'s1',projectId:'p1',status:'UNKNOWN',model:'model-1'}));
  assert.throws(() => messageData({messages:[{seq:0,role:'system',content:'private'}]}));
});
