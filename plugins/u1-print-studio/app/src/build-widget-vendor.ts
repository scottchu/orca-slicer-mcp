import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { buildWidgetVendorBundle, injectWidgetSharedCss, injectWidgetVendorBundle } from "./widget-vendor.js";

const widgetPath = path.resolve(import.meta.dir, "../public/widget.html");
const cameraWidgetPath = path.resolve(import.meta.dir, "../public/camera-widget.html");
const sharedCssPath = path.resolve(import.meta.dir, "widget-shared.css");
const html = readFileSync(widgetPath, "utf8");
const cameraHtml = readFileSync(cameraWidgetPath, "utf8");
const sharedCss = readFileSync(sharedCssPath, "utf8");
const bundle = await buildWidgetVendorBundle();
writeFileSync(widgetPath, injectWidgetSharedCss(injectWidgetVendorBundle(html, bundle), sharedCss));
writeFileSync(cameraWidgetPath, injectWidgetSharedCss(cameraHtml, sharedCss));
