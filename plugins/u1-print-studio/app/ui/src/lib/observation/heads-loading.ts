export type MaterialLoadingShape = 'nominal' | 'empty';
export type MaterialLoadingShapes = readonly [MaterialLoadingShape, MaterialLoadingShape, MaterialLoadingShape, MaterialLoadingShape];

export const materialLoadingTemplate = (loading: boolean, shape?: MaterialLoadingShape): string => {
  if (shape !== undefined && (!loading || (shape !== 'nominal' && shape !== 'empty'))) throw new Error('Invalid material loading shape');
  return shape === 'empty' ? '—' : 'Generic PLA';
};

export const checkedMaterialShapes = (loading: boolean, shapes?: MaterialLoadingShapes): MaterialLoadingShapes | undefined => {
  if (shapes !== undefined) {
    if (!loading || !Array.isArray(shapes) || shapes.length !== 4) throw new Error('Invalid material loading shapes');
    for (let index = 0; index < 4; index++) {
      if (shapes[index] !== 'nominal' && shapes[index] !== 'empty') throw new Error('Invalid material loading shapes');
    }
  }
  return shapes;
};
