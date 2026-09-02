import { expect, test } from 'bun:test';
import { EventEmitter } from 'node:events';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { createRequestLifetime } from '../../src/lib/server/request-lifetime.js';

const fixture = (address: string | undefined = '127.0.0.1') => {
  const socket = Object.assign(new EventEmitter(), { remoteAddress: address as string | undefined });
  const req = Object.assign(new EventEmitter(), { socket });
  const res = Object.assign(new EventEmitter(), { end: () => { res.emit('finish'); return res; } });
  const originalEnd = res.end;
  const lifetime = createRequestLifetime(req as IncomingMessage, res as unknown as ServerResponse);
  return { socket, req, res, lifetime, originalEnd };
};

test('an abort before response finish cannot deliver a new lease', () => {
  const { socket, req, res, lifetime, originalEnd } = fixture();
  let released = 0;
  lifetime.onAborted(() => { released++; });
  socket.emit('close');
  res.end();
  expect(lifetime.signal.aborted).toBe(true);
  expect(released).toBe(1);
  expect(res.end).toBe(originalEnd);
  expect(req.listenerCount('aborted')).toBe(0);
  expect(socket.listenerCount('close')).toBe(0);
});

test('successful finish transfers ownership and later socket closure does not abort it', () => {
  const { socket, res, lifetime, originalEnd } = fixture();
  let released = 0;
  lifetime.onAborted(() => { released++; });
  res.end();
  socket.remoteAddress = undefined; socket.emit('close'); res.emit('close');
  expect(lifetime.signal.aborted).toBe(false);
  expect(released).toBe(0);
  expect(res.end).toBe(originalEnd);
  expect(res.listenerCount('close')).toBe(0);
});

test('native disconnect aborts streaming response and releases late registrations once', () => {
  const { socket, res, lifetime } = fixture();
  let released = 0;
  socket.emit('close');
  lifetime.onAborted(() => { released++; });
  res.emit('close');
  expect(lifetime.signal.aborted).toBe(true);
  expect(released).toBe(1);
  expect(res.listenerCount('finish')).toBe(0);
});

test('a complete request body does not abort its pending response', () => {
  const { req, res, lifetime } = fixture();
  req.emit('end'); req.emit('close');
  expect(lifetime.signal.aborted).toBe(false);
  res.end();
  expect(lifetime.signal.aborted).toBe(false);
});
