import { cleanup, render, screen } from '@testing-library/svelte';
import { afterEach, expect, it } from 'vitest';
import ThermalReading from '../../../components/observation/ThermalReading.svelte';
afterEach(cleanup);
it.each([true, false, null])('active=%s is separate from an inferred heater state', (active) => {
  render(ThermalReading, { reading: { id: 'tool-1', actualC: 220, targetC: 200, active } });
  const row = screen.getByRole('listitem', { name: active === null ? 'Tool 1' : active ? 'Tool 1 · Active' : 'Tool 1 · Inactive' });
  expect(row.classList.contains('active')).toBe(active === true);
  expect(row.getAttribute('aria-label')).not.toMatch(/Idle|Parked|Heating|Cooling/);
});
