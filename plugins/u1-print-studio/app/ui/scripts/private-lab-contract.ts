export const LAB_BUDGETS = Object.freeze({ observation: 250_000, bedMesh: 700_000, camera: 80_000, aggregate: 980_000 });
export const assertLabBudgets = (observation: number, bedMesh: number, camera: number): void => {
  if (![observation, bedMesh, camera].every((size) => Number.isSafeInteger(size) && size > 0)) throw new Error('Invalid private lab byte count');
  if (observation + bedMesh + camera > LAB_BUDGETS.aggregate) throw new Error('Private lab aggregate exceeded 980 KB');
  if (observation > LAB_BUDGETS.observation) throw new Error('Light observation lab exceeded 250 KB');
  if (bedMesh > LAB_BUDGETS.bedMesh) throw new Error('Bed Mesh lab exceeded 700 KB');
  if (camera > LAB_BUDGETS.camera) throw new Error('Camera lab exceeded 80 KB');
};
export const normalizeLabHtml = (html: string): string => html.replace(/[ \t]+$/gm, '').replace(/^ +(?=\t)/gm, '');
export const assertSelfContained = (html: string): void => {
  if (/<script\b[^>]*\bsrc\s*=|<link\b[^>]*\brel\s*=\s*["']stylesheet/i.test(html)) throw new Error('Private lab must be self-contained');
  if (/<(?:img|audio|video|source|iframe)\b[^>]*\bsrc\s*=\s*["'](?!data:)/i.test(html)) throw new Error('Private lab contains non-inline media');
};
