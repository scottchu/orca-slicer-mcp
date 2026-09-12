import { cleanup, fireEvent, render } from '@testing-library/svelte';
import { tick } from 'svelte';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import TextViewport from '../../../components/common/TextViewport.svelte';

const observers: Array<() => void> = [];
const disconnect = vi.fn();
beforeEach(() => {
  observers.length = 0;
  disconnect.mockClear();
  vi.stubGlobal('ResizeObserver', class {
    constructor(callback: () => void) { observers.push(callback); }
    observe = () => {};
    disconnect = disconnect;
  });
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

describe('TextViewport public structure and exact accessible content', () => {
  it('keeps empty/loading states inert and without value, title or keyboard target', async () => {
    const view = render(TextViewport, { label: 'Profile', loading: true });
    const slot = view.container.querySelector('[data-text-viewport]');
    const scroll = view.container.querySelector('[data-text-scroll]');
    expect(slot?.textContent?.trim()).toBe('');
    expect(scroll).toHaveAttribute('aria-hidden', 'true');
    expect(scroll).toHaveProperty('inert', true);
    expect(scroll).toHaveAttribute('tabindex', '-1');
    expect(view.container.querySelector('[title]')).toBeNull();
    expect(view.container.querySelector('[data-skeleton="caption"]')).toBeTruthy();
    await view.rerender({ label: 'Profile', loading: false });
    expect(view.container.querySelector('[data-text-viewport]')).toBe(slot);
    expect(view.container.querySelector('[data-skeleton]')).toBeNull();
    expect(slot?.textContent?.trim()).toBe('');
    expect(scroll).toHaveAttribute('aria-hidden', 'true');
  });
  it('focuses only actual overflow, exposes exact text and scrolls without trapping Tab', async () => {
    const text = `Profile: ${'𐐀'.repeat(80)}`;
    const view = render(TextViewport, { label: 'Profile', text });
    const scroll = view.container.querySelector<HTMLElement>('[data-text-scroll]')!;
    let width = 150;
    Object.defineProperties(scroll, { clientWidth: { get: () => width }, scrollWidth: { get: () => 1000 } });
    observers.forEach(callback => callback()); await tick();
    expect(view.container.querySelector('.content')?.textContent).toBe(text);
    expect(scroll).toHaveAttribute('tabindex', '0');
    expect(scroll).toHaveAttribute('role', 'region');
    expect(scroll).toHaveAttribute('aria-label', 'Profile');
    expect(scroll).toHaveAccessibleDescription('Scroll horizontally to read the full text. Arrow keys, Home and End scroll this region.');
    scroll.focus();
    await fireEvent.keyDown(scroll, { key: 'ArrowRight' }); expect(scroll.scrollLeft).toBe(112.5);
    await fireEvent.keyDown(scroll, { key: 'End' }); expect(scroll.scrollLeft).toBe(1000);
    await fireEvent.keyDown(scroll, { key: 'Home' }); expect(scroll.scrollLeft).toBe(0);
    expect(await fireEvent.keyDown(scroll, { key: 'Tab' })).toBe(true);
    width = 1200; observers.forEach(callback => callback()); await tick();
    expect(scroll).toHaveAttribute('tabindex', '-1');
    expect(scroll).not.toHaveAttribute('role');
  });
  it('removes previous content and accessible metadata on loading, then releases resize observation', async () => {
    const view = render(TextViewport, { label: 'Profile', text: 'Profile: Reported value' });
    const scroll = view.container.querySelector<HTMLElement>('[data-text-scroll]')!;
    Object.defineProperties(scroll, { clientWidth: { value: 50 }, scrollWidth: { value: 500 } });
    observers.forEach(callback => callback()); await tick();
    await view.rerender({ label: 'Profile', loading: true, text: undefined });
    expect(view.container.textContent).not.toContain('Reported value');
    expect(scroll).not.toHaveAttribute('aria-label');
    expect(scroll).not.toHaveAttribute('aria-describedby');
    expect(scroll).toHaveProperty('inert', true);
    expect(scroll.scrollLeft).toBe(0);
    view.unmount();
    expect(disconnect).toHaveBeenCalledTimes(1);
    observers.forEach(callback => callback()); await tick();
  });
  it('rejects a value supplied to a loading skeleton', () => {
    expect(() => render(TextViewport, { label: 'Profile', loading: true, text: 'private retained value' })).toThrow('cannot carry a value');
  });
});
