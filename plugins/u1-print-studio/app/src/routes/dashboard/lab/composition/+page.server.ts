import { createComposableLabData } from '../../../../lib/server/composable-lab-fixture';

export const prerender = true;
export const load = async () => ({ presentations: await createComposableLabData() });
