import path from "node:path";

export const WIDGET_VENDOR_BEGIN = "/* BEGIN GENERATED THREE.JS BED MESH BUNDLE */";
export const WIDGET_VENDOR_END = "/* END GENERATED THREE.JS BED MESH BUNDLE */";
export const WIDGET_SHARED_CSS_BEGIN = "/* BEGIN GENERATED U1 SHARED CSS */";
export const WIDGET_SHARED_CSS_END = "/* END GENERATED U1 SHARED CSS */";
export const THREE_LICENSE_NOTICE = `/*
The MIT License

Copyright © 2010-2026 three.js authors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/`;

export async function buildWidgetVendorBundle(): Promise<string> {
  const result = await Bun.build({
    entrypoints: [path.join(import.meta.dir, "widget-three.ts")],
    target: "browser",
    format: "iife",
    minify: true,
    sourcemap: "none",
  });
  if (!result.success || result.outputs.length !== 1) {
    const detail = result.logs.map((log) => log.message).join("\n");
    throw new Error(`Unable to bundle the bed-mesh renderer${detail ? `: ${detail}` : ""}`);
  }
  const code = (await result.outputs[0]!.text())
    .split("\n")
    .map((line) => line.trimEnd().replace(/^ +\t/, "\t"))
    .join("\n")
    .trim();
  return `${THREE_LICENSE_NOTICE}\n${code}`;
}

export function injectWidgetVendorBundle(html: string, bundle: string): string {
  const start = html.indexOf(WIDGET_VENDOR_BEGIN);
  const end = html.indexOf(WIDGET_VENDOR_END);
  if (start < 0 || end < start) throw new Error("Widget vendor bundle markers are missing or out of order");
  const contentStart = start + WIDGET_VENDOR_BEGIN.length;
  return `${html.slice(0, contentStart)}\n${bundle}\n${html.slice(end)}`;
}

export function readWidgetVendorBundle(html: string): string {
  const start = html.indexOf(WIDGET_VENDOR_BEGIN);
  const end = html.indexOf(WIDGET_VENDOR_END);
  if (start < 0 || end < start) throw new Error("Widget vendor bundle markers are missing or out of order");
  return html.slice(start + WIDGET_VENDOR_BEGIN.length, end).trim();
}

export function injectWidgetSharedCss(html: string, css: string): string {
  const start = html.indexOf(WIDGET_SHARED_CSS_BEGIN);
  const end = html.indexOf(WIDGET_SHARED_CSS_END);
  if (start < 0 || end < start) throw new Error("Widget shared CSS markers are missing or out of order");
  const contentStart = start + WIDGET_SHARED_CSS_BEGIN.length;
  return `${html.slice(0, contentStart)}\n${css.trim()}\n${html.slice(end)}`;
}

export function readWidgetSharedCss(html: string): string {
  const start = html.indexOf(WIDGET_SHARED_CSS_BEGIN);
  const end = html.indexOf(WIDGET_SHARED_CSS_END);
  if (start < 0 || end < start) throw new Error("Widget shared CSS markers are missing or out of order");
  return html.slice(start + WIDGET_SHARED_CSS_BEGIN.length, end).trim();
}
