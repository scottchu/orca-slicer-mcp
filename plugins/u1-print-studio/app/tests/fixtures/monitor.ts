import { normalizeMonitorEvidence } from '../../src/lib/server/adapters/u1-monitor-evidence.js';
import type { U1Status } from '../../src/lib/server/u1-status.js';
// Synthetic 8x8 solid-color JPEG, independently decoded during fixture creation.
export const monitorJpeg = Buffer.from('/9j/4AAQSkZJRgABAQAASABIAAD/4QBMRXhpZgAATU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAACKADAAQAAAABAAAACAAAAAD/7QA4UGhvdG9zaG9wIDMuMAA4QklNBAQAAAAAAAA4QklNBCUAAAAAABDUHYzZjwCyBOmACZjs+EJ+/8AAEQgACAAIAwEiAAIRAQMRAf/EAB8AAAEFAQEBAQEBAAAAAAAAAAABAgMEBQYHCAkKC//EALUQAAIBAwMCBAMFBQQEAAABfQECAwAEEQUSITFBBhNRYQcicRQygZGhCCNCscEVUtHwJDNicoIJChYXGBkaJSYnKCkqNDU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6g4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2drh4uPk5ebn6Onq8fLz9PX29/j5+v/EAB8BAAMBAQEBAQEBAQEAAAAAAAABAgMEBQYHCAkKC//EALURAAIBAgQEAwQHBQQEAAECdwABAgMRBAUhMQYSQVEHYXETIjKBCBRCkaGxwQkjM1LwFWJy0QoWJDThJfEXGBkaJicoKSo1Njc4OTpDREVGR0hJSlNUVVZXWFlaY2RlZmdoaWpzdHV2d3h5eoKDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uLj5OXm5+jp6vLz9PX29/j5+v/bAEMAAgICAgICAwICAwUDAwMFBgUFBQUGCAYGBgYGCAoICAgICAgKCgoKCgoKCgwMDAwMDA4ODg4ODw8PDw8PDw8PD//bAEMBAgICBAQEBwQEBxALCQsQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEP/dAAQAAf/aAAwDAQACEQMRAD8A6Ciiiv6oP5fP/9k=', 'base64');
export const monitorQuery = () => ({ result: { eventtime: 123.5, status: {
 print_stats: { state: 'printing', filename: 'folder/fixture.gcode', print_duration: 100, total_duration: 110, exception: {}, info: { current_layer: 5, total_layer: 10 } },
 virtual_sdcard: { is_active: true, file_position: 500, file_size: 1000, progress: 0.5 }, display_status: { progress: 0.5 },
 webhooks: { state: 'ready' }, heater_bed: { temperature: 55, target: 60 }, toolhead: { extruder: 'extruder' },
 extruder: { temperature: 210, target: 220, state: 'ACTIVE' }, extruder1: { temperature: 25, target: 0, state: 'PARKED' },
 extruder2: { temperature: 25, target: 0, state: 'PARKED' }, extruder3: { temperature: 25, target: 0, state: 'PARKED' },
} } });
export const monitorFixture = (receivedAt: string, query = monitorQuery()) => {
 const monitorEvidence = normalizeMonitorEvidence(query, receivedAt);
 const status: U1Status = { schemaVersion: 1, stateVersion: 1, observedAt: receivedAt, reachable: true,
 state: monitorEvidence.state, stateLabel: 'Printing', progressPercent: 50, currentLayer: 5, totalLayers: 10,
 elapsedSeconds: 100, remainingSeconds: 100, refreshAfterSeconds: 15, filename: 'fixture.gcode', activePhysicalTool: 1,
 tools: monitorEvidence.tools, bed: monitorEvidence.bed, storage: { active: true, filePosition: 500, fileSize: 1000 },
 exception: false, printerMessage: null, camera: { available: true, service: 'snapshot', targetFps: null } };
 return { status, metadata: {}, monitorEvidence };
};
