import { cleanup, fireEvent, render } from '@testing-library/svelte';
import { Box, Grid2X2, List } from 'lucide-svelte';
import { afterEach, describe, expect, test, vi } from 'vitest';
import Switch from './Switch.svelte';
import { validateSwitch } from './switch';

afterEach(cleanup);
const options = [{ value: 'cube', label: 'Surface', icon: Box }, { value: 'grid', label: 'Grid', icon: Grid2X2 }] as const;
const props = { label: 'View', options, value: 'cube', onchange: vi.fn() };

describe('closed two-or-three-option Switch', () => {
  test('explicit focusSelected is focus-only, prevents scrolling and respects disabled/loading', async () => {
    const onchange = vi.fn();
    const { component, getByRole, rerender } = render(Switch, { ...props, value: 'grid', onchange });
    const grid = getByRole('radio', { name: 'Grid' });
    const focus = vi.spyOn(grid, 'focus');
    component.focusSelected();
    expect(focus).toHaveBeenCalledWith({ preventScroll: true });
    expect(grid).toHaveFocus(); expect(onchange).not.toHaveBeenCalled();
    await rerender({ ...props, disabled: true, onchange });
    focus.mockClear(); component.focusSelected(); expect(focus).not.toHaveBeenCalled();
    cleanup();
    const loading = render(Switch, { label: 'View', options, loading: true });
    loading.component.focusSelected(); expect(onchange).not.toHaveBeenCalled();
  });
  test('has one tab stop, decorative icons, controlled selection and selected-click no-op', async () => {
    const onchange = vi.fn();
    const { getByRole, container, rerender } = render(Switch, { ...props, onchange });
    expect(getByRole('radiogroup', { name: 'View' })).toBeInTheDocument();
    const cube = getByRole('radio', { name: 'Surface' }), grid = getByRole('radio', { name: 'Grid' });
    expect(cube).toHaveAttribute('tabindex', '0'); expect(grid).toHaveAttribute('tabindex', '-1');
    expect(cube).toHaveAttribute('aria-checked', 'true'); expect(grid).toHaveAttribute('aria-checked', 'false');
    expect(container.querySelectorAll('svg[aria-hidden="true"]')).toHaveLength(2);
    expect(container.textContent?.trim()).toBe('');
    await fireEvent.click(cube); expect(onchange).not.toHaveBeenCalled();
    await fireEvent.click(grid); expect(onchange).toHaveBeenCalledExactlyOnceWith('grid');
    expect(cube).toHaveAttribute('aria-checked', 'true');
    cube.focus(); await rerender({ ...props, onchange, value: 'grid' });
    expect(grid).toHaveAttribute('aria-checked', 'true'); expect(grid).toHaveAttribute('tabindex', '0');
    expect(cube).toHaveFocus();
  });
  test.each(['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'End'])('%s selects and focuses the other option once', async (key) => {
    const onchange = vi.fn();
    const { getByRole } = render(Switch, { ...props, onchange });
    const cube = getByRole('radio', { name: 'Surface' }), grid = getByRole('radio', { name: 'Grid' });
    cube.focus(); await fireEvent.keyDown(cube, { key });
    expect(onchange).toHaveBeenCalledExactlyOnceWith('grid'); expect(grid).toHaveFocus();
  });
  test.each(['Home', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'])('%s wraps or returns to the first option', async (key) => {
    const onchange = vi.fn();
    const { getByRole } = render(Switch, { ...props, value: 'grid', onchange });
    const grid = getByRole('radio', { name: 'Grid' });
    grid.focus(); await fireEvent.keyDown(grid, { key });
    expect(onchange).toHaveBeenCalledExactlyOnceWith('cube'); expect(getByRole('radio', { name: 'Surface' })).toHaveFocus();
  });
  test.each([' ', 'Enter'])('%s activates the focused option only once and ignores key repeat', async (key) => {
    const onchange = vi.fn();
    const { getByRole } = render(Switch, { ...props, onchange });
    const grid = getByRole('radio', { name: 'Grid' });
    await fireEvent.keyDown(grid, { key }); expect(onchange).toHaveBeenCalledExactlyOnceWith('grid');
    await fireEvent.keyDown(grid, { key, repeat: true }); expect(onchange).toHaveBeenCalledTimes(1);
  });
  test('Tab is untouched and disabled options cannot activate or take focus', async () => {
    const onchange = vi.fn();
    const { getByRole, rerender } = render(Switch, { ...props, onchange });
    expect(await fireEvent.keyDown(getByRole('radio', { name: 'Surface' }), { key: 'Tab' })).toBe(true);
    await rerender({ ...props, onchange, disabled: true });
    for (const radio of [getByRole('radio', { name: 'Surface' }), getByRole('radio', { name: 'Grid' })]) {
      expect(radio).toBeDisabled(); expect(radio).toHaveAttribute('tabindex', '-1');
      await fireEvent.click(radio); await fireEvent.keyDown(radio, { key: 'ArrowRight' });
    }
    expect(onchange).not.toHaveBeenCalled();
  });
  test('loading owns no selected semantics, glyphs, buttons or callback', () => {
    const { container } = render(Switch, { label: 'View', options, loading: true });
    expect(container.querySelector('[data-icon-segmented]')).toHaveAttribute('aria-hidden', 'true');
    expect(container.querySelector('button,svg,[tabindex],[role],[aria-checked],.thumb')).toBeNull();
    expect(container.textContent?.trim()).toBe('');
  });
  test('rejects malformed option tuples and forbidden loading state at runtime', () => {
    for (const change of [
      { options: [] }, { options: [options[0]] }, { options: [...options, options[0]] }, { options: [options[0], options[0]] },
      { label: '' }, { options: [{ ...options[0], label: '' }, options[1]] }, { options: [{ ...options[0], icon: null }, options[1]] },
      { value: 'wrong' }, { onchange: null }, { disabled: 'yes' }, { loading: 'yes' }, { loading: true },
    ]) expect(() => validateSwitch({ ...props, ...change } as never)).toThrow();
    for (const change of [{ value: 'cube' }, { onchange: () => {} }, { disabled: false }]) {
      expect(() => validateSwitch({ label: 'View', options, loading: true, ...change } as never)).toThrow();
    }
  });
  test.each([
    ['cube', 'ArrowRight', 'grid'], ['grid', 'ArrowRight', 'list'], ['list', 'ArrowRight', 'cube'],
    ['cube', 'ArrowLeft', 'list'], ['grid', 'ArrowUp', 'cube'], ['list', 'ArrowDown', 'cube'],
    ['cube', 'End', 'list'], ['list', 'Home', 'cube'],
  ])('three options: %s + %s selects %s', async (value, key, next) => {
    const three = [...options, { value: 'list', label: 'List', icon: List }] as const;
    const onchange = vi.fn();
    const { getAllByRole } = render(Switch, { label: 'View', options: three, value, onchange });
    const radios = getAllByRole('radio');
    const current = radios[three.findIndex(option => option.value === value)];
    current.focus(); await fireEvent.keyDown(current, { key });
    expect(onchange).toHaveBeenCalledExactlyOnceWith(next);
    expect(radios[three.findIndex(option => option.value === next)]).toHaveFocus();
  });
  test('three options preserve DOM and keyboard focus on a service-driven selection', async () => {
    const three = [...options, { value: 'list', label: 'List', icon: List }] as const;
    const onchange = vi.fn();
    const view = render(Switch, { label: 'View', options: three, value: 'grid', onchange });
    const radios = view.getAllByRole('radio'); radios[1].focus();
    await view.rerender({ label: 'View', options: three, value: 'list', onchange });
    expect(view.getAllByRole('radio')).toEqual(radios);
    expect(radios[1]).toHaveFocus(); expect(radios[2]).toHaveAttribute('aria-checked', 'true');
    expect(radios.every(node => !node.textContent?.trim())).toBe(true);
    expect(radios.map(node => node.getAttribute('title'))).toEqual(['Surface', 'Grid', 'List']);
    expect(onchange).not.toHaveBeenCalled();
    expect(() => validateSwitch({ label: 'View', options: [...three, { value: 'fourth', label: 'Fourth', icon: Box }], value: 'cube', onchange } as never)).toThrow();
  });
});
