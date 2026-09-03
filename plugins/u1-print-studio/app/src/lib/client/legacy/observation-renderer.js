// @ts-nocheck
// Preserved observation-v14 DOM renderer. Its formerly inline JavaScript stays
// unchanged in meaning; the typed adapter owns host protocol and deadlines.
/* Feather Icons v4.29.2 (https://feathericons.com), MIT License.
Copyright (c) 2013-2023 Cole Bemis
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

Lucide Icons v0.468.0 (https://lucide.dev), ISC License.
Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2022 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2022.
Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.
THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
*/
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
const meshLibrary = { THREE, OrbitControls };
const VIEWS = ['overview', 'progress', 'thermals', 'heads', 'jobs', 'job_history', 'queue', 'fans', 'bed_mesh'];

export const mountLegacyRenderer = (modulesElement, selectedView, refreshResult, notifyHeight = () => {}) => {
let observation = null;
let acceptedResult = false;
let refreshPending = false;
let disposed = false;
const escapeHtml = (value) => String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
const validNumber = (value) => typeof value === "number" && Number.isFinite(value);
const valueOf = (field) => field?.state === "known" || field?.state === "stale" ? field.value : null;
const formatTemperature = (field) => validNumber(valueOf(field)) ? `${Math.round(field.value)}°` : "Unknown";
const formatDuration = (field) => { const seconds = valueOf(field); if (!validNumber(seconds)) return "Unknown"; const minutes = Math.max(0, Math.round(seconds / 60)); return minutes < 60 ? `${minutes}m` : `${Math.floor(minutes / 60)}h ${minutes % 60}m`; };
const observedLabel = (value) => { const date = typeof value === "string" && value ? new Date(value) : null; return !date || Number.isNaN(date.valueOf()) ? "Observation time unavailable" : `Observed ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}`; };
const freshnessLabel = (state) => ({ fresh: "", stale: "Stale", offline: "Offline", unknown: "Freshness unknown" })[state] ?? "Freshness unknown";
const observationInfo = (sourceObservedAt = observation?.sourceObservedAt, freshnessState = observation?.freshness) => { const freshness = freshnessLabel(freshnessState); return `<div class="instrument-info u1-meta"><time>${escapeHtml(observedLabel(sourceObservedAt))}${freshness ? ` <span class="freshness-warning">· ${escapeHtml(freshness)}</span>` : ""}</time></div>`; };
// Feather Icons 4.29.2, MIT; full notice is bundled in this document.
const icons = Object.freeze({"printer":"<svg aria-hidden=\"true\" data-icon=\"feather-printer\" xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><polyline points=\"6 9 6 2 18 2 18 9\"/><path d=\"M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2\"/><rect x=\"6\" y=\"14\" width=\"12\" height=\"8\"/></svg>","clock":"<svg aria-hidden=\"true\" data-icon=\"feather-clock\" xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"12\" cy=\"12\" r=\"10\"/><polyline points=\"12 6 12 12 16 14\"/></svg>","thermometer":"<svg aria-hidden=\"true\" data-icon=\"feather-thermometer\" xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z\"/></svg>","layers":"<svg aria-hidden=\"true\" data-icon=\"feather-layers\" xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><polygon points=\"12 2 2 7 12 12 22 7 12 2\"/><polyline points=\"2 17 12 22 22 17\"/><polyline points=\"2 12 12 17 22 12\"/></svg>","file-text":"<svg aria-hidden=\"true\" data-icon=\"feather-file-text\" xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z\"/><polyline points=\"14 2 14 8 20 8\"/><line x1=\"16\" y1=\"13\" x2=\"8\" y2=\"13\"/><line x1=\"16\" y1=\"17\" x2=\"8\" y2=\"17\"/><polyline points=\"10 9 9 9 8 9\"/></svg>","list":"<svg aria-hidden=\"true\" data-icon=\"feather-list\" xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><line x1=\"8\" y1=\"6\" x2=\"21\" y2=\"6\"/><line x1=\"8\" y1=\"12\" x2=\"21\" y2=\"12\"/><line x1=\"8\" y1=\"18\" x2=\"21\" y2=\"18\"/><line x1=\"3\" y1=\"6\" x2=\"3.01\" y2=\"6\"/><line x1=\"3\" y1=\"12\" x2=\"3.01\" y2=\"12\"/><line x1=\"3\" y1=\"18\" x2=\"3.01\" y2=\"18\"/></svg>","fan":"<svg aria-hidden=\"true\" data-icon=\"lucide-fan\" xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M10.827 16.379a6.082 6.082 0 0 1-8.618-7.002l5.412 1.45a6.082 6.082 0 0 1 7.002-8.618l-1.45 5.412a6.082 6.082 0 0 1 8.618 7.002l-5.412-1.45a6.082 6.082 0 0 1-7.002 8.618l1.45-5.412Z\"/><path d=\"M12 12v.01\"/></svg>","wind":"<svg aria-hidden=\"true\" data-icon=\"lucide-wind\" xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M12.8 19.6A2 2 0 1 0 14 16H2\"/><path d=\"M17.5 8a2.5 2.5 0 1 1 2 4H2\"/><path d=\"M9.8 4.4A2 2 0 1 1 11 8H2\"/></svg>","grid":"<svg aria-hidden=\"true\" data-icon=\"feather-grid\" xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"3\" y=\"3\" width=\"7\" height=\"7\"/><rect x=\"14\" y=\"3\" width=\"7\" height=\"7\"/><rect x=\"14\" y=\"14\" width=\"7\" height=\"7\"/><rect x=\"3\" y=\"14\" width=\"7\" height=\"7\"/></svg>","activity":"<svg aria-hidden=\"true\" data-icon=\"feather-activity\" xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><polyline points=\"22 12 18 12 15 21 9 3 6 12 2 12\"/></svg>","refresh-cw":"<svg aria-hidden=\"true\" data-icon=\"feather-refresh-cw\" xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><polyline points=\"23 4 23 10 17 10\"/><polyline points=\"1 20 1 14 7 14\"/><path d=\"M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15\"/></svg>"});
const icon = (name) => icons[name] ?? icons.activity;
const meshIcons = Object.freeze({
  box: '<svg aria-hidden="true" data-icon="feather-box" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>',
  "rotate-ccw": '<svg aria-hidden="true" data-icon="feather-rotate-ccw" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>',
});
const meshIcon = name => meshIcons[name] ?? icon(name);
const titleIcons = Object.freeze({ "Print Progress": "printer", Thermals: "thermometer", "Heads & Filaments": "layers", "Current Job": "file-text", "Job History": "clock", "Print Queue": "list", "Fans & Air": "wind", "Bed Mesh": "grid", Overview: "activity" });
const footerStatus = (message = "") => `<span class="refresh-error" role="status" aria-label="${escapeHtml(message)}">${message ? "Could not load" : ""}</span>`;
const provenance = () => `<footer class="instrument-footer u1-footer"><div class="u1-primary-actions">${footerStatus()}<button class="refresh u1-action u1-action--round" type="button" title="Refresh observation" aria-label="Refresh observation">${icon("refresh-cw")}</button></div></footer>`;
const header = (title, showObservation = true, sourceObservedAt = observation?.sourceObservedAt, freshness = observation?.freshness, message = "", trailing = "") => `<header class="instrument-header u1-header"><span class="icon-tile u1-icon-tile" aria-hidden="true">${icon(titleIcons[title])}</span><div class="instrument-title u1-header-copy"><h2 class="u1-title">${escapeHtml(title)}</h2>${showObservation ? observationInfo(sourceObservedAt, freshness) : ""}${message ? `<div class="domain-warning" role="status">${escapeHtml(message)}</div>` : ""}</div>${trailing ? `<div class="u1-header-result">${trailing}</div>` : ""}</header>`;
const layerPosition = (fields) => {
  const current = valueOf(fields?.currentLayer); const total = valueOf(fields?.totalLayers);
  return Number.isSafeInteger(current) && Number.isSafeInteger(total) && total > 0 && current >= 0 && current <= total ? { current, total } : null;
};
const renderProgress = (data) => {
  const fields = data?.fields; const rawPercent = valueOf(fields?.percent);
  const percent = validNumber(rawPercent) && rawPercent >= 0 && rawPercent <= 100 ? rawPercent : null;
  const position = layerPosition(fields);
  const layers = position ? `Layer <strong class="layer-current">${position.current}</strong> / ${position.total}` : "Layer progress unavailable";
  const result = `<div class="progress-result"><strong class="progress-percent${percent === null ? " unknown" : ""}">${percent === null ? "Unknown" : `${percent.toFixed(percent % 1 ? 1 : 0)}%`}</strong><span class="progress-state">${escapeHtml(observation.printerStateLabel)}</span></div>`;
  const track = percent === null
    ? '<div class="progress-track unavailable" role="progressbar" aria-label="Reported print progress" aria-valuetext="Reported progress unavailable"></div>'
    : `<div class="progress-track" role="progressbar" aria-label="Reported print progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${percent}"><div class="progress-fill" style="width:${percent}%"></div></div>`;
  const elapsed = valueOf(fields?.elapsedSeconds);
  const metrics = validNumber(elapsed) && elapsed >= 0 ? `<dl class="progress-metrics u1-facts"><div><dt><span class="metric-icon">${icon("clock")}</span>Elapsed</dt><dd>${escapeHtml(formatDuration(fields.elapsedSeconds))}</dd></div></dl>` : "";
  const remaining = valueOf(fields?.estimatedRemainingSeconds);
  const eta = validNumber(remaining) && remaining >= 0 ? `About ${escapeHtml(formatDuration(fields.estimatedRemainingSeconds))} left` : "Estimate unknown";
  return `<section class="instrument u1-card progress-instrument">${header("Print Progress", true, observation.sourceObservedAt, observation.freshness, "", result)}<div class="progress-body u1-body">${track}<div class="progress-meta"><span>${layers}</span><span><span class="metric-icon">${icon("clock")}</span>${eta}</span></div>${metrics}</div>${provenance()}</section>`;
};
const renderThermals = (data) => {
  const environment = data?.environment; const environmentState = environment?.state ?? "unknown";
  const cavity = (data?.readings ?? []).find(reading => reading?.id === "cavity");
  const reasons = { unsupported: "Attempted environment endpoint unsupported", unauthorized: "Environment access denied", timeout: "Environment request timed out", malformed: "Environment response unreadable", too_large: "Environment response too large", not_configured: "Environment connection not configured", network: "Environment endpoint unreachable", http_error: "Environment request failed" };
  const environmentStatus = environmentState === "known" && cavity?.reportedState === "not_reported" ? "Temperature not reported" : environmentState === "unknown" ? "Not observed" : environmentState === "unsupported" ? reasons.unsupported : environmentState === "unavailable" ? reasons[environment?.reason] ?? "Unavailable" : environmentState === "stale" ? `${reasons[environment?.reason] ?? "Refresh failed"}; last observation retained` : "";
  const rows = (data?.readings ?? []).map((reading) => {
    const known = reading.state === "known" || reading.state === "stale"; const toolReading = reading.id.startsWith("tool-");
    if (reading.id === "cavity") { const detail = known ? `${observedLabel(environment?.sourceObservedAt)}${environmentState === "stale" ? " · Stale" : ""}` : `${environmentStatus || "Not reported"}${environment?.sourceObservedAt ? ` · ${observedLabel(environment.sourceObservedAt)}` : ""}`; return `<div class="strip u1-data-row zone-row"><div class="identity"><span><strong>Cavity</strong><span class="micro">${escapeHtml(detail)}</span></span></div><div class="reading${known ? "" : " unavailable"}"><small>Actual</small><strong>${escapeHtml(formatTemperature(reading.actual))}</strong></div></div>`; }
    const active = valueOf(reading.active) === true; const badge = toolReading ? `<span class="roundel">T${escapeHtml(reading.id.slice(-1))}</span>` : "";
    return `<div class="strip u1-data-row${active ? " active" : ""}${toolReading ? "" : " zone-row"}"><div class="identity">${badge}<span><strong>${escapeHtml(reading.label)}</strong><span class="micro">${active ? '<span class="dot"></span>Active' : escapeHtml(valueOf(reading.heaterState) ?? "Unknown")}</span></span></div><div class="reading${known ? "" : " unavailable"}"><small>Actual</small><strong>${escapeHtml(formatTemperature(reading.actual))}</strong></div><div class="reading${known ? "" : " unavailable"}"><small>Target</small><strong>${escapeHtml(formatTemperature(reading.target))}</strong></div></div>`;
  }).join("");
  return `<section class="instrument u1-card">${header("Thermals")}<div class="u1-body"><div class="strip-list">${rows}</div></div>${provenance(data?.provenance)}</section>`;
};
const materialColor = (raw) => typeof raw === "string" && /^#(?:[0-9a-f]{6}|[0-9a-f]{8})$/i.test(raw) ? raw.toUpperCase() : null;
const materialTint = (color) => {
  // Preserve the reported RGBA swatch; only the card gets a solid 6% wash on white.
  const amount = 0.06 * (color.length === 9 ? parseInt(color.slice(7, 9), 16) / 255 : 1);
  return `#${[1, 3, 5].map(start => Math.round(255 + (parseInt(color.slice(start, start + 2), 16) - 255) * amount).toString(16).padStart(2, "0")).join("").toUpperCase()}`;
};
// Feather copy, v4.29.2 (MIT); shares the full notice above.
const materialCopyIcon = '<svg aria-hidden="true" data-icon="feather-copy" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
const bindMaterialCopy = () => {
  modulesElement.querySelectorAll(".material-copy").forEach(button => button.addEventListener("click", async () => {
    const color = materialColor(button.dataset.color);
    const feedback = button.closest(".head-card")?.querySelector(".material-copy-feedback");
    if (!color || !feedback || button.disabled) return;
    const outcome = text => { if (button.isConnected === false) return; feedback.textContent = text; notifyHeight(); };
    const clipboard = globalThis.navigator?.clipboard;
    if (typeof clipboard?.writeText !== "function") { outcome("Copy unavailable here. Select the color code to copy it manually."); return; }
    button.disabled = true;
    button.setAttribute("aria-busy", "true");
    outcome("Copying color…");
    try { await clipboard.writeText(color); outcome(`Copied ${color}`); }
    catch { outcome("Couldn’t copy. Select the color code to copy it manually."); }
    finally { button.disabled = false; button.setAttribute("aria-busy", "false"); }
  }));
};
const renderHeads = (data) => {
  const materialData = data?.materials;
  const materialState = materialData?.state ?? "unknown";
  const materialStatus = ({ unknown: "Material data unknown", unsupported: "Material data unsupported", unavailable: "Material data unavailable", stale: "Stale material data" })[materialState] ?? "";
  const materialTime = observedLabel(materialData?.sourceObservedAt);
  const failed = materialState === "stale" && materialData?.reason ? " · Refresh failed; last observation retained" : "";
  const cards = [1, 2, 3, 4].map((physicalTool) => {
    const head = (data?.items ?? []).find(item => item.physicalTool === physicalTool) ?? {};
    const active = valueOf(head.active) === true;
    const presence = valueOf(head.reportedPresence);
    const loaded = presence === true;
    const empty = presence === false;
    const color = loaded ? materialColor(valueOf(head.color)) : null;
    const rawState = valueOf(head.headState);
    const headState = active ? "Active" : ({ PARKED: "Parked", ACTIVE: "Active", UNKNOWN: "Unknown" })[rawState] ?? rawState ?? "Unknown";
    const reportedMaterial = [valueOf(head.vendor) || "N/A", valueOf(head.materialType) || "N/A", valueOf(head.subtype) || "N/A"].join(" ");
    const material = empty ? "Empty" : loaded ? reportedMaterial || "N/A" : "N/A";
    const colorMarkup = empty
      ? '<span class="material-swatch empty" role="img" aria-label="Empty filament slot"></span>'
      : color
        ? `<span class="material-swatch" aria-hidden="true" style="background-color:${color}"></span><span class="material-hex">${color}</span><button type="button" class="material-copy" data-color="${color}" aria-label="Copy Tool ${physicalTool} color ${color}" title="Copy color">${materialCopyIcon}</button>`
        : '<span class="material-hex">N/A</span>';
    return `<article class="head-card u1-data-row${active ? " active" : ""}${empty ? " empty" : ""}" aria-label="Tool ${physicalTool}"${color ? ` style="background-color:${materialTint(color)}"` : ""}><div class="head-heading"><strong>T${physicalTool}</strong><span class="head-state">${escapeHtml(headState)}</span></div><div class="material">${escapeHtml(material)}</div><div class="temperature" aria-label="Current ${escapeHtml(formatTemperature(head.temperature))}, target ${escapeHtml(formatTemperature(head.target))} Celsius"><span class="metric-icon">${icon("thermometer")}</span><span>${escapeHtml(formatTemperature(head.temperature))} / ${escapeHtml(formatTemperature(head.target))}</span></div><div class="material-color">${colorMarkup}</div><p class="material-copy-feedback" role="status" aria-live="polite"></p></article>`;
  }).join("");
  return `<section class="instrument u1-card">${header("Heads & Filaments")}<div class="u1-body"><p class="material-info u1-meta">Printer-reported material · ${escapeHtml(materialTime)}${materialStatus ? ` · ${escapeHtml(materialStatus)}` : ""}${failed}</p><div class="head-grid">${cards}</div></div>${provenance(data?.provenance)}</section>`;
};
const safeFilename = value => typeof value === "string" && value.length > 0 && Array.from(value).length <= 160 && /^[\p{L}\p{M}\p{N} ._()+-]+$/u.test(value) && !/(?:^|[^a-z0-9])(?:gh[pousr]_[a-z0-9]{16,255}|github_pat_[a-z0-9_]{16,255}|glpat-[a-z0-9_-]{16,255}|xox[baprs]-[a-z0-9-]{16,255}|(?:AKIA|ASIA)[a-z0-9]{16})/i.test(value) && !/\b(?:bearer|basic)\s+|\b(?:api[-_ ]?key|(?:access|refresh)[-_ ]?token|password|secret|credential)[ _.-]+\S|\bsk-(?:proj-)?[a-z0-9_-]{8,}|\beyJ[a-z0-9_-]+\.[a-z0-9_-]+\.[a-z0-9_-]+/i.test(value);
const validReceipt = (data) => typeof data?.sourceObservedAt === "string" && data.sourceObservedAt.length <= 40 && Number.isFinite(new Date(data.sourceObservedAt).valueOf()) && (data.freshness === "fresh" || data.freshness === "stale") && (data.state === "stale") === (data.freshness === "stale");
const validReported = (field, validate, nullable = false) => field && typeof field.reported === "boolean" && (field.reported ? (nullable && field.value === null) || validate(field.value) : field.value === null);
const boundedFact = value => validNumber(value) && value >= 0 && value <= Number.MAX_SAFE_INTEGER;
const jobReasons = { unsupported: "The attempted Current Job endpoint was unsupported.", unauthorized: "Current Job access was denied.", timeout: "The Current Job request timed out.", malformed: "The Current Job response could not be read.", too_large: "The Current Job response exceeded the supported limit.", not_configured: "Current Job connection is not configured.", network: "Couldn’t reach the Current Job endpoint.", http_error: "The Current Job request failed." };
const historyReasons = { unsupported: "The attempted Job History endpoint was unsupported.", unauthorized: "Job History access was denied.", timeout: "The Job History request timed out.", malformed: "The Job History response could not be read.", too_large: "The Job History response exceeded the supported limit.", not_configured: "Job History connection is not configured.", network: "Couldn’t reach the Job History endpoint.", http_error: "The Job History request failed." };
const factDuration = value => boundedFact(value) ? formatDuration({ state: "known", value }) : "Not reported";
const factBytes = value => Number.isSafeInteger(value) && value >= 0 ? `${value.toLocaleString()} bytes` : "Not reported";
const factTime = value => { const date = typeof value === "string" && value.length <= 40 ? new Date(value) : null; return date && Number.isFinite(date.valueOf()) ? date.toLocaleString([], { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "Not reported"; };
const renderJobs = (data) => {
  const observed = data?.state === "known" || data?.state === "stale"; const retained = data?.state === "stale";
  const states = ["standby", "printing", "paused", "complete", "error", "cancelled", "unknown"];
  const valid = observed && validReceipt(data) && validReported(data.printState, value => states.includes(value)) &&
    validReported(data.filename, safeFilename, true) && validReported(data.storageActive, value => typeof value === "boolean") &&
    validReported(data.filePositionBytes, value => Number.isSafeInteger(value) && value >= 0) && validReported(data.fileSizeBytes, value => Number.isSafeInteger(value) && value >= 0) &&
    validReported(data.totalDurationSeconds, boundedFact) && validReported(data.printDurationSeconds, boundedFact) && validReported(data.filamentUsedMillimeters, boundedFact);
  const reason = jobReasons[data?.reason] ?? ""; const warning = retained && valid ? `${reason ? `${reason} ` : ""}Showing the last observed Current Job facts.` : reason;
  if (!valid) { const title = data?.state === "unsupported" ? "Current Job endpoint unsupported" : data?.state === "unavailable" ? "Current Job unavailable" : "Current Job not observed"; const detail = data?.state === "unknown" ? "Refresh to request Current Job facts." : "No Current Job facts are available."; return `<section class="instrument u1-card">${header("Current Job", true, null, "unknown", warning)}<div class="u1-body"><div class="empty-panel"><strong>${title}</strong>${detail}</div></div>${provenance()}</section>`; }
  const state = data.printState.reported ? data.printState.value : null;
  const stateLabel = ({ standby: "Standby", printing: "Printing", paused: "Paused", complete: "Complete", error: "Error", cancelled: "Cancelled", unknown: "Unknown" })[state] ?? "Not reported";
  const context = ({ printing: "Current job", paused: "Paused job", standby: "Loaded file", complete: "Last reported job", error: "Last reported job", cancelled: "Last reported job", unknown: "Reported file" })[state] ?? "File";
  const name = !data.filename.reported ? "Not reported" : data.filename.value ?? "No loaded file";
  const storage = !data.storageActive.reported ? "Not reported" : data.storageActive.value ? "Active" : "Inactive";
  const facts = [["Print state", stateLabel], ["Storage", storage], ["Printing time", factDuration(data.printDurationSeconds.value)], ["Total time", factDuration(data.totalDurationSeconds.value)], ["Filament", boundedFact(data.filamentUsedMillimeters.value) ? `${data.filamentUsedMillimeters.value.toLocaleString()} mm` : "Not reported"], ["File position", factBytes(data.filePositionBytes.value)], ["File size", factBytes(data.fileSizeBytes.value)]];
  return `<section class="instrument u1-card">${header("Current Job", true, data.sourceObservedAt, retained ? "stale" : data.freshness, warning)}<div class="u1-body"><div class="job-current"><span class="job-context">${context}</span><strong>${escapeHtml(name)}</strong><dl class="job-facts u1-facts">${facts.map(([label, value]) => `<div><dt>${label}</dt><dd>${escapeHtml(value)}</dd></div>`).join("")}</dl></div></div>${provenance()}</section>`;
};
const renderJobHistory = (data) => {
  const observed = data?.state === "known" || data?.state === "stale"; const retained = data?.state === "stale";
  const statuses = ["in_progress", "completed", "cancelled", "error", "klippy_shutdown", "klippy_disconnect", "interrupted", "unknown"];
  const validTime = value => { if (value === null) return true; if (typeof value !== "string" || value.length > 40) return false; const milliseconds = new Date(value).valueOf(); return Number.isFinite(milliseconds) && milliseconds >= 0 && milliseconds <= 253402300799000; };
  const validItem = (item, index) => item?.position === index + 1 && safeFilename(item.filename) && statuses.includes(item.status) && validTime(item.startTime) && validTime(item.endTime) && [item.printDurationSeconds, item.totalDurationSeconds, item.filamentUsedMillimeters].every(value => value === null || boundedFact(value));
  const valid = observed && validReceipt(data) && Number.isSafeInteger(data.pageCount) && data.pageCount >= 0 && data.pageCount <= 20 && Array.isArray(data.items) && data.items.length === data.pageCount && data.items.every(validItem);
  const reason = historyReasons[data?.reason] ?? ""; const warning = retained && valid ? `${reason ? `${reason} ` : ""}Showing the last observed Job History page.` : reason;
  if (!valid) { const title = data?.state === "unsupported" ? "Job History endpoint unsupported" : data?.state === "unavailable" ? "Job History unavailable" : "Job History not observed"; const detail = data?.state === "unknown" ? "Refresh to request the latest Job History page." : "No current Job History page is available."; return `<section class="instrument u1-card">${header("Job History", true, null, "unknown", warning)}<div class="u1-body"><div class="empty-panel"><strong>${title}</strong>${detail}</div></div>${provenance()}</section>`; }
  const statusLabel = value => ({ in_progress: "In progress", completed: "Completed", cancelled: "Cancelled", error: "Error", klippy_shutdown: "Klippy shutdown", klippy_disconnect: "Klippy disconnected", interrupted: "Interrupted", unknown: "Unknown" })[value];
  const body = data.pageCount === 0 ? '<div class="empty-panel"><strong>No history entries returned</strong>This latest-page query returned no rows; it does not establish that no past jobs exist.</div>' : `<ol class="history-list" aria-label="Latest jobs returned">${data.items.map(item => `<li class="history-item u1-data-row"><div class="history-heading"><strong class="history-name">${escapeHtml(item.filename)}</strong><span class="history-status">${statusLabel(item.status)}</span></div><div class="history-meta"><span>Started ${escapeHtml(factTime(item.startTime))}</span><span>${item.endTime === null ? "End not reported" : `Ended ${escapeHtml(factTime(item.endTime))}`}</span><span>Printing ${escapeHtml(factDuration(item.printDurationSeconds))}</span><span>Total ${escapeHtml(factDuration(item.totalDurationSeconds))}</span><span>Filament ${boundedFact(item.filamentUsedMillimeters) ? `${item.filamentUsedMillimeters.toLocaleString()} mm` : "Not reported"}</span></div></li>`).join("")}</ol>`;
  return `<section class="instrument u1-card">${header("Job History", true, data.sourceObservedAt, retained ? "stale" : data.freshness, warning)}<div class="u1-body"><p class="history-summary u1-facts">Latest jobs returned <strong>${data.pageCount}</strong></p>${body}</div>${provenance()}</section>`;
};
const renderQueue = (data) => {
  const stateLabel = ({ ready: "Ready", loading: "Loading", starting: "Starting", paused: "Paused" })[data?.queueState];
  const retained = data?.state === "stale";
  const valid = (data?.state === "known" || retained) && Boolean(stateLabel) && Number.isSafeInteger(data?.totalCount) && data.totalCount >= 0 && data.totalCount <= 1000 && Array.isArray(data.items) && data.items.length === Math.min(data.totalCount, 100) && data.truncated === (data.totalCount > 100) && data.items.every((item, index) => item?.position === index + 1 && safeFilename(item.filename));
  const reasons = { unsupported: "This print queue endpoint is not supported.", unauthorized: "Print Queue access was denied.", timeout: "The print queue request timed out.", malformed: "The print queue response could not be read.", too_large: "The print queue response exceeded the supported limit.", not_configured: "Print Queue connection is not configured.", network: "Couldn’t reach the print queue.", http_error: "The print queue request failed." };
  const reason = reasons[data?.reason] ?? "";
  const warning = retained && valid ? `${reason ? `${reason} ` : ""}Showing the last observed print queue; it may have changed.` : reason;
  const dateLabel = value => { const date = typeof value === "string" && value ? new Date(value) : null; return date && Number.isFinite(date.valueOf()) ? date.toLocaleString([], { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "Unknown"; };
  const waitLabel = value => validNumber(value) && value >= 0 ? (value < 60 ? `${Math.floor(value)}s` : formatDuration({ state: "known", value })) : "Unknown";
  let body;
  if (valid) {
    const countLabel = `${data.totalCount} ${data.totalCount === 1 ? "job" : "jobs"}`;
    body = `<div class="queue-summary u1-facts"><span>${retained ? "Last observed state" : "Print Queue state"} <strong>${stateLabel}</strong></span><span>${retained ? "Last observed count" : "Queued"} <strong>${countLabel}</strong></span></div>`;
    body += data.totalCount === 0 ? `<div class="empty-panel"><strong>${retained ? "Last observed print queue was empty" : "Print queue empty"}</strong>${retained ? "Refresh to check the current print queue." : "No jobs were queued at this observation."}</div>` : `<ol class="queue-list" aria-label="Reported print queue order">${data.items.map(item => `<li class="queue-item u1-data-row"><span class="queue-position" aria-hidden="true">${item.position}</span><div><strong class="queue-name">${escapeHtml(item.filename)}</strong><div class="queue-times"><span>Added ${escapeHtml(dateLabel(item.timeAdded))}</span><span>Waited at observation ${escapeHtml(waitLabel(item.timeInQueueSeconds))}</span></div></div></li>`).join("")}</ol>`;
    if (data.truncated) { const omitted = data.totalCount - data.items.length; body += `<p class="queue-note">Showing 100 of ${data.totalCount} queued jobs. ${omitted} ${omitted === 1 ? "job is" : "jobs are"} not displayed.</p>`; }
  } else {
    const unknown = data?.state === "unknown";
    const unsupported = data?.state === "unsupported";
    body = `<div class="empty-panel"><strong>${unknown ? "Print Queue not observed" : unsupported ? "Print Queue unsupported" : "Print Queue unavailable"}</strong>${unknown ? "Refresh to request the print queue." : unsupported ? "The attempted Print Queue endpoint was unsupported." : "No current print queue values are available."}</div>`;
  }
  return `<section class="instrument u1-card">${header("Print Queue", true, valid ? data.sourceObservedAt : null, valid ? retained ? "stale" : data.freshness : "unknown", warning)}<div class="u1-body">${body}</div>${provenance()}</section>`;
};
const renderFans = (data) => {
  const observed = data?.state === "known" || data?.state === "stale";
  const retained = data?.state === "stale";
  const reasons = { unsupported: "The attempted environment endpoint was unsupported.", unauthorized: "Environment access was denied.", timeout: "The environment request timed out.", malformed: "The environment response could not be read.", too_large: "The environment response exceeded the supported limit.", not_configured: "Environment connection is not configured.", network: "Couldn’t reach the environment endpoint.", http_error: "The environment request failed." };
  const reason = reasons[data?.reason] ?? "";
  const warning = retained ? `${reason ? `${reason} ` : ""}Showing the last observed fan and purifier readings.` : reason;
  if (!observed) {
    const title = data?.state === "unsupported" ? "Environment endpoint unsupported" : data?.state === "unavailable" ? "Fans unavailable" : "Fans not observed";
    const detail = data?.state === "unsupported" ? "The attempted endpoint was unsupported; this does not establish a hardware limitation." : data?.state === "unavailable" ? "No current fan or purifier readings are available." : "Refresh to request fan and purifier readings.";
    return `<section class="instrument u1-card">${header("Fans & Air", true, null, "unknown", warning)}<div class="u1-body"><div class="empty-panel"><strong>${title}</strong>${detail}</div></div>${provenance()}</section>`;
  }
  const fanDefinitions = [
    ["tool-1-part", "Tool 1 part cooling", "part_cooling"], ["tool-2-part", "Tool 2 part cooling", "part_cooling"],
    ["tool-3-part", "Tool 3 part cooling", "part_cooling"], ["tool-4-part", "Tool 4 part cooling", "part_cooling"],
    ["cavity", "Cavity fan", "air_handling"], ["purifier-exhaust", "Purifier exhaust", "air_handling"],
    ["purifier-inner", "Purifier inner fan", "air_handling"],
  ];
  const validFan = (fan, definition) => fan?.id === definition[0] && fan?.label === definition[1] && fan?.group === definition[2] && (fan.state === "known" || fan.state === "not_reported") && typeof fan.speedReported === "boolean" && typeof fan.rpmReported === "boolean" && (fan.speedFraction === null || validNumber(fan.speedFraction) && fan.speedFraction >= 0 && fan.speedFraction <= 1) && (fan.rpm === null || validNumber(fan.rpm) && fan.rpm >= 0 && fan.rpm <= 1000000) && (!fan.speedReported ? fan.speedFraction === null : fan.speedFraction !== null) && (!fan.rpmReported ? fan.rpm === null : true) && (fan.state === "known" ? fan.speedReported || fan.rpmReported : !fan.speedReported && !fan.rpmReported);
  const validPurifier = data?.purifier && (data.purifier.state === "known" || data.purifier.state === "not_reported") && (data.purifier.powerDetected === true || data.purifier.powerDetected === false || data.purifier.powerDetected === null) && ["idle", "cool_chamber", "preheat_chamber", "hot_chamber", null].includes(data.purifier.mode) && (data.purifier.state === "known" ? typeof data.purifier.powerDetected === "boolean" : data.purifier.powerDetected === null && data.purifier.mode === null) && (data.purifier.powerDetected === true || data.purifier.mode === null);
  const sourceTime = data?.provenance?.sourceObservedAt; const validReceipt = typeof sourceTime === "string" && sourceTime.length <= 40 && Number.isFinite(new Date(sourceTime).valueOf()) && data.provenance?.source === "moonraker" && (data.freshness === "fresh" || data.freshness === "stale") && (data.state === "stale") === (data.freshness === "stale");
  const valid = observed && validReceipt && Array.isArray(data.items) && data.items.length === fanDefinitions.length && data.items.every((fan, index) => validFan(fan, fanDefinitions[index])) && validPurifier;
  if (!valid) return `<section class="instrument u1-card">${header("Fans & Air", true, null, "unknown", "Fan and purifier data could not be read.")}<div class="u1-body"><div class="empty-panel"><strong>Fans unavailable</strong>No current fan or purifier readings are available.</div></div>${provenance()}</section>`;
  const formatFan = fan => {
    const known = fan.state === "known";
    const speed = known && fan.speedReported ? fan.speedFraction : null;
    const rpm = known && fan.rpmReported ? fan.rpm : null;
    const percent = speed === null ? null : Math.max(0, Math.min(100, Math.round(speed * 100)));
    const speedLabel = percent === null ? "N/A" : `${percent}%`;
    const rpmLabel = rpm === null ? "N/A" : speed === 0 && rpm === 0 ? "Off" : `${Math.round(rpm)} RPM`;
    return `<div class="fan-row u1-data-row"${percent === null ? "" : ` style="--fan-level:${percent}%"`}><span class="fan-fill" aria-hidden="true"></span><span class="fan-icon">${icon("fan")}</span><span class="fan-name"><strong>${escapeHtml(fan.label)}</strong><span class="fan-percent">${speedLabel}</span></span><span class="fan-result">${rpmLabel}</span></div>`;
  };
  const purifier = data?.purifier ?? {}; const power = purifier.state === "known" ? purifier.powerDetected : null;
  const purifierLabel = power === true ? ({ idle: "Idle", cool_chamber: "Cool chamber", preheat_chamber: "Preheat chamber", hot_chamber: "Hot chamber" })[purifier.mode] ?? "N/A" : power === false ? "Not detected" : "N/A";
  const purifierRow = `<div class="fan-row u1-data-row"><span class="fan-icon">${icon("wind")}</span><span class="fan-name"><strong>Purifier</strong></span><span class="fan-result">${escapeHtml(purifierLabel)}</span></div>`;
  const part = (data.items ?? []).filter(item => item.group === "part_cooling").map(formatFan).join("");
  const air = (data.items ?? []).filter(item => item.group === "air_handling").map(formatFan).join("");
  return `<section class="instrument u1-card">${header("Fans & Air", true, data.provenance?.sourceObservedAt, retained ? "stale" : data.freshness, warning)}<div class="u1-body"><h3 class="fan-group">Part cooling</h3><div class="fan-list">${part}</div><h3 class="fan-group">Air handling</h3><div class="fan-list">${purifierRow}${air}</div></div>${provenance()}</section>`;
};
// Presentation state is local to this mounted card, never printer state or a tool argument.
const meshView = { mode: "3d" };
let meshGeometry = null;
let meshRenderer = null;
const meshMm = value => `${(Object.is(value, -0) ? 0 : value).toFixed(3)} mm`;
const meshAxis = value => value === 0 ? "0" : Math.abs(value) >= 10000 || Math.abs(value) < 0.01
  ? value.toExponential(2).replace("e+", "e") : String(Number(value.toPrecision(4)));
const meshColor = (z, min, range) => `hsl(${230 - (range === 0 ? 0.5 : (z - min) / range) * 190} 68% 58%)`;
const meshDisplayScale = geometry => geometry.range > 0
  ? Math.max(1, Math.min(300, 0.12 * Math.max(geometry.bounds.xMax - geometry.bounds.xMin, geometry.bounds.yMax - geometry.bounds.yMin) / geometry.range))
  : 1;
const meshTicks = geometry => Array.from({ length: 5 }, (_, index) => geometry.min + geometry.range * index / 4);
const meshGrid = geometry => {
  const { bounds, rows, columns, matrix, min, range, summary } = geometry;
  const cells = matrix.map((row, y) => row.map((z, x) => {
    const xpos = bounds.xMin + x / (columns - 1) * (bounds.xMax - bounds.xMin);
    const ypos = bounds.yMin + y / (rows - 1) * (bounds.yMax - bounds.yMin);
    return `<rect class="mesh-cell" data-row="${y}" data-column="${x}" x="${60 + x * 244 / columns}" y="${18 + (rows - 1 - y) * 190 / rows}" width="${244 / columns}" height="${190 / rows}" fill="${meshColor(z, min, range)}"><title>X ${meshMm(xpos)}, Y ${meshMm(ypos)}, Z ${meshMm(z)}</title></rect>`;
  }).join("")).join("");
  return `<svg class="mesh-map" viewBox="0 0 320 260" role="img" aria-label="${escapeHtml(summary)} Maximum Y is at the top.">${cells}<text x="54" y="26" text-anchor="end">${meshAxis(bounds.yMax)}</text><text x="54" y="208" text-anchor="end">${meshAxis(bounds.yMin)}</text><text x="26" y="120" text-anchor="middle" transform="rotate(-90 26 120)">Y (mm)</text><text x="60" y="230">${meshAxis(bounds.xMin)}</text><text x="304" y="230" text-anchor="end">${meshAxis(bounds.xMax)}</text><text x="182" y="252" text-anchor="middle">X (mm)</text></svg>`;
};
const meshPlot = () => {
  if (meshView.mode === "2d") return meshGrid(meshGeometry);
  return `<div class="mesh-three" role="img" aria-label="${escapeHtml(meshGeometry.summary)} Interactive 3D surface; Z values and grid labels are actual millimetres."></div><output class="mesh-tooltip"></output>`;
};
const disposeMeshRenderer = () => { meshRenderer?.(); meshRenderer = null; };
const mountThreeMesh = chart => {
  const library = meshLibrary; const container = chart.querySelector?.(".mesh-three");
  if (!library?.THREE || !library?.OrbitControls || !container || !meshGeometry) return false;
  const { THREE, OrbitControls } = library; const geometry = meshGeometry;
  let renderer; let scene = null; let resizeObserver = null; let disposed = false;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
    renderer.setPixelRatio(Math.min(globalThis.devicePixelRatio || 1, 2));
    renderer.setClearColor(0xfbfcfd, 1); container.appendChild(renderer.domElement);
    scene = new THREE.Scene(); const xSpan = geometry.bounds.xMax - geometry.bounds.xMin; const ySpan = geometry.bounds.yMax - geometry.bounds.yMin;
    const xySpan = Math.max(xSpan, ySpan); const scale = meshDisplayScale(geometry); const zMid = (geometry.min + geometry.max) / 2;
    const point = vertex => [vertex.x, (vertex.z - zMid) * scale, vertex.y];
    const surface = new THREE.BufferGeometry();
    surface.setAttribute("position", new THREE.Float32BufferAttribute(geometry.vertices.flatMap(point), 3));
    surface.setAttribute("color", new THREE.Float32BufferAttribute(geometry.vertices.flatMap(vertex => { const color = new THREE.Color(meshColor(vertex.z, geometry.min, geometry.range)); return [color.r, color.g, color.b]; }), 3));
    const indices = [];
    for (let row = 0; row < geometry.rows - 1; row++) for (let column = 0; column < geometry.columns - 1; column++) {
      const a = row * geometry.columns + column; const b = a + 1; const c = a + geometry.columns; const d = c + 1;
      indices.push(a, c, d, a, d, b);
    }
    surface.setIndex(indices); surface.userData.reportedVertices = geometry.vertices.map(vertex => ({ ...vertex }));
    scene.add(new THREE.Mesh(surface, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.DoubleSide })));
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0xd4d9de, transparent: true, opacity: 0.76 });
    const lineGeometry = positions => { const item = new THREE.BufferGeometry(); item.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3)); return item; };
    const grid = [];
    for (const value of meshTicks(geometry)) {
      const z = (value - zMid) * scale;
      grid.push(geometry.bounds.xMin, z, geometry.bounds.yMin, geometry.bounds.xMax, z, geometry.bounds.yMin,
        geometry.bounds.xMax, z, geometry.bounds.yMin, geometry.bounds.xMax, z, geometry.bounds.yMax,
        geometry.bounds.xMax, z, geometry.bounds.yMax, geometry.bounds.xMin, z, geometry.bounds.yMax,
        geometry.bounds.xMin, z, geometry.bounds.yMax, geometry.bounds.xMin, z, geometry.bounds.yMin);
    }
    const base = (geometry.min - zMid) * scale;
    for (let index = 1; index < 4; index++) {
      const x = geometry.bounds.xMin + xSpan * index / 4; const y = geometry.bounds.yMin + ySpan * index / 4;
      grid.push(x, base, geometry.bounds.yMin, x, base, geometry.bounds.yMax, geometry.bounds.xMin, base, y, geometry.bounds.xMax, base, y);
    }
    scene.add(new THREE.LineSegments(lineGeometry(grid), lineMaterial));
    const axis = [geometry.bounds.xMin, base, geometry.bounds.yMin, geometry.bounds.xMax, base, geometry.bounds.yMin,
      geometry.bounds.xMin, base, geometry.bounds.yMin, geometry.bounds.xMin, base, geometry.bounds.yMax,
      geometry.bounds.xMin, base, geometry.bounds.yMax, geometry.bounds.xMin, (geometry.max - zMid) * scale, geometry.bounds.yMax];
    scene.add(new THREE.LineSegments(lineGeometry(axis), new THREE.LineBasicMaterial({ color: 0x7d8791 })));
    const label = (text, x, y, z, width = .22) => {
      const canvas = document.createElement("canvas"); canvas.width = 256; canvas.height = 64; const context = canvas.getContext("2d");
      if (!context) return; context.clearRect(0, 0, 256, 64); context.fillStyle = "rgba(251,252,253,.92)"; context.fillRect(0, 0, 256, 64); context.fillStyle = "#59636d"; context.font = "500 28px system-ui, sans-serif"; context.textAlign = "center"; context.textBaseline = "middle"; context.fillText(text, 128, 32);
      const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace; const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, depthTest: false, transparent: true }));
      sprite.position.set(x, y, z); sprite.scale.set(xySpan * width, xySpan * width / 4, 1); scene.add(sprite);
    };
    for (const value of meshTicks(geometry)) label(`${meshAxis(value)} mm`, geometry.bounds.xMin - xySpan * .07, (value - zMid) * scale, geometry.bounds.yMax, .26);
    label("Z (mm)", geometry.bounds.xMin - xySpan * .08, (geometry.max - zMid) * scale + xySpan * .08, geometry.bounds.yMax, .2);
    label("X (mm)", geometry.bounds.xMax + xySpan * .08, base, geometry.bounds.yMin, .2);
    label("Y (mm)", geometry.bounds.xMin, base, geometry.bounds.yMax + xySpan * .08, .2);
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.01, xySpan * 20 + 1);
    camera.position.set((geometry.bounds.xMin + geometry.bounds.xMax) / 2 + xySpan * .95, xySpan * .78, (geometry.bounds.yMin + geometry.bounds.yMax) / 2 + xySpan * 1.12);
    const target = new THREE.Vector3((geometry.bounds.xMin + geometry.bounds.xMax) / 2, 0, (geometry.bounds.yMin + geometry.bounds.yMax) / 2);
    camera.lookAt(target); const controls = new OrbitControls(camera, renderer.domElement);
    Object.assign(controls, { enableDamping: false, enablePan: false, minZoom: .7, maxZoom: 5, minPolarAngle: Math.PI / 12, maxPolarAngle: Math.PI * .47 });
    controls.target.copy(target); controls.saveState();
    const render = () => { if (!disposed) renderer.render(scene, camera); };
    controls.addEventListener("change", render); controls.listenToKeyEvents(chart);
    const resize = () => { const width = Math.max(1, container.clientWidth || chart.clientWidth || 320); const height = Math.max(1, container.clientHeight || 320); const half = xySpan * .76; camera.left = -half * width / height; camera.right = half * width / height; camera.top = half; camera.bottom = -half; camera.updateProjectionMatrix(); renderer.setSize(width, height, false); render(); };
    resizeObserver = typeof ResizeObserver === "function" ? new ResizeObserver(resize) : null; resizeObserver?.observe(container); resize();
    const tooltip = chart.querySelector?.(".mesh-tooltip"); const raycaster = new THREE.Raycaster(); const pointer = new THREE.Vector2();
    renderer.domElement.addEventListener("pointermove", event => { if (!tooltip) return; const rect = renderer.domElement.getBoundingClientRect(); pointer.set((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1); raycaster.setFromCamera(pointer, camera); const hit = raycaster.intersectObject(scene.children[0], false)[0]; if (!hit?.face) { tooltip.style.display = "none"; return; } const vertex = geometry.vertices[hit.face.a]; tooltip.textContent = `X ${meshMm(vertex.x)}, Y ${meshMm(vertex.y)}, Z ${meshMm(vertex.z)}`; tooltip.style.display = "block"; tooltip.style.left = `${Math.min(event.offsetX + 12, rect.width - 170)}px`; tooltip.style.top = `${Math.max(8, event.offsetY - 32)}px`; });
    renderer.domElement.addEventListener("pointerleave", () => { if (tooltip) tooltip.style.display = "none"; });
    renderer.domElement.addEventListener("webglcontextlost", event => { event.preventDefault(); if (!disposed) { disposeMeshRenderer(); meshView.mode = "2d"; redrawMesh(); } }, { once: true });
    meshRenderer = () => { if (disposed) return; disposed = true; resizeObserver?.disconnect(); controls.stopListenToKeyEvents(); controls.dispose(); scene.traverse(object => { object.geometry?.dispose?.(); const materials = Array.isArray(object.material) ? object.material : [object.material]; materials.filter(Boolean).forEach(material => { material.map?.dispose?.(); material.dispose?.(); }); }); renderer.dispose(); renderer.forceContextLoss?.(); };
    chart._u1ResetMeshView = () => { controls.reset(); render(); };
    render(); return true;
  } catch {
    resizeObserver?.disconnect(); scene?.traverse?.(object => { object.geometry?.dispose?.(); const materials = Array.isArray(object.material) ? object.material : [object.material]; materials.filter(Boolean).forEach(material => { material.map?.dispose?.(); material.dispose?.(); }); }); renderer?.dispose?.(); renderer?.forceContextLoss?.(); return false;
  }
};
const redrawMesh = () => {
  const chart = modulesElement.querySelector(".mesh-chart");
  if (!chart || !meshGeometry) return;
  disposeMeshRenderer();
  chart.innerHTML = meshPlot(); chart.dataset.mode = meshView.mode;
  chart.setAttribute("aria-label", meshView.mode === "3d" ? "3D bed mesh. Drag to orbit, scroll or pinch to zoom, and use arrow keys to adjust the view." : "2D bed mesh grid. Maximum Y is at the top.");
  if (meshView.mode === "3d" && !mountThreeMesh(chart)) { meshView.mode = "2d"; chart.innerHTML = meshGrid(meshGeometry); chart.dataset.mode = "2d"; chart.setAttribute("aria-label", "2D bed mesh grid. Maximum Y is at the top. 3D display is unavailable."); }
  modulesElement.querySelectorAll("[data-mesh-mode]").forEach(button => button.setAttribute("aria-pressed", String(button.dataset.meshMode === meshView.mode)));
};
const resetMeshView = () => { const chart = modulesElement.querySelector(".mesh-chart"); if (meshView.mode === "3d" && chart?._u1ResetMeshView) chart._u1ResetMeshView(); else redrawMesh(); };
const bindMeshControls = () => {
  const chart = modulesElement.querySelector(".mesh-chart"); if (!meshGeometry || !chart) return;
  modulesElement.querySelectorAll("[data-mesh-mode]").forEach(button => button.addEventListener("click", () => { meshView.mode = button.dataset.meshMode === "2d" ? "2d" : "3d"; redrawMesh(); }));
  modulesElement.querySelector(".mesh-reset")?.addEventListener("click", resetMeshView);
  chart.addEventListener("keydown", event => {
    if (event.key === "Home") { event.preventDefault(); resetMeshView(); return; }
  });
  redrawMesh();
};
const renderBedMesh = (data) => {
  meshGeometry = null;
  const known = data?.state === "known" || data?.state === "stale";
  const stale = data?.state === "stale" || data?.freshness === "stale";
  const heading = header("Bed Mesh", true, data?.sourceObservedAt ?? null, data?.freshness ?? "unknown", stale && data?.reason ? "Refresh unavailable · showing the last observed mesh state" : "");
  const empty = (title, detail) => `<section class="instrument u1-card">${heading}<div class="u1-body"><div class="empty-panel"><strong>${title}</strong>${detail}</div></div>${provenance()}</section>`;
  if (known && data?.status === "no_active_mesh" && data?.matrix === null) return empty(stale ? "Last observation: no active mesh" : "No active mesh", "The printer reported no loaded bed mesh.");
  const matrix = data?.matrix; const bounds = data?.bounds;
  const bounded = (n) => validNumber(n) && Math.abs(n) <= 1000000;
  const valid = known && data?.status === "active" && Array.isArray(matrix) && matrix.length >= 2 && matrix.length <= 64 &&
    Array.isArray(matrix[0]) && matrix[0].length >= 2 && matrix[0].length <= 64 &&
    matrix.every(row => Array.isArray(row) && row.length === matrix[0].length && row.every(bounded)) &&
    bounds && [bounds.xMin, bounds.xMax, bounds.yMin, bounds.yMax].every(bounded) && bounds.xMax > bounds.xMin && bounds.yMax > bounds.yMin;
  if (!valid) return empty(data?.state === "unsupported" ? "Bed mesh not reported" : data?.state === "unknown" ? "Bed mesh not observed" : "Bed mesh unavailable", "No reported probe grid is available. Refresh to check again.");
  const rows = matrix.length; const columns = matrix[0].length;
  const values = matrix.flat(); const min = Math.min(...values); const max = Math.max(...values); const range = max - min;
  const summary = `${columns} by ${rows} reported probe grid. Minimum ${meshMm(min)}, maximum ${meshMm(max)}, range ${meshMm(range)}. X ${bounds.xMin} to ${bounds.xMax} mm, Y ${bounds.yMin} to ${bounds.yMax} mm. Observation time is the server receipt, not a new calibration or probe capture time.`;
  const vertices = matrix.flatMap((row, y) => row.map((z, x) => ({ x: bounds.xMin + x / (columns - 1) * (bounds.xMax - bounds.xMin), y: bounds.yMin + y / (rows - 1) * (bounds.yMax - bounds.yMin), z, row: y, column: x })));
  meshGeometry = { matrix, bounds, rows, columns, min, max, range, vertices, summary };
  const profile = typeof data.profile === "string" && /^[\p{L}\p{N} _.-]{1,80}$/u.test(data.profile) ? ` · ${escapeHtml(data.profile)}` : "";
  const plot = meshPlot();
  const legend = `<div class="mesh-legend" aria-label="Height color scale: ${meshMm(min)} to ${meshMm(max)}"><span>Z (mm)</span><span>${meshMm(min)}</span><span class="mesh-colors" aria-hidden="true">${Array.from({ length: 16 }, (_, i) => `<span style="background:${meshColor(min + range * i / 15, min, range)}"></span>`).join("")}</span><span>${meshMm(max)}</span></div>`;
  const controls = `<footer class="instrument-footer u1-footer mesh-controls"><span class="mesh-control-cluster u1-local-actions"><button type="button" class="mesh-control u1-action" data-mesh-mode="3d" aria-label="Show 3D bed mesh" title="3D view" aria-pressed="${meshView.mode === "3d"}">${meshIcon("box")}</button><button type="button" class="mesh-control u1-action" data-mesh-mode="2d" aria-label="Show 2D bed mesh" title="2D view" aria-pressed="${meshView.mode === "2d"}">${meshIcon("grid")}</button></span><span class="mesh-control-cluster u1-primary-actions">${footerStatus()}<button type="button" class="mesh-control mesh-reset u1-action" aria-label="Reset bed mesh view" title="Reset view">${meshIcon("rotate-ccw")}</button><button class="refresh u1-action u1-action--round" type="button" title="Refresh observation" aria-label="Refresh observation">${icon("refresh-cw")}</button></span></footer>`;
  return `<section class="instrument u1-card">${heading}<div class="mesh-body u1-body"><p class="mesh-caption">Reported probe grid · ${columns} × ${rows}${profile}</p><div class="mesh-chart" data-mode="${meshView.mode}" tabindex="0" role="group" aria-label="Bed mesh view.">${plot}</div>${legend}<p class="mesh-disclosure">Z display ×${Math.round(meshDisplayScale(meshGeometry))}</p><dl class="mesh-summary u1-facts"><div><dt>Minimum</dt><dd>${meshMm(min)}</dd></div><div><dt>Maximum</dt><dd>${meshMm(max)}</dd></div><div><dt>Range</dt><dd>${meshMm(range)}</dd></div></dl></div>${controls}</section>`;
};
const overviewStates = ["known", "stale", "unknown", "unsupported", "unavailable"];
const overviewReasons = ["not_requested", "not_reported", "unsupported", "unauthorized", "http_error", "timeout", "network", "malformed", "too_large", "not_configured", null];
const validOverviewTime = value => { if (typeof value !== "string" || value.length > 40) return false; const milliseconds = new Date(value).valueOf(); return Number.isFinite(milliseconds) && milliseconds >= 0 && milliseconds <= 253402300799000; };
const validOverviewReceipt = (receipt, status = false) => {
  if (!receipt || !overviewStates.includes(receipt.state) || !overviewReasons.includes(receipt.reason ?? null)) return false;
  if (receipt.state === "known") return receipt.freshness === "fresh" && receipt.reason == null && validOverviewTime(receipt.sourceObservedAt);
  if (receipt.state === "stale") return receipt.freshness === "stale" && validOverviewTime(receipt.sourceObservedAt);
  if (status && receipt.state === "unavailable") return receipt.reason == null && (receipt.freshness === "stale" ? validOverviewTime(receipt.sourceObservedAt) : ["offline", "unknown"].includes(receipt.freshness) && receipt.sourceObservedAt === null);
  if (receipt.freshness !== "unknown" || receipt.sourceObservedAt !== null) return false;
  if (receipt.state === "unknown") return ["not_requested", "not_reported", null].includes(receipt.reason ?? null);
  if (receipt.state === "unsupported") return receipt.reason === "unsupported";
  return ["unauthorized", "http_error", "timeout", "network", "malformed", "too_large", "not_configured"].includes(receipt.reason);
};
const exactKeys = (value, keys) => value && typeof value === "object" && !Array.isArray(value) && Object.keys(value).sort().join("|") === [...keys].sort().join("|");
const safeHeadline = value => typeof value === "string" && value.length > 0 && Array.from(value).length <= 160 && !/[\\/\r\n]/.test(value) && !/(?:gh[pousr]_[a-z0-9]{16,255}|github_pat_[a-z0-9_]{16,255}|glpat-[a-z0-9_-]{16,255}|xox[baprs]-[a-z0-9-]{16,255}|(?:AKIA|ASIA)[a-z0-9]{16})/i.test(value) && !/\b(?:bearer|basic)\s+|\b(?:api[-_ ]?key|(?:access|refresh)[-_ ]?token|password|secret|credential)[ _.-]+\S|\bsk-(?:proj-)?[a-z0-9_-]{8,}|\beyJ[a-z0-9_-]+\.[a-z0-9_-]+\.[a-z0-9_-]+/i.test(value);
const validOverviewTileBase = (tile, id) => tile?.id === id && overviewStates.includes(tile.state);
const validOverviewModule = data => {
  const ids = ["progress", "thermals", "heads", "jobs", "job_history", "queue", "fans", "bed_mesh"];
  if (!data || data.kind !== "overview" || !overviewStates.includes(data.state) || !["complete", "partial", "none"].includes(data.coverage) || !Array.isArray(data.tiles) || data.tiles.length !== ids.length || !data.tiles.every((tile, index) => validOverviewTileBase(tile, ids[index]))) return false;
  const available = data.tiles.filter(tile => tile.state === "known" || tile.state === "stale").length;
  const expectedCoverage = available === 0 ? "none" : available === data.tiles.length ? "complete" : "partial";
  return data.coverage === expectedCoverage;
};
const validOverviewTile = (tile, index) => {
  const printStates = ["standby", "printing", "paused", "complete", "cancelled", "error", "unknown"];
  const nullableNumber = (value, min, max) => value === null || validNumber(value) && value >= min && value <= max;
  const safeLayer = value => value === null || Number.isSafeInteger(value) && value >= 0 && value <= 1000000;
  const tool = value => value === null || Number.isSafeInteger(value) && value >= 1 && value <= 4;
  const temperature = value => nullableNumber(value, -273.15, 999);
  const historyStatuses = ["in_progress", "completed", "cancelled", "error", "klippy_shutdown", "klippy_disconnect", "interrupted", "unknown"];
  const queueStates = ["ready", "loading", "starting", "paused"];
  const purifierModes = ["idle", "cool_chamber", "preheat_chamber", "hot_chamber", null];
  const dimension = value => value === null || Number.isSafeInteger(value) && value >= 2 && value <= 64;
  const receipt = (keys, statusKey = null) => exactKeys(tile.receipts, keys) && keys.every(key => validOverviewReceipt(tile.receipts[key], key === statusKey)) && (!statusKey || tile.receipts[statusKey].sourceObservedAt === observation?.sourceObservedAt && tile.receipts[statusKey].freshness === observation?.freshness);
  const observed = value => value.state === "known" || value.state === "stale";
  const allNull = values => values.every(value => value === null);
  const statusCompatible = status => tile.state === "known" || tile.state === "stale" ? status.state === tile.state : tile.state === "unknown";
  const optionalCompatible = (domain, values) => tile.state === domain.state && (observed(domain) || allNull(values));
  if (index === 0) { const values = [tile.percent, tile.currentLayer, tile.totalLayers, tile.estimatedRemainingSeconds]; return receipt(["status"], "status") && printStates.includes(tile.printState) && nullableNumber(tile.percent, 0, 100) && safeLayer(tile.currentLayer) && safeLayer(tile.totalLayers) && nullableNumber(tile.estimatedRemainingSeconds, 0, Number.MAX_SAFE_INTEGER) && !(tile.currentLayer !== null && tile.totalLayers !== null && tile.currentLayer > tile.totalLayers) && statusCompatible(tile.receipts.status) && (tile.state !== "unknown" || allNull(values) && (tile.receipts.status.state !== "unavailable" || tile.printState === "unknown")); }
  if (index === 1) { const statusValues = [tile.activeTool, tile.activeActualC, tile.activeTargetC, tile.bedActualC, tile.bedTargetC]; const values = [...statusValues, tile.cavityActualC]; const expectedState = !allNull(statusValues) ? tile.receipts.status.state : tile.cavityActualC !== null ? tile.receipts.environment.state : "unknown"; return receipt(["status", "environment"], "status") && tool(tile.activeTool) && values.slice(1).every(temperature) && !(tile.activeTool === null && (tile.activeActualC !== null || tile.activeTargetC !== null)) && tile.state === expectedState && (allNull(statusValues) || observed(tile.receipts.status)) && (tile.cavityActualC === null || observed(tile.receipts.environment)); }
  if (index === 2) { const values = [tile.activeTool, tile.material, tile.color, tile.reportedPresence]; const color = tile.color === null || typeof tile.color === "string" && /^#(?:[0-9a-f]{6}|[0-9a-f]{8})$/i.test(tile.color); const expectedState = allNull(values) ? "unknown" : tile.receipts.status.state; return receipt(["status", "materials"], "status") && tool(tile.activeTool) && (tile.material === null || safeHeadline(tile.material)) && color && (tile.reportedPresence === null || typeof tile.reportedPresence === "boolean") && !(tile.activeTool === null && (tile.material !== null || tile.color !== null || tile.reportedPresence !== null)) && tile.state === expectedState && (allNull(values) || observed(tile.receipts.status)) && (allNull([tile.material, tile.color, tile.reportedPresence]) || observed(tile.receipts.materials)); }
  if (index === 3) { const values = [tile.printState, tile.storageActive]; return receipt(["currentJob"]) && (tile.printState === null || printStates.includes(tile.printState)) && (tile.storageActive === null || typeof tile.storageActive === "boolean") && optionalCompatible(tile.receipts.currentJob, values); }
  if (index === 4) { const validFacts = (tile.pageCount === null || Number.isSafeInteger(tile.pageCount) && tile.pageCount >= 0 && tile.pageCount <= 20) && (tile.pageCount === null ? tile.statusCounts === null : exactKeys(tile.statusCounts, historyStatuses) && historyStatuses.every(status => Number.isSafeInteger(tile.statusCounts[status]) && tile.statusCounts[status] >= 0 && tile.statusCounts[status] <= 20) && historyStatuses.reduce((sum, status) => sum + tile.statusCounts[status], 0) === tile.pageCount); return receipt(["jobHistory"]) && validFacts && optionalCompatible(tile.receipts.jobHistory, [tile.pageCount, tile.statusCounts]) && (!observed(tile.receipts.jobHistory) || tile.pageCount !== null && tile.statusCounts !== null); }
  if (index === 5) { const values = [tile.queueState, tile.totalCount]; return receipt(["queue"]) && (tile.queueState === null || queueStates.includes(tile.queueState)) && (tile.totalCount === null || Number.isSafeInteger(tile.totalCount) && tile.totalCount >= 0 && tile.totalCount <= 1000) && optionalCompatible(tile.receipts.queue, values) && (!observed(tile.receipts.queue) || tile.queueState !== null && tile.totalCount !== null); }
  if (index === 6) { const values = [tile.reportedFanCount, tile.purifierPowerDetected, tile.purifierMode]; return receipt(["environment"]) && (tile.reportedFanCount === null || Number.isSafeInteger(tile.reportedFanCount) && tile.reportedFanCount >= 0 && tile.reportedFanCount <= 7) && (tile.purifierPowerDetected === null || typeof tile.purifierPowerDetected === "boolean") && purifierModes.includes(tile.purifierMode) && !(tile.purifierPowerDetected !== true && tile.purifierMode !== null) && optionalCompatible(tile.receipts.environment, values); }
  { const values = [tile.active, tile.rows, tile.columns, tile.rangeMillimeters]; return receipt(["bedMesh"]) && (tile.active === null || typeof tile.active === "boolean") && dimension(tile.rows) && dimension(tile.columns) && nullableNumber(tile.rangeMillimeters, 0, 2000000) && !(tile.active === false && (tile.rows !== null || tile.columns !== null || tile.rangeMillimeters !== null)) && !(tile.active === null && (tile.rows !== null || tile.columns !== null || tile.rangeMillimeters !== null)) && !(tile.active === true && (tile.rows === null || tile.columns === null || tile.rangeMillimeters === null)) && optionalCompatible(tile.receipts.bedMesh, values) && (!observed(tile.receipts.bedMesh) || tile.active !== null); }
};
const overviewReceipt = (label, receipt) => {
  const state = ({ known: "Known", stale: "Stale", unknown: "Not observed", unsupported: "Unsupported", unavailable: "Unavailable" })[receipt.state];
  const freshness = ({ fresh: "Fresh", stale: "Stale", offline: "Offline", unknown: "Freshness unknown" })[receipt.freshness] ?? "Freshness unknown";
  const reason = ({ not_requested: "Not requested", not_reported: "Not reported", unsupported: "Endpoint unsupported", unauthorized: "Authorization required", http_error: "Service error", timeout: "Timed out", network: "Network unavailable", malformed: "Invalid response", too_large: "Response too large", not_configured: "Not configured" })[receipt.reason];
  const time = receipt.sourceObservedAt === null ? "Observation time unavailable" : observedLabel(receipt.sourceObservedAt);
  return `<span>${escapeHtml(label)} · ${escapeHtml(state)} · ${escapeHtml(time)} · ${escapeHtml(freshness)}${reason ? ` · ${escapeHtml(reason)}` : ""}</span>`;
};
const overviewTile = (tile, title, primary, secondary, receipts) => { const state = ({ known: "Available", stale: "Stale", unknown: "Not observed", unsupported: "Unsupported", unavailable: "Unavailable" })[tile.state]; return `<article class="overview-tile u1-data-row" data-overview-tile="${tile.id}"><div class="overview-heading"><h3>${escapeHtml(title)}</h3><span class="coverage ${tile.state === "known" ? "complete" : ""}">${escapeHtml(state)}</span></div><p class="overview-primary">${primary}</p>${secondary ? `<p class="overview-secondary">${secondary}</p>` : ""}<div class="overview-receipts u1-facts">${receipts}</div></article>`; };
const invalidOverviewTile = (tile, title) => `<article class="overview-tile u1-data-row" data-overview-tile="${tile.id}"><div class="overview-heading"><h3>${escapeHtml(title)}</h3><span class="coverage">Unavailable</span></div><p class="overview-primary">Data could not be read</p><p class="overview-secondary">This headline was rejected; the other domains remain available.</p><div class="overview-receipts u1-facts"><span>Observation unavailable</span></div></article>`;
const renderOverview = data => {
  if (!validOverviewModule(data)) return `<section class="instrument u1-card">${header("Overview", true, null, "unknown", "Overview data could not be read.")}<div class="u1-body"><div class="empty-panel"><strong>Overview unavailable</strong>No current overview headlines are available.</div></div>${provenance()}</section>`;
  const [progress, thermals, heads, jobs, history, queue, fans, mesh] = data.tiles;
  const valid = data.tiles.map(validOverviewTile);
  const time = seconds => seconds === null ? "Estimate unknown" : `About ${escapeHtml(formatDuration({ state: "known", value: seconds }))} left`;
  const statusLabel = value => ({ in_progress: "in progress", completed: "completed", cancelled: "cancelled", error: "error", klippy_shutdown: "Klippy shutdown", klippy_disconnect: "Klippy disconnected", interrupted: "interrupted", unknown: "unknown" })[value];
  const tiles = [
    valid[0] ? (() => { const primary = progress.percent === null ? "Progress unknown" : `${progress.percent.toFixed(progress.percent % 1 ? 1 : 0)}% · ${escapeHtml(({ standby: "Ready", printing: "Printing", paused: "Paused", complete: "Complete", cancelled: "Cancelled", error: "Error", unknown: "Unknown" })[progress.printState])}`; const secondary = progress.currentLayer !== null && progress.totalLayers !== null ? `Layer ${progress.currentLayer} / ${progress.totalLayers} · ${time(progress.estimatedRemainingSeconds)}` : time(progress.estimatedRemainingSeconds); return overviewTile(progress, "Print Progress", primary, secondary, overviewReceipt("Printer", progress.receipts.status)); })() : invalidOverviewTile(progress, "Print Progress"),
    valid[1] ? (() => { const primary = thermals.activeTool === null ? "Active tool unknown" : `T${thermals.activeTool} ${thermals.activeActualC === null ? "Unknown" : `${Math.round(thermals.activeActualC)}°`} / ${thermals.activeTargetC === null ? "Unknown" : `${Math.round(thermals.activeTargetC)}°`}`; const secondary = `Bed ${thermals.bedActualC === null ? "Unknown" : `${Math.round(thermals.bedActualC)}°`} / ${thermals.bedTargetC === null ? "Unknown" : `${Math.round(thermals.bedTargetC)}°`} · Cavity ${thermals.cavityActualC === null ? "Unknown" : `${Math.round(thermals.cavityActualC)}°`}`; return overviewTile(thermals, "Thermals", primary, secondary, overviewReceipt("Printer", thermals.receipts.status) + overviewReceipt("Cavity", thermals.receipts.environment)); })() : invalidOverviewTile(thermals, "Thermals"),
    valid[2] ? (() => { const loaded = heads.reportedPresence === true; const empty = heads.reportedPresence === false; const color = loaded && heads.color !== null ? `<span class="material-swatch" aria-hidden="true" style="display:inline-block;vertical-align:-4px;margin-right:7px;background-color:${heads.color}"></span>` : empty ? '<span class="material-swatch empty" aria-hidden="true" style="display:inline-block;vertical-align:-4px;margin-right:7px"></span>' : ""; const material = empty ? "Empty" : loaded ? heads.material ?? "N/A" : "N/A"; const primary = heads.activeTool === null ? "Active head unknown" : `T${heads.activeTool} · ${escapeHtml(material)}`; return overviewTile(heads, "Heads & Filaments", `${color}${primary}`, "", overviewReceipt("Printer", heads.receipts.status) + overviewReceipt("Material", heads.receipts.materials)); })() : invalidOverviewTile(heads, "Heads & Filaments"),
    valid[3] ? (() => { const state = jobs.printState === null ? "State not reported" : ({ standby: "Standby", printing: "Printing", paused: "Paused", complete: "Complete", error: "Error", cancelled: "Cancelled", unknown: "Unknown" })[jobs.printState]; const storage = jobs.storageActive === null ? "Storage not reported" : jobs.storageActive ? "Storage active" : "Storage inactive"; return overviewTile(jobs, "Current Job", escapeHtml(state), escapeHtml(storage), overviewReceipt("Current Job", jobs.receipts.currentJob)); })() : invalidOverviewTile(jobs, "Current Job"),
    valid[4] ? (() => { const secondary = history.statusCounts === null ? "Status aggregate unavailable" : Object.entries(history.statusCounts).filter(([, count]) => count > 0).map(([status, count]) => `${count} ${statusLabel(status)}`).join(" · ") || "No statuses returned"; return overviewTile(history, "Job History", history.pageCount === null ? "Page not observed" : `${history.pageCount} ${history.pageCount === 1 ? "job" : "jobs"} returned`, escapeHtml(secondary), overviewReceipt("Job History", history.receipts.jobHistory)); })() : invalidOverviewTile(history, "Job History"),
    valid[5] ? (() => { const state = queue.queueState === null ? "State unknown" : ({ ready: "Ready", loading: "Loading", starting: "Starting", paused: "Paused" })[queue.queueState]; return overviewTile(queue, "Print Queue", escapeHtml(state), queue.totalCount === null ? "Count unknown" : `${queue.totalCount} ${queue.totalCount === 1 ? "job" : "jobs"} queued`, overviewReceipt("Print Queue", queue.receipts.queue)); })() : invalidOverviewTile(queue, "Print Queue"),
    valid[6] ? (() => { const mode = fans.purifierPowerDetected !== true ? "" : ` · ${({ idle: "Idle", cool_chamber: "Cool chamber", preheat_chamber: "Preheat chamber", hot_chamber: "Hot chamber" })[fans.purifierMode] ?? "Mode unknown"}`; const purifier = fans.purifierPowerDetected === null ? "Purifier not reported" : fans.purifierPowerDetected ? `Purifier detected${mode}` : "Purifier not detected"; return overviewTile(fans, "Fans & Air", fans.reportedFanCount === null ? "Fans not observed" : `${fans.reportedFanCount} of 7 fans reported`, escapeHtml(purifier), overviewReceipt("Environment", fans.receipts.environment)); })() : invalidOverviewTile(fans, "Fans & Air"),
    valid[7] ? (() => { const primary = mesh.active === null ? "Mesh state unknown" : mesh.active ? "Active mesh" : "No active mesh"; const secondary = mesh.active === true ? `${mesh.columns} × ${mesh.rows} · ${mesh.rangeMillimeters.toFixed(3)} mm range` : ""; return overviewTile(mesh, "Bed Mesh", primary, secondary, overviewReceipt("Bed Mesh", mesh.receipts.bedMesh)); })() : invalidOverviewTile(mesh, "Bed Mesh"),
  ].join("");
  const available = data.tiles.filter((tile, index) => valid[index] && (tile.state === "known" || tile.state === "stale")).length;
  const renderedCoverage = available === 0 ? "none" : available === data.tiles.length ? "complete" : "partial";
  return `<section class="instrument u1-card overview-instrument">${header("Overview", true, observation.sourceObservedAt, observation.freshness, "", `<span class="overview-coverage">Coverage ${renderedCoverage}</span>`)}<div class="overview-grid u1-body">${tiles}</div>${provenance()}</section>`;
};
const renderers = { overview: renderOverview, progress: renderProgress, thermals: renderThermals, heads: renderHeads, jobs: renderJobs, job_history: renderJobHistory, queue: renderQueue, fans: renderFans, bed_mesh: renderBedMesh };
// Closed public structure only: no synthetic observation, hidden filename,
// timestamp, color, thermal value or renderer is created for placeholders.
const neutralValue = (size = "") => `<span class="neutral-value ${size}" aria-hidden="true"></span>`;
const neutralRows = (labels) => `<div class="neutral-list">${labels.map(label => `<div class="neutral-row"><span>${escapeHtml(label)}</span>${neutralValue()}</div>`).join("")}</div>`;
const neutralCards = (labels) => `<div class="neutral-grid">${labels.map(label => `<div class="neutral-card"><span>${escapeHtml(label)}</span>${neutralValue("long")}${neutralValue()}</div>`).join("")}</div>`;
const neutralBodies = {
  overview: () => neutralCards(["Print Progress", "Thermals", "Heads & Filaments", "Current Job", "Job History", "Print Queue", "Fans & Air", "Bed Mesh"]),
  progress: () => `<div class="neutral-stack">${neutralValue("short")}<div class="progress-track"></div><div class="progress-meta"><span>Layer ${neutralValue("short")}</span>${neutralValue("long")}</div>${neutralRows(["Elapsed"])}</div>`,
  thermals: () => neutralRows(["Tool 1", "Tool 2", "Tool 3", "Tool 4", "Heater bed", "Cavity"]),
  heads: () => neutralCards(["T1", "T2", "T3", "T4"]),
  jobs: () => `<div class="neutral-stack">${neutralValue("long")}${neutralCards(["State", "Elapsed", "Filament", "Storage"])}</div>`,
  job_history: () => neutralRows(Array.from({ length: retainedPresentation?.rows ?? 4 }, () => "")),
  queue: () => `<div class="neutral-stack">${neutralValue()}${neutralRows(Array.from({ length: retainedPresentation?.rows ?? 3 }, () => ""))}</div>`,
  fans: () => neutralRows(["Tool 1", "Tool 2", "Tool 3", "Tool 4", "Cavity", "Purifier exhaust", "Purifier inner"]),
  bed_mesh: () => `<div class="neutral-stack">${neutralValue("long")}<div class="neutral-chart" aria-hidden="true"></div>${neutralRows(["Minimum", "Maximum", "Range"])}</div>`,
};
const viewTitles = { overview: "Overview", progress: "Print Progress", thermals: "Thermals", heads: "Heads & Filaments", jobs: "Current Job", job_history: "Job History", queue: "Print Queue", fans: "Fans & Air", bed_mesh: "Bed Mesh" };
let retainedPresentation = null;
let placeholderPhase = 'loading';
let placeholderMessage = '';
const layoutSignature = () => {
  const title = modulesElement.querySelector('.u1-title');
  return [modulesElement.getBoundingClientRect().width, title ? getComputedStyle(title).fontSize : ''];
};
const retainPresentation = () => {
  if (retainedPresentation || !observation) return;
  const section = modulesElement.querySelector('.instrument');
  if (!section || section.hasAttribute('data-observation-placeholder')) return;
  const [header, body, footer] = ['.u1-header', '.u1-body', '.u1-footer'].map(
    selector => section.querySelector(selector)?.getBoundingClientRect(),
  );
  // Include collapsed child margins in the measured body allocation. A border
  // box alone misses the Progress track's margin and moves the error footer.
  const bodyHeight = header && footer ? footer.top - header.bottom : body?.height ?? 0;
  retainedPresentation = { section: selectedView === 'bed_mesh' ? section : null, signature: layoutSignature(),
    heights: [header?.height ?? 0, bodyHeight, footer?.height ?? 0],
    rows: Array.isArray(observation.module?.items) ? Math.min(100, observation.module.items.length) : undefined };
  if (retainedPresentation.section) { section.setAttribute('data-retained-observation', ''); section.inert = true; section.setAttribute('aria-hidden', 'true'); }
  modulesElement.style.position = 'relative';
};
const showPlaceholder = (phase = "loading", message = "") => {
  placeholderPhase = phase;
  placeholderMessage = message;
  const view = selectedView ?? "overview";
  const title = selectedView ? viewTitles[view] : "Printer observation";
  const retry = phase !== "loading" && selectedView && window.parent !== window;
  const heading = header(title, false).replace("</h2>", `</h2><div class="instrument-info u1-meta">${neutralValue("long")}</div>`);
  const action = retry ? `<button class="refresh u1-action" type="button" aria-label="Retry loading observation">${icon("refresh-cw")}</button>` : '<span class="neutral-action" aria-hidden="true"></span>';
  if (phase !== 'loading') {
    retainPresentation();
    disposeMeshRenderer();
  }
  const retained = retainedPresentation?.section;
  retained?.remove();
  modulesElement.innerHTML = `<section class="instrument u1-card" data-observation-placeholder="${phase}" aria-busy="${phase === "loading"}">${heading}<div class="u1-body">${neutralBodies[view]()}</div><footer class="instrument-footer u1-footer"><div class="u1-primary-actions">${footerStatus(message)}${action}</div></footer></section>`;
  if (retainedPresentation?.heights) ['.u1-header', '.u1-body', '.u1-footer'].forEach((selector, index) => {
    const region = modulesElement.querySelector(selector), height = retainedPresentation.heights[index];
    if (!region || !height) return;
    if (index === 1) {
      // Allocate only measured pixels and bounded row count. No retained
      // text, telemetry or hidden DTO supplies a placeholder's geometry.
      const rows = Math.max(1, Math.min(retainedPresentation.rows ?? 4, Math.floor(height / 20)));
      region.style.height = `${height}px`;
      region.innerHTML = `<div class="neutral-allocation" aria-hidden="true">${'<span></span>'.repeat(rows)}</div>`;
    } else region.style.minHeight = `${height}px`;
  });
  if (retained) modulesElement.append(retained);
  allocationObserver?.disconnect();
  allocationObserver?.observe(modulesElement);
  const titleNode = modulesElement.querySelector('.u1-title');
  if (titleNode) allocationObserver?.observe(titleNode);
  if (retry) modulesElement.querySelector(".refresh")?.addEventListener("click", () => void retryLoad());
  notifyHeight();
};
const releaseChangedAllocation = () => {
  if (!retainedPresentation?.heights) return;
  const signature = layoutSignature();
  if (Math.abs(signature[0] - retainedPresentation.signature[0]) <= 1 && signature[1] === retainedPresentation.signature[1]) return;
  retainedPresentation.heights = null;
  showPlaceholder(placeholderPhase, placeholderMessage);
};
const allocationObserver = typeof ResizeObserver === 'function' ? new ResizeObserver(releaseChangedAllocation) : null;
allocationObserver?.observe(modulesElement);
window.addEventListener('resize', releaseChangedAllocation);
const hide = () => { allocationObserver?.disconnect(); disposeMeshRenderer(); };
window.addEventListener('pagehide', hide);
const show = () => { allocationObserver?.observe(modulesElement); releaseChangedAllocation(); };
window.addEventListener('pageshow', show);
const render = () => { if (!observation?.module) return; disposeMeshRenderer(); retainedPresentation = null; const view = VIEWS.includes(observation.view) ? observation.view : "overview"; modulesElement.innerHTML = renderers[view](observation.module); modulesElement.querySelectorAll(".refresh").forEach((button) => button.addEventListener("click", () => void refresh())); if (view === "bed_mesh") bindMeshControls(); if (view === "heads") bindMaterialCopy(); notifyHeight(); };
const validObservation = (value) => value && VIEWS.includes(value.view) &&
  value.module?.kind === value.view && typeof value.module.state === "string";
const failedDomain = (value, depth = 0) => {
  if (!value || typeof value !== 'object' || depth > 3) return false;
  if (['unavailable', 'unsupported'].includes(value.state)) return true;
  if (value.state === 'stale' && ['unauthorized', 'http_error', 'timeout', 'network', 'malformed', 'too_large', 'not_configured', 'unsupported'].includes(value.reason)) return true;
  return [value.materials, value.environment, ...Object.values(value.receipts ?? {}), ...(Array.isArray(value.tiles) ? value.tiles : [])].some(child => child && failedDomain(child, depth + 1));
};
const applyResult = (result) => {
  const candidates = [result?.structuredContent, result?.result?.structuredContent, result?.mcp_tool_result?.structuredContent, result?.call_tool_result?.structuredContent, result];
  const candidate = candidates.find(validObservation);
  if (!candidate || (selectedView && candidate.view !== selectedView)) return false;

  const previous = observation;
  if (failedDomain(candidate.module)) {
    acceptedResult = true;
    // Geometry is not observation acceptance; preserve its numeric shape
    // even when an unknown result or a new epoch invalidates cached data.
    if (previous?.view === candidate.view) retainPresentation();
    const message = candidate.view === "bed_mesh" && candidate.module.reason === "not_reported" ? "Bed mesh not reported" : `${viewTitles[candidate.view]} ${candidate.module.state === "unsupported" ? "endpoint unsupported" : "unavailable"}`;
    if (previous && ["known", "stale"].includes(previous.module.state) && previous.view === candidate.view && Number.isSafeInteger(candidate.connectionEpoch) && candidate.connectionEpoch >= 0 && candidate.connectionEpoch === previous.connectionEpoch) {
      showPlaceholder("unavailable", message);
    } else { observation = null; disposeMeshRenderer(); if (retainedPresentation) retainedPresentation.section = null; showPlaceholder("unavailable", message); }

    return true;
  }
  observation = candidate;
  try { render(); } catch { observation = previous; return false; }
  acceptedResult = true;

  return true;
};

const showLoadError = () => {
  if (disposed) return;
  showPlaceholder('error', `Could not load ${viewTitles[selectedView]}`);
};
const refresh = async () => {
  if (disposed || refreshPending) return;
  refreshPending = true;
  modulesElement.querySelectorAll('.refresh').forEach((button) => { button.disabled = true; button.setAttribute('aria-busy', 'true'); });
  try {
    const result = await refreshResult();
    if (!disposed && !applyResult(result)) showLoadError();
  } catch { if (!disposed) showLoadError(); }
  finally {
    refreshPending = false;
    if (!disposed) modulesElement.querySelectorAll('.refresh').forEach((button) => { button.disabled = false; button.setAttribute('aria-busy', 'false'); });
  }
};
const retryLoad = refresh;
showPlaceholder();
return {
  accept: (result) => !disposed && applyResult(result),
  fail: showLoadError,
  dispose: () => {
    if (disposed) return;
    disposed = true;
    allocationObserver?.disconnect(); disposeMeshRenderer();
    window.removeEventListener('resize', releaseChangedAllocation);
    window.removeEventListener('pagehide', hide);
    window.removeEventListener('pageshow', show);
    observation = null; retainedPresentation = null;
    modulesElement.replaceChildren();
  },
};
};
