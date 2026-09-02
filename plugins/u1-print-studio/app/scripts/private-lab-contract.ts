export const assertLabSizes = (observation: number, bedMesh: number, camera: number): void => {
  if (![observation, bedMesh, camera].every((size) => Number.isSafeInteger(size) && size > 0)) throw new Error('Invalid private lab byte count');
};
export const normalizeLabHtml = (html: string): string => html.replace(/[ \t]+$/gm, '').replace(/^ +(?=\t)/gm, '');
export const assertSelfContained = (html: string): void => {
  if (/<script\b[^>]*\bsrc\s*=|<link\b[^>]*\brel\s*=\s*["']stylesheet/i.test(html)) throw new Error('Private lab must be self-contained');
  if (/<(?:img|audio|video|source|iframe)\b[^>]*\bsrc\s*=\s*["'](?!data:)/i.test(html)) throw new Error('Private lab contains non-inline media');
};
