import { cleanup, render } from '@testing-library/svelte';
import { afterEach, describe, expect, it } from 'vitest';
import HeightLegend from './HeightLegend.svelte';

afterEach(cleanup);
const palette = ['#142850', '#ffdd55'];
describe('generic height legend', () => {
  it('places the maximum before the minimum in a vertical legend with exact accessible evidence', () => {
    const { container } = render(HeightLegend, { minimum: -0.3408, maximum: 0.06667, palette });
    const legend = container.querySelector('[data-height-legend]')!;
    expect(legend).toHaveAttribute('data-orientation', 'vertical');
    expect(legend).toHaveAttribute('aria-label', 'Z height, minimum -0.3408 mm, maximum 0.06667 mm');
    expect(legend.querySelector('.high')).toHaveTextContent('0.067'); expect(legend.querySelector('.low')).toHaveTextContent('-0.341');
    expect(legend.querySelector('.high')).toHaveAttribute('title', '0.06667 mm'); expect(legend.querySelector('.low')).toHaveAttribute('title', '-0.3408 mm');
    expect(legend.querySelector('.gradient')).toHaveAttribute('aria-hidden', 'true');
    expect(container.querySelector('button,[tabindex],canvas')).toBeNull();
  });
  it('supports generic units, orientation and placement without a feature import', () => {
    const { container } = render(HeightLegend, { minimum: 0, maximum: 1000000, label: 'Height', unit: 'cm', palette, orientation: 'horizontal', placement: 'end' });
    const legend = container.querySelector('[data-height-legend]')!;
    expect(legend).toHaveClass('horizontal', 'end'); expect(legend).toHaveAttribute('aria-label', 'Height height, minimum 0 cm, maximum 1000000 cm');
    expect(legend.querySelector('.high')).toHaveTextContent('1e6'); expect(legend.querySelector('.low')).toHaveTextContent('0');
  });
  it.each([[null, null], [-0.34, 0.067], [0, 0]] as const)('rail-only mode omits endpoint DOM, skeletons, titles and extra obstacles: %s %s', (minimum, maximum) => {
    const { container } = render(HeightLegend, { minimum, maximum, palette, showEndpoints: false });
    expect(container.querySelector('.endpoint,[data-skeleton],[title],button,[tabindex]')).toBeNull();
    expect(container.querySelectorAll('[data-chart-obstacle]')).toHaveLength(1);
    expect(container.textContent?.trim()).toBe('Z (mm)');
  });
  it('uses one uniform palette midpoint for a flat reported range', () => {
    const { container } = render(HeightLegend, { minimum: 0, maximum: 0, palette: ['#000000', '#778899', '#ffffff'], showEndpoints: false });
    expect((container.querySelector('.gradient') as HTMLElement).style.getPropertyValue('--height-palette')).toBe('#778899,#778899');
  });
  it.each([[null, null], [0, null], [null, 1], [NaN, 1], [0, Infinity], [2, 1]] as const)('unknown/invalid range %s %s shows inert endpoint skeletons', (minimum, maximum) => {
    const { container } = render(HeightLegend, { minimum, maximum, palette });
    expect(container.querySelector('[data-height-legend]')).toHaveAttribute('aria-label', 'Loading Z height legend');
    expect(container.querySelectorAll('[data-skeleton="fill"]')).toHaveLength(2);
    expect(container.textContent).not.toMatch(/NaN|Infinity/);
  });
});
