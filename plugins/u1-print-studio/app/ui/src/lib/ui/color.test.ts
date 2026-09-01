import { describe, expect, it } from 'vitest';
import { colorWash, parseColor } from './color';
describe('closed generic color evidence', () => {
  it('normalizes RGB/RGBA without dropping alpha', () => {
    expect(parseColor('#6f4c2f80')).toEqual({ hex: '#6F4C2F80', red: 111, green: 76, blue: 47, alpha: 128 / 255 });
    expect(colorWash('#000000FF')).toBe('rgba(0, 0, 0, 0.06)');
    expect(colorWash('#FFFFFF00')).toBe('rgba(255, 255, 255, 0)');
  });
  it.each(['red', '#FFF', ' #FFFFFF', '#FFFFFF;', 'url(x)', '#1234567890', null])('rejects unsafe or noncanonical color %s', (input) => {
    expect(parseColor(input)).toBeNull(); expect(colorWash(input)).toBeNull();
  });
});
