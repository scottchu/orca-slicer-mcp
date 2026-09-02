import { cleanup, render } from '@testing-library/svelte';
import { afterEach, describe, expect, it } from 'vitest';
import HeadCard from './HeadCard.svelte';
import HeadCards from './HeadCards.svelte';
import { adaptHeads } from '../live/heads-adapter';
import { headCardValue, type HeadCardValue } from '../live/heads-presentation';
import { liveHeadsResult } from '../../../tests/fixtures/live-heads';

afterEach(cleanup);

const reading = (material: string | null): HeadCardValue => ({
  physicalTool: 1, active: true, state: 'active', material,
  presence: true, color: '#3487C880', actual: 220, target: 220,
});

describe('shared HeadCard material row', () => {
  it.each(['Generic PLA', 'Snapmaker PLA Matte', null, `${'V'.repeat(64)} ${'T'.repeat(64)} ${'S'.repeat(64)}`])(
    'renders material %s as one uninterrupted text leaf beside its icon', (material) => {
      const { container } = render(HeadCard, { physicalTool: 1, reading: reading(material) });
      const icon = container.querySelector('.lucide-spool');
      expect(icon).not.toBeNull();
      expect(icon).toHaveAttribute('width', '20');
      expect(icon).toHaveAttribute('height', '20');
      expect(icon).toHaveAttribute('stroke-width', '1.8');
      expect(icon).toHaveAttribute('aria-hidden', 'true');
      expect(icon?.parentElement).toHaveClass('fixed');
      const row = icon!.parentElement!.parentElement!;
      const text = row.querySelector('.caption');
      expect(text?.textContent).toBe(material ?? '—');
      expect(text?.childElementCount).toBe(0);
      expect(text).not.toHaveClass('words');
      expect(row.querySelectorAll('[style]')).toHaveLength(0);
    }
  );

  it('keeps partial material labels contiguous without changing actual producer fields', () => {
    const dto = liveHeadsResult().structuredContent;
    dto.module.items[0].materialType = { state: 'unknown', value: null };
    dto.module.items[0].subtype = { state: 'known', value: 'Matte' };
    dto.module.items[0].material = { state: 'unknown', value: null };
    const card = headCardValue(adaptHeads(dto).items[0]);
    expect(card.material).toBe('Generic Matte');
    const { container } = render(HeadCard, { physicalTool: 1, reading: card });
    expect(container.querySelector('.lucide-spool')?.parentElement?.parentElement?.textContent).toBe('Generic Matte');
  });

  it.each([false, null])('retains configured material with presence %s while keeping empty colors neutral', (presence) => {
    const { container, queryByRole } = render(HeadCard, { physicalTool: 1, reading: { ...reading('Generic PLA'), presence } });
    expect(container).toHaveTextContent('Generic PLA');
    expect(container).toHaveTextContent(presence === false ? 'Empty' : 'N/A');
    expect(container.querySelector('[data-inset-card]')).toHaveClass('neutral', 'active');
    expect(queryByRole('button', { name: /^Copy/ })).toBeNull();
    expect(container.querySelectorAll('.lucide-spool')).toHaveLength(1);
  });

  it('preserves exact color alpha and bottom copy action', () => {
    const { container, getByRole } = render(HeadCard, { physicalTool: 1, reading: reading('Generic PLA') });
    expect(container.querySelector('[data-inset-card]')).toHaveStyle('background-color: rgba(52, 135, 200, 0.030117647058823527)');
    expect(getByRole('button', { name: 'Copy T1 color #3487C880' }).closest('.footer')).not.toBeNull();
  });

  it('retains decorative material icons in loading without private labels or active controls', () => {
    const { container } = render(HeadCards, { items: [reading('Private material fixture')], loading: true });
    expect(container.querySelectorAll('.lucide-spool')).toHaveLength(4);
    expect(container.querySelectorAll('button')).toHaveLength(0);
    expect(container.textContent).not.toContain('Private material fixture');
    expect(container.textContent).not.toContain('220');
    for (const icon of container.querySelectorAll('.lucide-spool')) {
      const skeleton = icon.parentElement?.parentElement?.querySelector('[data-text-skeleton]');
      expect(skeleton).toHaveAttribute('aria-hidden', 'true');
      expect(skeleton?.textContent).toBe('Generic PLA');
    }
  });

  it('uses only closed public per-card templates even if private readings are supplied', () => {
    const { container } = render(HeadCards, { items: [reading('Private material fixture')], loading: true, materialShapes: ['empty', 'nominal', 'empty', 'nominal'] });
    expect([...container.querySelectorAll('[data-text-skeleton]')].map((node) => node.textContent)).toEqual(['—', 'Generic PLA', '—', 'Generic PLA']);
    expect(container.textContent).not.toContain('Private material fixture');
    expect(container.querySelectorAll('button,time')).toHaveLength(0);
  });

  it('rejects ready template overrides at component boundaries', () => {
    expect(() => render(HeadCard, { physicalTool: 1, reading: reading('Generic PLA'), materialShape: 'empty' } as never)).toThrow('Invalid material loading shape');
    expect(() => render(HeadCards, { items: [reading('Generic PLA')], materialShapes: ['empty', 'empty', 'empty', 'empty'] } as never)).toThrow('Invalid material loading shapes');
  });

  it('rejects arbitrary strings rather than turning them into a private skeleton', () => {
    expect(() => render(HeadCard, { physicalTool: 1, loading: true, materialShape: 'Private fixture' } as never)).toThrow('Invalid material loading shape');
    expect(() => render(HeadCards, { loading: true, materialShapes: ['nominal', 'empty', 'private', 'nominal'] } as never)).toThrow('Invalid material loading shapes');
  });
});
