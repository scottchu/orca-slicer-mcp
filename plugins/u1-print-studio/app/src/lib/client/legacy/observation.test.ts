import { describe, expect, it } from 'vitest';
import { failedLegacyResult } from './observation';

describe('legacy acquisition error envelope boundary', () => {
  it('rejects failed outer and retained wrapped envelopes even with valid content', () => {
    const success = {
      structuredContent: { schemaVersion: 2, view: 'fans', module: { kind: 'fans' } },
    };
    for (const value of [
      { ...success, isError: true },
      { result: { ...success, isError: true } },
      { call_tool_result: { ...success, isError: true } },
      { mcp_tool_result: { ...success, isError: true } },
    ])
      expect(failedLegacyResult(value)).toBe(true);
    expect(failedLegacyResult(success)).toBe(false);
  });
});
