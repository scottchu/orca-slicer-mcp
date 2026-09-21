import { expect, test } from 'bun:test';
import { parseToolpath, compileToolpath } from '../../src/lib/server/application/compile-toolpath.js';
import { createProgressToolpathService, type ToolpathContext } from '../../src/lib/server/application/progress-toolpath.js';
import { exactArtifactPath, type ToolpathReader } from '../../src/lib/server/adapters/moonraker-toolpath.js';
import { decodeToolpath } from '../../src/lib/client/live/toolpath-decoder.js';
import { PrinterObservationStore } from '../../src/lib/server/observation-store.js';
import { observePrinter } from '../../src/lib/server/application/observe-printer.js';
import { createKitObservationFixture } from '../fixtures/kit-observation-store.js';
const bytes = (v: string) => new TextEncoder().encode(v);
const source = (body = 'G1 X10 E1', pre = '') => bytes(`${pre}\nG90\nM83\nT0\nSET_PRINT_STATS_INFO TOTAL_LAYER=1 CURRENT_LAYER=0\n;LAYER_CHANGE\n;Z:0.2\nG1 X0 Y0 Z0.2\nSET_PRINT_STATS_INFO CURRENT_LAYER=1 TOTAL_LAYER=1\n${body}\nPRINT_END`);
const context = (receipt = '2026-09-21T12:00:00.000Z'): ToolpathContext => ({ filename: 'folder/part.gcode', observationVersion: 1, connectionEpoch: 1, observedAt: receipt, receipt, fresh: true, state: 'printing', layer: 1, totalLayers: 1, elapsed: 20 });
const settled = async () => { for (let i = 0; i < 12; i++) await Promise.resolve(); };
const fixture = () => {
  let fingerprint = 'first', downloads = 0, failing = false; const raw = source();
  const reader: ToolpathReader = { metadata: async () => ({ fingerprint, size: raw.length }), download: async () => { downloads++; if (failing) throw new Error('network'); return raw; } };
  return { reader, count: () => downloads, set: (v: string) => { fingerprint = v; }, fail: (v: boolean) => { failing = v; } };
};
test('nominal geometry has explicit mapping and ambiguous duplicate commands invalidate mapping', () => {
  const p = parseToolpath(source()); expect(p.vertices).toBe(2); expect(p.layers).toEqual([{ z: .2, reported: 1 }]);
  for (const replacement of ['CURRENT_LAYER=1 CURRENT_LAYER=999 TOTAL_LAYER=1', 'TOTAL_LAYER=1 TOTAL_LAYER=2 CURRENT_LAYER=1', 'CURRENT_LAYER=2 TOTAL_LAYER=1']) {
    expect(parseToolpath(bytes(new TextDecoder().decode(source()).replace('CURRENT_LAYER=1 TOTAL_LAYER=1', replacement))).layers[0]!.reported).toBeNull();
  }
});
test('retraction recovery, relative XYZ and absolute E baselines preserve deposition', () => {
  expect(parseToolpath(source('G1 E-2\nG1 X10 E1\nG1 X20 E3\nG91\nG1 X5 E1')).bounds[0]).toEqual([13.33333,25]);
  expect(() => parseToolpath(source('M82\nG1 X10 E1'))).toThrow();
  expect(parseToolpath(source('M82\nG92 E0\nG1 X10 E1')).vertices).toBe(2);
  expect(() => parseToolpath(source('M82\nG92 E0\nG1 X10 E1\nT0\nG1 X0 Y0 Z0.2\nG1 X20 E2'))).toThrow();
});
test('all four tools require new positioning and absolute E baseline; offsets cannot cross activation', () => {
  const body = [0,1,2,3].map(t => `T${t}\nG1 X${t*20} Y0 Z0.2\nM82\nG92 E0\nG1 X${t*20+10} E1`).join('\n');
  expect(parseToolpath(source(body)).paths.map(p=>p.tool)).toEqual([0,1,2,3]);
  for (const pre of ['G92 X100','SET_GCODE_OFFSET X=100','SET_KINEMATIC_POSITION X=100','G20']) expect(()=>parseToolpath(source(undefined,pre))).toThrow();
  expect(()=>parseToolpath(source('G92 X100\nT1\nG1 X0 Y0 Z0.2\nG1 X10 E1'))).toThrow();
});
test('bounded arcs and strict unsupported commands', () => {
  expect(() => compileToolpath(source(), performance.now() - 1)).toThrow('timeout');
  expect(parseToolpath(source('G2 X10 Y0 I5 J0 E1')).vertices).toBeGreaterThan(2);
  for (const body of ['G2 X10 Y0 I1 J0 E1','G1 X10 E1\nUNKNOWN_MOVE','G1 XNaN E1','G1 X10 X20 E1','G18','T4']) expect(()=>parseToolpath(source(body))).toThrow();
  expect(parseToolpath(source('G1 X10 E1\nTIMELAPSE_TAKE_FRAME')).opaqueMacros).toBe(true);
});
test('compact roundtrip exact and decoded budget enforced', async () => {
  const output=compileToolpath(source()); expect(await decodeToolpath(output.encoded,new AbortController().signal)).toEqual(output.geometry);
  for(const encoded of [{...output.encoded,decodedBytes:1},{...output.encoded,decodedBytes:16_000_001},{...output.encoded,body:output.encoded.body.slice(4)}]) await expect(decodeToolpath(encoded,new AbortController().signal)).rejects.toThrow();
});
test('artifact paths cannot substitute origins, traversal or formats', () => {
  expect(exactArtifactPath('folder/test part.gcode')).toBe('folder/test part.gcode');
  for(const name of ['/tmp/a.gcode','../a.gcode','a/../b.gcode','a\\b.gcode','a%2fb.gcode','a.gcode?url=x','a.gcode#x','a\nb.gcode','http://printer/a.gcode','a//b.gcode','a.stl']) expect(exactArtifactPath(name)).toBeNull();
});
test('concurrent cards share compile and tiny acknowledged refresh; changed metadata clears pending geometry', async () => {
  const f=fixture(),service=createProgressToolpathService(f.reader);
  try {
    const initial=await Promise.all([service.current(context(),()=>true),service.current(context(),()=>true)]); expect(initial[0]!.state).toBe('loading'); await settled();
    const ready=await service.current(context(),()=>true); expect(ready.state).toBe('ready');expect(ready.currentLayerIndex).toBe(0);expect(ready.geometry).toBeDefined();
    const next=await service.current(context('2026-09-21T12:00:15.000Z'),()=>true,ready.previewId!);expect(next.state).toBe('ready');expect(next.geometry).toBeUndefined();expect(f.count()).toBe(1);
    f.set('replacement');const changed=await service.current(context('2026-09-21T12:00:30.000Z'),()=>true);expect(changed.state).toBe('loading');expect(changed.geometry).toBeUndefined();
    expect((await service.current({...context(),connectionEpoch:2},()=>false)).reason).toBe('identity_changed');
  } finally { service.dispose(); }
});
test('transient failures retry only on a later accepted receipt', async () => {
  const f=fixture(),service=createProgressToolpathService(f.reader);
  try { f.fail(true);await service.current(context(),()=>true);await settled();expect((await service.current(context(),()=>true)).state).toBe('unavailable');f.fail(false);
    await service.current(context('2026-09-21T12:00:15.000Z'),()=>true);await settled();expect((await service.current(context('2026-09-21T12:00:15.000Z'),()=>true)).state).toBe('ready');expect(f.count()).toBe(2);
  } finally {service.dispose();}
});
test('superseding jobs and runtime disposal abort pending downloads without publishing late artifacts', async () => {
  const raw = source(); let signal: AbortSignal | undefined, finish: ((value: Uint8Array) => void) | undefined;
  const reader: ToolpathReader = { metadata: async () => ({ fingerprint: 'a', size: raw.length }), download: async (_path, abort) => { signal = abort; return new Promise(resolve => { finish = resolve; }); } };
  const service = createProgressToolpathService(reader);
  try {
    await service.current(context(), () => true); expect(signal?.aborted).toBe(false);
    await service.current({ ...context(), filename: null, state: 'standby' }, () => true); expect(signal?.aborted).toBe(true);
    finish!(raw); await settled();
    expect((await service.current({ ...context(), filename: null, state: 'standby' }, () => true)).geometry).toBeUndefined();
    await service.current(context(), () => true); service.dispose(); expect(signal?.aborted).toBe(true);
    finish!(raw); await settled(); expect((await service.current(context(), () => true)).state).toBe('unavailable');
  } finally { service.dispose(); }
});
test('stale same-file preview loses highlight and no-job removes all geometry without download', async()=>{
 const f=fixture(),s=createProgressToolpathService(f.reader);try{await s.current(context(),()=>true);await settled();const stale=await s.current({...context(),fresh:false},()=>true);expect(stale.state).toBe('ready');expect(stale.currentLayerIndex).toBeNull();expect(stale.reason).toBe('stale');const n=f.count();expect((await s.current({...context(),state:'standby'},()=>true)).reason).toBe('no_current_job');expect(f.count()).toBe(n);}finally{s.dispose();}
});
test('interactive Progress shares 15-second due reads with monitor and preserves default idle cadence',async()=>{
 const base=createKitObservationFixture(),original=(await base.observations.current()).status;let now=Date.parse('2026-09-21T12:00:00Z'),count=0,state='printing';
 const store=new PrinterObservationStore(async()=>{count++;return{status:{...original,state,observedAt:new Date(now).toISOString(),refreshAfterSeconds:300},metadata:{}};},()=>new Date(now));
 try{await observePrinter(store,'progress');expect(count).toBe(1);now+=14_999;await observePrinter(store,'progress');expect(count).toBe(1);now++;await Promise.all([observePrinter(store,'progress'),store.currentMonitor(),observePrinter(store,'progress')]);expect(count).toBe(2);now+=15_000;await store.currentMonitor();expect(count).toBe(2);state='standby';await observePrinter(store,'progress');expect(count).toBe(3);now+=15_000;await observePrinter(store,'progress');expect(count).toBe(3);}finally{base.release();base.observations.dispose();store.dispose();}
});
